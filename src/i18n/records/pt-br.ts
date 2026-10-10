import type { RecordTexts } from "../records";

/**
 * RECORD TEXTS, BRAZILIAN PORTUGUESE — what the 12 record files say, in the
 * shape the English record texts set (./en.ts, ../records.ts).
 *
 * Written whole: the short fields (who did what, editions, track notes,
 * origin, format, the credits that are a description) and the long ones —
 * the documented history, the curatorial note, the notes on the research.
 * The history is a translation of the English, paragraph for paragraph: the
 * same facts, dates and figures, nothing added, and nothing written where the
 * English has nothing (a record whose context is pending has none here).
 *
 * Being written does not make the language published: it stays "in-progress"
 * (../locales.ts) until it has been read and released.
 *
 * Names of records, artists, tracks, films, studios, labels and prizes stay as
 * they are, being data and not wording; so do formats' own names (CD, LP,
 * MiniDisc) and "UK", a code beside a format as it is beside a date.
 */
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
      context: [
        "O Portishead tomou forma em torno do Coach House Studios, em Bristol. Geoff Barrow trabalhava ali como assistente de estúdio enquanto o Massive Attack gravava Blue Lines, em 1991, e recebeu horas de estúdio para o próprio material; no mesmo ano, conheceu a cantora Beth Gibbons. O guitarrista Adrian Utley e o engenheiro de som Dave McDonald completaram o grupo de trabalho.",
        "Em vez de samplear apenas discos alheios, a banda gravou as próprias sessões, mandou cortá-las em vinil e depois sampleou as gravações desgastadas, em busca do grão das gravações antigas. A capa é um fotograma de Gibbons em To Kill a Dead Man, o curta-metragem em preto e branco que a banda realizou e musicou em 1994. Dummy foi lançado em agosto de 1994 e mais tarde venceu o Mercury Music Prize.",
      ],
      curatorialNote:
        "Arquivado em primeiro lugar porque define a luz da gaveta inteira: uma lâmpada deixada acesa, um pulso lento sob o piso, uma voz que parece ouvida por acaso, não interpretada.",
      researchNotes: [
        "Duração em suspenso: a referência indica 49:21, as durações das faixas que ela lista somam 48:48 e a edição digital atual tem 49:03.",
      ],
    },
    "SC—AH—02": {
      origin: "Hartlepool, Condado de Durham, Inglaterra",
      format: "Vinil, CD, cassete",
      formatNote: "UK e Europa",
      context: [
        "O Sneaker Pimps começou em Hartlepool com Chris Corner e Liam Howe, que gravavam desde 1992 em um gravador de oito canais no quarto de Howe e lançaram um EP como Line of Flight pelo selo Clean Up em 1993. Em busca de uma voz para o que até então era música instrumental, recrutaram Kelli Dayton depois de ouvi-la cantar em um pub; as canções tinham sido escritas primeiro com Corner cantando, com letras de Ian Pickering.",
        "Becoming X foi lançado primeiro no Reino Unido, em 19 de agosto de 1996. Contrariando as previsões da própria banda, tornou-se um sucesso, e o grupo passou dezoito meses em turnê com o disco.",
      ],
      curatorialNote:
        "A hora em que as luzes da casa se acendem e ninguém quer ir embora ainda. Doce na superfície, algo mais frio por baixo — arquivado aqui por essa dupla exposição.",
      researchNotes: [
        "Duração em suspenso: a referência indica 52:57, as durações das faixas da versão original somam 48:47 e a edição oficial atual tem 46:28, com versões mais curtas de três faixas.",
      ],
    },
    "SC—AH—03": {
      origin: "Bristol, Inglaterra",
      format: "CD, LP duplo",
      context: [
        "Mezzanine nasceu em meio à desintegração do grupo. Neil Davidge, que produziu com o Massive Attack, trabalhou com os três integrantes quase sempre um de cada vez, e descreveu sessões em que um saía da sala quando outro chegava. Mark “Spike” Stent mixou o disco e lembrou que mixagens prontas eram levadas embora e retrabalhadas até virarem partes de outras faixas. Elizabeth Fraser, do Cocteau Twins, canta “Teardrop”; Horace Andy é a outra voz convidada. O título de trabalho era Damaged Goods.",
        "A capa teve direção de arte de Robert Del Naja e Tom Hingston, a partir das fotografias de um besouro-veado feitas por Nick Knight no Museu de História Natural de Londres e combinadas em uma única imagem. O álbum foi lançado em 20 de abril de 1998.",
      ],
      curatorialNote:
        "O objeto mais pesado desta gaveta. Nós o ouvimos como concreto depois da chuva: tetos baixos, corredores longos, o grave chegando um instante antes da sala.",
    },
    "SC—SF—04": {
      origin: "Versalhes, Île-de-France, França",
      format: "CD, LP",
      credits: {
        abbeyRoad: "Abbey Road Studios, Londres",
        strings: "cordas",
      },
      context: [
        "Jean-Benoît Dunckel e Nicolas Godin gravaram Moon Safari em um gravador de oito canais, com instrumentos analógicos dos anos 1970 — Godin disse que os compraram porque eram os instrumentos mais acessíveis disponíveis. As partes de cordas foram gravadas no Abbey Road Studios, em Londres, com o arranjador David Whitaker, e a cantora americana Beth Hirsch canta “All I Need” e “You Make It Easy”. Stéphane Briat foi o engenheiro de som.",
        "O álbum foi lançado em 16 de janeiro de 1998 e chegou ao 6º lugar no Reino Unido e ao 21º na França.",
      ],
      curatorialNote:
        "Plástico em tons claros e luz de tarde. A imagem que o arquivo guarda de um futuro que chegou suavemente, com as janelas abertas e nada de urgente por fazer.",
    },
    "SC—SF—05": {
      origin: "Nova York, EUA",
      originNote: "Local de nascimento",
      format: "CD, LP duplo, cassete, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Estúdio caseiro de Moby, Mott Street, Manhattan",
      },
      context: [
        "Moby fez Play sozinho em seu estúdio caseiro na Mott Street, em Manhattan, com equipamento em sua maior parte de segunda mão. Várias faixas são construídas em torno de vozes sampleadas de Sounds of the South, uma caixa de gravações de campo feitas por Alan Lomax. Warner Bros., Sony e RCA recusaram o disco antes que a V2 ficasse com ele para a América do Norte; a Mute o lançou nos demais territórios em 17 de maio de 1999.",
        "Entrou na parada britânica em 33º lugar e, no início, vendeu devagar. As dezoito faixas acabaram todas licenciadas para uso comercial, e foi assim que muitos ouvintes as escutaram pela primeira vez; o álbum chegou a vender cerca de doze milhões de cópias.",
      ],
      curatorialNote:
        "Um disco de começo de manhã neste arquivo: a cidade pela janela de um trem, o cinza virando branco, a calma chegando antes do dia.",
    },
    "SC—SF—06": {
      origin: "Londres, Inglaterra",
      format: "CD, LP duplo, cassete",
      formatNote: "UK",
      context: [
        "Henry Binns e Sam Hardaker aprenderam o ofício como operadores de fita no RAK Studios, em Londres, trabalhando no próprio material em uma pequena sala de programação nas horas vagas do estúdio. O primeiro trabalho público como Zero 7 foi um remix de “Climbing Up the Walls”, do Radiohead, em 1997, seguido de dois EPs de tiragem limitada.",
        "Simple Things foi lançado no Reino Unido em 23 de abril de 2001 pela Ultimate Dilemma, com vocais de Sia Furler, Sophie Barker e Mozez; Binns disse que Sia entrou no último minuto. O álbum foi finalista do Mercury Music Prize, e uma edição com faixas adicionais saiu nos Estados Unidos em novembro de 2001.",
      ],
      curatorialNote:
        "Arquivado na ponta mais distante da frequência, onde o futuro se torna doméstico: um apartamento silencioso, um disco deixado tocando, a luz atravessando devagar o chão.",
    },
    "SC—CF—07": {
      origin: "Davis, Califórnia, EUA",
      format: "CD, LP duplo",
      credits: {
        mixing: "mixagem",
      },
      context: [
        "Josh Davis construiu Endtroducing..... a partir de discos. Trabalhou com um sampler Akai MPC60 comprado em outubro de 1992, um toca-discos e um gravador Alesis ADAT, recorrendo a vinis encontrados no porão da Rare Records, em Sacramento, onde passara anos conquistando a confiança do dono. O álbum foi mixado no Glue Factory, o estúdio de Dan “the Automator” Nakamura em San Francisco. A fotografia da capa foi tirada na mesma loja de discos.",
        "Foi lançado pelo selo Mo' Wax, de James Lavelle, em setembro de 1996. Em 2001, o Guinness World Records o registrou como o primeiro álbum inteiramente feito de samples.",
      ],
      curatorialNote:
        "Nós o arquivamos mais como um mapa do que como um disco: fragmentos postos em sequência até se lerem como ruas, estações e longos trechos de noite entre elas.",
    },
    "SC—CF—08": {
      origin: "Manchester, Inglaterra",
      format: "CD, LP duplo",
      context: [
        "Dig Your Own Hole foi lançado em 7 de abril de 1997 e chegou ao primeiro lugar no Reino Unido. Trazia dois singles que foram número um no país: “Setting Sun”, cantado por Noel Gallagher, do Oasis, que chegou ao topo no fim de 1996, e “Block Rockin' Beats”.",
        "O disco também viajou: recebeu a certificação de ouro nos Estados Unidos em cinco meses, e “Block Rockin' Beats” ganhou o Grammy de 1998 de Melhor Performance Instrumental de Rock.",
      ],
      curatorialNote:
        "A frequência no volume máximo: sinalização, estrobo, uma multidão se movendo em uma só direção. Arquivado aqui pelo impulso — a cidade como algo que carrega você.",
    },
    "SC—CF—09": {
      origin: "Bromley, Kent, Inglaterra",
      originNote: "Local de nascimento",
      format: "CD, LP duplo, cassete, MiniDisc",
      formatNote: "UK",
      credits: {
        homeStudio: "Estúdio caseiro, Brighton",
      },
      context: [
        "Norman Cook fez seu segundo álbum como Fatboy Slim em casa, em Brighton, com um computador Atari ST e dois samplers Akai S950, ao lado do engenheiro de som Simon Thornton. “Praise You” é construída sobre a voz de Camille Yarbrough, tirada de sua gravação de 1975, “Take Yo' Praise”.",
        "O álbum foi lançado pela Skint em outubro de 1998, entrou na parada britânica em 2º lugar e depois chegou ao 1º. A fotografia da capa foi tirada no Fat People's Festival de 1983, na Virgínia; o homem retratado nunca foi identificado.",
      ],
      curatorialNote:
        "A luz do dia depois de uma noite na rua: intensa, brilhante, levemente delirante. Guardado nesta gaveta pela sensação de uma cidade em movimento, que nunca chega a ficar parada.",
    },
    "SC—AS—10": {
      origin: "Abingdon, Oxfordshire, Inglaterra",
      format: "CD, LP duplo, cassete, MiniDisc",
      credits: {
        stCatherinesCourt: "St Catherine's Court, perto de Bath",
      },
      context: [
        "O Radiohead gravou em St Catherine's Court, uma mansão perto de Bath, de propriedade da atriz Jane Seymour. A banda produziu o disco por conta própria, com Nigel Godrich. A arte foi feita por Stanley Donwood e Thom Yorke em um computador, sob a regra de que nada podia ser apagado.",
        "O álbum saiu no Japão em 21 de maio de 1997 e no Reino Unido em 16 de junho de 1997, onde chegou ao 1º lugar; entrou na Billboard 200, nos Estados Unidos, em 21º lugar.",
      ],
      curatorialNote:
        "Arquivado pela tensão que sustenta entre calma e alarme: as superfícies lisas da tecnologia nova, ouvidas de algum lugar logo atrás do vidro.",
      researchNotes: [
        "Lançado primeiro no Japão, em 21 de maio de 1997; o cartão traz a data do Reino Unido.",
      ],
    },
    "SC—AS—11": {
      origin: "Londres, Inglaterra",
      format: "CD, LP",
      formatNote: "LP: prensagem dos EUA",
      curatorialNote:
        "Impresso transformado em som: padrões que se repetem, linhas limpas, cores aplicadas levemente fora de registro. O disco mais gráfico desta gaveta.",
    },
    "SC—AS—12": {
      origin: "Londres, Inglaterra",
      format: "CD, LP duplo",
      credits: {
        bass: "baixo",
      },
      context: [
        "Psyence Fiction levou três anos para ficar pronto. James Lavelle, que dirigia a Mo' Wax, concebeu o disco e recrutou os convidados; DJ Shadow construiu a música, em grande parte a partir de samples, em um Akai MPC3000, em casa. Jim Abbiss passou então a maior parte de um ano mixando o álbum.",
        "Entre os convidados estão Richard Ashcroft em “Lonely Soul”, Thom Yorke, Mike D, dos Beastie Boys, Badly Drawn Boy em “Nursery Rhyme”, Jason Newsted, do Metallica, no baixo, e Mark Hollis, do Talk Talk, com arranjos de cordas de Wil Malone. O álbum foi lançado pela Mo' Wax em 24 de agosto de 1998.",
      ],
      curatorialNote:
        "Um disco arquivado como um cartaz: marcante, construído em camadas e montado a partir de outros sinais. Encerra o primeiro índice em uma nota de tensão, não de repouso.",
    },
  },
};
