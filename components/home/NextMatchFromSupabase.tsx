import NextMatchCard from "./NextMatchCard";
import { getNextMatch } from "../../lib/matches";

export default async function NextMatchFromSupabase() {
  const match = await getNextMatch();

  return <NextMatchCard match={match} />;
}
