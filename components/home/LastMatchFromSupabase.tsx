import { getLastFinishedMatch } from "../../lib/public-content";
import DynamicLastMatchCard from "./DynamicLastMatchCard";

export default async function LastMatchFromSupabase() {
  const match = await getLastFinishedMatch();

  return <DynamicLastMatchCard match={match} />;
}
