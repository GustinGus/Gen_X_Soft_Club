/**
 * Home data.
 *
 * What the Home knows that is not wording: the archive's own names and codes,
 * the order of its axes, and what the catalogue derives (counts, years). The
 * sentences are in the dictionaries (src/i18n), one per language. No
 * historical claims live here: dated, sourced history is in the record files.
 */
import { catalogueSpan, frequencies, records } from "./music";

export const archive = {
  name: "Soft Club Archive",
  span: "199X—200X",
} as const;

/**
 * Editorial axes, in order of importance (music first), and which of them is
 * open. Their names and where each issue stands are in the dictionaries
 * (hero.axes), under the same id.
 */
export const axes = [
  { id: "sound", code: "01", open: true },
  { id: "fashion", code: "02", open: false },
  { id: "image", code: "03", open: false },
] as const;

export const hero = {
  /** The archive's name, set as a title: not translated. */
  titleLines: ["Gen X", "Soft Club"],
} as const;

export const manifesto = {
  id: "CULTURE_001",
  /** How many records the listening index holds today. */
  records: records.length,
} as const;

/** The Home's last page: what is counted and dated there is read from the catalogue, never typed. */
export const colophon = {
  mark: "SC—END",
  span: catalogueSpan,
  records: records.length,
  frequencies: frequencies.length,
} as const;
