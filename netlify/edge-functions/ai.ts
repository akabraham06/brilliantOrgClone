// netlify/edge-functions/ai.ts
//
// Secure OpenAI Chat Completions proxy (Netlify Edge Function, Deno runtime)
// with trust, safety & cost controls.
//
// SECURITY MODEL
// --------------
// The browser must never see the OpenAI secret key. Instead the client-side
// React/Vite app calls THIS endpoint (`/api/ai`) with a Firebase Auth ID token.
// This function:
//   1. Verifies the caller is a signed-in user of *our* Firebase project by
//      validating the RS256 Firebase ID token against Google's public keys.
//   2. Enforces per-user trust/safety/cost controls (see below).
//   3. Injects the OpenAI secret key (read only from a Netlify env var) and
//      forwards the request to OpenAI.
//   4. Streams or returns OpenAI's response back to the browser with CORS.
//
// TRUST, SAFETY & COST CONTROLS (server-side, keyed by the verified uid)
// ----------------------------------------------------------------------
//   - Per-user rate limiting: a fixed-window cap of N requests/minute and a
//     daily request cap (RATE_LIMIT_PER_MIN, RATE_LIMIT_PER_DAY). Over the cap
//     => HTTP 429 (with CORS) and the request is NOT forwarded.
//   - Monthly token budget guard: per-user (MONTHLY_TOKEN_BUDGET) and optional
//     global (GLOBAL_MONTHLY_TOKEN_BUDGET) caps on `usage.total_tokens`. When a
//     user/the platform is over budget => HTTP 429 (with CORS), not forwarded.
//     Streaming requests get `stream_options.include_usage` injected so the
//     final SSE chunk carries usage we can account.
//   - Moderation pass: the latest user message is screened with OpenAI's free
//     moderation endpoint before forwarding (MODERATION_ENABLED, default on).
//     Flagged content => HTTP 400 (with CORS), not forwarded to chat.
//
// STATE / DURABILITY
// ------------------
// Edge functions are stateless, so counters live in an external store. We use a
// pluggable CounterStore with three backends, selected via STATE_BACKEND
// (default "auto"):
//   1. Upstash Redis REST (atomic INCRBY + EXPIRE NX) — preferred, durable.
//   2. Netlify Blobs (strong-consistency read-modify-write) — durable but not
//      atomic, so counters are best-effort under high concurrency.
//   3. In-memory (per-isolate) — last-resort fallback; NOT shared across
//      isolates/regions and reset on cold start. Documented limitation.
//
// FAIL-OPEN / FAIL-CLOSED
// -----------------------
// Counters fail OPEN: if the store is unreachable we log and allow the request
// rather than hard-blocking all AI. Budget overflow fails CLOSED only when the
// store IS reachable and reports the user/platform over budget.
//
// The OpenAI key (`OPENAI_API_KEY`) lives ONLY in Netlify's environment (and a
// gitignored local `.env` for `netlify dev`). It is never sent to the client
// and never committed to the repo.

import {
  createRemoteJWKSet,
  jwtVerify,
} from "https://deno.land/x/jose@v5.9.6/index.ts";

// Firebase publishes the Secure Token Service signing keys in two equivalent
// forms. The Firebase docs reference the x509 cert endpoint, but `jose`'s
// `createRemoteJWKSet` consumes the *JWK Set* form of the very same keys:
//   https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com
// This endpoint returns `{ "keys": [ { kty, kid, n, e, alg: "RS256", ... } ] }`
// and sends a Cache-Control header that `jose` honors for automatic key
// rotation/caching, so we don't refetch on every request.
const FIREBASE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";

// Cost-efficient fallback if neither the request nor OPENAI_DEFAULT_MODEL set one.
const FALLBACK_MODEL = "gpt-4o-mini";
// Default (free) moderation model.
const DEFAULT_MODERATION_MODEL = "omni-moderation-latest";

// Cache the remote key set across invocations (warm isolates reuse this).
const jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

