alter table public.rota27_sync_events
  drop constraint if exists rota27_sync_events_type_ck;

alter table public.rota27_sync_events
  add constraint rota27_sync_events_type_ck
  check (
    event_type = any (
      array[
        'state_snapshot'::text,
        'command_opened'::text,
        'command_patch'::text,
        'item_delta'::text,
        'command_closed'::text,
        'history_upsert'::text,
        'catalog_upsert'::text,
        'catalog_delete'::text,
        'categories_replace'::text,
        'client_upsert'::text,
        'client_delete'::text,
        'manager_config_replace'::text,
        'turn_closed'::text,
        'stock_config_upsert'::text,
        'stock_movement'::text,
        'supplier_upsert'::text,
        'purchase_order_upsert'::text,
        'purchase_receipt'::text,
        'inventory_upsert'::text
      ]
    )
  );
