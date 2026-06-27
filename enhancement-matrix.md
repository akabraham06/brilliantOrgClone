# Interactive Component Enhancement Matrix

**Purpose.** This matrix is the gate for three downstream implementation subagents. For every
*active* interactive component (the `INTERACTIONS` map in
`src/components/lesson/interactionRegistry.js`) plus the four shared engines in
`src/components/interactions/lib/`, it decides whether the component should be enhanced with one
of three curated libraries, or left alone.

**Persona / lens.** Mobile-first 14-16 year-old beginner, no chemistry background, low confidence
with symbols, easily overwhelmed; dark + light themes; must respect keyboard a11y, non-color cues,
contrast >=4.5:1, and `prefers-reduced-motion`.

**Methodology.** Each verdict is grounded in (a) the component's current source (render +
interactions), (b) the slide context / learning goal in `src/data/chemistryCourse.js`, and (c) the
prior critique backlog (`.impeccable/critique/course-components-backlog.md`). I read every
component I assessed and every chart/3D/animation engine it depends on.

**Gating rule (skeptical by default).** A library is recommended **only** when it genuinely
improves the *learning* experience for the persona - never to add motion, depth, or flash:

- **3D (react-three-fiber + drei)** only where depth/rotation aids a truly *spatial/molecular*
  concept and a flat 2D diagram would be **less** clear. A 2D diagram that is pedagogically clearer
  stays 2D (SKIP).
- **visx** only where there is a *real plot/curve/axis with data*, and interactivity
  (hover/tooltip/animated trace/zoom, larger hit targets) would add comprehension over the current
  hand-rolled SVG chart.
- **framer-motion** only where *layout / enter-exit / drag* motion makes a **state change** clearer
  - and only as an additive layer that preserves the tap/keyboard parity, non-destructive retry,
  and reduced-motion handling the critique already fixed.

Dead/unregistered files (`ReactionTypeCards`, `ReactionTypeClassifier`) are **not** in the
`INTERACTIONS` map and are excluded. `MatchBoard`, `ClassifyBoard`, and `DragChip` are not in the
map either, but they are the shared engines behind several registered keys, so the framer-motion
work lands there; they are listed in the shared-engines section.

---

## Subagent A - 3D (react-three-fiber + drei)

| Component | Lesson / slide context | Learning goal | Verdict | Library | Concrete enhancement | Pedagogical payoff |
|---|---|---|---|---|---|---|
| **VseprViewer** | L4 "Molecules are 3D: VSEPR"; slide copy literally says "Drag the model to rotate it in 3D." Currently CSS-3D sticks/atoms in `Scene3D`. | Predict molecular shapes (linear/trigonal/tetrahedral/pyramidal/bent) and see bond angles. | **ENHANCE** | 3D | Replace the CSS-transform geometry with a real r3f ball-and-stick model (drei `OrbitControls`, lit spheres, lone-pair "cloud" lobes) that rotates with true depth and correct angles. | Molecular geometry is inherently spatial; real depth + free rotation makes 109.5 vs 104.5 and "lone pairs push bonds together" legible in a way the flat fake-3D cannot. The flagship 3D case. |
| **IonTransferCanvas** (crystal view only) | L3 "Cations vs. anions": after the 2D electron transfer, a "View NaCl crystal" button reveals a CSS-3D 3x3x3 lattice. | See that opposite ions stack into a repeating 3D lattice. | **ENHANCE** | 3D | Upgrade only the `NaClLattice` sub-view to an r3f instanced lattice (alternating Na+/Cl- spheres, depth, drag-orbit). **Leave the 2D drag-the-electron interaction untouched** - it already uses `useSpring` well. | "A vast repeating 3D grid" is a spatial claim a flat cube grid undersells; a true rotatable lattice makes the 3D packing of salt concrete. |
| **CovalentShareCanvas** (geometry view only) | L4 "Covalent bonding": after building H2/H2O/CO2 in 2D, a "Rotate molecule" screen shows CSS-3D shape. | See the real 3D shape of the molecule just built. | **ENHANCE** | 3D | Convert only the `GeometryView` screen to r3f (bent H2O, linear CO2). **Do not touch the 2D Lewis/lines builder** - the critique flagged the builder as overloaded + keyboard-blocked, so adding nothing there. | The bent/linear shapes are spatial; real 3D reinforces VSEPR. Scoped to the separate geo screen so it never adds load to the already-busy builder. |

