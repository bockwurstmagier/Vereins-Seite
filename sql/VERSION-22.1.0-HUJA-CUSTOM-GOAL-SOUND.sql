-- HUJA v22.1.0 – Custom Goal Sound
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon;
-- Admin/Vorstand writes through authenticated server actions; service role reads public sound config.
create policy "authenticated can manage app settings" on public.app_settings
for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('match-sounds','match-sounds',true,8388608,array['audio/mpeg','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/aac'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;

create policy "authenticated upload match sounds" on storage.objects for insert to authenticated with check (bucket_id='match-sounds');
create policy "authenticated update match sounds" on storage.objects for update to authenticated using (bucket_id='match-sounds') with check (bucket_id='match-sounds');
create policy "authenticated delete match sounds" on storage.objects for delete to authenticated using (bucket_id='match-sounds');
