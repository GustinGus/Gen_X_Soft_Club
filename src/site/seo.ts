import type { Metadata, MetadataRoute } from "next";
import { hero } from "@/content/home";
import { records } from "@/content/music";
import { href, type SitePath } from "@/i18n/href";
import { htmlLang, locales, localization, type Locale } from "@/i18n/locales";

/*
  WHAT THE SITE TELLS SEARCH ENGINES — decided once, here.

  Three things are settled by where the site is being built, and nothing in a
  page decides them for itself:

    whether it may be indexed    only a production deployment of the public
                                 edition. Everything else — this machine, a
                                 preview — says "noindex, nofollow".
    where it lives               SITE_URL: the one public origin every absolute
                                 address is made from. There is no default,
                                 and none is guessed: not localhost, not the
                                 address of one deployment — and an address
                                 of Vercel's only when Vercel confirms it is
                                 this project's (see below).
    which languages it has       the released ones ("complete" in
                                 i18n/locales.ts). A language still being
                                 written is never named as a version of a
                                 page, and its own pages name nothing.

  THE STAGES
    private      not the public edition (NEXT_PUBLIC_EDITION, which follows
                 from PUBLIC_BUILD alone). Never indexed.
    preview      the public edition, anywhere but a production deployment.
                 Never indexed. NODE_ENV says nothing here: a preview is built
                 in production mode too.
    production   the public edition, built by Vercel for its production
                 environment (VERCEL=1 and VERCEL_ENV=production). Indexed —
                 and it does not build without a SITE_URL that Vercel
                 confirms as the project's production address.

  SITE_URL_TEST is for trying this out: an origin (localhost will do) used
  only where the site is not indexed. A production build refuses to start
  with it set, so a test address cannot become a canonical one.

  scripts/verify-public-build.mjs reads the same environment on its own and
  checks what was built against it: it does not take this module's word.
*/

export type Stage = "private" | "preview" | "production";

const isPublicEdition = process.env.NEXT_PUBLIC_EDITION === "public";
const onVercelProduction = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

export const stage: Stage = !isPublicEdition ? "private" : onVercelProduction ? "production" : "preview";

/** Only a production deployment of the public edition is offered to search engines. */
export const indexable = stage === "production";

/** Names that are nobody's public address: this machine, a test, an example. */
const NOT_PUBLIC = /^(localhost|.*\.localhost|.*\.local|.*\.test|.*\.example|.*\.invalid|example\.(com|org|net)|.*\.example\.(com|org|net))$/i;

/** An address Vercel hands out itself: the project's production one, and one for every deployment and branch. */
const VERCEL_APP = /\.vercel\.app$/i;

/** A host as Vercel names it in its system variables (no scheme), or null where Vercel says nothing. */
const hostOf = (value: string | undefined) => value?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase() || null;

/*
  WHAT VERCEL SAYS OF THIS BUILD. The site is published at the address Vercel
  gives the project for production — a *.vercel.app name. Any other
  *.vercel.app name is some deployment's or some other project's, so the name
  is never taken on its own word:

    VERCEL_PROJECT_PRODUCTION_URL   the project's production address, as
                                    Vercel states it in every build it runs.
                                    SITE_URL must be that address.
    VERCEL_URL, VERCEL_BRANCH_URL   this deployment's own address and its
                                    branch's: temporary, never canonical.

  SITE_URL is still set by hand: Vercel's statement confirms the address, it
  does not choose it. Where Vercel says nothing (off Vercel), a *.vercel.app
  address cannot be confirmed and is refused; and a production build is
  refused altogether without that confirmation.
*/
const vercel = {
  production: hostOf(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  deployment: hostOf(process.env.VERCEL_URL),
  branch: hostOf(process.env.VERCEL_BRANCH_URL),
};

/** An origin as it is written into addresses: scheme and host, nothing after. */
function originOf(value: string, name: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not an address: "${value}". Give the site's origin, as in https://name.tld`);
  }
  if (url.pathname !== "/" || url.search !== "" || url.hash !== "" || url.username !== "" || url.password !== "") {
    throw new Error(`${name} must be an origin and nothing more (scheme and host): "${value}".`);
  }
  return url;
}

/**
 * A public origin: https, a real name, not a placeholder — and, where it is
 * one of Vercel's, the very address Vercel names as this project's production
 * one, never a deployment's or a branch's.
 */
