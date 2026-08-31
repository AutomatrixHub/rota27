-- Rota 27 v0.25.85 — ciclo de vida controlado dos aparelhos sincronizados

alter table public.rota27_sync_devices
  add column if not exists status text not null default 'active',
  add column if not exists retired_at timestamptz null,
  add column if not exists retired_reason text null;

update public.rota27_sync_devices
set status = 'active'
where status is null or btrim(status) = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rota27_sync_devices_status_check'
      and conrelid = 'public.rota27_sync_devices'::regclass
  ) then
    alter table public.rota27_sync_devices
      add constraint rota27_sync_devices_status_check
      check (status in ('active','retired','removed'));
  end if;
end $$;

create index if not exists rota27_sync_devices_store_status_seen_idx
  on public.rota27_sync_devices (store_id, status, last_seen_at desc);

comment on column public.rota27_sync_devices.status is
  'Lifecycle do aparelho: active, retired ou removed. Removed é tombstone controlado; a linha permanece para impedir re-registro automático.';
comment on column public.rota27_sync_devices.retired_at is
  'Data/hora da desativação ou remoção controlada do aparelho.';
comment on column public.rota27_sync_devices.retired_reason is
  'Motivo opcional informado ao desativar/remover o aparelho.';
