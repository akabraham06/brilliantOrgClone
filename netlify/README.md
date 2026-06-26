# Netlify Edge Function: secure OpenAI proxy

This directory contains a single Netlify **Edge Function** (`edge-functions/ai.ts`)
that proxies OpenAI Chat Completions requests for the chemistry learning app.

It exists so the **client-side React/Vite app can use OpenAI without exposing the
secret key** and **without requiring the Firebase Blaze plan**. The Deno edge
runtime is free on Netlify and supports native streaming.

---

## Why a proxy?

A browser app cannot safely hold an OpenAI secret key. Instead:

1. The signed-in user's app gets a **Firebase Auth ID token** from the Firebase SDK.
2. The app `POST`s to this proxy at `/api/ai` with that token in the
   `Authorization` header.
3. The proxy **verifies the token** (proving the caller is a real signed-in user
   of our Firebase project), then injects the OpenAI key from a server-side
   environment variable and forwards the request to OpenAI.
4. OpenAI's response (including streaming SSE) is passed back to the browser.

The OpenAI key is read **only** from the runtime environment. It is never sent to
the client and never committed to the repository.

---

## Endpoint contract

**`POST /api/ai`** — OpenAI Chat Completions-compatible.

### Request

Headers:

| Header          | Value                                            |
| --------------- | ------------------------------------------------ |
| `Authorization` | `Bearer <Firebase ID token>` (**required**)      |
| `Content-Type`  | `application/json`                               |

Body (standard OpenAI Chat Completions shape):

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a chemistry tutor." },
    { "role": "user", "content": "Explain ionic bonds." }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 512,
  "response_format": { "type": "text" }
}
```

- `messages` (**required**, array) — the conversation.
- `model` (optional) — if omitted, the proxy injects `OPENAI_DEFAULT_MODEL` (env)
  or falls back to `gpt-4o-mini`.
- `stream` (optional) — when `true`, the response is streamed as
  `text/event-stream` (SSE), passed straight through from OpenAI.
- `temperature`, `max_tokens`, `response_format`, and any other Chat Completions
  fields are forwarded as-is.

### Response

- **Non-streaming** (`stream` omitted/false): OpenAI's JSON response, returned
  with OpenAI's status code.
- **Streaming** (`stream: true`): `Content-Type: text/event-stream`; OpenAI's SSE
  chunks (`data: {...}` lines, terminated by `data: [DONE]`) streamed unbuffered.
- All responses (including errors) include CORS headers.

### Error responses (JSON)

| Status | Meaning                                                          |
| ------ | ---------------------------------------------------------------- |
| `400`  | Body is not valid JSON, `messages` is missing/not an array, or the latest user message was **flagged by content moderation** (`error.moderation.categories` lists why). |
| `401`  | Missing/malformed bearer token, or invalid/expired Firebase ID token. |
| `405`  | Method other than `POST` (or `OPTIONS` preflight).               |
| `429`  | **Rate limit** (per-minute or per-day request cap) or **token budget** (per-user/global monthly) exceeded. Includes a `Retry-After` header and details in the JSON body. |
| `500`  | Server misconfigured (`OPENAI_API_KEY` or `FIREBASE_PROJECT_ID` unset). |
| `502`  | Could not reach OpenAI upstream.                                 |
| `4xx`/`5xx` | Any OpenAI error status is forwarded verbatim.              |

`429` bodies carry extra fields, e.g.:

```json
{ "error": { "message": "Rate limit exceeded: max 20 requests per minute.",
  "status": 429, "retryAfter": 60, "limit": 20, "window": "minute" } }
```
```json
{ "error": { "message": "Monthly token budget exceeded for this account.",
  "status": 429, "retryAfter": 86400, "budget": 1000000, "used": 1000123, "scope": "user" } }
```

Moderation rejections (`400`):

```json
{ "error": { "message": "Your message was flagged by content moderation and was not processed.",
  "status": 400, "moderation": { "flagged": true, "categories": ["violence"] } } }
