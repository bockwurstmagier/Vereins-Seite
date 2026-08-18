import { getMatchdayHubData } from "../../lib/matchday-hub";
import MatchdayHubClient from "../matchday/MatchdayHubClient";
export default async function MatchdayHub(){ const data=await getMatchdayHubData(); if(!data?.match) return null; return <MatchdayHubClient data={data}/>; }
