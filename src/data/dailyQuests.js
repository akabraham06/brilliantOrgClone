/**
 * Pure data model for the AI-driven DAILY QUEST system. No React, no Firebase —
 * just the quest catalog, reward calibration, deterministic selection, and the
 * date-reset helpers, so it can be imported anywhere (economy, context, UI) and
 * unit-reasoned exactly like economy.js.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  WHY these quests exist (learning-science grounding — see
 *  docs/learning-science-ai-features.md)
 * ────────────────────────────────────────────────────────────────────────────
 *  Every quest type maps to an evidence-based, DURABLE-learning principle and
 *  rewards the student for DOING the effortful thinking (never copying an AI
 *  answer). The five principles:
 *
 *   • retrieval  — Retrieval practice / testing effect (Karpicke & Roediger 2008):
 *                  actively recall answers instead of rereading.
 *   • spaced     — Spacing / distributed practice & the optimal gap (Cepeda et al.
 *                  2006, 2008): revisit concepts last seen a few days ago, timed by
 *                  the app's SM-2 scheduler so retrieval is effortful but successful.
 *   • interleave — Interleaving for discrimination (Kornell & Bjork 2008): mix
 *                  concepts/lessons in one session once the basics are familiar.
 *   • transfer   — Desirable difficulty & learning-vs-performance (Soderstrom &
 *                  Bjork 2015): favor effortful free-response / transfer checks over
 *                  easy immediate wins; reward demonstrated retention.
 *   • foundation — Build the prerequisite before stretching it (cognitive-load
 *                  awareness, Sweller/Baddeley): keep each quest small + focused.
 *
 *  AI guardrail (Bastani et al. 2025): the AI only personalizes the *copy* of a
 *  quest (title/description/rationale). It never sets rewards, never picks which
 *  quests appear, and never gives answers — the student must do the work in-app.
 *
 * ────────────────────────────────────────────────────────────────────────────
 *  REWARD CALIBRATION — why daily quests can't inflate the economy
 * ────────────────────────────────────────────────────────────────────────────
 *  Anchored to economy.js. A PERFECT, one-time full-course run yields ≈2,356 XP
 *  (~level 10) and ≈1,024 coins; the full 50-item store costs 14,100 coins, and
 *  the rare/epic/legendary tiers are intentionally gated behind day-capped Heat
 *  Check farming so the collection is a multi-session grind well beyond the ~5h
 *  course. A NEW recurring income stream (daily quests) is the biggest inflation
 *  risk, so it is deliberately the SMALLEST stream in the app:
 *
 *   • Per-quest rewards (below) are tiny: 15–30 XP and 2–5 coins.
 *   • A hard DAILY CAP (DAILY_QUEST_CAP) bounds the TOTAL claimable per day to
 *     80 XP / 12 coins regardless of how many quests are finished — the 3–4 daily
 *     quests sum to ~85–100 XP / ~13–16 coins, so the cap clips the top via
 *     diminishing returns (later claims award only the remaining headroom).
 *   • 12 coins/day ≈ 360/month — about 6 commons (60 each), trivial vs 14,100,
 *     and far below a single Heat Check run (~150–250 coins). It rewards the
 *     HABIT of durable-learning practice without letting anyone skip the intended
 *     cosmetic-unlock cadence.
 *   • 80 XP/day is ≈0.15% of the ~51,940 XP needed to reach level 50, so daily
 *     quests nudge leveling without short-circuiting the level curve.
 *
 *  Net effect: completing the course to mastery + Heat Check remain the dominant,
 *  intended progression; daily quests are a small, durable-learning-aligned bonus
 *  layered on top. Err conservative — bump the cap only with fresh pacing math.
 */
import { economyDayKey } from './economy.js';

/** Stable principle/metric ids. A quest's id === its principle === its metric. */
export const QUEST_PRINCIPLES = ['retrieval', 'spaced', 'interleave', 'transfer', 'foundation'];

/**
 * Per-principle presentation + the learning-science citation surfaced subtly in
 * the UI. `accent` reuses theme tokens (see styles/theme.css).
 */
export const PRINCIPLE_META = {
  retrieval: {
    label: 'Retrieval practice',
    science: 'Recalling answers (not rereading) builds far stronger memories — the testing effect (Karpicke & Roediger, 2008).',
    icon: '\u{1F9E0}', // brain
    accent: 'var(--accent-purple)',
  },
  spaced: {
    label: 'Spaced review',
    science: 'Revisiting a concept after a short gap makes recall effortful-but-successful, which locks it into long-term memory (Cepeda et al., 2006).',
    icon: '\u{1F501}', // repeat
    accent: 'var(--accent-blue)',
  },
  interleave: {
    label: 'Interleaving',
    science: 'Mixing topics in one session trains you to tell them apart and pick the right approach (Kornell & Bjork, 2008).',
    icon: '\u{1F500}', // shuffle
    accent: 'var(--accent-teal)',
  },
  transfer: {
    label: 'Desirable difficulty',
    science: 'Effortful, explain-it-yourself questions feel harder now but produce deeper, more transferable learning (Soderstrom & Bjork, 2015).',
    icon: '\u{1F4A1}', // bulb
    accent: 'var(--accent-orange)',
  },
  foundation: {
    label: 'Build the foundation',
    science: 'Small, focused steps keep cognitive load manageable so new ideas actually stick (Sweller; Baddeley).',
    icon: '\u{1F9F1}', // bricks
    accent: 'var(--accent-green)',
  },
};