```

Error body shape:

```json
{ "error": { "message": "Invalid or expired Firebase ID token.", "status": 401 } }
```

---

## Firebase ID-token verification

Firebase ID tokens are **RS256 JWTs** signed by Google's Secure Token Service.
The proxy verifies, using the [`jose`](https://github.com/panva/jose) library
(imported via URL — no `package.json`):

- `alg` = `RS256`
- `iss` = `https://securetoken.google.com/<FIREBASE_PROJECT_ID>`
- `aud` = `<FIREBASE_PROJECT_ID>`
- `exp` in the future, `iat` / `auth_time` in the past
- `sub` is a non-empty string (the user's `uid`)

### JWKS source (and why it's correct)

The signature is verified against Google's public keys via:

```
https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com
```

Firebase's official "verify ID tokens using a third-party JWT library" docs point
to the **x509 cert** endpoint
(`https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`).
That endpoint returns PEM certificates. `jose`'s `createRemoteJWKSet` instead
consumes a **JWK Set**, and Google publishes the *same Secure Token signing keys*
in JWK format at the `/service_accounts/v1/jwk/...` URL above. Both endpoints
expose identical keys (matched by `kid`); the JWK form is the canonical input for
`createRemoteJWKSet`, which also honors the endpoint's `Cache-Control` header to
cache keys and pick up Google's key rotation automatically.

---

## Required environment variables

Set these in **Netlify → Site settings → Environment variables** (and in a
gitignored local `.env` for `netlify dev`). **Never put them in the repo.**

| Variable               | Required | Description                                                                                     |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`       | yes      | Your OpenAI secret key. **Set the freshly rotated key here — never in the repo.**               |
| `FIREBASE_PROJECT_ID`  | yes      | Your Firebase project ID (same value as `VITE_FIREBASE_PROJECT_ID`). Used for `iss`/`aud` checks. |
| `ALLOWED_ORIGIN`       | yes (prod) | Comma-separated list of allowed app origins, e.g. `https://my-app.web.app,https://my-app.firebaseapp.com`. If unset, the proxy echoes the request origin (handy for local dev / first deploy, but lock this down for production). |
| `OPENAI_DEFAULT_MODEL` | no       | Default model when the request omits `model` (defaults to `gpt-4o-mini`).                       |

### Trust, safety & cost controls

| Variable                      | Default               | Description |
| ----------------------------- | --------------------- | ----------- |
| `RATE_LIMIT_PER_MIN`          | `20`                  | Max requests per signed-in user per rolling minute window. `0` disables. |
| `RATE_LIMIT_PER_DAY`          | `500`                 | Max requests per user per UTC day. `0` disables. |
| `MONTHLY_TOKEN_BUDGET`        | `0` (disabled)        | Per-user cap on `usage.total_tokens` per UTC month. `0` disables the guard (no accounting). Set e.g. `1000000`. |
| `GLOBAL_MONTHLY_TOKEN_BUDGET` | `0` (disabled)        | Platform-wide monthly token cap (all users combined). `0` disables. |
| `MODERATION_ENABLED`          | `true`                | Run the latest user message through OpenAI moderation before forwarding. Set `false`/`0`/`off` to disable. |
| `MODERATION_MODEL`            | `omni-moderation-latest` | Moderation model (the moderation endpoint is **free**). |

### State / datastore (rate-limit + token counters)

| Variable                   | Default          | Description |
| -------------------------- | ---------------- | ----------- |
| `STATE_BACKEND`            | `auto`           | `auto` \| `upstash` \| `blobs` \| `memory`. `auto` picks Upstash if configured, else Netlify Blobs, else in-memory. |
| `BLOBS_STORE_NAME`         | `ai-proxy-state` | Netlify Blobs store name (used when the Blobs backend is active). |
| `UPSTASH_REDIS_REST_URL`   | —                | Upstash Redis REST URL (enables the preferred atomic backend). |
| `UPSTASH_REDIS_REST_TOKEN` | —                | Upstash Redis REST token. |

> **Security note:** The OpenAI key the user pasted in chat earlier must be
> treated as **leaked**. Rotate it in the OpenAI dashboard and set the **new** key
> as `OPENAI_API_KEY` in Netlify — do not write any key into this repository.
> The OpenAI key is read **only** from `OPENAI_API_KEY` (used for both chat
> completions and the moderation call); it is never hardcoded.

---

## Trust, safety & cost controls (how they behave)

All controls are keyed by the **verified Firebase `uid`** (the token's `sub`
claim), so they cannot be spoofed by the client.

### 1. Per-user rate limiting

Two fixed windows are enforced with atomic counters: `RATE_LIMIT_PER_MIN`
requests per minute and `RATE_LIMIT_PER_DAY` per UTC day. Each request
increments the relevant counter; if it crosses the cap the proxy returns **429**
(with CORS + `Retry-After`) and does **not** forward to OpenAI.

### 2. Monthly token budget guard

Before forwarding, the proxy reads the user's month-to-date `usage.total_tokens`
(and, if configured, the global tally). If the user/platform is already at or
over budget it returns **429** without forwarding. After each successful
response the proxy records `usage.total_tokens`:

- **Non-streaming:** parsed from the JSON `usage` field.
- **Streaming:** the proxy injects `stream_options: { include_usage: true }` so
  OpenAI emits a final usage chunk; a pass-through transform sniffs it (bytes are
  forwarded to the client **unchanged**) and records the total when the stream
  ends.

Budget accounting only happens when `MONTHLY_TOKEN_BUDGET` (and/or
`GLOBAL_MONTHLY_TOKEN_BUDGET`) is > 0; otherwise the guard is fully disabled.

### 3. Moderation pass

When `MODERATION_ENABLED` is on (default), the latest user message is sent to the
**free** `https://api.openai.com/v1/moderations` endpoint first. If flagged, the
proxy returns **400** with the offending categories and never forwards the
prompt to chat completions.

### Fail-open / fail-closed semantics

- **Counters fail OPEN.** If the datastore is unreachable (network/store error),
  the proxy logs and **allows** the request rather than hard-blocking all AI.
- **Budget overflow fails CLOSED — but only when the store IS reachable.** If we
  can read the tally and the user/platform is over budget, the request is
  rejected (429). If the read fails, we fail open and allow it.
- **Moderation fails OPEN.** If the moderation call errors or returns non-200,
  the request is allowed (logged), to avoid a moderation outage blocking all AI.

---

## Datastore choice (free)

Edge functions are stateless, so counters need an external store. The proxy ships
a pluggable `CounterStore` with three backends, selected by `STATE_BACKEND`
(default `auto`):

1. **Upstash Redis REST — preferred.** Uses atomic `INCRBY` + `EXPIRE … NX` via a
   single REST pipeline call (plain `fetch`, no SDK). Atomicity makes rate limits
   and budgets correct even under concurrent requests across regions, and it is
   fully typecheckable with `deno check`.
   - **Free-tier setup:** create a database at <https://upstash.com> (free tier
     includes a daily command quota that comfortably covers this use case), then
     copy the **REST URL** and **REST token** into `UPSTASH_REDIS_REST_URL` /
     `UPSTASH_REDIS_REST_TOKEN`. No other config needed.

