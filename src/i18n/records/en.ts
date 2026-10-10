/**
 * RECORD TEXTS, ENGLISH — what the 12 record files say in the archive's
 * original language, and the shape every other language's record texts must
 * have (see ../records.ts).
 *
 * Wording only. What is the same in every language — names, labels, lengths,
 * dates, sources, and which sources answer for which field — is the record's
 * data (content/records.ts). The record page puts the two together; a text
 * here that no field asks for, or a field left without its text, stops the
 * build.
 *
 * Kept apart from the interface dictionary because only a record's page reads
 * it: the home and the index are never sent it.
 */
export const en = {
  /** Who did what, as the row's term on the credits. */
  roles: {
    vocals: "Vocals",
    guitar: "Guitar",
    engineering: "Engineering",
    studio: "Studio",
    coverImage: "Cover image",
    lyrics: "Lyrics",
    production: "Production",
    mixing: "Mixing",
    artDirection: "Art direction",
    photography: "Photography",
    stringArrangements: "String arrangements",
    artwork: "Artwork",
    guests: "Guests",
  },

  /** Which edition a track listing describes. */
  editions: {
    standard: "Standard edition, as listed by the source",
    original: "Original version, as listed by the source",
    listed: "As listed by the source",
  },

  /** What is said of a track beside its title (content/tracklists.ts names these by key). */
  trackNotes: {
    notOnVinylOrOriginalUkEurope: "Not on vinyl LP or original UK and Europe versions",
    retitledNorthAmerica: "Retitled on the North American version",
  },

  /**
   * Each record's own wording, by catalogue number.
   *
   *   origin, format   where it comes from and how it was issued, with their
   *                    qualifiers (originNote, formatNote)
   *   credits          the credits that are a description rather than a name
   *   context          DOCUMENTED history, a paragraph per item. The sources
   *                    that answer for it are in the record's data, and so is
   *                    the number of paragraphs: a language brings as many.
   *                    Absent where the record's context is still pending.
   *   curatorialNote   EDITORIAL: the archive's own interpretation, labelled
   *                    as such on the page. It makes no historical claims.
   *   researchNotes    the archivist's notes on the research itself, where
   *                    the record's data says it carries any.
   */
  files: {
    "SC—AH—01": {
      origin: "Bristol, England",
      format: "CD, LP",
      credits: {
        coverStill: "Still from To Kill a Dead Man",
        shortFilm: "the band's short film",
      },
      context: [
        "Portishead took shape around Bristol's Coach House Studios. Geoff Barrow was working there as a studio junior while Massive Attack recorded Blue Lines in 1991, and was given studio time for his own material; he met singer Beth Gibbons the same year. Guitarist Adrian Utley and engineer Dave McDonald completed the working group.",
        "Rather than sample other people's records alone, the band recorded their own sessions, had them cut to vinyl and then sampled the worn results, looking for the grain of old recordings. The cover is a still of Gibbons from To Kill a Dead Man, the short black-and-white film the band made and scored in 1994. Dummy was released in August 1994 and went on to win the Mercury Music Prize.",
      ],
      curatorialNote:
        "Filed first because it sets the light for the whole drawer: one lamp left on, a slow pulse under the floor, a voice that sounds overheard rather than performed.",
      researchNotes: [
        "Runtime held: the reference lists 49:21, its listed track lengths add up to 48:48, and the current digital edition runs 49:03.",
      ],
    },
    "SC—AH—02": {
      origin: "Hartlepool, County Durham, England",
      format: "Vinyl, CD, cassette",
      formatNote: "UK & Europe",
      context: [
        "Sneaker Pimps began in Hartlepool with Chris Corner and Liam Howe, who had been recording on an eight-track machine in Howe's bedroom since 1992 and released an EP as Line of Flight on the Clean Up label in 1993. Wanting a voice for what had been instrumental music, they recruited Kelli Dayton after hearing her sing in a pub; the songs had first been written with Corner singing, with lyrics by Ian Pickering.",
        "Becoming X was first released in the United Kingdom on 19 August 1996. Against the band's own predictions it became a hit, and they went on to tour the record for eighteen months.",
      ],
      curatorialNote:
        "The hour when the house lights come up and nobody wants to leave yet. Sweet on the surface, something colder underneath — filed here for that double exposure.",
      researchNotes: [
        "Runtime held: the reference lists 52:57, the original version's track lengths add up to 48:47, and the current official edition runs 46:28 with shorter versions of three tracks.",
      ],
    },
    "SC—AH—03": {
      origin: "Bristol, England",
      format: "CD, double LP",
      context: [
        "Mezzanine was made by a group pulling apart. Neil Davidge, producing with Massive Attack, worked with the three members largely one at a time, and has described sessions in which one would leave the room as another arrived. Mark “Spike” Stent mixed the record, and has recalled finished mixes being taken away and reworked into parts of other tracks. Elizabeth Fraser of Cocteau Twins sings “Teardrop”; Horace Andy is the other guest voice. The working title was Damaged Goods.",
        "The sleeve was art-directed by Robert Del Naja and Tom Hingston around Nick Knight's photographs of a stag beetle, taken at the Natural History Museum in London and combined into one image. The album was released on 20 April 1998.",
      ],
      curatorialNote:
        "The heaviest object in this drawer. We hear it as concrete after rain: low ceilings, long corridors, the bass arriving a moment before the room does.",
    },
    "SC—SF—04": {
      origin: "Versailles, Île-de-France, France",
      format: "CD, LP",
      credits: {
        abbeyRoad: "Abbey Road Studios, London",
        strings: "strings",
      },
      context: [
        "Jean-Benoît Dunckel and Nicolas Godin recorded Moon Safari on an eight-track machine with analogue instruments from the 1970s — Godin has said they bought them because they were the most affordable instruments available. The string parts were recorded at Abbey Road Studios in London with the arranger David Whitaker, and the American singer Beth Hirsch sings “All I Need” and “You Make It Easy”. Stéphane Briat engineered.",
        "The album was released on 16 January 1998 and reached number 6 in the United Kingdom and number 21 in France.",
      ],
      curatorialNote:
        "Pale plastic and afternoon light. The archive's picture of a future that arrived softly, with the windows open and nothing urgent left to do.",
    },
    "SC—SF—05": {
      origin: "New York City, U.S.",
      originNote: "Birthplace",
      format: "CD, double LP, cassette, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Moby's home studio, Mott Street, Manhattan",
      },
      context: [
        "Moby made Play alone in his home studio on Mott Street in Manhattan, on mostly second-hand equipment. Several of its tracks are built around voices sampled from Sounds of the South, a box set of field recordings made by Alan Lomax. Warner Bros., Sony and RCA turned the record down before V2 took it for North America; Mute released it elsewhere on 17 May 1999.",
        "It entered the UK chart at number 33 and sold slowly at first. All eighteen tracks were eventually licensed for commercial use, which is how many listeners first heard them, and the album went on to sell around twelve million copies.",
      ],
      curatorialNote:
        "An early-morning record in this archive: the city through a train window, grey turning to white, calm arriving before the day does.",
    },
    "SC—SF—06": {
      origin: "London, England",
      format: "CD, double LP, cassette",
      formatNote: "UK",
      context: [
        "Henry Binns and Sam Hardaker learned their trade as tape operators at RAK Studios in London, working on their own material in a small programming room during downtime. Their first public work as Zero 7 was a 1997 remix of Radiohead's “Climbing Up the Walls”, followed by two limited EPs.",
        "Simple Things was released in the United Kingdom on 23 April 2001 on Ultimate Dilemma, with vocals from Sia Furler, Sophie Barker and Mozez; Binns has said Sia came in at the last minute. The album was shortlisted for the Mercury Music Prize, and an edition with additional tracks followed in the United States in November 2001.",
      ],
      curatorialNote:
        "Filed at the far end of the frequency, where the future turns domestic: a quiet flat, a record left playing, light moving slowly across the floor.",
    },
    "SC—CF—07": {
      origin: "Davis, California, U.S.",
      format: "CD, double LP",
      credits: {
        mixing: "mixing",
      },
      context: [
        "Josh Davis built Endtroducing..... from records. He worked on an Akai MPC60 sampler bought in October 1992, a turntable and an Alesis ADAT recorder, drawing on vinyl found in the basement of Rare Records in Sacramento, where he had spent years earning the owner's trust. The album was mixed at the Glue Factory, Dan “the Automator” Nakamura's studio in San Francisco. The cover photograph was taken in the same record shop.",
        "It was released on James Lavelle's Mo' Wax label in September 1996. In 2001 Guinness World Records listed it as the first completely sampled album.",
      ],
      curatorialNote:
        "We file it as a map more than a record: fragments laid end to end until they read like streets, stations and long stretches of night between them.",
    },
    "SC—CF—08": {
      origin: "Manchester, England",
      format: "CD, double LP",
      context: [
        "Dig Your Own Hole was released on 7 April 1997 and went to number one in the United Kingdom. It carried two UK number-one singles: “Setting Sun”, sung by Noel Gallagher of Oasis, which reached the top in late 1996, and “Block Rockin' Beats”.",
        "The record also travelled: it was certified gold in the United States within five months, and “Block Rockin' Beats” won the 1998 Grammy Award for Best Rock Instrumental Performance.",
      ],
      curatorialNote:
        "The frequency at full volume: signage, strobe, a crowd moving in one direction. Filed here for momentum — the city as something that carries you.",
    },
    "SC—CF—09": {
      origin: "Bromley, Kent, England",
      originNote: "Birthplace",
      format: "CD, double LP, cassette, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Home studio, Brighton",
      },
      context: [
        "Norman Cook made his second Fatboy Slim album at home in Brighton, on an Atari ST computer and two Akai S950 samplers, with engineer Simon Thornton. “Praise You” is built on the voice of Camille Yarbrough, from her 1975 recording “Take Yo' Praise”.",
        "The album was released on Skint in October 1998, entered the UK chart at number 2 and later reached number 1. The cover photograph was taken at the 1983 Fat People's Festival in Virginia; the man in it has never been identified.",
      ],
      curatorialNote:
        "Daylight after a night out: loud, bright, slightly delirious. Kept in this drawer for its sense of the city in motion, never quite standing still.",
    },
    "SC—AS—10": {
      origin: "Abingdon, Oxfordshire, England",
      format: "CD, double LP, cassette, MiniDisc",
      credits: {
        stCatherinesCourt: "St Catherine's Court, near Bath",
      },
      context: [
        "Radiohead recorded at St Catherine's Court, a mansion near Bath owned by the actress Jane Seymour. The band produced the record themselves with Nigel Godrich. The artwork was made by Stanley Donwood and Thom Yorke on a computer, under a rule that nothing could be erased.",
        "The album appeared in Japan on 21 May 1997 and in the United Kingdom on 16 June 1997, where it reached number 1; it entered the US Billboard 200 at number 21.",
      ],
      curatorialNote:
        "Filed for the tension it holds between calm and alarm: the smooth surfaces of new technology, heard from somewhere just behind the glass.",
      researchNotes: [
        "Released first in Japan on 21 May 1997; the card prints the United Kingdom date.",
      ],
    },
    "SC—AS—11": {
      origin: "London, England",
      format: "CD, LP",
      formatNote: "LP: US pressing",
      curatorialNote:
        "Printed matter set to sound: repeating patterns, clean lines, colours laid slightly off-register. The most graphic record in this drawer.",
    },
    "SC—AS—12": {
      origin: "London, England",
      format: "CD, double LP",
      credits: {
        bass: "bass",
      },
      context: [
        "Psyence Fiction was three years in the making. James Lavelle, who ran Mo' Wax, conceived the record and recruited its guests; DJ Shadow built the music, largely from samples, on an Akai MPC3000 at home. Jim Abbiss then spent the best part of a year mixing it.",
        "The guests include Richard Ashcroft on “Lonely Soul”, Thom Yorke, Mike D of Beastie Boys, Badly Drawn Boy on “Nursery Rhyme”, Jason Newsted of Metallica on bass and Mark Hollis of Talk Talk, with string arrangements by Wil Malone. The album was released on Mo' Wax on 24 August 1998.",
      ],
      curatorialNote:
        "A record filed as a poster: bold, layered, assembled from other signals. It closes the first index on a note of tension rather than rest.",
    },
  },
} as const;
