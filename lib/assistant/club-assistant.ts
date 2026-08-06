import "server-only";

import { getAvailableSeasons, getPlayerSeasonStats } from "../player-statistics";
import { createClient } from "../supabase/server";

const CLUB_TERM = "middelich-resse";

type MatchRow = {
  id: string;
  competition: string;
  matchday: string | null;
  season: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

type StandingRow = {
  position: number;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  is_club: boolean;
};

export type ClubAssistantAnswer = {
  title: string;
  text: string;
  details?: string[];
  link?: {
    href: string;
    label: string;
  };
  mode: "data" | "template" | "notice";
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isClub(team: string) {
  return normalize(team).includes(CLUB_TERM);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function matchScore(match: MatchRow) {
  return `${match.home_score ?? 0}:${match.away_score ?? 0}`;
}

function ourResult(match: MatchRow) {
  const home = match.home_score ?? 0;
  const away = match.away_score ?? 0;
  const ours = isClub(match.home_team) ? home : away;
  const theirs = isClub(match.home_team) ? away : home;

  if (ours > theirs) return "S";
  if (ours < theirs) return "N";
  return "U";
}

function opponent(match: MatchRow) {
  return isClub(match.home_team) ? match.away_team : match.home_team;
}

function includesAny(question: string, words: string[]) {
  return words.some((word) => question.includes(word));
}

function createResultPost(match: MatchRow) {
  const home = match.home_score ?? 0;
  const away = match.away_score ?? 0;
  const ours = isClub(match.home_team) ? home : away;
  const theirs = isClub(match.home_team) ? away : home;
  const result =
    ours > theirs
      ? "Unsere Jungs holen sich den Sieg!"
      : ours < theirs
        ? "Dieses Mal hat es leider nicht für Punkte gereicht."
        : "Am Ende teilen wir uns die Punkte.";

  return `ABPFIFF! 🔴⚫

${match.home_team} ${home}:${away} ${match.away_team}

${result} Die Mannschaft hat bis zum Schluss alles gegeben und als Einheit gekämpft.

Gemeinsam weiter – die Middelicher sind da!

#HUJA #MiddelichResse #DieMiddelicherSindDa #Endstand`;
}

export async function answerClubQuestion(
  rawQuestion: string,
): Promise<ClubAssistantAnswer> {
  const question = normalize(rawQuestion);

  if (!question) {
    return {
      title: "Stell mir eine Frage",
      text: "Zum Beispiel: Wann ist unser nächstes Auswärtsspiel oder wer ist aktuell bester Torschütze?",
      mode: "notice",
    };
  }

  const supabase = await createClient();
  const seasons = await getAvailableSeasons();
  const selectedSeason = seasons[0] ?? "2026/27";

  const [matchesResult, standingsResult, playerStats] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id,competition,matchday,season,home_team,away_team,match_date,location,home_score,away_score,status",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: true }),
    supabase
      .from("standings")
      .select(
        "position,team_name,played,wins,draws,losses,goals_for,goals_against,points,is_club",
      )
      .order("position", { ascending: true }),
    getPlayerSeasonStats(selectedSeason),
  ]);

  const matches = (matchesResult.data ?? []) as MatchRow[];
  const standings = (standingsResult.data ?? []) as StandingRow[];
  const now = Date.now();
  const upcoming = matches.filter(
    (match) =>
      match.status === "scheduled" &&
      new Date(match.match_date).getTime() >= now,
  );
  const finished = matches
    .filter((match) => match.status === "finished")
    .sort(
      (a, b) =>
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime(),
    );

  if (
    includesAny(question, [
      "zuschauer",
      "zuschauerschnitt",
      "durchschnittlich zuschauer",
    ])
  ) {
    return {
      title: "Zuschauerzahlen fehlen noch",
      text: "In der Datenbank werden aktuell keine Zuschauerzahlen pro Spiel gespeichert. Deshalb kann ich keinen belastbaren Durchschnitt berechnen.",
      details: [
        "Sobald wir ein Feld für Zuschauer pro Spiel ergänzen, kann der Assistent den Schnitt automatisch berechnen.",
      ],
      mode: "notice",
    };
  }

  if (
    includesAny(question, [
      "gesperrt",
      "sperre",
      "fehlt wegen karten",
      "karten sperre",
    ])
  ) {
    const cardLeaders = playerStats
      .filter((player) => player.yellowCards || player.redCards)
      .sort(
        (a, b) =>
          b.redCards * 10 +
          b.yellowCards -
          (a.redCards * 10 + a.yellowCards),
      )
      .slice(0, 5);

    return {
      title: "Kartenübersicht",
      text: "Eine sichere Sperrenberechnung ist noch nicht möglich, weil Sperrregeln und bereits verbüßte Sperren nicht vollständig gespeichert werden.",
      details: cardLeaders.length
        ? cardLeaders.map(
            (player) =>
              `${player.firstName} ${player.lastName}: ${player.yellowCards} Gelb, ${player.redCards} Rot`,
          )
        : ["Aktuell sind keine Karten für die Saison gespeichert."],
      link: {
        href: "/admin/trainer",
        label: "Trainercockpit öffnen",
      },
      mode: "notice",
    };
  }

  if (
    includesAny(question, [
      "nachstes auswartsspiel",
      "nächstes auswärtsspiel",
      "auswartsspiel",
      "auswärts spielen",
    ])
  ) {
    const match = upcoming.find((entry) => !isClub(entry.home_team));

    if (!match) {
      return {
        title: "Kein Auswärtsspiel gefunden",
        text: "Aktuell ist kein zukünftiges Auswärtsspiel eingetragen.",
        mode: "data",
      };
    }

    return {
      title: "Nächstes Auswärtsspiel",
      text: `${formatDate(match.match_date)} bei ${match.home_team}.`,
      details: [
        match.competition,
        match.matchday ?? "Spieltag noch offen",
        match.location ?? "Spielort noch nicht hinterlegt",
      ],
      link: {
        href: `/match-center/${match.id}`,
        label: "Match-Center öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "nachstes heimspiel",
      "nächstes heimspiel",
      "heimspiel",
      "zu hause",
    ])
  ) {
    const match = upcoming.find((entry) => isClub(entry.home_team));

    if (!match) {
      return {
        title: "Kein Heimspiel gefunden",
        text: "Aktuell ist kein zukünftiges Heimspiel eingetragen.",
        mode: "data",
      };
    }

    return {
      title: "Nächstes Heimspiel",
      text: `${formatDate(match.match_date)} gegen ${match.away_team}.`,
      details: [
        match.competition,
        match.matchday ?? "Spieltag noch offen",
        match.location ?? "Spielort noch nicht hinterlegt",
      ],
      link: {
        href: `/match-center/${match.id}`,
        label: "Match-Center öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "nachstes spiel",
      "nächstes spiel",
      "wann spielen wir",
      "kommendes spiel",
    ])
  ) {
    const match = upcoming[0];

    if (!match) {
      return {
        title: "Kein nächstes Spiel",
        text: "Aktuell ist kein zukünftiges Spiel in der Datenbank eingetragen.",
        mode: "data",
      };
    }

    return {
      title: "Nächstes Spiel",
      text: `${match.home_team} gegen ${match.away_team} am ${formatDate(match.match_date)}.`,
      details: [
        match.competition,
        match.matchday ?? "Spieltag noch offen",
        match.location ?? "Spielort noch nicht hinterlegt",
      ],
      link: {
        href: `/match-center/${match.id}`,
        label: "Match-Center öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "tabelle",
      "tabellenplatz",
      "welcher platz",
      "wie stehen wir",
    ])
  ) {
    const row =
      standings.find((entry) => entry.is_club) ??
      standings.find((entry) => isClub(entry.team_name));

    if (!row) {
      return {
        title: "Noch kein Tabellenstand",
        text: "Für die aktuelle Saison wurde noch keine passende Tabellenzeile gefunden.",
        link: {
          href: "/tabelle",
          label: "Tabelle öffnen",
        },
        mode: "data",
      };
    }

    return {
      title: `Tabellenplatz ${row.position}`,
      text: `${row.team_name} steht mit ${row.points} Punkten auf Platz ${row.position}.`,
      details: [
        `${row.played} Spiele`,
        `${row.wins} Siege, ${row.draws} Unentschieden, ${row.losses} Niederlagen`,
        `${row.goals_for}:${row.goals_against} Tore`,
      ],
      link: {
        href: "/tabelle",
        label: "Komplette Tabelle öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "bester torschutze",
      "bester torschütze",
      "meisten tore",
      "torjager",
      "torjäger",
    ])
  ) {
    const top = playerStats
      .filter((player) => player.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 5);

    return {
      title: "Beste Torschützen",
      text: top.length
        ? `${top[0].firstName} ${top[0].lastName} führt mit ${top[0].goals} Toren.`
        : "Für die aktuelle Saison wurden noch keine Tore Spielern zugeordnet.",
      details: top.map(
        (player, index) =>
          `${index + 1}. ${player.firstName} ${player.lastName} – ${player.goals} Tore`,
      ),
      link: {
        href: "/statistiken",
        label: "Statistiken öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "meisten vorlagen",
      "bester vorlagengeber",
      "assists",
      "vorlagen",
    ])
  ) {
    const top = playerStats
      .filter((player) => player.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, 5);

    return {
      title: "Beste Vorlagengeber",
      text: top.length
        ? `${top[0].firstName} ${top[0].lastName} führt mit ${top[0].assists} Vorlagen.`
        : "Für die aktuelle Saison wurden noch keine Vorlagen zugeordnet.",
      details: top.map(
        (player, index) =>
          `${index + 1}. ${player.firstName} ${player.lastName} – ${player.assists} Vorlagen`,
      ),
      link: {
        href: "/statistiken",
        label: "Statistiken öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "meisten einsatze",
      "meisten einsätze",
      "einsatzzeiten",
      "meisten minuten",
    ])
  ) {
    const top = playerStats
      .slice()
      .sort((a, b) => b.minutes - a.minutes || b.appearances - a.appearances)
      .slice(0, 5);

    return {
      title: "Meiste Einsatzzeit",
      text: top.length
        ? `${top[0].firstName} ${top[0].lastName} führt mit ${top[0].minutes} Minuten.`
        : "Es sind noch keine Einsatzzeiten gespeichert.",
      details: top.map(
        (player, index) =>
          `${index + 1}. ${player.firstName} ${player.lastName} – ${player.minutes} Minuten / ${player.appearances} Einsätze`,
      ),
      link: {
        href: "/admin/trainer",
        label: "Trainercockpit öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "letzten 5",
      "letzte funf",
      "letzte fünf",
      "form",
      "bilanz",
    ])
  ) {
    const recent = finished.slice(0, 5);
    const wins = recent.filter((match) => ourResult(match) === "S").length;
    const draws = recent.filter((match) => ourResult(match) === "U").length;
    const losses = recent.filter((match) => ourResult(match) === "N").length;

    return {
      title: "Form der letzten Spiele",
      text: recent.length
        ? `In den letzten ${recent.length} Spielen gab es ${wins} Siege, ${draws} Unentschieden und ${losses} Niederlagen.`
        : "Es sind noch keine beendeten Spiele gespeichert.",
      details: recent.map(
        (match) =>
          `${ourResult(match)} · ${match.home_team} ${matchScore(match)} ${match.away_team}`,
      ),
      link: {
        href: "/spielplan",
        label: "Spielplan öffnen",
      },
      mode: "data",
    };
  }

  if (
    includesAny(question, [
      "instagram",
      "facebook post",
      "social media text",
      "beitrag schreiben",
      "post schreiben",
    ])
  ) {
    const match = finished[0];

    if (!match) {
      return {
        title: "Noch kein Endergebnis",
        text: "Für einen Ergebnisbeitrag brauche ich mindestens ein beendetes Spiel.",
        mode: "template",
      };
    }

    return {
      title: "Social-Media-Vorschlag",
      text: createResultPost(match),
      link: {
        href: "/admin/social",
        label: "Social Studio öffnen",
      },
      mode: "template",
    };
  }

  const mentionedPlayer = playerStats.find((player) => {
    const fullName = normalize(`${player.firstName} ${player.lastName}`);
    const lastName = normalize(player.lastName);
    return (
      fullName.length > 3 &&
      (question.includes(fullName) ||
        (lastName.length > 3 && question.includes(lastName)))
    );
  });

  if (mentionedPlayer) {
    return {
      title: `${mentionedPlayer.firstName} ${mentionedPlayer.lastName}`,
      text: `Saison ${selectedSeason}: ${mentionedPlayer.appearances} Einsätze und ${mentionedPlayer.minutes} Minuten.`,
      details: [
        `${mentionedPlayer.goals} Tore`,
        `${mentionedPlayer.assists} Vorlagen`,
        `${mentionedPlayer.yellowCards} Gelbe Karten`,
        `${mentionedPlayer.redCards} Rote Karten`,
        `${mentionedPlayer.playerOfMatch}× Spieler des Spiels`,
      ],
      link: {
        href: `/team/${mentionedPlayer.slug}`,
        label: "Spielerprofil öffnen",
      },
      mode: "data",
    };
  }

  return {
    title: "Das kann ich bereits beantworten",
    text: "Ich greife direkt auf eure Vereinsdaten zu. Formuliere die Frage am besten mit einem der folgenden Themen:",
    details: [
      "Nächstes Spiel, Heimspiel oder Auswärtsspiel",
      "Tabellenplatz",
      "Torschützen, Vorlagen oder Einsatzzeiten",
      "Form der letzten fünf Spiele",
      "Statistik zu einem Spielernamen",
      "Social-Media-Text zum letzten Ergebnis",
      "Kartenübersicht",
    ],
    mode: "notice",
  };
}
