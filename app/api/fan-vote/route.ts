import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { finalizeFanPoll, hashAnonymousId } from "../../../lib/fan-experience";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pollId?: string;
      candidateId?: string;
      deviceId?: string;
    };
    const pollId = String(body.pollId ?? "").trim();
    const candidateId = String(body.candidateId ?? "").trim();
    const deviceId = String(body.deviceId ?? "").trim();

    if (!pollId || !candidateId || deviceId.length < 12 || deviceId.length > 160) {
      return NextResponse.json({ error: "Ungültige Abstimmung." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: poll, error: pollError } = await supabase
      .from("fan_polls")
      .select("id,status,ends_at")
      .eq("id", pollId)
      .maybeSingle();

    if (pollError || !poll) {
      return NextResponse.json({ error: "Abstimmung nicht gefunden." }, { status: 404 });
    }
    if (poll.status !== "open") {
      return NextResponse.json({ error: "Die Abstimmung ist beendet." }, { status: 409 });
    }
    if (new Date(poll.ends_at).getTime() <= Date.now()) {
      await finalizeFanPoll(pollId);
      return NextResponse.json({ error: "Die Abstimmung ist beendet." }, { status: 409 });
    }

    const { data: candidate } = await supabase
      .from("fan_poll_candidates")
      .select("player_id")
      .eq("poll_id", pollId)
      .eq("player_id", candidateId)
      .maybeSingle();
    if (!candidate) {
      return NextResponse.json({ error: "Spieler ist nicht freigegeben." }, { status: 400 });
    }

    const voterHash = hashAnonymousId(deviceId, `vote:${pollId}`);
    const fanHash = hashAnonymousId(deviceId, "fanpass:v1");
    const { error } = await supabase.from("fan_poll_votes").insert({
      poll_id: pollId,
      candidate_player_id: candidateId,
      voter_hash: voterHash,
      fan_hash: fanHash,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Du hast bei dieser Abstimmung bereits gewählt." },
          { status: 409 },
        );
      }
      throw error;
    }

    const { data: votes } = await supabase
      .from("fan_poll_votes")
      .select("candidate_player_id")
      .eq("poll_id", pollId);
    const counts: Record<string, number> = {};
    for (const vote of votes ?? []) {
      counts[vote.candidate_player_id] = (counts[vote.candidate_player_id] ?? 0) + 1;
    }

    return NextResponse.json({ ok: true, counts });
  } catch (error) {
    console.error("Fan-Vote fehlgeschlagen:", error);
    return NextResponse.json({ error: "Abstimmung konnte nicht gespeichert werden." }, { status: 500 });
  }
}
