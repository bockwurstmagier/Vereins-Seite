import Hero from "../components/home/Hero";
import CountdownFromSupabase from "../components/home/CountdownFromSupabase";
import LastMatchFromSupabase from "../components/home/LastMatchFromSupabase";
import AutoLeagueTable from "../components/home/AutoLeagueTable";
import NewsFromSupabase from "../components/home/NewsFromSupabase";
import GallerySection from "../components/home/GallerySection";
import SponsorFromSupabase from "../components/home/SponsorFromSupabase";
import TeamFromSupabase from "../components/home/TeamFromSupabase";
import NextMatchFromSupabase from "../components/home/NextMatchFromSupabase";
import FeaturedMatchCenter from "../components/match-center/FeaturedMatchCenter";
import BottomNavigation from "../components/home/layout/BottomNavigation";
import QuickLinks from "../components/home/QuickLinks";
import UpcomingEvents from "../components/calendar/UpcomingEvents";
import HomeAtmosphere from "../components/home/HomeAtmosphere";
import PlayerOfMatchVoting from "../components/home/PlayerOfMatchVoting";
import MatchdayHub from "../components/home/MatchdayHub";
import FanPassCard from "../components/fan/FanPassCard";
import BirthdaySpotlight from "../components/home/BirthdaySpotlight";

import { getHomeModules } from "../lib/home-settings";
import { getNextMatch } from "../lib/matches";
import { getTopHighlights } from "../lib/top-highlights-server";
import type { HomeModuleId } from "../lib/home-modules";
import type { ReactNode } from "react";
import HomeQuickNavigation from "../components/home/HomeQuickNavigation";
import FussballNextMatchSection from "../components/home/FussballNextMatchSection";
import CupMatch from "../components/home/CupMatch";
import TopHighlights from "../components/home/TopHighlights";

export default async function Home() {
  const modules = await getHomeModules();
  const enabled = (id: HomeModuleId) => modules.some(module => module.id === id && module.enabled);
  const [cup, clips] = await Promise.all([enabled("cup") ? getNextMatch("cup") : null, enabled("highlights") ? getTopHighlights() : []]);
  const active = modules.filter(module => module.enabled && (module.id !== "cup" || cup) && (module.id !== "highlights" || clips.length));
  const sections: Record<HomeModuleId, ReactNode> = {
    matchday: <MatchdayHub />, birthdays: <BirthdaySpotlight />, fanpass: <FanPassCard />,
    match: <><FeaturedMatchCenter /><CountdownFromSupabase /><NextMatchFromSupabase /></>,
    cup: <CupMatch match={cup} />, highlights: <TopHighlights clips={clips} />,
    fussball: <FussballNextMatchSection />,
    lastmatch: <LastMatchFromSupabase />, voting: <PlayerOfMatchVoting />, table: <AutoLeagueTable />,
    news: <NewsFromSupabase />, events: <UpcomingEvents />, gallery: <GallerySection />,
    team: <TeamFromSupabase />, sponsors: <SponsorFromSupabase />, links: <QuickLinks />,
  };
  return <main className="huja-home huja-stadium-experience min-h-screen bg-black pb-24">
    <HomeQuickNavigation items={active.map(({ id, label }) => ({ id, label }))} />
    <Hero matchEnabled={enabled("match")} />
    <div className="huja-home-content relative isolate overflow-hidden"><HomeAtmosphere />
      <div id="home-sections" className="relative z-10">{active.map(module => <div key={module.id} id={`home-${module.id}`} tabIndex={-1} className="scroll-mt-24">{sections[module.id]}</div>)}</div>
    </div><BottomNavigation homeModules={active.map(module => module.id)} />
  </main>;
}
