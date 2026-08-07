-- VERSION 20.3.0 – HUJA Push Automations
-- Im Supabase SQL Editor vollständig ausführen.

alter table public.push_subscriptions
add column if not exists live_starts_enabled boolean not null default true;

alter table public.push_subscriptions
add column if not exists news_enabled boolean not null default true;

create table if not exists public.push_delivery_log (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists push_delivery_log_created_idx
on public.push_delivery_log(created_at desc);

alter table public.push_delivery_log enable row level security;

-- Keine Public-Policies nötig:
-- Diese Tabelle wird ausschließlich mit dem serverseitigen Supabase Secret Key
-- verwendet und verhindert doppelte automatische Push-Nachrichten.
