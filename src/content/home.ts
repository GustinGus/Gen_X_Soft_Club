/**
 * Home copy — PHASE 1 PROTOTYPE COPY.
 *
 * Deliberately short. No historical claims live here: dated/sourced cultural
 * history arrives in a later phase with research and citations.
 * Everything below is either identity copy or editorial framing.
 */

export const archive = {
  name: "Soft Club Archive",
  issue: "Issue 001 / Online",
  span: "199X—200X",
} as const;

/** Editorial axes, in order of importance (music first). Not links yet. */
export const axes = [
  { code: "01", label: "Sound" },
  { code: "02", label: "Fashion" },
  { code: "03", label: "Image" },
] as const;

export const hero = {
  titleLines: ["Gen X", "Soft Club"],
  intro: ["A digital archive of", "sound, fashion & image"],
  cta: "Enter the club",
  /** Caption for the procedural disc. 120 mm is the Red Book CD diameter. */
  objectCaption: ["OBJ_001", "Compact disc", "Ø 120 mm", "Procedural model"],
} as const;

export const manifesto = {
  id: "CULTURE_001",
  range: "Archive / 1990—2005",
  lines: ["The future", "used to look", "like this."],
  /**
   * PLACEHOLDER — prototype intro. Framed as the archive's intent,
   * not as history. Replace with sourced editorial copy in a later phase.
   */
  intro:
    "An archive of a future imagined at the turn of the millennium — calm, cool and slightly strange — kept here as sound, clothing and photographs.",
  status: "Index in preparation",
} as const;
