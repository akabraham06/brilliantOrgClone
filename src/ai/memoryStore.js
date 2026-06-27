/**
 * Provider-less singleton store for the persistent learner memory.
 *
 * The tutor lives in providers wired high in the app shell (AppLayout) that this
 * feature does not own, so rather than add another React context there, learner
 * memory is shared through a tiny module-level store: it loads once per signed-in
 * user, caches the blob, and lets any component subscribe via useSyncExternal
 * Store (see useLearnerMemory.js). Writes are coalesced and persisted merge-style
 * with the same ~800ms debounce the economy/progress contexts use.
 *
 * All AI is self-gated and throttled: the rolling summary is only refreshed when
 * the underlying progress "signature" actually changes and a cooldown has passed.
 */
import { fetchMemory, saveMemory } from '../firebase/memory.js';
import { aiEnabled } from '../firebase/ai.js';
import { EMPTY_MEMORY, hydrateMemory, LIMITS } from './memoryModel.js';
import { reviewCard, seedCards, topicCardId } from './srs.js';
import { summarizeLearnerMemory } from './memorySummary.js';
import { misconceptionId } from './misconception.js';

const SAVE_DEBOUNCE_MS = 800;
// Don't re-summarize more than this often, even as progress keeps changing.
const SUMMARY_COOLDOWN_MS = 60 * 1000;

let state = { uid: null, memory: EMPTY_MEMORY, loaded: false, loading: false };
const listeners = new Set();

let saveTimer = null;
let summarizing = false;

function emit() {
  for (const fn of listeners) fn();
}

export function getMemoryState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Loads memory for a uid once; resets to empty when signed out. */
export function ensureLoaded(uid) {
  if (!uid) {
    if (state.uid !== null || !state.loaded) {
      state = { uid: null, memory: EMPTY_MEMORY, loaded: true, loading: false };
      emit();
    }
    return;
  }
  if (state.uid === uid && (state.loaded || state.loading)) return;

  state = { uid, memory: EMPTY_MEMORY, loaded: false, loading: true };
  emit();

  fetchMemory(uid)
    .then((raw) => {
      // Ignore a stale load if the user changed while we were fetching.
      if (state.uid !== uid) return;
      state = { uid, memory: hydrateMemory(raw), loaded: true, loading: false };
      emit();
    })
    .catch((err) => {
      console.error('[memory] failed to load:', err);
      if (state.uid !== uid) return;
      state = { uid, memory: EMPTY_MEMORY, loaded: true, loading: false };
      emit();
    });
}

function scheduleSave() {
  if (!state.uid) return;
  if (saveTimer) window.clearTimeout(saveTimer);
  const uid = state.uid;
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    saveMemory(uid, state.memory).catch((err) => console.error('[memory] save failed:', err));
  }, SAVE_DEBOUNCE_MS);
}

/** Applies a pure updater to the current memory, then persists + notifies. */
function update(updater) {
  if (!state.loaded) return;
  const next = updater(state.memory);
  if (next === state.memory) return;
  state = { ...state, memory: next };
  scheduleSave();
  emit();
}

/**
 * Logs (or increments) a named misconception. `entry` is { id?, label, topic }.
 * Idempotent-ish: the same label collapses onto one accumulating counter.
 */
export function recordMisconception(entry) {
  if (!entry || !entry.label) return;
  const id = entry.id || misconceptionId(entry.label);
  if (!id) return;
  update((mem) => {
    const existing = mem.misconceptions[id];
    const misconceptions = {
      ...mem.misconceptions,
      [id]: {
        id,
        label: String(entry.label).slice(0, 140),
        topic: entry.topic || existing?.topic || '',
        count: (existing?.count || 0) + 1,
        lastSeenAt: Date.now(),
      },
    };
    // Also make sure the misconception's topic is queued for spaced review.
    let srs = mem.srs;
    const topic = entry.topic || existing?.topic;
    if (topic) {
      const seeded = seedCards(mem.srs, [{ topic, lessonId: entry.lessonId || null }]);
      if (seeded.added) srs = seeded.cards;
    }
    return { ...mem, misconceptions, srs };
  });
}

/** Seeds spaced-repetition cards for any not-yet-tracked weak topics. */
export function seedReviewTopics(topics = []) {
  if (!topics.length) return;
  update((mem) => {
    const { cards, added } = seedCards(mem.srs, topics, { now: Date.now() });
    return added ? { ...mem, srs: cards } : mem;
  });
}

/** Records an SM-2 review outcome (quality 0–5) for a topic card. */
export function recordReview(topic, quality, { lessonId = null } = {}) {
  if (!topic) return;
  update((mem) => {
    // Ensure the card exists (deterministic id), then apply the SM-2 review.
    const { cards } = seedCards(mem.srs, [{ topic, lessonId }]);
    const base = cards[topicCardId(topic)];
    if (!base) return mem;
    const reviewed = reviewCard(base, quality);
    return { ...mem, srs: { ...cards, [reviewed.id]: reviewed } };
  });
}

/**
 * Throttled rolling-summary refresh. `profile` is the enriched learner profile,
 * `signature` a cheap fingerprint of the progress that should trigger updates,
 * `lessons` for topic grounding. No-ops when AI is off, mid-flight, unchanged,
 * or still within the cooldown window.
 */
export async function maybeRefreshSummary({ profile, signature, lessons } = {}) {
  if (!aiEnabled || summarizing || !state.loaded || !state.uid) return;
  const mem = state.memory;
  if (signature && signature === mem.signature) return;
  if (Date.now() - (mem.summaryUpdatedAt || 0) < SUMMARY_COOLDOWN_MS && mem.summary) return;

  summarizing = true;
  try {
    const result = await summarizeLearnerMemory(profile, mem, lessons);
    if (result && state.uid) {
      update((m) => ({
        ...m,
        summary: result.summary.slice(0, LIMITS.summary),
        recurringMistakes: result.recurringMistakes,
        masteredConcepts: result.masteredConcepts,
        weakConcepts: result.weakConcepts,
        goals: result.goals,
        signature: signature || m.signature,
        summaryUpdatedAt: Date.now(),
      }));
    } else if (signature) {
      // Even on a no-op result, advance the signature so we don't hammer retries.
      update((m) => ({ ...m, signature, summaryUpdatedAt: Date.now() }));
    }
  } finally {
    summarizing = false;
  }
}
