-- HUJA v20.7.0 – Invitations & Live Moments
-- Im Supabase SQL Editor vollständig ausführen.

-- 1) Live-Ticker-Ereignisse um optionale Video-Momente erweitern.
alter table public.match_events
  add column if not exists moment_type text,
  add column if not exists video_url text,
  add column if not exists video_path text;

-- Moment-Art bewusst separat vom bestehenden event_type speichern,
-- damit bestehende Tor/Karten/Wechsel-Logik unverändert bleibt.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_events_moment_type_check'
      and conrelid = 'public.match_events'::regclass
  ) then
    alter table public.match_events
      add constraint match_events_moment_type_check
      check (moment_type is null or moment_type in ('penalty', 'moment'));
  end if;
end $$;

-- 2) Öffentlicher Storage-Bucket für kurze Live-Videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'live-moments',
  'live-moments',
  true,
  36700160,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Live-Momente öffentlich lesen" on storage.objects;
create policy "Live-Momente öffentlich lesen"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'live-moments');

drop policy if exists "Live-Momente hochladen" on storage.objects;
create policy "Live-Momente hochladen"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'live-moments'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.current_app_role() in ('administrator', 'trainer', 'betreuer')
);

drop policy if exists "Live-Momente löschen" on storage.objects;
create policy "Live-Momente löschen"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'live-moments'
  and public.current_app_role() in ('administrator', 'trainer', 'betreuer')
);
