import "server-only";

import {
  createMatchDayOutput,
  type FinalizerEvent,
  type FinalizerMatch,
  type FinalizerPlayer,
} from "../match-day-finalizer";

export type MediaCenterPackage = {
  instagram: string;
  facebook: string;
  whatsapp: string;
  homepageTitle: string;
  homepageExcerpt: string;
  homepageReport: string;
  pressRelease: string;
  reelScript: string;
  storySlides: string[];
  graphicHeadlines: {
    result: string;
    playerOfMatch: string;
    scorers: string;
    table: string;
  };
  hashtags: string[];
};

type GenerateInput = {
  match: FinalizerMatch;
  events: FinalizerEvent[];
  players: FinalizerPlayer[];
  tone: string;
  extraNote?: string;
};

type Scenario =
  | "big_win"
  | "win"
  | "draw"
  | "narrow_loss"
  | "heavy_loss";

type MatchFacts = {
  isHome: boolean;
  ourTeam: string;
  opponent: string;
  ourScore: number;
  opponentScore: number;
  score: string;
  goalDifference: number;
  scenario: Scenario;
  isCleanSheet: boolean;
  isHighScoring: boolean;
  isCup: boolean;
  isDerby: boolean;
  isFloodlight: boolean;
  scorers: string[];
  assists: string[];
  cards: string[];
  substitutions: string[];
  playerOfMatch: string;
};

const CLUB_MARKERS = ["middelich-resse", "middelich resse"];

export async function generateMediaCenterPackage(
  input: GenerateInput,
): Promise<{
  source: "fallback";
  model: null;
  package: MediaCenterPackage;
}> {
  return {
    source: "fallback",
    model: null,
    package: createHujaPackage(input),
  };
}

function createHujaPackage(input: GenerateInput): MediaCenterPackage {
  const base = createMatchDayOutput(input.match, input.events, input.players);
  const facts = collectFacts(input);
  const tone = normalizeTone(input.tone);
  const opening = buildOpening(facts, tone);
  const body = buildBody(facts, input.extraNote);
  const closing = buildClosing(facts, tone);
  const hashtags = buildHashtags(facts);

  const instagram = [
    opening,
    "",
    body,
    "",
    closing,
    "",
    hashtags.join(" "),
  ].join("\n");

  const facebook = [
    buildHeadline(facts),
    "",
    body,
    "",
    buildLongClosing(facts, tone),
    "",
    hashtags.slice(0, 6).join(" "),
  ].join("\n");

  const whatsapp = [
    `🔴⚫ ${buildHeadline(facts)}`,
    `${facts.ourTeam} ${facts.ourScore}:${facts.opponentScore} ${facts.opponent}`,
    facts.scorers.length ? `⚽ Tore: ${facts.scorers.join(", ")}` : null,
    `HUJA – die Middelicher sind da!`,
  ]
    .filter(Boolean)
    .join("\n");

  const homepageTitle = buildHomepageTitle(facts);
  const homepageExcerpt = buildHomepageExcerpt(facts);
  const homepageReport = buildHomepageReport(facts, input.match, input.extraNote);
  const pressRelease = buildPressRelease(facts, input.match);
  const reelScript = buildReelScript(facts);
  const storySlides = buildStorySlides(facts);

  return {
    instagram,
    facebook,
    whatsapp,
    homepageTitle,
    homepageExcerpt,
    homepageReport,
    pressRelease,
    reelScript,
    storySlides,
    graphicHeadlines: {
      result: buildGraphicHeadline(facts),
      playerOfMatch: "SPIELER DES SPIELS",
      scorers: facts.scorers.length ? "UNSERE TORSCHÜTZEN" : "TEAMLEISTUNG",
      table: facts.scenario === "win" || facts.scenario === "big_win"
        ? "DREI PUNKTE. EIN TEAM."
        : "UNSERE LIGA. UNSER WEG.",
    },
    hashtags,
  };
}

