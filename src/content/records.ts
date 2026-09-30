/**
 * RECORD FILES — the catalogue behind /music/[slug].
 *
 * Two kinds of text live here and must never be confused:
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
 * Research pass (2026-09-29): values below were read from the cited
 * articles' infobox / track listing (wikitext), not from summaries.
 * Runtimes were cross-checked against the sum of the listed track lengths;
 * where the two disagree by more than rounding, the runtime stays pending.
 * Release formats are filled only where the source states them explicitly.
 * Context (documented history) is pending for every record: it needs
 * primary sources (label, artist, press of the period), not a reference.
 */

import type { MusicRecord } from "./music";

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
  /** Documented history. Pending until primary sources exist. */
  context: Sourced<string>;
  /** Editorial interpretation — never presented as fact. */
  curatorialNote: string;
  sources: readonly SourceRef[];
  /** Archivist's notes on the research itself (why a field is still pending). */
  researchNotes?: readonly string[];
  /** Audio is architecture only: nothing is hosted or streamed. */
  audio: { status: "none" } | { status: "licensed"; provider: string; url: string };
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

const sourced = <T,>(value: T, sources: readonly number[] = [0], note?: string): Sourced<T> =>
  note ? { status: "sourced", value, sources, note } : { status: "sourced", value, sources };

/** [title, length, note?] rows → numbered tracks. Titles and lengths exactly as the source lists them. */
function tracks(rows: readonly (readonly [string | null, string] | readonly [string | null, string, string])[]) {
  return rows.map(([title, duration, note], i) => ({ position: i + 1, title, duration, ...(note ? { note } : {}) }));
}

const none = { status: "none" } as const;

// ---------------------------------------------------------------- files

