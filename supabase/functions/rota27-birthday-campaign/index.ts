import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-birthday-campaign-v1";
const TEMPLATE_NAME = "solicitar_aniversario_rota27_v1";
const TEMPLATE_LANG = "pt_BR";
const CAMPAIGN = "birthday_request_v1";
const STORE_ID_DEFAULT = "rota27-bodega";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-rota27-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" };

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}
function clean(value: unknown, max = 500) {
  return String(value ?? "").replace(/\u0000/g, "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max);
}
function digits(value: unknown) { return String(value ?? "").replace(/\D/g, ""); }
function normalizePhone(value: unknown) {
  let d = digits(value).replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d;
}
function validPhone(value: string) { return value.length >= 12 && value.length <= 15; }
function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0; for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}
function validBirthDate(value: unknown) {
  const raw = clean(value, 20);
  if (!raw) return false;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (y < 1900 || dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return false;
  const now = new Date();
  const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,"0")}-${String(now.getUTCDate()).padStart(2,"0")}`;
  return raw <= today;
}

async function graphJson(url: string, accessToken: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = clean(data?.error?.message || `Meta HTTP ${response.status}`, 600);
    const details = clean(data?.error?.error_data?.details || "", 900);
    const error: any = new Error(details ? `${message} | ${details}` : message);
    error.metaCode = data?.error?.code || null;
    error.metaSubcode = data?.error?.error_subcode || null;
    error.fbtraceId = clean(data?.error?.fbtrace_id || "", 200);
    throw error;
  }
  return data;
}

async function resolveWabaId(accessToken: string, phoneNumberId: string, graphVersion: string) {
  const explicit = clean(
    Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID") || Deno.env.get("WHATSAPP_WABA_ID") || Deno.env.get("WABA_ID") || "",
    120,
  );
  if (explicit) return { id: explicit, source: "env" };

  try {
    const u = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}?fields=whatsapp_business_account`;
    const data = await graphJson(u, accessToken);
    const id = clean(data?.whatsapp_business_account?.id || data?.whatsapp_business_account || "", 120);
    if (id) return { id, source: "phone_field" };
  } catch (_) {}

  return { id: "", source: "missing" };
}

