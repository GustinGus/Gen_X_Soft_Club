/**
 * MUSIC — curatorial data.
 *
 * Frequencies are the archive's EDITORIAL curation — atmospheres we file
 * records under — not an official or historical genre classification.
 *
 * Records hold only identity data (artist / album / year). Everything that
 * needs a source (labels, origin, runtime, tracklist…) lives per record in
 * content/records.ts, as `Sourced` fields that stay PENDING until sourced.
 *
 * Phase 2A renders AFTER HOURS in depth on the home; Phase 2B opens the full
 * index (/music) and one file per record (/music/[slug]).
 */

export type FrequencyId = "after-hours" | "soft-future" | "city-frequency" | "alternative-signal";

/** Where a piece of data stands editorially. */
export type Verification = "pending" | "sourced";

export type Artwork =
  /** Art-directed empty frame. Never presented as the real cover. */
  | { status: "placeholder" }
  /**
   * A reference copy of the cover, kept on this machine for private study.
   * NOT licensed: it grants no right to redistribute. The file is never
   * versioned (public/covers/reference/ is ignored), and the record must be
   * audited, replaced or returned to a placeholder before any public release
   * — next.config.ts refuses a public build while one remains.
   */
  | {
      status: "reference";
      src: string;
      /** Where the copy was taken from. */
      source: { publisher: string; url: string };
      /** Which edition the image belongs to. */
      edition: string;
      /** ISO date the copy was retrieved. */
      retrieved: string;
      /**
       * The colour of the cover's own border, for a copy that is not quite
       * square: the tray shows it beside the image, which is left as it came.
       */
      edge?: string;
    }
  /** Future: a cover used with documented permission. */
  | { status: "licensed"; src: string; credit: string; source: string };

export type MusicRecord = {
  /** Position in the archive's record index (index order, 01—12). */
  number: number;
  /** URL segment of the record's file: /music/[slug]. */
  slug: string;
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
  /** Identity fields above (artist / album / year) checked against a source. */
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
  /** Where "Open file" leads: the home's own file (AFTER HOURS) or its drawer in /music. */
  href?: string;
  /** Night frequencies print light on dark (same split as the tuner). */
  tone: "night" | "day";
};

// ---------------------------------------------------------------- frequencies

export const frequencies: readonly Frequency[] = [
  {
    id: "after-hours",
    code: "01",
    name: "After Hours",
    status: "open",
    atmosphere: ["Night city", "Glass", "Fluorescent", "Empty station"],
    href: "#after-hours",
    tone: "night",
  },
  {
    id: "soft-future",
    code: "02",
    name: "Soft Future",
    status: "open",
    atmosphere: ["Pale plastic", "Lounge", "Diffuse light", "Calm technology"],
    href: "/music#soft-future",
    tone: "day",
  },
  {
    id: "city-frequency",
    code: "03",
    name: "City Frequency",
    status: "open",
    atmosphere: ["Transit", "Signage", "Motion", "Rhythm"],
    href: "/music#city-frequency",
    tone: "night",
  },
  {
    id: "alternative-signal",
    code: "04",
    name: "Alternative Signal",
    status: "open",
    atmosphere: ["Print", "Fragment", "Analogue / digital", "Tension"],
    href: "/music#alternative-signal",
    tone: "day",
  },
];

// ---------------------------------------------------------------- records

const placeholder: Artwork = { status: "placeholder" };

