import { notFound } from "next/navigation";

import LiveMatchCenter from "../../../components/match-center/LiveMatchCenter";
import { getPublicMatchCenterMatch } from "../../../lib/match-center";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicMatchCenterPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getPublicMatchCenterMatch(id);

  if (!data) notFound();

  return (
    <LiveMatchCenter
      initialMatch={data.match}
      players={data.players}
      initialEvents={data.events}
      initialSquad={data.squad}
    />
  );
}
