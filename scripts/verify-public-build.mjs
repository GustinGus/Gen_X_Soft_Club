/*
 * VERIFY A PUBLIC BUILD — `npm run verify:public` (run by `npm run build:public`).
 *
 * Reads what was built and what would be published with it, and fails if any
 * trace of the private artwork is there. It does not trust the build: it looks.
 *
 *   A. public/        only files meant to be published (every file there ships).
 *   B. images         no image file anywhere in the build, by content, not by
 *                     name: the public edition draws its sleeves and has none.
 *                     One exception, named and weighed: the site's own
 *                     favicon, at the two places Next.js writes it (the
 *                     second being its media folder, static/media or, on
 *                     Vercel, static/immutable/media), and only as the very
 *                     file this inspection knows by its checksum.
 *                     Any other icon file, or that one changed, fails.
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
 *   I. search engines what the build tells them, against where it was built:
 *                     only a production deployment may be indexed, and it
 *                     must say where it lives (SITE_URL: a real public origin,
 *                     never guessed — and, being one of Vercel's, the one
 *                     Vercel itself names as the project's production
 *                     address, never a deployment's). Every page names itself
 *                     as canonical and the same page in each language, each
 *                     naming it back; the root is written with its slash;
 *                     the sitemap is exactly the pages built; robots.txt
 *                     opens the site only where it is indexed. No image is
 *                     offered to a search engine or a share card, anywhere.
 *                     The rules are src/site/seo.ts's; they are worked out
 *                     again here, from the environment, not taken from it.
 *   J. sensitive files nothing that belongs to a machine or an account and
 *                     not to a site: environment files, private keys and key
 *                     stores, credentials, the folders of tools that hold
 *                     them, leftovers of a working copy — by name, wherever
 *                     they are in the build (Vercel's copy and the cache
 *                     included) or in public/; and, in every file that may be
 *                     published, by what they contain: a private key, a
 *                     token of a known make, a file of NAME=value settings.
 *                     This looks for what such files look like. It cannot
 *                     know a secret it has never seen: a password written
 *                     into a sentence passes. What keeps secrets out is that
 *                     the site has none to build with.
 *
 * VERCEL'S COPY. On Vercel, `next build` ends by handing the finished build to
 * Vercel's adapter, which lays out under <dist>/output what will be deployed:
 * the static files as they are served, and beside each function a copy of
 * every prerendered page's document. That happens before this inspection
 * runs, so the copies are in what it reads — and they are read like the rest
 * (images, private texts, <img>). Three kinds of copy would otherwise be taken
 * for an image or a page nobody listed, and each is allowed as a copy and as
 * nothing else: byte for byte the file it is a copy of, which was inspected
 * in its own place; at a path of the one shape Vercel gives it; and no more
 * often than a copy is made (see OUTPUT, below). Anything else under output/
 * that is an image or an HTML document fails as it does anywhere.
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
import { createHash } from "node:crypto";
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
  // ICO / CUR: a reserved zero, the type, a count, then a directory whose first entry points inside the file.
  // It carries images (bitmaps or whole PNGs) under a header of its own, so it is none of the formats above.
  if (bytes.length >= 22 && bytes.readUInt16LE(0) === 0 && (bytes.readUInt16LE(2) === 1 || bytes.readUInt16LE(2) === 2)) {
    const count = bytes.readUInt16LE(4);
    const directory = 6 + 16 * count;
    if (count >= 1 && count <= 64 && bytes.length >= directory && bytes[9] === 0) {
      const size = bytes.readUInt32LE(14);
      const offset = bytes.readUInt32LE(18);
      if (size > 0 && offset >= directory && offset + size <= bytes.length) return "ICO";
    }
  }
  return null;
}

/*
  THE ONE IMAGE A PUBLIC BUILD MAY HOLD: the site's favicon — the archive's own
  mark (src/app/icon.svg, a drawing), set as an .ico for the browsers and
  services that ask for /favicon.ico. It is allowed as this file and no other:
  at the two paths Next.js builds it to — what /favicon.ico answers with, and
  the copy it keeps among the static files under a name of its own making —
  and with these exact bytes in both. A favicon that has been changed is a
  different image, and has to be looked at and named here again before it may
  be published.
*/
const FAVICON = {
  built: "server/app/favicon.ico.body",
  /**
   * The copy among the static files: favicon.<a name Next.js derives>.ico, in the media folder and nowhere else.
   * That folder is static/media in a build made here, and static/immutable/media in one made on Vercel, whose
   * adapter has Next.js keep the files that are named after their own contents apart (supportsImmutableAssets).
   * One folder or the other, never both: the count below allows a single copy.
   */
  copy: /^static\/(?:immutable\/)?media\/favicon\.[a-z0-9_-]+\.ico$/,
  source: "src/app/favicon.ico",
  sha256: "114d5accf30af124f1076ce322af881048aedec3525450bee80ecc36247283a3",
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
let faviconBuilt = false;
let faviconCopies = 0;

/*
  VERCEL'S COPY OF THE BUILD (<dist>/output — see the note at the top). What is
  allowed there beyond what is allowed anywhere, each as an exact copy:

    the favicon     under a name it has in the build itself (favicon.ico,
                    favicon.ico.body, favicon.<name>.ico), with the very bytes
                    this inspection knows — at most as many times as Vercel
                    was seen to copy it;
    a page's copy   output/functions/<route>.prerender-fallback.html, where
                    server/app/<route>.html is a page of the edition or one of
                    the documents Next.js makes itself, and the two are the
                    same bytes — one copy per document;
    the error pages output/static/404.html and output/static/500.html, the
                    same bytes as server/pages/404.html and 500.html.

  A copy is vouched for by what it copies: that file is inspected where it was
  built, and a copy that differs from it by one byte is not a copy.
*/
const OUTPUT = {
  favicon: /^output\/(?:.*\/)?favicon\.(?:ico|ico\.body|[a-z0-9_-]+\.ico)$/,
  /** Vercel was seen to keep three: the static copy, /favicon.ico, and one more. */
  mostFavicons: 3,
  fallback: /^output\/functions\/(.+)\.prerender-fallback\.html$/,
  errorPages: new Map([
    ["output/static/404.html", "server/pages/404.html"],
    ["output/static/500.html", "server/pages/500.html"],
  ]),
};
let faviconOutput = 0;

/*
  J. SENSITIVE FILES. What a public build must never hold, whatever it says:
  told by its name, or by what is in it. The names are those such files are
  given by the tools that write them — never a name a build may rightly use
  (a config.json or a manifest is neither here nor there). Each rule says what
  it found, so that a file wrongly taken for one can be argued with.
*/
const SENSITIVE_NAMES = [
  [/^\.env(\..+)?$|\.env$|^\.envrc$/i, "an environment file"],
  [/\.(pem|key|p8|p12|pfx|jks|keystore|ppk|kdbx|gpg|pgp|asc)$/i, "a private key, a certificate with its key, or a key store"],
  [/^(id_(rsa|dsa|ecdsa|ed25519)|authorized_keys|known_hosts)$/i, "an SSH key file"],
  [/^(\.npmrc|\.yarnrc|\.yarnrc\.yml|\.netrc|_netrc|\.pypirc|\.htpasswd|\.pgpass|\.git-credentials|\.dockercfg|\.boto|kubeconfig)$/i, "a credentials file"],
  [/^(credentials|credentials\.(json|ya?ml|toml|ini|csv)|secrets?\.(json|ya?ml|toml|ini|env|txt)|service[-_]?account.*\.json|auth\.json|\.htaccess)$/i, "a credentials or sign-in file"],
  [/\.(tfstate|tfvars)(\.backup)?$/i, "infrastructure state, which holds secrets"],
  [/\.(sqlite3?|db|sql|bak|orig|swp|swo)$|^(\.ds_store|thumbs\.db|npm-debug\.log.*|yarn-error\.log)$/i, "a local or leftover file"],
];
/** Folders of tools that keep an account's or a machine's settings: nothing under one is part of a site. */
const SENSITIVE_FOLDERS = /^(\.git|\.ssh|\.aws|\.gnupg|\.vercel|\.docker|\.kube|\.azure|\.gcloud|\.idea|\.vscode)$/i;
const SENSITIVE_CONTENTS = [
  // the header and at least a line of the key itself: the bare words, as a library spells them, are not a key
  [/-----BEGIN (?:(?:RSA|EC|DSA|OPENSSH|ENCRYPTED|PGP) )?PRIVATE KEY(?: BLOCK)?-----(?:\\[rn]|[\sA-Za-z0-9+/=:,.-]){64,}/, "a private key"],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/, "a GitHub token"],
  [/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/, "an AWS access key"],
  [/\bxox[baprs]-[0-9A-Za-z-]{10,}/, "a Slack token"],
  [/\b[sr]k_live_[0-9A-Za-z]{20,}/, "a Stripe live key"],
  [/\bsk-(?:ant|proj)-[A-Za-z0-9_-]{20,}/, "an AI provider's key"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "a Google API key"],
  [/\bnpm_[A-Za-z0-9]{36}\b/, "an npm token"],
  [/_authToken\s*=\s*\S{8,}/, "a registry sign-in token"],
  [/\bmachine\s+\S+\s+login\s+\S+\s+password\s+\S+/, "a .netrc sign-in"],
  [/"type"\s*:\s*"service_account"/, "a service account's credentials"],
];
/** A small text file that is mostly NAME=value lines: an environment file under any name. */
function settingsFile(bytes) {
  if (bytes.length === 0 || bytes.length > 65536 || bytes.includes(0)) return false;
  const lines = bytes.toString("latin1").split(/\r?\n/).map((line) => line.trim()).filter((line) => line !== "" && !line.startsWith("#"));
  if (lines.length < 2 || lines.length > 400) return false;
  return lines.filter((line) => /^(?:export\s+)?[A-Z][A-Z0-9_]{2,}\s*=\s*\S/.test(line) && !/[;{(]\s*$/.test(line)).length / lines.length >= 0.8;
}
/** What a file's place and name say it is, if it is one of these; `within` is its path inside the folder read. */
function sensitiveName(within) {
  const parts = within.split("/");
  const folder = parts.slice(0, -1).find((part) => SENSITIVE_FOLDERS.test(part));
  if (folder) return `is under ${folder}/, a tool's own folder`;
  const named = SENSITIVE_NAMES.find(([name]) => name.test(parts.at(-1)));
  return named ? `is ${named[1]}, by its name` : null;
}
/** What a file's bytes say it holds, if they hold one of these. */
function sensitiveContents(bytes) {
  const text = bytes.toString("latin1");
  const found = SENSITIVE_CONTENTS.filter(([shape]) => shape.test(text)).map(([, what]) => what);
  if (settingsFile(bytes)) found.push("NAME=value settings, as an environment file does");
  return found.length > 0 ? `holds ${found.join(", ")}` : null;
}
let sensitiveRead = 0;
for (const file of publishedFiles) {
  const named = sensitiveName(file);
  if (named) fail("sensitive files", `public/${file} ${named}`);
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
  const within = rel(path).slice(rel(dist).length + 1);
  if (within === FAVICON.built || FAVICON.copy.test(within)) {
    // a favicon's place: what is there must be the favicon, whole and unchanged — whatever its bytes look like
    if (within === FAVICON.built) faviconBuilt = true;
    else faviconCopies += 1;
    const sum = sha256(bytes);
    if (sum !== FAVICON.sha256) fail("images", `${rel(path)} is not the favicon this inspection knows (${kind ? `a ${kind} image` : "not an icon file"}, sha256 ${sum.slice(0, 16)}…, ${bytes.length} bytes): a changed favicon is a new image, to be reviewed and named in scripts/verify-public-build.mjs before it is published`);
  } else if (OUTPUT.favicon.test(within)) {
    // Vercel's copy of the favicon: the favicon, whole and unchanged, or it is not a copy
    faviconOutput += 1;
    const sum = sha256(bytes);
    if (sum !== FAVICON.sha256) fail("images", `${rel(path)} has the favicon's name in Vercel's copy of the build but is not the favicon this inspection knows (${kind ? `a ${kind} image` : "not an icon file"}, sha256 ${sum.slice(0, 16)}…, ${bytes.length} bytes)`);
  } else if (kind) {
    fail("images", `${rel(path)} is a ${kind} image (${bytes.length} bytes)${kind === "ICO" ? `: the only icon file a public build may hold is the favicon, at ${FAVICON.built} and as favicon.<name>.ico in static/media or static/immutable/media` : ""}`);
  }
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} carries ${found.length} private text(s): ${quoted(found)}`);
  sensitiveRead += 1;
  for (const said of [sensitiveName(within), sensitiveContents(bytes)]) if (said) fail("sensitive files", `${rel(path)} ${said}`);
}

// The favicon's source is weighed too: what will be built next is what was reviewed.
{
  const source = join(root, FAVICON.source);
  if (existsSync(source)) {
    const sum = sha256(bytesOf(source, "images") ?? Buffer.alloc(0));
    if (sum !== FAVICON.sha256) fail("images", `${FAVICON.source} is not the favicon this inspection knows (sha256 ${sum.slice(0, 16)}…)`);
    if (!faviconBuilt) fail("images", `${FAVICON.source} exists but ${rel(join(dist, FAVICON.built))} was not built: the build is not laid out as this inspection knows it`);
  } else if (faviconBuilt || faviconCopies > 0) {
    fail("images", `a favicon was built, but ${FAVICON.source} is not in the project`);
  }
  if (faviconCopies > 1) fail("images", `${faviconCopies} copies of the favicon among the static files: one is expected`);
  if (faviconOutput > OUTPUT.mostFavicons) fail("images", `${faviconOutput} copies of the favicon in Vercel's copy of the build (${rel(join(dist, "output"))}): at most ${OUTPUT.mostFavicons} are expected`);
  if (faviconOutput > 0 && !faviconBuilt) fail("images", `Vercel's copy of the build holds the favicon, but ${rel(join(dist, FAVICON.built))} was not built: there is nothing it is a copy of`);
}

// The cache is not published, and is read for the private texts all the same (see the note at the top).
let scannedCache = 0;
for (const path of cached) {
  const bytes = bytesOf(path, "build");
  if (bytes === null) continue;
  scannedCache += bytes.length;
  const found = privateTexts(bytes);
  if (found.length > 0) fail("private data", `${rel(path)} (build cache) carries ${found.length} private text(s): ${quoted(found)}`);
  // by its name only: the cache is a compiler's store, not published, and its bytes are not text to be read as such
  const named = sensitiveName(rel(path).slice(rel(dist).length + 1));
  if (named) fail("sensitive files", `${rel(path)} (build cache) ${named}`);
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
/** The same bytes: a copy is that, or it is another document. */
const sameBytes = (a, b) => {
  const [x, y] = [bytesOf(join(dist, a), "edition"), bytesOf(join(dist, b), "edition")];
  return x !== null && y !== null && x.equals(y);
};
/** Vercel's copies (see OUTPUT): how many were found of each document. */
const copied = new Map();
function vercelCopyOf(document) {
  const fallback = document.match(OUTPUT.fallback);
  const original = fallback ? `server/app/${fallback[1]}.html` : OUTPUT.errorPages.get(document);
  if (!original) return null;
  if (!known.has(original) && !INTERNAL.has(original)) return { problem: `is Vercel's copy of ${original}, which is not a page of any language nor one of the documents Next.js makes itself` };
  if (!documents.includes(original)) return { problem: `is Vercel's copy of ${original}, which was not built` };
  if (!sameBytes(document, original)) return { problem: `is not the copy of ${original} it stands for: the two differ` };
  copied.set(original, (copied.get(original) ?? 0) + 1);
  if (copied.get(original) > 1) return { problem: `is a second copy of ${original} in Vercel's copy of the build: one is expected` };
  return { original };
}
for (const document of documents) {
  if (known.has(document)) continue;
  const check = INTERNAL.get(document);
  if (check) {
    const wrong = check(read(join(dist, document)) ?? "");
    if (wrong) fail("edition", `${rel(dist)}/${document} ${wrong}`);
    continue;
  }
  const copy = vercelCopyOf(document);
  if (copy === null) fail("edition", `${rel(dist)}/${document} is a page nobody listed: not a page of any language, nor one of the documents Next.js makes itself`);
  else if (copy.problem) fail("edition", `${rel(dist)}/${document} ${copy.problem}`);
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

// ---------------------------------------------------------------- I. search engines
/*
  WHAT THE BUILD TELLS SEARCH ENGINES, AND WHETHER IT MAY. Worked out here from
  the same environment the build had (this runs right after it), on its own:

    production   VERCEL=1 and VERCEL_ENV=production. Indexed; SITE_URL must be
                 the site's public origin; SITE_URL_TEST must not be set.
    preview      any other public build. Never indexed.

  WHERE THE SITE LIVES is never taken on its own word. It is published at the
  address Vercel gives the project for production, a *.vercel.app name — and
  every deployment, branch and other project has a *.vercel.app name too. So
  SITE_URL must be the address Vercel states for this project
  (VERCEL_PROJECT_PRODUCTION_URL), and never this deployment's or its branch's
  (VERCEL_URL, VERCEL_BRANCH_URL). Where Vercel says nothing, a *.vercel.app
  address is refused, and so is any production build.

  Then every page is read for what it actually says.
*/
const seo = { stage: process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production" ? "production" : "preview", origin: null, canonicals: 0, alternates: 0, sitemap: 0 };
{
  const NOT_PUBLIC = /^(localhost|.*\.localhost|.*\.local|.*\.test|.*\.example|.*\.invalid|example\.(com|org|net)|.*\.example\.(com|org|net))$/i;
  const VERCEL_APP = /\.vercel\.app$/i;
  const production = seo.stage === "production";
  /** A host as Vercel names it in its system variables, or null where Vercel says nothing. */
  const hostOf = (value) => value?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || null;
  const vercel = { production: hostOf(process.env.VERCEL_PROJECT_PRODUCTION_URL), deployment: hostOf(process.env.VERCEL_URL), branch: hostOf(process.env.VERCEL_BRANCH_URL) };
  /** An origin and nothing more, or why not. `mustBePublic`: https, a real name, not a placeholder or a deployment's own address. */
  const originOf = (value, name, mustBePublic) => {
    let url;
    try {
      url = new URL(value);
    } catch {
      return { problem: `${name}="${value}" is not an address` };
    }
    if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) return { problem: `${name}="${value}" is more than an origin` };
    if (!mustBePublic) return /^https?:$/.test(url.protocol) ? { origin: url.origin } : { problem: `${name}="${value}" is neither http nor https` };
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return { problem: `${name}="${value}" is not https` };
    if (!host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":") || NOT_PUBLIC.test(host)) return { problem: `${name}="${value}" is this machine or a placeholder, not the site's own address` };
    if (host === vercel.deployment || host === vercel.branch) return { problem: `${name}="${value}" is the temporary address of this deployment or of its branch, not the project's production address` };
    if (vercel.production) {
      if (host !== vercel.production) return { problem: `${name}="${value}", but Vercel names "${vercel.production}" as this project's production address` };
    } else if (VERCEL_APP.test(host)) {
      return { problem: `${name}="${value}" is a *.vercel.app name that nothing here confirms as this project's (VERCEL_PROJECT_PRODUCTION_URL is not set)` };
    } else if (production) {
      return { problem: `${name}="${value}" is not confirmed: a production build needs Vercel to name the project's production address (VERCEL_PROJECT_PRODUCTION_URL is not set)` };
    }
    return { origin: url.origin };
  };
  const given = process.env.SITE_URL?.trim();
  const test = process.env.SITE_URL_TEST?.trim();
  if (production && test) fail("search engines", "SITE_URL_TEST is set in a production build: a test origin is never a production address");
  if (production && !given) fail("search engines", "SITE_URL is not set: a production build must say where the site lives, and no address is assumed");
  if (given) {
    const found = originOf(given, "SITE_URL", true);
    if (found.problem) fail("search engines", found.problem);
    else seo.origin = found.origin;
  } else if (test && !production) {
    const found = originOf(test, "SITE_URL_TEST", false);
    if (found.problem) fail("search engines", found.problem);
    else seo.origin = found.origin;
  }

  /** The languages that are published; a build holding any other has already failed (G). */
  const released = locales.filter((locale) => localization[locale] === "complete");
  const unreleased = locales.filter((locale) => !released.includes(locale));
  /** An address is compared as it is written. The site's root is written one way everywhere: with its slash. */
  const same = (url) => url;
  const urlOf = (path) => seo.origin + path;
  /** A page's address as English names it: "/pt-br/music/x" → "/music/x". */
  const english = (path, locale) => (path === address(locale, "/") ? "/" : path.slice(segment(locale).length));
  const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
  const attrOf = (tag, name) => {
    const found = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
    return found === undefined ? undefined : decode(found);
  };
  const tagsOf = (html, name) => [...html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((match) => match[0]);
  const RASTER = /\.(png|jpe?g|gif|webp|avif|heic|bmp|tiff?)(\?|#|$)/i;
  const wantedRobots = production ? "index, follow" : "noindex, nofollow";
  const asText = (list) => list.map(([lang, url]) => `${lang}=${url}`).sort().join(" ");

  /** What a page says of itself. */
  const said = new Map();
  for (const [path, page] of expected) {
    const html = pageText.get(path);
    if (html === undefined) continue; // not built: reported under D
    const metas = tagsOf(html, "meta");
    const headLinks = tagsOf(html, "link");
    const meta = (key) => metas.filter((tag) => attrOf(tag, "name") === key || attrOf(tag, "property") === key).map((tag) => attrOf(tag, "content") ?? "");
    const canonical = headLinks.filter((tag) => attrOf(tag, "rel") === "canonical").map((tag) => same(attrOf(tag, "href")));
    const versions = headLinks.filter((tag) => attrOf(tag, "rel") === "alternate" && attrOf(tag, "hreflang") !== undefined).map((tag) => [attrOf(tag, "hreflang"), same(attrOf(tag, "href"))]);
    said.set(path, { page, canonical: canonical[0] ?? null, versions });

    // 1. may it be indexed
    const robots = meta("robots");
    if (robots.length !== 1 || robots[0] !== wantedRobots) fail("search engines", `${path} says robots="${robots.join(" | ")}"; a ${seo.stage} build must say "${wantedRobots}"`);

    // 2. its own address, absolute and right
    const isReleased = released.includes(page.locale);
    const wantedCanonical = seo.origin && isReleased ? urlOf(path) : null;
    if (canonical.length > 1) fail("search engines", `${path} names ${canonical.length} canonical addresses`);
    if ((canonical[0] ?? null) !== wantedCanonical) {
      fail("search engines", `${path} names "${canonical[0] ?? "nothing"}" as its canonical address; expected ${wantedCanonical ? `"${wantedCanonical}"` : "none (the site's origin is not known, or its language is not released)"}`);
    }
    if (canonical[0]) seo.canonicals += 1;

    // 3. the same page in each released language, and the one for everyone else
    const to = english(path, page.locale);
    const wantedVersions = seo.origin && isReleased && released.length > 1 ? [...released.map((locale) => [htmlLang[locale], urlOf(address(locale, to))]), ["x-default", urlOf(address(ORIGINAL, to))]] : [];
    if (asText(versions) !== asText(wantedVersions)) fail("search engines", `${path} names these versions of itself: ${asText(versions) || "none"}; expected ${asText(wantedVersions) || "none"}`);
    seo.alternates += versions.length;
    for (const [lang, url] of versions) {
      for (const locale of unreleased) {
        if (lang === htmlLang[locale] || (seo.origin && (url === seo.origin + segment(locale) || url.startsWith(seo.origin + segment(locale) + "/")))) fail("search engines", `${path} names a version in ${locale}, which is not released`);
      }
    }

    // 4. the card: text, the page's own address, its language — and no image
    const og = (key) => meta(`og:${key}`);
    if ((og("url")[0] ? same(og("url")[0]) : null) !== wantedCanonical) fail("search engines", `${path} gives og:url "${og("url")[0] ?? "nothing"}"; expected ${wantedCanonical ? `"${wantedCanonical}"` : "none"}`);
    if (!og("title")[0] || !og("description")[0] || og("type")[0] !== "website") fail("search engines", `${path} has no whole Open Graph card (title, description, type)`);
    if (meta("twitter:card")[0] !== "summary") fail("search engines", `${path} has no text-only Twitter card (twitter:card="${meta("twitter:card")[0] ?? ""}")`);
    for (const tag of metas) {
      const key = attrOf(tag, "property") ?? attrOf(tag, "name") ?? "";
      const content = attrOf(tag, "content") ?? "";
      if (/image/i.test(key) || RASTER.test(content) || content.includes("covers/")) fail("search engines", `${path} offers an image or a cover to whoever reads its head: ${tag.slice(0, 160)}`);
    }
    for (const tag of headLinks) {
      const linked = attrOf(tag, "href") ?? "";
      if (RASTER.test(linked) || linked.includes("covers/") || /image_src|apple-touch-icon/i.test(attrOf(tag, "rel") ?? "")) fail("search engines", `${path} links an image or a cover from its head: ${tag.slice(0, 160)}`);
    }
  }

  // 5. each version names the page back
  const byCanonical = new Map([...said].filter(([, page]) => page.canonical).map(([path, page]) => [page.canonical, path]));
  for (const [path, { page, canonical, versions }] of said) {
    for (const [lang, url] of versions) {
      const other = byCanonical.get(url);
      if (!other) {
        fail("search engines", `${path} names ${url} (${lang}) as a version of itself, and no page built has that address as its own`);
        continue;
      }
      if (lang === "x-default") continue;
      const back = said.get(other).versions.find(([otherLang]) => otherLang === htmlLang[page.locale])?.[1];
      if (back !== canonical) fail("search engines", `${path} names ${other} as its ${lang} version, but ${other} names "${back ?? "nothing"}" as its ${htmlLang[page.locale]} version, not ${canonical}`);
    }
  }

  // 6. the 404 is never indexed
  const notFoundRobots = tagsOf(read(join(dist, NOT_FOUND)) ?? "", "meta").filter((tag) => attrOf(tag, "name") === "robots").map((tag) => attrOf(tag, "content") ?? "");
  if (!notFoundRobots.some((content) => /\bnoindex\b/.test(content))) fail("search engines", "the 404 does not say noindex");

  // 7. the sitemap: exactly the pages of the released languages, at the site's origin
  const sitemap = read(join(app, "sitemap.xml.body"));
  if (sitemap === null) fail("search engines", `${rel(join(app, "sitemap.xml.body"))} was not built`);
  else {
    const listed = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => same(decode(match[1].trim())));
    const wanted = seo.origin ? [...expected].filter(([, page]) => released.includes(page.locale)).map(([path]) => urlOf(path)) : [];
    const extra = listed.filter((url) => !wanted.includes(url));
    const missing = wanted.filter((url) => !listed.includes(url));
    const twice = new Set(listed).size !== listed.length;
    if (extra.length || missing.length || twice) {
      fail("search engines", `the sitemap is not the ${wanted.length} page(s) of the released languages${extra.length ? `; not among them: ${extra.slice(0, 4).join(", ")}` : ""}${missing.length ? `; missing: ${missing.slice(0, 4).join(", ")}` : ""}${twice ? "; an address is listed twice" : ""}`);
    }
    const stray = [...sitemap.matchAll(/<xhtml:link\b[^>]*>/g)].map((match) => same(attrOf(match[0], "href"))).filter((url) => !wanted.includes(url));
    if (stray.length) fail("search engines", `the sitemap names ${stray.length} version(s) that are not pages of the released languages: ${stray.slice(0, 4).join(", ")}`);
    if (/<image:|covers\//.test(sitemap) || RASTER.test(sitemap.replace(/<[^>]+>/g, " "))) fail("search engines", "the sitemap lists an image or a cover");
    // whole: as many entries opened as closed, each with its one address
    const opened = (sitemap.match(/<url>/g) ?? []).length;
    const closed = (sitemap.match(/<\/url>/g) ?? []).length;
    if (opened !== closed || opened !== listed.length || !/<\/urlset>\s*$/.test(sitemap)) fail("search engines", `the sitemap is not whole: ${opened} entries opened, ${closed} closed, ${listed.length} address(es)`);
    if (production && listed.length === 0) fail("search engines", "the sitemap of a production build is empty");
    seo.sitemap = listed.length;
  }

  // 8. robots.txt: open, with the sitemap, only where the site is indexed
  const robotsFile = read(join(app, "robots.txt.body"));
  if (robotsFile === null) fail("search engines", `${rel(join(app, "robots.txt.body"))} was not built`);
  else {
    const lines = robotsFile.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const has = (pattern) => lines.some((line) => pattern.test(line));
    const closed = has(/^disallow:\s*\/\s*$/i);
    const open = has(/^allow:\s*\/\s*$/i);
    const sitemapLine = lines.find((line) => /^sitemap:/i.test(line))?.replace(/^sitemap:\s*/i, "");
    if (production) {
      if (closed || !open) fail("search engines", "robots.txt of a production build does not open the site");
      if (sitemapLine !== `${seo.origin}/sitemap.xml`) fail("search engines", `robots.txt names "${sitemapLine ?? "no sitemap"}"; expected "${seo.origin}/sitemap.xml"`);
    } else {
      if (!closed || open) fail("search engines", `robots.txt of a ${seo.stage} build does not close the site ("Disallow: /" and nothing allowed)`);
      if (sitemapLine !== undefined) fail("search engines", `robots.txt of a ${seo.stage} build names a sitemap: nothing is offered where nothing is indexed`);
    }
    if (/covers/i.test(robotsFile)) fail("search engines", "robots.txt speaks of the covers folder");
  }
}

// ---------------------------------------------------------------- report
const mb = (bytes) => (bytes / 1e6).toFixed(1);
console.log(`[verify] ${rel(dist)}: ${built.length} files, ${mb(scanned)} MB read | build cache (not published): ${cached.length} files, ${mb(scannedCache)} MB read for private texts`);
console.log(`[verify] public/: ${publishedFiles.length} file(s), ${allowed.length} allowed | private texts looked for: ${forbidden.length} | shared with the archive's own text, not looked for: ${shared.length}`);
console.log(`[verify] sensitive files: ${sensitiveRead} file(s) read for ${SENSITIVE_CONTENTS.length + 1} kinds of content, ${built.length + cached.length + publishedFiles.length} name(s) against ${SENSITIVE_NAMES.length} kinds of file and ${SENSITIVE_FOLDERS.source.split("|").length} tools' folders`);
if (linksFollowed > 0) console.log(`[verify] links followed, each staying in the folder it was found in: ${linksFollowed}`);
console.log(`[verify] records: ${slugs.length} | pages: ${pageText.size} of ${expected.size} (${locales.map((locale) => `${locale} ${pagesByLocale[locale]}`).join(", ")}) + the 404 | other documents, each named and checked: ${documents.filter((document) => INTERNAL.has(document) && document !== NOT_FOUND).length}`);
const copies = [...copied.values()].reduce((sum, n) => sum + n, 0);
if (copies > 0 || faviconOutput > 0) console.log(`[verify] Vercel's copy of the build (${rel(join(dist, "output"))}): ${copies} document(s), each the same bytes as the one it copies | the favicon, by its checksum: ${faviconOutput} time(s)`);
console.log(`[verify] languages: ${locales.map((locale) => `${locale} ${published[locale]}`).join(", ")} | links: ${links.status === 0 ? linkLines.find((line) => line.includes("links read"))?.replace("[links] ", "") ?? "checked" : "FAILED"}`);
console.log(`[verify] search engines: a ${seo.stage} build, ${seo.stage === "production" ? "indexed" : "not indexed"} | origin: ${seo.origin ?? "not given"} | canonical addresses: ${seo.canonicals} | versions named: ${seo.alternates} | sitemap: ${seo.sitemap} page(s)`);

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
      favicon: faviconBuilt ? { path: FAVICON.built, copies: faviconCopies, sha256: FAVICON.sha256 } : null,
      vercelCopy: copies > 0 || faviconOutput > 0 ? { documents: copies, favicons: faviconOutput } : null,
      searchEngines: { stage: seo.stage, indexed: seo.stage === "production", origin: seo.origin, canonicals: seo.canonicals, sitemap: seo.sitemap },
      privateTextsLookedFor: forbidden.length,
      sensitiveFiles: { read: sensitiveRead, found: 0 },
      publicFiles: publishedFiles,
    },
    null,
    2,
  ) + "\n",
);
console.log(`[verify] OK — ${faviconBuilt ? "no image but the site's own favicon (the one file, by its checksum)" : "no image"}, no private artwork data, no sensitive file, ${slugs.length} sleeves, every language whole: nothing private or unfinished in what would be published.`);
console.log(`[verify] recorded in ${rel(join(dist, STAMP))} for build ${buildId}`);