function collectFacts(input: GenerateInput): MatchFacts {
  const playerMap = new Map(
    input.players.map((player) => [
      player.id,
      `${player.first_name} ${player.last_name}`,
    ]),
  );

  const homeIsClub = isClub(input.match.home_team);
  const ourTeam = homeIsClub ? input.match.home_team : input.match.away_team;
  const opponent = homeIsClub ? input.match.away_team : input.match.home_team;
  const ourScore = homeIsClub
    ? input.match.home_score ?? 0
    : input.match.away_score ?? 0;
  const opponentScore = homeIsClub
    ? input.match.away_score ?? 0
    : input.match.home_score ?? 0;
  const goalDifference = ourScore - opponentScore;

  const scenario: Scenario =
    goalDifference >= 3
      ? "big_win"
      : goalDifference > 0
        ? "win"
        : goalDifference === 0
          ? "draw"
          : goalDifference === -1
            ? "narrow_loss"
            : "heavy_loss";

  const scorers = input.events
    .filter((event) => event.event_type === "goal")
    .map((event) => {
      const player =
        (event.player_id && playerMap.get(event.player_id)) ||
        event.description ||
        "Middelich-Resse";
      return `${event.minute}' ${player}`;
    });

  const assists = input.events
    .filter(
      (event) =>
        event.event_type === "goal" && event.secondary_player_id,
    )
    .map((event) => {
      const player =
        event.secondary_player_id &&
        playerMap.get(event.secondary_player_id);
      return player ? `${event.minute}' ${player}` : null;
    })
    .filter((value): value is string => Boolean(value));

  const cards = input.events
    .filter((event) =>
      ["yellow_card", "red_card"].includes(event.event_type),
    )
    .map((event) => {
      const player =
        (event.player_id && playerMap.get(event.player_id)) ||
        event.description ||
        "Spieler";
      const card =
        event.event_type === "red_card" ? "Rot" : "Gelb";
      return `${event.minute}' ${card}: ${player}`;
    });

  const substitutions = input.events
    .filter((event) => event.event_type === "substitution")
    .map((event) => event.description || `${event.minute}' Wechsel`);

  const playerOfMatch =
    (input.match.player_of_match_id &&
      playerMap.get(input.match.player_of_match_id)) ||
    "Spieler des Spiels";

  return {
    isHome: homeIsClub,
    ourTeam,
    opponent,
    ourScore,
    opponentScore,
    score: `${ourScore}:${opponentScore}`,
    goalDifference,
    scenario,
    isCleanSheet: opponentScore === 0,
    isHighScoring: ourScore + opponentScore >= 5,
    isCup: /pokal|cup/i.test(input.match.competition ?? ""),
    isDerby: /derby/i.test(
      `${input.match.competition ?? ""} ${opponent}`,
    ),
    isFloodlight: false,
    scorers,
    assists,
    cards,
    substitutions,
    playerOfMatch,
  };
}

function buildOpening(facts: MatchFacts, tone: string) {
  if (facts.scenario === "big_win") {
    return tone === "professionell"
      ? `🔴⚫ Klarer Erfolg für unsere Mannschaft!`
      : `🔥 WAS FÜR EIN AUFTRITT! 🔴⚫`;
  }

  if (facts.scenario === "win") {
    return tone === "locker"
      ? `😎 Drei Punkte eingepackt!`
      : `🔴⚫ SIEG FÜR DIE MIDDELICHER!`;
  }

  if (facts.scenario === "draw") {
    return tone === "kampferisch"
      ? `⚔️ Punkt erkämpft!`
      : `⚖️ Punkteteilung nach intensivem Spiel.`;
  }

  if (facts.scenario === "narrow_loss") {
    return `💔 Bitteres Ende nach engem Spiel.`;
  }

  return `🔴⚫ Heute war mehr drin – wir stehen wieder auf.`;
}

