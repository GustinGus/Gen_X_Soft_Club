/*
 * VERIFY A PUBLIC BUILD — `npm run verify:public` (run by `npm run build:public`).
 *
 * Reads what was built and what would be published with it, and fails if any
 * trace of the private artwork is there. It does not trust the build: it looks.
 *
 *   A. public/        only files meant to be published (every file there ships).
 *   B. images         no image file anywhere in the build, by content, not by
 *                     name: the public edition draws its sleeves and has none.
 *   C. private data   nothing from the private blocks of content/music.ts —
 *                     paths, sources, editions, captions — in any built file.
 *   D. the edition    every record's page, the index and the home are there
 *                     and show the archive's sleeves; none asks for an image.
 *
 * The build's own cache (<dist>/cache) is not part of what is published. It
 * is read all the same for the private texts, and no optimised image may be
 * kept in it. A cache is a binary store: finding no private text in it does
 * not prove it holds none in some other encoding, which is why it is never
 * published either.
 *
 * When everything holds, a record of the inspection is left in the build
 * (public-edition-verified.json), tied to its BUILD_ID. It is a record, not a
 * safeguard: the safeguard is running this.
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, process.argv[2] ?? ".next-public");
const rel = (path) => relative(root, path).replaceAll("\\", "/");
const STAMP = "public-edition-verified.json";

const problems = [];
const fail = (check, message) => problems.push(`[${check}] ${message}`);

function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

if (!existsSync(join(dist, "BUILD_ID"))) {
  console.error(`[verify] ${rel(dist)} is not a finished build (no BUILD_ID). Run \`npm run build:public\`.`);
  process.exit(1);
}
const buildId = readFileSync(join(dist, "BUILD_ID"), "utf8").trim();
// An earlier record says nothing about the build as it is now.
rmSync(join(dist, STAMP), { force: true });

// ---------------------------------------------------------------- A. public/
/** Files under public/ that are meant to be published: the same list next.config.ts reads (public-files.json). */
function publicFilesAllowed() {
  try {
    const { files } = JSON.parse(readFileSync(join(root, "public-files.json"), "utf8"));
    if (Array.isArray(files) && files.every((file) => typeof file === "string")) return files;
  } catch {
    // reported just below
  }
  fail("public/", 'public-files.json is missing or does not hold { "files": [ … ] }: what may be published cannot be told');
  return [];
}

const allowed = publicFilesAllowed();
const published = filesUnder(join(root, "public")).map((path) => relative(join(root, "public"), path).replaceAll("\\", "/"));
const unexpected = published.filter((file) => !allowed.includes(file));
if (unexpected.length > 0) fail("public/", `${unexpected.length} file(s) would be published that are not meant to be: ${unexpected.slice(0, 12).join(", ")}`);

// ---------------------------------------------------------------- B. images
/** Raster image formats, recognised by their first bytes. */
function imageKind(bytes) {
  const at = (offset, text) => bytes.subarray(offset, offset + text.length).toString("latin1") === text;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "JPEG";
  if (at(0, "\x89PNG\r\n\x1a\n")) return "PNG";
  if (at(0, "GIF87a") || at(0, "GIF89a")) return "GIF";
  if (at(0, "RIFF") && at(8, "WEBP")) return "WebP";
  if (at(4, "ftyp") && /avif|avis|heic|heix|mif1/.test(bytes.subarray(8, 32).toString("latin1"))) return "AVIF/HEIF";
  if (at(0, "BM") && bytes.length > 26 && bytes.readUInt32LE(2) === bytes.length) return "BMP";
  if (at(0, "II*\0") || at(0, "MM\0*")) return "TIFF";
  return null;
}

const cache = join(dist, "cache") + sep;
const everything = filesUnder(dist);
const built = everything.filter((path) => !path.startsWith(cache));
const cached = everything.filter((path) => path.startsWith(cache));
const kept = filesUnder(join(dist, "cache", "images"));
if (kept.length > 0) fail("images", `${kept.length} optimised image(s) are kept in ${rel(join(dist, "cache", "images"))}`);

// ---------------------------------------------------------------- C. private data
const source = readFileSync(join(root, "src/content/music.ts"), "utf8");
const BLOCK = /\/\/ <private:([a-z-]+)>([\s\S]*?)\/\/ <\/private:\1>/g;
const blocks = [...source.matchAll(BLOCK)];
if (blocks.length === 0 || !blocks.some((block) => block[1] === "reference-artwork")) {
  fail("private data", "src/content/music.ts no longer marks its private blocks (// <private:…>): what must stay out of a public build cannot be told");
}

/** Everything else the project says: a word the private blocks share with it cannot tell a leak from the archive's own text. */
const elsewhere =
  source.replace(BLOCK, "") +
  filesUnder(join(root, "src"))
    .filter((path) => /\.(ts|tsx|css)$/.test(path) && !path.endsWith(join("content", "music.ts")))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

