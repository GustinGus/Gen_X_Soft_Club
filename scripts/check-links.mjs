/*
 * CHECK LINKS — `npm run check:links` (after a build; `-- .next-public` for the public one).
 *
 * Reads the pages a build made and fails if a link could send a reader where
 * it should not. It does not trust how the links were written: it looks at
 * what was built.
 *
 *   A. the pages     every page of every language is there: the home, the
 *                    index and a file per record, and the 404.
 *   B. language      an internal link stays in the language of the page it is
 *                    on. Nothing leads from English to Portuguese or back,
 *                    except a link that says so (see "crossing", below).
 *   C. destinations  an internal link leads to a page that exists, and its
 *                    #fragment to a place that exists on that page. So does a
 *                    link to a place on its own page.
 *   D. the pair      a page says the same in every language: the same links
 *                    out of the site and the same places on the page.
 *
 * CROSSING LANGUAGES is allowed in two named cases only, and each must carry
 * `hreflang` with the language it leads to:
 *   - the 404, which stands outside both languages and offers each one's index;
 *   - a language switcher: a link marked `data-language-switch`, leading to
 *     the same page in the other language. (None exists yet.)
 *
 * Kept apart from the public build for now: nothing here is about what may be
 * published, only about where links lead.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, process.argv[2] ?? ".next");
const rel = (path) => relative(root, path).replaceAll("\\", "/");

const problems = [];
const fail = (check, message) => problems.push(`[${check}] ${message}`);

if (!existsSync(join(dist, "BUILD_ID"))) {
  console.error(`[links] ${rel(dist)} is not a finished build (no BUILD_ID). Build first: \`npm run build\`.`);
  process.exit(1);
}

// ---------------------------------------------------------------- what the site is, read from its source
const read = (file) => readFileSync(join(root, file), "utf8");
const locales = [...(read("src/i18n/locales.ts").match(/export const locales = \[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const htmlLang = Object.fromEntries([...(read("src/i18n/locales.ts").match(/export const htmlLang[^{]*\{([^}]*)\}/)?.[1] ?? "").matchAll(/"?([\w-]+)"?: "([^"]+)"/g)].map((m) => [m[1], m[2]]));
const slugs = [...read("src/content/music.ts").matchAll(/\{ number: \d+, slug: "([^"]+)"/g)].map((m) => m[1]);
if (locales.length === 0 || slugs.length === 0) {
  console.error("[links] the languages (src/i18n/locales.ts) or the records (src/content/music.ts) could not be read.");
  process.exit(1);
}
/** Where a language's pages live: English at the root, every other under its own segment (src/i18n/href.ts). */
const segment = (locale) => (locale === "en" ? "" : `/${locale}`);
const address = (locale, to) => (to === "/" ? segment(locale) || "/" : segment(locale) + to);
const localeOf = (path) => locales.find((l) => segment(l) !== "" && (path === segment(l) || path.startsWith(segment(l) + "/"))) ?? "en";
const english = (path) => { const s = segment(localeOf(path)); const to = s ? path.slice(s.length) : path; return to === "" ? "/" : to; };

// ---------------------------------------------------------------- A. the pages
const fileOf = (path) => join(dist, "server/app", path === "/" ? "index.html" : `${path.slice(1)}.html`);
const pages = new Map(); // address → { locale, html, ids }
const idsIn = (html) => new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]));
for (const locale of locales) {
  for (const to of ["/", "/music", ...slugs.map((slug) => `/music/${slug}`)]) {
    const path = address(locale, to);
    const file = fileOf(path);
    if (!existsSync(file)) { fail("pages", `${path} was not built (${rel(file)})`); continue; }
    const html = readFileSync(file, "utf8");
    pages.set(path, { locale, html, ids: idsIn(html) });
    const declared = html.match(/<html[^>]*\slang="([^"]*)"/)?.[1];
    if (declared !== htmlLang[locale]) fail("pages", `${path} declares lang="${declared ?? ""}", not "${htmlLang[locale]}"`);
  }
}
const NOT_FOUND = "the 404";
const notFoundFile = join(dist, "server/app/_not-found.html");
const notFound = existsSync(notFoundFile) ? readFileSync(notFoundFile, "utf8") : null;
if (notFound === null) fail("pages", `the 404 was not built (${rel(notFoundFile)})`);

