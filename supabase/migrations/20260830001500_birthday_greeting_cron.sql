create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

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
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{"action":"run_due","storeId":"rota27-bodega","source":"pg_cron"}'::jsonb,
      timeout_milliseconds := 20000
    );
  $$
);
