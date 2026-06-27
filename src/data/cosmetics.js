/**
 * Cosmetics catalog. The 50 bespoke items (id, name, slot, rarity) and their SVG
 * art are authored by a sibling worker under src/components/avatar/items/**. This
 * module MERGES that manifest with the economy balancing that *this* worker owns:
 * each item's coin `price` and `unlockLevel` are derived from its rarity here.
 *
 * ── PRICE + UNLOCK TIERS (Phase 5 balancing — see economy.js for the full math) ──
 *   rarity      price   unlockLevel band   manifest count   subtotal
 *   common        60          1–2               25            1,500
 *   rare         300          6–9               16            4,800
 *   epic         600         10–14               5            3,000
 *   legendary   1200         15–20               4            4,800
 *   ─────────────────────────────────────────────────────────────────
 *   full collection                            50  items   14,100 coins
 *   (the manifest ships no 'uncommon' tier; the band is kept for completeness)
 *
 * Two gates stack per item: you must be at least `unlockLevel` AND afford the
 * `price`. Course mastery alone (~level 10, ~1.35k coins) buys most commons; the
 * rare/epic/legendary tiers force Heat Check farming (daily-capped), so the store
 * can't be cleared quickly. `price` is a pure function of rarity to keep tiers
 * legible; `unlockLevel` is spread across each rarity's band by within-rarity index.
 */
import { COSMETIC_ITEMS } from '../components/avatar/items/manifest.js';

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_META = {
  common: { label: 'Common', color: '#9aa6b2' },
  uncommon: { label: 'Uncommon', color: '#3fb27f' },
  rare: { label: 'Rare', color: '#4f8ff7' },
  epic: { label: 'Epic', color: '#a06bf0' },
  legendary: { label: 'Legendary', color: '#f0a23b' },
};

const PRICE = { common: 60, uncommon: 150, rare: 300, epic: 600, legendary: 1200 };
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

export function getCosmeticById(id) {
  return BY_ID.get(id) || null;
}

export function cosmeticsBySlot(slot) {
  return CATALOG.filter((c) => c.slot === slot);
}

/** Total coin cost to own every item — handy for the Store's "collection" stat. */
export function totalCatalogCost() {
  return CATALOG.reduce((sum, c) => sum + c.price, 0);
}