const literals = new Set();
for (const block of blocks) for (const match of block[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)) literals.add(match[1]);
const shared = [...literals].filter((text) => text.length < 6 || elsewhere.includes(text));
const forbidden = [...literals].filter((text) => !shared.includes(text));
// Said in full, whatever the blocks hold: the folder, and the caption only a reference copy prints.
for (const always of ["covers/reference", "Reference copy", "reference copy kept"]) if (!forbidden.includes(always)) forbidden.push(always);

/** A text as a bundle may spell it: as written, or with what is not ASCII escaped. */
const spellings = (text) => [...new Set([text, text.replace(/[^\x20-\x7e]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"))])];
const needles = forbidden.flatMap((text) => spellings(text).map((spelling) => ({ text, bytes: Buffer.from(spelling, "utf8") })));
const privateTexts = (bytes) => [...new Set(needles.filter((needle) => bytes.includes(needle.bytes)).map((needle) => needle.text))];
const quoted = (found) => `${found.slice(0, 4).map((text) => JSON.stringify(text)).join(", ")}${found.length > 4 ? ", …" : ""}`;

let scanned = 0;
for (const path of built) {
  const bytes = readFileSync(path);
  scanned += bytes.length;
  const kind = imageKind(bytes);
  if (kind) fail("images", `${rel(path)} is a ${kind} image (${statSync(path).size} bytes)`);
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} carries ${found.length} private text(s): ${quoted(found)}`);
}

// The cache is not published, and is read for the private texts all the same (see the note at the top).
let scannedCache = 0;
for (const path of cached) {
  const bytes = readFileSync(path);
  scannedCache += bytes.length;
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} (build cache) carries ${found.length} private text(s): ${quoted(found)}`);
}

// ---------------------------------------------------------------- D. the edition
const slugs = [...source.matchAll(/\{ number: \d+, slug: "([^"]+)"/g)].map((match) => match[1]);
const page = (name) => join(dist, "server/app", name);
const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);
const sleeves = (html) => (html.match(/data-sleeve="public"/g) ?? []).length;

if (slugs.length === 0) fail("edition", "no records found in src/content/music.ts");
for (const slug of slugs) {
  const html = read(page(`music/${slug}.html`));
  if (html === null) fail("edition", `the page of ${slug} was not built`);
  else if (sleeves(html) < 1) fail("edition", `the page of ${slug} does not show the archive's sleeve`);
}
const index = read(page("music.html"));
if (index === null) fail("edition", "the index (/music) was not built");
else if (sleeves(index) !== slugs.length) fail("edition", `the index shows ${sleeves(index)} sleeve(s) for ${slugs.length} records`);
const home = read(page("index.html"));
if (home === null) fail("edition", "the home (/) was not built");

for (const path of built.filter((file) => /\.(html|rsc)$/.test(file))) {
  const text = readFileSync(path, "utf8");
  if (text.includes("/_next/image")) fail("edition", `${rel(path)} asks the image optimiser for a file`);
  if (/<img\b/.test(text)) fail("edition", `${rel(path)} contains an <img>`);
}

// ---------------------------------------------------------------- report
const mb = (bytes) => (bytes / 1e6).toFixed(1);
console.log(`[verify] ${rel(dist)}: ${built.length} files, ${mb(scanned)} MB read | build cache (not published): ${cached.length} files, ${mb(scannedCache)} MB read for private texts`);
console.log(`[verify] public/: ${published.length} file(s), ${allowed.length} allowed | private texts looked for: ${forbidden.length} | shared with the archive's own text, not looked for: ${shared.length}`);
console.log(`[verify] records: ${slugs.length} | pages with the archive's sleeve: ${slugs.filter((slug) => sleeves(read(page(`music/${slug}.html`)) ?? "") > 0).length}`);

if (problems.length > 0) {
  console.error(`\n[verify] FAILED — ${problems.length} problem(s). This build must not be published:`);
  for (const problem of problems.slice(0, 40)) console.error("  " + problem);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  process.exit(1);
}

writeFileSync(
  join(dist, STAMP),
  JSON.stringify(
    {
      about: "Record of an inspection by scripts/verify-public-build.mjs. A record only: it does not make a build safe, and a build changed since is not the build it describes.",
      buildId,
      verifiedAt: new Date().toISOString(),
      files: built.length,
      bytes: scanned,
      cacheFiles: cached.length,
      records: slugs.length,
      privateTextsLookedFor: forbidden.length,
      publicFiles: published,
    },
    null,
    2,
  ) + "\n",
);
console.log(`[verify] OK — no image, no private artwork data, ${slugs.length} sleeves: nothing private in what would be published.`);
console.log(`[verify] recorded in ${rel(join(dist, STAMP))} for build ${buildId}`);