/** Read an integer env var, returning `fallback` when unset/invalid. */
function envInt(name: string, fallback: number): number {
  const raw = Deno.env.get(name);
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Read a boolean env var (default true unless explicitly falsey). */
function envBool(name: string, fallback: boolean): boolean {
  const raw = Deno.env.get(name);
  if (raw == null || raw.trim() === "") return fallback;
  return !/^(0|false|no|off)$/i.test(raw.trim());
}

// ---------------------------------------------------------------------------
// CORS + JSON helpers
// ---------------------------------------------------------------------------

/**
 * Build the CORS headers for a given request origin.
 *
 * ALLOWED_ORIGIN may be a comma-separated allowlist of origins (e.g. the app's
 * Firebase Hosting domains). We match the request Origin against the list and
 * echo it back. If ALLOWED_ORIGIN is unset we echo the request origin so local
 * development (`netlify dev`, Vite on localhost) works out of the box.
 */
function corsHeaders(req: Request): Headers {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  });

  const requestOrigin = req.headers.get("Origin") ?? "";
  const allowList = (Deno.env.get("ALLOWED_ORIGIN") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowList.length === 0) {
    // No allowlist configured: permissive echo (local dev / first deploy).
    if (requestOrigin) headers.set("Access-Control-Allow-Origin", requestOrigin);
  } else if (requestOrigin && allowList.includes(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
  }
  // If an allowlist is set and the origin doesn't match, no ACAO header is
  // emitted and the browser will block the response.

  return headers;
}

/** JSON error helper that always includes CORS headers. */
function jsonError(
  message: string,
  status: number,
  req: Request,
  extra?: Record<string, unknown>,
): Response {
  const headers = corsHeaders(req);
  headers.set("Content-Type", "application/json");
  if (status === 429 && extra && typeof extra.retryAfter === "number") {
    headers.set("Retry-After", String(extra.retryAfter));
  }
  return new Response(
    JSON.stringify({ error: { message, status, ...(extra ?? {}) } }),
    { status, headers },
  );
}

// ---------------------------------------------------------------------------
// Counter store (pluggable backend)
// ---------------------------------------------------------------------------

interface CounterStore {
  readonly name: string;
  /**
   * Atomically (or best-effort) increment `key` by `amount`, applying `ttl`
   * (seconds) on first creation, and return the resulting total.
   */
  increment(key: string, amount: number, ttlSeconds: number): Promise<number>;
  /** Read the current value (0 when missing/expired). */
  get(key: string): Promise<number>;
}

/** Upstash Redis REST — atomic INCRBY + EXPIRE NX. Preferred backend. */
class UpstashStore implements CounterStore {
  readonly name = "upstash";
  constructor(private readonly url: string, private readonly token: string) {}

