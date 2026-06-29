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
 *  ── Clean-run reallocation (NOT new income) ──
 *  The per-lesson reward (80 XP / 25 coins) is split into base (60/17) + a
 *  no-hint "clean run" bonus (20/8). A PERFECT run is by definition clean (zero
 *  hints, every graded check first-try-correct), so it still earns the full
 *  80/25 per lesson — the anchor above is unchanged. A non-clean finish earns
 *  only the base (60/17), i.e. slightly LESS than before (deflationary = safe).
 *
 *  ── Streak stream (tiny + capped) ──
 *  Daily activity grants a small streak reward (5 XP / 2 coins) plus one-time
 *  milestone bumps at 3/7/14/30 days (see STREAK_REWARDS). Ongoing income is
 *  ~2 coins/day ≈ 60/month, plus up to ~185 one-time milestone coins across the
 *  first month — well under the daily-quest stream (≤12 coins/day) and trivial
 *  vs the 40,250-coin store. It rewards the consistency HABIT without inflating
 *  the course-completion economy.
 *
 *  ── Earned exclusives (off the purchasable total) ──
 *  Mastery cosmetics (see data/storeRotation.js MASTERY_COSMETICS) are granted
 *  for demonstrating mastery, never sold, and are excluded from CATALOG /
 *  totalCatalogCost — so they don't touch the 40,250 calibration either.
 *
 *  ── Relative-performance stream (leaderboard, tiny + capped) ──
 *  On top of the combo+speed run scoring, Heat Check pays a small bonus for the
 *  player's STANDING on the global WEEKLY ladder (see HEAT_RANK_BONUS). The
 *  per-run bonus tops out at the top-10% tier (20 XP / 6 coins) and its COIN
 *  half is gated by the same daily coin-run cap as the run itself (it only pays
 *  when the run earned coins), so it can never out-earn the base run. Worst-case
 *  weekly ceiling for an elite grinder: ≤ ~5 coin-runs/day × 7 × 6 = 210 relative
 *  coins/week, plus a single idempotent weekly-settlement payout (≤ 120 XP / 60
 *  coins, keyed heatweekly:<weekKey> so it can't be double-claimed). That's a few
 *  percent nudge versus a ~200-260-coin base run and the 40,250-coin store — the
 *  ladder adds competitive flavor without disturbing the course/Heat-Check
 *  calibration above.
 *
 *  Full store cost = 40,250 coins (Phase 6 re-balance; see cosmetics.js: common 25 ×
 *  150 / rare 16 × 750 / epic 5 × 1,500 / legendary 4 × 3,000 + the pinned 5,000-coin
 *  3D skin). Prices were raised ~2.5x on the SPEND side only — the perfect-course-run
 *  income anchor above (≈2,356 XP / 1,024 coins) is unchanged. So a perfect course run
 *  still lands ~level 10 with ~1k coins — now barely a handful of commons and the
 *  satisfaction of unlocking (but nowhere near affording) the rare tier. The remaining
 *  ~39k coins come from Heat Check: a strong ~3-4 min run nets ≈200-260 coins
 *  (runXp × coinRate), but only the first 3→5 runs/day earn coins (dailyCoinRunLimit).
 *  That cap is the real throttle — with the higher prices, full-collection completion
 *  is intentionally a much longer, multi-session grind well beyond the 5h course.
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
  // Finishing a lesson. Split into a base (granted on any completion) plus a
  // no-hint "clean run" bonus (granted only when the lesson was finished with
  // zero hints and every graded non-low-stakes check first-attempt-correct).
  // base + cleanRunBonus = 80 / 25, so a perfect (clean) run is unchanged; a
  // non-clean finish earns only the base. Reallocation, not new income.
  lesson: {
    base: { xp: 60, coins: 17 },
    cleanRunBonus: { xp: 20, coins: 8 },
  },
  // Reaching 100% course completion.
  course: { xp: 300, coins: 200 },
};

// ── Streak / consistency rewards (tiny + capped) ─────────────────────────────
// Granted once per new active day (idempotent via grant key streak:<dayKey>).
// A small daily base plus one-time milestone bumps at 3/7/14/30 days. The
// monthly ceiling stays well below the daily-quest stream (≤12 coins/day), so
// course mastery + Heat Check remain the dominant progression — see the
// calibration block at the top of this file.
export const STREAK_REWARDS = {
  daily: { xp: 5, coins: 2 },
  milestones: {
    3: { xp: 15, coins: 10 },
    7: { xp: 30, coins: 25 },
    14: { xp: 60, coins: 50 },
    30: { xp: 120, coins: 100 },
  },
};

