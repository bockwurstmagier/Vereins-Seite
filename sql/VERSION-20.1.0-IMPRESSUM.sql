-- VERSION 20.1.0 – Impressum & Teamordnung
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.site_imprint (
  id text primary key default 'main',
  club_name text not null default 'SpVgg Middelich-Resse 71/81',
  club_legal_name text,
  street text,
  postal_code text,
  city text,
  phone text,
  email text,
  website text,
  first_chairman_name text,
  second_chairman_name text,
  president_name text,
  content_responsible_name text,
  content_responsible_street text,
  content_responsible_postal_code text,
  content_responsible_city text,
  register_court text,
  register_number text,
  tax_number text,
  additional_information text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.site_imprint (id)
values ('main')
on conflict (id) do nothing;

alter table public.site_imprint enable row level security;

drop policy if exists "Impressum öffentlich lesen" on public.site_imprint;
create policy "Impressum öffentlich lesen"
on public.site_imprint
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "Impressum verwalten" on public.site_imprint;
create policy "Impressum verwalten"
on public.site_imprint
for all
to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand')
)
with check (
  public.current_app_role() in ('administrator', 'vorstand')
);
