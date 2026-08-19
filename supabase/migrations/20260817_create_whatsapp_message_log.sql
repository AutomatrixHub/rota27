-- Rota 27 - log idempotente das mensagens WhatsApp
create table if not exists public.whatsapp_message_log (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  command_id text not null,
  phone text not null,
  customer_name text,
  command_label text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'processing'
    check (status in ('processing','sent','failed')),
  attempts integer not null default 0,
  wa_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists whatsapp_message_log_command_id_idx
  on public.whatsapp_message_log (command_id);

create index if not exists whatsapp_message_log_created_at_idx
  on public.whatsapp_message_log (created_at desc);

alter table public.whatsapp_message_log enable row level security;

-- Sem policies públicas: somente o service role usado pela Edge Function
-- poderá ler/gravar nesta tabela.
