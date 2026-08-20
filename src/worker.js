/**
 * jesus.numetal.xyz — PERSONAL JESUS
 *
 * Static TempleOS desktop served from Workers Assets through a hardening shim,
 * plus POST /join → D1 waitlist. Posture mirrors llmcraft-site:
 *   - Assets: GET/HEAD only.
 *   - Strict CSP (Turnstile holes for challenges.cloudflare.com).
 *   - Join: same-origin, honeypot, email check, optional Turnstile, D1 insert.
 *   - Fails closed: unexpected error → generic 500, no internals leaked.
 *
 * Bindings: ASSETS, DB.
 * Optional secret: TURNSTILE_SECRET (enforced only when set).
 */

import { honeypotFilled, isEmail, normalizeEmail } from "./validate.js";

const CSP =
  "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; " +
  "img-src 'self' data:; style-src 'self'; " +
  "script-src 'self' https://challenges.cloudflare.com; " +
  "frame-src https://challenges.cloudflare.com; " +
  "connect-src 'self' https://challenges.cloudflare.com; " +
  "font-src 'self'; object-src 'none'; upgrade-insecure-requests";

const SECURITY_HEADERS = {
  "content-security-policy": CSP,
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "permissions-policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), " +
    "magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
};

const MAX_BODY = 4096;

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...SECURITY_HEADERS,
    },
  });
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function readBody(request) {
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  try {
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const out = await r.json();
    return !!out.success;
  } catch {
    return false;
  }
}

async function handleJoin(request, env, ip) {
  if (!sameOrigin(request)) return json({ error: "bad origin" }, 403);
  const body = await readBody(request);
  if (!body) return json({ error: "bad request" }, 400);

  if (honeypotFilled(body.offering)) return json({ ok: true });

  const email = normalizeEmail(body.email);
  if (!isEmail(email)) return json({ error: "valid email required" }, 400);

  const okTurnstile = await verifyTurnstile(env, body.turnstile, ip);
  if (!okTurnstile) return json({ error: "verification failed" }, 403);

  if (!env.DB) return json({ error: "unavailable" }, 500);

  const result = await env.DB.prepare(
    "INSERT OR IGNORE INTO waitlist (email) VALUES (?)",
  )
    .bind(email)
    .run();

  if (result.meta.changes === 0) return json({ ok: true, already: true });
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";

      if (path === "/join") {
        if (request.method !== "POST") {
          return new Response("method not allowed", {
            status: 405,
            headers: { allow: "POST", ...SECURITY_HEADERS },
          });
        }
        return handleJoin(request, env, ip);
      }

      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("method not allowed", {
          status: 405,
          headers: { allow: "GET, HEAD", ...SECURITY_HEADERS },
        });
      }

      const upstream = await env.ASSETS.fetch(request);
      const res = new Response(upstream.body, upstream);
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);

      const ct = res.headers.get("content-type") || "";
      if (ct.startsWith("text/") && !/charset=/i.test(ct)) {
        res.headers.set("content-type", `${ct}; charset=utf-8`);
      }
      if (path === "/favicon.svg" || path.startsWith("/og")) {
        res.headers.set("cross-origin-resource-policy", "cross-origin");
      }
      return res;
    } catch (err) {
      console.error("serve failed:", err instanceof Error ? err.message : String(err));
      return json({ error: "unavailable" }, 500);
    }
  },
};
