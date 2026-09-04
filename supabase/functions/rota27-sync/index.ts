import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-sync-v0.25.181";
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
  "receivable_upsert",
  "receivable_payment",
  "turn_closure_repair",
]);

const MANAGEMENT_ACTIONS = new Set([
  "devices_list",
  "device_retire",
  "device_reactivate",
  "device_remove",
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

function canonicalizeTurnClosed(eventType: string, eventId: string, entityId: string, payload: Record<string, unknown>) {
  if (eventType !== "turn_closed") return { eventId, entityId, payload };
  const closureRaw = (payload as Record<string, any>)?.closure;
  if (!closureRaw || typeof closureRaw !== "object") return { eventId, entityId, payload };
  const businessDate = cleanText(closureRaw.businessDate, 10);
  const shiftStartedAtRaw = Number(
    closureRaw.shiftStartedAt || closureRaw.summary?.firstOpenedAt || closureRaw.summary?.shiftStart || 0,
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(businessDate) || !Number.isFinite(shiftStartedAtRaw) || shiftStartedAtRaw <= 0) {
    return { eventId, entityId, payload };
  }
  const shiftStartedAt = Math.trunc(shiftStartedAtRaw);
  const canonicalId = `turn_${businessDate}_${shiftStartedAt}`;
  const closure = { ...closureRaw, id: canonicalId, businessDate, shiftStartedAt };
  return {
    eventId: `turn_closed_${canonicalId}`,
    entityId: canonicalId,
    payload: { ...payload, closure },
  };
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
  const action = cleanText(body.action, 32);
  if (!deviceId) return json(400, { ok: false, error: "deviceId obrigatório." });

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function getDevice(id = deviceId) {
    const { data, error } = await db
      .from("rota27_sync_devices")
      .select("store_id,device_id,device_name,app_version,first_seen_at,last_seen_at,last_cursor,status,retired_at,retired_reason")
      .eq("store_id", storeId)
      .eq("device_id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  }

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

  async function updateTargetStatus(targetDeviceId: string, status: "active" | "retired" | "removed", reason = "") {
    if (!targetDeviceId) return { row: null, error: "Aparelho alvo obrigatório." };
    if (targetDeviceId === deviceId) return { row: null, error: "Este aparelho não pode ser desativado ou removido por ele mesmo." };

    const patch = status === "active"
      ? { status: "active", retired_at: null, retired_reason: null }
      : { status, retired_at: new Date().toISOString(), retired_reason: cleanText(reason, 240) || null };

    const { data, error } = await db
      .from("rota27_sync_devices")
      .update(patch)
      .eq("store_id", storeId)
      .eq("device_id", targetDeviceId)
      .select("device_id,device_name,app_version,first_seen_at,last_seen_at,last_cursor,status,retired_at,retired_reason")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { row: null, error: "Aparelho não encontrado." };
    return { row: data, error: "" };
  }

  try {
    const existingDevice = await getDevice(deviceId);
    const callerStatus = cleanText(existingDevice?.status || "active", 20) || "active";

    if (existingDevice && callerStatus !== "active") {
      return json(403, {
        ok: false,
        code: "device_inactive",
        deviceStatus: callerStatus,
        error: callerStatus === "removed"
          ? "Este aparelho foi removido da sincronização."
          : "Este aparelho está desativado para sincronização.",
        edgeVersion: EDGE_VERSION,
      });
    }

    if (MANAGEMENT_ACTIONS.has(action) && !existingDevice) {
      return json(403, {
        ok: false,
        code: "device_not_registered",
        error: "Sincronize este aparelho ao menos uma vez antes de gerenciar outros dispositivos.",
        edgeVersion: EDGE_VERSION,
      });
    }

    if (action === "devices_list") {
      await heartbeat(Number(body.afterSeq || 0));
      const includeRemoved = body.includeRemoved === true;
      let query = db
        .from("rota27_sync_devices")
        .select("device_id,device_name,app_version,first_seen_at,last_seen_at,last_cursor,status,retired_at,retired_reason")
        .eq("store_id", storeId)
        .order("last_seen_at", { ascending: false })
        .limit(100);
      if (!includeRemoved) query = query.neq("status", "removed");
      const { data: devices, error } = await query;
      if (error) throw new Error(error.message);
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        currentDeviceId: deviceId,
        devices: devices || [],
      });
    }

    if (action === "device_retire") {
      await heartbeat(Number(body.afterSeq || 0));
      const targetDeviceId = cleanText(body.targetDeviceId, 120);
      const result = await updateTargetStatus(targetDeviceId, "retired", cleanText(body.reason || "Desativado pelo gerenciamento de aparelhos", 240));
      if (result.error) return json(400, { ok: false, error: result.error, edgeVersion: EDGE_VERSION });
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, device: result.row });
    }

    if (action === "device_reactivate") {
      await heartbeat(Number(body.afterSeq || 0));
      const targetDeviceId = cleanText(body.targetDeviceId, 120);
      const result = await updateTargetStatus(targetDeviceId, "active");
      if (result.error) return json(400, { ok: false, error: result.error, edgeVersion: EDGE_VERSION });
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, device: result.row });
    }

    if (action === "device_remove") {
      await heartbeat(Number(body.afterSeq || 0));
      const targetDeviceId = cleanText(body.targetDeviceId, 120);
      const result = await updateTargetStatus(targetDeviceId, "removed", cleanText(body.reason || "Removido pelo gerenciamento de aparelhos", 240));
      if (result.error) return json(400, { ok: false, error: result.error, edgeVersion: EDGE_VERSION });
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        device: result.row,
        eventsPreserved: true,
      });
    }

    if (action === "status") {
      await heartbeat(Number(body.afterSeq || 0));
      const [latest, snapshot] = await Promise.all([latestSeq(), latestSnapshotSeq()]);
      const { data: devices, error } = await db
        .from("rota27_sync_devices")
        .select("device_id,device_name,app_version,last_seen_at,last_cursor,status,retired_at")
        .eq("store_id", storeId)
        .neq("status", "removed")
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

      const rows: Record<string, unknown>[] = [];
      for (const raw of events) {
        const rawEventId = cleanText(raw?.eventId, 160);
        const eventType = cleanText(raw?.eventType, 40);
        const rawEntityId = cleanText(raw?.entityId, 160);
        const rawPayload = raw?.payload && typeof raw.payload === "object" ? raw.payload as Record<string, unknown> : {};
        if (!rawEventId || !ALLOWED_TYPES.has(eventType)) return json(400, { ok: false, error: `Evento inválido: ${eventType || "sem tipo"}.` });
        const canonical = canonicalizeTurnClosed(eventType, rawEventId, rawEntityId, rawPayload);
        const eventId = canonical.eventId;
        const entityId = canonical.entityId;
        const payload = canonical.payload;
        if (payloadSize(payload) > 256 * 1024) return json(413, { ok: false, error: `Payload muito grande no evento ${eventId}.` });
        const row = {
          store_id: storeId,
          event_id: eventId,
          device_id: deviceId,
          event_type: eventType,
          entity_id: entityId,
          payload,
          app_version: cleanText(raw?.appVersion || appVersion, 40),
          client_created_at: raw?.createdAt ? new Date(String(raw.createdAt)).toISOString() : null,
        };
        const existingIndex = rows.findIndex((candidate: any) => candidate.event_id === eventId);
        if (existingIndex >= 0) rows[existingIndex] = row;
        else rows.push(row);
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

    return json(400, {
      ok: false,
      error: "Ação inválida. Use status, push, pull ou as ações de gerenciamento de aparelhos.",
      edgeVersion: EDGE_VERSION,
    });
  } catch (err) {
    console.error("[rota27-sync]", err);
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : "Falha interna de sincronização.",
      edgeVersion: EDGE_VERSION,
    });
  }
});