  private async pipeline(commands: unknown[][]): Promise<
    Array<{ result?: unknown; error?: string }>
  > {
    const res = await fetch(`${this.url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) {
      throw new Error(`Upstash REST error ${res.status}: ${await res.text()}`);
    }
    return await res.json();
  }

  async increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
    // EXPIRE ... NX sets a TTL only if the key has none yet, giving us a true
    // fixed window that does not slide on every increment.
    const out = await this.pipeline([
      ["INCRBY", key, amount],
      ["EXPIRE", key, ttlSeconds, "NX"],
    ]);
    const first = out[0];
    if (first?.error) throw new Error(first.error);
    return Number(first?.result ?? 0);
  }

  async get(key: string): Promise<number> {
    const out = await this.pipeline([["GET", key]]);
    const first = out[0];
    if (first?.error) throw new Error(first.error);
    return first?.result == null ? 0 : Number(first.result);
  }
}

/**
 * Netlify Blobs — strong-consistency read-modify-write. Durable but NOT atomic,
 * so concurrent increments can under-count slightly. TTL is emulated via a
 * stored expiry timestamp. Imported dynamically so plain `deno check` (which
 * cannot resolve the bare specifier) still passes.
 */
class BlobsStore implements CounterStore {
  readonly name = "blobs";
  // deno-lint-ignore no-explicit-any
  constructor(private readonly store: any) {}

  static async create(storeName: string): Promise<BlobsStore | null> {
    try {
      // Indirect specifier so static analysis (deno check) won't try to resolve
      // a bare npm import; resolves at runtime inside the Netlify edge bundle.
      const specifier = "@netlify/blobs";
      const mod = await import(specifier);
      const store = mod.getStore({ name: storeName, consistency: "strong" });
      return new BlobsStore(store);
    } catch (err) {
      console.warn("Netlify Blobs unavailable:", err);
      return null;
    }
  }

  async increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const prev = await this.store
      .get(key, { type: "json", consistency: "strong" })
      .catch(() => null);
    let value = 0;
    let exp = now + ttlSeconds * 1000;
    if (prev && typeof prev.exp === "number" && prev.exp > now) {
      value = Number(prev.v) || 0;
      exp = prev.exp; // keep the original window expiry
    }
    value += amount;
    await this.store.setJSON(key, { v: value, exp });
    return value;
  }

  async get(key: string): Promise<number> {
    const now = Date.now();
    const prev = await this.store
      .get(key, { type: "json", consistency: "strong" })
      .catch(() => null);
    if (prev && typeof prev.exp === "number" && prev.exp > now) {
      return Number(prev.v) || 0;
    }
    return 0;
  }
}

/** In-memory per-isolate fallback. Not shared across isolates; resets on cold start. */
class MemoryStore implements CounterStore {
  readonly name = "memory";
  private readonly map = new Map<string, { v: number; exp: number }>();

  increment(key: string, amount: number, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const existing = this.map.get(key);
    if (!existing || existing.exp <= now) {
      this.map.set(key, { v: amount, exp: now + ttlSeconds * 1000 });
      return Promise.resolve(amount);
    }
    existing.v += amount;
    return Promise.resolve(existing.v);
  }

  get(key: string): Promise<number> {
    const now = Date.now();
    const existing = this.map.get(key);
    if (!existing || existing.exp <= now) return Promise.resolve(0);
    return Promise.resolve(existing.v);
  }
}

let storePromise: Promise<CounterStore> | null = null;

/** Select + cache the configured counter store across warm invocations. */
function getStore(): Promise<CounterStore> {
  if (!storePromise) storePromise = selectStore();
  return storePromise;
}

async function selectStore(): Promise<CounterStore> {
  const backend = (Deno.env.get("STATE_BACKEND") ?? "auto").toLowerCase();
  const upstashUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const upstashToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

  if ((backend === "auto" || backend === "upstash") && upstashUrl && upstashToken) {
    return new UpstashStore(upstashUrl, upstashToken);
  }
  if (backend === "upstash") {
    console.warn(
      "STATE_BACKEND=upstash but UPSTASH_REDIS_REST_URL/TOKEN missing; falling back to memory.",
    );
  }

  if (backend === "auto" || backend === "blobs") {
    const blobs = await BlobsStore.create(
      Deno.env.get("BLOBS_STORE_NAME") ?? "ai-proxy-state",
    );
    if (blobs) return blobs;
    if (backend === "blobs") {
      console.warn("STATE_BACKEND=blobs but Netlify Blobs unavailable; falling back to memory.");
    }
  }

  if (backend === "auto") {
    console.warn(
      "No durable counter store configured (Upstash/Blobs); using per-isolate memory. " +
        "Rate limits and token budgets are best-effort and NOT shared across isolates/regions.",
    );
  }
  return new MemoryStore();
}

/** Increment that fails OPEN: returns null (=> allow) when the store errors. */
async function safeIncrement(
  store: CounterStore,
  key: string,
  amount: number,
  ttlSeconds: number,
): Promise<number | null> {
  try {
    return await store.increment(key, amount, ttlSeconds);
  } catch (err) {
    console.error(`Counter increment failed for ${key} (failing open):`, err);
    return null;
  }
}

/** Read that fails OPEN: returns null (=> allow) when the store errors. */
async function safeGet(store: CounterStore, key: string): Promise<number | null> {
  try {
    return await store.get(key);
  } catch (err) {
    console.error(`Counter read failed for ${key} (failing open):`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Message extraction + moderation
// ---------------------------------------------------------------------------

/** Extract plain-text parts from the most recent user message. */
function latestUserTexts(messages: unknown[]): string[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as { role?: unknown; content?: unknown } | null;
    if (!m || m.role !== "user") continue;
    const texts: string[] = [];
    if (typeof m.content === "string") {
      if (m.content.trim()) texts.push(m.content);
    } else if (Array.isArray(m.content)) {
      for (const part of m.content) {
        if (typeof part === "string") {
          if (part.trim()) texts.push(part);
        } else if (
          part && typeof part === "object" &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          const t = (part as { text: string }).text;
          if (t.trim()) texts.push(t);
        }
      }
    }
    return texts;
  }
  return [];
}

interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

/**
 * Screen text with OpenAI's free moderation endpoint.
 * Returns null on transport/HTTP failure so callers can FAIL OPEN.
 */
async function moderate(
  inputs: string[],
  openaiKey: string,
  model: string,
): Promise<ModerationResult | null> {
  if (inputs.length === 0) return { flagged: false, categories: [] };
  try {
    const res = await fetch(OPENAI_MODERATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({ model, input: inputs }),
    });
    if (!res.ok) {
      console.error(`Moderation HTTP ${res.status} (failing open):`, await res.text());
      return null;
    }
    const json = await res.json();
    const results: Array<{ flagged?: boolean; categories?: Record<string, boolean> }> =
      json?.results ?? [];
    const flaggedCats = new Set<string>();
    let flagged = false;
    for (const r of results) {
      if (r?.flagged) flagged = true;
      for (const [cat, on] of Object.entries(r?.categories ?? {})) {
        if (on) flaggedCats.add(cat);
      }
    }
    return { flagged, categories: [...flaggedCats] };
  } catch (err) {
    console.error("Moderation request failed (failing open):", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Streaming usage accounting
// ---------------------------------------------------------------------------

/**
 * A pass-through TransformStream that forwards SSE bytes UNCHANGED to the client
 * while sniffing the final `usage.total_tokens` from the stream. On flush it
 * invokes `onUsage` (awaited, keeping the isolate alive) to persist the tally.
 */
function usageAccountingStream(
  onUsage: (totalTokens: number) => Promise<void>,
): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  let totalTokens = 0;

  const scan = (chunk: string) => {
    buffer += chunk;
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const t = json?.usage?.total_tokens;
        if (typeof t === "number") totalTokens = t;
      } catch {
        // partial/non-JSON SSE line; ignore.
      }
    }
  };

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk); // forward exact bytes immediately
      scan(decoder.decode(chunk, { stream: true }));
    },
    async flush() {
      scan(decoder.decode());
      if (totalTokens > 0) {
        try {
          await onUsage(totalTokens);
        } catch (err) {
          console.error("Failed to record streamed usage:", err);
        }
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: Request): Promise<Response> {
  // 1. CORS preflight.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  // 2. Method guard.
  if (req.method !== "POST") {
    return jsonError("Method not allowed. Use POST.", 405, req);
  }

  // 3. Firebase ID-token verification (required).
  const authHeader = req.headers.get("Authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return jsonError("Missing or malformed Authorization bearer token.", 401, req);
  }
  const idToken = match[1].trim();

  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  if (!projectId) {
    return jsonError("Server misconfigured: FIREBASE_PROJECT_ID is not set.", 500, req);
  }

  let uid: string;
  try {
    // Verify signature against Google's public keys AND the required claims:
    //   alg = RS256, iss = https://securetoken.google.com/<projectId>,
    //   aud = <projectId>, exp in future, iat in past.
    const { payload } = await jwtVerify(idToken, jwks, {
      algorithms: ["RS256"],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const sub = payload.sub;
    if (typeof sub !== "string" || sub.length === 0) {
      return jsonError("Invalid token: missing subject (uid).", 401, req);
    }
    const authTime = payload.auth_time;
    if (typeof authTime === "number" && authTime > Math.floor(Date.now() / 1000)) {
      return jsonError("Invalid token: auth_time is in the future.", 401, req);
    }
    uid = sub;
  } catch (_err) {
    return jsonError("Invalid or expired Firebase ID token.", 401, req);
  }

  // 4. OpenAI key (server-side only).
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return jsonError("Server misconfigured: OPENAI_API_KEY is not set.", 500, req);
  }

  // 5. Parse + validate body.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (_err) {
    return jsonError("Request body must be valid JSON.", 400, req);
  }

  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages)) {
    return jsonError("Request body must include a `messages` array.", 400, req);
  }

  // 6. Trust, safety & cost controls (keyed by the verified uid).
  const store = await getStore();
  const now = new Date();

  // 6a. Per-user rate limiting (fixed windows). Counters fail OPEN.
  const perMin = envInt("RATE_LIMIT_PER_MIN", 20);
  const perDay = envInt("RATE_LIMIT_PER_DAY", 500);

  if (perMin > 0) {
    const minuteWindow = Math.floor(now.getTime() / 60000);
    const count = await safeIncrement(store, `rl:min:${uid}:${minuteWindow}`, 1, 70);
    if (count !== null && count > perMin) {
      return jsonError(
        `Rate limit exceeded: max ${perMin} requests per minute.`,
        429,
        req,
        { retryAfter: 60, limit: perMin, window: "minute" },
      );
    }
  }

  if (perDay > 0) {
    const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const count = await safeIncrement(store, `rl:day:${uid}:${dayKey}`, 1, 90000);
    if (count !== null && count > perDay) {
      return jsonError(
        `Daily request limit exceeded: max ${perDay} requests per day.`,
        429,
        req,
        { retryAfter: 3600, limit: perDay, window: "day" },
      );
    }
  }

  // 6b. Monthly token budget guard (pre-check). Fails CLOSED when reachable.
  const monthlyBudget = envInt("MONTHLY_TOKEN_BUDGET", 0); // 0 = disabled
  const globalBudget = envInt("GLOBAL_MONTHLY_TOKEN_BUDGET", 0); // 0 = disabled
  const monthKey = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const userTokenKey = `tok:user:${uid}:${monthKey}`;
  const globalTokenKey = `tok:global:${monthKey}`;
  const TOKEN_TTL_SECONDS = 35 * 24 * 3600; // ~one month + slack

  if (monthlyBudget > 0) {
    const used = await safeGet(store, userTokenKey);
    if (used !== null && used >= monthlyBudget) {
      return jsonError(
        "Monthly token budget exceeded for this account.",
        429,
        req,
        { retryAfter: 86400, budget: monthlyBudget, used, scope: "user" },
      );
    }
  }
  if (globalBudget > 0) {
    const used = await safeGet(store, globalTokenKey);
    if (used !== null && used >= globalBudget) {
      return jsonError(
        "Global monthly token budget exceeded. Please try again later.",
        429,
        req,
        { retryAfter: 86400, budget: globalBudget, used, scope: "global" },
      );
    }
  }

  // Persist token usage (used by the budget guard). Fails open.
  const recordUsage = async (totalTokens: number): Promise<void> => {
    if (!Number.isFinite(totalTokens) || totalTokens <= 0) return;
    if (monthlyBudget > 0) {
      await safeIncrement(store, userTokenKey, totalTokens, TOKEN_TTL_SECONDS);
    }
    if (globalBudget > 0) {
      await safeIncrement(store, globalTokenKey, totalTokens, TOKEN_TTL_SECONDS);
    }
  };

  // 6c. Moderation pass on the latest user message. Fails OPEN.
  //
  // Callers can mark a request as system-generated/trusted by sending a
  // top-level `moderate: false` (app-built content like anchored explanations,
  // lesson recaps, adaptive checks, and JSON generation — NOT free-form user
  // text). For those we skip the extra serial OpenAI moderation round-trip to
  // cut time-to-first-token. Free-text tutor chat omits the flag and stays
  // moderated. MODERATION_ENABLED remains the global kill-switch.
  const skipModeration = (body as { moderate?: unknown }).moderate === false;
  if (envBool("MODERATION_ENABLED", true) && !skipModeration) {
    const inputs = latestUserTexts(messages);
    const moderationModel =
      Deno.env.get("MODERATION_MODEL") ?? DEFAULT_MODERATION_MODEL;
    const result = await moderate(inputs, openaiKey, moderationModel);
    if (result?.flagged) {
      return jsonError(
        "Your message was flagged by content moderation and was not processed.",
        400,
        req,
        { moderation: { flagged: true, categories: result.categories } },
      );
    }
  }

  // 7. Inject defaults + forward to OpenAI.
  //
  // Strip our custom, non-OpenAI top-level fields BEFORE forwarding: OpenAI
  // rejects unknown top-level params, and we forward `body` verbatim via
  // JSON.stringify(body) below (for both the streaming and non-streaming
  // paths). `moderate` is the only custom field we add; delete it here so it
  // can never reach OpenAI.
  delete (body as { moderate?: unknown }).moderate;

  if (!body.model) {
    body.model = Deno.env.get("OPENAI_DEFAULT_MODEL") ?? FALLBACK_MODEL;
  }

  const wantsStream = body.stream === true;
  if (wantsStream) {
    // Ensure the final SSE chunk carries usage so we can account streamed tokens.
    const existing = (body.stream_options ?? {}) as Record<string, unknown>;
    body.stream_options = { ...existing, include_usage: true };
  }

  let upstream: Response;
  try {
    upstream = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (_err) {
    return jsonError("Failed to reach OpenAI upstream.", 502, req);
  }

  const headers = corsHeaders(req);

  if (wantsStream && upstream.ok && upstream.body) {
    // Stream OpenAI's SSE straight through, sniffing usage for the budget guard.
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");
    const accounted = upstream.body.pipeThrough(usageAccountingStream(recordUsage));
    return new Response(accounted, { status: upstream.status, headers });
  }

  // Non-streaming (or an upstream error): forward status + JSON body as-is, but
  // account usage when present.
  const text = await upstream.text();
  if (upstream.ok) {
    try {
      const parsed = JSON.parse(text);
      const total = parsed?.usage?.total_tokens;
      if (typeof total === "number") await recordUsage(total);
    } catch {
      // Non-JSON success body; nothing to account.
    }
  }
  headers.set(
    "Content-Type",
    upstream.headers.get("Content-Type") ?? "application/json",
  );
  return new Response(text, { status: upstream.status, headers });
}
