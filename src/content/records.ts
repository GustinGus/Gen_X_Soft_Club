/**
 * RECORD FILES — the catalogue behind /music/[slug].
 *
 * Two kinds of text make a file and must never be confused:
 *
 *   DOCUMENTED  — `Sourced` fields. A value can only exist together with the
 *                 source it was taken from; otherwise the field stays
 *                 { status: "pending" } and the UI prints PENDING — SOURCE
 *                 REQUIRED. Nothing is filled from memory.
 *
 *   EDITORIAL   — `curatorialNote`. The archive's own interpretation, written
 *                 by Gen X Soft Club and always labelled as such in the UI.
 *                 It makes no historical claims.
 *
 * This module holds each file's DATA: what is the same in every language,
 * and which sources answer for which field. What a file says — its context,
 * its notes, the wording of its short fields — is in each language's record
 * texts (src/i18n/records). See "data and wording" below.
 *
 * Research pass (2026-09-29): values below were read from the cited
 * articles' infobox / track listing (wikitext), not from summaries.
 * Runtimes were cross-checked against the sum of the listed track lengths;
 * where the two disagree by more than rounding, the runtime stays pending.
 * Release formats are filled only where the source states them explicitly.
 * Context (documented history) is pending for every record: it needs
 * primary sources (label, artist, press of the period), not a reference.
 *
 * Research pass (2026-10-04): context, credits and release formats, read
 * from music press, official pages and a release database; the reference
 * articles stay as auxiliary sources. Context and credits print only what
 * one of those sources states; a field no such source confirms stays
 * pending, and so does a runtime the sources disagree on.
 */

