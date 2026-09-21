-- Existing app_settings table and policies remain in place.
-- Restrict ONLY the new configuration key; no change to other settings or anon grants.
begin;
drop policy if exists "home modules require management role" on public.app_settings;
create policy "home modules require management role" on public.app_settings
as restrictive for all to authenticated
using (key <> 'home_modules' or exists (
  select 1 from public.user_profiles where id = auth.uid() and is_active = true and role in ('administrator', 'vorstand')
))
with check (key <> 'home_modules' or exists (
  select 1 from public.user_profiles where id = auth.uid() and is_active = true and role in ('administrator', 'vorstand')
));
commit;
