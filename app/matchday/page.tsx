import vereinsLogo from "../logo.png";
import MatchdayMode from "../../components/matchday/MatchdayMode";
import { getMatchdayModeData } from "../../lib/matchday-mode";

export const metadata = {
  title: "HUJA Matchday Mode | SpVgg Middelich-Resse",
};

export const revalidate = 15;

export default async function MatchdayPage() {
  const data = await getMatchdayModeData();

  return (
    <MatchdayMode
      {...data}
      clubLogoSrc={vereinsLogo.src}
    />
  );
}