import type { RecordAudio } from "@/audio/types";
import { formatDate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { RecordTexts } from "@/i18n/records";
import type { MusicRecord } from "./music";
import { tracklists, type TrackRow } from "./tracklists";

export type SourceRef = {
  title: string;
  publisher: string;
  url: string;
  /** ISO date the source was read. */
  accessed: string;
  kind: "official" | "label" | "editorial-reference";
};

export type Sourced<T> =
  | { status: "pending" }
  | {
      status: "sourced";
      value: T;
      /** Indexes into the record's `sources`. */
      sources: readonly number[];
      /** Qualifier printed with the value, e.g. "Birthplace". */
      note?: string;
    };

export type Track = {
  position: number;
  /** `null` = the source lists the track without a title. */
  title: string | null;
  duration: string;
  note?: string;
};

export type Tracklist = {
  /** Which edition the listing describes. */
  edition: string;
  tracks: readonly Track[];
};

export type Credit = {
  /** Printed as the row's term, e.g. "Production", "Vocals". */
  role: string;
  names: readonly string[];
  /** Qualifier printed with the names, e.g. a track title. */
  note?: string;
};

export type RecordFile = {
  catalogue: MusicRecord["catalogue"];
  /** Art-directed line breaks for the display title (artist). */
  titleLines: readonly string[];
  released: Sourced<string>;
  origin: Sourced<string>;
  label: Sourced<string>;
  format: Sourced<string>;
  runtime: Sourced<string>;
  tracklist: Sourced<Tracklist>;
  /** Documented history, paragraphs separated by a blank line. Pending until sourced. */
  context: Sourced<string>;
  /** Documented credits. Only what a source other than the reference confirms. */
  credits: Sourced<readonly Credit[]>;
  /** Editorial interpretation — never presented as fact. */
  curatorialNote: string;
  sources: readonly SourceRef[];
  /** Archivist's notes on the research itself (why a field is still pending). */
  researchNotes?: readonly string[];
  /** Audio is architecture only: nothing is hosted or streamed (see audio/types). */
  audio: RecordAudio;
};

// ---------------------------------------------------------------- data and wording

/*
  A FILE IS DATA PLUS WORDING. What is the same in every language is written
  here: codes, names, labels, lengths, sources — and, for every documented
  field, the sources that answer for it. What is said in a language is in that
  language's record texts (src/i18n/records), under the record's catalogue
  number; the record page puts the two together (fileFor) into a RecordFile,
  the shape every component reads.

  So a footnote can never drift from its claim: the numbers stay here, with
  the field, and a translation carries wording only. The same holds for what
  is counted: how many paragraphs a context has and how many research notes a
  file carries are said here, and every language must bring exactly as many.
*/

/** Wording kept in the record's own texts, under this key. */
type TextKey = { readonly text: string };
const text = (key: string): TextKey => ({ text: key });

/** A documented field whose wording is in the record texts: here, the sources that answer for it. */
type Documented = { status: "pending" } | { status: "documented"; sources: readonly number[] };

/**
 * A documented date. `date` is as precise as the source — "1994", "1994-08" or
 * "1994-08-22" — and is written out in the page's language. `note` is a
 * territory code ("UK"): the date of that release, not of another.
 */
type Dated = { status: "pending" } | { status: "dated"; date: string; sources: readonly number[]; note?: string };

/**
 * Documented history: here, how many paragraphs it runs to and the sources
 * that answer for the whole of it. The paragraphs are in the record texts.
 */
type Narrated = { status: "pending" } | { status: "narrated"; paragraphs: number; sources: readonly number[] };

type CreditData = {
  role: keyof RecordTexts["roles"];
  /** Names as they are; a place or a description that is wording is a TextKey. */
  names: readonly (string | TextKey)[];
  note?: string | TextKey;
};

/** A record file before it is given a language. */
export type RecordData = Omit<RecordFile, "released" | "origin" | "format" | "tracklist" | "context" | "credits" | "curatorialNote" | "researchNotes"> & {
  released: Dated;
  origin: Documented;
  format: Documented;
  tracklist: Sourced<{ edition: keyof RecordTexts["editions"]; rows: readonly TrackRow[] }>;
  context: Narrated;
  credits: Sourced<readonly CreditData[]>;
  /** How many archivist's notes the file carries. Absent: none. */
  researchNotes?: number;
};

// ---------------------------------------------------------------- helpers

const ACCESSED = "2026-09-29";
const pending = { status: "pending" } as const;

const wiki = (title: string, path: string): SourceRef => ({
  title,
  publisher: "Wikipedia",
  url: `https://en.wikipedia.org/wiki/${path}`,
  accessed: ACCESSED,
  kind: "editorial-reference",
});

/** Read in the 2026-10-04 research pass. Press and databases are editorial references. */
const RESEARCHED = "2026-10-04";

const ref = (publisher: string, title: string, url: string, kind: SourceRef["kind"] = "editorial-reference"): SourceRef => ({
  title,
  publisher,
  url,
  accessed: RESEARCHED,
  kind,
});

/** The release listing (formats, territories, dates) of an album. */
const releases = (album: string, id: string) => ref("MusicBrainz", `${album} — releases`, `https://musicbrainz.org/release-group/${id}`);

const credit = (role: CreditData["role"], names: CreditData["names"], note?: CreditData["note"]): CreditData =>
  note ? { role, names, note } : { role, names };

const documented = (sources: readonly number[] = [0]): Documented => ({ status: "documented", sources });

const narrated = (paragraphs: number, sources: readonly number[]): Narrated => ({ status: "narrated", paragraphs, sources });

const dated = (date: string, sources: readonly number[] = [0], note?: string): Dated =>
  note ? { status: "dated", date, sources, note } : { status: "dated", date, sources };

const sourced = <T,>(value: T, sources: readonly number[] = [0], note?: string): Sourced<T> =>
  note ? { status: "sourced", value, sources, note } : { status: "sourced", value, sources };


/** No listening copy is held by the archive. */
const none: RecordAudio = { availability: "not-held" };

// ---------------------------------------------------------------- files

const recordData: readonly RecordData[] = [
  // ============================================================ 01 — AFTER HOURS
  {
    catalogue: "SC—AH—01",
    titleLines: ["Portishead"],
    sources: [
      wiki("Dummy (album)", "Dummy_(album)"),
      wiki("Portishead (band)", "Portishead_(band)"),
      ref("NME", "The Roots Of… Portishead", "https://www.nme.com/blogs/nme-blogs/the-roots-of-portishead-767977"),
      ref(
        "The New York Times (reprinted by High Road Touring)",
        "Portishead's 'Dummy' Is 25. The Band Asks That You Play It Loud",
        "https://www.highroadtouring.com/portisheads-dummy-is-25-the-band-asks-that-you-play-it-loud/",
      ),
      ref("Classic Album Sundays", "The Story of Portishead 'Dummy'", "https://classicalbumsundays.com/portishead-dummy/"),
      ref("Far Out", "The truth behind the cover of Portishead's 'Dummy'", "https://faroutmagazine.co.uk/truth-behind-cover-portishead-dummy/"),
      releases("Dummy", "48140466-cff6-3222-bd55-63c27e43190d"),
    ],
    released: dated("1994-08-22"),
    origin: documented([1]),
    label: sourced("Go! Beat / London"),
    format: documented([6]),
    runtime: pending,
    researchNotes: 1,
    tracklist: sourced({
      edition: "standard",
      rows: tracklists["SC—AH—01"],
    }),
    context: narrated(2, [2, 3, 4, 5]),
    credits: sourced(
      [
        credit("vocals", ["Beth Gibbons"]),
        credit("guitar", ["Adrian Utley"]),
        credit("engineering", ["Dave McDonald"]),
        credit("studio", ["Coach House Studios, Bristol"]),
        credit("coverImage", [text("coverStill")], text("shortFilm")),
      ],
      [2, 3, 4, 5],
    ),
    audio: none,
  },
  {
    catalogue: "SC—AH—02",
    titleLines: ["Sneaker", "Pimps"],
    sources: [
      wiki("Becoming X", "Becoming_X"),
      wiki("Sneaker Pimps", "Sneaker_Pimps"),
      ref("Encyclopedia.com (Contemporary Musicians)", "Sneaker Pimps", "https://www.encyclopedia.com/education/news-wires-white-papers-and-books/sneaker-pimps"),
      ref("Sneaker Pimps (Bandcamp)", "Becoming X", "https://sneakerpimps.bandcamp.com/album/becoming-x", "official"),
    ],
    released: dated("1996-08-19", [0], "UK"),
    origin: documented([1]),
    label: sourced("Clean Up / Virgin"),
    format: documented([0]),
    runtime: pending,
    researchNotes: 1,
    tracklist: sourced({
      edition: "original",
      rows: tracklists["SC—AH—02"],
    }),
    context: narrated(2, [0, 2, 3]),
    credits: sourced(
      [
        credit("vocals", ["Kelli Dayton"]),
        credit("lyrics", ["Ian Pickering"]),
      ],
      [2, 3],
    ),
    audio: none,
  },
  {
    catalogue: "SC—AH—03",
    titleLines: ["Massive", "Attack"],
    sources: [
      wiki("Mezzanine (album)", "Mezzanine_(album)"),
      wiki("Massive Attack", "Massive_Attack"),
      ref("Classic Album Sundays", "The Story of Massive Attack 'Mezzanine'", "https://classicalbumsundays.com/album-of-the-month-massive-attack-mezzanine/"),
      ref("Happy Mag", "Engineering the Sound: Massive Attack's 'Mezzanine'", "https://happymag.tv/engineering-the-sound-massive-attacks-mezzanine/"),
      ref("Long Live Vinyl", "Massive Attack's Mezzanine – The Story Behind The Sleeve", "https://longlivevinyl.net/2018/11/28/story-behind-sleeve-17-massive-attack-mezzanine/"),
      releases("Mezzanine", "6f9f6899-c0d3-311d-ae87-a10ae6bc53a9"),
    ],
    released: dated("1998-04-20"),
    origin: documented([1]),
    label: sourced("Virgin / Circa"),
    format: documented([5]),
    runtime: sourced("63:29"),
    tracklist: sourced({
      edition: "standard",
      rows: tracklists["SC—AH—03"],
    }),
    context: narrated(2, [2, 3, 4, 5]),
    credits: sourced(
      [
        credit("production", ["Neil Davidge", "Massive Attack"]),
        credit("mixing", ["Mark “Spike” Stent"]),
        credit("vocals", ["Elizabeth Fraser"], "“Teardrop”"),
        credit("vocals", ["Horace Andy"]),
        credit("artDirection", ["Tom Hingston", "Robert Del Naja"]),
        credit("photography", ["Nick Knight"]),
      ],
      [2, 3, 4],
    ),
    audio: none,
  },

  // ============================================================ 02 — SOFT FUTURE
  {
    catalogue: "SC—SF—04",
    titleLines: ["Air"],
    sources: [
      wiki("Moon Safari", "Moon_Safari"),
      wiki("Air (French band)", "Air_(French_band)"),
      ref("uDiscover Music", "Revisiting Air's Retro-Futurist 'Moon Safari'", "https://www.udiscovermusic.com/stories/rediscover-airs-moon-safari/"),
      ref("Happy Mag", "Engineering the Sound: Air's 'Moon Safari'", "https://happymag.tv/engineering-the-sound-air-moon-safari/"),
      releases("Moon Safari", "b0bf2b77-b8cf-32f6-8893-9741d757b400"),
    ],
    released: dated("1998-01-16"),
    origin: documented([1]),
    label: sourced("Source / Virgin"),
    format: documented([4]),
    runtime: sourced("43:35"),
    tracklist: sourced({
      edition: "standard",
      rows: tracklists["SC—SF—04"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("engineering", ["Stéphane Briat"]),
        credit("stringArrangements", ["David Whitaker"]),
        credit("vocals", ["Beth Hirsch"], "“All I Need”, “You Make It Easy”"),
        credit("studio", [text("abbeyRoad")], text("strings")),
        credit("studio", ["Gang, Paris"]),
      ],
      [2, 3],
    ),
    audio: none,
  },
  {
    catalogue: "SC—SF—05",
    titleLines: ["Moby"],
    sources: [
      wiki("Play (Moby album)", "Play_(Moby_album)"),
      wiki("Moby", "Moby"),
      ref("Classic Pop", "Making Moby: Play", "https://www.classicpopmag.com/news/moby-play/"),
      ref(
        "Grammy.com",
        "Trouble So Hard: Moby On His New Memoir & The 20th Anniversary Of 'Play'",
        "https://www.grammy.com/news/trouble-so-hard-moby-his-new-memoir-20th-anniversary-play/",
      ),
      ref(
        "Sound on Sound",
        "Moby: Recording Moby's 'Why Does My Heart Feel So Bad?'",
        "https://www.soundonsound.com/people/moby-recording-mobys-why-does-my-heart-feel-so-bad",
      ),
      releases("Play", "7f6a4e72-9fee-39db-8817-63425f97a0f5"),
    ],
    released: dated("1999-05-17"),
    origin: documented([1]),
    label: sourced("Mute / V2"),
    format: documented([5]),
    runtime: sourced("63:18"),
    tracklist: sourced({
      edition: "standard",
      rows: tracklists["SC—SF—05"],
    }),
    context: narrated(2, [2, 3, 4, 5]),
    credits: sourced(
      [
        credit("production", ["Moby"]),
        credit("studio", [text("homeStudio")]),
      ],
      [2, 4],
    ),
    audio: none,
  },
  {
    catalogue: "SC—SF—06",
    titleLines: ["Zero 7"],
    sources: [
      wiki("Simple Things (Zero 7 album)", "Simple_Things_(Zero_7_album)"),
      wiki("Zero 7", "Zero_7"),
      ref("Songwriting Magazine", "Interview: Henry Binns", "https://www.songwritingmagazine.co.uk/interviews/interview-henry-binns"),
      ref(
        "Albumism",
        "Zero 7's Debut Album 'Simple Things' Turns 25 | Album Anniversary",
        "https://albumism.com/features/zero-7-debut-album-simple-things-album-anniversary",
      ),
      ref("Encyclopedia.com (Contemporary Musicians)", "Zero 7", "https://www.encyclopedia.com/education/news-wires-white-papers-and-books/zero-7"),
      releases("Simple Things", "7cda193a-7284-309a-bc05-df04de833030"),
    ],
    released: dated("2001-04-23"),
    origin: documented([1]),
    label: sourced("Ultimate Dilemma"),
    format: documented([5]),
    runtime: sourced("61:14"),
    tracklist: sourced({
      edition: "standard",
      rows: tracklists["SC—SF—06"],
    }),
    context: narrated(2, [2, 3, 4, 5]),
    credits: sourced(
      [
        credit("vocals", ["Sia Furler", "Sophie Barker", "Mozez"]),
      ],
      [2, 3],
    ),
    audio: none,
  },

  // ============================================================ 03 — CITY FREQUENCY
  {
    catalogue: "SC—CF—07",
    titleLines: ["DJ Shadow"],
    sources: [
      wiki("Endtroducing.....", "Endtroducing....."),
      wiki("DJ Shadow", "DJ_Shadow"),
      ref(
        "Sound on Sound",
        "Classic Tracks: DJ Shadow 'Midnight In A Perfect World'",
        "https://www.soundonsound.com/techniques/classic-tracks-dj-shadow-midnight-perfect-world",
      ),
      ref(
        "Paste",
        "DJ Shadow built 'Endtroducing.....' from what the world left behind",
        "https://www.pastemagazine.com/music/dj-shadow/dj-shadow-built-endtroducing-from-what-the-world-left-behind",
      ),
      releases("Endtroducing.....", "4b2186f5-ff00-3227-ae11-783ba93e1089"),
    ],
    released: dated("1996-09-16"),
    origin: documented([1]),
    label: sourced("Mo' Wax"),
    format: documented([4]),
    runtime: sourced("63:23"),
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—CF—07"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("production", ["DJ Shadow"]),
        credit("mixing", ["DJ Shadow", "Dan “the Automator” Nakamura"]),
        credit("studio", ["The Glue Factory, San Francisco"], text("mixing")),
      ],
      [2],
    ),
    audio: none,
  },
  {
    catalogue: "SC—CF—08",
    titleLines: ["The", "Chemical", "Brothers"],
    sources: [
      wiki("Dig Your Own Hole", "Dig_Your_Own_Hole"),
      wiki("The Chemical Brothers", "The_Chemical_Brothers"),
      ref(
        "NME",
        "The Chemical Brothers announce 25th anniversary edition of 'Dig Your Own Hole'",
        "https://www.nme.com/news/music/the-chemical-brothers-announce-25th-anniversary-edition-of-dig-your-own-hole-3200388",
      ),
      ref(
        "Grammy.com",
        "Back With Another One Of Those Block Rockin' Beats: Revisiting The Chemical Brothers' 'Dig Your Own Hole' At 25",
        "https://www.grammy.com/news/chemical-brothers-dig-your-own-hole-25th-anniversary-block-rockin-beats/",
      ),
      releases("Dig Your Own Hole", "69f4aa7f-d760-3890-bd2a-902fb9abe40b"),
    ],
    released: dated("1997-04-07"),
    origin: documented([1]),
    label: sourced("Freestyle Dust / Virgin (UK) / Astralwerks (US)"),
    format: documented([4]),
    runtime: sourced("63:27"),
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—CF—08"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("vocals", ["Noel Gallagher"], "“Setting Sun”"),
      ],
      [3],
    ),
    audio: none,
  },
  {
    catalogue: "SC—CF—09",
    titleLines: ["Fatboy", "Slim"],
    sources: [
      wiki("You've Come a Long Way, Baby", "You%27ve_Come_a_Long_Way,_Baby"),
      wiki("Fatboy Slim", "Fatboy_Slim"),
      ref("Sound on Sound", "Classic Tracks: Fatboy Slim 'Praise You'", "https://www.soundonsound.com/techniques/classic-tracks-fatboy-slim-praise-you"),
      ref(
        "Long Live Vinyl",
        "Fatboy Slim – You've Come A Long Way, Baby",
        "https://longlivevinyl.net/2018/05/02/celebrate-you-baby-20-years-of-fatboy-slims-youve-come-a-long-way-baby/",
      ),
      releases("You've Come a Long Way, Baby", "435fe38e-404c-3887-8300-cc94420a121c"),
    ],
    released: dated("1998-10-19"),
    origin: documented([1]),
    label: sourced("Skint / Astralwerks"),
    format: documented([4]),
    runtime: sourced("62:00"),
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—CF—09"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("production", ["Norman Cook"]),
        credit("engineering", ["Simon Thornton"]),
        credit("studio", [text("homeStudio")]),
      ],
      [2],
    ),
    audio: none,
  },

  // ============================================================ 04 — ALTERNATIVE SIGNAL
  {
    catalogue: "SC—AS—10",
    titleLines: ["Radiohead"],
    sources: [
      wiki("OK Computer", "OK_Computer"),
      wiki("Radiohead", "Radiohead"),
      ref("NME", "'OK Computer': 50 geeky facts about Radiohead's iconic 1997 album", "https://www.nme.com/blogs/nme-blogs/ok-computer-50-facts-radiohead-1997-album-2087519"),
      releases("OK Computer", "b1392450-e666-3926-a536-22c65f834433"),
    ],
    released: dated("1997-06-16", [2, 3], "UK"),
    origin: documented([1]),
    label: sourced("Parlophone / Capitol"),
    format: documented(),
    runtime: sourced("53:21"),
    researchNotes: 1,
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—AS—10"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("production", ["Nigel Godrich", "Radiohead"]),
        credit("studio", [text("stCatherinesCourt")]),
        credit("artwork", ["Stanley Donwood", "Thom Yorke"]),
      ],
      [2],
    ),
    audio: none,
  },
  {
    catalogue: "SC—AS—11",
    titleLines: ["Stereolab"],
    sources: [
      wiki("Dots and Loops", "Dots_and_Loops"),
      wiki("Stereolab", "Stereolab"),
      releases("Dots and Loops", "dcc1e5d0-c35f-3e4a-b0d2-b53b23eb906f"),
    ],
    released: dated("1997-09-22"),
    origin: documented([1]),
    label: sourced("Duophonic / Elektra"),
    format: documented([2]),
    runtime: sourced("65:52"),
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—AS—11"],
    }),
    context: pending,
    credits: pending,
    audio: none,
  },
  {
    catalogue: "SC—AS—12",
    titleLines: ["UNKLE"],
    sources: [
      wiki("Psyence Fiction", "Psyence_Fiction"),
      wiki("Unkle", "Unkle"),
      ref(
        "Future Music, October 1998 (archived by Solesides)",
        "The Men From U.N.K.L.E",
        "https://www.solesides.com/various-the-men-from-unkle-future-music-1098.html",
      ),
      releases("Psyence Fiction", "17027712-7707-3791-ab65-5320e5ebe501"),
    ],
    released: dated("1998-08-24"),
    origin: documented([1]),
    label: sourced("Mo' Wax"),
    format: documented([3]),
    runtime: sourced("54:59"),
    tracklist: sourced({
      edition: "listed",
      rows: tracklists["SC—AS—12"],
    }),
    context: narrated(2, [2, 3]),
    credits: sourced(
      [
        credit("production", ["UNKLE"], "James Lavelle, DJ Shadow"),
        credit("mixing", ["Jim Abbiss"]),
        credit("guests", ["Richard Ashcroft"], "“Lonely Soul”"),
        credit("guests", ["Thom Yorke", "Mike D"]),
        credit("guests", ["Badly Drawn Boy"], "“Nursery Rhyme”"),
        credit("guests", ["Jason Newsted"], text("bass")),
        credit("guests", ["Mark Hollis"]),
        credit("stringArrangements", ["Wil Malone"]),
      ],
      [2],
    ),
    audio: none,
  },
];

