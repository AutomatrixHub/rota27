import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { authorizeDevice, permissionAtLeast } from "../_shared/device-auth.ts";

const EDGE_VERSION = "rota27-audit-v0.25.224-auth2";
const OPERATIONAL_TYPES = ["command_opened", "command_patch", "item_delta", "command_closed", "history_upsert"];
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-rota27-device-token",
  "access-control-allow-methods": "POST, OPTIONS",
};
function json(status: number, body: Record<string, unknown>) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" } }); }
function cleanText(value: unknown, max = 180) { return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max); }
function commandLabel(command: any, fallback = "Comanda") { const customer = cleanText(command?.customer, 120), table = cleanText(command?.table, 120); return [customer, table].filter(Boolean).join(" • ") || fallback; }
function commandTotal(command: any) { const direct = Number(command?.total); if (Number.isFinite(direct)) return direct; const items = command?.items && typeof command.items === "object" ? command.items : {}, meta = command?.itemMeta && typeof command.itemMeta === "object" ? command.itemMeta : {}; return Object.entries(items).reduce((sum, [id, qty]) => sum + Number(qty || 0) * Number((meta as any)?.[id]?.price || 0), 0); }
function asIso(value: unknown) { const d = new Date(String(value || "")); return Number.isNaN(d.getTime()) ? "" : d.toISOString(); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const masterSecret = Deno.env.get("ROTA27_DEVICE_TOKEN") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const storeId = cleanText(Deno.env.get("ROTA27_SYNC_STORE_ID") || "rota27-bodega", 80);
  if (!masterSecret || !supabaseUrl || !serviceRoleKey) return json(500, { ok: false, error: "Supabase não configurado." });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: "JSON inválido." }); }
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = await authorizeDevice(db, { masterSecret, storeId, suppliedToken: req.headers.get("x-rota27-device-token") || "", deviceId: cleanText(body.deviceId, 120) || undefined });
  if (!auth.ok) return json(auth.status, { ok: false, code: auth.code, error: auth.error, edgeVersion: EDGE_VERSION });
  if (!permissionAtLeast(auth, "history", "view")) return json(403, { ok: false, code: "history_view_required", error: "Auditoria não liberada para este aparelho.", edgeVersion: EDGE_VERSION });

  const startIso = asIso(body.startIso), endIso = asIso(body.endIso);
  if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) return json(400, { ok: false, error: "Período de auditoria inválido." });
  if (new Date(endIso).getTime() - new Date(startIso).getTime() > 8 * 86400000) return json(400, { ok: false, error: "Período máximo: 8 dias." });

  try {
    const { data, error } = await db.from("rota27_sync_events").select("seq,event_id,device_id,event_type,entity_id,payload,app_version,client_created_at,created_at").eq("store_id", storeId).in("event_type", OPERATIONAL_TYPES).gte("client_created_at", startIso).lt("client_created_at", endIso).order("seq", { ascending: true }).limit(5000);
    if (error) throw new Error(error.message);
    const rows = data || [], labels = new Map<string, string>(), totals = new Map<string, number>();
    for (const row of rows) { const command = (row as any)?.payload?.command; if (command) { labels.set(String((row as any).entity_id), commandLabel(command, `Comanda ${String((row as any).entity_id).slice(-6)}`)); totals.set(String((row as any).entity_id), commandTotal(command)); } }
    const missingCancelIds = [...new Set(rows.filter((row: any) => row.event_type === "command_patch" && row.payload?.patch?.cancelled === true).map((row: any) => String(row.entity_id)).filter((id: string) => id && !labels.has(id)))];
    if (missingCancelIds.length) {
      const { data: prior, error: priorError } = await db.from("rota27_sync_events").select("seq,event_type,entity_id,payload").eq("store_id", storeId).in("entity_id", missingCancelIds.slice(0, 100)).in("event_type", ["command_opened", "command_closed", "history_upsert"]).order("seq", { ascending: true }).limit(2000);
      if (!priorError) for (const row of prior || []) { const command = (row as any)?.payload?.command; if (!command) continue; const id = String((row as any).entity_id); labels.set(id, commandLabel(command, `Comanda ${id.slice(-6)}`)); totals.set(id, commandTotal(command)); }
    }
    const events: any[] = [];
    for (const row of rows as any[]) {
      const id = String(row.entity_id || ""), payload = row.payload || {}, at = row.client_created_at || row.created_at;
      let type = "", detail = "", productId = "", delta = 0, label = labels.get(id) || `Comanda ${id.slice(-6)}`, total = totals.get(id) || 0;
      if (row.event_type === "command_opened") { type = "opened"; const command = payload.command || {}; label = commandLabel(command, label); total = commandTotal(command); detail = "Comanda aberta"; }
      else if (row.event_type === "command_closed" || row.event_type === "history_upsert") { type = "closed"; const command = payload.command || {}; label = commandLabel(command, label); total = commandTotal(command); detail = "Comanda fechada"; }
      else if (row.event_type === "item_delta") { delta = Number(payload.delta || 0); if (!delta) continue; type = delta > 0 ? "item_added" : "item_removed"; productId = cleanText(payload.productId, 160); detail = `${delta > 0 ? "+" : ""}${delta}x ${cleanText(payload?.meta?.name || "Produto", 160)}`; }
      else if (row.event_type === "command_patch") { if (payload?.patch?.cancelled === true) { type = "cancelled"; detail = "Comanda cancelada"; } else { const fields = Object.keys(payload?.patch || {}).filter(k => k !== "updatedAt"); if (!fields.length) continue; type = "edited"; detail = "Dados da comanda alterados"; } }
      if (!type) continue;
      events.push({ id: `sync:${row.seq}`, seq: Number(row.seq || 0), source: "server", type, commandId: id, label, total, productId, delta, detail, deviceId: cleanText(row.device_id, 120), appVersion: cleanText(row.app_version, 40), at });
    }
    const summary = { opened: events.filter(e => e.type === "opened").length, closed: events.filter(e => e.type === "closed").length, cancelled: events.filter(e => e.type === "cancelled").length, itemAdded: events.filter(e => e.type === "item_added").length, itemRemoved: events.filter(e => e.type === "item_removed").length };
    return json(200, { ok: true, edgeVersion: EDGE_VERSION, storeId, startIso, endIso, summary, events });
  } catch (err) {
    console.error("[rota27-audit]", err);
    return json(500, { ok: false, edgeVersion: EDGE_VERSION, error: err instanceof Error ? err.message : "Falha ao consultar auditoria." });
  }
});
