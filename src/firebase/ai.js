import { auth, firebaseEnabled } from './config.js';

/**
 * AI integration via a secure server-side proxy (OpenAI Chat Completions).
 *
 * The OpenAI secret key NEVER reaches the browser. Instead the app calls a
 * Netlify Edge Function (`VITE_AI_PROXY_URL`, e.g. `/api/ai`) with the signed-in
 * user's Firebase ID token in the `Authorization` header. The proxy verifies the
 * token, enforces rate/cost limits + moderation, injects the OpenAI key, and
 * forwards the request to OpenAI. See `netlify/edge-functions/ai.ts`.
 *
 * Every export here is a graceful no-op (returns null) when AI is not configured
 * or the user isn't signed in, so the rest of the app degrades to its existing
 * static behaviour. AI is only active when Firebase is configured, the deployer
 * opted in via `VITE_AI_ENABLED=true`, AND a proxy URL is set.
 */

// Proxy endpoint that fronts OpenAI. Configure with VITE_AI_PROXY_URL (e.g. the
// Netlify deploy URL + "/api/ai", or just "/api/ai" when same-origin).
const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || '';

// Optional model override. When unset, the proxy picks its default
// (OPENAI_DEFAULT_MODEL, falling back to gpt-4o-mini) so the client stays
// model-agnostic and we don't hard-code a model the key may not have access to.
const MODEL = import.meta.env.VITE_OPENAI_MODEL || '';

export const aiEnabled = Boolean(
  firebaseEnabled && import.meta.env.VITE_AI_ENABLED === 'true' && PROXY_URL,
);

/**
 * Shared persona + guardrails applied to every AI call. Tuned for the app's
 * 14-16 learner audience and Socratic, slide-grounded tutoring.
 */
export const SYSTEM_INSTRUCTION = `You are a friendly, encouraging chemistry tutor for students aged 14-16 in an "Introduction to Chemistry" course.

How you teach:
- Explain at a beginner level using plain language and short, vivid analogies.
- Be Socratic: guide the student toward understanding with hints and questions rather than just dumping the final answer. Only give a direct answer when they are stuck or explicitly ask for it.
- ALWAYS ground your explanation in the chemistry content provided to you (the current slide and the student's situation). Do not introduce material beyond an introductory chemistry course.
- Keep responses concise: 2-4 short sentences unless the student explicitly asks for more detail or a step-by-step walkthrough.
- Never fabricate chemical facts, values, formulas, or equations. If you are unsure, say so and suggest how to check.
- Politely refuse and gently redirect anything that is not about chemistry or this course.
- Be warm and motivating; never condescending.`;

/**
 * Minimal JSON-Schema builder that mirrors the subset of the Firebase AI
 * `Schema` API our call sites use, but emits plain JSON Schema compatible with
 * OpenAI structured outputs (`response_format: { type: 'json_schema' }`).
 *
 * Drop-in for callers that previously did `import { Schema } from 'firebase/ai'`
 * — they now import it from here instead.
 */
export const Schema = {
  string: () => ({ type: 'string' }),
  number: () => ({ type: 'number' }),
  integer: () => ({ type: 'integer' }),
  boolean: () => ({ type: 'boolean' }),
  array: ({ items } = {}) => ({ type: 'array', items: items ?? {} }),
  object: ({ properties = {}, optionalProperties = [] } = {}) => {
    const optional = new Set(optionalProperties);
    const required = Object.keys(properties).filter((k) => !optional.has(k));
    return {
      type: 'object',
      properties,
      ...(required.length ? { required } : {}),
    };
  },
};

/** Combines the base persona with optional per-call grounding/context. */
function buildSystemInstruction(extra) {
  return extra ? `${SYSTEM_INSTRUCTION}\n\n${extra}` : SYSTEM_INSTRUCTION;
}

/** Transient HTTP statuses worth retrying (rate limit + upstream hiccups). */
function isRetryableStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Awaits `fn()` and retries it on transient failures (flagged via `err.retryable`)
 * using exponential backoff with jitter (capped at ~4s). Re-throws after
 * exhausting retries so callers' catch blocks can fall back to null.
 */
async function withRetry(fn, { retries = 2, baseDelayMs = 600 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !err?.retryable) throw err;
      const backoff = Math.min(baseDelayMs * 2 ** attempt, 4000);
      await sleep(backoff + Math.random() * 200);
    }
  }
}

/** Current user's Firebase ID token, or null when signed out / unavailable. */
async function getIdToken() {
  const user = auth?.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (err) {
    console.error('[ai] failed to get Firebase ID token:', err);
    return null;
  }
}

/**
 * POSTs a Chat Completions payload to the proxy and returns the raw `Response`.
 * Throws an error tagged with `retryable` so `withRetry` can decide to re-run;
 * non-retryable failures (signed out, 4xx) bubble up to the caller's fallback.
 */
