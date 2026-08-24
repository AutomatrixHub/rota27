import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-audit-v0.18.1";
const OPERATIONAL_TYPES = [
  "command_opened",
  "command_patch",
  "item_delta",
  "command_closed",
  "history_upsert",
];

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

function cleanText(value: unknown, max = 180) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function commandLabel(command: any, fallback = "Comanda") {
  const customer = cleanText(command?.customer, 120);
  const table = cleanText(command?.table, 120);
  return [customer, table].filter(Boolean).join(" • ") || fallback;
}

function commandTotal(command: any) {
  const direct = Number(command?.total);
  if (Number.isFinite(direct)) return direct;
  const items = command?.items && typeof command.items === "object" ? command.items : {};
  const meta = command?.itemMeta && typeof command.itemMeta === "object" ? command.itemMeta : {};
  return Object.entries(items).reduce((sum, [id, qty]) => {
    const price = Number((meta as any)?.[id]?.price || 0);
    return sum + Number(qty || 0) * price;
  }, 0);
}

function asIso(value: unknown) {
  const d = new Date(String(value || ""));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
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

  const startIso = asIso(body.startIso);
  const endIso = asIso(body.endIso);
  if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) {
    return json(400, { ok: false, error: "Período de auditoria inválido." });
  }
  const spanMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (spanMs > 8 * 86400000) return json(400, { ok: false, error: "Período máximo: 8 dias." });

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await db
      .from("rota27_sync_events")
      .select("seq,event_id,device_id,event_type,entity_id,payload,app_version,client_created_at,created_at")
      .eq("store_id", storeId)
      .in("event_type", OPERATIONAL_TYPES)
      .gte("client_created_at", startIso)
      .lt("client_created_at", endIso)
      .order("seq", { ascending: true })
      .limit(5000);
    if (error) throw new Error(error.message);

    const rows = data || [];
    const labels = new Map<string, string>();
    const totals = new Map<string, number>();

    for (const row of rows) {
      const command = (row as any)?.payload?.command;
      if (command) {
        labels.set(String((row as any).entity_id), commandLabel(command, `Comanda ${String((row as any).entity_id).slice(-6)}`));
        totals.set(String((row as any).entity_id), commandTotal(command));
      }
    }

    const missingCancelIds = [...new Set(rows
      .filter((row: any) => row.event_type === "command_patch" && row.payload?.patch?.cancelled === true)
      .map((row: any) => String(row.entity_id))
      .filter((id: string) => id && !labels.has(id)))];

    if (missingCancelIds.length) {
      const { data: prior, error: priorError } = await db
        .from("rota27_sync_events")
        .select("seq,event_type,entity_id,payload")
        .eq("store_id", storeId)
        .in("entity_id", missingCancelIds.slice(0, 100))
        .in("event_type", ["command_opened", "command_closed", "history_upsert"])
        .order("seq", { ascending: true })
        .limit(2000);
      if (!priorError) {
        for (const row of prior || []) {
          const command = (row as any)?.payload?.command;
          if (!command) continue;
          const id = String((row as any).entity_id);
          labels.set(id, commandLabel(command, `Comanda ${id.slice(-6)}`));
          totals.set(id, commandTotal(command));
        }
      }
    }

    const events: any[] = [];
    for (const row of rows as any[]) {
      const id = String(row.entity_id || "");
      const payload = row.payload || {};
      const at = row.client_created_at || row.created_at;
      let type = "";
      let detail = "";
      let productId = "";
      let delta = 0;
      let label = labels.get(id) || `Comanda ${id.slice(-6)}`;
      let total = totals.get(id) || 0;

      if (row.event_type === "command_opened") {
        type = "opened";
        const command = payload.command || {};
        label = commandLabel(command, label);
        total = commandTotal(command);
        detail = "Comanda aberta";
      } else if (row.event_type === "command_closed" || row.event_type === "history_upsert") {
        type = "closed";
        const command = payload.command || {};
        label = commandLabel(command, label);
        total = commandTotal(command);
        detail = "Comanda fechada";
      } else if (row.event_type === "item_delta") {
        delta = Number(payload.delta || 0);
        if (!delta) continue;
        type = delta > 0 ? "item_added" : "item_removed";
        productId = cleanText(payload.productId, 160);
        const name = cleanText(payload?.meta?.name || "Produto", 160);
        detail = `${delta > 0 ? "+" : ""}${delta}x ${name}`;
      } else if (row.event_type === "command_patch") {
        if (payload?.patch?.cancelled === true) {
          type = "cancelled";
          detail = "Comanda cancelada";
        } else {
          const fields = Object.keys(payload?.patch || {}).filter(k => !["updatedAt"].includes(k));
          if (!fields.length) continue;
          type = "edited";
          detail = "Dados da comanda alterados";
        }
      }
      if (!type) continue;

      events.push({
        id: `sync:${row.seq}`,
        seq: Number(row.seq || 0),
        source: "server",
        type,
        commandId: id,
        label,
        total,
        productId,
        delta,
        detail,
        deviceId: cleanText(row.device_id, 120),
        appVersion: cleanText(row.app_version, 40),
        at,
      });
    }

    const summary = {
      opened: events.filter(e => e.type === "opened").length,
      closed: events.filter(e => e.type === "closed").length,
      cancelled: events.filter(e => e.type === "cancelled").length,
      itemAdded: events.filter(e => e.type === "item_added").length,
      itemRemoved: events.filter(e => e.type === "item_removed").length,
    };

    return json(200, {
      ok: true,
      edgeVersion: EDGE_VERSION,
      storeId,
      startIso,
      endIso,
      summary,
      events,
    });
  } catch (err) {
    console.error("[rota27-audit]", err);
    return json(500, {
      ok: false,
      edgeVersion: EDGE_VERSION,
      error: err instanceof Error ? err.message : "Falha ao consultar auditoria.",
    });
  }
});
