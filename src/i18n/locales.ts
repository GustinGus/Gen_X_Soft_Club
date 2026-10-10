/**
 * The languages of the archive.
 *
 * English is the original and lives at the root; Brazilian Portuguese is to
 * live under /pt-br. A locale is the segment a URL carries; `htmlLang` is what
 * the document declares for it (BCP 47).
 */
export const locales = ["en", "pt-br"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const htmlLang: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
};
