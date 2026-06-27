/**
 * Registry of fully-3D avatar "skins". A skin id present here (equipped in the
 * `skin` slot) makes the Avatar render a real-time 3D blob-human instead of the
 * layered SVG. Kept tiny + dependency-free so both the SVG static fallback and
 * the lazy-loaded 3D renderer can share the palette without pulling in three.js.
 */
export const SKIN_3D = {
  'aurora-blob': {
    name: 'Aurora Blob',
    // Iridescent aurora palette for the material + lighting.
    colorA: '#7df0c8', // mint
    colorB: '#8aa6ff', // periwinkle
    colorC: '#e98bff', // magenta
    glow: '#bff7ff',
  },
};

/** True if an equipped id refers to a 3D skin. */
export function is3DSkin(id) {
  return Boolean(id && SKIN_3D[id]);
}
