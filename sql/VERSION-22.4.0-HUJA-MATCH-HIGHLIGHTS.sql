alter table public.match_events add column if not exists is_highlight boolean not null default false;
create index if not exists match_events_highlight_idx on public.match_events (match_id, is_highlight, minute) where video_url is not null;
