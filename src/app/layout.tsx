import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SoundProvider } from "@/audio/SoundProvider";
import { Cursor } from "@/components/cursor/Cursor";
import { getDictionary } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, htmlLang } from "@/i18n/locales";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/view-transitions.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary(defaultLocale);
  return { title: meta.site.title, description: meta.site.description };
}

export const viewport: Viewport = {
  themeColor: "#d8d9d3",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The one language this layout serves. Its dictionary is read here, on the server, and only it goes to the browser.
  const locale = defaultLocale;
  const copy = await getDictionary(locale);

  return (
    <html lang={htmlLang[locale]} className={`${archivo.variable} ${plexMono.variable}`}>
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
