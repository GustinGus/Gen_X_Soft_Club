/**
 * ENGLISH — the archive's original language, and the shape every other
 * dictionary must have (see ../dictionary.ts).
 *
 * Interface and editorial copy only, by area. Plain text all the way down, so
 * a dictionary can be handed from the server to the browser: where a sentence
 * takes a value, it marks the place — "{records}" — and ../format.ts fills it.
 *
 * NOT here, on purpose:
 *   - what the catalogue knows (counts, years, codes, names of records,
 *     artists, frequencies): content/music.ts and content/home.ts;
 *   - what is part of a drawing or of the equipment and stays as drawn (the
 *     plates' own lettering, the ticket, the deck's faceplate, the disc label);
 *   - the captions of the private reference copies (content/music.ts, inside
 *     its private marks).
 */
/** Counts as words, the way a magazine sets them: index = the number. Past the list, the figure. */
const COUNT_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
] as const;

export const en = {
  countWords: COUNT_WORDS,
  /**
   * The same counts for what a language counts in another gender ("duas
   * frequências", not "dois"). English has one form: the same list. Which a
   * sentence takes is said where the sentence is filled (format.ts, countWord).
   */
  countWordsFeminine: COUNT_WORDS,

  /** The language switch: how it is named, each language in its own name, and how the page's own is told apart. */
  language: {
    label: "Language",
    names: {
      en: "English",
      "pt-br": "Português (Brasil)",
    },
    current: "current",
  },

  home: {
    skipToManifesto: "Skip to manifesto",
  },

  hero: {
    issue: "Issue 001 / Online",
    axesLabel: "Editorial axes",
    /**
     * Editorial axes, in order of importance (music first). The archive comes
     * out an issue at a time: Sound is this issue; Fashion and Image are
     * issues to come and hold nothing yet. They are named, not offered.
     */
    axes: {
      sound: { label: "Sound", issue: "Open" },
      fashion: { label: "Fashion", issue: "To come" },
      image: { label: "Image", issue: "To come" },
    },
    motion: "Motion",
    motionOn: "On",
    motionOff: "Off",
    intro: ["A digital archive of sound.", "Fashion & image to follow."],
    cta: "Enter the club",
    /** Caption for the procedural disc. 120 mm is the Red Book CD diameter. */
    objectCaption: ["OBJ_001", "Compact disc", "Ø 120 mm", "Procedural model"],
    /** What the paper slip's plate shows, for those who cannot see it. */
    entranceArtwork: "Original artwork of the Soft Club Archive: an entrance. A doorway of screened light stands in the dark.",
  },

  manifesto: {
    range: "Archive / 1990—2005",
    lines: ["The future", "used to look", "like this."],
    /** The archive's intent, not history: what it is after, and what this issue holds of it. */
    intro:
      "An archive of a future imagined at the turn of the millennium — calm, cool and slightly strange. First, its sound; clothing and photographs to follow.",
    status: "Listening index open — {records} records",
  },

  sound: {
    material: "Audio material",
    titleLines: ["The sound", "of the club"],
    questionMark: "Q.",
    question: ["What did", "this future", "sound like?"],
    deck: "Sound is the archive's first room. What follows is a listening index, not a history — four frequencies we tune the records to.",
  },

  frequencies: {
    label: "Index",
    title: "Frequencies",
    note: "Editorial curation — atmospheres, not genres.",
    tuner: "Tuning",
    idle: "Select a frequency",
    inPreparation: "File in preparation",
    open: "Open file",
    tunedTo: "Tuned to {code} {name}",
    /**
     * Each frequency's atmosphere, as the lists print it — editorial, not
     * taxonomy. Wording, so it is here; the frequencies' names are not, and
     * neither is the lettering of the After Hours plate, which sets its own
     * frequency's words as drawn (content/music.ts keeps them for that).
     */
    atmosphere: {
      "after-hours": ["Night city", "Glass", "Fluorescent", "Empty station"],
      "soft-future": ["Pale plastic", "Lounge", "Diffuse light", "Calm technology"],
      "city-frequency": ["Transit", "Signage", "Motion", "Rhythm"],
      "alternative-signal": ["Print", "Fragment", "Analogue / digital", "Tension"],
    },
  },

  afterHours: {
    titleLines: ["The city", "after", "midnight."],
    place: "United Kingdom",
    sceneLabel: "Scene descriptors",
    noteLabel: "Curatorial note",
    curatorialNote:
      "Filed here for how they feel, not where they came from: slow tempos, low light, the long walk home after the last train.",
    filedUnder: "Filed under",
    records: "records",
    year: "Year",
    archiveNo: "Archive no.",
    /** The plate's caption and its description. The lettering inside the drawing is the drawing's own. */
    plate: {
      number: "Plate 02",
      subject: "Station platform, after midnight",
      flag: "Original artwork",
      artwork:
        "Original artwork of the Soft Club Archive: {subject}. A screened lamp, eclipsed, hangs over an empty platform crossed by one line of fluorescent light. The time reads {time}.",
    },
  },

  /**
   * The Home's last page. The imprint says what the archive is and who made
   * it; the artwork line claims the sleeves and plates only — the records are
   * not ours.
   */
  colophon: {
    label: "Colophon",
    issue: "Issue 001 / Sound",
    end: "End of issue",
    titleLines: ["The archive", "continues."],
    deck: "{records} records. {frequencies} frequencies. One place to return to.",
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
  },

  /** /music — the complete listening index. */
  index: {
    skip: "Skip to the drawers",
    entrance: "Entrance",
    label: "Listening index",
    material: "Audio material",
    records: "records",
    frequencies: "frequencies",
    titleLines: ["Listening", "index"],
    /** {records} as a word, {frequencies} as a word in lower case: both counted from the catalogue. */
    deck: "{records} records, filed under {frequencies} frequencies. Each one can be drawn from its drawer and read as a file.",
    note: "Editorial curation — atmospheres, not genres.",
    drawers: "Drawers",
    drawer: "Drawer",
    year: "Year",
    archiveNo: "Archive no.",
    open: "Open file",
    end: "End of index",
    back: "Return to the entrance",
  },

  /** /music/[slug] — the record file: its structure. What a file says of its record is the file's own text. */
  record: {
    index: "Index",
    file: "File",
    inDeck: "Disc out — in deck SC-AU/02",
    year: "Year",
    card: {
      title: "Catalogue card",
      number: "Card",
      fields: {
        artist: "Artist",
        album: "Album",
        year: "Year",
        archiveNo: "Archive no.",
        frequency: "Frequency",
        released: "Released",
        origin: "Origin",
        label: "Label",
        format: "Format",
        runtime: "Runtime",
      },
    },
    pending: "Pending",
    sourceRequired: "Source required",
    curatorialNote: "Curatorial note",
    interpretation: "Editorial interpretation — Gen X Soft Club",
    context: "Context",
    documented: "Documented history",
    tracklist: "Tracklist",
    linerNotes: "Liner notes",
    tracks: "tracks",
    untitled: "Untitled in source listing",
    length: "Length",
    credits: "Credits",
    creditsSources: "As documented by the sources",
    notes: "Notes & sources",
    /** A footnote's name: the number of the source it points to. */
    source: "Source {n}",
    sourceKinds: {
      official: "Official",
      label: "Label",
      "editorial-reference": "Editorial reference",
    },
    read: "Read",
    newTab: "(opens in a new tab)",
    research: {
      sourcesOnly: "Values are taken from the listed sources only. Fields without a confirmable source stay pending.",
      officialToCome: "Official artist and label sources are still to be consulted for this file.",
      noListeningCopy: "No listening copy is held: the archive hosts no recordings.",
      listeningCopy: "Listening copy: {provider}.",
      attached: "attached",
    },
    sleeveNote: "Sleeve shown: original artwork of the Soft Club Archive, drawn from this file's track lengths. The record's own cover is not reproduced.",
    artworkNote: "Artwork not digitised — awaiting a licensed scan.",
    tabs: {
      label: "Archive files",
      prev: "Previous file",
      next: "Next file",
      startOfIndex: "Start of index",
      endOfIndex: "End of index",
      backToIndex: "Return to the index",
    },
  },

  /** The case and what lies in it, for those who cannot see it. The lettering drawn on a sleeve is the sleeve's own. */
  sleeve: {
    coverAlt: "Cover of {album} by {artist}",
    publicSleeve: "Catalogue sleeve for {album} by {artist}: original artwork of the Soft Club Archive.",
    emptyCase: "Placeholder for the cover of {album} by {artist}. Artwork to come.",
    artworkToCome: "Artwork to come",
    scanPending: "Scan pending",
  },

  /**
   * The deck, as it is named and as it speaks to a screen reader. What is
   * printed on the unit — its faceplate, its keys, its display — is the
   * equipment's own lettering and is not here.
   */
  deck: {
    region: "Archive deck SC-AU/02",
    display: "Deck display",
    controls: "Deck controls",
    /** What the counter says to a screen reader: nothing can be played, so it shows no time. */
    noPlaybackTime: "No playback time",
    /**
     * The keys are lettered in English on the unit, in every language. Where
     * the page is in another, what each key does is said after its lettering.
     * English has nothing to add.
     */
    keys: {
      insert: "",
      eject: "",
    },
    announce: {
      empty: "Disc returned to its case.",
      reading: "Reading disc.",
      ready: "Disc ready: {artist}, {album}, {year}. No listening copy is held.",
      ejecting: "Ejecting disc.",
    },
  },

  /** What a page says of itself: its title and description. */
  meta: {
    site: {
      title: "Gen X Soft Club — Soft Club Archive",
      description: "A digital archive of sound, fashion & image. Issue 001 / Online.",
    },
    index: {
      title: "{archive} — Listening index — Soft Club Archive",
      /** {records} as a word, {frequencies} as a word in lower case, {names} the frequencies in order. */
      description: "{records} records filed under {frequencies} frequencies: {names}.",
    },
    record: {
      title: "{artist} — {album} · {catalogue} — Soft Club Archive",
      description: "{archive} / {code} {frequency}. Record file: {artist}, {album} ({year}).",
    },
  },
} as const;
