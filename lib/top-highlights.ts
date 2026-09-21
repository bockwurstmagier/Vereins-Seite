export type TopHighlight = { id: string; matchId: string; videoUrl: string; minute: number; description: string; opponent: string; player: string | null };
export function isTopHighlight(event: { is_highlight?: boolean; video_url?: string | null }, status: string) {
  return status === "finished" && event.is_highlight === true && !!event.video_url;
}
