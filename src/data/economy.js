/**
 * Pure economy model: the level curve, reward grant amounts, Heat Check scoring,
 * and the daily coin-run limits. No React, no Firebase — just math + constants so
 * it can be imported anywhere (UI, contexts, the Heat Check player) and unit-reasoned.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  BALANCING (Phase 5) — calibrated to the actual course + a ~5h mastery target
 * ────────────────────────────────────────────────────────────────────────────
 *  Measured course content (from chemistryCourse.js):
 *    • 8 lessons, 160 slides, 28 graded check slides (~166 authored minutes)
 *    • Plus ~3 AI-graded free-response questions authored per lesson (~24 total)
 *
 *  Design goal: completing the course to FULL MASTERY (~5 hours: every check +
 *  free-response first-try-correct, every lesson done, course 100%) should be
 *  rewarding but must NOT unlock the whole 50-item store. The rare/epic/legendary
 *  cosmetics require Heat Check farming, which is rate-limited per day — so a
 *  fresh account cannot buy everything in one sitting.
 *
 *  One-time (idempotent) income from a PERFECT course run (all first-try correct):
 *    XP : checks 28×30=840 · free-resp 24×24=576 · lessons 8×80=640 · course 300
 *         ───────────────────────────────────────────────────  ≈ 2,356 XP → ~level 10
 *    coins: checks 28×6=168 · free-resp 24×4=96 · lessons 8×25=200 · course 200
 *           + level-up payouts to L10 (coinsForLevelSpan(1,10)=360)
 *           ─────────────────────────────────────────────────  ≈ 1,024 coins
 *
 *  Full store cost = 14,100 coins (see cosmetics.js: common 25 / rare 16 / epic 5 /
 *  legendary 4). So a perfect course run lands ~level 10 with ~1k coins — enough
 *  for a handful of commons and the satisfaction of unlocking (but not affording)
 *  the rare tier. The remaining ~13k coins come from Heat Check: a strong ~3-4 min
 *  run nets ≈200-260 coins (runXp × coinRate), but only the first 3→5 runs/day earn
 *  coins (dailyCoinRunLimit). That cap is the real throttle — full-collection
 *  completion is intentionally a multi-session grind well beyond the 5h course.
 */

// ── Level curve ──────────────────────────────────────────────────────────────
// Super-linear so leveling slows down: the XP to clear a level grows linearly,
// which makes the cumulative XP-to-reach-level-N quadratic.
//   xpToClear(L) = BASE + STEP·(L-1)
//   cumXpToReach(N) = Σ_{L=1}^{N-1} xpToClear(L)
const LEVEL_BASE = 100; // XP to clear level 1 (i.e. reach level 2)
const LEVEL_STEP = 40; // each subsequent level costs this much more
export const MAX_LEVEL = 50;

/** XP required to CLEAR `level` (advance from `level` to `level`+1). */
export function xpToClearLevel(level) {
  return LEVEL_BASE + LEVEL_STEP * (Math.max(1, level) - 1);
}

/** Cumulative XP required to REACH `level` (level 1 = 0 XP). */
export function xpForLevel(level) {
  const n = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  let total = 0;
  for (let l = 1; l < n; l += 1) total += xpToClearLevel(l);
  return total;
}

/** The level for a given cumulative XP total (clamped to [1, MAX_LEVEL]). */
export function levelForXp(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  let level = 1;
  while (level < MAX_LEVEL && safe >= xpForLevel(level + 1)) level += 1;
  return level;
}

/**
 * Progress of `xp` within its current level, for XP-bar rendering.
 * Returns { level, into, span, pct, toNext, atMax }.
 */
export function levelProgress(xp) {
  const safe = Math.max(0, Number(xp) || 0);
  const level = levelForXp(safe);
  if (level >= MAX_LEVEL) {
    return { level, into: 0, span: 0, pct: 100, toNext: 0, atMax: true };
  }
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const into = safe - floor;
  return {
    level,
    into,
    span,
    pct: span ? Math.min(100, Math.round((into / span) * 100)) : 0,
    toNext: Math.max(0, ceil - safe),
    atMax: false,
  };
}

/**
 * Coins paid out for REACHING `level` (the level just gained). Grows with level
 * so the curve keeps feeling rewarding even as XP-per-level climbs.
 *   payout(L) = LEVELUP_COIN_BASE + LEVELUP_COIN_STEP·(L-1)
 */
const LEVELUP_COIN_BASE = 15;
const LEVELUP_COIN_STEP = 5;
export function coinsForLevelUp(level) {
  return LEVELUP_COIN_BASE + LEVELUP_COIN_STEP * (Math.max(2, level) - 1);
}

