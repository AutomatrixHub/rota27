-- Rota 27 v0.25.215 — papel técnico developer para aparelho de desenvolvimento.
-- A migration altera apenas o domínio permitido de access_role; nenhum aparelho é promovido aqui.

alter table public.rota27_sync_devices
  drop constraint if exists rota27_sync_devices_access_role_check;

alter table public.rota27_sync_devices
  add constraint rota27_sync_devices_access_role_check
  check (access_role in ('owner','staff','developer'));
