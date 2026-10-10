"use client";

import { createContext, use, type ReactNode } from "react";
import type { Dictionary } from "./dictionary";
import type { Locale } from "./locales";

type I18n = { locale: Locale; copy: Dictionary };

const I18nContext = createContext<I18n | null>(null);

/**
 * The page's language, for the components that run in the browser.
 *
 * The root layout — on the server — reads the one dictionary the page is in
 * and passes it here; this module imports no dictionary itself, so the browser
 * is never sent a language it is not showing. Server Components do not need
 * this: they read the dictionary directly (getDictionary).
 */
export function I18nProvider({ locale, copy, children }: I18n & { children: ReactNode }) {
  return <I18nContext value={{ locale, copy }}>{children}</I18nContext>;
}

function useI18n(): I18n {
  const i18n = use(I18nContext);
  if (!i18n) throw new Error("No language here: this component is outside the root layout's I18nProvider.");
  return i18n;
}

/** The dictionary of the page's language. */
export const useCopy = () => useI18n().copy;

/** The page's language. */
export const useLocale = () => useI18n().locale;
