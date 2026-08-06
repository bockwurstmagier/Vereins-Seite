import { getUpcomingMatch } from "../../lib/public-content";
import DynamicMatchCountdown from "./DynamicMatchCountdown";

export default async function CountdownFromSupabase() {
  const match = await getUpcomingMatch();

  return <DynamicMatchCountdown match={match} />;
}
