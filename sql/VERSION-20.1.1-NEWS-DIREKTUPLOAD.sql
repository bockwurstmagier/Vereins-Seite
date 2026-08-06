-- HOTFIX 20.1.1 – News-Titelbild Direktupload
-- Im Supabase SQL Editor vollständig ausführen.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-images',
  'news-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Newsbilder öffentlich lesen" on storage.objects;
create policy "Newsbilder öffentlich lesen"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'news-images');

drop policy if exists "Newsbilder direkt hochladen" on storage.objects;
create policy "Newsbilder direkt hochladen"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'news-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Newsbilder ändern" on storage.objects;
create policy "Newsbilder ändern"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'news-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
)
with check (
  bucket_id = 'news-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Newsbilder löschen" on storage.objects;
create policy "Newsbilder löschen"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'news-images'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);
