import "server-only";

import type {
  FinalizerEvent,
  FinalizerMatch,
  FinalizerPlayer,
  GeneratedMatchDayOutput,
} from "../match-day-finalizer";

type AiContext = {
  match: FinalizerMatch;
  events: FinalizerEvent[];
  players: FinalizerPlayer[];
  fallback: GeneratedMatchDayOutput;
  seasonInsights?: string[];
};

export type AiGenerationResult = {
  output: GeneratedMatchDayOutput;
  generatedByAi: boolean;
  model: string | null;
  error: string | null;
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    report: { type: "string" },
    instagramText: { type: "string" },
    facebookText: { type: "string" },
    whatsappText: { type: "string" },
    pressText: { type: "string" },
    graphicHeadline: { type: "string" },
  },
  required: [
    "title",
    "excerpt",
    "report",
    "instagramText",
    "facebookText",
    "whatsappText",
    "pressText",
    "graphicHeadline",
  ],
} as const;

function playerName(id: string | null, players: FinalizerPlayer[]) {
  if (!id) return null;
  const player = players.find((item) => item.id === id);
  return player ? `${player.first_name} ${player.last_name}` : null;
}

function buildFacts(context: AiContext) {
  const { match, events, players } = context;
  return {
    verein: "SpVgg Middelich-Resse",
    vereinsmotto: "HUJA – die Middelicher sind da!",
    wettbewerb: match.competition,
    spieltag: match.matchday,
    saison: match.season,
    heimteam: match.home_team,
    gastteam: match.away_team,
    heimtore: match.home_score ?? 0,
    gasttore: match.away_score ?? 0,
    spielminuteBeiAbpfiff: match.current_minute ?? 90,
    spielerDesSpiels: playerName(match.player_of_match_id, players),
    ereignisse: events
      .slice()
      .sort((a, b) => a.minute - b.minute)
      .map((event) => ({
        typ: event.event_type,
        minute: event.minute,
        spieler: playerName(event.player_id, players),
        zweiterSpieler: playerName(event.secondary_player_id, players),
        beschreibung: event.description,
      })),
    saisonHinweise: context.seasonInsights ?? [],
  };
}

function mergeWithFallback(
  parsed: Partial<GeneratedMatchDayOutput>,
  fallback: GeneratedMatchDayOutput,
): GeneratedMatchDayOutput {
  return {
    title: parsed.title?.trim() || fallback.title,
    excerpt: parsed.excerpt?.trim() || fallback.excerpt,
    report: parsed.report?.trim() || fallback.report,
    instagramText:
      parsed.instagramText?.trim() || fallback.instagramText,
    facebookText: parsed.facebookText?.trim() || fallback.facebookText,
    whatsappText: parsed.whatsappText?.trim() || fallback.whatsappText,
    pressText: parsed.pressText?.trim() || fallback.pressText,
    graphicHeadline:
      parsed.graphicHeadline?.trim().toUpperCase().slice(0, 28) ||
      fallback.graphicHeadline,
    summary: fallback.summary,
  };
}

export async function generateAiMatchDayOutput(
  context: AiContext,
): Promise<AiGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  if (!apiKey) {
    return {
      output: context.fallback,
      generatedByAi: false,
      model: null,
      error: "OPENAI_API_KEY fehlt – regelbasierter Entwurf wurde verwendet.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: [
          "Du bist der offizielle Medienassistent der SpVgg Middelich-Resse.",
          "Schreibe auf Deutsch, emotional, glaubwürdig und vereinsnah.",
          "Verwende ausschließlich die gelieferten Fakten. Erfinde keine Spielszenen, Chancen, Zuschauerzahlen, Wetterdaten, Zitate oder Tabellenplätze.",
          "Wenn nur wenige Ereignisse gepflegt sind, formuliere bewusst allgemein und transparent.",
          "Der Website-Spielbericht soll 4 bis 7 kurze Absätze enthalten.",
          "Instagram darf Emojis und passende Hashtags enthalten, Facebook etwas ausführlicher, WhatsApp sehr kompakt und der Pressetext sachlicher.",
          "Das Vereinsmotto darf passend verwendet werden, aber nicht übertrieben oft.",
          "Gib ausschließlich das angeforderte strukturierte JSON zurück.",
        ].join("\n"),
        input: JSON.stringify(buildFacts(context), null, 2),
        text: {
          format: {
            type: "json_schema",
            name: "middelich_matchday_content",
            strict: true,
            schema,
          },
        },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI ${response.status}: ${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };

    const outputText =
      data.output_text ||
      data.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")?.text;

    if (!outputText) throw new Error("Die KI hat keinen Text zurückgegeben.");

    const parsed = JSON.parse(outputText) as Partial<GeneratedMatchDayOutput>;

    return {
      output: mergeWithFallback(parsed, context.fallback),
      generatedByAi: true,
      model,
      error: null,
    };
  } catch (error) {
    return {
      output: context.fallback,
      generatedByAi: false,
      model,
      error:
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler bei der KI-Erstellung.",
    };
  }
}