function buildBody(facts: MatchFacts, extraNote?: string) {
  const sentences = [
    `${facts.ourTeam} beendet die Partie gegen ${facts.opponent} mit ${facts.score}.`,
  ];

  if (facts.scenario === "big_win") {
    sentences.push(
      "Unsere Jungs zeigen über die gesamte Partie eine starke Leistung und belohnen sich mit einem deutlichen Ergebnis.",
    );
  } else if (facts.scenario === "win") {
    sentences.push(
      "Einsatz, Zusammenhalt und Wille stimmen bis zur letzten Minute.",
    );
  } else if (facts.scenario === "draw") {
    sentences.push(
      "Am Ende steht ein Punkt, für den die Mannschaft gemeinsam gearbeitet hat.",
    );
  } else if (facts.scenario === "narrow_loss") {
    sentences.push(
      "Die Mannschaft bleibt bis zum Schluss im Spiel, wird für ihren Aufwand aber nicht belohnt.",
    );
  } else {
    sentences.push(
      "Das Ergebnis tut weh, aber der Blick geht nach vorne.",
    );
  }

  if (facts.isCleanSheet && facts.ourScore > 0) {
    sentences.push("Hinten steht die Null – vorne werden die Chancen genutzt.");
  }

  if (facts.scorers.length) {
    sentences.push(`Unsere Tore: ${facts.scorers.join(", ")}.`);
  }

  if (facts.playerOfMatch !== "Spieler des Spiels") {
    sentences.push(`⭐ Spieler des Spiels: ${facts.playerOfMatch}.`);
  }

  if (extraNote) {
    sentences.push(extraNote.trim());
  }

  return sentences.join(" ");
}

function buildClosing(facts: MatchFacts, tone: string) {
  if (facts.scenario === "win" || facts.scenario === "big_win") {
    return tone === "kampferisch"
      ? "Weiter immer weiter – gemeinsam für Middelich-Resse!"
      : "Danke für eure Unterstützung! HUJA – die Middelicher sind da!";
  }

  if (facts.scenario === "draw") {
    return "Wir nehmen den Punkt mit und arbeiten weiter. HUJA!";
  }

  return "Wir stehen zusammen, wir arbeiten weiter, wir kommen zurück. HUJA!";
}

function buildLongClosing(facts: MatchFacts, tone: string) {
  const base = buildClosing(facts, tone);
  return `${base} Der nächste Termin wird wieder gemeinsam angegangen.`;
}

function buildHeadline(facts: MatchFacts) {
  if (facts.scenario === "big_win") return `KANtersieg gegen ${facts.opponent}`.replace("KANter", "Kanter");
  if (facts.scenario === "win") return `Drei Punkte gegen ${facts.opponent}`;
  if (facts.scenario === "draw") return `Punkteteilung gegen ${facts.opponent}`;
  if (facts.scenario === "narrow_loss") return `Knappe Niederlage gegen ${facts.opponent}`;
  return `Niederlage gegen ${facts.opponent}`;
}

function buildHomepageTitle(facts: MatchFacts) {
  if (facts.scenario === "big_win") {
    return `${facts.ourTeam} feiert deutlichen ${facts.score}-Erfolg`;
  }
  if (facts.scenario === "win") {
    return `${facts.ourTeam} gewinnt ${facts.score} gegen ${facts.opponent}`;
  }
  if (facts.scenario === "draw") {
    return `${facts.ourTeam} trennt sich ${facts.score} von ${facts.opponent}`;
  }
  return `${facts.ourTeam} unterliegt ${facts.opponent} mit ${facts.score}`;
}

function buildHomepageExcerpt(facts: MatchFacts) {
  if (facts.scenario === "big_win") {
    return "Ein geschlossener Auftritt, viele Tore und ein verdienter Erfolg.";
  }
  if (facts.scenario === "win") {
    return "Die Mannschaft belohnt sich für einen engagierten Auftritt mit drei Punkten.";
  }
  if (facts.scenario === "draw") {
    return "Nach einer umkämpften Partie teilen sich beide Mannschaften die Punkte.";
  }
  return "Die Mannschaft kämpft bis zum Schluss, muss sich am Ende aber geschlagen geben.";
}

