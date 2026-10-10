import { locales, type Locale } from "./locales";

/*
  WHERE A LINK LEADS, IN A LANGUAGE.

  The site's pages are written once, as English addresses them — "/",
  "/music", "/music/<slug>" — and every internal link is built here from one
  of those and the page's language. English lives at the root; every other
  language under its own segment. Nothing else in the project writes an
  internal address (eslint.config.mjs holds that line), so a page in one
  language cannot send its reader to another by accident.

  A link within the page ("#manifesto") is the same in every language and
  passes through unchanged. Addresses outside the site are not this module's
  business.
*/

/** A page of the site, as English addresses it. */
export type SitePath = "/" | "/music" | `/music/${string}`;

/** A place within a page. */
export type Fragment = `#${string}`;

/** What an internal link may point to: a page, a place on a page, or a place on this one. */
export type SiteHref = SitePath | `${SitePath}${Fragment}` | Fragment;

/** The segment each language's pages live under. English, the original, has none. */
const SEGMENT: Record<Locale, string> = {
  en: "",
  "pt-br": "/pt-br",
};

const split = (to: string): [path: string, rest: string] => {
  const at = to.search(/[?#]/);
  return at < 0 ? [to, ""] : [to.slice(0, at), to.slice(at)];
};

/** The address of a page of the site in a language: href("pt-br", "/music#soft-future") → "/pt-br/music#soft-future". */
export function href(locale: Locale, to: SiteHref): string {
  if (to.startsWith("#")) return to;
  if (!to.startsWith("/") || to.startsWith("//")) throw new Error(`"${to}" is not a page of the site.`);
  const [path, rest] = split(to);
  const segment = SEGMENT[locale];
  // the home of a language is its segment itself, without a trailing slash
  return (path === "/" ? segment || "/" : segment + path) + rest;
}

/** The language an address of the site is in, and the page it names as English addresses it. */
export function parseHref(address: string): { locale: Locale; to: string } {
  if (!address.startsWith("/") || address.startsWith("//")) throw new Error(`"${address}" is not an address of the site.`);
  const [path, rest] = split(address);
  for (const locale of locales) {
    const segment = SEGMENT[locale];
    if (segment === "") continue;
    if (path === segment || path === segment + "/") return { locale, to: "/" + rest };
    if (path.startsWith(segment + "/")) return { locale, to: path.slice(segment.length) + rest };
  }
  return { locale: "en", to: address };
}

/**
 * The same page in another language: where a reader of this address lands if
 * they change language. The record, the place on the page and any query stay.
 * alternateHref("/music/portishead-dummy#credits", "pt-br") → "/pt-br/music/portishead-dummy#credits"
 */
export function alternateHref(address: string, locale: Locale): string {
  return href(locale, parseHref(address).to as SiteHref);
}
