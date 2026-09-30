import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SoundProvider } from "@/audio/SoundProvider";
import { SoundStatus } from "@/components/chrome/SoundStatus";
import { Cursor } from "@/components/cursor/Cursor";
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

export const metadata: Metadata = {
  title: "Gen X Soft Club — Soft Club Archive",
  description: "A digital archive of sound, fashion & image. Issue 001 / Online.",
};

export const viewport: Viewport = {
  themeColor: "#d8d9d3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <SoundProvider>
          <SoundStatus />
          {children}
        </SoundProvider>
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
