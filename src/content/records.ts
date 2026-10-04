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
 *
 * Research pass (2026-10-04): context, credits and release formats, read
 * from music press, official pages and a release database; the reference
 * articles stay as auxiliary sources. Context and credits print only what
 * one of those sources states; a field no such source confirms stays
 * pending, and so does a runtime the sources disagree on.
 */

import type { RecordAudio } from "@/audio/types";
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

const credit = (role: string, names: readonly string[], note?: string): Credit => (note ? { role, names, note } : { role, names });

const sourced = <T,>(value: T, sources: readonly number[] = [0], note?: string): Sourced<T> =>
  note ? { status: "sourced", value, sources, note } : { status: "sourced", value, sources };

/** [title, length, note?] rows → numbered tracks. Titles and lengths exactly as the source lists them. */
function tracks(rows: readonly (readonly [string | null, string] | readonly [string | null, string, string])[]) {
  return rows.map(([title, duration, note], i) => ({ position: i + 1, title, duration, ...(note ? { note } : {}) }));
}

/** No listening copy is held by the archive. */
const none: RecordAudio = { availability: "not-held" };

// ---------------------------------------------------------------- files

export const recordFiles: readonly RecordFile[] = [
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
    released: sourced("22 August 1994"),
    origin: sourced("Bristol, England", [1]),
    label: sourced("Go! Beat / London"),
    format: sourced("CD, LP", [6]),
    runtime: pending,
    researchNotes: [
      "Runtime held: the reference lists 49:21, its listed track lengths add up to 48:48, and the current digital edition runs 49:03.",
    ],
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
    context: sourced(
      "Portishead took shape around Bristol's Coach House Studios. Geoff Barrow was working there as a studio junior while Massive Attack recorded Blue Lines in 1991, and was given studio time for his own material; he met singer Beth Gibbons the same year. Guitarist Adrian Utley and engineer Dave McDonald completed the working group." +
      "\n\n" +
      "Rather than sample other people's records alone, the band recorded their own sessions, had them cut to vinyl and then sampled the worn results, looking for the grain of old recordings. The cover is a still of Gibbons from To Kill a Dead Man, the short black-and-white film the band made and scored in 1994. Dummy was released in August 1994 and went on to win the Mercury Music Prize.",
      [2, 3, 4, 5],
    ),
    credits: sourced(
      [
        credit("Vocals", ["Beth Gibbons"]),
        credit("Guitar", ["Adrian Utley"]),
        credit("Engineering", ["Dave McDonald"]),
        credit("Studio", ["Coach House Studios, Bristol"]),
        credit("Cover image", ["Still from To Kill a Dead Man"], "the band's short film"),
      ],
      [2, 3, 4, 5],
    ),
    curatorialNote:
      "Filed first because it sets the light for the whole drawer: one lamp left on, a slow pulse under the floor, a voice that sounds overheard rather than performed.",
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
    released: sourced("19 August 1996", [0], "UK"),
    origin: sourced("Hartlepool, County Durham, England", [1]),
    label: sourced("Clean Up / Virgin"),
    format: sourced("Vinyl, CD, cassette", [0], "UK & Europe"),
    runtime: pending,
    researchNotes: [
      "Runtime held: the reference lists 52:57, the original version's track lengths add up to 48:47, and the current official edition runs 46:28 with shorter versions of three tracks.",
    ],
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
    context: sourced(
      "Sneaker Pimps began in Hartlepool with Chris Corner and Liam Howe, who had been recording on an eight-track machine in Howe's bedroom since 1992 and released an EP as Line of Flight on the Clean Up label in 1993. Wanting a voice for what had been instrumental music, they recruited Kelli Dayton after hearing her sing in a pub; the songs had first been written with Corner singing, with lyrics by Ian Pickering." +
      "\n\n" +
      "Becoming X was first released in the United Kingdom on 19 August 1996. Against the band's own predictions it became a hit, and they went on to tour the record for eighteen months.",
      [0, 2, 3],
    ),
    credits: sourced(
      [
        credit("Vocals", ["Kelli Dayton"]),
        credit("Lyrics", ["Ian Pickering"]),
      ],
      [2, 3],
    ),
    curatorialNote:
      "The hour when the house lights come up and nobody wants to leave yet. Sweet on the surface, something colder underneath — filed here for that double exposure.",
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
    released: sourced("20 April 1998"),
    origin: sourced("Bristol, England", [1]),
    label: sourced("Virgin / Circa"),
    format: sourced("CD, double LP", [5]),
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
    context: sourced(
      "Mezzanine was made by a group pulling apart. Neil Davidge, producing with Massive Attack, worked with the three members largely one at a time, and has described sessions in which one would leave the room as another arrived. Mark “Spike” Stent mixed the record, and has recalled finished mixes being taken away and reworked into parts of other tracks. Elizabeth Fraser of Cocteau Twins sings “Teardrop”; Horace Andy is the other guest voice. The working title was Damaged Goods." +
      "\n\n" +
      "The sleeve was art-directed by Robert Del Naja and Tom Hingston around Nick Knight's photographs of a stag beetle, taken at the Natural History Museum in London and combined into one image. The album was released on 20 April 1998.",
      [2, 3, 4, 5],
    ),
    credits: sourced(
      [
        credit("Production", ["Neil Davidge", "Massive Attack"]),
        credit("Mixing", ["Mark “Spike” Stent"]),
        credit("Vocals", ["Elizabeth Fraser"], "“Teardrop”"),
        credit("Vocals", ["Horace Andy"]),
        credit("Art direction", ["Tom Hingston", "Robert Del Naja"]),
        credit("Photography", ["Nick Knight"]),
      ],
      [2, 3, 4],
    ),
    curatorialNote:
      "The heaviest object in this drawer. We hear it as concrete after rain: low ceilings, long corridors, the bass arriving a moment before the room does.",
    audio: none,
  },

  // ============================================================ 02 — SOFT FUTURE
  {
    catalogue: "SC—SF—04",
    titleLines: ["Air"],
    sources: [
      wiki("Moon Safari", "Moon_Safari"),
      wiki("Air (French band)", "Air_(French_band)"),
      ref("uDiscover Music", "Revisiting Air's Retro-Futurist 'Moon Safari'", "https://www.udiscovermusic.com/stories/rediscover-airs-moon-safari"),
      ref("Happy Mag", "Engineering the Sound: Air's 'Moon Safari'", "https://happymag.tv/engineering-the-sound-air-moon-safari/"),
      releases("Moon Safari", "b0bf2b77-b8cf-32f6-8893-9741d757b400"),
    ],
    released: sourced("16 January 1998"),
    origin: sourced("Versailles, Île-de-France, France", [1]),
    label: sourced("Source / Virgin"),
    format: sourced("CD, LP", [4]),
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
    context: sourced(
      "Jean-Benoît Dunckel and Nicolas Godin recorded Moon Safari on an eight-track machine with analogue instruments from the 1970s — Godin has said they bought them because they were the most affordable instruments available. The string parts were recorded at Abbey Road Studios in London with the arranger David Whitaker, and the American singer Beth Hirsch sings “All I Need” and “You Make It Easy”. Stéphane Briat engineered." +
      "\n\n" +
      "The album was released on 16 January 1998 and reached number 6 in the United Kingdom and number 21 in France.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Engineering", ["Stéphane Briat"]),
        credit("String arrangements", ["David Whitaker"]),
        credit("Vocals", ["Beth Hirsch"], "“All I Need”, “You Make It Easy”"),
        credit("Studio", ["Abbey Road Studios, London"], "strings"),
        credit("Studio", ["Gang, Paris"]),
      ],
      [2, 3],
    ),
    curatorialNote:
      "Pale plastic and afternoon light. The archive's picture of a future that arrived softly, with the windows open and nothing urgent left to do.",
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
    released: sourced("17 May 1999"),
    origin: sourced("New York City, U.S.", [1], "Birthplace"),
    label: sourced("Mute / V2"),
    format: sourced("CD, double LP, cassette, MiniDisc", [5], "UK"),
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
    context: sourced(
      "Moby made Play alone in his home studio on Mott Street in Manhattan, on mostly second-hand equipment. Several of its tracks are built around voices sampled from Sounds of the South, a box set of field recordings made by Alan Lomax. Warner Bros., Sony and RCA turned the record down before V2 took it for North America; Mute released it elsewhere on 17 May 1999." +
      "\n\n" +
      "It entered the UK chart at number 33 and sold slowly at first. All eighteen tracks were eventually licensed for commercial use, which is how many listeners first heard them, and the album went on to sell around twelve million copies.",
      [2, 3, 4, 5],
    ),
    credits: sourced(
      [
        credit("Production", ["Moby"]),
        credit("Studio", ["Moby's home studio, Mott Street, Manhattan"]),
      ],
      [2, 4],
    ),
    curatorialNote:
      "An early-morning record in this archive: the city through a train window, grey turning to white, calm arriving before the day does.",
    audio: none,
  },
  {
    catalogue: "SC—SF—06",
    titleLines: ["Zero 7"],
    sources: [
      wiki("Simple Things (Zero 7 album)", "Simple_Things_(Zero_7_album)"),
      wiki("Zero 7", "Zero_7"),
      ref("Songwriting Magazine", "Interview: Henry Binns", "https://www.songwritingmagazine.co.uk/?p=44402"),
      ref(
        "Albumism",
        "Zero 7's Debut Album 'Simple Things' Turns 25 | Album Anniversary",
        "https://albumism.com/features/zero-7-debut-album-simple-things-album-anniversary",
      ),
      ref("Encyclopedia.com (Contemporary Musicians)", "Zero 7", "https://www.encyclopedia.com/education/news-wires-white-papers-and-books/zero-7"),
      releases("Simple Things", "7cda193a-7284-309a-bc05-df04de833030"),
    ],
    released: sourced("23 April 2001"),
    origin: sourced("London, England", [1]),
    label: sourced("Ultimate Dilemma"),
    format: sourced("CD, double LP, cassette", [5], "UK"),
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
    context: sourced(
      "Henry Binns and Sam Hardaker learned their trade as tape operators at RAK Studios in London, working on their own material in a small programming room during downtime. Their first public work as Zero 7 was a 1997 remix of Radiohead's “Climbing Up the Walls”, followed by two limited EPs." +
      "\n\n" +
      "Simple Things was released in the United Kingdom on 23 April 2001 on Ultimate Dilemma, with vocals from Sia Furler, Sophie Barker and Mozez; Binns has said Sia came in at the last minute. The album was shortlisted for the Mercury Music Prize, and an edition with additional tracks followed in the United States in November 2001.",
      [2, 3, 4, 5],
    ),
    credits: sourced(
      [
        credit("Vocals", ["Sia Furler", "Sophie Barker", "Mozez"]),
      ],
      [2, 3],
    ),
    curatorialNote:
      "Filed at the far end of the frequency, where the future turns domestic: a quiet flat, a record left playing, light moving slowly across the floor.",
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
    released: sourced("16 September 1996"),
    origin: sourced("Davis, California, U.S.", [1]),
    label: sourced("Mo' Wax"),
    format: sourced("CD, double LP", [4]),
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
    context: sourced(
      "Josh Davis built Endtroducing..... from records. He worked on an Akai MPC60 sampler bought in October 1992, a turntable and an Alesis ADAT recorder, drawing on vinyl found in the basement of Rare Records in Sacramento, where he had spent years earning the owner's trust. The album was mixed at the Glue Factory, Dan “the Automator” Nakamura's studio in San Francisco. The cover photograph was taken in the same record shop." +
      "\n\n" +
      "It was released on James Lavelle's Mo' Wax label in September 1996. In 2001 Guinness World Records listed it as the first completely sampled album.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Production", ["DJ Shadow"]),
        credit("Mixing", ["DJ Shadow", "Dan “the Automator” Nakamura"]),
        credit("Studio", ["The Glue Factory, San Francisco"], "mixing"),
      ],
      [2],
    ),
    curatorialNote:
      "We file it as a map more than a record: fragments laid end to end until they read like streets, stations and long stretches of night between them.",
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
    released: sourced("7 April 1997"),
    origin: sourced("Manchester, England", [1]),
    label: sourced("Freestyle Dust / Virgin (UK) / Astralwerks (US)"),
    format: sourced("CD, double LP", [4]),
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
    context: sourced(
      "Dig Your Own Hole was released on 7 April 1997 and went to number one in the United Kingdom. It carried two UK number-one singles: “Setting Sun”, sung by Noel Gallagher of Oasis, which reached the top in late 1996, and “Block Rockin' Beats”." +
      "\n\n" +
      "The record also travelled: it was certified gold in the United States within five months, and “Block Rockin' Beats” won the 1998 Grammy Award for Best Rock Instrumental Performance.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Vocals", ["Noel Gallagher"], "“Setting Sun”"),
      ],
      [3],
    ),
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
      ref("Sound on Sound", "Classic Tracks: Fatboy Slim 'Praise You'", "https://www.soundonsound.com/techniques/classic-tracks-fatboy-slim-praise-you"),
      ref(
        "Long Live Vinyl",
        "Fatboy Slim – You've Come A Long Way, Baby",
        "https://www.longlivevinyl.net/celebrate-you-baby-20-years-of-fatboy-slims-youve-come-a-long-way-baby/",
      ),
      releases("You've Come a Long Way, Baby", "435fe38e-404c-3887-8300-cc94420a121c"),
    ],
    released: sourced("19 October 1998"),
    origin: sourced("Bromley, Kent, England", [1], "Birthplace"),
    label: sourced("Skint / Astralwerks"),
    format: sourced("CD, double LP, cassette, MiniDisc", [4], "UK"),
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
    context: sourced(
      "Norman Cook made his second Fatboy Slim album at home in Brighton, on an Atari ST computer and two Akai S950 samplers, with engineer Simon Thornton. “Praise You” is built on the voice of Camille Yarbrough, from her 1975 recording “Take Yo' Praise”." +
      "\n\n" +
      "The album was released on Skint in October 1998, entered the UK chart at number 2 and later reached number 1. The cover photograph was taken at the 1983 Fat People's Festival in Virginia; the man in it has never been identified.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Production", ["Norman Cook"]),
        credit("Engineering", ["Simon Thornton"]),
        credit("Studio", ["Home studio, Brighton"]),
      ],
      [2],
    ),
    curatorialNote:
      "Daylight after a night out: loud, bright, slightly delirious. Kept in this drawer for its sense of the city in motion, never quite standing still.",
    audio: none,
  },

  // ============================================================ 04 — ALTERNATIVE SIGNAL
  {
    catalogue: "SC—AS—10",
    titleLines: ["Radiohead"],
    sources: [
      wiki("OK Computer", "OK_Computer"),
      wiki("Radiohead", "Radiohead"),
      ref("NME", "'OK Computer': 50 geeky facts about Radiohead's iconic 1997 album", "https://www.nme.com/?p=2087519"),
      releases("OK Computer", "b1392450-e666-3926-a536-22c65f834433"),
    ],
    released: sourced("16 June 1997", [2, 3], "UK"),
    origin: sourced("Abingdon, Oxfordshire, England", [1]),
    label: sourced("Parlophone / Capitol"),
    format: sourced("CD, double LP, cassette, MiniDisc"),
    runtime: sourced("53:21"),
    researchNotes: ["Released first in Japan on 21 May 1997; the card prints the United Kingdom date."],
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
    context: sourced(
      "Radiohead recorded at St Catherine's Court, a mansion near Bath owned by the actress Jane Seymour. The band produced the record themselves with Nigel Godrich. The artwork was made by Stanley Donwood and Thom Yorke on a computer, under a rule that nothing could be erased." +
      "\n\n" +
      "The album appeared in Japan on 21 May 1997 and in the United Kingdom on 16 June 1997, where it reached number 1; it entered the US Billboard 200 at number 21.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Production", ["Nigel Godrich", "Radiohead"]),
        credit("Studio", ["St Catherine's Court, near Bath"]),
        credit("Artwork", ["Stanley Donwood", "Thom Yorke"]),
      ],
      [2],
    ),
    curatorialNote:
      "Filed for the tension it holds between calm and alarm: the smooth surfaces of new technology, heard from somewhere just behind the glass.",
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
    released: sourced("22 September 1997"),
    origin: sourced("London, England", [1]),
    label: sourced("Duophonic / Elektra"),
    format: sourced("CD, LP", [2], "LP: US pressing"),
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
    credits: pending,
    curatorialNote:
      "Printed matter set to sound: repeating patterns, clean lines, colours laid slightly off-register. The most graphic record in this drawer.",
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
    released: sourced("24 August 1998"),
    origin: sourced("London, England", [1]),
    label: sourced("Mo' Wax"),
    format: sourced("CD, double LP", [3]),
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
    context: sourced(
      "Psyence Fiction was three years in the making. James Lavelle, who ran Mo' Wax, conceived the record and recruited its guests; DJ Shadow built the music, largely from samples, on an Akai MPC3000 at home. Jim Abbiss then spent the best part of a year mixing it." +
      "\n\n" +
      "The guests include Richard Ashcroft on “Lonely Soul”, Thom Yorke, Mike D of Beastie Boys, Badly Drawn Boy on “Nursery Rhyme”, Jason Newsted of Metallica on bass and Mark Hollis of Talk Talk, with string arrangements by Wil Malone. The album was released on Mo' Wax on 24 August 1998.",
      [2, 3],
    ),
    credits: sourced(
      [
        credit("Production", ["UNKLE"], "James Lavelle, DJ Shadow"),
        credit("Mixing", ["Jim Abbiss"]),
        credit("Guests", ["Richard Ashcroft"], "“Lonely Soul”"),
        credit("Guests", ["Thom Yorke", "Mike D"]),
        credit("Guests", ["Badly Drawn Boy"], "“Nursery Rhyme”"),
        credit("Guests", ["Jason Newsted"], "bass"),
        credit("Guests", ["Mark Hollis"]),
        credit("String arrangements", ["Wil Malone"]),
      ],
      [2],
    ),
    curatorialNote:
      "A record filed as a poster: bold, layered, assembled from other signals. It closes the first index on a note of tension rather than rest.",
    audio: none,
  },
];

export const fileFor = (catalogue: string) => recordFiles.find((f) => f.catalogue === catalogue);
