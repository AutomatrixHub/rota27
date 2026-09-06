-- Rota 27 v0.25.208 — primeiro aparelho de cada loja nasce proprietário

create or replace function public.rota27_first_device_owner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.store_id));

  if not exists (
    select 1
    from public.rota27_sync_devices d
    where d.store_id = new.store_id
  ) then
    new.access_role := 'owner';
    new.permissions := '{"commands":"edit","menu":"edit","panel":"edit","history":"edit","clients":"edit","receivables":"edit","stock":"edit","purchases":"edit","inventory":"edit","settings":"edit","devices":"edit"}'::jsonb;
    new.permissions_updated_at := coalesce(new.permissions_updated_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists rota27_first_device_owner on public.rota27_sync_devices;
create trigger rota27_first_device_owner
before insert on public.rota27_sync_devices
for each row execute function public.rota27_first_device_owner();

comment on function public.rota27_first_device_owner() is 'Garante que o primeiro aparelho registrado de cada loja tenha autoridade para configurar os demais.';
