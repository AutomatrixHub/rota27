import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type AccessRole = "owner" | "staff" | "developer";
export type PermissionMode = "none" | "view" | "edit";

export type DeviceAuth = {
  ok: true;
  legacyMaster: boolean;
  deviceId: string;
  role: AccessRole;
  permissions: Record<string, unknown>;
  device: Record<string, unknown> | null;
};

export type DeviceAuthError = {
  ok: false;
  status: number;
  code: string;
  error: string;
  deviceStatus?: string;
};

function clean(value: unknown, max = 160) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function deriveDeviceToken(masterSecret: string, storeId: string, deviceId: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`rota27-device-v1|${storeId}|${deviceId}`),
  ));
  return `r27d_${base64Url(signature)}`;
}

export function roleOf(value: unknown): AccessRole {
  const role = clean(value || "staff", 20);
  return role === "developer" ? "developer" : role === "owner" ? "owner" : "staff";
}

export function privileged(role: AccessRole) {
  return role === "owner" || role === "developer";
}

export function permissionAtLeast(auth: DeviceAuth, key: string, needed: "view" | "edit" = "view") {
  if (privileged(auth.role)) return true;
  const mode = clean(auth.permissions?.[key], 10) as PermissionMode;
  if (needed === "edit") return mode === "edit";
  return mode === "view" || mode === "edit";
}

export async function authorizeDevice(
  db: SupabaseClient,
  options: {
    masterSecret: string;
    storeId: string;
    suppliedToken: string;
    deviceId?: string;
    requireRegisteredForMaster?: boolean;
  },
): Promise<DeviceAuth | DeviceAuthError> {
  const { masterSecret, storeId, suppliedToken } = options;
  const hintedDeviceId = clean(options.deviceId, 120);
  if (masterSecret.length < 16 || suppliedToken.length < 16) {
    return { ok: false, status: 401, code: "device_unauthorized", error: "Dispositivo não autorizado." };
  }

  const fields = "device_id,device_name,status,access_role,permissions,last_seen_at,app_version,release_version";
  async function loadDevice(id: string) {
    const { data, error } = await db.from("rota27_sync_devices").select(fields).eq("store_id", storeId).eq("device_id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data || null;
  }
  function fromDevice(device: any, legacyMaster: boolean): DeviceAuth | DeviceAuthError {
    if (!device) return { ok: false, status: 403, code: "device_not_registered", error: "Aparelho ainda não registrado." };
    const status = clean(device.status || "active", 20) || "active";
    if (status !== "active") {
      return {
        ok: false,
        status: 403,
        code: "device_inactive",
        deviceStatus: status,
        error: status === "removed" ? "Este aparelho foi removido." : "Este aparelho está desativado.",
      };
    }
    return {
      ok: true,
      legacyMaster,
      deviceId: clean(device.device_id, 120),
      role: roleOf(device.access_role),
      permissions: device.permissions && typeof device.permissions === "object" ? device.permissions : {},
      device,
    };
  }

  if (safeEqual(masterSecret, suppliedToken)) {
    if (!hintedDeviceId && options.requireRegisteredForMaster !== true) {
      return { ok: true, legacyMaster: true, deviceId: "", role: "developer", permissions: {}, device: null };
    }
    if (!hintedDeviceId) return { ok: false, status: 400, code: "device_id_required", error: "deviceId obrigatório." };
    return fromDevice(await loadDevice(hintedDeviceId), true);
  }

  if (hintedDeviceId) {
    const expected = await deriveDeviceToken(masterSecret, storeId, hintedDeviceId);
    if (!safeEqual(expected, suppliedToken)) {
      return { ok: false, status: 401, code: "device_unauthorized", error: "Dispositivo não autorizado." };
    }
    return fromDevice(await loadDevice(hintedDeviceId), false);
  }

  const { data, error } = await db
    .from("rota27_sync_devices")
    .select(fields)
    .eq("store_id", storeId)
    .eq("status", "active")
    .limit(200);
  if (error) throw new Error(error.message);
  for (const device of data || []) {
    const deviceId = clean(device?.device_id, 120);
    if (!deviceId) continue;
    const expected = await deriveDeviceToken(masterSecret, storeId, deviceId);
    if (safeEqual(expected, suppliedToken)) return fromDevice(device, false);
  }
  return { ok: false, status: 401, code: "device_unauthorized", error: "Dispositivo não autorizado." };
}
