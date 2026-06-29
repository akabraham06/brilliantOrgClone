/**
 * Pure anti-habituation shop model: a deterministic daily "Featured today"
 * rotation, a light seasonal theme, and the mastery-earned exclusive cosmetics.
 * No React, no Firebase — just math + constants, mirroring economy.js so the UI,
 * EconomyContext, and Store page all agree on prices and selection.
 *
 * ── Calibration safety (see economy.js for the full math) ──
 *  • Featured discount is a flat 15% off, ONLY for common/uncommon/rare items
 *    (max ~45 coins off a 300-coin rare; legendary/epic never discount). With 3
 *    featured items rotating daily this is negligible vs the 40,250-coin store.
 *  • Mastery exclusives (MASTERY_COSMETICS) are EARNED, never sold, and are
 *    excluded from CATALOG / totalCatalogCost in cosmetics.js — so they don't
 *    touch the purchasable total at all.
 */
import { CATALOG } from './cosmetics.js';
import { economyDayKey } from './economy.js';

/** Deterministic PRNG (mulberry32) — copied from data/reviewQuestions.js. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hashes a string seed into a 32-bit int for the PRNG. */
function hashSeed(seed) {
  if (typeof seed === 'number') return seed;
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** How many items appear in the daily "Featured today" strip (safe + fixed). */
export const FEATURED_COUNT = 3;

/** Flat featured discount, applied to common/uncommon/rare featured items only. */
export const FEATURED_DISCOUNT = 0.15;

// ── Seasons ──────────────────────────────────────────────────────────────────
export const SEASON_META = {
  winter: { label: 'Winter', accent: 'var(--accent-blue)', icon: '\u2744\uFE0F' },
  spring: { label: 'Spring', accent: 'var(--accent-green)', icon: '\u{1F331}' },
  summer: { label: 'Summer', accent: 'var(--accent-orange)', icon: '\u2600\uFE0F' },
  fall: { label: 'Fall', accent: 'var(--accent-purple)', icon: '\u{1F341}' },
};

/** Northern-hemisphere season for a date (winter | spring | summer | fall). */
export function getSeason(date = new Date()) {
  const m = date.getMonth(); // 0 = Jan
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'fall';
}

// A handful of existing catalog items tagged per season, used only to gently
// bias the daily featured pick toward in-season gear (no new purchase mechanics).
const SEASON_ITEMS = {
  winter: ['beanie', 'scarf', 'sweater', 'puffer-vest', 'turtleneck'],
  spring: ['raincoat', 'tee', 'beret', 'polo', 'skirt'],
  summer: ['sunglasses', 'shorts', 'tank-top', 'star-shades', 'headband'],
  fall: ['flannel', 'hoodie', 'cargo-pants', 'overalls', 'cowboy-hat'],
};

/**
 * The day's featured items — a deterministic, fixed-size pick seeded from the
 * local day key (so it's stable all day and rotates at local midnight). Excludes
 * legendary rarity and any exclusive items, and biases toward in-season gear.
 */
export function featuredToday(date = new Date()) {
  const pool = CATALOG.filter((c) => c.rarity !== 'legendary' && !c.exclusive);
  if (pool.length <= FEATURED_COUNT) return pool.slice();
  const rng = mulberry32(hashSeed(economyDayKey(date)));
  const seasonSet = new Set(SEASON_ITEMS[getSeason(date)] || []);
  // Rank by a seeded random key, nudging in-season items toward the front.
  return pool
    .map((item) => ({ item, r: rng() - (seasonSet.has(item.id) ? 0.35 : 0) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, FEATURED_COUNT)
    .map((x) => x.item);
}

/** True when `item` is in today's featured set. */
export function isFeatured(item, date = new Date()) {
  if (!item) return false;
  return featuredToday(date).some((f) => f.id === item.id);
}

/**
 * The price to charge for `item` today. Featured common/uncommon/rare items get
 * FEATURED_DISCOUNT off (rounded); everything else pays the normal price. This
 * is the single source of truth so the Store UI and buy() always agree.
 */
export function featuredPrice(item, date = new Date()) {
  if (!item || typeof item.price !== 'number') return item?.price ?? 0;
  const discountable = ['common', 'uncommon', 'rare'].includes(item.rarity);
  if (discountable && isFeatured(item, date)) {
    return Math.round(item.price * (1 - FEATURED_DISCOUNT));
  }
  return item.price;
}

// ── Mastery-earned exclusive cosmetics ───────────────────────────────────────
// Earned by demonstrating mastery, NOT purchasable. To avoid new SVG art each
// `aliasOf` an existing item component (wired up in avatar/items/index.js). These
// are flagged `exclusive: true` so cosmetics.js keeps them out of CATALOG and
// totalCatalogCost — the 40,250-coin calibration is untouched.
export const MASTERY_COSMETICS = [
  {
    id: 'course-master',
    name: 'Course Master Cap',
    slot: 'headwear',
    rarity: 'legendary',
    aliasOf: 'graduation-cap',
    exclusive: true,
    achievement: 'course-100',
    unlock: 'Reach 100% course completion',
  },
  {
    id: 'flawless-scholar',
    name: "Scholar's Monocle",
    slot: 'eyewear',
    rarity: 'legendary',
    aliasOf: 'monocle',
    exclusive: true,
    achievement: 'all-clean-runs',
    unlock: 'Finish all 8 lessons with a flawless, no-hint run',
  },
  {
    id: 'heat-legend',
    name: 'Heat Legend Cape',
    slot: 'accessory',
    rarity: 'legendary',
    aliasOf: 'cape',
    exclusive: true,
    achievement: 'heat-legend',
    unlock: 'Max out the heat multiplier in a Heat Check run',
  },
  {
    id: 'devoted',
    name: 'Devoted Varsity Jacket',
    slot: 'top',
    rarity: 'legendary',
    aliasOf: 'varsity-jacket',
    exclusive: true,
    achievement: 'streak-14',
    unlock: 'Keep a 14-day learning streak',
  },
  // ── Phase 6 additions: more, harder mastery skins ──────────────────────────
  // Still earned (never sold) and excluded from CATALOG / totalCatalogCost. Each
  // reuses an existing premium SVG component via a new alias in items/index.js.
  {
    id: 'prodigy',
    name: 'Prodigy Wizard Hat',
    slot: 'headwear',
    rarity: 'epic',
    aliasOf: 'wizard-hat',
    exclusive: true,
    achievement: 'level-20',
    condition: 'Reach level 20',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster Crown',
    slot: 'headwear',
    rarity: 'legendary',
    aliasOf: 'crown',
    exclusive: true,
    achievement: 'level-35',
    condition: 'Reach level 35',
  },
  {
    id: 'iron-will',
    name: 'Iron Will Medal',
    slot: 'accessory',
    rarity: 'legendary',
    aliasOf: 'medal-necklace',
    exclusive: true,
    achievement: 'streak-30',
    condition: 'Maintain a 30-day streak',
  },
  {
    id: 'heat-champion',
    name: 'Heat Champion Shades',
    slot: 'eyewear',
    rarity: 'legendary',
    aliasOf: 'star-shades',
    exclusive: true,
    achievement: 'heat-champion',
    condition: 'Finish #1 on the weekly leaderboard',
  },
  {
    id: 'inferno-run',
    name: 'Inferno Flask Helmet',
    slot: 'headwear',
    rarity: 'epic',
    aliasOf: 'flask-helmet',
    exclusive: true,
    achievement: 'inferno-run',
    condition: 'Score 350+ XP in a single Heat Check run',
  },
  {
    id: 'completionist',
    name: 'Completionist Tuxedo',
    slot: 'top',
    rarity: 'legendary',
    aliasOf: 'tuxedo',
    exclusive: true,
    achievement: 'completionist',
    condition: 'Own every item in the catalog',
  },
];

/** Maps an exclusive cosmetic id → the existing art id it reuses (for the renderer). */
export const EXCLUSIVE_ALIASES = Object.fromEntries(
  MASTERY_COSMETICS.map((c) => [c.id, c.aliasOf]),
);
