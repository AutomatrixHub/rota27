import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EDGE_VERSION = "rota27-whatsapp-inbound-v1";
const DEFAULT_VERIFY_TOKEN = "rota27-whatsapp-inbound-verify-v1-20260823";
const DEFAULT_MANAGER_TEMPLATE = "resposta_cliente_rota27_gerente_v1";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function clean(value: unknown, max = 500) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\r\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

function digits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizePhone(value: unknown) {
  let d = digits(value).replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d;
}

function validPhone(value: string) {
  return value.length >= 12 && value.length <= 15;
}

function formatPhone(value: string) {
  return value ? `+${value}` : "";
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  const secret = Deno.env.get("META_APP_SECRET") || "";
  if (!secret) return { enforced: false, ok: true };
  if (!signatureHeader?.startsWith("sha256=")) return { enforced: true, ok: false };

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = `sha256=${Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  return { enforced: true, ok: timingSafeEqual(expected, signatureHeader) };
}

function extractMessageText(message: any) {
  const type = clean(message?.type || "unknown", 40) || "unknown";

  if (type === "text") return { type, text: clean(message?.text?.body, 700) || "[Mensagem de texto vazia]" };
  if (type === "button") return { type, text: clean(message?.button?.text, 700) || "[Resposta por botão]" };
  if (type === "interactive") {
    const text = clean(
      message?.interactive?.button_reply?.title ||
      message?.interactive?.list_reply?.title ||
      "[Resposta interativa]",
      700,
    );
    return { type, text };
  }
  if (type === "image") {
    const caption = clean(message?.image?.caption, 600);
    return { type, text: caption ? `[Imagem recebida] ${caption}` : "[Imagem recebida]" };
  }
  if (type === "video") {
    const caption = clean(message?.video?.caption, 600);
    return { type, text: caption ? `[Vídeo recebido] ${caption}` : "[Vídeo recebido]" };
  }
  if (type === "document") {
    const filename = clean(message?.document?.filename, 160);
    const caption = clean(message?.document?.caption, 400);
    return { type, text: `[Documento recebido${filename ? `: ${filename}` : ""}]${caption ? ` ${caption}` : ""}` };
  }
  if (type === "audio") return { type, text: "[Áudio recebido]" };
  if (type === "sticker") return { type, text: "[Figurinha recebida]" };
  if (type === "location") return { type, text: "[Localização recebida]" };
  if (type === "contacts") return { type, text: "[Contato recebido]" };
  if (type === "reaction") return { type, text: `[Reação recebida: ${clean(message?.reaction?.emoji, 20) || "emoji"}]` };

  return { type, text: `[Mensagem recebida: ${type}]` };
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const verifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || DEFAULT_VERIFY_TOKEN;
  const appSecretConfigured = Boolean(Deno.env.get("META_APP_SECRET"));

  if (req.method === "GET") {
    if (url.searchParams.get("health") === "1") {
      return json(200, {
        ok: true,
        edgeVersion: EDGE_VERSION,
        signatureVerification: appSecretConfigured,
        mode: appSecretConfigured ? "signed" : "context-bound",
      });
    }

    const mode = url.searchParams.get("hub.mode") || "";
    const supplied = url.searchParams.get("hub.verify_token") || "";
    const challenge = url.searchParams.get("hub.challenge") || "";

    if (mode === "subscribe" && timingSafeEqual(supplied, verifyToken) && challenge) {
      return new Response(challenge, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    return json(401, { ok: false, error: "Webhook não verificado." });
  }

  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).length > 512_000) {
    return json(413, { ok: false, error: "Payload muito grande." });
  }

  const signature = await verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"));
  if (!signature.ok) return json(401, { ok: false, error: "Assinatura Meta inválida." });

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json(400, { ok: false, error: "JSON inválido." });
  }

  if (body?.object !== "whatsapp_business_account") {
    return json(200, { ok: true, ignored: true, reason: "object_not_supported", edgeVersion: EDGE_VERSION });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
  const graphVersion = Deno.env.get("META_GRAPH_VERSION") || "";
  const templateLang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") || "pt_BR";
  const managerTemplate = Deno.env.get("WHATSAPP_MANAGER_REPLY_TEMPLATE") || DEFAULT_MANAGER_TEMPLATE;
  const storeId = clean(Deno.env.get("ROTA27_SYNC_STORE_ID") || "rota27-bodega", 80);

  if (!supabaseUrl || !serviceRoleKey || !accessToken || !phoneNumberId || !graphVersion) {
    return json(500, { ok: false, error: "Backend incompleto para receber respostas.", edgeVersion: EDGE_VERSION });
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function writeInbound(row: Record<string, unknown>) {
    const { error } = await db
      .from("rota27_whatsapp_inbound")
      .upsert(row, { onConflict: "meta_message_id" });
    if (error) throw new Error(`Falha ao registrar resposta: ${error.message}`);
  }

  async function latestManager() {
    const { data, error } = await db
      .from("rota27_sync_events")
      .select("payload,seq")
      .eq("store_id", storeId)
      .eq("event_type", "manager_config_replace")
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Falha ao ler gerente: ${error.message}`);

    const config = data?.payload?.config || {};
    const phone = normalizePhone(config?.phone || "");
    return {
      name: clean(config?.name || "Gerente", 120) || "Gerente",
      phone,
      enabled: config?.enabled === true && validPhone(phone),
    };
  }

  async function originalMessage(replyToMessageId: string, senderPhone: string) {
    const { data, error } = await db
      .from("whatsapp_message_log")
      .select("event_id,command_id,customer_name,command_label,phone,status,wa_message_id,sent_at")
      .eq("wa_message_id", replyToMessageId)
      .eq("phone", senderPhone)
      .eq("status", "sent")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Falha ao localizar mensagem original: ${error.message}`);
    return data || null;
  }

  async function sendToManager(manager: { name: string; phone: string }, original: any, sender: string, text: string) {
    const endpoint = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: manager.phone,
      type: "template",
      template: {
        name: managerTemplate,
        language: { code: templateLang },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: manager.name },
            { type: "text", text: clean(original?.command_label || "Comanda", 120) || "Comanda" },
            { type: "text", text: clean(original?.customer_name || "Cliente", 120) || "Cliente" },
            { type: "text", text: formatPhone(sender) },
            { type: "text", text: clean(text, 700) || "[Mensagem recebida]" },
          ],
        }],
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = clean(data?.error?.message || `Meta HTTP ${response.status}`, 500);
      const details = clean(data?.error?.error_data?.details || "", 700);
      throw new Error(details ? `${message} | ${details}` : message);
    }

    return Array.isArray(data?.messages) && data.messages.length
      ? clean(data.messages[0]?.id, 300)
      : "";
  }

  const messages: Array<{ value: any; message: any }> = [];
  for (const entry of Array.isArray(body?.entry) ? body.entry : []) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      if (change?.field !== "messages") continue;
      const value = change?.value || {};
      if (clean(value?.metadata?.phone_number_id, 120) !== clean(phoneNumberId, 120)) continue;
      for (const message of Array.isArray(value?.messages) ? value.messages : []) {
        messages.push({ value, message });
      }
    }
  }

  if (!messages.length) {
    return json(200, { ok: true, processed: 0, ignored: 0, edgeVersion: EDGE_VERSION });
  }

  let processed = 0;
  let ignored = 0;
  let failures = 0;

  for (const { message } of messages) {
    const metaMessageId = clean(message?.id, 300);
    const sender = normalizePhone(message?.from || "");
    const replyToMessageId = clean(message?.context?.id, 300);
    const extracted = extractMessageText(message);
    const metaTimestamp = Number(message?.timestamp || 0) || null;

    if (!metaMessageId || !validPhone(sender)) {
      ignored++;
      continue;
    }

    const { data: existing } = await db
      .from("rota27_whatsapp_inbound")
      .select("status")
      .eq("meta_message_id", metaMessageId)
      .limit(1)
      .maybeSingle();

    if (existing?.status === "forwarded" || existing?.status === "ignored") {
      ignored++;
      continue;
    }

    await writeInbound({
      meta_message_id: metaMessageId,
      sender_phone: sender,
      reply_to_message_id: replyToMessageId || null,
      message_type: extracted.type,
      message_text: extracted.text,
      status: "received",
      reason: null,
      meta_timestamp: metaTimestamp,
      updated_at: new Date().toISOString(),
    });

    // Sem META_APP_SECRET, o modo seguro inicial aceita somente respostas que
    // carreguem context.id de uma mensagem outbound real registrada pelo Rota 27.
    if (!replyToMessageId) {
      await writeInbound({
        meta_message_id: metaMessageId,
        sender_phone: sender,
        reply_to_message_id: null,
        message_type: extracted.type,
        message_text: extracted.text,
        status: "ignored",
        reason: "Mensagem sem contexto de resposta.",
        meta_timestamp: metaTimestamp,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      ignored++;
      continue;
    }

    try {
      const original = await originalMessage(replyToMessageId, sender);
      if (!original) {
        await writeInbound({
          meta_message_id: metaMessageId,
          sender_phone: sender,
          reply_to_message_id: replyToMessageId,
          message_type: extracted.type,
          message_text: extracted.text,
          status: "ignored",
          reason: "Mensagem original não pertence a este cliente/Rota 27.",
          meta_timestamp: metaTimestamp,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        ignored++;
        continue;
      }

      const manager = await latestManager();
      if (!manager.enabled || !manager.phone) {
        await writeInbound({
          meta_message_id: metaMessageId,
          sender_phone: sender,
          reply_to_message_id: replyToMessageId,
          message_type: extracted.type,
          message_text: extracted.text,
          command_id: original.command_id,
          customer_name: original.customer_name,
          command_label: original.command_label,
          status: "ignored",
          reason: "WhatsApp do gerente desativado ou inválido.",
          meta_timestamp: metaTimestamp,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        ignored++;
        continue;
      }

      if (sender === manager.phone) {
        await writeInbound({
          meta_message_id: metaMessageId,
          sender_phone: sender,
          reply_to_message_id: replyToMessageId,
          message_type: extracted.type,
          message_text: extracted.text,
          command_id: original.command_id,
          customer_name: original.customer_name,
          command_label: original.command_label,
          manager_phone: manager.phone,
          manager_name: manager.name,
          status: "ignored",
          reason: "Resposta originada do próprio gerente; loop bloqueado.",
          meta_timestamp: metaTimestamp,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        ignored++;
        continue;
      }

      await writeInbound({
        meta_message_id: metaMessageId,
        sender_phone: sender,
        reply_to_message_id: replyToMessageId,
        message_type: extracted.type,
        message_text: extracted.text,
        command_id: original.command_id,
        customer_name: original.customer_name,
        command_label: original.command_label,
        manager_phone: manager.phone,
        manager_name: manager.name,
        status: "forwarding",
        reason: null,
        meta_timestamp: metaTimestamp,
        updated_at: new Date().toISOString(),
      });

      const managerMessageId = await sendToManager(manager, original, sender, extracted.text);

      await writeInbound({
        meta_message_id: metaMessageId,
        sender_phone: sender,
        reply_to_message_id: replyToMessageId,
        message_type: extracted.type,
        message_text: extracted.text,
        command_id: original.command_id,
        customer_name: original.customer_name,
        command_label: original.command_label,
        manager_phone: manager.phone,
        manager_name: manager.name,
        status: "forwarded",
        reason: null,
        manager_wa_message_id: managerMessageId || null,
        meta_timestamp: metaTimestamp,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      processed++;
    } catch (error) {
      failures++;
      await writeInbound({
        meta_message_id: metaMessageId,
        sender_phone: sender,
        reply_to_message_id: replyToMessageId || null,
        message_type: extracted.type,
        message_text: extracted.text,
        status: "failed",
        reason: clean(error instanceof Error ? error.message : "Falha no encaminhamento.", 900),
        meta_timestamp: metaTimestamp,
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (failures) {
    return json(500, { ok: false, processed, ignored, failures, edgeVersion: EDGE_VERSION });
  }

  return json(200, { ok: true, processed, ignored, failures: 0, edgeVersion: EDGE_VERSION });
});
