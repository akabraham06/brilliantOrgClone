/**
 * Cosmetics catalog. The 50 bespoke items (id, name, slot, rarity) and their SVG
 * art are authored by a sibling worker under src/components/avatar/items/**. This
 * module MERGES that manifest with the economy balancing that *this* worker owns:
 * each item's coin `price` and `unlockLevel` are derived from its rarity here.
 *
 * ── PRICE + UNLOCK TIERS (Phase 6 re-balancing — see economy.js for the full math) ──
 * Prices were raised ~2.5x (Phase 6) so clearing the collection is a meaningful,
 * multi-session grind rather than a quick course-mastery payoff. The income side
 * is unchanged — only the spend side got more expensive.
 *   rarity      price   unlockLevel band   manifest count   subtotal
 *   common       150          1–2               25            3,750
 *   rare         750          6–9               16           12,000
 *   epic        1500         10–14               5            7,500
 *   legendary   3000         15–20               4           12,000
 *   ─────────────────────────────────────────────────────────────────
 *   + pinned 3D skin (aurora-blob, 5,000 @ Lv20)             5,000
 *   full purchasable collection                51  items   40,250 coins
 *   (the manifest ships no 'uncommon' tier; the band is kept for completeness.
 *    totalCatalogCost() sums every CATALOG price incl. the pinned 3D skin = 40,250,
 *    up from 19,100 before this re-balancing.)
 *
 * Two gates stack per item: you must be at least `unlockLevel` AND afford the
 * `price`. Course mastery alone (~level 10, ~1k coins) now buys only a handful of
 * commons; the rare/epic/legendary tiers force sustained Heat Check farming
 * (daily-capped), so the store can't be cleared quickly. `price` is a pure
 * function of rarity to keep tiers legible; `unlockLevel` is spread across each
 * rarity's band by within-rarity index.
 */
import { COSMETIC_ITEMS } from '../components/avatar/items/manifest.js';
import { MASTERY_COSMETICS } from './storeRotation.js';

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_META = {
  common: { label: 'Common', color: '#9aa6b2' },
  uncommon: { label: 'Uncommon', color: '#3fb27f' },
  rare: { label: 'Rare', color: '#4f8ff7' },
  epic: { label: 'Epic', color: '#a06bf0' },
  legendary: { label: 'Legendary', color: '#f0a23b' },
};

const PRICE = { common: 150, uncommon: 350, rare: 750, epic: 1500, legendary: 3000 };
const UNLOCK_BAND = {
  common: [1, 2],
  uncommon: [3, 5],
  rare: [6, 9],
  epic: [10, 14],
  legendary: [15, 20],
};

function rarityOf(item) {
  return RARITIES.includes(item.rarity) ? item.rarity : 'common';
}

/**
 * Spreads items across their rarity's unlock band deterministically by their
 * index *within that rarity*, so e.g. the rares unlock progressively at L6→L9
 * rather than all at once.
 */
function buildCatalog(items) {
  const counts = {};
  const seen = {};
  for (const it of items) {
    const r = rarityOf(it);
    counts[r] = (counts[r] || 0) + 1;
  }
  return items.map((it) => {
    const rarity = rarityOf(it);
    const [lo, hi] = UNLOCK_BAND[rarity];
    const i = seen[rarity] || 0;
    seen[rarity] = i + 1;
    const n = counts[rarity];
    const spread = n > 1 ? lo + Math.round((i / (n - 1)) * (hi - lo)) : lo;
    // Items may pin their own price/unlockLevel (e.g. the special 3D skin);
    // otherwise both are derived from rarity.
    return {
      ...it,
      rarity,
      price: typeof it.price === 'number' ? it.price : PRICE[rarity],
      unlockLevel:
        typeof it.unlockLevel === 'number'
          ? it.unlockLevel
          : Math.min(hi, Math.max(lo, spread)),
    };
  });
}

export const CATALOG = buildCatalog(COSMETIC_ITEMS || []);

// Slot model derived from whatever the manifest actually ships, in a stable order.
const SLOT_ORDER = ['headwear', 'eyewear', 'top', 'tops', 'bottom', 'bottoms', 'accessory', 'accessories', 'skin'];
export const SLOTS = [...new Set(CATALOG.map((c) => c.slot))].sort(
  (a, b) => (SLOT_ORDER.indexOf(a) + 1 || 99) - (SLOT_ORDER.indexOf(b) + 1 || 99),
);

const RAW_SLOT_LABELS = {
  headwear: 'Headwear',
  eyewear: 'Eyewear',
  top: 'Tops',
  tops: 'Tops',
  bottom: 'Bottoms',
  bottoms: 'Bottoms',
  accessory: 'Accessories',
  accessories: 'Accessories',
  skin: 'Skins',
};

export function slotLabel(slot) {
  return RAW_SLOT_LABELS[slot] || slot.charAt(0).toUpperCase() + slot.slice(1);
}

const BY_ID = new Map(CATALOG.map((c) => [c.id, c]));

// Mastery-earned exclusives (data/storeRotation.js) are resolvable so the avatar
// can render them and the Store can name them, but they are EXCLUDED from CATALOG
// and totalCatalogCost — they're earned, never sold, so the 40,250-coin
// calibration stays intact. Built lazily to sidestep the cosmetics↔storeRotation
// import cycle (storeRotation reads CATALOG; this only reads it at call time).
let EXCLUSIVE_BY_ID = null;
function exclusiveById() {
  if (!EXCLUSIVE_BY_ID) {
    EXCLUSIVE_BY_ID = new Map((MASTERY_COSMETICS || []).map((c) => [c.id, c]));
  }
  return EXCLUSIVE_BY_ID;
}

export function getCosmeticById(id) {
  return BY_ID.get(id) || exclusiveById().get(id) || null;
}

export function cosmeticsBySlot(slot) {
  return CATALOG.filter((c) => c.slot === slot);
}

/** Total coin cost to own every item — handy for the Store's "collection" stat. */
export function totalCatalogCost() {
  return CATALOG.reduce((sum, c) => sum + c.price, 0);
}
