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
 *                     Nor may any of it have been copied into a dictionary
 *                     (src/i18n), where it would pass for the archive's own.
 *   D. the edition    the pages of every language, and nothing else: the
 *                     home, the index and a file per record, each declaring
 *                     its language and showing the archive's sleeves; none
 *                     asks for an image. No other page — bar the documents
 *                     Next.js makes itself, each named here and checked.
 *   E. the 404        the one page for every unknown address: English, with
 *                     what it says in Portuguese marked as such, a way back
 *                     into each language, and no image.
 *   F. the archive    closed: a record's address outside the twelve is not
 *                     made on demand, in any language.
 *   G. languages      a language is published whole or not at all. Each must
 *                     be marked complete, be written out (not standing in for
 *                     another), and hold every text the original holds, in
 *                     the same shape. This does not judge a translation: that
 *                     is a reader's work, done before a language is marked.
 *   H. links          every internal link stays in its page's language and
 *                     leads somewhere (scripts/check-links.mjs, run here).
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
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, process.argv[2] ?? ".next-public");
const rel = (path) => relative(root, path).replaceAll("\\", "/");
const STAMP = "public-edition-verified.json";

const problems = [];
const fail = (check, message) => problems.push(`[${check}] ${message}`);

/** More entries than any build of this site holds: past this, the folder is not what it is taken for. */
const MOST_ENTRIES = 200_000;
let linksFollowed = 0;

/**
 * Every file under a folder, as the paths they are found at.
 *
 * Each entry is taken for what it is once links are followed, never for what
 * its directory entry says: a link to a folder is a folder (read as a file it
 * stops the inspection — EISDIR). Links are followed only while they stay in
 * the folder being read. One that leads out of it, or to nothing, is a
 * problem: what it points to was not built here, and what cannot be read
 * cannot be vouched for. A link back to a folder it sits in is followed once.
 * Whatever is wrong is reported with its path, under `check`.
 */
function filesUnder(dir, check) {
  if (!existsSync(dir)) return [];
  let home;
  try {
    home = realpathSync(dir);
  } catch (error) {
    fail(check, `${rel(dir)} cannot be resolved (${error.code})`);
    return [];
  }
  const within = (real) => real === home || real.startsWith(home + sep);
  const files = [];
  let entries = 0;

  const walk = (current, above) => {
    let listing;
    try {
      listing = readdirSync(current, { withFileTypes: true });
    } catch (error) {
      fail(check, `${rel(current)} cannot be listed (${error.code})`);
      return;
    }
    for (const entry of listing) {
      const path = join(current, entry.name);
      if (++entries > MOST_ENTRIES) {
        if (entries === MOST_ENTRIES + 1) fail(check, `${rel(dir)} holds more than ${MOST_ENTRIES} entries (at ${rel(path)}): not read to the end`);
        return;
      }
      let real, stat;
      try {
        real = realpathSync(path);
        stat = statSync(path);
      } catch (error) {
        fail(check, `${rel(path)} cannot be read (${error.code}): a link to nothing, or one that never ends?`);
        continue;
      }
      if (!within(real)) {
        fail(check, `${rel(path)} is a link out of ${rel(dir)}, to ${real}: what it points to is not part of what was inspected`);
        continue;
      }
      if (entry.isSymbolicLink()) linksFollowed += 1;
      if (stat.isDirectory()) {
        // already being read, further up: a loop
        if (!above.includes(real)) walk(path, [...above, real]);
      } else if (stat.isFile()) {
        files.push(path);
      } else {
        fail(check, `${rel(path)} is neither a file nor a folder`);
      }
    }
  };
  walk(dir, [home]);
  return files;
}

