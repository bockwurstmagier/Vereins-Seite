-- HOTFIX 19.2.3 – Teamfoto Direktupload
-- Im Supabase SQL Editor vollständig ausführen.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'player-images',
  'player-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Spielerbilder öffentlich lesen" on storage.objects;
create policy "Spielerbilder öffentlich lesen"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'player-images');

drop policy if exists "Spielerbilder direkt hochladen" on storage.objects;
create policy "Spielerbilder direkt hochladen"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Spielerbilder ändern" on storage.objects;
create policy "Spielerbilder ändern"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
)
with check (
  bucket_id = 'player-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Spielerbilder löschen" on storage.objects;
create policy "Spielerbilder löschen"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);
