import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-device-enroll-v0.25.215";
const PERMISSION_KEYS = ["commands", "menu", "panel", "history", "clients", "receivables", "stock", "purchases", "inventory", "settings", "devices"] as const;
type PermissionKey = typeof PERMISSION_KEYS[number];
type PermissionMode = "none" | "view" | "edit";
type AccessRole = "owner" | "staff" | "developer";

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

function roleOf(value: unknown): AccessRole {
  const role = cleanText(value || "staff", 20);
  return role === "developer" ? "developer" : role === "owner" ? "owner" : "staff";
}

function privileged(role: AccessRole) {
  return role === "owner" || role === "developer";
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

function accessPayload(roleValue: unknown, employeeName: unknown, permissionsValue: unknown, updatedAt: unknown = null) {
  const technicalRole = roleOf(roleValue);
  const role = technicalRole === "developer" ? "owner" : technicalRole;
  return {
    role,
    technicalRole,
    employeeName: cleanText(employeeName || "", 120),
    permissions: privileged(technicalRole) ? fullPermissions() : normalizePermissions(permissionsValue),
    updatedAt: updatedAt || null,
  };
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomSecret(bytes = 24) {
  const raw = new Uint8Array(bytes);
  crypto.getRandomValues(raw);
  return base64Url(raw);
}

function randomCode() {
  const raw = new Uint32Array(1);
  crypto.getRandomValues(raw);
  return String(raw[0] % 100000000).padStart(8, "0");
}

async function sha256Hex(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function deriveDeviceToken(masterSecret: string, storeId: string, deviceId: string) {
  const key = await crypto.subtle.importKey("raw",new TextEncoder().encode(masterSecret),{ name: "HMAC", hash: "SHA-256" },false,["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(`rota27-device-v1|${storeId}|${deviceId}`)));
  return `r27d_${base64Url(signature)}`;
}

async function tokenMatches(masterSecret: string, storeId: string, deviceId: string, supplied: string) {
  if (safeEqual(masterSecret, supplied)) return true;
  if (!deviceId || !masterSecret || !supplied) return false;
  const expected = await deriveDeviceToken(masterSecret, storeId, deviceId);
  return safeEqual(expected, supplied);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const masterSecret = Deno.env.get("ROTA27_DEVICE_TOKEN") || "";
  const storeId = cleanText(Deno.env.get("ROTA27_SYNC_STORE_ID") || "rota27-bodega", 80);
  if (!supabaseUrl || !serviceRoleKey || !masterSecret) return json(500, { ok: false, error: "Serviço de vínculo não configurado.", edgeVersion: EDGE_VERSION });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: "JSON inválido.", edgeVersion: EDGE_VERSION }); }
  const action = cleanText(body.action, 40);
  const requestedStore = cleanText(body.storeId || storeId, 80);
  if (requestedStore !== storeId) return json(403, { ok: false, error: "Loja não autorizada.", edgeVersion: EDGE_VERSION });

  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  async function getDevice(deviceId: string) {
    const { data, error } = await db.from("rota27_sync_devices").select("device_id,device_name,status,employee_name,access_role,permissions,permissions_updated_at").eq("store_id", storeId).eq("device_id", deviceId).maybeSingle();
    if (error) throw new Error(error.message); return data || null;
  }
  async function authenticateManager() {
    const deviceId = cleanText(body.deviceId, 120), supplied = req.headers.get("x-rota27-device-token") || "";
    if (!deviceId || !(await tokenMatches(masterSecret, storeId, deviceId, supplied))) return { ok:false as const,response:json(401,{ok:false,code:"device_unauthorized",error:"Aparelho não autorizado.",edgeVersion:EDGE_VERSION})};
    const device = await getDevice(deviceId);
    if (!device) return { ok:false as const,response:json(403,{ok:false,code:"device_not_registered",error:"Aparelho ainda não registrado.",edgeVersion:EDGE_VERSION})};
    if (cleanText(device.status || "active",20)!=="active") return { ok:false as const,response:json(403,{ok:false,code:"device_inactive",error:"Este aparelho está bloqueado.",edgeVersion:EDGE_VERSION})};
    const role=roleOf(device.access_role), permissions=normalizePermissions(device.permissions);
    if (!privileged(role)&&permissions.devices!=="edit") return {ok:false as const,response:json(403,{ok:false,code:"devices_edit_required",error:"Gerenciamento de aparelhos não liberado para este dispositivo.",edgeVersion:EDGE_VERSION})};
    return {ok:true as const,deviceId,device,role,permissions};
  }

  try {
    if (action === "create") {
      const auth=await authenticateManager(); if(!auth.ok)return auth.response;
      const requestedRole=cleanText(body.role,20)==="owner"?"owner":"staff";
      if(requestedRole==="owner"&&!privileged(auth.role))return json(403,{ok:false,code:"owner_required",error:"Somente proprietário pode autorizar outro proprietário.",edgeVersion:EDGE_VERSION});
      const employeeName=cleanText(body.employeeName,120)||null,permissions=requestedRole==="owner"?fullPermissions():normalizePermissions(body.permissions),now=new Date(),expiresAt=new Date(now.getTime()+5*60*1000).toISOString(),enrollmentId=crypto.randomUUID(),qrSecret=randomSecret(24),qrSecretHash=await sha256Hex(qrSecret);
      let code="",codeHash="";
      for(let attempt=0;attempt<12;attempt++){
        code=randomCode();codeHash=await sha256Hex(code);
        const {data,error}=await db.from("rota27_device_enrollments").select("enrollment_id").eq("store_id",storeId).eq("code_hash",codeHash).is("claimed_at",null).is("revoked_at",null).gt("expires_at",now.toISOString()).limit(1);
        if(error)throw new Error(error.message);if(!data?.length)break;code="";
      }
      if(!code)throw new Error("Não foi possível gerar um código temporário exclusivo.");
      const {error}=await db.from("rota27_device_enrollments").insert({enrollment_id:enrollmentId,store_id:storeId,code_hash:codeHash,qr_secret_hash:qrSecretHash,created_by_device_id:auth.deviceId,employee_name:employeeName,access_role:requestedRole,permissions,expires_at:expiresAt,created_at:now.toISOString()});
      if(error)throw new Error(error.message);
      await db.from("rota27_device_enrollments").delete().eq("store_id",storeId).lt("created_at",new Date(now.getTime()-7*24*60*60*1000).toISOString());
      return json(200,{ok:true,edgeVersion:EDGE_VERSION,enrollmentId,qrSecret,code,expiresAt,role:requestedRole,permissions});
    }

    if(action==="revoke"){
      const auth=await authenticateManager();if(!auth.ok)return auth.response;
      const targetEnrollmentId=cleanText(body.targetEnrollmentId,80);if(!targetEnrollmentId)return json(400,{ok:false,error:"Convite obrigatório.",edgeVersion:EDGE_VERSION});
      const now=new Date().toISOString();const {data,error}=await db.from("rota27_device_enrollments").update({revoked_at:now}).eq("store_id",storeId).eq("enrollment_id",targetEnrollmentId).is("claimed_at",null).select("enrollment_id").maybeSingle();
      if(error)throw new Error(error.message);if(!data)return json(404,{ok:false,error:"Convite não encontrado ou já utilizado.",edgeVersion:EDGE_VERSION});
      return json(200,{ok:true,edgeVersion:EDGE_VERSION,enrollmentId:targetEnrollmentId,revokedAt:now});
    }

    if(action==="claim"){
      const enrollmentId=cleanText(body.enrollmentId,80),qrSecret=cleanText(body.qrSecret,220),code=cleanText(body.code,20).replace(/\D/g,""),claimNonce=cleanText(body.claimNonce,160),deviceName=cleanText(body.deviceName||"Aparelho",80)||"Aparelho",appVersion=cleanText(body.appVersion||"",40);
      if(claimNonce.length<16)return json(400,{ok:false,error:"Identificador de vínculo inválido.",edgeVersion:EDGE_VERSION});
      if(!qrSecret&&code.length!==8)return json(400,{ok:false,error:"Informe o QR Code ou os 8 números do convite.",edgeVersion:EDGE_VERSION});
      let query=db.from("rota27_device_enrollments").select("*").eq("store_id",storeId);
      if(enrollmentId)query=query.eq("enrollment_id",enrollmentId);else query=query.eq("code_hash",await sha256Hex(code)).order("created_at",{ascending:false}).limit(1);
      const {data:found,error:findError}=await query.maybeSingle();if(findError)throw new Error(findError.message);if(!found)return json(404,{ok:false,code:"invite_not_found",error:"Convite não encontrado.",edgeVersion:EDGE_VERSION});
      if(found.revoked_at)return json(410,{ok:false,code:"invite_revoked",error:"Este convite foi cancelado.",edgeVersion:EDGE_VERSION});
      const suppliedHash=await sha256Hex(qrSecret||code),expectedHash=cleanText(qrSecret?found.qr_secret_hash:found.code_hash,128);
      if(!safeEqual(expectedHash,suppliedHash))return json(401,{ok:false,code:"invite_invalid",error:qrSecret?"QR Code inválido.":"Código inválido.",edgeVersion:EDGE_VERSION});
      const now=new Date();let claimed=found;
      if(found.claimed_at){
        if(!safeEqual(cleanText(found.claim_nonce,160),claimNonce))return json(409,{ok:false,code:"invite_used",error:"Este convite já foi usado por outro aparelho.",edgeVersion:EDGE_VERSION});
        const claimedAt=new Date(found.claimed_at).getTime();if(!Number.isFinite(claimedAt)||now.getTime()-claimedAt>15*60*1000)return json(410,{ok:false,code:"claim_recovery_expired",error:"O vínculo já foi concluído. Gere um novo convite se precisar repetir.",edgeVersion:EDGE_VERSION});
      }else{
        const expires=new Date(found.expires_at).getTime();if(!Number.isFinite(expires)||expires<=now.getTime())return json(410,{ok:false,code:"invite_expired",error:"Este convite expirou. Gere um novo QR Code.",edgeVersion:EDGE_VERSION});
        const newDeviceId=`dev_${crypto.randomUUID()}`;
        const {data:updated,error:updateError}=await db.from("rota27_device_enrollments").update({claimed_at:now.toISOString(),claimed_device_id:newDeviceId,claim_nonce:claimNonce}).eq("store_id",storeId).eq("enrollment_id",found.enrollment_id).is("claimed_at",null).is("revoked_at",null).gt("expires_at",now.toISOString()).select("*").maybeSingle();
        if(updateError)throw new Error(updateError.message);
        if(!updated){const {data:raced,error:raceError}=await db.from("rota27_device_enrollments").select("*").eq("store_id",storeId).eq("enrollment_id",found.enrollment_id).maybeSingle();if(raceError)throw new Error(raceError.message);if(!raced||!safeEqual(cleanText(raced.claim_nonce,160),claimNonce))return json(409,{ok:false,code:"invite_used",error:"Este convite acabou de ser usado por outro aparelho.",edgeVersion:EDGE_VERSION});claimed=raced;}else claimed=updated;
      }
      const deviceId=cleanText(claimed.claimed_device_id,120);if(!deviceId)throw new Error("Convite utilizado sem aparelho associado.");
      const role=cleanText(claimed.access_role||"staff",20)==="owner"?"owner":"staff",permissions=role==="owner"?fullPermissions():normalizePermissions(claimed.permissions),employeeName=cleanText(claimed.employee_name,120)||null,deviceToken=await deriveDeviceToken(masterSecret,storeId,deviceId),accessUpdatedAt=claimed.claimed_at||now.toISOString();
      const {error:deviceError}=await db.from("rota27_sync_devices").upsert({store_id:storeId,device_id:deviceId,device_name:deviceName,app_version:appVersion,last_seen_at:now.toISOString(),last_cursor:0,status:"active",retired_at:null,retired_reason:null,employee_name:employeeName,access_role:role,permissions,permissions_updated_at:accessUpdatedAt,release_version:appVersion},{onConflict:"store_id,device_id"});if(deviceError)throw new Error(deviceError.message);
      const {data:snapshotRow,error:snapshotError}=await db.from("rota27_sync_events").select("seq").eq("store_id",storeId).eq("event_type","state_snapshot").order("seq",{ascending:false}).limit(1).maybeSingle();if(snapshotError)throw new Error(snapshotError.message);
      return json(200,{ok:true,edgeVersion:EDGE_VERSION,enrollmentId:claimed.enrollment_id,storeId,deviceId,deviceName,deviceToken,syncUrl:`${supabaseUrl}/functions/v1/rota27-sync`,access:accessPayload(role,employeeName,permissions,accessUpdatedAt),latestSnapshotSeq:Number(snapshotRow?.seq||0)});
    }
    return json(400,{ok:false,error:"Ação inválida. Use create, revoke ou claim.",edgeVersion:EDGE_VERSION});
  }catch(err){console.error("[rota27-device-enroll]",err);return json(500,{ok:false,error:err instanceof Error?err.message:"Falha interna no vínculo do aparelho.",edgeVersion:EDGE_VERSION});}
});
