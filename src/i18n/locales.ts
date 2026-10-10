/**
 * The languages of the archive.
 *
 * English is the original and lives at the root; Brazilian Portuguese is to
 * live under /pt-br. A locale is the segment a URL carries; `htmlLang` is what
 * the document declares for it (BCP 47). Where each language's pages live is
 * said once, in ./href.ts.
 */
export const locales = ["en", "pt-br"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const htmlLang: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
};

/** How a language is named where a reader chooses one: short, and the same in every language. */
export const localeLabel: Record<Locale, string> = {
  en: "EN",
  "pt-br": "PT-BR",
};
