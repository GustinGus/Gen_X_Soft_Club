"use client";

import { usePathname } from "next/navigation";
import { Fragment, type ComponentPropsWithoutRef, type SyntheticEvent } from "react";
import { alternateHref } from "@/i18n/href";
import { useCopy, useLocale } from "@/i18n/I18nProvider";
import { htmlLang, localeLabel, locales, localization, type Locale } from "@/i18n/locales";
import styles from "./LanguageSwitch.module.css";

/**
 * The languages a reader may be offered. The private edition offers every
 * language being worked on; a public edition offers only those released
 * ("complete" in i18n/locales.ts) — it never leads a reader to a language
 * that is not published.
 */
const offered: readonly Locale[] =
  process.env.NEXT_PUBLIC_EDITION === "public" ? locales.filter((locale) => localization[locale] === "complete") : locales;

/**
 * Where the reader is on the page, as a place the other language also has:
 * the section under the upper part of the window, by its id. Nothing is made
 * up — at the top of the page, or where no section owns the place, there is
 * no anchor; a hash already in the address is kept only while what it names
 * is on screen.
 */
function placeOnPage(): string {
  if (window.scrollY < 8) return "";
  const probe = window.innerHeight * 0.35;
  for (const section of document.querySelectorAll<HTMLElement>("main section[id], body > footer[id]")) {
    const box = section.getBoundingClientRect();
    if (box.top <= probe && box.bottom > probe) return `#${section.id}`;
  }
  const named = window.location.hash.length > 1 ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
  if (named) {
    const box = named.getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight) return window.location.hash;
  }
  return "";
}

/**
 * EN / PT-BR — the same page in the other language.
 *
 * A plain link, written by the server from the page's own address
 * (alternateHref): it works with no script, and crossing languages is an
 * ordinary page load — each language has its own document. With script, the
 * link's address is completed with the query and the place on the page, just
 * before it is used: as it is pressed, clicked, or its menu is opened. The
 * address is all that is touched — no event is cancelled, so a new tab, a new
 * window, a copied link and the keyboard all behave as the browser means them
 * to. Nothing is remembered and no one is redirected.
 *
 * The page's own language is named, not linked. Rendered only where there is
 * a language to change to.
 */
export function LanguageSwitch({ className, ...rest }: Omit<ComponentPropsWithoutRef<"nav">, "children" | "aria-label">) {
  const pathname = usePathname();
  const locale = useLocale();
  const copy = useCopy().language;

  if (offered.length < 2 || !offered.includes(locale)) return null;

  const complete = (to: Locale) => (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = alternateHref(pathname + window.location.search + placeOnPage(), to);
  };

  return (
    <nav className={[styles.switch, className].filter(Boolean).join(" ")} aria-label={copy.label} {...rest}>
      {offered.map((to, i) => (
        <Fragment key={to}>
          {i > 0 && (
            <span className={styles.separator} aria-hidden="true">
              /
            </span>
          )}
          {to === locale ? (
            <span aria-current="true">
              {localeLabel[to]}
              <span className="visually-hidden">{` — ${copy.names[to]} (${copy.current})`}</span>
            </span>
          ) : (
            <a
              className={styles.link}
              href={alternateHref(pathname, to)}
              hrefLang={htmlLang[to]}
              lang={htmlLang[to]}
              data-language-switch=""
              onPointerDown={complete(to)}
              onContextMenu={complete(to)}
              onClick={complete(to)}
            >
              {localeLabel[to]}
              <span className="visually-hidden">{` — ${copy.names[to]}`}</span>
            </a>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
