import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-event-campaign-v1";
const TEMPLATE_NAME = "convite_evento_rota27_v1";
const TEMPLATE_LANG = "pt_BR";
const CAMPAIGN = "event_invite_v1";
const STORE_ID_DEFAULT = "rota27-bodega";
const ROTA27_WABA_ID = "2184585049047021";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-rota27-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" };

function json(status: number, body: unknown) { return new Response(JSON.stringify(body), { status, headers: jsonHeaders }); }
function clean(value: unknown, max = 500) { return String(value ?? "").replace(/\u0000/g, "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max); }
function digits(value: unknown) { return String(value ?? "").replace(/\D/g, ""); }
function normalizePhone(value: unknown) { let d = digits(value).replace(/^0+/, ""); if (d.length === 10 || d.length === 11) d = `55${d}`; return d; }
function validPhone(value: string) { return value.length >= 12 && value.length <= 15; }
function safeEqual(a: string, b: string) { const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b); if (ea.length !== eb.length) return false; let diff = 0; for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i]; return diff === 0; }
function eventKey(value: unknown) { const raw = clean(value, 120).replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_"); return raw.slice(0, 100); }
function dateLabel(value: unknown) { const raw = clean(value, 20), m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}/${m[2]}/${m[1]}` : raw; }
function boolField(value: unknown) { return value === true; }

async function graphJson(url: string, accessToken: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const message = clean(data?.error?.message || `Meta HTTP ${response.status}`, 600), details = clean(data?.error?.error_data?.details || "", 900); const error: any = new Error(details ? `${message} | ${details}` : message); error.metaCode = data?.error?.code || null; error.metaSubcode = data?.error?.error_subcode || null; error.fbtraceId = clean(data?.error?.fbtrace_id || "", 200); throw error; }
  return data;
}
function wabaId() { return clean(Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID") || Deno.env.get("WHATSAPP_WABA_ID") || Deno.env.get("WABA_ID") || ROTA27_WABA_ID, 120); }
async function getTemplate(accessToken: string, waba: string, graphVersion: string) {
  const url = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(waba)}/message_templates?name=${encodeURIComponent(TEMPLATE_NAME)}&limit=100`;
  const data = await graphJson(url, accessToken);
  const row = Array.isArray(data?.data) ? data.data.find((x: any) => clean(x?.name, 160) === TEMPLATE_NAME) : null;
  return row ? { found: true, status: clean(row.status || "UNKNOWN", 60), category: clean(row.category || "", 60) || null, id: clean(row.id || "", 120) || null, language: clean(row.language || TEMPLATE_LANG, 30) } : { found: false, status: "NOT_SUBMITTED", category: null, id: null, language: TEMPLATE_LANG };
}
async function submitTemplate(accessToken: string, waba: string, graphVersion: string) {
  const existing = await getTemplate(accessToken, waba, graphVersion); if (existing.found) return { existing: true, ...existing };
  const text = "Olá, {{1}}! A Rota 27 Bodega te convida para {{2}}. {{3}}. {{4}}";
  const payload = {
    name: TEMPLATE_NAME,
    language: TEMPLATE_LANG,
    category: "MARKETING",
    allow_category_change: false,
    components: [
      { type: "BODY", text, example: { body_text: [["Marcos", "Degustação de Costela com Aipim", "28/08 às 18:00", "Vem para o Rota 27! Esperamos você."]] } },
      { type: "FOOTER", text: "Rota 27 Bodega • Jardim Camburi" },
    ],
  };
  const url = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(waba)}/message_templates`;
  const data = await graphJson(url, accessToken, { method: "POST", body: JSON.stringify(payload) });
  return { existing: false, found: true, status: clean(data?.status || "PENDING", 60), category: "MARKETING", id: clean(data?.id || "", 120) || null, language: TEMPLATE_LANG };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const configuredDeviceToken = Deno.env.get("ROTA27_DEVICE_TOKEN") || "", receivedDeviceToken = req.headers.get("x-rota27-device-token") || "";
  if (configuredDeviceToken.length < 16 || !safeEqual(receivedDeviceToken, configuredDeviceToken)) return json(401, { ok: false, error: "Dispositivo não autorizado." });

  let body: any = {}; try { body = await req.json(); } catch { return json(400, { ok: false, error: "JSON inválido." }); }
  const action = clean(body?.action || "status", 50), storeId = clean(body?.storeId || Deno.env.get("ROTA27_SYNC_STORE_ID") || STORE_ID_DEFAULT, 80) || STORE_ID_DEFAULT;
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "", serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "", accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "", phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "", graphVersion = Deno.env.get("META_GRAPH_VERSION") || "", waba = wabaId();
  if (!supabaseUrl || !serviceRoleKey || !accessToken || !phoneNumberId || !graphVersion || !waba) return json(500, { ok: false, error: "Backend incompleto para campanhas de eventos.", edgeVersion: EDGE_VERSION });
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  async function latestClients() {
    const { data, error } = await db.from("rota27_sync_events").select("seq,entity_id,payload").eq("store_id", storeId).eq("event_type", "client_upsert").order("seq", { ascending: true }).limit(5000);
    if (error) throw new Error(`Falha ao ler clientes: ${error.message}`);
    const map = new Map<string, any>();
    for (const row of data || []) {
      const c = row?.payload?.client; if (!c || typeof c !== "object") continue;
      const id = clean(c.id || row.entity_id, 160); if (!id) continue;
      const old = map.get(id) || {};
      const merged = { ...old, ...c, id };
      if (c.eventMarketingOptIn === undefined && old.eventMarketingOptIn !== undefined) merged.eventMarketingOptIn = old.eventMarketingOptIn;
      if (c.eventMarketingOptInAt === undefined && old.eventMarketingOptInAt !== undefined) merged.eventMarketingOptInAt = old.eventMarketingOptInAt;
      if (c.eventMarketingOptOutAt === undefined && old.eventMarketingOptOutAt !== undefined) merged.eventMarketingOptOutAt = old.eventMarketingOptOutAt;
      if (c.eventMarketingConsentSource === undefined && old.eventMarketingConsentSource !== undefined) merged.eventMarketingConsentSource = old.eventMarketingConsentSource;
      map.set(id, merged);
    }
    return [...map.values()];
  }
  async function campaignRows(eventId: string) {
    if (!eventId) return [];
    const prefix = `${CAMPAIGN}::${eventId}::%`;
    const { data, error } = await db.from("whatsapp_message_log").select("event_id,status,wa_message_id,last_error,sent_at,updated_at,customer_name,phone,payload").like("event_id", prefix).order("updated_at", { ascending: false }).limit(1000);
    if (error) throw new Error(`Falha ao ler histórico da campanha: ${error.message}`);
    return data || [];
  }
  function normalizedAudience(rows: any[]) {
    return rows.map((client: any) => ({
      id: clean(client.id, 160),
      name: clean(client.name || "Cliente", 120) || "Cliente",
      phone: normalizePhone(client.whatsappPhone || client.phone || ""),
      marketingOptIn: boolField(client.eventMarketingOptIn),
      optInAt: Math.max(0, Number(client.eventMarketingOptInAt || 0)),
      optOutAt: Math.max(0, Number(client.eventMarketingOptOutAt || 0)),
    }));
  }

  if (action === "consents") {
    const rows = normalizedAudience(await latestClients());
    return json(200, { ok: true, edgeVersion: EDGE_VERSION, consents: rows.map(r => ({ clientId: r.id, enabled: r.marketingOptIn, optInAt: r.optInAt, optOutAt: r.optOutAt })) });
  }

  if (action === "submit_template") {
    try { const template = await submitTemplate(accessToken, waba, graphVersion); return json(200, { ok: true, edgeVersion: EDGE_VERSION, templateName: TEMPLATE_NAME, template }); }
    catch (error: any) { return json(502, { ok: false, error: clean(error?.message || "Falha ao submeter template.", 900), metaCode: error?.metaCode || null, metaSubcode: error?.metaSubcode || null, fbtraceId: error?.fbtraceId || null, edgeVersion: EDGE_VERSION }); }
  }

  if (action === "status") {
    let template: any, templateError: string | null = null; try { template = await getTemplate(accessToken, waba, graphVersion); } catch (error) { template = { found: false, status: "ERROR" }; templateError = clean(error instanceof Error ? error.message : "Falha ao consultar template.", 900); }
    const clients = normalizedAudience(await latestClients()), requestedIds = new Set((Array.isArray(body?.targetClientIds) ? body.targetClientIds : []).map((x: any) => clean(x, 160)).filter(Boolean));
    const scoped = requestedIds.size ? clients.filter(c => requestedIds.has(c.id)) : clients, eligible = scoped.filter(c => validPhone(c.phone) && c.marketingOptIn);
    const eKey = eventKey(body?.eventId), logs = eKey ? await campaignRows(eKey) : [], sent = logs.filter((r: any) => r.status === "sent").length, failed = logs.filter((r: any) => r.status === "failed").length;
    return json(200, { ok: true, edgeVersion: EDGE_VERSION, templateName: TEMPLATE_NAME, template, templateError, counts: { clients: clients.length, marketingOptIn: clients.filter(c => validPhone(c.phone) && c.marketingOptIn).length, selected: scoped.length, eligible: eligible.length }, campaign: { eventId: eKey || null, sent, failed, total: logs.length } });
  }

  if (action !== "send_campaign") return json(400, { ok: false, error: "Ação não suportada." });
  if (body?.confirmMarketingConsent !== true) return json(409, { ok: false, error: "Confirmação de consentimento de marketing é obrigatória." });

  const event = body?.event && typeof body.event === "object" ? body.event : {}, eKey = eventKey(event.id);
  const title = clean(event.title, 120), eventDate = clean(event.eventDate, 20), eventTime = clean(event.eventTime, 20), description = clean(event.description, 260), callToAction = clean(event.callToAction, 180);
  if (!eKey || !title || !eventDate || !eventTime) return json(400, { ok: false, error: "Evento incompleto: informe id, título, data e horário." });

  let template: any; try { template = await getTemplate(accessToken, waba, graphVersion); } catch (error) { return json(502, { ok: false, error: clean(error instanceof Error ? error.message : "Falha ao consultar template.", 900), edgeVersion: EDGE_VERSION }); }
  if (String(template.status || "").toUpperCase() !== "APPROVED") return json(409, { ok: false, error: `Template ainda não aprovado pela Meta (${template.status || "desconhecido"}).`, template, edgeVersion: EDGE_VERSION });

  const selectedIds = new Set((Array.isArray(body?.targetClientIds) ? body.targetClientIds : []).map((x: any) => clean(x, 160)).filter(Boolean));
  if (!selectedIds.size) return json(400, { ok: false, error: "Selecione ao menos um cliente." });
  const clients = normalizedAudience(await latestClients()), targets = clients.filter(c => selectedIds.has(c.id) && validPhone(c.phone) && c.marketingOptIn).slice(0, 100);
  const endpoint = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`, results: any[] = [];
  const when = `${dateLabel(eventDate)} às ${eventTime}`;
  const inviteText = clean(callToAction || description || "Esperamos você no Rota 27!", 180) || "Esperamos você no Rota 27!";

  for (const target of targets) {
    const eventId = `${CAMPAIGN}::${eKey}::${target.id}`, nowIso = new Date().toISOString();
    const payloadLog = { campaign: CAMPAIGN, event: { id: eKey, title, eventDate, eventTime, description, callToAction }, clientId: target.id, template: TEMPLATE_NAME, edgeVersion: EDGE_VERSION, consentBasis: "explicit_event_marketing_opt_in", optInAt: target.optInAt || null };
    const { data: existing } = await db.from("whatsapp_message_log").select("status,wa_message_id,attempts").eq("event_id", eventId).limit(1).maybeSingle();
    if (existing?.status === "sent") { results.push({ clientId: target.id, status: "duplicate_skipped", messageId: existing.wa_message_id || null }); continue; }
    await db.from("whatsapp_message_log").upsert({ event_id: eventId, command_id: `event::${eKey}`, phone: target.phone, customer_name: target.name, command_label: `Evento: ${title}`, payload: payloadLog, status: "processing", attempts: Number(existing?.attempts || 0) + 1, last_error: null, updated_at: nowIso }, { onConflict: "event_id" });
    const metaPayload = { messaging_product: "whatsapp", recipient_type: "individual", to: target.phone, type: "template", template: { name: TEMPLATE_NAME, language: { code: TEMPLATE_LANG }, components: [{ type: "body", parameters: [{ type: "text", text: target.name }, { type: "text", text: title }, { type: "text", text: when }, { type: "text", text: inviteText }] }] } };
    try {
      const metaData = await graphJson(endpoint, accessToken, { method: "POST", body: JSON.stringify(metaPayload) }), messageId = Array.isArray(metaData?.messages) && metaData.messages.length ? clean(metaData.messages[0]?.id, 300) : "";
      await db.from("whatsapp_message_log").upsert({ event_id: eventId, command_id: `event::${eKey}`, phone: target.phone, customer_name: target.name, command_label: `Evento: ${title}`, payload: payloadLog, status: "sent", wa_message_id: messageId || null, last_error: null, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: "event_id" });
      results.push({ clientId: target.id, status: "sent", messageId: messageId || null });
    } catch (error: any) {
      const errorText = clean(error?.message || "Falha ao enviar.", 900);
      await db.from("whatsapp_message_log").upsert({ event_id: eventId, command_id: `event::${eKey}`, phone: target.phone, customer_name: target.name, command_label: `Evento: ${title}`, payload: payloadLog, status: "failed", last_error: errorText, updated_at: new Date().toISOString() }, { onConflict: "event_id" });
      results.push({ clientId: target.id, status: "failed", error: errorText });
    }
  }

  return json(200, { ok: true, edgeVersion: EDGE_VERSION, campaign: CAMPAIGN, templateName: TEMPLATE_NAME, eventId: eKey, selected: selectedIds.size, eligible: targets.length, sent: results.filter(r => r.status === "sent").length, failed: results.filter(r => r.status === "failed").length, skipped: selectedIds.size - targets.length + results.filter(r => r.status === "duplicate_skipped").length, results });
});
