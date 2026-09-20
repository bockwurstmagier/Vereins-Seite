"use client";

import { useEffect, useState } from "react";
import type { MatchCenterEvent } from "../../lib/match-center";
import { createClient } from "../../lib/supabase/client";

/** Refresh only events; never replace unsaved positions in the formation editor. */
export function useLineupEvents(matchId: string, initialEvents: MatchCenterEvent[]) {
  const [snapshot, setSnapshot] = useState({ source: initialEvents, events: initialEvents });
  const events = snapshot.source === initialEvents ? snapshot.events : initialEvents;

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let request = 0;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const refresh = async () => {
      const current = ++request;
      const { data, error } = await supabase.from("match_events")
        .select("id, match_id, event_type, minute, player_id, secondary_player_id, description, moment_type, video_url, video_path, is_highlight, created_at")
        .eq("match_id", matchId);
      if (active && current === request && !error && data) {
        setSnapshot({ source: initialEvents, events: data as MatchCenterEvent[] });
      }
    };
    const disconnect = () => {
      ++request;
      if (channel) void supabase.removeChannel(channel);
      channel = null;
    };
    const connect = () => {
      if (channel || document.visibilityState !== "visible") return;
      channel = supabase.channel(`lineup-events-${matchId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${matchId}` }, () => { void refresh(); })
        .subscribe((status) => { if (status === "SUBSCRIBED") void refresh(); });
      void refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") connect();
      else disconnect();
    };
    connect();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onVisibility);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onVisibility);
      disconnect();
    };
  }, [matchId, initialEvents]);

  return events;
}
