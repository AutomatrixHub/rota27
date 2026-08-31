-- Rota 27 v0.25.87 — solicitações remotas de atualização do PWA

alter table public.rota27_sync_devices
  add column if not exists requested_update_at timestamptz null,
  add column if not exists requested_update_version text null,
  add column if not exists update_request_ack_at timestamptz null;

comment on column public.rota27_sync_devices.requested_update_at is
  'Data/hora da solicitação remota de atualização do PWA.';
comment on column public.rota27_sync_devices.requested_update_version is
  'Versão alvo solicitada para atualização remota do PWA.';
comment on column public.rota27_sync_devices.update_request_ack_at is
  'Data/hora em que o aparelho confirmou a solicitação após carregar a versão atualizada.';
