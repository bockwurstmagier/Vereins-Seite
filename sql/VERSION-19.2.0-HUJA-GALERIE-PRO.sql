-- VERSION 19.2.0 – HUJA Galerie Pro
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category text not null default 'Spieltag',
  season text,
  match_id uuid references public.matches(id) on delete set null,
  cover_media_id uuid,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_media (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  title text,
  caption text,
  file_url text,
  file_path text,
  thumbnail_url text,
  external_url text,
  mime_type text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_public boolean not null default true,
  photographer text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint gallery_media_source_check check (
    (media_type = 'image' and file_url is not null)
    or
    (media_type = 'video' and (file_url is not null or external_url is not null))
  )
);

alter table public.gallery_albums
drop constraint if exists gallery_albums_cover_media_id_fkey;

alter table public.gallery_albums
add constraint gallery_albums_cover_media_id_fkey
foreign key (cover_media_id)
references public.gallery_media(id)
on delete set null;

create index if not exists gallery_albums_public_idx
on public.gallery_albums(is_public, sort_order, created_at desc);

create index if not exists gallery_albums_match_idx
on public.gallery_albums(match_id);

create index if not exists gallery_media_album_idx
on public.gallery_media(album_id, sort_order, created_at);

alter table public.gallery_albums enable row level security;
alter table public.gallery_media enable row level security;

drop policy if exists "Öffentliche Galeriealben lesen" on public.gallery_albums;
create policy "Öffentliche Galeriealben lesen"
on public.gallery_albums
for select
to anon, authenticated
using (
  is_public
  or public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Galeriealben verwalten" on public.gallery_albums;
create policy "Galeriealben verwalten"
on public.gallery_albums
for all
to authenticated
using (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
)
with check (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
);

drop policy if exists "Öffentliche Galeriemedien lesen" on public.gallery_media;
create policy "Öffentliche Galeriemedien lesen"
on public.gallery_media
for select
to anon, authenticated
using (
  is_public
  and exists (
    select 1
    from public.gallery_albums album
    where album.id = album_id
      and album.is_public
  )
  or public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Galeriemedien verwalten" on public.gallery_media;
create policy "Galeriemedien verwalten"
on public.gallery_media
for all
to authenticated
using (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
)
with check (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-media',
  'gallery-media',
  true,
  26214400,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Galerie Dateien öffentlich lesen" on storage.objects;
create policy "Galerie Dateien öffentlich lesen"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery-media');

drop policy if exists "Galerie Dateien hochladen" on storage.objects;
create policy "Galerie Dateien hochladen"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gallery-media'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
);

drop policy if exists "Galerie Dateien ändern" on storage.objects;
create policy "Galerie Dateien ändern"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gallery-media'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
)
with check (
  bucket_id = 'gallery-media'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
);

drop policy if exists "Galerie Dateien löschen" on storage.objects;
create policy "Galerie Dateien löschen"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gallery-media'
  and public.current_app_role() in (
    'administrator',
    'vorstand',
    'social_media'
  )
);
