import PlayerOfMatchVoteCard from "../fan/PlayerOfMatchVoteCard";
import { getCurrentFanPoll } from "../../lib/fan-experience";

export default async function PlayerOfMatchVoting() {
  try {
    const poll = await getCurrentFanPoll();
    if (!poll) return null;
    return <PlayerOfMatchVoteCard poll={poll} />;
  } catch (error) {
    console.error("Fan-Voting konnte nicht geladen werden:", error);
    return null;
  }
}
