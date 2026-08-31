-- Rota 27 v0.25.89 — release oficial do PWA por aparelho
alter table public.rota27_sync_devices
  add column if not exists release_version text;

comment on column public.rota27_sync_devices.release_version is
  'Versão oficial do Rota 27/PWA reportada pelo agente de telemetria. Não confundir com app_version, que pode identificar módulos internos legados.';