export const recordFiles: readonly RecordFile[] = [
  // ============================================================ 01 — AFTER HOURS
  {
    catalogue: "SC—AH—01",
    titleLines: ["Portishead"],
    sources: [wiki("Dummy (album)", "Dummy_(album)"), wiki("Portishead (band)", "Portishead_(band)")],
    released: sourced("22 August 1994"),
    origin: sourced("Bristol, England", [1]),
    label: sourced("Go! Beat / London"),
    format: pending,
    runtime: pending,
    researchNotes: ["Runtime held: the source lists 49:21, but its listed track lengths add up to 48:48."],
    tracklist: sourced({
      edition: "Standard edition, as listed by the source",
      tracks: tracks([
        ["Mysterons", "5:02"],
        ["Sour Times", "4:14"],
        ["Strangers", "3:55"],
        ["It Could Be Sweet", "4:16"],
        ["Wandering Star", "4:51"],
        ["It's a Fire", "3:48", "Not on vinyl LP or original UK and Europe versions"],
        ["Numb", "3:54"],
        ["Roads", "5:02"],
        ["Pedestal", "3:39"],
        ["Biscuit", "5:01"],
        ["Glory Box", "5:06"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Filed first because it sets the light for the whole drawer: one lamp left on, a slow pulse under the floor, a voice that sounds overheard rather than performed.",
    audio: none,
  },
  {
    catalogue: "SC—AH—02",
    titleLines: ["Sneaker", "Pimps"],
    sources: [wiki("Becoming X", "Becoming_X"), wiki("Sneaker Pimps", "Sneaker_Pimps")],
    released: sourced("19 August 1996", [0], "UK"),
    origin: sourced("Hartlepool, County Durham, England", [1]),
    label: sourced("Clean Up / Virgin"),
    format: sourced("Vinyl, CD, cassette", [0], "UK & Europe"),
    runtime: pending,
    researchNotes: ["Runtime held: the source lists 52:57, but the original version's track lengths add up to 48:47."],
    tracklist: sourced({
      edition: "Original version, as listed by the source",
      tracks: tracks([
        ["Low Place Like Home", "4:37"],
        ["Tesko Suicide", "3:44"],
        ["6 Underground", "4:05"],
        ["Becoming X", "4:14"],
        ["Spin Spin Sugar", "4:20"],
        ["Post-Modern Sleaze", "5:11"],
        ["Waterbaby", "4:10"],
        ["Roll On", "4:27"],
        ["Wasted Early Sunday Morning", "4:27"],
        ["Walking Zero", "4:31"],
        ["How Do", "5:01"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "The hour when the house lights come up and nobody wants to leave yet. Sweet on the surface, something colder underneath — filed here for that double exposure.",
    audio: none,
  },
  {
    catalogue: "SC—AH—03",
    titleLines: ["Massive", "Attack"],
    sources: [wiki("Mezzanine (album)", "Mezzanine_(album)"), wiki("Massive Attack", "Massive_Attack")],
    released: sourced("20 April 1998"),
    origin: sourced("Bristol, England", [1]),
    label: sourced("Virgin / Circa"),
    format: pending,
    runtime: sourced("63:29"),
    tracklist: sourced({
      edition: "Standard edition, as listed by the source",
      tracks: tracks([
        ["Angel", "6:18"],
        ["Risingson", "4:58"],
        ["Teardrop", "5:29"],
        ["Inertia Creeps", "5:56"],
        ["Exchange", "4:11"],
        ["Dissolved Girl", "6:07"],
        ["Man Next Door", "5:55"],
        ["Black Milk", "6:20"],
        ["Mezzanine", "5:54"],
        ["Group Four", "8:13"],
        ["(Exchange)", "4:08"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "The heaviest object in this drawer. We hear it as concrete after rain: low ceilings, long corridors, the bass arriving a moment before the room does.",
    audio: none,
  },

  // ============================================================ 02 — SOFT FUTURE
  {
    catalogue: "SC—SF—04",
    titleLines: ["Air"],
    sources: [wiki("Moon Safari", "Moon_Safari"), wiki("Air (French band)", "Air_(French_band)")],
    released: sourced("16 January 1998"),
    origin: sourced("Versailles, Île-de-France, France", [1]),
    label: sourced("Source / Virgin"),
    format: pending,
    runtime: sourced("43:35"),
    tracklist: sourced({
      edition: "Standard edition, as listed by the source",
      tracks: tracks([
        ["La Femme d'argent", "7:08"],
        ["Sexy Boy", "4:57"],
        ["All I Need", "4:28"],
        ["Kelly Watch the Stars", "3:44"],
        ["Talisman", "4:16"],
        ["Remember", "2:34"],
        ["You Make It Easy", "4:00"],
        ["Ce matin là", "3:38"],
        ["New Star in the Sky (Chanson pour Solal)", "5:38"],
        ["Le Voyage de Pénélope", "3:10"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Pale plastic and afternoon light. The archive's picture of a future that arrived softly, with the windows open and nothing urgent left to do.",
    audio: none,
  },
  {
    catalogue: "SC—SF—05",
    titleLines: ["Moby"],
    sources: [wiki("Play (Moby album)", "Play_(Moby_album)"), wiki("Moby", "Moby")],
    released: sourced("17 May 1999"),
    origin: sourced("New York City, U.S.", [1], "Birthplace"),
    label: sourced("Mute / V2"),
    format: pending,
    runtime: sourced("63:18"),
    tracklist: sourced({
      edition: "Standard edition, as listed by the source",
      tracks: tracks([
        ["Honey", "3:28"],
        ["Find My Baby", "4:00"],
        ["Porcelain", "4:01"],
        ["Why Does My Heart Feel So Bad?", "4:24"],
        ["South Side", "3:50"],
        ["Rushing", "3:01"],
        ["Bodyrock", "3:36"],
        ["Natural Blues", "4:14"],
        ["Machete", "3:38"],
        ["7", "1:02"],
        ["Run On", "3:45"],
        ["Down Slow", "1:35"],
        ["If Things Were Perfect", "4:18"],
        ["Everloving", "3:26"],
        ["Inside", "4:49"],
        ["Guitar Flute & String", "2:09"],
        ["The Sky Is Broken", "4:20"],
        ["My Weakness", "3:42"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "An early-morning record in this archive: the city through a train window, grey turning to white, calm arriving before the day does.",
    audio: none,
  },
  {
    catalogue: "SC—SF—06",
    titleLines: ["Zero 7"],
    sources: [wiki("Simple Things (Zero 7 album)", "Simple_Things_(Zero_7_album)"), wiki("Zero 7", "Zero_7")],
    released: sourced("23 April 2001"),
    origin: sourced("London, England", [1]),
    label: sourced("Ultimate Dilemma"),
    format: pending,
    runtime: sourced("61:14"),
    tracklist: sourced({
      edition: "Standard edition, as listed by the source",
      tracks: tracks([
        ["I Have Seen", "5:07"],
        ["Polaris", "4:48"],
        ["Destiny", "5:38"],
        ["Give It Away", "5:17"],
        ["Simple Things", "4:24"],
        ["Red Dust", "5:40"],
        ["Distractions", "5:16"],
        ["In the Waiting Line", "4:35"],
        ["Out of Town", "4:48"],
        ["This World", "5:37"],
        ["Likufanele", "6:24"],
        ["End Theme", "3:38"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Filed at the far end of the frequency, where the future turns domestic: a quiet flat, a record left playing, light moving slowly across the floor.",
    audio: none,
  },

  // ============================================================ 03 — CITY FREQUENCY
  {
    catalogue: "SC—CF—07",
    titleLines: ["DJ Shadow"],
    sources: [wiki("Endtroducing.....", "Endtroducing....."), wiki("DJ Shadow", "DJ_Shadow")],
    released: sourced("16 September 1996"),
    origin: sourced("Davis, California, U.S.", [1]),
    label: sourced("Mo' Wax"),
    format: pending,
    runtime: sourced("63:23"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Best Foot Forward", "0:49"],
        ["Building Steam with a Grain of Salt", "6:40"],
        ["The Number Song", "4:40"],
        ["Changeling / Transmission 1", "7:51"],
        ["What Does Your Soul Look Like (Part 4)", "5:08"],
        [null, "0:24"],
        ["Stem/Long Stem / Transmission 2", "9:21"],
        ["Mutual Slump", "4:02"],
        ["Organ Donor", "1:57"],
        ["Why Hip Hop Sucks in '96", "0:43"],
        ["Midnight in a Perfect World", "4:57"],
        ["Napalm Brain/Scatter Brain", "9:23"],
        ["What Does Your Soul Look Like (Part 1 – Blue Sky Revisit) / Transmission 3", "7:28"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "We file it as a map more than a record: fragments laid end to end until they read like streets, stations and long stretches of night between them.",
    audio: none,
  },
  {
    catalogue: "SC—CF—08",
    titleLines: ["The", "Chemical", "Brothers"],
    sources: [wiki("Dig Your Own Hole", "Dig_Your_Own_Hole"), wiki("The Chemical Brothers", "The_Chemical_Brothers")],
    released: sourced("7 April 1997"),
    origin: sourced("Manchester, England", [1]),
    label: sourced("Freestyle Dust / Virgin (UK) / Astralwerks (US)"),
    format: pending,
    runtime: sourced("63:27"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Block Rockin' Beats", "5:14"],
        ["Dig Your Own Hole", "5:27"],
        ["Elektrobank", "8:18"],
        ["Piku", "4:54"],
        ["Setting Sun", "5:29"],
        ["It Doesn't Matter", "6:14"],
        ["Don't Stop the Rock", "4:50"],
        ["Get Up on It Like This", "2:47"],
        ["Lost in the K-Hole", "3:52"],
        ["Where Do I Begin", "6:56"],
        ["The Private Psychedelic Reel", "9:22"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "The frequency at full volume: signage, strobe, a crowd moving in one direction. Filed here for momentum — the city as something that carries you.",
    audio: none,
  },
  {
    catalogue: "SC—CF—09",
    titleLines: ["Fatboy", "Slim"],
    sources: [
      wiki("You've Come a Long Way, Baby", "You%27ve_Come_a_Long_Way,_Baby"),
      wiki("Fatboy Slim", "Fatboy_Slim"),
    ],
    released: sourced("19 October 1998"),
    origin: sourced("Bromley, Kent, England", [1], "Birthplace"),
    label: sourced("Skint / Astralwerks"),
    format: pending,
    runtime: sourced("62:00"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Right Here, Right Now", "6:27"],
        ["The Rockafeller Skank", "6:53"],
        ["Fucking in Heaven", "3:55", "Retitled on the North American version"],
        ["Gangster Tripping", "5:20"],
        ["Build It Up – Tear It Down", "5:05"],
        ["Kalifornia", "5:53"],
        ["Soul Surfing", "4:56"],
        ["You're Not from Brighton", "5:20"],
        ["Praise You", "5:23"],
        ["Love Island", "5:18"],
        ["Acid 8000", "7:28"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Daylight after a night out: loud, bright, slightly delirious. Kept in this drawer for its sense of the city in motion, never quite standing still.",
    audio: none,
  },

  // ============================================================ 04 — ALTERNATIVE SIGNAL
  {
    catalogue: "SC—AS—10",
    titleLines: ["Radiohead"],
    sources: [wiki("OK Computer", "OK_Computer"), wiki("Radiohead", "Radiohead")],
    released: sourced("21 May 1997"),
    origin: sourced("Abingdon, Oxfordshire, England", [1]),
    label: sourced("Parlophone / Capitol"),
    format: sourced("CD, double LP, cassette, MiniDisc"),
    runtime: sourced("53:21"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Airbag", "4:44"],
        ["Paranoid Android", "6:23"],
        ["Subterranean Homesick Alien", "4:27"],
        ["Exit Music (For a Film)", "4:24"],
        ["Let Down", "4:59"],
        ["Karma Police", "4:21"],
        ["Fitter Happier", "1:57"],
        ["Electioneering", "3:50"],
        ["Climbing Up the Walls", "4:45"],
        ["No Surprises", "3:48"],
        ["Lucky", "4:19"],
        ["The Tourist", "5:24"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Filed for the tension it holds between calm and alarm: the smooth surfaces of new technology, heard from somewhere just behind the glass.",
    audio: none,
  },
  {
    catalogue: "SC—AS—11",
    titleLines: ["Stereolab"],
    sources: [wiki("Dots and Loops", "Dots_and_Loops"), wiki("Stereolab", "Stereolab")],
    released: sourced("22 September 1997"),
    origin: sourced("London, England", [1]),
    label: sourced("Duophonic / Elektra"),
    format: pending,
    runtime: sourced("65:52"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Brakhage", "5:30"],
        ["Miss Modular", "4:29"],
        ["The Flower Called Nowhere", "4:55"],
        ["Diagonals", "5:15"],
        ["Prisoner of Mars", "4:03"],
        ["Rainbo Conversation", "4:46"],
        ["Refractions in the Plastic Pulse", "17:32"],
        ["Parsec", "5:34"],
        ["Ticker-Tape of the Unconscious", "4:45"],
        ["Contronatura", "9:03"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "Printed matter set to sound: repeating patterns, clean lines, colours laid slightly off-register. The most graphic record in this drawer.",
    audio: none,
  },
  {
    catalogue: "SC—AS—12",
    titleLines: ["UNKLE"],
    sources: [wiki("Psyence Fiction", "Psyence_Fiction"), wiki("Unkle", "Unkle")],
    released: sourced("24 August 1998"),
    origin: sourced("London, England", [1]),
    label: sourced("Mo' Wax"),
    format: pending,
    runtime: sourced("54:59"),
    tracklist: sourced({
      edition: "As listed by the source",
      tracks: tracks([
        ["Guns Blazing (Drums of Death Part 1)", "5:01"],
        ["Unkle Main Title Theme", "3:24"],
        ["Bloodstain", "5:57"],
        ["Unreal", "5:10"],
        ["Lonely Soul", "8:56"],
        ["Getting Ahead in the Lucrative Field of Artist Management", "0:56"],
        ["Nursery Rhyme / Breather", "4:45"],
        ["Celestial Annihilation", "4:44"],
        ["The Knock (Drums of Death Part 2)", "3:58"],
        ["Chaos", "4:42"],
        ["Rabbit in Your Headlights", "6:20"],
        ["Outro (Mandatory)", "1:06"],
      ]),
    }),
    context: pending,
    curatorialNote:
      "A record filed as a poster: bold, layered, assembled from other signals. It closes the first index on a note of tension rather than rest.",
    audio: none,
  },
];

export const fileFor = (catalogue: string) => recordFiles.find((f) => f.catalogue === catalogue);