async function getTemplate(accessToken: string, wabaId: string, graphVersion: string) {
  if (!wabaId) return { found: false, status: "UNAVAILABLE", category: null, id: null, language: TEMPLATE_LANG };
  const url = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(wabaId)}/message_templates?name=${encodeURIComponent(TEMPLATE_NAME)}&limit=100`;
  const data = await graphJson(url, accessToken);
  const row = Array.isArray(data?.data) ? data.data.find((x: any) => clean(x?.name, 160) === TEMPLATE_NAME) : null;
  return row ? {
    found: true,
    status: clean(row.status || "UNKNOWN", 60),
    category: clean(row.category || "", 60) || null,
    id: clean(row.id || "", 120) || null,
    language: clean(row.language || TEMPLATE_LANG, 30),
  } : { found: false, status: "NOT_SUBMITTED", category: null, id: null, language: TEMPLATE_LANG };
}

async function submitTemplate(accessToken: string, wabaId: string, graphVersion: string) {
  if (!wabaId) throw new Error("WHATSAPP_BUSINESS_ACCOUNT_ID não está configurado e não foi possível resolver o WABA automaticamente.");
  const existing = await getTemplate(accessToken, wabaId, graphVersion);
  if (existing.found) return { existing: true, ...existing };

  const text = "Olá, {{1}}! Aqui é da Rota 27 Bodega. Estamos atualizando nosso cadastro de clientes. Se desejar, responda a esta mensagem com sua data de nascimento no formato DD/MM/AAAA. Esse dado é opcional e será usado apenas para manter seu cadastro atualizado.";
  const payload = {
    name: TEMPLATE_NAME,
    language: TEMPLATE_LANG,
    category: "UTILITY",
    allow_category_change: true,
    components: [
      { type: "BODY", text, example: { body_text: [["Marcos"]] } },
      { type: "FOOTER", text: "Rota 27 Bodega • Jardim Camburi" },
    ],
  };
  const url = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(wabaId)}/message_templates`;
  const data = await graphJson(url, accessToken, { method: "POST", body: JSON.stringify(payload) });
  return {
    existing: false,
    found: true,
    status: clean(data?.status || "PENDING", 60),
    category: "UTILITY",
    id: clean(data?.id || "", 120) || null,
    language: TEMPLATE_LANG,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const configuredDeviceToken = Deno.env.get("ROTA27_DEVICE_TOKEN") || "";
  const receivedDeviceToken = req.headers.get("x-rota27-device-token") || "";
  if (configuredDeviceToken.length < 16 || !safeEqual(receivedDeviceToken, configuredDeviceToken)) {
    return json(401, { ok: false, error: "Dispositivo não autorizado." });
  }

  let body: any = {};
  try { body = await req.json(); } catch { return json(400, { ok: false, error: "JSON inválido." }); }
  const action = clean(body?.action || "status", 50);
  const storeId = clean(body?.storeId || Deno.env.get("ROTA27_SYNC_STORE_ID") || STORE_ID_DEFAULT, 80) || STORE_ID_DEFAULT;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
  const graphVersion = Deno.env.get("META_GRAPH_VERSION") || "";
  if (!supabaseUrl || !serviceRoleKey || !accessToken || !phoneNumberId || !graphVersion) {
    return json(500, { ok: false, error: "Backend incompleto para a campanha de aniversário.", edgeVersion: EDGE_VERSION });
  }

  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  async function latestClients() {
    const { data, error } = await db.from("rota27_sync_events")
      .select("seq,entity_id,payload")
      .eq("store_id", storeId)
      .eq("event_type", "client_upsert")
      .order("seq", { ascending: true })
      .limit(5000);
    if (error) throw new Error(`Falha ao ler clientes: ${error.message}`);
    const map = new Map<string, any>();
    for (const row of data || []) {
      const c = row?.payload?.client;
      if (!c || typeof c !== "object") continue;
      const id = clean(c.id || row.entity_id, 160);
      if (!id) continue;
      map.set(id, { ...c, id });
    }
    return [...map.values()];
  }

  async function priorSentPhones() {
    const { data, error } = await db.from("whatsapp_message_log").select("phone,status").eq("status", "sent").limit(5000);
    if (error) throw new Error(`Falha ao ler histórico de WhatsApp: ${error.message}`);
    return new Set((data || []).map((r: any) => normalizePhone(r.phone)).filter(validPhone));
  }

  async function campaignSentIds() {
    const { data, error } = await db.from("whatsapp_message_log")
      .select("event_id,status")
      .like("event_id", `${CAMPAIGN}::%`)
      .eq("status", "sent")
      .limit(5000);
    if (error) throw new Error(`Falha ao ler campanha: ${error.message}`);
    return new Set((data || []).map((r: any) => clean(r.event_id, 240)));
  }

  async function audience() {
    const clients = await latestClients();
    const prior = await priorSentPhones();
    const requested = await campaignSentIds();
    const rows = clients.map((client: any) => {
      const phone = normalizePhone(client.whatsappPhone || client.phone || "");
      const eventId = `${CAMPAIGN}::${clean(client.id, 160)}`;
      const hasBirthDate = validBirthDate(client.birthDate);
      return {
        id: clean(client.id, 160),
        name: clean(client.name || "Cliente", 120) || "Cliente",
        phone,
        hasPhone: validPhone(phone),
        hasBirthDate,
        priorConsentEvidence: prior.has(phone),
        alreadyRequested: requested.has(eventId),
        eventId,
      };
    });
    return rows;
  }

  const waba = await resolveWabaId(accessToken, phoneNumberId, graphVersion);

  if (action === "status") {
    let template: any;
    let templateError: string | null = null;
    try { template = await getTemplate(accessToken, waba.id, graphVersion); }
    catch (error) { template = { found: false, status: "ERROR" }; templateError = clean(error instanceof Error ? error.message : "Falha ao consultar template.", 900); }
    const rows = await audience();
    const missing = rows.filter(r => r.hasPhone && !r.hasBirthDate);
    const eligible = missing.filter(r => r.priorConsentEvidence && !r.alreadyRequested);
    return json(200, {
      ok: true,
      edgeVersion: EDGE_VERSION,
      campaign: CAMPAIGN,
      templateName: TEMPLATE_NAME,
      template,
      templateError,
      wabaResolved: Boolean(waba.id),
      wabaSource: waba.source,
      counts: {
        clients: rows.length,
        withWhatsAppMissingBirthDate: missing.length,
        withPriorConsentEvidence: missing.filter(r => r.priorConsentEvidence).length,
        alreadyRequested: missing.filter(r => r.alreadyRequested).length,
        readyToSend: eligible.length,
        withoutPriorConsentEvidence: missing.filter(r => !r.priorConsentEvidence).length,
      },
    });
  }

  if (action === "submit_template") {
    try {
      const template = await submitTemplate(accessToken, waba.id, graphVersion);
      return json(200, { ok: true, edgeVersion: EDGE_VERSION, templateName: TEMPLATE_NAME, template, wabaResolved: Boolean(waba.id), wabaSource: waba.source });
    } catch (error: any) {
      return json(502, { ok: false, error: clean(error?.message || "Falha ao submeter template.", 900), metaCode: error?.metaCode || null, metaSubcode: error?.metaSubcode || null, fbtraceId: error?.fbtraceId || null, edgeVersion: EDGE_VERSION, wabaResolved: Boolean(waba.id), wabaSource: waba.source });
    }
  }

  if (action !== "send_campaign") return json(400, { ok: false, error: "Ação não suportada." });

  let template: any;
  try { template = await getTemplate(accessToken, waba.id, graphVersion); }
  catch (error) { return json(502, { ok: false, error: clean(error instanceof Error ? error.message : "Falha ao consultar template.", 900), edgeVersion: EDGE_VERSION }); }
  if (template.status !== "APPROVED") {
    return json(409, { ok: false, error: `Template ainda não aprovado pela Meta (${template.status || "desconhecido"}).`, template, edgeVersion: EDGE_VERSION });
  }

  const includeWithoutEvidence = body?.includeWithoutPriorConsent === true && body?.confirmConsent === true;
  const rows = await audience();
  const targets = rows.filter(r => r.hasPhone && !r.hasBirthDate && !r.alreadyRequested && (r.priorConsentEvidence || includeWithoutEvidence));
  const endpoint = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
  const results: any[] = [];

  for (const target of targets.slice(0, 100)) {
    const now = new Date().toISOString();
    const payloadLog = {
      campaign: CAMPAIGN,
      clientId: target.id,
      template: TEMPLATE_NAME,
      edgeVersion: EDGE_VERSION,
      consentBasis: target.priorConsentEvidence ? "prior_successful_transactional_message" : "explicit_admin_confirmation",
    };
    const { data: existing } = await db.from("whatsapp_message_log").select("status,wa_message_id,attempts").eq("event_id", target.eventId).limit(1).maybeSingle();
    if (existing?.status === "sent") {
      results.push({ clientId: target.id, status: "duplicate_skipped", messageId: existing.wa_message_id || null });
      continue;
    }

    await db.from("whatsapp_message_log").upsert({
      event_id: target.eventId,
      command_id: `client::${target.id}`,
      phone: target.phone,
      customer_name: target.name,
      command_label: "Atualização cadastral",
      payload: payloadLog,
      status: "processing",
      attempts: Number(existing?.attempts || 0) + 1,
      last_error: null,
      updated_at: now,
    }, { onConflict: "event_id" });

    const metaPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: target.phone,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: TEMPLATE_LANG },
        components: [{ type: "body", parameters: [{ type: "text", text: target.name }] }],
      },
    };

    try {
      const metaData = await graphJson(endpoint, accessToken, { method: "POST", body: JSON.stringify(metaPayload) });
      const messageId = Array.isArray(metaData?.messages) && metaData.messages.length ? clean(metaData.messages[0]?.id, 300) : "";
      await db.from("whatsapp_message_log").upsert({
        event_id: target.eventId,
        command_id: `client::${target.id}`,
        phone: target.phone,
        customer_name: target.name,
        command_label: "Atualização cadastral",
        payload: payloadLog,
        status: "sent",
        wa_message_id: messageId || null,
        last_error: null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "event_id" });
      results.push({ clientId: target.id, status: "sent", messageId: messageId || null });
    } catch (error: any) {
      const errorText = clean(error?.message || "Falha ao enviar.", 900);
      await db.from("whatsapp_message_log").upsert({
        event_id: target.eventId,
        command_id: `client::${target.id}`,
        phone: target.phone,
        customer_name: target.name,
        command_label: "Atualização cadastral",
        payload: payloadLog,
        status: "failed",
        last_error: errorText,
        updated_at: new Date().toISOString(),
      }, { onConflict: "event_id" });
      results.push({ clientId: target.id, status: "failed", error: errorText });
    }
  }

  return json(200, {
    ok: true,
    edgeVersion: EDGE_VERSION,
    campaign: CAMPAIGN,
    templateName: TEMPLATE_NAME,
    sent: results.filter(r => r.status === "sent").length,
    failed: results.filter(r => r.status === "failed").length,
    skipped: rows.filter(r => r.hasPhone && !r.hasBirthDate && !r.priorConsentEvidence && !includeWithoutEvidence).length,
    results,
  });
});