export const records: readonly MusicRecord[] = [
  { number: 1, slug: "portishead-dummy", artist: "Portishead", album: "Dummy", year: 1994, frequency: "after-hours", hero: false, catalogue: "SC—AH—01", artwork: {
      status: "reference",
      src: "/covers/reference/portishead-dummy.jpg",
      source: { publisher: "Apple Music", url: "https://music.apple.com/gb/album/dummy/1440653096" },
      edition: "Go! Discs, 1994 — catalogue edition",
      retrieved: "2026-10-04",
      // 1445 × 1465: the border's blue, read from the file's left and right edges
      edge: "#012666",
    }, verification: "sourced" },
  { number: 2, slug: "sneaker-pimps-becoming-x", artist: "Sneaker Pimps", album: "Becoming X", year: 1996, frequency: "after-hours", hero: false, catalogue: "SC—AH—02", artwork: placeholder, verification: "sourced" },
  { number: 3, slug: "massive-attack-mezzanine", artist: "Massive Attack", album: "Mezzanine", year: 1998, frequency: "after-hours", hero: true, catalogue: "SC—AH—03", artwork: placeholder, verification: "sourced" },

  { number: 4, slug: "air-moon-safari", artist: "Air", album: "Moon Safari", year: 1998, frequency: "soft-future", hero: true, catalogue: "SC—SF—04", artwork: placeholder, verification: "sourced" },
  { number: 5, slug: "moby-play", artist: "Moby", album: "Play", year: 1999, frequency: "soft-future", hero: false, catalogue: "SC—SF—05", artwork: placeholder, verification: "sourced" },
  { number: 6, slug: "zero-7-simple-things", artist: "Zero 7", album: "Simple Things", year: 2001, frequency: "soft-future", hero: false, catalogue: "SC—SF—06", artwork: placeholder, verification: "sourced" },

  { number: 7, slug: "dj-shadow-endtroducing", artist: "DJ Shadow", album: "Endtroducing.....", year: 1996, frequency: "city-frequency", hero: true, catalogue: "SC—CF—07", artwork: placeholder, verification: "sourced" },
  { number: 8, slug: "the-chemical-brothers-dig-your-own-hole", artist: "The Chemical Brothers", album: "Dig Your Own Hole", year: 1997, frequency: "city-frequency", hero: false, catalogue: "SC—CF—08", artwork: placeholder, verification: "sourced" },
  { number: 9, slug: "fatboy-slim-youve-come-a-long-way-baby", artist: "Fatboy Slim", album: "You've Come a Long Way, Baby", year: 1998, frequency: "city-frequency", hero: false, catalogue: "SC—CF—09", artwork: placeholder, verification: "sourced" },

  { number: 10, slug: "radiohead-ok-computer", artist: "Radiohead", album: "OK Computer", year: 1997, frequency: "alternative-signal", hero: true, catalogue: "SC—AS—10", artwork: placeholder, verification: "sourced" },
  { number: 11, slug: "stereolab-dots-and-loops", artist: "Stereolab", album: "Dots and Loops", year: 1997, frequency: "alternative-signal", hero: false, catalogue: "SC—AS—11", artwork: placeholder, verification: "sourced" },
  { number: 12, slug: "unkle-psyence-fiction", artist: "UNKLE", album: "Psyence Fiction", year: 1998, frequency: "alternative-signal", hero: false, catalogue: "SC—AS—12", artwork: placeholder, verification: "sourced" },
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

/** Reference copies present on this machine (file names), listed by next.config.ts when it starts. */
const referenceCovers = (process.env.NEXT_PUBLIC_REFERENCE_COVERS ?? "").split(",").filter(Boolean);

/**
 * The cover that can be drawn for a record: a licensed one, or a reference
 * copy whose file is here. Anything else — and a reference whose file is
 * missing, as in a fresh clone — is the placeholder (`null`).
 */
export function coverOf(record: MusicRecord) {
  const { artwork } = record;
  if (artwork.status === "licensed") return artwork;
  if (artwork.status === "reference" && referenceCovers.includes(artwork.src.split("/").pop() ?? "")) return artwork;
  return null;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const recordBySlug = (slug: string) => records.find((r) => r.slug === slug);

export const frequencyOf = (id: FrequencyId) => frequencies.find((f) => f.id === id)!;

/** Neighbours in index order — the file tabs. No wrap-around: the index has ends. */
export function neighboursOf(record: MusicRecord) {
  const i = records.indexOf(record);
  return { prev: records[i - 1] ?? null, next: records[i + 1] ?? null };
}

/** Year span of the whole archive, derived from the records. */
export function archiveSpan() {
  const years = records.map((r) => r.year);
  return `${Math.min(...years)}—${Math.max(...years)}`;
}

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

/** /music — the complete ARCHIVE_002 index. */
export const archiveIndex = {
  archive: "ARCHIVE_002",
  label: "Listening index",
  titleLines: ["Listening", "index"],
  deck: "Twelve records, filed under four frequencies. Each one can be drawn from its drawer and read as a file.",
  note: "Editorial curation — atmospheres, not genres.",
  entrance: "Entrance",
  drawer: "Drawer",
  open: "Open file",
} as const;

/** /music/[slug] — the record file. */
export const recordFileCopy = {
  index: "Index",
  card: "Catalogue card",
  pending: "Pending",
  sourceRequired: "Source required",
  curatorialNote: "Curatorial note",
  interpretation: "Editorial interpretation — Gen X Soft Club",
  context: "Context",
  documented: "Documented history",
  tracklist: "Tracklist",
  linerNotes: "Liner notes",
  credits: "Credits",
  notes: "Notes & sources",
  prev: "Previous file",
  next: "Next file",
  startOfIndex: "Start of index",
  endOfIndex: "End of index",
  backToIndex: "Return to the index",
  artworkPending: "Scan pending",
  artworkNote: "Artwork not digitised — awaiting a licensed scan.",
  artworkReference: "Reference copy — not licensed.",
  artworkReferenceNote: "Cover shown as a reference copy kept for private study: it is not licensed for redistribution.",
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
  continues: "File continues — the full listening index, ARCHIVE_002",
} as const;
