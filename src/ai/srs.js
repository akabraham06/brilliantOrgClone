/**
 * Spaced-repetition scheduler — a small, pure, framework-free SM-2 engine.
 *
 * This module owns ALL scheduling math so it can be reasoned about and tested in
 * isolation (no React, no Firestore, no AI). Cards are plain serializable objects
 * stored in the learner-memory blob (see memoryModel.js) and surfaced through the
 * recommender / practice page. The classic SM-2 algorithm is adapted slightly for
 * a beginner course: a "quality" grade of 0–5 drives the ease factor and the next
 * interval, and anything below 3 resets the card to be re-learned soon.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

/** Stable id for a topic-seeded card so re-seeding the same topic is idempotent. */
export function topicCardId(topic) {
  return `t:${String(topic).trim().toLowerCase().replace(/\s+/g, '-').slice(0, 60)}`;
}

/**
 * Creates a fresh review card for a topic, due immediately (so newly-identified
 * weak spots surface in the next "due for review" batch).
 */
export function createCard(topic, { lessonId = null, now = Date.now() } = {}) {
  return {
    id: topicCardId(topic),
    topic: String(topic).slice(0, 80),
    lessonId,
    reps: 0,
    intervalDays: 0,
    ease: DEFAULT_EASE,
    lapses: 0,
    dueAt: now,
    lastReviewedAt: null,
  };
}

function clampQuality(q) {
  const n = Math.round(Number(q));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

/**
 * Applies an SM-2 review to a card and returns a NEW card (never mutates input).
 * `quality` is 0–5 (0–2 = failed/relearn, 3 = hard, 4 = good, 5 = easy).
 */
export function reviewCard(card, quality, { now = Date.now() } = {}) {
  const q = clampQuality(quality);
  const prevEase = Number.isFinite(card?.ease) ? card.ease : DEFAULT_EASE;
  const prevReps = Number.isFinite(card?.reps) ? card.reps : 0;

  // SM-2 ease update, floored so cards never collapse to near-zero intervals.
  const ease = Math.max(MIN_EASE, prevEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  let reps;
  let intervalDays;
  let lapses = Number.isFinite(card?.lapses) ? card.lapses : 0;

  if (q < 3) {
    // Lapse: reset the streak and review again tomorrow.
    reps = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    reps = prevReps + 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.round((card.intervalDays || 1) * ease);
  }

  return {
    ...card,
    ease: Math.round(ease * 1000) / 1000,
    reps,
    intervalDays,
    lapses,
    dueAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now,
  };
}

/** True when a card is at or past its due time. */
export function isDue(card, now = Date.now()) {
  return !!card && (card.dueAt || 0) <= now;
}

/**
 * Returns the due cards from a card map/array, most overdue first, capped to
 * `limit`. Accepts either an id→card object or an array of cards.
 */
export function dueCards(cards, { now = Date.now(), limit = 20 } = {}) {
  const list = Array.isArray(cards) ? cards : Object.values(cards || {});
  return list
    .filter((c) => isDue(c, now))
    .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0))
    .slice(0, limit);
}

/** Count of due cards (cheap helper for badges/recommendations). */
export function dueCount(cards, now = Date.now()) {
  const list = Array.isArray(cards) ? cards : Object.values(cards || {});
  return list.filter((c) => isDue(c, now)).length;
}

/**
 * Merges new topic cards into an existing card map for any topic that isn't
 * already tracked. Existing cards (with real review history) are preserved as-is.
 * Returns a NEW map plus the count added.
 */
export function seedCards(existing = {}, topics = [], { now = Date.now() } = {}) {
  const next = { ...existing };
  let added = 0;
  for (const raw of topics) {
    const topic = typeof raw === 'string' ? raw : raw?.topic;
    const lessonId = typeof raw === 'object' ? raw.lessonId || null : null;
    if (!topic || !topic.trim()) continue;
    const id = topicCardId(topic);
    if (next[id]) continue;
    next[id] = createCard(topic, { lessonId, now });
    added += 1;
  }
  return { cards: next, added };
}
