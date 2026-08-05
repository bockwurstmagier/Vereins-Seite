-- VERSION 9.0.2 – Dauerhafte Web-Push-Benachrichtigungen
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  device_token uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  goals_enabled boolean not null default true,
  cards_enabled boolean not null default true,
  substitutions_enabled boolean not null default true,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists push_subscriptions_device_token_idx
on public.push_subscriptions(device_token);

alter table public.push_subscriptions enable row level security;

-- Absichtlich keine öffentlichen RLS-Policies:
-- Lesen und Schreiben erfolgen ausschließlich serverseitig mit
-- SUPABASE_SECRET_KEY bzw. dem alten SUPABASE_SERVICE_ROLE_KEY.

comment on table public.push_subscriptions is
  'Geräte-Abonnements für dauerhafte LiveCenter-Web-Push-Nachrichten.';
