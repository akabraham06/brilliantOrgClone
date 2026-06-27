/**
 * Shared coordinate system for the bespoke SVG avatar (viewBox "0 0 120 140").
 *
 * These anchors are the CONTRACT between the base "blob-human" art (authored in
 * AvatarBase.jsx) and the 50 cosmetic item layers (authored by a sibling worker
 * under items/**). Every layer is drawn against the same grid so equipped pieces
 * line up regardless of combination.
 *
 *   head     center ≈ (60, 40), radius ≈ 24
 *   eyes     y ≈ 38, left x ≈ 51, right x ≈ 69
 *   torso    y 62..108 across x 34..86
 *   legs     y 108..134
 *
 *   slot anchor regions the items are drawn to:
 *     headwear   x 28..92  y 2..42
 *     eyewear    x 42..78  y 30..46
 *     top        x 32..88  y 62..108
 *     bottom     x 36..84  y 104..136
 *     accessory  free (must not fully occlude the face)
 */
export const VIEWBOX = '0 0 120 140';

/*
 * Per-item headwear placement.
 *
 * The 50 cosmetic layers were authored so headwear rests its brim/band around
 * y≈38–43, assuming a head whose crown sat near the brow. The redesigned blob is
 * tall and round (crown ≈ y15, eyes y38, widest ≈ y44), so a SINGLE global
 * transform can't seat every shape: a downscale that lifts brims off the eyes
 * also leaves narrow-crowned hats (top hat, crown) perched high with the round
 * head poking out around them, while dome hats (beanie) hug fine.
 *
 * So each headwear item gets its own placement { scale, dy } applied about the
 * head center (60, 40). `headwearTransform(id)` resolves the override (or the
 * default) into an SVG matrix. Tuned so each hat's contact line sits on the
 * crown/forehead with the brim overhanging the head, while tall tips
 * (party-hat pom, wizard tip, flask cork) stay inside the viewBox top (y≥0).
 *
 * matrix(s,0,0,s, tx, ty) with tx = cx*(1-s), ty = cy*(1-s) + dy == scale `s`
 * about pivot (cx, cy) then translate down by `dy`.
 */
const HEADWEAR_PIVOT = { x: 60, y: 40 };

// Default for hats that already seat well (dome/soft shapes). dy lifts the group
// so brims clear the eyes (y38); scale keeps brims wide enough to overhang.
const HEADWEAR_DEFAULT = { scale: 0.92, dy: -8 };

// Per-item placement. The items were authored with their brim/band around
// y≈37–45 — i.e. at or BELOW the blob's eye line (y38) — so untransformed they
// sink over the face. Each lift below seats the hat's contact line (band/brim)
// up onto the upper dome (≈ y28–35, between the crown at y15 and the eyes at
// y38) so the hat rests ON TOP of the head with the brim overhanging, while the
// tallest tips (party pom, wizard tip, flask valve, beanie pom) stay inside the
// bust crop top (y ≥ -2). Negative dy lifts; scale grows/shrinks about (60,40).
const HEADWEAR_PLACEMENT = {
  // Tall, narrow-crowned brim hats: lift the brim off the face onto the crown;
  // scaled so the brim overhangs the round head without the tip clipping.
  'top-hat': { scale: 0.9, dy: -9 },
  'graduation-cap': { scale: 0.92, dy: -7 },
  'wizard-hat': { scale: 0.9, dy: -9 },
  'cowboy-hat': { scale: 0.94, dy: -8 },
  'baseball-cap': { scale: 0.95, dy: -8 },
  // Crown: a band + points — seat the band on the upper dome so points rise above.
  'crown': { scale: 0.95, dy: -7 },
  // Domes / soft caps hug the crown; lift the fold/band above the eyes.
  'beanie': { scale: 0.92, dy: -8 },
  'beret': { scale: 0.94, dy: -9 },
  // Cone hats: extra downscale keeps the tall tip/pom inside the bust crop.
  'party-hat': { scale: 0.86, dy: -8 },
  'flask-helmet': { scale: 0.84, dy: -8 },
  // Headband sits low on the forehead by design (authored ~y24–38); a small lift
  // keeps the band just above the eyes instead of across them.
  'headband': { scale: 0.96, dy: -3 },
  // Halo floats ABOVE the head on purpose — keep it high and unscaled.
  'halo': { scale: 1.0, dy: -4 },
};

/** SVG matrix that seats headwear item `id` on the blob head. */
export function headwearTransform(id) {
  const { scale, dy } = HEADWEAR_PLACEMENT[id] || HEADWEAR_DEFAULT;
  const tx = HEADWEAR_PIVOT.x * (1 - scale);
  const ty = HEADWEAR_PIVOT.y * (1 - scale) + dy;
  return `matrix(${scale},0,0,${scale},${tx},${ty})`;
}

export const AVATAR = {
  head: { cx: 60, cy: 40, r: 24 },
  eyes: { y: 38, left: 51, right: 69, r: 3.4 },
  torso: { x: 34, y: 62, w: 52, h: 46, r: 14 },
  legs: { y: 108, h: 26, leftX: 47, rightX: 63, w: 10 },
};

// Default blob palette. The base avatar is a single soft mint "creature" so
// equipped cosmetics (which carry their own colors) always pop on top. Kept calm
// and low-contrast; the face is the only dark detail.
export const BODY_PALETTE = {
  blob: '#8ed6c6',
  blobShade: '#62bdab',
  blobDeep: '#46a796',
  blobHi: '#bdebe0',
  outline: '#2a3340',
  blush: '#ef9d86',
};