/** Total coins paid for crossing from `fromLevel` up to `toLevel` (exclusive→inclusive). */
export function coinsForLevelSpan(fromLevel, toLevel) {
  let coins = 0;
  for (let l = fromLevel + 1; l <= toLevel; l += 1) coins += coinsForLevelUp(l);
  return coins;
}

// ── One-time reward grants (idempotent, keyed) ───────────────────────────────
// Awarded once per grant key (check:<slideId>, fr:<bankItemId>, lesson:<lessonId>,
// course:<courseId>). Wrong-but-attempted still grants a little XP for effort.
export const REWARDS = {
  // A graded check slide, by first-attempt outcome.
  check: {
    correct: { xp: 30, coins: 6 },
    attempt: { xp: 10, coins: 0 },
  },
  // Low-stakes retrieval checks added for durable-learning (free-recall brain
  // dumps, "recall from last time" warm-ups, discrimination/interleaving checks).
  // Deliberately small XP and zero coins so they reward the effortful habit
  // without inflating the course-completion economy calibration (the ~2,356 XP /
  // ~1,024 coin "perfect run" anchor above stays effectively intact).
  lowStakes: { xp: 8, coins: 0 },
  // A single AI-graded free-response question, by first-attempt outcome.
  freeResponse: {
    correct: { xp: 24, coins: 4 },
    partial: { xp: 14, coins: 2 }, // AI scored it partially right
    attempt: { xp: 8, coins: 0 },
  },
  // Finishing a lesson (any path through it).
  lesson: { xp: 80, coins: 25 },
  // Reaching 100% course completion.
  course: { xp: 300, coins: 200 },
};

// ── Heat Check (timed farming mode) ──────────────────────────────────────────
// Highest XP/coin RATE in the app, but coin-earning runs are capped per day. Over
// the cap, runs still award XP/levels (so leveling never fully stalls) but no coins.
export const HEAT_CHECK = {
  durationMs: 5 * 60 * 1000, // 5-minute countdown

  // Per correct answer: base XP, scaled by the live combo multiplier + a speed
  // bonus for answering quickly. Wrong answer ends the run.
  baseXpPerCorrect: 12,

  // Combo/"heat" multiplier: climbs by `comboStep` per consecutive correct answer
  // up to `comboMax`. Resets to 1 only by ending the run (one wrong = run over).
  comboStart: 1,
  comboStep: 0.15,
  comboMax: 2.5,

  // Speed bonus: answering within `fastMs` adds `fastBonusXp` (linearly faded to 0
  // by `slowMs`). Rewards fluency, the whole point of the mode.
  fastMs: 4000,
  slowMs: 12000,
  fastBonusXp: 8,

  // Challenge questions (AI-generated harder items) are worth a flat XP kicker.
  challengeBonusXp: 10,

  // Coins earned from a run = round(runXp × coinRate), only when under the daily
  // coin-run cap. Tuned so a strong ~3-4 min run nets ~150-250 coins.
  coinRate: 0.5,

  // Daily coin-earning run cap, scaling with level (rewards investment without
  // letting low-level players farm infinitely). Index by tier; see dailyCoinRunLimit.
  baseDailyCoinRuns: 3,
  maxDailyCoinRuns: 5,
};

/**
 * How many coin-earning Heat Check runs the player gets today, by level.
 * Starts at 3, climbs one run every 5 levels, capped at 5.
 *   L1-4 → 3,  L5-9 → 4,  L10+ → 5
 */
export function dailyCoinRunLimit(level) {
  const lvl = Math.max(1, Number(level) || 1);
  const limit = HEAT_CHECK.baseDailyCoinRuns + Math.floor(lvl / 5);
  return Math.min(HEAT_CHECK.maxDailyCoinRuns, limit);
}

/** Today's day-key (local) for resetting the daily coin-run counter. */
export function economyDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** The shape a fresh economy doc hydrates to. */
export const EMPTY_ECONOMY = {
  xp: 0,
  coins: 0,
  level: 1,
  ownedCosmetics: [],
  equipped: {},
  grantedKeys: [],
  heatCheck: { day: economyDayKey(), coinRunsUsed: 0, bestXp: 0 },
  // Daily-quest blob (see data/dailyQuests.js). Date-keyed; resets at local
  // midnight. Reward claims are idempotent via grantedKeys (quest:<day>:<id>).
  dailyQuests: { day: economyDayKey(), quests: [], progress: {}, claimed: [], claimedXp: 0, claimedCoins: 0 },
};
