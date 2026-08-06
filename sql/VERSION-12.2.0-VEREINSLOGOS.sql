-- VERSION 12.2.0 – Vereinsdatenbank und Vereinslogos

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  short_name text,
  logo_url text,
  logo_path text,
  website_url text,
  primary_color text,
  secondary_color text,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clubs_name_idx on public.clubs(name);

alter table public.clubs enable row level security;

drop policy if exists "Vereine öffentlich lesen" on public.clubs;
create policy "Vereine öffentlich lesen"
on public.clubs for select to public using (true);

drop policy if exists "Vereine durch Verantwortliche anlegen" on public.clubs;
create policy "Vereine durch Verantwortliche anlegen"
on public.clubs for insert to authenticated
with check (public.current_app_role() in ('administrator', 'vorstand'));

drop policy if exists "Vereine durch Verantwortliche ändern" on public.clubs;
create policy "Vereine durch Verantwortliche ändern"
on public.clubs for update to authenticated
using (public.current_app_role() in ('administrator', 'vorstand'))
with check (public.current_app_role() in ('administrator', 'vorstand'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'club-logos',
  'club-logos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Vereinslogos öffentlich lesen" on storage.objects;
create policy "Vereinslogos öffentlich lesen"
on storage.objects for select to public
using (bucket_id = 'club-logos');

drop policy if exists "Vereinslogos durch Verantwortliche hochladen" on storage.objects;
create policy "Vereinslogos durch Verantwortliche hochladen"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'club-logos'
  and public.current_app_role() in ('administrator', 'vorstand')
);

drop policy if exists "Vereinslogos durch Verantwortliche ändern" on storage.objects;
create policy "Vereinslogos durch Verantwortliche ändern"
on storage.objects for update to authenticated
using (
  bucket_id = 'club-logos'
  and public.current_app_role() in ('administrator', 'vorstand')
);

drop policy if exists "Vereinslogos durch Verantwortliche löschen" on storage.objects;
create policy "Vereinslogos durch Verantwortliche löschen"
on storage.objects for delete to authenticated
using (
  bucket_id = 'club-logos'
  and public.current_app_role() in ('administrator', 'vorstand')
);
