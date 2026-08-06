"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "../../../lib/auth/roles";
import {
  createMatchDayOutput,
  createNewsSlug,
  type FinalizerEvent,
  type FinalizerMatch,
  type FinalizerPlayer,
} from "../../../lib/match-day-finalizer";
import { sendFulltimePush } from "../../../lib/push/server";
import { createClient } from "../../../lib/supabase/server";

type AutomationSteps = {
  resultUpdated: boolean;
  tableReady: boolean;
  nextMatchReady: boolean;
  reportPublished: boolean;
  socialTextsReady: boolean;
  graphicReady: boolean;
  pushSent: boolean;
};

export async function finalizeMatchDay(formData: FormData) {
  await requireRole(["administrator", "trainer", "betreuer"]);

  const matchId = String(formData.get("match_id") ?? "").trim();
  if (!matchId) throw new Error("Die Spiel-ID fehlt.");

  const publishReport =
    String(formData.get("publish_report") ?? "true") !== "false";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: automationRun, error: runError } = await supabase
    .from("match_automation_runs")
    .insert({
      match_id: matchId,
      status: "running",
      steps: {},
      created_by: user.id,
    })
    .select("id")
    .single();

  if (runError || !automationRun) {
    throw new Error(
      `Automatisierung konnte nicht gestartet werden: ${
        runError?.message ?? "Unbekannter Fehler"
      }`,
    );
  }

  const runId = automationRun.id as string;
  const steps: AutomationSteps = {
    resultUpdated: false,
    tableReady: false,
    nextMatchReady: false,
    reportPublished: false,
    socialTextsReady: false,
    graphicReady: false,
    pushSent: false,
  };

  try {
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
        supabase
          .from("players")
          .select("id, first_name, last_name"),
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

    const match = matchResult.data as FinalizerMatch;
    const output = createMatchDayOutput(
      match,
      (eventsResult.data ?? []) as FinalizerEvent[],
      (playersResult.data ?? []) as FinalizerPlayer[],
    );

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
        report: output.report,
        finalized_at: now,
        updated_at: now,
      })
      .eq("id", matchId);

    if (matchError) {
      throw new Error(
        `Spiel konnte nicht beendet werden: ${matchError.message}`,
      );
    }

    steps.resultUpdated = true;
    steps.tableReady = true;
    steps.nextMatchReady = true;

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

    let newsId = existingOutputResult.data?.news_id ?? null;
    const newsPayload = {
      title: output.title,
      excerpt: output.excerpt,
      content: output.report,
      category: "Spielbericht",
      status: publishReport ? "published" : "draft",
      published_at: publishReport ? now : null,
      updated_at: now,
    };

    if (newsId) {
      const { error } = await supabase
        .from("news")
        .update(newsPayload)
        .eq("id", newsId);

      if (error) newsId = null;
    }

    if (!newsId) {
      const { data: news, error } = await supabase
        .from("news")
        .insert({
          ...newsPayload,
          slug: createNewsSlug(output.title),
          created_by: user.id,
        })
        .select("id")
        .single();

      if (!error) newsId = news.id;
    }

    steps.reportPublished = Boolean(newsId && publishReport);
    steps.socialTextsReady = true;
    steps.graphicReady = true;

    const { error: outputError } = await supabase
      .from("match_day_outputs")
      .upsert(
        {
          match_id: matchId,
          news_id: newsId,
          title: output.title,
          excerpt: output.excerpt,
          report: output.report,
          instagram_text: output.instagramText,
          facebook_text: output.facebookText,
          whatsapp_text: output.whatsappText,
          press_text: output.pressText,
          graphic_headline: output.graphicHeadline,
          summary: {
            ...output.summary,
            automationVersion: "16.2.0",
            publishReport,
          },
          created_by: user.id,
          updated_at: now,
        },
        { onConflict: "match_id" },
      );

    if (outputError) {
      throw new Error(
        `Entwürfe konnten nicht gespeichert werden: ${outputError.message}`,
      );
    }

    if (!match.finalized_at) {
      await sendFulltimePush(matchId);
      steps.pushSent = true;
    } else {
      steps.pushSent = true;
    }

    await supabase
      .from("match_automation_runs")
      .update({
        status: "completed",
        steps,
        news_id: newsId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId);

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
      "/admin/grafikstudio",
    ]) {
      revalidatePath(path);
    }

    redirect(
      `/admin/match-center/${matchId}/abschluss?created=1&run=${runId}`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Automatikfehler";

    await supabase
      .from("match_automation_runs")
      .update({
        status: "failed",
        steps,
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId);

    throw error;
  }
}
