import type { Loosen } from "./dictionary";
import type { Locale } from "./locales";
import type { en } from "./records/en";

/** What every language's record texts hold: the same records, the same fields, any wording. */
export type RecordTexts = Loosen<typeof en>;

/*
  The wording of the 12 record files, one language at a time — apart from the
  interface dictionary, and loaded only by a record's page (content/records.ts,
  fileFor): the home and the index never carry it.

  A language that is not written yet has a stand-in here (records/pt-br) and
  says so in locales.ts: it can be built and worked on, not published.
*/
const loaders: { readonly [L in Locale]: () => Promise<RecordTexts> } = {
  en: () => import("./records/en").then((module) => module.en),
  "pt-br": () => import("./records/pt-br").then((module) => module.ptBr),
};

export const getRecordTexts = (locale: Locale): Promise<RecordTexts> => loaders[locale]();
