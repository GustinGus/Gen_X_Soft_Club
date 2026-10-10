import type { Dictionary } from "../dictionary";

/**
 * BRAZILIAN PORTUGUESE — BEING WRITTEN.
 *
 * The whole interface is written here: the home, the listening index, the
 * record file's structure, the deck's names and announcements, and what each
 * page says of itself. What a record file says of its record is not in this
 * dictionary (../records/pt-br.ts) and is still partly English: the language
 * stays "in-progress" (../locales.ts) and is not published while it is.
 *
 * What is not translated, here or anywhere: the archive's own names (Gen X
 * Soft Club, Soft Club Archive), the names of records, artists, tracks,
 * frequencies and genres, codes — and whatever is lettered on a drawing or on
 * the deck, which is not wording but part of an object.
 */

/** Counted in the masculine: "doze discos". */
const COUNT_WORDS = [
  "Zero",
  "Um",
  "Dois",
  "Três",
  "Quatro",
  "Cinco",
  "Seis",
  "Sete",
  "Oito",
  "Nove",
  "Dez",
  "Onze",
  "Doze",
  "Treze",
  "Quatorze",
  "Quinze",
  "Dezesseis",
  "Dezessete",
  "Dezoito",
  "Dezenove",
  "Vinte",
] as const;

export const ptBr: Dictionary = {
  countWords: COUNT_WORDS,
  /** Counted in the feminine: "duas frequências". Only one and two differ. */
  countWordsFeminine: COUNT_WORDS.map((word, n) => (n === 1 ? "Uma" : n === 2 ? "Duas" : word)) as unknown as Dictionary["countWordsFeminine"],

  // each language keeps its own name, in every language
  language: {
    label: "Idioma",
    names: {
      en: "English",
      "pt-br": "Português (Brasil)",
    },
    current: "atual",
  },

  home: {
    skipToManifesto: "Pular para o manifesto",
  },

  hero: {
    issue: "Edição 001 / Online",
    axesLabel: "Eixos editoriais",
    axes: {
      sound: { label: "Som", issue: "Disponível" },
      fashion: { label: "Moda", issue: "Em breve" },
      image: { label: "Imagem", issue: "Em breve" },
    },
    motion: "Movimento",
    motionOn: "Ativo",
    motionOff: "Pausado",
    intro: ["Um arquivo digital dedicado ao som.", "Moda & imagem em breve."],
    cta: "Entrar no clube",
    objectCaption: ["OBJ_001", "Disco compacto", "Ø 120 mm", "Modelo procedural"],
    entranceArtwork: "Arte original do Soft Club Archive: uma entrada. Uma porta de luz reticulada se ergue no escuro.",
  },

  manifesto: {
    range: "Arquivo / 1990—2005",
    lines: ["O futuro", "costumava ser", "assim."],
    intro:
      "Um arquivo de um futuro imaginado na virada do milênio — calmo, frio e levemente estranho. Primeiro, o som; roupas e fotografias vêm depois.",
    status: "Índice de escuta disponível — {records} discos",
  },

  sound: {
    material: "Material de áudio",
    titleLines: ["O som", "do clube"],
    questionMark: "P.",
    question: ["Que som", "tinha esse", "futuro?"],
    deck: "O som é a primeira sala do arquivo. O que vem a seguir é um índice de escuta, não uma história — quatro frequências em que sintonizamos os discos.",
  },

  frequencies: {
    label: "Índice",
    title: "Frequências",
    note: "Curadoria editorial — atmosferas, não gêneros.",
    tuner: "Sintonia",
    idle: "Selecione uma frequência",
    inPreparation: "Ficha em preparação",
    open: "Abrir ficha",
    tunedTo: "Sintonizado em {code} {name}",
    atmosphere: {
      "after-hours": ["Cidade noturna", "Vidro", "Fluorescente", "Estação vazia"],
      "soft-future": ["Plástico em tons claros", "Lounge", "Luz difusa", "Tecnologia serena"],
      "city-frequency": ["Transporte", "Sinalização", "Movimento", "Ritmo"],
      "alternative-signal": ["Impresso", "Fragmento", "Analógico / digital", "Tensão"],
    },
  },

  afterHours: {
    titleLines: ["A cidade", "depois da", "meia-noite."],
    place: "Reino Unido",
    sceneLabel: "Descritores de cena",
    noteLabel: "Nota curatorial",
    curatorialNote:
      "Arquivados aqui pelo que fazem sentir, não pelo lugar de onde vieram: andamentos lentos, pouca luz, a longa caminhada para casa depois do último trem.",
    filedUnder: "Arquivados em",
    records: "discos",
    year: "Ano",
    archiveNo: "Nº de arquivo",
    plate: {
      number: "Prancha 02",
      subject: "Plataforma da estação, depois da meia-noite",
      flag: "Arte original",
      artwork:
        "Arte original do Soft Club Archive: {subject}. Uma lâmpada reticulada, em eclipse, pende sobre uma plataforma vazia cortada por uma linha de luz fluorescente. O relógio marca {time}.",
    },
  },

  colophon: {
    label: "Colofão",
    issue: "Edição 001 / Som",
    end: "Fim da edição",
    titleLines: ["O arquivo", "continua."],
    deck: "{records} discos. {frequencies} frequências. Um lugar para voltar.",
    cta: "Explorar o índice de escuta",
    imprint: [
      { term: "Título", value: "Gen X Soft Club" },
      { term: "Edição", value: "Edição 001 / Som" },
      { term: "Tipo", value: "Arquivo digital independente" },
      { term: "Feito por", value: "Gustavo Alves" },
    ],
    artwork: "Capas e pranchas: arte original do Soft Club Archive. Os discos e suas músicas pertencem aos respectivos artistas e gravadoras.",
    back: "Voltar à entrada",
  },

  index: {
    skip: "Pular para as gavetas",
    entrance: "Entrada",
    label: "Índice de escuta",
    material: "Material de áudio",
    records: "discos",
    frequencies: "frequências",
    titleLines: ["Índice de", "escuta"],
    deck: "{records} discos, arquivados em {frequencies} frequências. Cada um pode ser tirado da gaveta e lido como uma ficha.",
    note: "Curadoria editorial — atmosferas, não gêneros.",
    drawers: "Gavetas",
    drawer: "Gaveta",
    year: "Ano",
    archiveNo: "Nº de arquivo",
    open: "Abrir ficha",
    end: "Fim do índice",
    back: "Voltar à entrada",
  },

  record: {
    index: "Índice",
    file: "Ficha",
    inDeck: "Disco retirado — no deck SC-AU/02",
    year: "Ano",
    card: {
      title: "Cartão de catálogo",
      number: "Cartão",
      fields: {
        artist: "Artista",
        album: "Álbum",
        year: "Ano",
        archiveNo: "Nº de arquivo",
        frequency: "Frequência",
        released: "Lançamento",
        origin: "Origem",
        label: "Gravadora",
        format: "Formato",
        runtime: "Duração",
      },
    },
    pending: "Pendente",
    sourceRequired: "Fonte necessária",
    curatorialNote: "Nota curatorial",
    interpretation: "Interpretação editorial — Gen X Soft Club",
    context: "Contexto",
    documented: "História documentada",
    tracklist: "Lista de faixas",
    linerNotes: "Notas de encarte",
    tracks: "faixas",
    untitled: "Sem título na listagem da fonte",
    length: "Duração",
    credits: "Créditos",
    creditsSources: "Conforme documentado pelas fontes",
    notes: "Notas e fontes",
    source: "Fonte {n}",
    sourceKinds: {
      official: "Oficial",
      label: "Gravadora",
      "editorial-reference": "Referência editorial",
    },
    read: "Ler",
    newTab: "(abre em nova aba)",
    research: {
      sourcesOnly: "Os valores vêm apenas das fontes listadas. Campos sem fonte confirmável permanecem pendentes.",
      officialToCome: "As fontes oficiais do artista e da gravadora ainda serão consultadas para esta ficha.",
      noListeningCopy: "Não há cópia para escuta: o arquivo não hospeda gravações.",
      listeningCopy: "Cópia para escuta: {provider}.",
      attached: "anexada",
    },
    sleeveNote: "Capa exibida: arte original do Soft Club Archive, desenhada a partir das durações das faixas desta ficha. A capa original do disco não é reproduzida.",
    artworkNote: "Arte não digitalizada — aguardando digitalização licenciada.",
    tabs: {
      label: "Fichas do arquivo",
      prev: "Ficha anterior",
      next: "Próxima ficha",
      startOfIndex: "Início do índice",
      endOfIndex: "Fim do índice",
      backToIndex: "Voltar ao índice",
    },
  },

  sleeve: {
    coverAlt: "Capa de {album}, de {artist}",
    publicSleeve: "Capa de catálogo de {album}, de {artist}: arte original do Soft Club Archive.",
    emptyCase: "Espaço reservado para a capa de {album}, de {artist}. Arte em breve.",
    artworkToCome: "Arte em breve",
    scanPending: "Digitalização pendente",
  },

  // The unit's own lettering stays English (it is part of the object); this is how it is named and what it says aloud.
  deck: {
    region: "Deck do arquivo SC-AU/02",
    display: "Visor do deck",
    controls: "Controles do deck",
    noPlaybackTime: "Sem tempo de reprodução",
    keys: {
      insert: "inserir disco",
      eject: "ejetar",
    },
    announce: {
      empty: "Disco devolvido à caixa.",
      reading: "Lendo o disco.",
      ready: "Disco pronto: {artist}, {album}, {year}. Não há cópia para escuta.",
      ejecting: "Ejetando o disco.",
    },
  },

  meta: {
    site: {
      title: "Gen X Soft Club — Soft Club Archive",
      description: "Um arquivo digital de som, moda e imagem. Edição 001 / Online.",
    },
    index: {
      title: "{archive} — Índice de escuta — Soft Club Archive",
      description: "{records} discos arquivados em {frequencies} frequências: {names}.",
    },
    record: {
      // names and a code only: the same in every language
      title: "{artist} — {album} · {catalogue} — Soft Club Archive",
      description: "{archive} / {code} {frequency}. Ficha do disco: {artist}, {album} ({year}).",
    },
  },
};
