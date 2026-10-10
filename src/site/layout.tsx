import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SoundProvider } from "@/audio/SoundProvider";
import { Cursor } from "@/components/cursor/Cursor";
import { getDictionary } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { htmlLang, localization, type Locale } from "@/i18n/locales";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/view-transitions.css";

/*
  THE LAYOUT OF THE SITE — the document of a language.

  Each language has a root layout of its own (app/(en), app/pt-br): that is
  what lets its <html> declare its language. They are thin — everything a
  document is made of is here, once, and takes the language as its one
  difference.
*/

/* Neo-grotesque with a width axis: condensed signage ↔ extended display. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/* Technical metadata only — never body copy. */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/**
 * The classes that hand both typefaces to a document, for its <html>: the
 * pages of each language, and the 404 that stands outside them.
 *
 * The typefaces are declared in this module, as they always were in the
 * site's layout, and the module keeps that file's name: the class names the
 * build gives them follow from where they are declared.
 */
export const fontVariables = `${archivo.variable} ${plexMono.variable}`;

/** What the site says of itself, in a language. */
export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const { meta } = await getDictionary(locale);
  return { title: meta.site.title, description: meta.site.description };
}

export const viewport: Viewport = {
  themeColor: "#d8d9d3",
  width: "device-width",
  initialScale: 1,
};

/**
 * A LANGUAGE IS PUBLISHED WHOLE OR NOT AT ALL.
 *
 * The public edition is what gets deployed. A language still being written
 * (locales.ts: localization) has pages that say the wrong thing in the wrong
 * language, so the public edition refuses to render them: the public build
 * stops here, at the first page of that language. The private edition, on
 * this machine, renders it — that is where the work is done.
 *
 * There is no switch for this. NEXT_PUBLIC_EDITION follows from PUBLIC_BUILD
 * alone (next.config.ts); the only way through is to finish the language and
 * mark it complete, which is a decision, not a setting.
 */
function refuseUnfinished(locale: Locale) {
  if (process.env.NEXT_PUBLIC_EDITION === "public" && localization[locale] !== "complete") {
    throw new Error(
      `PUBLIC EDITION: the "${locale}" localization is "${localization[locale]}", not complete. Its pages are not published until it is finished, reviewed and marked complete in src/i18n/locales.ts.`,
    );
  }
}

export async function RootDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  refuseUnfinished(locale);
  // The one language this document serves. Its dictionary is read here, on the server, and only it goes to the browser.
  const copy = await getDictionary(locale);

  return (
    <html lang={htmlLang[locale]} className={fontVariables}>
      <body>
        <SoundProvider>
          <I18nProvider locale={locale} copy={copy}>
            {children}
          </I18nProvider>
        </SoundProvider>
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
