import type { Metadata } from "next";
import { href } from "@/i18n/href";
import { htmlLang, localeLabel } from "@/i18n/locales";
import { fontVariables } from "@/site/layout";
import "@/styles/tokens.css";
import "@/styles/base.css";
import styles from "./global-not-found.module.css";

/*
  THE 404 — one page for every address the site does not have.

  Each language has a root layout of its own, so no layout stands above both
  to make this page from; it is a whole document, served as it is, with the
  status 404 (next.config.ts: globalNotFound). It cannot know which language
  the reader was in, so it speaks both: the document is English, the archive's
  original, and what is said in Portuguese is marked as Portuguese. It needs
  no script: nothing here moves, and nothing of the disc or the deck is loaded.

  The one place a page links into another language, and says which
  (hreflang): scripts/check-links.mjs knows this page by name.
*/

/** Said twice, once per language: wording that belongs to this page alone. */
const said = [
  {
    locale: "en",
    line: "This page is not in the archive.",
    detail: "The address may be mistyped, or the file may have been moved.",
    link: "Go to the listening index",
  },
  {
    locale: "pt-br",
    line: "Esta página não está no arquivo.",
    detail: "O endereço pode ter sido digitado errado, ou a ficha pode ter mudado de lugar.",
    link: "Ir para o índice de escuta",
  },
] as const;

export const metadata: Metadata = {
  title: "404 — Soft Club Archive",
  description: "This page is not in the archive. / Esta página não está no arquivo.",
};

export default function GlobalNotFound() {
  return (
    <html lang={htmlLang.en} className={fontVariables}>
      <body>
        <main className={styles.page} data-theme="night">
          <header className={styles.folio}>
            <p className={styles.code}>
              <span className={styles.dot} aria-hidden="true" />
              ERROR_404
            </p>
            <p className={styles.muted}>Soft Club Archive</p>
          </header>

          <h1 className={styles.title}>404</h1>

          <div className={styles.said}>
            {said.map(({ locale, line, detail, link }) => (
              <section key={locale} className={styles.language} lang={htmlLang[locale]}>
                <p className={styles.label} aria-hidden="true">
                  {localeLabel[locale]}
                </p>
                <p className={styles.line}>{line}</p>
                <p className={styles.detail}>{detail}</p>
                {/* a plain link: this document is outside the app's router */}
                <a className={styles.link} href={href(locale, "/music")} hrefLang={htmlLang[locale]}>
                  {link} <span aria-hidden="true">→</span>
                </a>
              </section>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