---

## Subagent B - visx (modular SVG charts)

| Component | Lesson / slide context | Learning goal | Verdict | Library | Concrete enhancement | Pedagogical payoff |
|---|---|---|---|---|---|---|
| **PeriodicTrendsGraph** | L1 extra "Periodic trends, on a graph": real x-y plot of radius/mass/electronegativity vs atomic number using `lib/chart.jsx`. | See periodic properties rise/reset across periods. | **ENHANCE** | visx | Rebuild on visx `scaleLinear`/`AxisLeft`/`LinePath`/`Glyph`; add hover/tap tooltips, larger touch targets (fixes 9px points), period-band shading, and an animated transition when switching property. | Turns a static line into an explorable trend; bigger hit targets + tooltips directly fix the a11y/mobile defects the critique called out, and band shading makes "resets each period" visible. |
| **HeatingCurve** | L7 "The heating curve": temperature vs heat with melting/boiling plateaus; drag along the curve. | Connect flat plateaus to phase changes (energy breaks bonds). | **ENHANCE** | visx | Use visx scales/axis + `LinePath`/`Area` with a gradient, an animated progress trace, and a tooltip reading "phase + temperature" at the dragged point; mark the two plateaus. | The plateaus are the whole lesson; a tooltip that names the phase at the pointer and a clean animated trace make "added heat isn't raising temperature here" unmistakable. |
| **EnergyDiagram** | L5 extra "Reactions and energy": energy vs reaction progress with an activation-energy hump; exo/endo toggle + Ea slider. | Compare reactant/product energy and the activation barrier. | **ENHANCE** | visx | visx curve + shaded area under the path, an animated Ea bracket/annotation, and a smooth morph when toggling exo/endo or dragging Ea. | A curve with a labeled barrier reads as a real "energy landscape"; animated transitions between exo/endo make the height difference (energy released vs absorbed) concrete. |
| **TitrationSim** | L7 "Titration: finding the balance point": pH vs base-added sigmoid that leaps at the equivalence point; indicator flips pink. | See pH barely move, then jump at equivalence. | **ENHANCE** | visx | visx scales/axis + `LinePath`, animate the curve *tracing out* as base is added, tooltip at the equivalence point, emphasize the jump. **Pair with the critique's scaffolding note** (stage "barely moves" then "the jump"; gloss equivalence point) - do not just prettify. | The "leap" is the learning moment; an animated trace + equivalence callout makes the sharp transition vivid, provided the scaffolding caveat is honored so it isn't persona-overload. |

---

## Subagent C - framer-motion (layout / gesture / reveal)

> The five board-backed keys all share three engines (`ClassifyBoard`, `MatchBoard`, `PHScale`)
> plus the `DragChip` primitive. The enhancement is **additive layout/AnimatePresence on chip
> placement and grading reveal** - it must NOT rewrite `DragChip`'s pointer logic, because that
> primitive's tap/keyboard parity, `aria-pressed`, stale-suppress fix, and non-destructive retry
> were hard-won in the critique pass. Wrap with `MotionConfig reducedMotion="user"`.

