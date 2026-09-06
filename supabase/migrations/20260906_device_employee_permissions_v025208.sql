-- Rota 27 v0.25.208 — vínculo de funcionário e permissões por aparelho

alter table public.rota27_sync_devices
  add column if not exists employee_name text,
  add column if not exists access_role text not null default 'staff',
  add column if not exists permissions jsonb not null default '{"commands":"none","menu":"none","panel":"none","history":"none","clients":"none","receivables":"none","stock":"none","purchases":"none","inventory":"none","settings":"none","devices":"none"}'::jsonb,
  add column if not exists permissions_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'rota27_sync_devices_access_role_check'
      and conrelid = 'public.rota27_sync_devices'::regclass
  ) then
    alter table public.rota27_sync_devices
      add constraint rota27_sync_devices_access_role_check
      check (access_role in ('owner','staff'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'rota27_sync_devices_permissions_object_check'
      and conrelid = 'public.rota27_sync_devices'::regclass
  ) then
    alter table public.rota27_sync_devices
      add constraint rota27_sync_devices_permissions_object_check
      check (jsonb_typeof(permissions) = 'object');
  end if;
end $$;

-- Compatibilidade: aparelhos existentes antes desta release continuam proprietários.
update public.rota27_sync_devices
set access_role = 'owner',
    permissions = '{"commands":"edit","menu":"edit","panel":"edit","history":"edit","clients":"edit","receivables":"edit","stock":"edit","purchases":"edit","inventory":"edit","settings":"edit","devices":"edit"}'::jsonb,
    permissions_updated_at = now()
where permissions_updated_at is null;

comment on column public.rota27_sync_devices.employee_name is 'Nome do funcionário vinculado ao aparelho.';
comment on column public.rota27_sync_devices.access_role is 'owner = proprietário; staff = funcionário com permissões configuráveis.';
comment on column public.rota27_sync_devices.permissions is 'Matriz por área: none, view ou edit.';