2. **Netlify Blobs — durable fallback.** Zero external setup (free, built into
   Netlify), strong-consistency read-modify-write with an emulated TTL. It is
   **not atomic**, so concurrent increments can slightly under-count — acceptable
   for soft limits but less precise than Upstash. Loaded via dynamic import so
   plain `deno check` still passes. Enable with `STATE_BACKEND=blobs` (or leave
   `auto` with no Upstash vars set).

3. **In-memory — last resort.** Per-isolate `Map`; **not shared** across
   isolates/regions and **reset on cold start**. Used only when neither Upstash
   nor Blobs is available. Limits become best-effort and approximate.

**Why Upstash is preferred over Blobs:** rate limiting and budget enforcement
need atomic increments to be correct under concurrency; Blobs lacks an atomic
increment primitive (read-modify-write can race). If you want zero external
accounts and can tolerate approximate counters, Blobs is a fine free default
(`STATE_BACKEND=blobs`).

---

## Deploy

1. **Connect the repo** in the Netlify dashboard (New site → import from Git), or
   deploy from the CLI:
   ```bash
   npx netlify deploy --build          # draft deploy
   npx netlify deploy --build --prod    # production deploy
   ```
2. Set the environment variables listed above in the Netlify UI.
3. After deploy, the proxy is available at:
   ```
   https://<your-site>.netlify.app/api/ai
   ```
4. Point the app at the proxy by setting the Vite env var (in the app's build
   environment):
   ```
   VITE_AI_PROXY_URL=https://<your-site>.netlify.app/api/ai
   ```

---

## Local development

```bash
npx netlify dev
```

Create a **gitignored** `.env` in the repo root holding the same variables:

```
OPENAI_API_KEY=sk-...            # your rotated key (never committed)
FIREBASE_PROJECT_ID=your-project-id
ALLOWED_ORIGIN=http://localhost:8888,http://localhost:5173
OPENAI_DEFAULT_MODEL=gpt-4o-mini

# Trust / safety / cost (all optional — sensible defaults apply)
RATE_LIMIT_PER_MIN=20
RATE_LIMIT_PER_DAY=500
MONTHLY_TOKEN_BUDGET=0           # 0 = disabled; set e.g. 1000000 to enable
GLOBAL_MONTHLY_TOKEN_BUDGET=0    # 0 = disabled
MODERATION_ENABLED=true

# Datastore for counters (optional). Leave unset to use Netlify Blobs / memory.
# STATE_BACKEND=upstash
# UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
# UPSTASH_REDIS_REST_TOKEN=...
```

> Locally (`netlify dev`) Netlify Blobs may be unavailable, so with no Upstash
> vars set the proxy falls back to the in-memory counter (per-process,
> approximate) — fine for development.

`netlify dev` serves the edge function locally (default at
`http://localhost:8888/api/ai`) alongside the Vite dev server.

---

## Costs

OpenAI usage is **billed per token by OpenAI**, separate from Netlify and
Firebase. This proxy requires a **funded OpenAI account** with a valid API key.
Netlify Edge Functions and Firebase Auth (Spark plan) are free for this use case.
