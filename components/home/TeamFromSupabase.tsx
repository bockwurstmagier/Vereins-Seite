import { getActivePlayers } from "../../lib/team";
import DynamicTeamSection from "./DynamicTeamSection";

export default async function TeamFromSupabase() {
  const players = await getActivePlayers();

  return <DynamicTeamSection players={players} />;
}
