-- Rota 27 v0.25.211 — convites temporários para vínculo seguro de aparelhos

create table if not exists public.rota27_device_enrollments (
  enrollment_id uuid primary key,
  store_id text not null,
  code_hash text not null,
  qr_secret_hash text not null,
  created_by_device_id text not null,
  employee_name text,
  access_role text not null default 'staff',
  permissions jsonb not null default '{"commands":"none","menu":"none","panel":"none","history":"none","clients":"none","receivables":"none","stock":"none","purchases":"none","inventory":"none","settings":"none","devices":"none"}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  claimed_device_id text,
  claim_nonce text,
  revoked_at timestamptz,
  constraint rota27_device_enrollments_access_role_check check (access_role in ('owner','staff'))
);

create index if not exists rota27_device_enrollments_active_code_idx
  on public.rota27_device_enrollments (store_id, code_hash, expires_at desc);

create index if not exists rota27_device_enrollments_created_idx
  on public.rota27_device_enrollments (store_id, created_at desc);

create index if not exists rota27_device_enrollments_claimed_device_idx
  on public.rota27_device_enrollments (store_id, claimed_device_id)
  where claimed_device_id is not null;

alter table public.rota27_device_enrollments enable row level security;

revoke all on table public.rota27_device_enrollments from anon, authenticated;

comment on table public.rota27_device_enrollments is
  'Convites temporários e de uso único para vincular novos aparelhos ao Rota 27. Segredos são persistidos somente como hash.';
