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
export const en = {
  /** Counts as words, the way a magazine sets them: index = the number. Past the list, the figure. */
  countWords: [
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
  ],

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
} as const;
