/**
 * Home copy.
 *
 * Deliberately short. No historical claims live here: dated, sourced history
 * is in the record files. Everything below is identity copy or editorial
 * framing, and says only what the archive holds today.
 */
import { catalogueSpan, frequencies, records } from "./music";

export const archive = {
  name: "Soft Club Archive",
  issue: "Issue 001 / Online",
  span: "199X—200X",
} as const;

/**
 * Editorial axes, in order of importance (music first). The archive comes out
 * an issue at a time: Sound is this issue; Fashion and Image are issues to
 * come and hold nothing yet. They are named, not offered — none is a link.
 */
export const axes = [
  { code: "01", label: "Sound", issue: "Open", open: true },
  { code: "02", label: "Fashion", issue: "To come", open: false },
  { code: "03", label: "Image", issue: "To come", open: false },
] as const;

export const hero = {
  titleLines: ["Gen X", "Soft Club"],
  intro: ["A digital archive of sound.", "Fashion & image to follow."],
  cta: "Enter the club",
  /** Caption for the procedural disc. 120 mm is the Red Book CD diameter. */
  objectCaption: ["OBJ_001", "Compact disc", "Ø 120 mm", "Procedural model"],
} as const;

export const manifesto = {
  id: "CULTURE_001",
  range: "Archive / 1990—2005",
  lines: ["The future", "used to look", "like this."],
  /** The archive's intent, not history: what it is after, and what this issue holds of it. */
  intro:
    "An archive of a future imagined at the turn of the millennium — calm, cool and slightly strange. First, its sound; clothing and photographs to follow.",
  status: `Listening index open — ${records.length} records`,
} as const;

/** A count as a word, the way a magazine sets it; past twenty, the figure. */
const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

/**
 * The Home's last page. Counts and years are read from the catalogue, never
 * typed here. The imprint says what the archive is and who made it; the
 * artwork line claims the sleeves and plates only — the records are not ours.
 */
export const colophon = {
  label: "Colophon",
  issue: "Issue 001 / Sound",
  end: "End of issue",
  span: catalogueSpan,
  titleLines: ["The archive", "continues."],
  mark: "SC—END",
  records: records.length,
  frequencies: frequencies.length,
  deck: `${countWord(records.length)} records. ${countWord(frequencies.length)} frequencies. One place to return to.`,
  cta: "Explore the listening index",
  imprint: [
    { term: "Title", value: "Gen X Soft Club" },
    { term: "Issue", value: "Issue 001 / Sound" },
    { term: "Kind", value: "Independent digital archive" },
    { term: "Made by", value: "Gustavo Alves" },
  ],
  artwork:
    "Sleeves and plates: original artwork of the Soft Club Archive. The records and their music belong to their artists and labels.",
  back: "Return to the entrance",
} as const;
