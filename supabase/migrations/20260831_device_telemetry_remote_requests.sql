-- Rota 27 v0.25.86 — telemetria e solicitações remotas por aparelho

alter table public.rota27_sync_devices
  add column if not exists whatsapp_configured boolean null,
  add column if not exists whatsapp_pending_count integer null,
  add column if not exists whatsapp_failed_count integer null,
  add column if not exists whatsapp_last_error text null,
  add column if not exists whatsapp_telemetry_at timestamptz null,
  add column if not exists requested_sync_at timestamptz null,
  add column if not exists sync_request_ack_at timestamptz null,
  add column if not exists requested_diagnostic_at timestamptz null,
  add column if not exists diagnostic_request_ack_at timestamptz null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='rota27_sync_devices_whatsapp_counts_check'
      and conrelid='public.rota27_sync_devices'::regclass
  ) then
    alter table public.rota27_sync_devices
      add constraint rota27_sync_devices_whatsapp_counts_check
      check (
        (whatsapp_pending_count is null or whatsapp_pending_count >= 0)
        and (whatsapp_failed_count is null or whatsapp_failed_count >= 0)
      );
  end if;
end $$;

create index if not exists rota27_sync_devices_remote_requests_idx
  on public.rota27_sync_devices (store_id, status, requested_sync_at desc, requested_diagnostic_at desc);

comment on column public.rota27_sync_devices.whatsapp_configured is 'Telemetria booleana do aparelho: integração WhatsApp configurada localmente. Não armazena URL nem token.';
comment on column public.rota27_sync_devices.whatsapp_pending_count is 'Quantidade agregada de envios WhatsApp pendentes nas filas locais conhecidas do aparelho.';
comment on column public.rota27_sync_devices.whatsapp_failed_count is 'Quantidade agregada de envios WhatsApp em estado de falha/retry no aparelho.';
comment on column public.rota27_sync_devices.whatsapp_last_error is 'Último erro local de WhatsApp sanitizado, sem conteúdo de mensagem, telefone, URL ou token.';
comment on column public.rota27_sync_devices.whatsapp_telemetry_at is 'Último instante em que o agente do aparelho reportou telemetria WhatsApp.';
comment on column public.rota27_sync_devices.requested_sync_at is 'Pedido remoto para o aparelho executar sincronização assim que estiver ativo.';
comment on column public.rota27_sync_devices.sync_request_ack_at is 'Confirmação do aparelho após atender o último pedido remoto de sincronização.';
comment on column public.rota27_sync_devices.requested_diagnostic_at is 'Pedido remoto para o aparelho reportar diagnóstico/telemetria assim que estiver ativo.';
comment on column public.rota27_sync_devices.diagnostic_request_ack_at is 'Confirmação do aparelho após atender o último pedido remoto de diagnóstico.';