function publicOrigin(value: string): string {
  const url = originOf(value, "SITE_URL");
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:") throw new Error(`SITE_URL must be https: "${value}".`);
  if (!host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":") || NOT_PUBLIC.test(host)) {
    throw new Error(`SITE_URL must be the site's own public address; "${host}" is this machine or a placeholder. No address is assumed for the site: set the one it is published at.`);
  }
  if (host === vercel.deployment || host === vercel.branch) {
    throw new Error(`SITE_URL is "${host}", the temporary address of this deployment or of its branch. A canonical address is the project's production address, which does not change from one deployment to the next.`);
  }
  if (vercel.production) {
    if (host !== vercel.production) {
      throw new Error(`SITE_URL is "${host}", but Vercel names "${vercel.production}" as this project's production address (VERCEL_PROJECT_PRODUCTION_URL). The site's address is not assumed: set SITE_URL to the address the project is really published at.`);
    }
  } else if (VERCEL_APP.test(host) || stage === "production") {
    throw new Error(
      `SITE_URL is "${host}", and nothing here confirms it is this project's: Vercel did not name the project's production address (VERCEL_PROJECT_PRODUCTION_URL is not set). ${
        VERCEL_APP.test(host) ? "A *.vercel.app name belongs to whichever project or deployment Vercel gave it to, so it is accepted only when Vercel itself names it." : "A production build is not made without that confirmation."
      }`,
    );
  }
  return url.origin;
}

function readOrigin(): string | null {
  const given = process.env.SITE_URL?.trim();
  const test = process.env.SITE_URL_TEST?.trim();
  if (stage === "production") {
    if (test) throw new Error("SITE_URL_TEST is set in a production build. A test origin is never a production address: unset it.");
    if (!given) throw new Error("SITE_URL is not set. A production build of the public edition needs the site's public origin (https://name.tld) for its canonical addresses; none is assumed.");
    return publicOrigin(given);
  }
  if (given) return publicOrigin(given);
  if (test) {
    const url = originOf(test, "SITE_URL_TEST");
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`SITE_URL_TEST must be http or https: "${test}".`);
    return url.origin;
  }
  return null;
}

/** Where the site lives, or null where nobody said (then no absolute address is written at all). */
export const origin = readOrigin();

/** The languages that are published: only these are named as versions of a page, here and in the sitemap. */
export const released: readonly Locale[] = locales.filter((locale) => localization[locale] === "complete");

/** The language an address is given in when none is asked for: the original. */
const DEFAULT_LOCALE: Locale = "en";

/** The site's name on a card: the archive's own name, as its title sets it. Not translated. */
const SITE_NAME = hero.titleLines.join(" ");

/** A language as Open Graph names it. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", "pt-br": "pt_BR" };

/** Every page of the site, as English addresses it. */
export const sitePaths = (): SitePath[] => ["/", "/music", ...records.map((record) => `/music/${record.slug}` as SitePath)];

/** The absolute address of a page in a language, or null where the site's origin is not known. */
export const absolute = (locale: Locale, to: SitePath): string | null => (origin ? origin + href(locale, to) : null);

/** The same page in each released language, by the language each declares; and the one given to everyone else. */
function versions(to: SitePath): Record<string, string> | undefined {
  if (!origin || released.length < 2) return undefined;
  const languages: Record<string, string> = {};
  for (const locale of released) languages[htmlLang[locale]] = origin + href(locale, to);
  languages["x-default"] = origin + href(DEFAULT_LOCALE, to);
  return languages;
}

export const robotsPolicy: Metadata["robots"] = indexable ? { index: true, follow: true } : { index: false, follow: false };

/**
 * What every document of the site says before a page speaks for itself:
 * whether it may be indexed.
 *
 * No metadataBase is set, on purpose. Every address this module writes is
 * already absolute, and Next.js rewrites the addresses it resolves against a
 * base — the site's root loses its slash. Written whole and left alone, the
 * home is "https://name.tld/" in its canonical, in its versions, in its card
 * and in the sitemap alike.
 */
export function documentSeo(): Metadata {
  return { robots: robotsPolicy };
}

/**
 * What a page says of itself to search engines and to whoever shares it: its
 * own address as the canonical one, the same page in the other released
 * languages, and its title and description as a card. Text only — the site
 * publishes no image, and none is made for this.
 *
 * A page of a language that is not released says its title and description
 * and nothing else: no address is claimed for it and no version of it is named.
 */
export function pageSeo(locale: Locale, to: SitePath, title: string, description: string): Metadata {
  const isReleased = released.includes(locale);
  const url = isReleased ? absolute(locale, to) : null;
  const languages = isReleased ? versions(to) : undefined;
  return {
    title,
    description,
    robots: robotsPolicy,
    ...(url ? { alternates: { canonical: url, ...(languages ? { languages } : {}) } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale],
      ...(url ? { url } : {}),
      ...(isReleased && released.length > 1 ? { alternateLocale: released.filter((other) => other !== locale).map((other) => OG_LOCALE[other]) } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

/** robots.txt: everything, with the sitemap, where the site is indexed; nothing anywhere else. */
export function robotsFile(): MetadataRoute.Robots {
  if (!indexable || !origin) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${origin}/sitemap.xml` };
}

/** The sitemap: every page of every released language, each with its versions. Empty where the site's origin is not known. */
export function sitemapFile(): MetadataRoute.Sitemap {
  if (!origin) return [];
  return released.flatMap((locale) =>
    sitePaths().map((to) => {
      const languages = versions(to);
      return { url: origin + href(locale, to), ...(languages ? { alternates: { languages } } : {}) };
    }),
  );
}
