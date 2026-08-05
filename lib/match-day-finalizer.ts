import "server-only";

export type FinalizerMatch = {
  id: string;
  competition: string;
  matchday: string | null;
  season: string | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  current_minute: number | null;
  player_of_match_id: string | null;
  finalized_at: string | null;
};

export type FinalizerEvent = {
  event_type: string;
  minute: number;
  player_id: string | null;
  secondary_player_id: string | null;
  description: string | null;
};

export type FinalizerPlayer = {
  id: string;
  first_name: string;
  last_name: string;
};

export type GeneratedMatchDayOutput = {
  title: string;
  excerpt: string;
  report: string;
  instagramText: string;
  facebookText: string;
  whatsappText: string;
  pressText: string;
  graphicHeadline: string;
  summary: Record<string, unknown>;
};

function isClub(team: string) {
  return team.toLowerCase().includes("middelich");
}

function playerName(
  id: string | null,
  players: Map<string, FinalizerPlayer>,
) {
  if (!id) return null;
  const player = players.get(id);
  return player ? `${player.first_name} ${player.last_name}` : null;
}

function outcome(match: FinalizerMatch) {
  const home = match.home_score ?? 0;
  const away = match.away_score ?? 0;
  const clubHome = isClub(match.home_team);
  const clubGoals = clubHome ? home : away;
  const opponentGoals = clubHome ? away : home;

  if (clubGoals > opponentGoals) return "Sieg";
  if (clubGoals < opponentGoals) return "Niederlage";
  return "Unentschieden";
}

export function createMatchDayOutput(
  match: FinalizerMatch,
  events: FinalizerEvent[],
  players: FinalizerPlayer[],
): GeneratedMatchDayOutput {
  const map = new Map(players.map((player) => [player.id, player]));
  const score = `${match.home_score ?? 0}:${match.away_score ?? 0}`;
  const result = outcome(match);
  const title = `Spielbericht: ${match.home_team} ${score} ${match.away_team}`;
  const goals = events
    .filter((event) => event.event_type === "goal")
    .sort((a, b) => a.minute - b.minute);
  const cards = events.filter((event) =>
    ["yellow_card", "red_card"].includes(event.event_type),
  );
  const substitutions = events.filter(
    (event) => event.event_type === "substitution",
  );

  const clubHome = isClub(match.home_team);
  const clubName = clubHome ? match.home_team : match.away_team;
  const opponent = clubHome ? match.away_team : match.home_team;
  const clubGoals = clubHome ? match.home_score ?? 0 : match.away_score ?? 0;
  const opponentGoals = clubHome ? match.away_score ?? 0 : match.home_score ?? 0;

  const intro =
    result === "Sieg"
      ? `${clubName} gewinnt gegen ${opponent} mit ${clubGoals}:${opponentGoals}. Die Mannschaft belohnte sich nach einem engagierten Auftritt mit drei Punkten.`
      : result === "Niederlage"
        ? `${clubName} muss sich ${opponent} mit ${clubGoals}:${opponentGoals} geschlagen geben. Trotz des Ergebnisses zeigte die Mannschaft bis zum Schluss Einsatz.`
        : `${clubName} und ${opponent} trennen sich ${clubGoals}:${opponentGoals}. In einer umkämpften Partie teilten sich beide Mannschaften die Punkte.`;

  const goalLines = goals.map((event) => {
    const scorer = playerName(event.player_id, map) || event.description || "Gegner";
    const assist = playerName(event.secondary_player_id, map);
    return `${event.minute}'. ${scorer}${assist ? ` (Vorlage: ${assist})` : ""}`;
  });

  const playerOfMatch = playerName(match.player_of_match_id, map);
  const details = goalLines.length
    ? `Die Treffer der Partie: ${goalLines.join(" · ")}.`
    : "Im LiveCenter wurden keine Torschützen hinterlegt.";
  const discipline = cards.length
    ? `${cards.length} Karte${cards.length === 1 ? "" : "n"} und ${substitutions.length} Wechsel wurden im MatchCenter dokumentiert.`
    : `${substitutions.length} Wechsel wurden im MatchCenter dokumentiert.`;
  const award = playerOfMatch
    ? `Zum Spieler des Spiels wurde ${playerOfMatch} gewählt.`
    : "Ein Spieler des Spiels wurde noch nicht ausgewählt.";

  const report = [intro, details, discipline, award, "HUJA – die Middelicher sind da!"]
    .join("\n\n");
  const excerpt = `${result}: ${clubName} ${clubGoals}:${opponentGoals} ${opponent}.`;

  const scorerText = goalLines.length
    ? `\n\n⚽ Tore:\n${goalLines.join("\n")}`
    : "";
  const hashtags = "#HUJA #MiddelichResse #DieMiddelicherSindDa #Endstand";

  const instagramText = `ABPFIFF! 🔴⚫\n\n${match.home_team} ${score} ${match.away_team}\n\n${excerpt}${scorerText}${playerOfMatch ? `\n\n⭐ Spieler des Spiels: ${playerOfMatch}` : ""}\n\n${hashtags}`;
  const facebookText = `🏁 Endstand\n\n${title}\n\n${report}\n\n${hashtags}`;
  const whatsappText = `🏁 Abpfiff: ${match.home_team} ${score} ${match.away_team}. ${excerpt} HUJA! 🔴⚫`;
  const pressText = `${title}\n\n${intro}\n\n${details}\n\n${award}\n\nWettbewerb: ${match.competition}${match.matchday ? `, ${match.matchday}` : ""}.`;

  return {
    title,
    excerpt,
    report,
    instagramText,
    facebookText,
    whatsappText,
    pressText,
    graphicHeadline: result === "Sieg" ? "HEIMSIEG" : result === "Niederlage" ? "ABPFIFF" : "PUNKTETEILUNG",
    summary: {
      result,
      score,
      clubName,
      opponent,
      clubGoals,
      opponentGoals,
      goals: goalLines,
      cards: cards.length,
      substitutions: substitutions.length,
      playerOfMatch,
      season: match.season,
      competition: match.competition,
    },
  };
}

export function createNewsSlug(title: string) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized}-${Date.now()}`;
}
