/**
 * Curated allowlist of existing interactive components the AI tutor is permitted
 * to embed inline in the chat to illustrate a concept.
 *
 * We deliberately REUSE the app's hand-built, scientifically-accurate 3D/SVG
 * interactives instead of generating images — generative diagrams risk subtle
 * chemistry errors (wrong bond counts, miscolored elements). Each key here has
 * been verified to render standalone with no required `interactionConfig` (they
 * call `onReady` on mount and supply their own defaults), so passing a minimal
 * slide-like prop is safe.
 *
 * The model is told these descriptions and may choose one key; anything outside
 * this map is ignored by the renderer.
 */
export const ILLUSTRATION_ALLOWLIST = {
  AtomDiagram:
    'Interactive build-an-atom: add protons/neutrons/electrons and watch the element, isotope, charge and stability update.',
  MiniPeriodicTable:
    'Mini periodic table of the first 20 elements; tap elements to compare groups and periods.',
  ElectronShellBuilder:
    'Add electrons one at a time to see how electron shells fill in order and what the valence count is.',
  StateParticlesAnimator:
    'Solid/liquid/gas particle simulation showing how the same matter is locked, sliding, or free at different energy.',
  MolecularVsIonicViewer:
    'Side-by-side molecular (CO2) vs ionic (NaCl) solids showing why ionic compounds melt at much higher temperatures.',
  LatticeViewer3D:
    'Rotatable 3D sodium chloride crystal lattice showing the repeating ionic pattern (not discrete molecules).',
  VseprViewer:
    'Rotatable 3D VSEPR molecular-shape viewer (linear, trigonal, tetrahedral, pyramidal, bent) with lone pairs.',
  PHPowersOfTen:
    'pH dial showing that each whole pH step is a tenfold change in acidity relative to neutral water.',
};

export const ILLUSTRATION_KEYS = Object.keys(ILLUSTRATION_ALLOWLIST);

export function isAllowedIllustration(key) {
  return typeof key === 'string' && Object.prototype.hasOwnProperty.call(ILLUSTRATION_ALLOWLIST, key);
}

/** Compact catalog string injected into the tutor system instruction. */
export function illustrationCatalog() {
  return ILLUSTRATION_KEYS.map((k) => `- ${k}: ${ILLUSTRATION_ALLOWLIST[k]}`).join('\n');
}
