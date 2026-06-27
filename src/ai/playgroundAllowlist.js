/**
 * Curated allowlist of MANIPULABLE interactive components the AI Lab is allowed
 * to load onto its stage for free, open-ended play.
 *
 * This is a superset of the tutor's illustration allowlist: the tutor only needs
 * visuals that read well inline, while the Lab wants hands-on sandboxes the
 * student can poke at. Every key here has been verified to render standalone
 * with NO required slide-specific `interactionConfig` — each supplies its own
 * safe defaults and calls `onReady` on mount — so passing a minimal slide-like
 * prop (`{}`) never crashes. Keys that require slide-authored config to function
 * are deliberately excluded.
 *
 * The model is told these descriptions and may load exactly one key via the
 * `[[LOAD: Key]]` directive; anything outside this map is ignored by the stage.
 */
export const PLAYGROUND_ALLOWLIST = {
  // Build-an-atom: own defaults for protons/neutrons/electrons; onReady on mount.
  AtomDiagram:
    'Build an atom by adding protons, neutrons and electrons; watch the element, isotope, charge and stability update live.',
  // Fills shells from internal element list; no config needed; onReady on mount.
  ElectronShellBuilder:
    'Add electrons one at a time to see how electron shells fill in order and what the valence count becomes.',
  // First-20 periodic table built in; no config; onReady on mount.
  MiniPeriodicTable:
    'Explore a mini periodic table of the first 20 elements; tap elements to compare groups and periods.',
  // Has DEFAULT_CONFIG fallback when no interactionConfig; onReady on mount.
  BuildingBlocksExercise:
    'Assemble several molecules (water, CO2, methane) from a tiny palette of atoms — a few atom types build endless molecules.',
  // Internal element choices and state; no config; onReady on mount.
  LewisDotBuilder:
    'Place valence electron dots around an element to draw its Lewis dot symbol and match its valence count.',
  // Internal cation/anion lists; no config; onReady on mount (when revisited).
  IonicFormulaBuilder:
    'Pick a metal and a nonmetal ion and adjust the counts until the charges cancel, then read off the neutral formula.',
  // Defaults to "H2 + O2 -> H2O" when no equation supplied; ungraded → onReady on mount.
  EquationBalancer:
    'Balance a chemical equation with +/- coefficient steppers and watch a beam level out when matter is conserved.',
  // Defaults to 36 g of water; no config required; onReady on mount.
  MoleConversionStepper:
    'Walk the grams to moles to particles conversion and answer guided steps using molar mass and Avogadro\u2019s number.',
  // Internal mass/volume state; no config; onReady on mount.
  DensityBuilder:
    'Set a mass and a volume and watch density = mass / volume update, with a float-or-sink verdict against water.',
  // Internal solute/water state; no config; onReady on mount.
  SolutionConcentrationMixer:
    'Add solute or water to a beaker and see how the solute-to-water ratio shifts from dilute to concentrated.',
  // Internal temperature state; no config; onReady on mount.
  TemperatureSlider:
    'Drag a temperature slider to drive matter through solid, liquid and gas as particle motion speeds up.',
  // Solves PV=nRT from internal slider state; config only adds optional stages; onReady on mount.
  IdealGasLawExplainer:
    'Adjust amount, temperature and volume to solve pressure live from PV = nRT in a responsive piston box.',
  // Self-contained 3D NaCl lattice; no config; onReady on mount.
  LatticeViewer3D:
    'Rotate a 3D sodium chloride crystal lattice to see the repeating ionic pattern rather than discrete molecules.',
  // Self-contained 3D shape viewer; no config; onReady on mount.
  VseprViewer:
    'Rotate 3D VSEPR molecular shapes (linear, trigonal, tetrahedral, pyramidal, bent) and see how lone pairs bend them.',
  // Self-contained CO2-vs-NaCl comparison; no config; onReady on mount.
  MolecularVsIonicViewer:
    'Compare a molecular solid (CO2) with an ionic solid (NaCl) to see why ionic compounds melt at much higher temperatures.',
  // Self-contained particle sim; no config; onReady on mount.
  StateParticlesAnimator:
    'Switch between solid, liquid and gas to watch the same particles lock, slide, or fly free at different energies.',
  // Internal molecule list (H2/H2O/CO2); config only picks a start molecule; onReady on mount.
  CovalentShareCanvas:
    'Drag atoms together to form covalent bonds, toggle Lewis dots, and rotate the finished molecule in 3D.',
  // Self-contained pH dial; no config; onReady on mount.
  PHPowersOfTen:
    'Turn a pH dial to see that each whole pH step is a tenfold change in acidity relative to neutral water.',
};

export const PLAYGROUND_KEYS = Object.keys(PLAYGROUND_ALLOWLIST);

export function isAllowedPlaygroundKey(key) {
  return (
    typeof key === 'string' &&
    Object.prototype.hasOwnProperty.call(PLAYGROUND_ALLOWLIST, key)
  );
}

/** Compact catalog string injected into the lab guide's system instruction. */
export function playgroundCatalog() {
  return PLAYGROUND_KEYS.map((k) => `- ${k}: ${PLAYGROUND_ALLOWLIST[k]}`).join('\n');
}
