/**
 * Shape + hydration for the persistent learner-memory blob.
 *
 * Learner memory is the cross-session "long-term memory" of the tutor: a compact,
 * rolling AI-written summary plus structured signals (recurring mistakes,
 * mastered/weak concepts, goals), a misconception ledger, and the spaced-
 * repetition card map. It is stored on the existing `users/{uid}` document under a
 * `learnerMemory` map (see src/firebase/memory.js), written merge-style so it
 * never clobbers the economy map that lives on the same doc.
 *
 * Everything here is pure + serializable so it can be hydrated defensively from
 * whatever is in Firestore and round-tripped without surprises.
 */

export const MEMORY_VERSION = 1;

// Hard caps keep the blob (and every AI prompt that embeds it) bounded.
export const LIMITS = {
  summary: 800,
  list: 8,
  misconceptions: 40,
  srs: 120,
};

export const EMPTY_MEMORY = Object.freeze({
  version: MEMORY_VERSION,
  summary: '',
  recurringMistakes: [],
  masteredConcepts: [],
  weakConcepts: [],
  goals: [],
  misconceptions: {},
  srs: {},
  // Bookkeeping for throttling the periodic AI summary refresh.
  signature: '',
  summaryUpdatedAt: 0,
});

function cleanStringList(value, max = LIMITS.list) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const t = item.trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t.slice(0, 160));
    if (out.length >= max) break;
  }
  return out;
}

function hydrateMisconception(raw, id) {
  if (!raw || typeof raw !== 'object') return null;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (!label) return null;
  return {
    id: String(raw.id || id).slice(0, 80),
    label: label.slice(0, 140),
    topic: typeof raw.topic === 'string' ? raw.topic.trim().slice(0, 80) : '',
    count: Math.max(1, Math.round(Number(raw.count) || 1)),
    lastSeenAt: Number(raw.lastSeenAt) || 0,
  };
}

function hydrateCard(raw, id) {
  if (!raw || typeof raw !== 'object') return null;
  const topic = typeof raw.topic === 'string' ? raw.topic.trim() : '';
  if (!topic) return null;
  return {
    id: String(raw.id || id).slice(0, 80),
    topic: topic.slice(0, 80),
    lessonId: raw.lessonId || null,
    reps: Math.max(0, Math.round(Number(raw.reps) || 0)),
    intervalDays: Math.max(0, Number(raw.intervalDays) || 0),
    ease: Number.isFinite(Number(raw.ease)) ? Number(raw.ease) : 2.5,
    lapses: Math.max(0, Math.round(Number(raw.lapses) || 0)),
    dueAt: Number(raw.dueAt) || 0,
    lastReviewedAt: Number(raw.lastReviewedAt) || null,
  };
}

function hydrateMap(raw, hydrateEntry, max) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  let n = 0;
  for (const key of Object.keys(raw)) {
    if (n >= max) break;
    const entry = hydrateEntry(raw[key], key);
    if (entry) {
      out[entry.id] = entry;
      n += 1;
    }
  }
  return out;
}

/** Normalizes any persisted memory blob into the full, safe shape. */
export function hydrateMemory(raw) {
  const m = raw && typeof raw === 'object' ? raw : {};
  return {
    version: MEMORY_VERSION,
    summary: typeof m.summary === 'string' ? m.summary.slice(0, LIMITS.summary) : '',
    recurringMistakes: cleanStringList(m.recurringMistakes),
    masteredConcepts: cleanStringList(m.masteredConcepts),
    weakConcepts: cleanStringList(m.weakConcepts),
    goals: cleanStringList(m.goals),
    misconceptions: hydrateMap(m.misconceptions, hydrateMisconception, LIMITS.misconceptions),
    srs: hydrateMap(m.srs, hydrateCard, LIMITS.srs),
    signature: typeof m.signature === 'string' ? m.signature : '',
    summaryUpdatedAt: Number(m.summaryUpdatedAt) || 0,
  };
}

/** True when the memory carries any meaningful, prompt-worthy signal. */
export function hasMemorySignal(memory) {
  if (!memory) return false;
  return Boolean(
    memory.summary ||
      memory.recurringMistakes.length ||
      memory.masteredConcepts.length ||
      memory.weakConcepts.length ||
      memory.goals.length ||
      Object.keys(memory.misconceptions || {}).length,
  );
}

/** Misconceptions sorted by frequency (most recurring first). */
export function topMisconceptions(memory, limit = 5) {
  const list = Object.values(memory?.misconceptions || {});
  return list
    .sort((a, b) => b.count - a.count || (b.lastSeenAt || 0) - (a.lastSeenAt || 0))
    .slice(0, limit);
}
