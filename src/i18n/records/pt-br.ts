import type { RecordTexts } from "../records";
import { en } from "./en";

/**
 * RECORD TEXTS, BRAZILIAN PORTUGUESE — BEING WRITTEN.
 *
 * Written: what a record file says in a few words — who did what, which
 * edition a listing describes, the notes beside a track, where a record comes
 * from and how it was issued, the credits that are a description.
 *
 * STILL ENGLISH, taken from the English record texts and named as such on
 * every record: the documented history (context), the curatorial note and the
 * notes on the research. They are not copied here: while this module takes
 * them from English it is a stand-in, the language is "in-progress"
 * (../locales.ts) and it is not published.
 *
 * Names of records, artists, tracks, studios and labels stay as they are,
 * being data and not wording; so do formats' own names (CD, LP, MiniDisc) and
 * "UK", a code beside a format as it is beside a date.
 */
const original = en.files;

export const ptBr: RecordTexts = {
  roles: {
    vocals: "Vocais",
    guitar: "Guitarra",
    engineering: "Engenharia de som",
    studio: "Estúdio",
    coverImage: "Imagem da capa",
    lyrics: "Letras",
    production: "Produção",
    mixing: "Mixagem",
    artDirection: "Direção de arte",
    photography: "Fotografia",
    stringArrangements: "Arranjos de cordas",
    artwork: "Arte",
    guests: "Convidados",
  },

  editions: {
    standard: "Edição padrão, conforme a fonte",
    original: "Versão original, conforme a fonte",
    listed: "Conforme a fonte",
  },

  trackNotes: {
    notOnVinylOrOriginalUkEurope: "Ausente do LP de vinil e das versões originais do Reino Unido e da Europa",
    retitledNorthAmerica: "Com outro título na versão norte-americana",
  },

  files: {
    "SC—AH—01": {
      origin: "Bristol, Inglaterra",
      format: "CD, LP",
      credits: {
        coverStill: "Fotograma de To Kill a Dead Man",
        shortFilm: "curta-metragem da banda",
      },
      context: original["SC—AH—01"].context,
      curatorialNote: original["SC—AH—01"].curatorialNote,
      researchNotes: original["SC—AH—01"].researchNotes,
    },
    "SC—AH—02": {
      origin: "Hartlepool, Condado de Durham, Inglaterra",
      format: "Vinil, CD, cassete",
      formatNote: "UK e Europa",
      context: original["SC—AH—02"].context,
      curatorialNote: original["SC—AH—02"].curatorialNote,
      researchNotes: original["SC—AH—02"].researchNotes,
    },
    "SC—AH—03": {
      origin: "Bristol, Inglaterra",
      format: "CD, LP duplo",
      context: original["SC—AH—03"].context,
      curatorialNote: original["SC—AH—03"].curatorialNote,
    },
    "SC—SF—04": {
      origin: "Versalhes, Île-de-France, França",
      format: "CD, LP",
      credits: {
        abbeyRoad: "Abbey Road Studios, Londres",
        strings: "cordas",
      },
      context: original["SC—SF—04"].context,
      curatorialNote: original["SC—SF—04"].curatorialNote,
    },
    "SC—SF—05": {
      origin: "Nova York, EUA",
      originNote: "Local de nascimento",
      format: "CD, LP duplo, cassete, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Estúdio caseiro de Moby, Mott Street, Manhattan",
      },
      context: original["SC—SF—05"].context,
      curatorialNote: original["SC—SF—05"].curatorialNote,
    },
    "SC—SF—06": {
      origin: "Londres, Inglaterra",
      format: "CD, LP duplo, cassete",
      formatNote: "UK",
      context: original["SC—SF—06"].context,
      curatorialNote: original["SC—SF—06"].curatorialNote,
    },
    "SC—CF—07": {
      origin: "Davis, Califórnia, EUA",
      format: "CD, LP duplo",
      credits: {
        mixing: "mixagem",
      },
      context: original["SC—CF—07"].context,
      curatorialNote: original["SC—CF—07"].curatorialNote,
    },
    "SC—CF—08": {
      origin: "Manchester, Inglaterra",
      format: "CD, LP duplo",
      context: original["SC—CF—08"].context,
      curatorialNote: original["SC—CF—08"].curatorialNote,
    },
    "SC—CF—09": {
      origin: "Bromley, Kent, Inglaterra",
      originNote: "Local de nascimento",
      format: "CD, LP duplo, cassete, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Estúdio caseiro, Brighton",
      },
      context: original["SC—CF—09"].context,
      curatorialNote: original["SC—CF—09"].curatorialNote,
    },
    "SC—AS—10": {
      origin: "Abingdon, Oxfordshire, Inglaterra",
      format: "CD, LP duplo, cassete, MiniDisc",
      credits: {
        stCatherinesCourt: "St Catherine's Court, perto de Bath",
      },
      context: original["SC—AS—10"].context,
      curatorialNote: original["SC—AS—10"].curatorialNote,
      researchNotes: original["SC—AS—10"].researchNotes,
    },
    "SC—AS—11": {
      origin: "Londres, Inglaterra",
      format: "CD, LP",
      formatNote: "LP: prensagem dos EUA",
      curatorialNote: original["SC—AS—11"].curatorialNote,
    },
    "SC—AS—12": {
      origin: "Londres, Inglaterra",
      format: "CD, LP duplo",
      credits: {
        bass: "baixo",
      },
      context: original["SC—AS—12"].context,
      curatorialNote: original["SC—AS—12"].curatorialNote,
    },
  },
};