| Component | Lesson / slide context | Learning goal | Verdict | Library | Concrete enhancement | Pedagogical payoff |
|---|---|---|---|---|---|---|
| **MatterSortBoard** (via `ClassifyBoard`) | L1 "Matter vs. non-matter" drag-sort. | Sort items into bins. | **ENHANCE** | framer-motion | Add `layout`/`AnimatePresence` so a chip animates from tray into its bin and the tray reflows smoothly; animate the per-row correct/wrong reveal on grading. | On mobile, a chip visibly settling into its bin confirms the placement and reduces "did my drop register?" confusion; smooth grading reveal draws the eye to mistakes. |
| **BondTypeClassifier** (via `ClassifyBoard`) | L4 "Check: classify the bond". | Classify ionic/covalent/metallic. | **ENHANCE** | framer-motion | Inherits the shared `ClassifyBoard` layout/reveal animation. | Same placement-clarity + grading-reveal payoff on a graded gate. |
| **AcidBaseClassifier** (via `ClassifyBoard`) | L7 "Properties of acids and bases" drag-sort. | Sort acids vs bases by sensory cue. | **ENHANCE** | framer-motion | Inherits the shared `ClassifyBoard` animation. | Same payoff; reinforces the two-category sort. |
| **FormulaNameMatcher** (via `MatchBoard`) | L4 matching formulas to names (and polyatomic). | Match formula <-> name. | **ENHANCE** | framer-motion | Animate the formed match (left chip + chosen name snapping together / a connector drawing in) and the correct/wrong reveal; reflow remaining options. | A drawn/settling connection makes "these two belong together" tactile and confirms the pairing the moment it's made. |
| **PHScalePlacement** (via `PHScale`) | L7 "Acids, bases, and the pH scale" drag household items to acidic/neutral/basic. | Place items on the pH scale. | **ENHANCE** | framer-motion | Add layout animation as items drop into zones and on the non-destructive grading reveal; keep the existing `useSpring` beaker/indicator. | Confirms each placement on a mobile drag board and animates the wrong-item return-to-tray that the critique's non-destructive retry already does logically. |
| **PredictRevealCard** | Used ~10x across all lessons for "predict, then reveal". | Commit a prediction, then read the explanation. | **ENHANCE** | framer-motion | `AnimatePresence` to slide/fade the reveal block in at the moment it unlocks; gentle dim/cross-out on a ruled-out wrong pick (reduced-motion-safe). | The reveal is the pedagogical beat; a deliberate entrance focuses attention on the explanation exactly when the learner is primed - high leverage because it recurs everywhere. |

---

## Shared engines (`src/components/interactions/lib/` + drag/board layer)

| Engine | Role | Verdict | Library | Notes |
|---|---|---|---|---|
| **Scene3D** (`lib/Scene3D.jsx`) | CSS-transform "fake 3D" viewport used by VseprViewer, CovalentShareCanvas geo, IonTransferCanvas lattice. | **ENHANCE** | 3D | Introduce a shared r3f `<Viewport3D>` (canvas + drei `OrbitControls`, reduced-motion-aware auto-rotate) that the three 3D components mount into. Owned by Subagent A. |
| **chart.jsx** (`lib/chart.jsx`) | Hand-rolled `makeScale`/`niceTicks`/`ChartFrame`/`linePath` behind all four graphs. | **ENHANCE** | visx | Re-implement the `ChartFrame` contract on visx (`scaleLinear`, `AxisLeft`/`AxisBottom`, `LinePath`, `GridRows`); also fixes the `--color-text-subtle` <4.5:1 tick/label contrast the critique flagged. Owned by Subagent B. |
| **OrbitalAtom** (`lib/OrbitalAtom.jsx`) | Pseudo-3D atom (orbiting electrons) used by AtomDiagram, ElectronShellBuilder, IonFormationScene. | **SKIP** | none | True 3D orbiting electrons are scientifically misleading and *increase* cognitive load for beginners; the critique flags AtomDiagram for motion+overload and OrbitalAtom's rAF for bypassing reduced motion. Real 3D would worsen both. Keep 2D/pseudo. |
| **motion.js** (`lib/motion.js`) | `usePrefersReducedMotion`/`useRaf`/`useSpring`. | **SKIP** | none | Not a UI component. Keep as-is; the framer-motion work should reuse `usePrefersReducedMotion` and `MotionConfig reducedMotion="user"` rather than replace it. |

---

## SKIP (with reason)