// ---------------------------------------------------------------- assembly

/** What a record's own texts may hold. Which of these a record has is decided by its data, and checked. */
type OwnTexts = {
  origin?: string;
  originNote?: string;
  format?: string;
  formatNote?: string;
  context?: readonly string[];
  credits?: Readonly<Record<string, string>>;
  curatorialNote?: string;
  researchNotes?: readonly string[];
};

/** How a context's paragraphs are set apart in a RecordFile: a blank line (the sheet splits on it). */
const PARAGRAPH = "\n\n";

/**
 * A record's data given a language: the RecordFile the page and the deck read.
 *
 * It refuses to guess. The wording a documented field needs must be there;
 * wording for a field that is pending, or that nothing asks for, must not;
 * every source a field cites must be in the file's list. Anything else stops
 * the build, naming the file and the field.
 */
function assemble(data: RecordData, texts: RecordTexts, locale: Locale): RecordFile {
  const stop = (problem: string): never => {
    throw new Error(`Record file ${data.catalogue} (${locale}): ${problem}`);
  };
  const own: OwnTexts = (texts.files as Readonly<Record<string, OwnTexts>>)[data.catalogue] ?? stop("no texts in this language");

  const cited = (field: string, sources: readonly number[]) => {
    for (const index of sources) if (!Number.isInteger(index) || index < 0 || index >= data.sources.length) stop(`${field} cites source ${index + 1}, which the file does not list`);
    return sources;
  };
  for (const field of ["label", "runtime"] as const) {
    const value = data[field];
    if (value.status === "sourced") cited(field, value.sources);
  }

  /** A documented field's wording, with its qualifier when it has one. */
  const worded = (field: "origin" | "format"): Sourced<string> => {
    const value = own[field];
    const note = own[`${field}Note`];
    const state = data[field];
    if (state.status === "pending") {
      if (value !== undefined || note !== undefined) stop(`${field} is pending, but its texts hold wording for it`);
      return { status: "pending" };
    }
    if (!value) return stop(`${field} is documented, but its texts hold no wording for it`);
    const sources = cited(field, state.sources);
    return note ? { status: "sourced", value, sources, note } : { status: "sourced", value, sources };
  };

  const released = ((): Sourced<string> => {
    const state = data.released;
    if (state.status === "pending") return { status: "pending" };
    let value: string;
    try {
      value = formatDate(state.date, locale);
    } catch (error) {
      return stop(`released: ${error instanceof Error ? error.message : String(error)}`);
    }
    const sources = cited("released", state.sources);
    return state.note ? { status: "sourced", value, sources, note: state.note } : { status: "sourced", value, sources };
  })();

  const tracklist = ((): Sourced<Tracklist> => {
    const state = data.tracklist;
    if (state.status === "pending") return { status: "pending" };
    const edition = texts.editions[state.value.edition] ?? stop(`tracklist edition "${state.value.edition}" has no wording`);
    // [title, length, note?] rows → numbered tracks. Titles and lengths exactly as the source lists them.
    const tracks = state.value.rows.map(([title, duration, note], i): Track => {
      if (!note) return { position: i + 1, title, duration };
      return { position: i + 1, title, duration, note: texts.trackNotes[note] ?? stop(`track ${i + 1}: note "${note}" has no wording`) };
    });
    return { ...state, sources: cited("tracklist", state.sources), value: { edition, tracks } };
  })();

  const context = ((): Sourced<string> => {
    const state = data.context;
    const paragraphs = own.context;
    if (state.status === "pending") {
      if (paragraphs !== undefined) stop("context is pending, but its texts hold wording for it");
      return { status: "pending" };
    }
    if (!paragraphs || paragraphs.length === 0) return stop("context is documented, but its texts hold no wording for it");
    if (paragraphs.length !== state.paragraphs) stop(`context runs to ${state.paragraphs} paragraph(s), but its texts hold ${paragraphs.length}`);
    paragraphs.forEach((paragraph, i) => {
      if (typeof paragraph !== "string" || paragraph.trim() === "") stop(`context: paragraph ${i + 1} is empty`);
      if (paragraph.includes("\n")) stop(`context: paragraph ${i + 1} holds a line break; a paragraph is one item of the list`);
    });
    return { status: "sourced", value: paragraphs.join(PARAGRAPH), sources: cited("context", state.sources) };
  })();

  const curatorialNote = own.curatorialNote;
  if (typeof curatorialNote !== "string" || curatorialNote.trim() === "") return stop("its texts hold no curatorial note");

  const researchNotes = ((): readonly string[] | undefined => {
    const expected = data.researchNotes ?? 0;
    const notes = own.researchNotes;
    if (!Number.isInteger(expected) || expected < 0) stop(`researchNotes: ${expected} is not a number of notes`);
    if ((notes?.length ?? 0) !== expected) stop(`the file carries ${expected} research note(s), but its texts hold ${notes?.length ?? 0}`);
    if (expected === 0) {
      if (notes !== undefined) stop("the file carries no research notes, but its texts hold a list of them");
      return undefined;
    }
    notes!.forEach((note, i) => {
      if (typeof note !== "string" || note.trim() === "") stop(`research note ${i + 1} is empty`);
    });
    return notes;
  })();

  const asked = new Set<string>();
  const wording = (value: string | TextKey): string => {
    if (typeof value === "string") return value;
    asked.add(value.text);
    return own.credits?.[value.text] ?? stop(`credits ask for "${value.text}", which its texts do not hold`);
  };
  const credits = ((): Sourced<readonly Credit[]> => {
    const state = data.credits;
    if (state.status === "pending") return { status: "pending" };
    const value = state.value.map((row): Credit => {
      const role = texts.roles[row.role] ?? stop(`credit role "${row.role}" has no wording`);
      const names = row.names.map(wording);
      return row.note ? { role, names, note: wording(row.note) } : { role, names };
    });
    return { ...state, sources: cited("credits", state.sources), value };
  })();
  const unasked = Object.keys(own.credits ?? {}).filter((key) => !asked.has(key));
  if (unasked.length > 0) stop(`its texts hold credit wording nothing asks for: ${unasked.join(", ")}`);

  // Field by field, in the order a file has always been written in: the deck is handed this object as it is.
  return {
    catalogue: data.catalogue,
    titleLines: data.titleLines,
    sources: data.sources,
    released,
    origin: worded("origin"),
    label: data.label,
    format: worded("format"),
    runtime: data.runtime,
    ...(researchNotes ? { researchNotes } : {}),
    tracklist,
    context,
    credits,
    curatorialNote,
    audio: data.audio,
  };
}

/** The file of a record, in a language: its data here, its wording from that language's record texts. */
export function fileFor(catalogue: string, texts: RecordTexts, locale: Locale): RecordFile | undefined {
  const data = recordData.find((file) => file.catalogue === catalogue);
  return data && assemble(data, texts, locale);
}
