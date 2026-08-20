import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LAB_VERSION = "rota27-lab-v0.15-dev.2.1";
const REPO = "AutomatrixHub/rota27";
const PINNED_REV = "59e5f2c4d530e0ff09474130383e9b3de20c4925";
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${PINNED_REV}`;

const MIME: Record<string,string> = {
  html: "text/html; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  webmanifest: "application/manifest+json; charset=utf-8",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  ico: "image/x-icon"
};

function contentType(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  return MIME[ext] || "application/octet-stream";
}

function allowed(path: string) {
  if (!path || path.includes("..") || path.startsWith("/") || path.includes("\\")) return false;
  return /^(v015-preview\.html|base-v013\.html|manifest\.webmanifest|assets\/[A-Za-z0-9._-]+|icons\/[A-Za-z0-9._-]+)$/.test(path);
}

function headers(extra: Record<string,string> = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "X-Rota27-Lab-Version": LAB_VERSION,
    "X-Rota27-Lab-Revision": PINNED_REV,
    "X-Content-Type-Options": "nosniff",
    ...extra
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers({
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  }) });

  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: headers({"Allow":"GET, HEAD, OPTIONS"}) });
  }

  const url = new URL(req.url);
  const marker = "/rota27-lab";
  const idx = url.pathname.indexOf(marker);
  let path = idx >= 0 ? url.pathname.slice(idx + marker.length).replace(/^\/+/, "") : "";
  if (!path) path = "v015-preview.html";

  if (path === "health") {
    return new Response(JSON.stringify({ ok: true, version: LAB_VERSION, revision: PINNED_REV }), {
      status: 200,
      headers: headers({ "Content-Type": "application/json; charset=utf-8" })
    });
  }

  if (path === "sw.js") {
    const noop = `self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));`;
    return new Response(req.method === "HEAD" ? null : noop, {
      status: 200,
      headers: headers({ "Content-Type": "application/javascript; charset=utf-8", "Service-Worker-Allowed": "/functions/v1/rota27-lab/" })
    });
  }

  if (!allowed(path)) return new Response("Not Found", { status: 404, headers: headers() });

  const upstream = await fetch(`${RAW_BASE}/${path}`, { headers: { "User-Agent": "Rota27-Lab-Proxy" } });
  if (!upstream.ok) {
    return new Response(`Lab asset unavailable (${upstream.status})`, { status: 502, headers: headers() });
  }

  const body = req.method === "HEAD" ? null : await upstream.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: headers({ "Content-Type": contentType(path) })
  });
});