| Component | Lesson / slide context | Why SKIP |
|---|---|---|
| AtomDiagram | L1/L3 build-an-atom (parts, isotopes, mass number) | Pseudo-3D `OrbitalAtom`; true 3D would mislead (electron "orbits") and add load. Flagged for motion+overload. 2D is clearer. |
| MiniPeriodicTable | L1 the periodic table | A grid/table, not a data plot or spatial object. Needs a11y/cell-size fixes (critique), not a library. |
| ElectronShellBuilder | L3 shells / valence | Shell-fill is clearest as the existing 2D ring + shell-pill map; 3D adds nothing and revives reduced-motion issues. |
| ParticleModelViewer | L1/L4 element vs compound vs mixture particles | Static labeled particle diagram; comparison is the point, not motion or depth. Adequate. |
| LewisDotBuilder | L4 Lewis dots | The accessible 2D template (role/tabIndex/keydown). Tap-to-add dots needs no library. |
| EquationBalancer | L5 balancing with coefficients | Atom *tallies*, not a chart; not spatial. Critique wants progressive-disclosure of counts, not animation/3D. |
| MoleConversionStepper | L6 grams<->moles guided steps | Text/stepper worked-example; no plot, no spatial concept. |
| StateParticlesAnimator | L7 solid/liquid/gas | Already animates well (critique best ~7.5) with CSS amplitude + reduced-motion handling; framer would be redundant. |
| SolutionConcentrationMixer | L7 concentration | Already does smooth opacity/scale fade-in of particles; adding a library fights the "no jumping" design and adds nothing. |
| ClickableScene | L1 "What is chemistry?" tap objects | Simple tap-to-confirm reveal; no state change a library would clarify. |
| ZoomScaleViewer | L1 zoom to an atom | Already a bespoke CSS crossfade/magnify; works and is reduced-motion bounded. Not a chart/3D. |
| BondStabilityScene | L4 why atoms bond | Simple incomplete-vs-complete shell compare; adequate toggle. |
| MetallicBondScene | L4 electron sea | 2D "sea + ions" is the right abstraction; 3D would obscure the flow/slide idea; rAF already gated. |
| FormulaBreakdown | L4 what formulas mean | Typographic, color-coded formula. Pure text/recap. |
| IonicFormulaBuilder | L4 neutral ionic formulas | Charge-balancing builder; no plot/3D; motion wouldn't clarify the arithmetic. |
| PolyatomicFlashcards | L4 polyatomic ions | Already a working CSS 3D flip + dot nav; swipe/motion would be polish, not learning, for a memorization tool. |
| ReactionLayout | L5 reactants/products | Click-to-highlight labels; static layout is the lesson. |
| ConservationAnimator | L5 conservation of mass | Atoms already translate via `useSpring` (reactants->products); motion need is met. |
| CountingUnitScene | L6 why a counting unit | Analogy (eggs by the dozen); no data plot/3D; needs a11y (eggs), not a library. |
| MoleConceptScene | L6 what is a mole | Growing clusters + `popIn`; no plot/3D; adequate. |
| MolarMassLookup | L6 molar mass | Sum-of-masses readout; critique wants easy->hard ordering, not a library. |
| MoleRatioScene | L6 mole ratios | Token recipe; critique calls it noisy (~20 tokens) - adding motion worsens it. |
| DensityCompare | L2/L7 density | Two tap-to-pick particle boxes with instant feedback; a comparison, not a data chart. |
| WaterRoleScene | L7 water as solvent | Already animates the hydration shell via `useSpring` (the critique's teach/show gap is fixed). |
| CompoundNameBuilder | L4 build a name | Word-block assembly; text task. |
| TemperatureSlider | L7 phase changes | Particles already glide between arrangements with reduced-motion-safe CSS; redundant. |
| ReactionTypeDiagram | L5 reaction patterns | Already has CSS morph + multi-type selector (critique dedup done); abstract A/B/C/D tokens, not a curve or true 3D. |
| ChangeExplainer | L1 physical vs chemical | Toggle of molecule states; adequate, no library payoff. |
| ExplainerGraphic | ~27 analogy slides across lessons | Critique's "one banned pattern present" (crude SVG) + ~27 perpetual loops; the fix is *less* motion/replace crude art, never adding a library. |
| PureVsMixtureViewer | L1 pure vs mixture | Tap-beaker toggle; adequate. |
| BuildingBlocksExercise | L1 LEGO building blocks | Tap-to-match brick exercise; no plot/3D; one of the better-rated already. |
| IonFormationScene | L3 why atoms form ions | Uses pseudo-3D `OrbitalAtom`; 2D charge meter is clearer; 3D would worsen load. |
| IsotopeAnalogy | L3 backpacker analogy | Critique flags the crude backpacker SVG; fix is to abstract it, not add a library. |
| IonChargePredictor | L3 calculating ion charge | Three-step text shortcut; needs the contrast fix (critique), not a library. |
| PolarBondViewer | L3 unequal sharing | Single 2D spectrum slider with `useSpring` electron drift; already smooth; 3D/visx irrelevant. |
| StabilityCardsScene | L4 octet = full hand of cards | Analogy toggle; low motion-learning value. Its inline-transition reduced-motion gap is a critique fix, not a new enhancement. |
| IonicBondScene | L4 ionic bonding builder | 2D charge-crossing builder with arrows; the spatial lattice payoff is already carried by IonTransferCanvas's 3D crystal - don't duplicate. |
| GiveVsShareScene | L4 give vs share | Two-state toggle with `useSpring` electron pair; adequate; inline-transition reduced-motion gap is a critique fix. |
| CoefficientSubscriptID | L4 subscripts vs coefficients | Tap-to-identify; sub-44px target is a critique fix, not a library. |
| ServingsScene | L4 servings vs ingredients | Recipe analogy; adequate, no payoff. |
| RearrangeBlocksScene | L5 rearranging LEGO bricks | Already translates 8 bricks via `useSpring`; critique notes it dups ConservationAnimator - differentiate, don't animate more. |
| DissolveSim | L7 dissolving | Critique's best L7 (8/10); already animates both views via `useSpring`. Leave it. |
| WeighMoleScene | L6 weighing one mole | Balance reads molar mass; a single readout, not a plot; motion wouldn't teach. |
| GasLawSim | L7 gas in a box | A canvas particle sim + pressure bar, **not** a plotted curve - visx is the wrong tool. Critique's needs (color-only gauge, drop PV=nRT name, scaffold one variable) are content/a11y fixes, not a library. |
| PHPowersOfTen | L7 pH = powers of ten | Bespoke "tower of x10 rungs" + scale bar; not an x-y data plot; powers-of-ten tower is the right representation. |
| PHCompareCalc | L7 quick pH calculation | Two beakers + a worked "10^steps" line; arithmetic teaching, not a chart/3D/state-motion. |
| KeyTakeaways | end-of-lesson recap | Pure-text recap card. (SKIP per guideline.) |
| WorkedExample | "I do" step reveals (multiple lessons) | Step-by-step text reveal; recap/worked example - no plot/3D, and motion would only decorate text. |
| UnitScaleSlider | L2 metric prefixes | Tap-a-prefix readout; no data plot/3D. |
| SciNotationSlider | L2 scientific notation | Number expands from 10^n; already has `aria-live`; a number line, not a data chart. |
| UnitCancelDrag | L2 dimensional analysis | Tap the factor that cancels; conceptual tile pick, not a board/plot/3D. |

---

## Summary counts

**Registered components assessed:** 64 (the full `INTERACTIONS` map).

| Verdict | Count |
|---|---|
| **ENHANCE** | **13** |
| SKIP | 51 |

ENHANCE breakdown by library:

| Library (subagent) | Count | Components |
|---|---|---|
| 3D - react-three-fiber + drei (A) | 3 | VseprViewer, IonTransferCanvas (crystal view), CovalentShareCanvas (geo view) |
| visx (B) | 4 | PeriodicTrendsGraph, HeatingCurve, EnergyDiagram, TitrationSim |
| framer-motion (C) | 6 | MatterSortBoard, BondTypeClassifier, AcidBaseClassifier, FormulaNameMatcher, PHScalePlacement, PredictRevealCard |

**Shared engines (assessed separately):** 4.

| Engine | Verdict | Owner |
|---|---|---|
| Scene3D | ENHANCE | 3D (A) - shared r3f viewport |
| chart.jsx | ENHANCE | visx (B) - shared chart primitives |
| OrbitalAtom | SKIP | - |
| motion.js | SKIP | - (reused by framer-motion work) |

The framer-motion board work is centralized in the `ClassifyBoard` / `MatchBoard` / `PHScale`
engines (with `DragChip` left intact), so the six framer enhancements above are ~4 code targets.
