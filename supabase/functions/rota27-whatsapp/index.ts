import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EDGE_VERSION = "rota27-whatsapp-v6-mini2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-rota27-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
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

function moneyBRL(value: unknown) {
  const n = Number(value || 0);
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function safeText(value: unknown, max = 300) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function safeTemplateText(value: unknown, max = 900) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

function templateForItemCount(count: number) {
  switch (count) {
    case 1:
      return "atualizacao_comanda_rota27_mini2_1";
    case 2:
      return "atualizacao_comanda_rota27_mini2_2";
    case 3:
      return "atualizacao_comanda_rota27_mini2_3";
    case 4:
      return "atualizacao_comanda_rota27_mini2_4";
    case 5:
      return "atualizacao_comanda_rota27_mini2_5";
    default:
      throw new Error(`Quantidade de itens não suportada pelo template: ${count}`);
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function readExisting(eventId: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;

  const endpoint =
    `${url}/rest/v1/whatsapp_message_log` +
    `?event_id=eq.${encodeURIComponent(eventId)}` +
    "&select=status,wa_message_id,updated_at,attempts,last_error" +
    "&limit=1";

  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function upsertLog(row: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return;

  await fetch(`${url}/rest/v1/whatsapp_message_log?on_conflict=event_id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { ok: false, error: "Método não permitido." });

  const configuredDeviceToken = Deno.env.get("ROTA27_DEVICE_TOKEN") || "";
  const receivedDeviceToken = req.headers.get("x-rota27-device-token") || "";
  if (configuredDeviceToken.length < 16 || !safeEqual(receivedDeviceToken, configuredDeviceToken)) {
    return json(401, { ok: false, error: "Dispositivo não autorizado." });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 64_000) return json(413, { ok: false, error: "Payload muito grande." });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "JSON inválido." });
  }

  const eventId = safeText(body?.eventId, 120);
  const commandId = safeText(body?.commandId, 120);
  const commandLabel = safeTemplateText(body?.commandLabel || "Comanda", 120);
  const customerName = safeTemplateText(body?.customerName || "Cliente", 120);
  const phone = normalizePhone(body?.phone);
  const consent = body?.consent === true;
  const total = Number(body?.total || 0);
  const items = Array.isArray(body?.items) ? body.items.slice(0, 30) : [];

  if (!eventId || !commandId) return json(400, { ok: false, error: "eventId e commandId são obrigatórios." });
  if (!consent) return json(400, { ok: false, error: "Consentimento não confirmado." });
  if (!validPhone(phone)) return json(400, { ok: false, error: "Número de WhatsApp inválido." });
  if (!items.length) return json(400, { ok: false, error: "Nenhum item para enviar." });
  if (!Number.isFinite(total) || total < 0) return json(400, { ok: false, error: "Total inválido." });

  const normalizedItems = items
    .map((item: any) => {
      const delta = Number(item?.delta || 0);
      const quantity = Math.max(1, Math.abs(Number(item?.quantity || delta || 1)));
      const name = safeTemplateText(item?.name || "Produto", 160);
      const unitPrice = Math.max(0, Number(item?.unitPrice || 0));
      return { delta, quantity, name, unitPrice };
    })
    .filter((item: any) => Number.isFinite(item.delta) && item.delta !== 0);

  if (!normalizedItems.length) {
    return json(400, { ok: false, error: "Nenhuma alteração válida para enviar." });
  }

  const itemLines: string[] = normalizedItems.map((item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const cleanName = safeTemplateText(
      String(item.name || "Produto").replace(/^REMOVIDO:\s*/i, ""),
      160,
    ) || "Produto";

    if (item.delta < 0) {
      return safeTemplateText(
        `REMOVIDO: ${item.quantity}x ${cleanName} - ${moneyBRL(subtotal)}`,
        500,
      );
    }

    return safeTemplateText(
      `${item.quantity}x ${cleanName} - ${moneyBRL(subtotal)}`,
      500,
    );
  });

  const itemChunks: string[][] = chunkArray<string>(itemLines, 5);

  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const graphVersion = Deno.env.get("META_GRAPH_VERSION");
  const templateLang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") || "pt_BR";

  if (!accessToken || !phoneNumberId || !graphVersion) {
    return json(500, {
      ok: false,
      error: "Backend incompleto: configure WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID e META_GRAPH_VERSION.",
    });
  }

  const metaEndpoint = `https://graph.facebook.com/${encodeURIComponent(graphVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;

  const messageIds: string[] = [];
  const usedTemplates: string[] = [];
  let messagesSent = 0;
  let duplicateChunks = 0;

  for (let chunkIndex = 0; chunkIndex < itemChunks.length; chunkIndex++) {
    const chunk = itemChunks[chunkIndex];
    const templateName = templateForItemCount(chunk.length);
    usedTemplates.push(templateName);

    const chunkEventId = itemChunks.length === 1 ? eventId : `${eventId}::${chunkIndex + 1}`;
    const existing = await readExisting(chunkEventId);

    if (existing?.status === "sent") {
      duplicateChunks++;
      if (existing.wa_message_id) messageIds.push(existing.wa_message_id);
      continue;
    }

    const parameters: Array<{ type: string; text: string }> = [
      { type: "text", text: customerName },
      { type: "text", text: commandLabel },
    ];
    for (const itemLine of chunk) parameters.push({ type: "text", text: itemLine });
    parameters.push({ type: "text", text: moneyBRL(total) });

    const now = new Date().toISOString();
    const logPayload = {
      parentEventId: eventId,
      eventId: chunkEventId,
      commandId,
      commandLabel,
      customerName,
      phone,
      total,
      items: normalizedItems,
      chunkItems: chunk,
      chunkIndex: chunkIndex + 1,
      chunkCount: itemChunks.length,
      template: templateName,
      edgeVersion: EDGE_VERSION,
      clientTimestamp: safeText(body?.clientTimestamp, 80),
    };

    await upsertLog({
      event_id: chunkEventId,
      command_id: commandId,
      phone,
      customer_name: customerName,
      command_label: commandLabel,
      payload: logPayload,
      status: "processing",
      attempts: Number(existing?.attempts || 0) + 1,
      last_error: null,
      updated_at: now,
    });

    const metaPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [{ type: "body", parameters }],
      },
    };

    try {
      const metaResponse = await fetch(metaEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metaPayload),
      });

      const metaData = await metaResponse.json().catch(() => ({}));

      if (!metaResponse.ok) {
        const errorText = safeText(metaData?.error?.message || `Meta HTTP ${metaResponse.status}`, 500);
        const errorDetails = safeText(metaData?.error?.error_data?.details || "", 800);
        const metaCode = metaData?.error?.code || null;
        const metaSubcode = metaData?.error?.error_subcode || null;
        const fbtraceId = safeText(metaData?.error?.fbtrace_id || "", 200);
        const combinedError = errorDetails ? `${errorText} | ${errorDetails}` : errorText;

        await upsertLog({
          event_id: chunkEventId,
          command_id: commandId,
          phone,
          customer_name: customerName,
          command_label: commandLabel,
          payload: logPayload,
          status: "failed",
          last_error: combinedError,
          updated_at: new Date().toISOString(),
        });

        return json(502, {
          ok: false,
          error: errorText,
          details: errorDetails || null,
          metaCode,
          metaSubcode,
          fbtraceId: fbtraceId || null,
          failedChunk: chunkIndex + 1,
          chunkCount: itemChunks.length,
          template: templateName,
          edgeVersion: EDGE_VERSION,
        });
      }

      const waMessageId =
        Array.isArray(metaData?.messages) && metaData.messages.length
          ? safeText(metaData.messages[0]?.id, 300)
          : "";
      const messageStatus =
        Array.isArray(metaData?.messages) && metaData.messages.length
          ? safeText(metaData.messages[0]?.message_status, 100)
          : "";

      if (waMessageId) messageIds.push(waMessageId);
      messagesSent++;

      await upsertLog({
        event_id: chunkEventId,
        command_id: commandId,
        phone,
        customer_name: customerName,
        command_label: commandLabel,
        payload: { ...logPayload, messageStatus },
        status: "sent",
        wa_message_id: waMessageId || null,
        last_error: null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      const errorText = safeText(error instanceof Error ? error.message : "Falha ao chamar a Meta.", 500);

      await upsertLog({
        event_id: chunkEventId,
        command_id: commandId,
        phone,
        customer_name: customerName,
        command_label: commandLabel,
        payload: logPayload,
        status: "failed",
        last_error: errorText,
        updated_at: new Date().toISOString(),
      });

      return json(502, {
        ok: false,
        error: errorText,
        failedChunk: chunkIndex + 1,
        chunkCount: itemChunks.length,
        template: templateName,
        edgeVersion: EDGE_VERSION,
      });
    }
  }

  return json(200, {
    ok: true,
    messageId: messageIds.length ? messageIds[0] : null,
    messageStatus: "accepted",
    groupedItems: normalizedItems.length,
    messagesSent,
    duplicateChunks,
    chunkCount: itemChunks.length,
    templates: usedTemplates,
    edgeVersion: EDGE_VERSION,
  });
});
