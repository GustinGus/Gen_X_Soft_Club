import type { en } from "./dictionaries/en";
import type { Locale } from "./locales";

/** A dictionary's shape with its texts set free: same keys, same lists, any wording. */
export type Loosen<T> = T extends string ? string : { readonly [K in keyof T]: Loosen<T[K]> };

/** What every language's dictionary holds. A translation missing a key, or a line of a title, does not typecheck. */
export type Dictionary = Loosen<typeof en>;

/*
  One language at a time. Each dictionary is a module of its own, loaded only
  when its language is asked for: the server reads one, and hands that one to
  the browser (I18nProvider). The other never leaves the server.

  A language that is not written yet has a stand-in here (dictionaries/pt-br)
  and says so in locales.ts: it can be built and worked on, not published.
*/
const loaders: { readonly [L in Locale]: () => Promise<Dictionary> } = {
  en: () => import("./dictionaries/en").then((module) => module.en),
  "pt-br": () => import("./dictionaries/pt-br").then((module) => module.ptBr),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> => loaders[locale]();