/** Ordered streak milestone day-counts (for "next milestone in N days" UI). */
export const STREAK_MILESTONES = [3, 7, 14, 30];

/**
 * Reward for reaching `streakCount` active days: the daily base plus the
 * milestone bonus if this exact day-count is a milestone. Pure.
 */
export function streakReward(streakCount) {
  const n = Math.max(0, Math.floor(Number(streakCount) || 0));
  const base = STREAK_REWARDS.daily;
  const milestone = STREAK_REWARDS.milestones[n] || { xp: 0, coins: 0 };
  return { xp: base.xp + milestone.xp, coins: base.coins + milestone.coins };
}

/**
 * The next streak milestone strictly above `streakCount`, or null once every
 * milestone has been reached. Used by the streak UI to show "N days to go".
 */
export function nextStreakMilestone(streakCount) {
  const n = Math.max(0, Math.floor(Number(streakCount) || 0));
  return STREAK_MILESTONES.find((m) => m > n) || null;
}

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

// ── Heat Check relative-performance rewards (global leaderboard) ──────────────
// A small, CAPPED stream layered on top of the combo+speed run scoring, paid for
// the player's STANDING among other real players on the WEEKLY ladder. Buckets
// are by percentile (rank ÷ field size), so the reward reflects relative — not
// absolute — performance. The COIN half is gated by the daily coin-run cap (the
// caller only pays it when the base run earned coins, reusing recordHeatRun's
// `coinsBlocked` result), so it can never let a player out-earn the base run.
// See the calibration block at the top of this file for the per-week ceiling.
export const HEAT_RANK_BONUS = {
  top10: { maxFraction: 0.1, xp: 20, coins: 6, label: 'Top 10% this week' },
  top25: { maxFraction: 0.25, xp: 12, coins: 4, label: 'Top 25% this week' },
  top50: { maxFraction: 0.5, xp: 6, coins: 2, label: 'Top half this week' },
};

/** Ordered HEAT_RANK_BONUS tiers, best (smallest fraction) first. */
const HEAT_RANK_TIERS = ['top10', 'top25', 'top50'];

/**
 * The relative-performance bonus for finishing a run at `rank` of `total` weekly
 * entries (1 = best). Pure. Returns { bucket, xp, coins, label }; a field with
 * no competition (total ≤ 1) or an unknown rank yields a zero, label-less bonus.
 */
export function heatRankBonus(rank, total) {
  const r = Math.floor(Number(rank) || 0);
  const n = Math.floor(Number(total) || 0);
  const zero = { bucket: null, xp: 0, coins: 0, label: '' };
  if (r <= 0 || n <= 1) return zero;
  const fraction = r / n;
  for (const tier of HEAT_RANK_TIERS) {
    const b = HEAT_RANK_BONUS[tier];
    if (fraction <= b.maxFraction) {
      return { bucket: tier, xp: b.xp, coins: b.coins, label: b.label };
    }
  }
  return zero;
}

// One-time, idempotent settlement paid when the player returns in a NEW week and
// we can compute their FINAL rank in the previous week (keyed heatweekly:<weekKey>
// so it can't be double-claimed). Small + capped — top placements only.
export const HEAT_WEEKLY_SETTLEMENT = {
  champion: { maxRank: 1, xp: 120, coins: 60, label: 'Weekly champion' },
  top3: { maxRank: 3, xp: 80, coins: 40, label: 'Top 3 last week' },
  top10: { maxRank: 10, xp: 40, coins: 20, label: 'Top 10 last week' },
};

/** Ordered settlement tiers, best (smallest rank) first. */
const HEAT_SETTLEMENT_TIERS = ['champion', 'top3', 'top10'];

/**
 * The idempotent weekly-settlement reward for a final `rank` (1 = best), or null
 * when the placement is outside the paid tiers (or rank is unknown). Pure.
 */
export function heatWeeklySettlement(rank) {
  const r = Math.floor(Number(rank) || 0);
  if (r <= 0) return null;
  for (const tier of HEAT_SETTLEMENT_TIERS) {
    const t = HEAT_WEEKLY_SETTLEMENT[tier];
    if (r <= t.maxRank) return { tier, xp: t.xp, coins: t.coins, label: t.label };
  }
  return null;
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
