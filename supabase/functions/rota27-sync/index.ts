import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-sync-v0.23.0";
const ALLOWED_TYPES = new Set([
  "state_snapshot",
  "command_opened",
  "command_patch",
  "item_delta",
  "command_closed",
  "history_upsert",
  "catalog_upsert",
  "catalog_delete",
  "categories_replace",
  "client_upsert",
  "client_delete",
  "manager_config_replace",
  "turn_closed",
  "stock_config_upsert",
  "stock_movement",
  "supplier_upsert",
  "purchase_order_upsert",
  "purchase_receipt",
  "inventory_upsert",
]);

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-rota27-device-token",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cleanText(value: unknown, max = 160) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function payloadSize(value: unknown) {
  try { return new TextEncoder().encode(JSON.stringify(value ?? {})).length; }
  catch { return Number.MAX_SAFE_INTEGER; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const expectedToken = Deno.env.get("ROTA27_DEVICE_TOKEN") || "";
  const suppliedToken = req.headers.get("x-rota27-device-token") || "";
  if (!safeEqual(expectedToken, suppliedToken)) return json(401, { ok: false, error: "Dispositivo não autorizado." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const storeId = cleanText(Deno.env.get("ROTA27_SYNC_STORE_ID") || "rota27-bodega", 80);
  if (!supabaseUrl || !serviceRoleKey) return json(500, { ok: false, error: "Supabase não configurado na Edge Function." });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: "JSON inválido." }); }

  const requestedStore = cleanText(body.storeId || storeId, 80);
  if (requestedStore !== storeId) return json(403, { ok: false, error: "Loja não autorizada para este endpoint." });

  const deviceId = cleanText(body.deviceId, 120);
  const deviceName = cleanText(body.deviceName || "Aparelho", 80);
  const appVersion = cleanText(body.appVersion || "", 40);
  const action = cleanText(body.action, 24);
  if (!deviceId) return json(400, { ok: false, error: "deviceId obrigatório." });

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function heartbeat(cursor = 0) {
    const row = {
      store_id: storeId,
      device_id: deviceId,
      device_name: deviceName || "Aparelho",
      app_version: appVersion,
      last_seen_at: new Date().toISOString(),
      last_cursor: Math.max(0, Number(cursor || 0)),
    };
    const { error } = await db.from("rota27_sync_devices").upsert(row, { onConflict: "store_id,device_id" });
    if (error) throw new Error(`Falha ao atualizar aparelho: ${error.message}`);
  }

  async function latestSeq() {
    const { data, error } = await db
      .from("rota27_sync_events")
      .select("seq")
      .eq("store_id", storeId)
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Number(data?.seq || 0);
  }

  async function latestSnapshotSeq() {
    const { data, error } = await db
      .from("rota27_sync_events")
      .select("seq")
      .eq("store_id", storeId)
      .eq("event_type", "state_snapshot")
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Number(data?.seq || 0);
  }

  try {
    if (action === "status") {
      await heartbeat(Number(body.afterSeq || 0));
      const [latest, snapshot] = await Promise.all([latestSeq(), latestSnapshotSeq()]);
      const { data: devices, error } = await db
        .from("rota27_sync_devices")
        .select("device_id,device_name,app_version,last_seen_at,last_cursor")
        .eq("store_id", storeId)
        .order("last_seen_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        storeId,
        latestSeq: latest,
        latestSnapshotSeq: snapshot,
        devices: devices || [],
      });
    }

    if (action === "push") {
      const events = Array.isArray(body.events) ? body.events : [];
      if (!events.length) {
        await heartbeat(Number(body.afterSeq || 0));
        return json(200, { ok: true, edgeVersion: EDGE_VERSION, accepted: 0, latestSeq: await latestSeq() });
      }
      if (events.length > 200) return json(400, { ok: false, error: "Máximo de 200 eventos por envio." });
      if (payloadSize(events) > 1024 * 1024) return json(413, { ok: false, error: "Lote de sincronização acima de 1 MB." });

      const rows = [];
      for (const raw of events) {
        const eventId = cleanText(raw?.eventId, 160);
        const eventType = cleanText(raw?.eventType, 40);
        const entityId = cleanText(raw?.entityId, 160);
        const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : {};
        if (!eventId || !ALLOWED_TYPES.has(eventType)) return json(400, { ok: false, error: `Evento inválido: ${eventType || "sem tipo"}.` });
        if (payloadSize(payload) > 256 * 1024) return json(413, { ok: false, error: `Payload muito grande no evento ${eventId}.` });
        rows.push({
          store_id: storeId,
          event_id: eventId,
          device_id: deviceId,
          event_type: eventType,
          entity_id: entityId,
          payload,
          app_version: cleanText(raw?.appVersion || appVersion, 40),
          client_created_at: raw?.createdAt ? new Date(String(raw.createdAt)).toISOString() : null,
        });
      }

      const { error } = await db
        .from("rota27_sync_events")
        .upsert(rows, { onConflict: "store_id,event_id", ignoreDuplicates: true });
      if (error) throw new Error(error.message);
      await heartbeat(Number(body.afterSeq || 0));
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        accepted: rows.length,
        latestSeq: await latestSeq(),
      });
    }

    if (action === "pull") {
      const afterSeq = clampInt(body.afterSeq, 0, Number.MAX_SAFE_INTEGER, 0);
      const limit = clampInt(body.limit, 1, 500, 300);
      const preferSnapshot = body.preferSnapshot === true && afterSeq === 0;
      let effectiveAfter = afterSeq;
      let bootstrapFromSnapshot = false;

      if (preferSnapshot) {
        const snapshot = await latestSnapshotSeq();
        if (snapshot > 0) {
          effectiveAfter = Math.max(0, snapshot - 1);
          bootstrapFromSnapshot = true;
        }
      }

      const { data, error } = await db
        .from("rota27_sync_events")
        .select("seq,event_id,device_id,event_type,entity_id,payload,app_version,client_created_at,created_at")
        .eq("store_id", storeId)
        .gt("seq", effectiveAfter)
        .order("seq", { ascending: true })
        .limit(limit);
      if (error) throw new Error(error.message);

      const events = data || [];
      const lastReturned = events.length ? Number(events[events.length - 1].seq || effectiveAfter) : effectiveAfter;
      const latest = await latestSeq();
      await heartbeat(lastReturned);
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        events,
        latestSeq: latest,
        cursor: lastReturned,
        hasMore: lastReturned < latest,
        bootstrapFromSnapshot,
      });
    }

    return json(400, { ok: false, error: "Ação inválida. Use status, push ou pull." });
  } catch (err) {
    console.error("[rota27-sync]", err);
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : "Falha interna de sincronização.",
      edgeVersion: EDGE_VERSION,
    });
  }
});
