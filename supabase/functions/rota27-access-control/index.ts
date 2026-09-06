import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-access-control-v0.25.208";
const PERMISSION_KEYS = ["commands","menu","panel","history","clients","receivables","stock","purchases","inventory","settings","devices"] as const;
type PermissionKey = typeof PERMISSION_KEYS[number];
type PermissionMode = "none" | "view" | "edit";

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

function fullPermissions() {
  return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, "edit"])) as Record<PermissionKey, PermissionMode>;
}

function restrictedPermissions() {
  return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, "none"])) as Record<PermissionKey, PermissionMode>;
}

function normalizePermissions(value: unknown) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const out = restrictedPermissions();
  for (const key of PERMISSION_KEYS) {
    const mode = cleanText(source[key], 10) as PermissionMode;
    out[key] = mode === "edit" || mode === "view" ? mode : "none";
  }
  return out;
}

function accessPayload(device: any) {
  const role = cleanText(device?.access_role || "staff", 20) === "owner" ? "owner" : "staff";
  return {
    role,
    employeeName: cleanText(device?.employee_name || "", 120),
    permissions: role === "owner" ? fullPermissions() : normalizePermissions(device?.permissions),
    updatedAt: device?.permissions_updated_at || null,
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
  if (!supabaseUrl || !serviceRoleKey) return json(500, { ok: false, error: "Supabase não configurado." });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return json(400, { ok: false, error: "JSON inválido." }); }

  const requestedStore = cleanText(body.storeId || storeId, 80);
  if (requestedStore !== storeId) return json(403, { ok: false, error: "Loja não autorizada." });

  const action = cleanText(body.action, 40);
  const deviceId = cleanText(body.deviceId, 120);
  if (!deviceId) return json(400, { ok: false, error: "deviceId obrigatório." });

  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const fields = "device_id,device_name,status,employee_name,access_role,permissions,permissions_updated_at,last_seen_at,app_version,release_version";

  async function getDevice(id: string) {
    const { data, error } = await db.from("rota27_sync_devices").select(fields).eq("store_id", storeId).eq("device_id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  }

  try {
    const caller = await getDevice(deviceId);
    if (!caller) return json(403, { ok: false, code: "device_not_registered", error: "Aparelho ainda não registrado na sincronização.", edgeVersion: EDGE_VERSION });
    if (cleanText(caller.status || "active", 20) !== "active") return json(403, { ok: false, code: "device_inactive", error: "Este aparelho está bloqueado para acesso.", edgeVersion: EDGE_VERSION });

    if (action === "profile") {
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, deviceId, access: accessPayload(caller) });
    }

    if (cleanText(caller.access_role || "staff", 20) !== "owner") {
      return json(403, { ok: false, code: "owner_required", error: "Somente um aparelho proprietário pode gerenciar funcionários e permissões.", edgeVersion: EDGE_VERSION });
    }

    if (action === "list") {
      const includeRemoved = body.includeRemoved === true;
      let query = db.from("rota27_sync_devices").select(fields).eq("store_id", storeId).order("last_seen_at", { ascending: false }).limit(100);
      if (!includeRemoved) query = query.neq("status", "removed");
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        currentDeviceId: deviceId,
        devices: (data || []).map((device: any) => ({ ...device, access: accessPayload(device) })),
      });
    }

    if (action === "update") {
      const targetDeviceId = cleanText(body.targetDeviceId, 120);
      if (!targetDeviceId) return json(400, { ok: false, error: "Aparelho alvo obrigatório.", edgeVersion: EDGE_VERSION });
      if (targetDeviceId === deviceId) return json(400, { ok: false, error: "O aparelho proprietário atual não pode alterar o próprio nível de acesso.", edgeVersion: EDGE_VERSION });
      const target = await getDevice(targetDeviceId);
      if (!target) return json(404, { ok: false, error: "Aparelho não encontrado.", edgeVersion: EDGE_VERSION });

      const role = cleanText(body.role, 20) === "owner" ? "owner" : "staff";
      const employeeName = cleanText(body.employeeName, 120) || null;
      const permissions = role === "owner" ? fullPermissions() : normalizePermissions(body.permissions);
      const now = new Date().toISOString();
      const { data, error } = await db
        .from("rota27_sync_devices")
        .update({ employee_name: employeeName, access_role: role, permissions, permissions_updated_at: now })
        .eq("store_id", storeId)
        .eq("device_id", targetDeviceId)
        .select(fields)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, device: data, access: accessPayload(data) });
    }

    return json(400, { ok: false, error: "Ação inválida. Use profile, list ou update.", edgeVersion: EDGE_VERSION });
  } catch (err) {
    console.error("[rota27-access-control]", err);
    return json(500, { ok: false, error: err instanceof Error ? err.message : "Falha interna.", edgeVersion: EDGE_VERSION });
  }
});
