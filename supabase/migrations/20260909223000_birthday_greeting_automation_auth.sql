create extension if not exists pgcrypto with schema extensions;

create table if not exists public.rota27_automation_credentials (
  automation_key text primary key,
  token text not null check (length(token) >= 64),
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

alter table public.rota27_automation_credentials enable row level security;
revoke all on table public.rota27_automation_credentials from anon, authenticated;
grant select on table public.rota27_automation_credentials to service_role;

insert into public.rota27_automation_credentials (automation_key, token)
values (
  'birthday-greeting-cron',
  encode(extensions.gen_random_bytes(32), 'hex')
)
on conflict (automation_key) do nothing;

do $$
declare r record;
begin
  for r in select jobid from cron.job where jobname = 'rota27-birthday-greeting-0930'
  loop
    perform cron.unschedule(r.jobid);
  end loop;
end $$;

select cron.schedule(
  'rota27-birthday-greeting-0930',
  '30 12 * * *',
  $$
    select net.http_post(
      url := 'https://owkvwsiblbzlpxjwybrt.supabase.co/functions/v1/rota27-birthday-greeting',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-rota27-automation-token', (
          select token
          from public.rota27_automation_credentials
          where automation_key = 'birthday-greeting-cron'
        )
      ),
      body := '{"action":"run_due","storeId":"rota27-bodega","source":"pg_cron"}'::jsonb,
      timeout_milliseconds := 20000
    );
  $$
);