// ---------------------------------------------------------------- the links of a page
const withoutScripts = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
// attribute names are not case-sensitive in HTML (React writes hrefLang)
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const linksOf = (html) =>
  [...withoutScripts(html).matchAll(/<a\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => attr(tag, "href") !== undefined)
    .map((tag) => ({ href: decode(attr(tag, "href")), hreflang: attr(tag, "hreflang"), switcher: /\sdata-language-switch(=|\s|>)/.test(tag) }));
const split = (href) => {
  const hash = href.indexOf("#");
  const beforeHash = hash < 0 ? href : href.slice(0, hash);
  const query = beforeHash.indexOf("?");
  return { path: query < 0 ? beforeHash : beforeHash.slice(0, query), fragment: hash < 0 ? null : href.slice(hash + 1) };
};
const kindOf = (href) => (href.startsWith("#") ? "place" : /^https?:\/\//.test(href) ? "outside" : href.startsWith("/") && !href.startsWith("//") ? "inside" : "other");

const counts = { inside: 0, place: 0, outside: 0, crossing: 0 };

/** B and C for one page. `from` is the page's address, or NOT_FOUND. */
function check(from, locale, html, ids) {
  for (const link of linksOf(html)) {
    const kind = kindOf(link.href);
    if (kind === "other") { fail("links", `${from}: href="${link.href}" is neither a page of the site, a place on the page, nor an http(s) address`); continue; }
    if (kind === "outside") { counts.outside++; continue; }
    if (kind === "place") {
      counts.place++;
      const id = link.href.slice(1);
      if (id === "" || !ids.has(id)) fail("destinations", `${from}: href="${link.href}" points to no place on the page`);
      continue;
    }
    counts.inside++;
    const { path, fragment } = split(link.href);
    const target = pages.get(path);
    if (!target) { fail("destinations", `${from}: href="${link.href}" leads to no page of the site`); continue; }
    if (fragment !== null && (fragment === "" || !target.ids.has(fragment))) fail("destinations", `${from}: href="${link.href}" — ${path} has no place "#${fragment}"`);

    const crosses = from === NOT_FOUND || target.locale !== locale;
    if (!crosses) continue;
    counts.crossing++;
    if (link.hreflang !== htmlLang[target.locale]) {
      fail("language", `${from}: href="${link.href}" leads into ${target.locale} without saying so (hreflang="${link.hreflang ?? ""}", expected "${htmlLang[target.locale]}")`);
    }
    if (from === NOT_FOUND) {
      // the 404 offers each language its index, and nothing else
      if (english(path) !== "/music") fail("language", `the 404: href="${link.href}" — the 404 may only link to each language's index`);
    } else if (!link.switcher) {
      fail("language", `${from} (${locale}): href="${link.href}" leads into ${target.locale}. Only a language switcher may (data-language-switch).`);
    } else if (english(path) !== english(from)) {
      fail("language", `${from}: the language switcher leads to ${path}, which is not the same page in ${target.locale}`);
    }
  }
}

for (const [path, page] of pages) check(path, page.locale, page.html, page.ids);
if (notFound !== null) {
  check(NOT_FOUND, null, notFound, idsIn(notFound));
  const offered = linksOf(notFound).filter((l) => kindOf(l.href) === "inside").map((l) => l.href).sort();
  const expected = locales.map((l) => address(l, "/music")).sort();
  if (JSON.stringify(offered) !== JSON.stringify(expected)) fail("language", `the 404 offers ${JSON.stringify(offered)}; expected each language's index, ${JSON.stringify(expected)}`);
}

// ---------------------------------------------------------------- D. the pair
const same = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
for (const [path, page] of pages) {
  if (page.locale === "en") continue;
  const original = pages.get(english(path));
  if (!original) continue;
  const of = (html, kind) => linksOf(html).filter((l) => kindOf(l.href) === kind && !l.switcher).map((l) => l.href);
  if (!same(of(page.html, "outside"), of(original.html, "outside"))) fail("pair", `${path} and ${english(path)} do not link to the same addresses outside the site`);
  if (!same(of(page.html, "place"), of(original.html, "place"))) fail("pair", `${path} and ${english(path)} do not link to the same places on the page`);
  const inside = (html) => of(html, "inside").map((href) => { const { path: p, fragment } = split(href); return english(p) + (fragment === null ? "" : "#" + fragment); });
  if (!same(inside(page.html), inside(original.html))) fail("pair", `${path} and ${english(path)} do not link to the same pages of the site`);
}

// ---------------------------------------------------------------- report
const expectedPages = locales.length * (2 + slugs.length);
console.log(`[links] ${rel(dist)}: ${pages.size} of ${expectedPages} pages (${locales.join(", ")}; ${slugs.length} records) + the 404`);
console.log(`[links] links read: ${counts.inside} to pages of the site, ${counts.place} to places on a page, ${counts.outside} out of the site | crossing languages, each saying so: ${counts.crossing}`);

if (problems.length > 0) {
  console.error(`\n[links] FAILED — ${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 40)) console.error("  " + problem);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("[links] OK — every internal link stays in its page's language and leads somewhere that exists.");
