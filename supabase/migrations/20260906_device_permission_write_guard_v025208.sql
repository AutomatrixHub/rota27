-- Rota 27 v0.25.208 — bloqueio servidor-side de escritas por aparelho funcionário

create or replace function public.rota27_guard_staff_event_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_role text;
  v_permissions jsonb;
  v_area text;
  v_allowed boolean := false;
begin
  select access_role, permissions
    into v_role, v_permissions
  from public.rota27_sync_devices
  where store_id = new.store_id
    and device_id = new.device_id;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Aparelho ainda não registrado para sincronização.';
  end if;

  if coalesce(v_role, 'staff') = 'owner' then
    return new;
  end if;

  if new.event_type = 'state_snapshot' then
    raise exception using
      errcode = '42501',
      message = 'Apenas aparelho proprietário pode publicar snapshot inicial.';
  end if;

  v_area := case
    when new.event_type in ('command_opened','command_patch','item_delta','command_closed','history_upsert') then 'commands'
    when new.event_type in ('catalog_upsert','catalog_delete','categories_replace') then 'menu'
    when new.event_type in ('client_upsert','client_delete') then 'clients'
    when new.event_type in ('receivable_upsert','receivable_payment') then 'receivables'
    when new.event_type = 'stock_config_upsert' then 'stock'
    when new.event_type in ('supplier_upsert','purchase_order_upsert','purchase_receipt') then 'purchases'
    when new.event_type = 'inventory_upsert' then 'inventory'
    when new.event_type = 'manager_config_replace' then 'settings'
    when new.event_type in ('turn_closed','turn_closure_repair') then 'panel'
    else null
  end;

  if new.event_type = 'stock_movement' then
    v_allowed := coalesce(v_permissions->>'stock','none') = 'edit'
      or coalesce(v_permissions->>'purchases','none') = 'edit'
      or coalesce(v_permissions->>'inventory','none') = 'edit';
  elsif v_area is not null then
    v_allowed := coalesce(v_permissions->>v_area,'none') = 'edit';
  end if;

  if not v_allowed then
    raise exception using
      errcode = '42501',
      message = format('Aparelho sem permissão de edição para o evento %s.', new.event_type);
  end if;

  return new;
end;
$$;

drop trigger if exists rota27_guard_staff_event_write on public.rota27_sync_events;
create trigger rota27_guard_staff_event_write
before insert or update on public.rota27_sync_events
for each row execute function public.rota27_guard_staff_event_write();

comment on function public.rota27_guard_staff_event_write() is 'Impede que aparelhos staff sincronizem mutações fora das permissões edit configuradas.';
