-- Rota 27 v0.15 — infraestrutura de sincronização multidispositivo
-- Aplicar apenas no projeto Supabase autorizado da Rota 27.

create table if not exists public.rota27_sync_events (
  seq bigint generated always as identity primary key,
  store_id text not null,
  event_id text not null,
  device_id text not null,
  event_type text not null,
  entity_id text not null default '',
  payload jsonb not null default '{}'::jsonb,
  app_version text not null default '',
  client_created_at timestamptz,
  created_at timestamptz not null default now(),
  constraint rota27_sync_events_store_event_uk unique (store_id, event_id),
  constraint rota27_sync_events_type_ck check (event_type in (
    'state_snapshot',
    'command_opened',
    'command_patch',
    'item_delta',
    'command_closed',
    'history_upsert',
    'catalog_upsert',
    'catalog_delete',
    'categories_replace'
  ))
);

create index if not exists rota27_sync_events_store_seq_idx
  on public.rota27_sync_events (store_id, seq);

create index if not exists rota27_sync_events_store_type_seq_idx
  on public.rota27_sync_events (store_id, event_type, seq desc);

create table if not exists public.rota27_sync_devices (
  store_id text not null,
  device_id text not null,
  device_name text not null default 'Aparelho',
  app_version text not null default '',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_cursor bigint not null default 0,
  primary key (store_id, device_id)
);

create index if not exists rota27_sync_devices_last_seen_idx
  on public.rota27_sync_devices (store_id, last_seen_at desc);

alter table public.rota27_sync_events enable row level security;
alter table public.rota27_sync_devices enable row level security;

-- Intencionalmente sem policies públicas.
-- A Edge Function rota27-sync utiliza a service role e autenticação própria
-- pelo header x-rota27-device-token, assim como a integração de WhatsApp.

comment on table public.rota27_sync_events is
  'Log idempotente de eventos offline-first da sincronização multidispositivo do Rota 27.';

comment on table public.rota27_sync_devices is
  'Registro de presença dos aparelhos autorizados a sincronizar o Rota 27.';
