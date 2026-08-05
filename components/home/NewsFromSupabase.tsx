import { getPublishedNews } from "../../lib/public-content";
import PublicNewsSection from "./PublicNewsSection";

export default async function NewsFromSupabase() {
  const items = await getPublishedNews(3);

  return <PublicNewsSection items={items} />;
}