async function postCompletion(payload) {
  const token = await getIdToken();
  if (!token) {
    const err = new Error('Not signed in; cannot call AI proxy.');
    err.retryable = false;
    throw err;
  }

  let res;
  try {
    res = await window.fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        ...(MODEL ? { model: MODEL } : {}),
      }),
    });
  } catch (cause) {
    const err = new Error(`AI proxy network error: ${cause?.message ?? cause}`);
    err.retryable = true;
    throw err;
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore body read errors */
    }
    const err = new Error(`AI proxy HTTP ${res.status}: ${detail.slice(0, 300)}`);
    err.status = res.status;
    err.retryable = isRetryableStatus(res.status);
    throw err;
  }

  return res;
}

/** Standard single-turn message array with the shared persona as the system message. */
function chatMessages(system, userContent) {
  return [
    { role: 'system', content: buildSystemInstruction(system) },
    { role: 'user', content: userContent },
  ];
}

/**
 * Converts Gemini-style history (`{ role: 'user' | 'model', parts: [{ text }] }`)
 * into OpenAI chat messages. `model` maps to `assistant`.
 */
function toOpenAIMessages(history) {
  const out = [];
  for (const turn of history ?? []) {
    if (!turn) continue;
    const role = turn.role === 'model' || turn.role === 'assistant' ? 'assistant' : 'user';
    let content = '';
    if (Array.isArray(turn.parts)) {
      content = turn.parts
        .map((p) => (typeof p === 'string' ? p : p?.text ?? ''))
        .join('');
    } else if (typeof turn.content === 'string') {
      content = turn.content;
    }
    if (content) out.push({ role, content });
  }
  return out;
}

/**
 * Reads an OpenAI SSE stream off `res.body`, invoking `onChunk(delta, full)` for
 * each content delta and resolving with the full text. The proxy forwards
 * OpenAI's `data: {json}` lines unchanged (plus a trailing usage chunk + `[DONE]`).
 */
async function consumeStream(res, onChunk) {
  if (!res.body) return null;
  const reader = res.body.getReader();
  const decoder = new window.TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk?.(delta, full);
        }
      } catch {
        // Partial/non-JSON SSE line (usage chunk, etc.) — ignore.
      }
    }
  }

  return full || null;
}

/**
 * One-shot text generation. Returns the full string, or null on any failure so
 * callers can fall back to static content.
 */
export async function generateText(prompt, { system, maxTokens } = {}) {
  if (!aiEnabled) return null;
  try {
    const res = await withRetry(() =>
      postCompletion({
        messages: chatMessages(system, prompt),
        // App-built content (not free-form user text): safe to skip the
        // moderation round-trip in the proxy to cut time-to-first-token.
        moderate: false,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    );
    const json = await res.json();
    return json?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[ai] generateText failed:', err);
    return null;
  }
}

/**
 * Streaming text generation for a typing effect. Calls `onChunk(delta, full)`
 * as tokens arrive and resolves with the full text (or null on failure).
 */
export async function streamText(prompt, { system, maxTokens } = {}, onChunk) {
  if (!aiEnabled) return null;
  try {
    // Only the initial request is retried; once chunks flow we never retry, to
    // avoid emitting duplicated/partial text to the caller.
    const res = await withRetry(() =>
      postCompletion({
        messages: chatMessages(system, prompt),
        stream: true,
        // App-built content (not free-form user text): safe to skip the
        // moderation round-trip in the proxy to cut time-to-first-token.
        moderate: false,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    );
    return await consumeStream(res, onChunk);
  } catch (err) {
    console.error('[ai] streamText failed:', err);
    return null;
  }
}

/**
 * Multi-turn streaming chat. `history` is an array of
 * `{ role: 'user' | 'model', parts: [{ text }] }` (Gemini-style, preserved for
 * call-site compatibility). Streams the reply via `onChunk(delta, full)` and
 * resolves with the full reply (or null).
 */
export async function streamChat(history, { system } = {}, onChunk) {
  if (!aiEnabled) return null;
  try {
    const messages = [
      { role: 'system', content: buildSystemInstruction(system) },
      ...toOpenAIMessages(history),
    ];
    const res = await withRetry(() => postCompletion({ messages, stream: true }));
    return await consumeStream(res, onChunk);
  } catch (err) {
    console.error('[ai] streamChat failed:', err);
    return null;
  }
}

/**
 * Structured JSON generation. `schema` is a JSON Schema (build it with the
 * `Schema` helper above). Uses OpenAI structured outputs and returns the parsed
 * object, or null on any failure (network, HTTP, or parse) so callers fall back.
 */
export async function generateJSON(prompt, schema, { system, maxTokens } = {}) {
  if (!aiEnabled) return null;
  try {
    const responseFormat = schema
      ? {
          type: 'json_schema',
          json_schema: { name: 'result', strict: false, schema },
        }
      : { type: 'json_object' };
    const res = await withRetry(() =>
      postCompletion({
        messages: chatMessages(system, prompt),
        response_format: responseFormat,
        // App-built content (not free-form user text): safe to skip the
        // moderation round-trip in the proxy to cut time-to-first-token.
        moderate: false,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    );
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    console.error('[ai] generateJSON failed:', err);
    return null;
  }
}