function buildHomepageReport(
  facts: MatchFacts,
  match: FinalizerMatch,
  extraNote?: string,
) {
  const paragraphs = [
    `Am ${match.matchday ? `${match.matchday}. Spieltag` : "Spieltag"} traf ${facts.ourTeam} im Rahmen von ${match.competition ?? "dem Wettbewerb"} auf ${facts.opponent}. Am Ende stand ein ${facts.score}.`,
  ];

  if (facts.scorers.length) {
    paragraphs.push(
      `Für Middelich-Resse trafen ${facts.scorers.join(", ")}.`,
    );
  }

  if (facts.assists.length) {
    paragraphs.push(`Vorlagen: ${facts.assists.join(", ")}.`);
  }

  if (facts.cards.length) {
    paragraphs.push(`Karten: ${facts.cards.join(", ")}.`);
  }

  if (facts.substitutions.length) {
    paragraphs.push(
      `Wechsel: ${facts.substitutions.join(", ")}.`,
    );
  }

  paragraphs.push(buildHomepageExcerpt(facts));

  if (extraNote) {
    paragraphs.push(extraNote.trim());
  }

  paragraphs.push("HUJA – die Middelicher sind da!");

  return paragraphs.join("\n\n");
}

function buildPressRelease(facts: MatchFacts, match: FinalizerMatch) {
  return [
    buildHomepageTitle(facts),
    "",
    `${facts.ourTeam} hat die Begegnung gegen ${facts.opponent} mit ${facts.score} beendet.`,
    `Die Partie fand im Rahmen von ${match.competition ?? "des laufenden Wettbewerbs"} statt.`,
    facts.scorers.length
      ? `Die Treffer für Middelich-Resse erzielten ${facts.scorers.join(", ")}.`
      : null,
    `${buildHomepageExcerpt(facts)} Der Verein bedankt sich bei allen Unterstützern.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildReelScript(facts: MatchFacts) {
  return [
    "Szene 1: Vereinslogo mit Rauch und Text „ABPFIFF“",
    `Szene 2: ${facts.ourTeam} ${facts.score} ${facts.opponent}`,
    facts.scorers.length
      ? `Szene 3: Torschützen einblenden – ${facts.scorers.join(", ")}`
      : "Szene 3: Mannschaft und Spielemotionen",
    `Szene 4: Spieler des Spiels – ${facts.playerOfMatch}`,
    facts.scenario === "win" || facts.scenario === "big_win"
      ? "Szene 5: Jubel und Text „DREI PUNKTE“"
      : "Szene 5: Zusammenhalt und Blick nach vorne",
    "Szene 6: HUJA – die Middelicher sind da!",
  ].join("\n");
}

function buildStorySlides(facts: MatchFacts) {
  return [
    "ABPFIFF",
    `${facts.ourTeam}\n${facts.score}\n${facts.opponent}`,
    facts.scorers.length
      ? `UNSERE TORE\n${facts.scorers.join("\n")}`
      : buildHomepageExcerpt(facts),
    `⭐ ${facts.playerOfMatch}\nHUJA – die Middelicher sind da!`,
  ];
}

function buildGraphicHeadline(facts: MatchFacts) {
  if (facts.scenario === "big_win") return "STATEMENT GESETZT";
  if (facts.scenario === "win") return "DREI PUNKTE";
  if (facts.scenario === "draw") return "PUNKT MITGENOMMEN";
  if (facts.scenario === "narrow_loss") return "BITTER BIS ZUM SCHLUSS";
  return "WIR KOMMEN ZURÜCK";
}

function buildHashtags(facts: MatchFacts) {
  const hashtags = [
    "#HUJA",
    "#MiddelichResse",
    "#DieMiddelicherSindDa",
    "#Amateurfußball",
  ];

  if (facts.scenario === "win" || facts.scenario === "big_win") {
    hashtags.push("#Sieg", "#DreiPunkte");
  } else if (facts.scenario === "draw") {
    hashtags.push("#Punktgewinn");
  } else {
    hashtags.push("#GemeinsamWeiter");
  }

  if (facts.isHome) hashtags.push("#Heimspiel");
  else hashtags.push("#Auswärtsspiel");

  if (facts.isCup) hashtags.push("#Pokal");
  if (facts.isDerby) hashtags.push("#Derby");
  if (facts.isCleanSheet && facts.ourScore > 0) hashtags.push("#ZuNull");

  return hashtags;
}

function normalizeTone(value: string) {
  return ["emotional", "professionell", "kampferisch", "locker"].includes(value)
    ? value
    : "emotional";
}

function isClub(name: string) {
  const normalized = name.toLowerCase().replace(/[-_]/g, " ");
  return CLUB_MARKERS.some((marker) => normalized.includes(marker.replace("-", " ")));
}
