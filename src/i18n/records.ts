import type { Loosen } from "./dictionary";
import type { Locale } from "./locales";
import type { en } from "./records/en";

/** What every language's record texts hold: the same records, the same fields, any wording. */
export type RecordTexts = Loosen<typeof en>;

/*
  The wording of the 12 record files, one language at a time — apart from the
  interface dictionary, and loaded only by a record's page (content/records.ts,
  fileFor): the home and the index never carry it.

  pt-br joins this table with its routes; until then asking for it is a
  mistake worth hearing about.
*/
const loaders: { readonly [L in Locale]?: () => Promise<RecordTexts> } = {
  en: () => import("./records/en").then((module) => module.en),
};

export async function getRecordTexts(locale: Locale): Promise<RecordTexts> {
  const load = loaders[locale];
  if (!load) throw new Error(`No record texts for "${locale}" yet.`);
  return load();
}
