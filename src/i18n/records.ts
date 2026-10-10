import type { Loosen } from "./dictionary";
import type { Locale } from "./locales";
import type { en } from "./records/en";

/** What every language's record texts hold: the same records, the same fields, any wording. */
export type RecordTexts = Loosen<typeof en>;

/*
  The wording of the 12 record files, one language at a time — apart from the
  interface dictionary, and loaded only by a record's page (content/records.ts,
  fileFor): the home and the index never carry it.

  Brazilian Portuguese (records/pt-br) is written in full. Being written is
  not being published: the language is still "in-progress" in locales.ts, so
  it can be built and read here, and waits to be released.
*/
const loaders: { readonly [L in Locale]: () => Promise<RecordTexts> } = {
  en: () => import("./records/en").then((module) => module.en),
  "pt-br": () => import("./records/pt-br").then((module) => module.ptBr),
};

export const getRecordTexts = (locale: Locale): Promise<RecordTexts> => loaders[locale]();
