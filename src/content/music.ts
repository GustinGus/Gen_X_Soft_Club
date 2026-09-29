/**
 * MUSIC — curatorial data.
 *
 * Frequencies are the archive's EDITORIAL curation — atmospheres we file
 * records under — not an official or historical genre classification.
 *
 * Records hold only identity data (artist / album / year). Everything that
 * needs a source (labels, cities, credits, context) is left out until the
 * research phase; `verification` tracks that.
 *
 * The full 12-record list exists so Phase 2B (Disc Wall / Record View) can
 * build on it. Phase 2A renders only AFTER HOURS in depth.
 */

export type FrequencyId = "after-hours" | "soft-future" | "city-frequency" | "alternative-signal";

/** Where a piece of data stands editorially. */
export type Verification = "pending" | "sourced";

export type Artwork =
  /** Art-directed empty frame. Never presented as the real cover. */
  | { status: "placeholder" }
  /** Future: licensed / sourced cover. */
  | { status: "licensed"; src: string; credit: string; source: string };

export type MusicRecord = {
  /** Position in the archive's record index (future Disc Wall order). */
  number: number;
  artist: string;
  album: string;
  year: number;
  frequency: FrequencyId;
  /** Featured record of its frequency (future HERO RECORDS). */
  hero: boolean;
  /** The ARCHIVE's own catalogue id — not the label's catalogue number. */
  catalogue: string;
  artwork: Artwork;
  /** Future long-form article, when written. */
  articleSlug?: string;
  /** Identity fields above are well documented; anything added later must be sourced. */
  verification: Verification;
};

export type Frequency = {
  id: FrequencyId;
  code: string;
  name: string;
  /** "open" = has an editorial file in this build. */
  status: "open" | "in-preparation";
  /** Atmosphere words for the index — editorial, not taxonomy. */
  atmosphere: readonly string[];
  /** DOM id of the section this frequency opens, when open. */
  anchor?: string;
};

// ---------------------------------------------------------------- frequencies

export const frequencies: readonly Frequency[] = [
  {
    id: "after-hours",
    code: "01",
    name: "After Hours",
    status: "open",
    atmosphere: ["Night city", "Glass", "Fluorescent", "Empty station"],
    anchor: "after-hours",
  },
  {
    id: "soft-future",
    code: "02",
    name: "Soft Future",
    status: "in-preparation",
    atmosphere: ["Pale plastic", "Lounge", "Diffuse light", "Calm technology"],
  },
  {
    id: "city-frequency",
    code: "03",
    name: "City Frequency",
    status: "in-preparation",
    atmosphere: ["Transit", "Signage", "Motion", "Rhythm"],
  },
  {
    id: "alternative-signal",
    code: "04",
    name: "Alternative Signal",
    status: "in-preparation",
    atmosphere: ["Print", "Fragment", "Analogue / digital", "Tension"],
  },
];

// ---------------------------------------------------------------- records

const placeholder: Artwork = { status: "placeholder" };

export const records: readonly MusicRecord[] = [
  { number: 1, artist: "Portishead", album: "Dummy", year: 1994, frequency: "after-hours", hero: false, catalogue: "SC—AH—01", artwork: placeholder, verification: "pending" },
  { number: 2, artist: "Sneaker Pimps", album: "Becoming X", year: 1996, frequency: "after-hours", hero: false, catalogue: "SC—AH—02", artwork: placeholder, verification: "pending" },
  { number: 3, artist: "Massive Attack", album: "Mezzanine", year: 1998, frequency: "after-hours", hero: true, catalogue: "SC—AH—03", artwork: placeholder, verification: "pending" },

  { number: 4, artist: "AIR", album: "Moon Safari", year: 1998, frequency: "soft-future", hero: true, catalogue: "SC—SF—04", artwork: placeholder, verification: "pending" },
  { number: 5, artist: "Moby", album: "Play", year: 1999, frequency: "soft-future", hero: false, catalogue: "SC—SF—05", artwork: placeholder, verification: "pending" },
  { number: 6, artist: "Zero 7", album: "Simple Things", year: 2001, frequency: "soft-future", hero: false, catalogue: "SC—SF—06", artwork: placeholder, verification: "pending" },

  { number: 7, artist: "DJ Shadow", album: "Endtroducing.....", year: 1996, frequency: "city-frequency", hero: true, catalogue: "SC—CF—07", artwork: placeholder, verification: "pending" },
  { number: 8, artist: "The Chemical Brothers", album: "Surrender", year: 1999, frequency: "city-frequency", hero: false, catalogue: "SC—CF—08", artwork: placeholder, verification: "pending" },
  { number: 9, artist: "Fatboy Slim", album: "You've Come a Long Way, Baby", year: 1998, frequency: "city-frequency", hero: false, catalogue: "SC—CF—09", artwork: placeholder, verification: "pending" },

  { number: 10, artist: "Radiohead", album: "OK Computer", year: 1997, frequency: "alternative-signal", hero: true, catalogue: "SC—AS—10", artwork: placeholder, verification: "pending" },
  { number: 11, artist: "Stereolab", album: "Dots and Loops", year: 1997, frequency: "alternative-signal", hero: false, catalogue: "SC—AS—11", artwork: placeholder, verification: "pending" },
  { number: 12, artist: "UNKLE", album: "Psyence Fiction", year: 1998, frequency: "alternative-signal", hero: false, catalogue: "SC—AS—12", artwork: placeholder, verification: "pending" },
];

// ---------------------------------------------------------------- queries

export const recordsIn = (id: FrequencyId) => records.filter((r) => r.frequency === id);

export const artistsIn = (id: FrequencyId) => recordsIn(id).map((r) => r.artist);

/** Year span derived from the records filed under a frequency, e.g. "1994—1998". */
export function spanOf(id: FrequencyId) {
  const years = recordsIn(id).map((r) => r.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}—${max}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

// ---------------------------------------------------------------- section copy

/**
 * PHASE 2A PROTOTYPE COPY. Short, identity-level, and every sentence that is
 * interpretation is labelled as such in the UI ("Curatorial note").
 */
export const soundOfTheClub = {
  archive: "ARCHIVE_002",
  material: "Audio material",
  range: "1994—2003",
  /** Red Book CD audio format — a medium fact, not a claim about any record. */
  format: ["DISC 01", "44.1 kHz", "16-BIT", "STEREO"],
  titleLines: ["The sound", "of the club"],
  question: ["What did", "this future", "sound like?"],
  deck: "Sound is the archive's first room. What follows is a listening index, not a history — four frequencies we tune the records to.",
} as const;

export const frequenciesCopy = {
  label: "Index",
  title: "Frequencies",
  note: "Editorial curation — atmospheres, not genres.",
  tuner: "Tuning",
  idle: "Select a frequency",
  inPreparation: "File in preparation",
  open: "Open file",
} as const;

export const afterHours = {
  file: "ARCHIVE_002.1",
  titleLines: ["The city", "after", "midnight."],
  /** Genre descriptors commonly used for these records; editorial tags, not definitions. */
  scene: ["Trip-hop", "Downtempo", "Leftfield"],
  place: "United Kingdom",
  curatorialNote:
    "Filed here for how they feel, not where they came from: slow tempos, low light, the long walk home after the last train.",
  plate: {
    number: "Plate 02",
    subject: "Station platform, after midnight",
  },
  continues: "File continues — 02 / Soft Future — in preparation",
} as const;
