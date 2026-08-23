create table if not exists public.rota27_whatsapp_inbound (
  id uuid primary key default gen_random_uuid(),
  meta_message_id text not null unique,
  sender_phone text not null,
  reply_to_message_id text,
  message_type text not null default 'unknown',
  message_text text,
  command_id text,
  customer_name text,
  command_label text,
  manager_phone text,
  manager_name text,
  status text not null default 'received'
    check (status = any (array['received'::text, 'ignored'::text, 'forwarding'::text, 'forwarded'::text, 'failed'::text])),
  reason text,
  manager_wa_message_id text,
  meta_timestamp bigint,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists rota27_whatsapp_inbound_sender_idx
  on public.rota27_whatsapp_inbound (sender_phone, received_at desc);

create index if not exists rota27_whatsapp_inbound_reply_idx
  on public.rota27_whatsapp_inbound (reply_to_message_id);

create index if not exists rota27_whatsapp_inbound_status_idx
  on public.rota27_whatsapp_inbound (status, updated_at desc);

alter table public.rota27_whatsapp_inbound enable row level security;

comment on table public.rota27_whatsapp_inbound is
  'Registro idempotente das respostas recebidas pelo WhatsApp Cloud API e do encaminhamento operacional ao gerente.';