/** A file's bytes, or null with the problem reported: a file that cannot be read cannot be vouched for. */
function bytesOf(path, check) {
  try {
    return readFileSync(path);
  } catch (error) {
    fail(check, `${rel(path)} cannot be read (${error.code})`);
    return null;
  }
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
const publishedFiles = filesUnder(join(root, "public"), "public/").map((path) => relative(join(root, "public"), path).replaceAll("\\", "/"));
const unexpected = publishedFiles.filter((file) => !allowed.includes(file));
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
const everything = filesUnder(dist, "build");
const built = everything.filter((path) => !path.startsWith(cache));
const cached = everything.filter((path) => path.startsWith(cache));
const kept = filesUnder(join(dist, "cache", "images"), "images");
if (kept.length > 0) fail("images", `${kept.length} optimised image(s) are kept in ${rel(join(dist, "cache", "images"))}`);

// ---------------------------------------------------------------- C. private data
const source = readFileSync(join(root, "src/content/music.ts"), "utf8");
const BLOCK = /\/\/ <private:([a-z-]+)>([\s\S]*?)\/\/ <\/private:\1>/g;
const blocks = [...source.matchAll(BLOCK)];
if (blocks.length === 0 || !blocks.some((block) => block[1] === "reference-artwork")) {
  fail("private data", "src/content/music.ts no longer marks its private blocks (// <private:…>): what must stay out of a public build cannot be told");
}

/*
  Everything else the project says: a word the private blocks share with it
  cannot tell a leak from the archive's own text. The dictionaries (src/i18n)
  are read apart and do not count as "elsewhere": what a language says is
  published, so a private text found only there has been copied out of its
  block — it is not the archive's own for being in a dictionary.
*/
const I18N = join(root, "src", "i18n") + sep;
const sources = filesUnder(join(root, "src"), "source")
  .filter((path) => /\.(ts|tsx|css)$/.test(path) && !path.endsWith(join("content", "music.ts")))
  .map((path) => ({ path, text: bytesOf(path, "source")?.toString("utf8") ?? "" }));
const elsewhere = source.replace(BLOCK, "") + sources.filter((file) => !file.path.startsWith(I18N)).map((file) => file.text).join("\n");
const dictionaries = sources.filter((file) => file.path.startsWith(I18N));

const literals = new Set();
for (const block of blocks) for (const match of block[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)) literals.add(match[1]);
const shared = [...literals].filter((text) => text.length < 6 || elsewhere.includes(text));
const forbidden = [...literals].filter((text) => !shared.includes(text));
for (const file of dictionaries) {
  const copied = [...forbidden, "covers/reference", "Reference copy", "reference copy kept"].filter((text, i, all) => all.indexOf(text) === i && file.text.includes(text));
  if (copied.length > 0) {
    fail("private data", `${rel(file.path)} holds ${copied.length} text(s) of the private blocks: ${copied.slice(0, 4).map((text) => JSON.stringify(text)).join(", ")}. A dictionary is published; private wording stays in its block, in src/content/music.ts.`);
  }
}
// Said in full, whatever the blocks hold: the folder, and the caption only a reference copy prints.
for (const always of ["covers/reference", "Reference copy", "reference copy kept"]) if (!forbidden.includes(always)) forbidden.push(always);

/** A text as a bundle may spell it: as written, or with what is not ASCII escaped. */
const spellings = (text) => [...new Set([text, text.replace(/[^\x20-\x7e]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"))])];
const needles = forbidden.flatMap((text) => spellings(text).map((spelling) => ({ text, bytes: Buffer.from(spelling, "utf8") })));
const privateTexts = (bytes) => [...new Set(needles.filter((needle) => bytes.includes(needle.bytes)).map((needle) => needle.text))];
const quoted = (found) => `${found.slice(0, 4).map((text) => JSON.stringify(text)).join(", ")}${found.length > 4 ? ", …" : ""}`;

let scanned = 0;
for (const path of built) {
  const bytes = bytesOf(path, "build");
  if (bytes === null) continue;
  scanned += bytes.length;
  const kind = imageKind(bytes);
  if (kind) fail("images", `${rel(path)} is a ${kind} image (${bytes.length} bytes)`);
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} carries ${found.length} private text(s): ${quoted(found)}`);
}

// The cache is not published, and is read for the private texts all the same (see the note at the top).
let scannedCache = 0;
for (const path of cached) {
  const bytes = bytesOf(path, "build");
  if (bytes === null) continue;
  scannedCache += bytes.length;
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} (build cache) carries ${found.length} private text(s): ${quoted(found)}`);
}

// ---------------------------------------------------------------- what the site is, read from its source
const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : null);
const localesSource = read(join(root, "src/i18n/locales.ts")) ?? "";
const table = (name) => Object.fromEntries([...(localesSource.match(new RegExp(`export const ${name}\\b[^{]*\\{([^}]*)\\}`))?.[1] ?? "").matchAll(/"?([\w-]+)"?:\s*"([^"]*)"/g)].map((match) => [match[1], match[2]]));
const locales = [...(localesSource.match(/export const locales = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const htmlLang = table("htmlLang");
const localization = table("localization");
/** The language every other is measured against, and the one the 404's document is in. */
const ORIGINAL = "en";
if (locales.length === 0 || !locales.includes(ORIGINAL) || locales.some((locale) => !htmlLang[locale])) {
  fail("languages", "src/i18n/locales.ts no longer says which languages the site has, or what each declares: what must be built cannot be told");
}
/** Where a language's pages live: the original at the root, every other under its own segment (src/i18n/href.ts). */
const segment = (locale) => (locale === ORIGINAL ? "" : `/${locale}`);
const address = (locale, to) => (to === "/" ? segment(locale) || "/" : segment(locale) + to);

const records = [...source.matchAll(/\{ number: \d+, slug: "([^"]+)"[^}]*?frequency: "([^"]+)"/g)].map((match) => ({ slug: match[1], frequency: match[2] }));
const slugs = records.map((record) => record.slug);
if (slugs.length === 0) fail("edition", "no records found in src/content/music.ts");
/** The home shows the records of its own file, AFTER HOURS, each in its case. */
const onTheHome = records.filter((record) => record.frequency === "after-hours").length;

// ---------------------------------------------------------------- D. the edition
const app = join(dist, "server", "app");
const htmlOf = (to) => join(app, to === "/" ? "index.html" : `${to.slice(1)}.html`);
const sleeves = (html) => (html.match(/data-sleeve="public"/g) ?? []).length;
const langOf = (html) => html.match(/<html[^>]*\slang="([^"]*)"/)?.[1];

/** Every page the site has: address → what must be true of it. */
const expected = new Map();
for (const locale of locales) {
  expected.set(address(locale, "/"), { locale, what: "the home", sleeves: (n) => n === onTheHome, wanted: `${onTheHome}` });
  expected.set(address(locale, "/music"), { locale, what: "the index", sleeves: (n) => n === slugs.length, wanted: `${slugs.length}` });
  for (const slug of slugs) expected.set(address(locale, `/music/${slug}`), { locale, what: `the file of ${slug}`, sleeves: (n) => n >= 1, wanted: "at least 1" });
}
const pagesByLocale = Object.fromEntries(locales.map((locale) => [locale, 0]));
const pageText = new Map();
for (const [path, page] of expected) {
  const html = read(htmlOf(path));
  if (html === null) { fail("edition", `${path} (${page.what}, ${page.locale}) was not built`); continue; }
  pagesByLocale[page.locale] += 1;
  pageText.set(path, html);
  if (langOf(html) !== htmlLang[page.locale]) fail("edition", `${path} declares lang="${langOf(html) ?? ""}", not "${htmlLang[page.locale]}"`);
  if (!page.sleeves(sleeves(html))) fail("edition", `${path} (${page.what}) shows ${sleeves(html)} of the archive's sleeves; expected ${page.wanted}`);
}

/*
  NO OTHER PAGE. Every HTML document in the build is one of the pages above, or
  one of the few Next.js makes on its own account — each named here, with what
  must be true of it. A document that is neither is a page nobody decided to
  publish: a language, a route or a file that this inspection knows nothing of.
*/
const NOT_FOUND = "server/app/_not-found.html";
const errorDocument = (html) => (/<html[^>]*\sid="__next_error__"/.test(html) && !/<a\b[^>]*\shref="\//.test(html) && sleeves(html) === 0 ? null : "is not the bare error document Next.js makes");
const INTERNAL = new Map([
  // the 404: checked in full below (E)
  [NOT_FOUND, () => null],
  // the same 404, as Next.js also writes it for its older router: must be that very document
  ["server/pages/404.html", (html) => (html === read(join(dist, NOT_FOUND)) ? null : "is not the 404 (server/app/_not-found.html) byte for byte")],
  // what a reader sees if rendering itself fails: Next.js's own document, with nothing of the site in it
  ["server/app/_global-error.html", errorDocument],
  ["server/pages/500.html", errorDocument],
]);
const known = new Set([...expected.keys()].map((path) => rel(htmlOf(path)).slice(rel(dist).length + 1)));
const documents = built.filter((path) => path.endsWith(".html")).map((path) => rel(path).slice(rel(dist).length + 1));
for (const document of documents) {
  if (known.has(document)) continue;
  const check = INTERNAL.get(document);
  if (!check) { fail("edition", `${rel(dist)}/${document} is a page nobody listed: not a page of any language, nor one of the documents Next.js makes itself`); continue; }
  const wrong = check(read(join(dist, document)) ?? "");
  if (wrong) fail("edition", `${rel(dist)}/${document} ${wrong}`);
}
for (const document of INTERNAL.keys()) if (!documents.includes(document)) fail("edition", `${rel(dist)}/${document} was expected and is not there: the build is not laid out as this inspection knows it`);

for (const path of built.filter((file) => /\.(html|rsc)$/.test(file))) {
  const text = bytesOf(path, "edition")?.toString("utf8");
  if (text === undefined) continue;
  if (text.includes("/_next/image")) fail("edition", `${rel(path)} asks the image optimiser for a file`);
  if (/<img\b/.test(text)) fail("edition", `${rel(path)} contains an <img>`);
}

// ---------------------------------------------------------------- E. the 404
{
  const html = read(join(dist, NOT_FOUND));
  if (html === null) fail("404", "the 404 was not built");
  else {
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    if (langOf(body) !== htmlLang[ORIGINAL]) fail("404", `the 404 declares lang="${langOf(body) ?? ""}", not "${htmlLang[ORIGINAL]}"`);
    if (!/<body[^>]*>[\s\S]*<main\b[\s\S]*<h1\b/.test(body)) fail("404", "the 404 is not a whole document: it has no <main> with a heading in what the server sends");
    for (const locale of locales) {
      // each language has its part, marked as that language, and in it the way back to that language's index
      const part = body.match(new RegExp(`<section\\b[^>]*\\slang="${htmlLang[locale]}"[^>]*>([\\s\\S]*?)</section>`))?.[1];
      if (part === undefined) { fail("404", `the 404 says nothing marked lang="${htmlLang[locale]}"`); continue; }
      if (part.replace(/<[^>]+>/g, "").trim().length < 20) fail("404", `the 404's part in ${locale} says next to nothing`);
      const link = part.match(/<a\b[^>]*>/g)?.find((tag) => new RegExp(`\\shref="${address(locale, "/music")}"`).test(tag));
      if (!link) fail("404", `the 404's part in ${locale} does not lead to ${address(locale, "/music")}`);
      else if (!new RegExp(`\\shreflang="${htmlLang[locale]}"`, "i").test(link)) fail("404", `the 404's link to ${address(locale, "/music")} does not say which language it leads to`);
    }
    if (sleeves(body) > 0 || /<canvas\b/.test(body)) fail("404", "the 404 carries a sleeve or a canvas: it is to load nothing of the archive's objects");
  }
}

// ---------------------------------------------------------------- F. the archive is closed
{
  let manifest = null;
  try {
    manifest = JSON.parse(read(join(dist, "prerender-manifest.json")) ?? "null");
  } catch {
    // reported just below
  }
  if (!manifest?.dynamicRoutes || !manifest?.routes) fail("archive", "prerender-manifest.json is missing or not as this inspection knows it: whether a record's address can be made on demand cannot be told");
  else {
    const wanted = locales.map((locale) => address(locale, "/music/[slug]"));
    for (const route of wanted) {
      const made = manifest.dynamicRoutes[route];
      if (!made) fail("archive", `${route} is not among the build's record routes`);
      else if (made.fallback !== false) fail("archive", `${route} can be made on demand (fallback: ${JSON.stringify(made.fallback)}): a record's address outside the ${slugs.length} must not exist`);
    }
    for (const route of Object.keys(manifest.dynamicRoutes)) if (!wanted.includes(route)) fail("archive", `${route} is a route made from its address that nobody listed`);
    const made = Object.keys(manifest.routes).filter((route) => /\/music\/[^/]+$/.test(route)).sort();
    const listed = locales.flatMap((locale) => slugs.map((slug) => address(locale, `/music/${slug}`))).sort();
    if (JSON.stringify(made) !== JSON.stringify(listed)) {
      const extra = made.filter((route) => !listed.includes(route)), missing = listed.filter((route) => !made.includes(route));
      fail("archive", `the record pages built are not the ${listed.length} of the catalogue${extra.length ? `; not in it: ${extra.slice(0, 6).join(", ")}` : ""}${missing.length ? `; missing: ${missing.slice(0, 6).join(", ")}` : ""}`);
    }
  }
}

// ---------------------------------------------------------------- G. languages
/*
  A LANGUAGE IS PUBLISHED WHOLE OR NOT AT ALL. Three things, each on its own:
  it is marked complete; its texts are written out, not standing in for
  another language's; and it holds every text the original holds, in the same
  shape. None of this says a translation is good — names, codes and what is
  the same in every language may well read alike — only that it is there.
  Whether it is right is a reader's judgement, made before a language is marked.
*/
const published = Object.fromEntries(locales.map((locale) => [locale, localization[locale] ?? "not said"]));
for (const locale of locales) {
  if (localization[locale] !== "complete") {
    fail("languages", `${locale} is "${localization[locale] ?? "not said"}" (src/i18n/locales.ts), not complete: its ${pagesByLocale[locale]} page(s) are in this build and must not be published`);
  }
}

const TEXTS = [
  { kind: "the interface dictionary", dir: "src/i18n/dictionaries" },
  { kind: "the record texts", dir: "src/i18n/records" },
];
let loadTexts = null;
try {
  const ts = createRequire(import.meta.url)("typescript");
  const scratch = mkdtempSync(join(tmpdir(), "genx-verify-"));
  process.on("exit", () => rmSync(scratch, { recursive: true, force: true }));
  const load = createRequire(join(scratch, "index.cjs"));
  /** A dictionary module's one exported object, read from its source (transpiled apart, with its own folder's imports). */
  loadTexts = (dir, locale) => {
    const out = join(scratch, dir.replaceAll("/", "_"));
    for (const name of readdirSync(join(root, dir)).filter((file) => file.endsWith(".ts"))) {
      const js = ts.transpileModule(readFileSync(join(root, dir, name), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
      writeFileSync(join(out + "__" + name.replace(/\.ts$/, ".cjs")), js.replace(/require\("\.\/([\w-]+)"\)/g, (_, other) => `require("./${out.split(sep).pop()}__${other}.cjs")`));
    }
    const exported = Object.values(load(out + "__" + locale + ".cjs")).filter((value) => value && typeof value === "object");
    return exported.length === 1 ? exported[0] : null;
  };
} catch (error) {
  fail("languages", `the dictionaries could not be read (${error.message}): whether each language holds every text cannot be told`);
}

const marksOf = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",");
/** Where a language's texts do not have the original's shape: a text missing, added, empty, or a sentence's {marks} changed. */
function gaps(original, texts, at, found = []) {
  if (found.length >= 12) return found;
  if (typeof original === "string") {
    if (typeof texts !== "string") found.push(`${at} is not a text`);
    else if (original.trim() !== "" && texts.trim() === "") found.push(`${at} is empty`);
    else if (marksOf(original) !== marksOf(texts)) found.push(`${at} takes {${marksOf(texts)}} where the original takes {${marksOf(original)}}`);
  } else if (Array.isArray(original)) {
    if (!Array.isArray(texts)) found.push(`${at} is not a list`);
    else if (texts.length !== original.length) found.push(`${at} has ${texts.length} item(s) where the original has ${original.length}`);
    else original.forEach((item, i) => gaps(item, texts[i], `${at}[${i}]`, found));
  } else if (original && typeof original === "object") {
    if (!texts || typeof texts !== "object" || Array.isArray(texts)) found.push(`${at} is not a group of texts`);
    else {
      for (const key of Object.keys(original)) {
        if (key in texts) gaps(original[key], texts[key], `${at}.${key}`, found);
        else found.push(`${at}.${key} is missing`);
      }
      for (const key of Object.keys(texts)) if (!(key in original)) found.push(`${at}.${key} is not in the original`);
    }
  }
  return found;
}

for (const locale of locales.filter((other) => other !== ORIGINAL)) {
  for (const { kind, dir } of TEXTS) {
    const file = `${dir}/${locale}.ts`;
    const text = read(join(root, file));
    if (text === null) { fail("languages", `${locale}: ${kind} (${file}) does not exist`); continue; }
    // standing in: the module takes another language's texts instead of holding its own
    const borrowed = [...text.matchAll(/^\s*import\s+(?!type\b)[^;]*?from\s+["']\.\/([\w-]+)["']/gm)].map((match) => match[1]).filter((other) => locales.includes(other));
    if (borrowed.length > 0) { fail("languages", `${locale}: ${kind} (${file}) stands in for ${borrowed.join(", ")} — it imports that language's texts instead of being written`); continue; }
    if (!loadTexts) continue;
    let original, texts;
    try {
      original = loadTexts(dir, ORIGINAL);
      texts = loadTexts(dir, locale);
    } catch (error) {
      fail("languages", `${locale}: ${kind} (${file}) could not be read: ${error.message}`);
      continue;
    }
    if (!original || !texts) { fail("languages", `${locale}: ${kind} (${file}) does not export its texts as one object, as the original does`); continue; }
    if (texts === original) { fail("languages", `${locale}: ${kind} (${file}) is the original's own object, not a text of its own`); continue; }
    const found = gaps(original, texts, locale);
    if (found.length > 0) fail("languages", `${locale}: ${kind} (${file}) does not hold what the original holds — ${found.slice(0, 6).join("; ")}${found.length > 6 ? "; …" : ""}`);
  }
}

// ---------------------------------------------------------------- H. links
const links = spawnSync(process.execPath, [join(root, "scripts/check-links.mjs"), rel(dist)], { cwd: root, encoding: "utf8" });
const linkLines = `${links.stdout ?? ""}${links.stderr ?? ""}`.split(/\r?\n/).filter((line) => line.trim() !== "");
if (links.status !== 0) {
  const said = linkLines.filter((line) => /^\s+\[/.test(line)).map((line) => line.trim());
  fail("links", `scripts/check-links.mjs failed${said.length ? ": " + said.slice(0, 4).join(" | ") + (said.length > 4 ? ` | … and ${said.length - 4} more` : "") : ` (exit ${links.status})`}`);
}

// ---------------------------------------------------------------- report
const mb = (bytes) => (bytes / 1e6).toFixed(1);
console.log(`[verify] ${rel(dist)}: ${built.length} files, ${mb(scanned)} MB read | build cache (not published): ${cached.length} files, ${mb(scannedCache)} MB read for private texts`);
console.log(`[verify] public/: ${publishedFiles.length} file(s), ${allowed.length} allowed | private texts looked for: ${forbidden.length} | shared with the archive's own text, not looked for: ${shared.length}`);
if (linksFollowed > 0) console.log(`[verify] links followed, each staying in the folder it was found in: ${linksFollowed}`);
console.log(`[verify] records: ${slugs.length} | pages: ${pageText.size} of ${expected.size} (${locales.map((locale) => `${locale} ${pagesByLocale[locale]}`).join(", ")}) + the 404 | other documents, each named and checked: ${documents.filter((document) => !known.has(document) && document !== NOT_FOUND).length}`);
console.log(`[verify] languages: ${locales.map((locale) => `${locale} ${published[locale]}`).join(", ")} | links: ${links.status === 0 ? linkLines.find((line) => line.includes("links read"))?.replace("[links] ", "") ?? "checked" : "FAILED"}`);

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
      languages: published,
      pages: pageText.size,
      linksChecked: true,
      privateTextsLookedFor: forbidden.length,
      publicFiles: publishedFiles,
    },
    null,
    2,
  ) + "\n",
);
console.log(`[verify] OK — no image, no private artwork data, ${slugs.length} sleeves, every language whole: nothing private or unfinished in what would be published.`);
console.log(`[verify] recorded in ${rel(join(dist, STAMP))} for build ${buildId}`);
