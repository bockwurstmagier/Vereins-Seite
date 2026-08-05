"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateAiMatchDayOutput } from "../../../lib/ai/match-day-ai";
import { requireRole } from "../../../lib/auth/roles";
import {
  createMatchDayOutput,
  createNewsSlug,
  type FinalizerEvent,
  type FinalizerMatch,
  type FinalizerPlayer,
  type GeneratedMatchDayOutput,
} from "../../../lib/match-day-finalizer";
import { getPlayerSeasonStats } from "../../../lib/player-statistics";
import { sendFulltimePush } from "../../../lib/push/server";
import { createClient } from "../../../lib/supabase/server";

const ROLES = ["administrator", "trainer", "betreuer"] as const;

async function loadMatchDayData(matchId: string) {
  const supabase = await createClient();
  const [matchResult, eventsResult, playersResult, existingOutputResult] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, competition, matchday, season, home_team, away_team, home_score, away_score, current_minute, player_of_match_id, finalized_at",
        )
        .eq("id", matchId)
        .maybeSingle(),
      supabase
        .from("match_events")
        .select(
          "event_type, minute, player_id, secondary_player_id, description",
        )
        .eq("match_id", matchId)
        .order("minute", { ascending: true }),
      supabase.from("players").select("id, first_name, last_name"),
      supabase
        .from("match_day_outputs")
        .select("id, news_id")
        .eq("match_id", matchId)
        .maybeSingle(),
    ]);

  if (matchResult.error || !matchResult.data) {
    throw new Error("Das Spiel konnte nicht geladen werden.");
  }
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (playersResult.error) throw new Error(playersResult.error.message);

  return {
    supabase,
    match: matchResult.data as FinalizerMatch,
    events: (eventsResult.data ?? []) as FinalizerEvent[],
    players: (playersResult.data ?? []) as FinalizerPlayer[],
    existingOutput: existingOutputResult.data,
  };
}

async function buildSeasonInsights(match: FinalizerMatch) {
  if (!match.season) return [];

  try {
    const stats = await getPlayerSeasonStats(match.season);
    const topScorer = stats
      .slice()
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)[0];
    const topAssist = stats
      .slice()
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)[0];
    const insights: string[] = [];

    if (topScorer?.goals) {
      insights.push(
        `Aktueller interner Top-Torschütze: ${topScorer.firstName} ${topScorer.lastName} mit ${topScorer.goals} Toren.`,
      );
    }
    if (topAssist?.assists) {
      insights.push(
        `Aktuell meiste Vorlagen: ${topAssist.firstName} ${topAssist.lastName} mit ${topAssist.assists} Assists.`,
      );
    }
    return insights;
  } catch {
    return [];
  }
}

async function persistOutputs({
  matchId,
  output,
  newsId,
  userId,
  aiGenerated,
  aiModel,
  aiError,
}: {
  matchId: string;
  output: GeneratedMatchDayOutput;
  newsId: string | null;
  userId: string;
  aiGenerated: boolean;
  aiModel: string | null;
  aiError: string | null;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  let currentNewsId = newsId;
  const newsPayload = {
    title: output.title,
    excerpt: output.excerpt,
    content: output.report,
    category: "Spielbericht",
    status: "draft",
    updated_at: now,
  };

  if (currentNewsId) {
    const { error } = await supabase
      .from("news")
      .update(newsPayload)
      .eq("id", currentNewsId);
    if (error) currentNewsId = null;
  }

  if (!currentNewsId) {
    const { data: news, error } = await supabase
      .from("news")
      .insert({
        ...newsPayload,
        slug: createNewsSlug(output.title),
        published_at: null,
        created_by: userId,
      })
      .select("id")
      .single();
    if (!error) currentNewsId = news.id;
  }

  const { error } = await supabase.from("match_day_outputs").upsert(
    {
      match_id: matchId,
      news_id: currentNewsId,
      title: output.title,
      excerpt: output.excerpt,
      report: output.report,
      instagram_text: output.instagramText,
      facebook_text: output.facebookText,
      whatsapp_text: output.whatsappText,
      press_text: output.pressText,
      graphic_headline: output.graphicHeadline,
      summary: output.summary,
      ai_generated: aiGenerated,
      ai_model: aiModel,
      ai_error: aiError,
      generated_at: now,
      created_by: userId,
      updated_at: now,
    },
    { onConflict: "match_id" },
  );

  if (error) {
    throw new Error(`Entwürfe konnten nicht gespeichert werden: ${error.message}`);
  }

  return currentNewsId;
}

function revalidateMatchDay(matchId: string) {
  for (const path of [
    "/",
    "/news",
    "/statistiken",
    "/tabelle",
    "/match-center",
    `/match-center/${matchId}`,
    "/admin",
    "/admin/news",
    "/admin/statistiken",
    "/admin/trainer",
    "/admin/match-center",
    `/admin/match-center/${matchId}`,
    `/admin/match-center/${matchId}/abschluss`,
  ]) {
    revalidatePath(path);
  }
}

export async function finalizeMatchDay(formData: FormData) {
  await requireRole([...ROLES]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!matchId) throw new Error("Die Spiel-ID fehlt.");

  const { supabase, match, events, players, existingOutput } =
    await loadMatchDayData(matchId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fallback = createMatchDayOutput(match, events, players);
  const generationResult = {
    output: fallback,
    generatedByAi: false,
    model: null,
    error:
      "Kostenloser Vorlagenmodus: Die Texte wurden ohne externe KI-API erstellt.",
  };
  const now = new Date().toISOString();
  const finalMinute = Math.max(90, match.current_minute ?? 90);

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      status: "finished",
      current_minute: finalMinute,
      match_duration: finalMinute,
      clock_phase: "finished",
      clock_started_at: null,
      clock_base_minute: finalMinute,
      clock_resume_phase: null,
      report: generationResult.output.report,
      finalized_at: now,
      updated_at: now,
    })
    .eq("id", matchId);

  if (matchError) {
    throw new Error(`Spiel konnte nicht beendet werden: ${matchError.message}`);
  }

  const { data: existingFulltime } = await supabase
    .from("match_events")
    .select("id")
    .eq("match_id", matchId)
    .eq("event_type", "note")
    .eq("description", "Abpfiff")
    .limit(1)
    .maybeSingle();

  if (!existingFulltime) {
    await supabase.from("match_events").insert({
      match_id: matchId,
      event_type: "note",
      minute: finalMinute,
      description: "Abpfiff",
      created_by: user.id,
    });
  }

  await persistOutputs({
    matchId,
    output: generationResult.output,
    newsId: existingOutput?.news_id ?? null,
    userId: user.id,
    aiGenerated: generationResult.generatedByAi,
    aiModel: generationResult.model,
    aiError: generationResult.error,
  });

  if (!match.finalized_at) await sendFulltimePush(matchId);

  revalidateMatchDay(matchId);
  redirect(`/admin/match-center/${matchId}/abschluss?created=1`);
}

