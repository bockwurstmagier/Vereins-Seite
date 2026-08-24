-- HUJA v22.6.0 – Security Hardening
-- Verteilter Rate-Limiter für öffentliche Schreib-APIs.

create table if not exists public.security_rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.security_rate_limits enable row level security;
revoke all on public.security_rate_limits from anon, authenticated;

create or replace function public.huja_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted boolean := false;
begin
  if p_key is null or length(p_key) < 16 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.security_rate_limits as r (key, window_started_at, request_count, updated_at)
  values (p_key, now(), 1, now())
  on conflict (key) do update
  set
    request_count = case
      when r.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
      else r.request_count + 1
    end,
    window_started_at = case
      when r.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
      else r.window_started_at
    end,
    updated_at = now()
  where
    r.window_started_at <= now() - make_interval(secs => p_window_seconds)
    or r.request_count < p_limit
  returning true into accepted;

  return coalesce(accepted, false);
end;
$$;

revoke all on function public.huja_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.huja_rate_limit(text, integer, integer) to service_role;

-- Alte Rate-Limit-Zeilen können regelmäßig gefahrlos entfernt werden.
create index if not exists security_rate_limits_updated_idx on public.security_rate_limits(updated_at);
