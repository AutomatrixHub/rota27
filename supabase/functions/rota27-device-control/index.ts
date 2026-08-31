import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-device-control-v0.25.86";
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
function clampInt(value: unknown, min = 0, max = 5000) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(min, Math.floor(n)));
}
function pending(requested: unknown, ack: unknown) {
  if (!requested) return false;
  const r = new Date(String(requested)).getTime();
  const a = ack ? new Date(String(ack)).getTime() : 0;
  return Number.isFinite(r) && r > a;
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
  if (!supabaseUrl || !serviceRoleKey) return json(500, { ok: false, error: "Supabase não configurado." });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: "JSON inválido." }); }

  const requestedStore = cleanText(body.storeId || storeId, 80);
  if (requestedStore !== storeId) return json(403, { ok: false, error: "Loja não autorizada." });
  const action = cleanText(body.action, 40);
  const deviceId = cleanText(body.deviceId, 120);
  const deviceName = cleanText(body.deviceName || "Aparelho", 80);
  const appVersion = cleanText(body.appVersion || "", 40);
  if (!deviceId) return json(400, { ok: false, error: "deviceId obrigatório." });

  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const deviceFields = "device_id,device_name,app_version,first_seen_at,last_seen_at,last_cursor,status,retired_at,retired_reason,whatsapp_configured,whatsapp_pending_count,whatsapp_failed_count,whatsapp_last_error,whatsapp_telemetry_at,requested_sync_at,sync_request_ack_at,requested_diagnostic_at,diagnostic_request_ack_at";

  async function getDevice(id: string) {
    const { data, error } = await db.from("rota27_sync_devices").select(deviceFields).eq("store_id", storeId).eq("device_id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  }

  try {
    const caller = await getDevice(deviceId);
    if (!caller) return json(403, { ok: false, code: "device_not_registered", error: "Aparelho ainda não registrado na sincronização.", edgeVersion: EDGE_VERSION });
    const callerStatus = cleanText(caller.status || "active", 20) || "active";
    if (callerStatus !== "active") return json(403, { ok: false, code: "device_inactive", deviceStatus: callerStatus, error: callerStatus === "removed" ? "Este aparelho foi removido da sincronização." : "Este aparelho está desativado para sincronização.", edgeVersion: EDGE_VERSION });

    if (action === "agent") {
      const telemetry = body.telemetry && typeof body.telemetry === "object" ? body.telemetry as Record<string, unknown> : {};
      const now = new Date().toISOString();
      const patch: Record<string, unknown> = {
        device_name: deviceName || caller.device_name || "Aparelho",
        app_version: appVersion || caller.app_version || "",
        last_seen_at: now,
      };
      if (Object.keys(telemetry).length) {
        const configured = telemetry.whatsappConfigured;
        patch.whatsapp_configured = configured === true ? true : configured === false ? false : null;
        patch.whatsapp_pending_count = clampInt(telemetry.pendingCount, 0, 5000);
        patch.whatsapp_failed_count = clampInt(telemetry.failedCount, 0, 5000);
        patch.whatsapp_last_error = cleanText(telemetry.lastError || "", 300) || null;
        patch.whatsapp_telemetry_at = now;
      }

      const ackSyncRequestAt = cleanText(body.ackSyncRequestAt, 80);
      const ackDiagnosticRequestAt = cleanText(body.ackDiagnosticRequestAt, 80);
      if (ackSyncRequestAt && caller.requested_sync_at && new Date(ackSyncRequestAt).getTime() === new Date(String(caller.requested_sync_at)).getTime()) patch.sync_request_ack_at = now;
      if (ackDiagnosticRequestAt && caller.requested_diagnostic_at && new Date(ackDiagnosticRequestAt).getTime() === new Date(String(caller.requested_diagnostic_at)).getTime()) patch.diagnostic_request_ack_at = now;

      const { data: updated, error } = await db.from("rota27_sync_devices").update(patch).eq("store_id", storeId).eq("device_id", deviceId).select(deviceFields).maybeSingle();
      if (error) throw new Error(error.message);
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        requestedSyncAt: pending(updated?.requested_sync_at, updated?.sync_request_ack_at) ? updated?.requested_sync_at : null,
        requestedDiagnosticAt: pending(updated?.requested_diagnostic_at, updated?.diagnostic_request_ack_at) ? updated?.requested_diagnostic_at : null,
      });
    }

    if (action === "list") {
      const includeRemoved = body.includeRemoved === true;
      let query = db.from("rota27_sync_devices").select(deviceFields).eq("store_id", storeId).order("last_seen_at", { ascending: false }).limit(100);
      if (!includeRemoved) query = query.neq("status", "removed");
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, currentDeviceId: deviceId, devices: data || [] });
    }

    if (action === "request_sync" || action === "request_diagnostic") {
      const targetDeviceId = cleanText(body.targetDeviceId, 120);
      if (!targetDeviceId) return json(400, { ok: false, error: "Aparelho alvo obrigatório.", edgeVersion: EDGE_VERSION });
      const target = await getDevice(targetDeviceId);
      if (!target) return json(404, { ok: false, error: "Aparelho não encontrado.", edgeVersion: EDGE_VERSION });
      if (cleanText(target.status || "active", 20) !== "active") return json(409, { ok: false, error: "Apenas aparelhos ativos podem receber solicitações remotas.", edgeVersion: EDGE_VERSION });
      const now = new Date().toISOString();
      const patch = action === "request_sync" ? { requested_sync_at: now } : { requested_diagnostic_at: now };
      const { data, error } = await db.from("rota27_sync_devices").update(patch).eq("store_id", storeId).eq("device_id", targetDeviceId).select(deviceFields).maybeSingle();
      if (error) throw new Error(error.message);
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, device: data });
    }

    return json(400, { ok: false, error: "Ação inválida. Use agent, list, request_sync ou request_diagnostic.", edgeVersion: EDGE_VERSION });
  } catch (err) {
    console.error("[rota27-device-control]", err);
    return json(500, { ok: false, error: err instanceof Error ? err.message : "Falha interna.", edgeVersion: EDGE_VERSION });
  }
});