export async function generateMatchDayWithAi(formData: FormData) {
  await requireRole([...ROLES]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!matchId) throw new Error("Die Spiel-ID fehlt.");

  const { supabase, match, events, players, existingOutput } =
    await loadMatchDayData(matchId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fallback = createMatchDayOutput(match, events, players);
  const aiResult = await generateAiMatchDayOutput({
    match,
    events,
    players,
    fallback,
    seasonInsights: await buildSeasonInsights(match),
  });

  await persistOutputs({
    matchId,
    output: aiResult.output,
    newsId: existingOutput?.news_id ?? null,
    userId: user.id,
    aiGenerated: aiResult.generatedByAi,
    aiModel: aiResult.model,
    aiError: aiResult.error,
  });

  await supabase
    .from("matches")
    .update({ report: aiResult.output.report, updated_at: new Date().toISOString() })
    .eq("id", matchId);

  revalidateMatchDay(matchId);
  redirect(`/admin/match-center/${matchId}/abschluss?ai=1`);
}

export async function regenerateMatchDayFree(formData: FormData) {
  await requireRole([...ROLES]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!matchId) throw new Error("Die Spiel-ID fehlt.");

  const { supabase, match, events, players, existingOutput } =
    await loadMatchDayData(matchId);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const output = createMatchDayOutput(match, events, players);

  await persistOutputs({
    matchId,
    output,
    newsId: existingOutput?.news_id ?? null,
    userId: user.id,
    aiGenerated: false,
    aiModel: null,
    aiError:
      "Kostenloser Vorlagenmodus: Die Texte wurden ohne externe KI-API erstellt.",
  });

  await supabase
    .from("matches")
    .update({
      report: output.report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  revalidateMatchDay(matchId);
  redirect(`/admin/match-center/${matchId}/abschluss?free=1`);
}

export async function saveMatchDayDrafts(formData: FormData) {
  await requireRole([...ROLES]);
  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!matchId) throw new Error("Die Spiel-ID fehlt.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = {
    report: String(formData.get("report") ?? "").trim(),
    instagram_text: String(formData.get("instagram_text") ?? "").trim(),
    facebook_text: String(formData.get("facebook_text") ?? "").trim(),
    whatsapp_text: String(formData.get("whatsapp_text") ?? "").trim(),
    press_text: String(formData.get("press_text") ?? "").trim(),
    updated_at: new Date().toISOString(),
  };

  const { data: output, error } = await supabase
    .from("match_day_outputs")
    .update(fields)
    .eq("match_id", matchId)
    .select("news_id")
    .single();
  if (error) throw new Error(`Entwürfe konnten nicht gespeichert werden: ${error.message}`);

  await supabase
    .from("matches")
    .update({ report: fields.report, updated_at: fields.updated_at })
    .eq("id", matchId);

  if (output.news_id) {
    await supabase
      .from("news")
      .update({ content: fields.report, updated_at: fields.updated_at })
      .eq("id", output.news_id);
  }

  revalidateMatchDay(matchId);
  redirect(`/admin/match-center/${matchId}/abschluss?saved=1`);
}