/**
 * Per-quest reward by principle (idempotent, claimed once/day). Deliberately tiny
 * — see the CALIBRATION block above. Slightly higher for the more effortful,
 * higher-durability principles (spaced/interleave/transfer) to nudge toward them.
 */
export const DAILY_QUEST_REWARDS = {
  retrieval: { xp: 20, coins: 3 },
  spaced: { xp: 25, coins: 4 },
  interleave: { xp: 25, coins: 4 },
  transfer: { xp: 30, coins: 5 },
  foundation: { xp: 15, coins: 2 },
};

/**
 * Hard daily ceiling on TOTAL quest rewards, enforced at claim time as
 * diminishing returns (a claim only pays out the remaining headroom). This is the
 * real throttle that preserves course-completion + cosmetic pacing.
 */
export const DAILY_QUEST_CAP = { xp: 80, coins: 12 };

/** Keep the daily set small (cognitive-load awareness): 3–4 quests. */
export const DAILY_QUEST_COUNT = { min: 3, max: 4 };

/** Today's local day-key for the daily reset (shares economy's convention). */
export function questDayKey(date = new Date()) {
  return economyDayKey(date);
}

/** Milliseconds remaining until the next LOCAL midnight (for the reset countdown). */
export function msUntilReset(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

/** The shape a fresh daily-quest blob hydrates to. */
export function emptyDailyQuests(day = questDayKey()) {
  return { day, quests: [], progress: {}, claimed: [], claimedXp: 0, claimedCoins: 0 };
}

/** Normalizes any persisted daily-quest blob into the full, safe shape. */
export function hydrateDailyQuests(raw) {
  const base = emptyDailyQuests();
  if (!raw || typeof raw !== 'object') return base;
  const quests = Array.isArray(raw.quests)
    ? raw.quests.filter((q) => q && QUEST_PRINCIPLES.includes(q.id)).map(normalizeQuest)
    : [];
  const progress = raw.progress && typeof raw.progress === 'object' ? { ...raw.progress } : {};
  return {
    day: typeof raw.day === 'string' ? raw.day : base.day,
    quests,
    progress,
    claimed: Array.isArray(raw.claimed) ? raw.claimed.filter((id) => typeof id === 'string') : [],
    claimedXp: Math.max(0, Number(raw.claimedXp) || 0),
    claimedCoins: Math.max(0, Number(raw.claimedCoins) || 0),
  };
}

/** Defensive normalize of a single quest object (rewards always come from code). */
function normalizeQuest(q) {
  const reward = DAILY_QUEST_REWARDS[q.id] || DAILY_QUEST_REWARDS.retrieval;
  return {
    id: q.id,
    principle: q.id,
    metric: q.id,
    title: String(q.title || PRINCIPLE_META[q.id]?.label || 'Daily quest').slice(0, 80),
    description: String(q.description || '').slice(0, 200),
    rationale: String(q.rationale || PRINCIPLE_META[q.id]?.science || '').slice(0, 240),
    target: Math.max(1, Math.min(10, Math.round(Number(q.target) || 1))),
    icon: PRINCIPLE_META[q.id]?.icon || '\u2728',
    to: typeof q.to === 'string' ? q.to : '/app/practice',
    cta: String(q.cta || 'Start').slice(0, 32),
    // Rewards are NEVER trusted from persistence/AI — always re-derived here.
    xp: reward.xp,
    coins: reward.coins,
  };
}

/** True when a quest's tracked progress meets its target. */
export function isQuestComplete(quest, progress) {
  if (!quest) return false;
  return (progress?.[quest.metric] || 0) >= quest.target;
}

/** True when the quest's reward has already been claimed today. */
export function isQuestClaimed(quest, blob) {
  return !!quest && Array.isArray(blob?.claimed) && blob.claimed.includes(quest.id);
}

/**
 * Clamps a quest's nominal reward to the remaining daily headroom (diminishing
 * returns). Returns { xp, coins } actually grantable right now.
 */
export function cappedReward(quest, blob) {
  if (!quest) return { xp: 0, coins: 0 };
  const xpLeft = Math.max(0, DAILY_QUEST_CAP.xp - (blob?.claimedXp || 0));
  const coinsLeft = Math.max(0, DAILY_QUEST_CAP.coins - (blob?.claimedCoins || 0));
  return { xp: Math.min(quest.xp, xpLeft), coins: Math.min(quest.coins, coinsLeft) };
}

/** Total nominal (pre-cap) rewards across a quest set, for the "available" readout. */
export function totalQuestRewards(quests = []) {
  return quests.reduce(
    (acc, q) => ({ xp: acc.xp + (q.xp || 0), coins: acc.coins + (q.coins || 0) }),
    { xp: 0, coins: 0 },
  );
}

// ── Deterministic quest selection (the always-available fallback) ─────────────

/** Default per-principle target counts (kept small — cognitive-load aware). */
const DEFAULT_TARGET = { retrieval: 5, spaced: 2, interleave: 1, transfer: 2, foundation: 1 };

function buildQuest(id, { title, description, target, to, cta }) {
  const reward = DAILY_QUEST_REWARDS[id];
  return {
    id,
    principle: id,
    metric: id,
    title,
    description,
    rationale: PRINCIPLE_META[id].science,
    target: target || DEFAULT_TARGET[id] || 1,
    icon: PRINCIPLE_META[id].icon,
    to,
    cta,
    xp: reward.xp,
    coins: reward.coins,
  };
}

/**
 * Picks the day's quest set deterministically from the performance context. Pure
 * + total: it ALWAYS returns 3–4 sensible quests (AI off, brand-new learner, or
 * AI failure all land here). `context` is produced by buildDailyQuestContext in
 * src/ai/dailyQuestGenerator.js.
 */
export function selectDeterministicQuests(context = {}) {
  const {
    dueTopics = [],
    interleaveLessons = [],
    hasFreeResponse = false,
    coursePercent = 0,
    started = false,
  } = context;

  const reviewTo = hasFreeResponse ? '/app/practice' : '/app/heat-check';
  const candidates = [];

  // 1) Retrieval — the backbone; always present.
  candidates.push(
    buildQuest('retrieval', {
      title: 'Recall under fire',
      description: `Answer ${DEFAULT_TARGET.retrieval} questions correctly from memory in Practice, Review, or Heat Check.`,
      to: reviewTo,
      cta: 'Start recalling',
    }),
  );

  // 2) Spaced — only when something is genuinely due (effortful-but-successful gap).
  if (dueTopics.length > 0) {
    const target = Math.max(1, Math.min(3, dueTopics.length));
    const sample = dueTopics.slice(0, 2).join(' & ');
    candidates.push(
      buildQuest('spaced', {
        title: 'Beat the forgetting curve',
        description: `Refresh ${target} ${target === 1 ? 'topic' : 'topics'} due for spaced review${sample ? ` (e.g. ${sample})` : ''}.`,
        target,
        to: hasFreeResponse ? '/app/practice?due=1' : '/app/heat-check',
        cta: 'Review now',
      }),
    );
  }

  // 3) Interleave — once ≥2 lessons are familiar, mix them to sharpen discrimination.
  if (interleaveLessons.length >= 2) {
    const pair = interleaveLessons.slice(0, 2).join(' & ');
    candidates.push(
      buildQuest('interleave', {
        title: 'Mix it up',
        description: `Finish one mixed session that spans different topics (e.g. ${pair}).`,
        to: hasFreeResponse ? '/app/practice' : `/app/courses/${context.courseId || ''}/review`,
        cta: 'Mixed practice',
      }),
    );
  }

  // 4) Transfer — effortful explain-it-yourself work (needs AI grading for FR).
  if (hasFreeResponse) {
    candidates.push(
      buildQuest('transfer', {
        title: 'Explain it yourself',
        description: `Tackle ${DEFAULT_TARGET.transfer} free-response or challenge questions in your own words.`,
        to: '/app/practice',
        cta: 'Take the challenge',
      }),
    );
  }

  // 5) Foundation — keep building the path while it isn't finished.
  if (coursePercent < 100) {
    candidates.push(
      buildQuest('foundation', {
        title: 'Lay another brick',
        description: started
          ? 'Complete a lesson to extend your foundation.'
          : 'Complete your first lesson to start your foundation.',
        to: context.nextLessonTo || `/app/courses/${context.courseId || ''}`,
        cta: started ? 'Continue lesson' : 'Start lesson',
      }),
    );
  }

  // Ensure we always have at least the minimum (pad with whatever's left over).
  const order = ['retrieval', 'spaced', 'interleave', 'transfer', 'foundation'];
  const have = new Set(candidates.map((q) => q.id));
  for (const id of order) {
    if (candidates.length >= DAILY_QUEST_COUNT.min) break;
    if (have.has(id)) continue;
    // Foundation is a safe filler even at 100% (re-review keeps the streak alive).
    candidates.push(
      buildQuest(id, {
        title: PRINCIPLE_META[id].label,
        description:
          id === 'foundation'
            ? 'Revisit a lesson to keep your streak and refresh the basics.'
            : `Practice with a focus on ${PRINCIPLE_META[id].label.toLowerCase()}.`,
        to: reviewTo,
        cta: 'Start',
      }),
    );
    have.add(id);
  }

  return candidates.slice(0, DAILY_QUEST_COUNT.max);
}
