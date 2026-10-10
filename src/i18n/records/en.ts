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
   * Each record's own wording, by catalogue number: where it comes from, how it
   * was issued, and the credits that are a description rather than a name.
   */
  files: {
    "SC—AH—01": {
      origin: "Bristol, England",
      format: "CD, LP",
      credits: {
        coverStill: "Still from To Kill a Dead Man",
        shortFilm: "the band's short film",
      },
    },
    "SC—AH—02": {
      origin: "Hartlepool, County Durham, England",
      format: "Vinyl, CD, cassette",
      formatNote: "UK & Europe",
    },
    "SC—AH—03": {
      origin: "Bristol, England",
      format: "CD, double LP",
    },
    "SC—SF—04": {
      origin: "Versailles, Île-de-France, France",
      format: "CD, LP",
      credits: {
        abbeyRoad: "Abbey Road Studios, London",
        strings: "strings",
      },
    },
    "SC—SF—05": {
      origin: "New York City, U.S.",
      originNote: "Birthplace",
      format: "CD, double LP, cassette, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Moby's home studio, Mott Street, Manhattan",
      },
    },
    "SC—SF—06": {
      origin: "London, England",
      format: "CD, double LP, cassette",
      formatNote: "UK",
    },
    "SC—CF—07": {
      origin: "Davis, California, U.S.",
      format: "CD, double LP",
      credits: {
        mixing: "mixing",
      },
    },
    "SC—CF—08": {
      origin: "Manchester, England",
      format: "CD, double LP",
    },
    "SC—CF—09": {
      origin: "Bromley, Kent, England",
      originNote: "Birthplace",
      format: "CD, double LP, cassette, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Home studio, Brighton",
      },
    },
    "SC—AS—10": {
      origin: "Abingdon, Oxfordshire, England",
      format: "CD, double LP, cassette, MiniDisc",
      credits: {
        stCatherinesCourt: "St Catherine's Court, near Bath",
      },
    },
    "SC—AS—11": {
      origin: "London, England",
      format: "CD, LP",
      formatNote: "LP: US pressing",
    },
    "SC—AS—12": {
      origin: "London, England",
      format: "CD, double LP",
      credits: {
        bass: "bass",
      },
    },
  },
} as const;
