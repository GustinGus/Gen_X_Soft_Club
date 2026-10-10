/**
 * Home copy.
 *
 * Deliberately short. No historical claims live here: dated, sourced history
 * is in the record files. Everything below is identity copy or editorial
 * framing, and says only what the archive holds today.
 */
import { records } from "./music";

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
