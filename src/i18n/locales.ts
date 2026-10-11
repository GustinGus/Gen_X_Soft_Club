/**
 * The languages of the archive.
 *
 * English is the original and lives at the root; Brazilian Portuguese lives
 * under /pt-br. A locale is the segment a URL carries; `htmlLang` is what
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

/**
 * Whether a language is finished. "in-progress": its pages exist and can be
 * built and worked on here, but the public edition refuses them — a language
 * is published whole or not at all (site/layout.tsx). Marking one
 * "complete" is a decision, taken after its translation has been reviewed; it
 * is not a step of writing it.
 */
export const localization: Record<Locale, "complete" | "in-progress"> = {
  en: "complete",
  "pt-br": "complete",
};

/** How a language is named where a reader chooses one: short, and the same in every language. */
export const localeLabel: Record<Locale, string> = {
  en: "EN",
  "pt-br": "PT-BR",
};
