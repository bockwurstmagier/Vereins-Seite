import { getActiveSponsors } from "../../lib/sponsors";
import DynamicSponsorSection from "./DynamicSponsorSection";
export default async function SponsorFromSupabase() { return <DynamicSponsorSection sponsors={await getActiveSponsors()}/>; }
