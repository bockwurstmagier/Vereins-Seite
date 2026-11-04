import { getActivePlayers } from "../../lib/team";
import DynamicTeamSection from "./DynamicTeamSection";

export default async function TeamFromSupabase() {
  const players = await getActivePlayers(6);

  return <DynamicTeamSection players={players.slice(0, 6)} />;
}
