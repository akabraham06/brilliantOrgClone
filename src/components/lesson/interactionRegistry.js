import { lazy } from 'react';
import PlaceholderInteraction from './PlaceholderInteraction.jsx';

/*
 * Interaction components are loaded with React.lazy so each one becomes its own
 * chunk. This lets heavy, library-backed interactives (e.g. the react-three-fiber
 * 3D viewers and visx charts) ship in per-component chunks that only download
 * when a slide that needs them is shown, keeping the initial bundle lean.
 *
 * Consumers MUST render the returned component inside a <Suspense> boundary
 * (see SlideRenderer.jsx).
 */
const INTERACTIONS = {
  AtomDiagram: lazy(() => import('../interactions/AtomDiagram.jsx')),
  MiniPeriodicTable: lazy(() => import('../interactions/MiniPeriodicTable.jsx')),
  ElectronShellBuilder: lazy(() => import('../interactions/ElectronShellBuilder.jsx')),
  MatterSortBoard: lazy(() => import('../interactions/MatterSortBoard.jsx')),
  ParticleModelViewer: lazy(() => import('../interactions/ParticleModelViewer.jsx')),
  IonTransferCanvas: lazy(() => import('../interactions/IonTransferCanvas.jsx')),
  LewisDotBuilder: lazy(() => import('../interactions/LewisDotBuilder.jsx')),
  BondTypeClassifier: lazy(() => import('../interactions/BondTypeClassifier.jsx')),
  FormulaNameMatcher: lazy(() => import('../interactions/FormulaNameMatcher.jsx')),
  EquationBalancer: lazy(() => import('../interactions/EquationBalancer.jsx')),
  MoleConversionStepper: lazy(() => import('../interactions/MoleConversionStepper.jsx')),
  StateParticlesAnimator: lazy(() => import('../interactions/StateParticlesAnimator.jsx')),
  SolutionConcentrationMixer: lazy(() => import('../interactions/SolutionConcentrationMixer.jsx')),
  PHScalePlacement: lazy(() => import('../interactions/PHScalePlacement.jsx')),
  ClickableScene: lazy(() => import('../interactions/ClickableScene.jsx')),
  ZoomScaleViewer: lazy(() => import('../interactions/ZoomScaleViewer.jsx')),
  BondStabilityScene: lazy(() => import('../interactions/BondStabilityScene.jsx')),
  CovalentShareCanvas: lazy(() => import('../interactions/CovalentShareCanvas.jsx')),
  MetallicBondScene: lazy(() => import('../interactions/MetallicBondScene.jsx')),
  FormulaBreakdown: lazy(() => import('../interactions/FormulaBreakdown.jsx')),
  IonicFormulaBuilder: lazy(() => import('../interactions/IonicFormulaBuilder.jsx')),
  PolyatomicFlashcards: lazy(() => import('../interactions/PolyatomicFlashcards.jsx')),
  ReactionLayout: lazy(() => import('../interactions/ReactionLayout.jsx')),
  ConservationAnimator: lazy(() => import('../interactions/ConservationAnimator.jsx')),
  CountingUnitScene: lazy(() => import('../interactions/CountingUnitScene.jsx')),
  MoleConceptScene: lazy(() => import('../interactions/MoleConceptScene.jsx')),
  MolarMassLookup: lazy(() => import('../interactions/MolarMassLookup.jsx')),
  MoleRatioScene: lazy(() => import('../interactions/MoleRatioScene.jsx')),
  DensityCompare: lazy(() => import('../interactions/DensityCompare.jsx')),
  WaterRoleScene: lazy(() => import('../interactions/WaterRoleScene.jsx')),
  CompoundNameBuilder: lazy(() => import('../interactions/CompoundNameBuilder.jsx')),
  PredictRevealCard: lazy(() => import('../interactions/PredictRevealCard.jsx')),
  TemperatureSlider: lazy(() => import('../interactions/TemperatureSlider.jsx')),
  ReactionTypeDiagram: lazy(() => import('../interactions/ReactionTypeDiagram.jsx')),
  ChangeExplainer: lazy(() => import('../interactions/ChangeExplainer.jsx')),
  ExplainerGraphic: lazy(() => import('../interactions/ExplainerGraphic.jsx')),
  PureVsMixtureViewer: lazy(() => import('../interactions/PureVsMixtureViewer.jsx')),
  BuildingBlocksExercise: lazy(() => import('../interactions/BuildingBlocksExercise.jsx')),
  IonFormationScene: lazy(() => import('../interactions/IonFormationScene.jsx')),
  IsotopeAnalogy: lazy(() => import('../interactions/IsotopeAnalogy.jsx')),
  IonChargePredictor: lazy(() => import('../interactions/IonChargePredictor.jsx')),
  PolarBondViewer: lazy(() => import('../interactions/PolarBondViewer.jsx')),
  StabilityCardsScene: lazy(() => import('../interactions/StabilityCardsScene.jsx')),
  IonicBondScene: lazy(() => import('../interactions/IonicBondScene.jsx')),
  GiveVsShareScene: lazy(() => import('../interactions/GiveVsShareScene.jsx')),
  VseprViewer: lazy(() => import('../interactions/VseprViewer.jsx')),
  CoefficientSubscriptID: lazy(() => import('../interactions/CoefficientSubscriptID.jsx')),
  ServingsScene: lazy(() => import('../interactions/ServingsScene.jsx')),
  RearrangeBlocksScene: lazy(() => import('../interactions/RearrangeBlocksScene.jsx')),
  DissolveSim: lazy(() => import('../interactions/DissolveSim.jsx')),
  WeighMoleScene: lazy(() => import('../interactions/WeighMoleScene.jsx')),
  HeatingCurve: lazy(() => import('../interactions/HeatingCurve.jsx')),
  PeriodicTrendsGraph: lazy(() => import('../interactions/PeriodicTrendsGraph.jsx')),
  EnergyDiagram: lazy(() => import('../interactions/EnergyDiagram.jsx')),
  TitrationSim: lazy(() => import('../interactions/TitrationSim.jsx')),
  PHPowersOfTen: lazy(() => import('../interactions/PHPowersOfTen.jsx')),
  PHCompareCalc: lazy(() => import('../interactions/PHCompareCalc.jsx')),
  KeyTakeaways: lazy(() => import('../interactions/KeyTakeaways.jsx')),
  WorkedExample: lazy(() => import('../interactions/WorkedExample.jsx')),
  UnitScaleSlider: lazy(() => import('../interactions/UnitScaleSlider.jsx')),
  SciNotationSlider: lazy(() => import('../interactions/SciNotationSlider.jsx')),
  UnitCancelDrag: lazy(() => import('../interactions/UnitCancelDrag.jsx')),
  // New interactives added in the Interactive Overhaul + Course Review pass.
  DensityBuilder: lazy(() => import('../interactions/DensityBuilder.jsx')),
  DensityFloat3D: lazy(() => import('../interactions/DensityFloat3D.jsx')),
  LatticeViewer3D: lazy(() => import('../interactions/LatticeViewer3D.jsx')),
  PressureBox3D: lazy(() => import('../interactions/PressureBox3D.jsx')),
  IdealGasLawExplainer: lazy(() => import('../interactions/IdealGasLawExplainer.jsx')),
  PhaseEnergyScene: lazy(() => import('../interactions/PhaseEnergyScene.jsx')),
  AcidBaseExplorer: lazy(() => import('../interactions/AcidBaseExplorer.jsx')),
  NeutralizationScene: lazy(() => import('../interactions/NeutralizationScene.jsx')),
  IonReleaseScene: lazy(() => import('../interactions/IonReleaseScene.jsx')),
  ElementIdCard: lazy(() => import('../interactions/ElementIdCard.jsx')),
  MolecularVsIonicViewer: lazy(() => import('../interactions/MolecularVsIonicViewer.jsx')),
  MolesParticlesConverter: lazy(() => import('../interactions/MolesParticlesConverter.jsx')),
  BondEnergyScene: lazy(() => import('../interactions/BondEnergyScene.jsx')),
};

/*
 * Checks are also code-split: ClassifyCheck/MatchingCheck/PHPlacementCheck pull
 * in the board engines (ClassifyBoard/MatchBoard/PHScale), which now depend on
 * Framer Motion. Lazy-loading them keeps Framer (and the boards) out of the
 * initial bundle so it only downloads on the first slide that needs it.
 * CheckFallback stays static since it is the synchronous default.
 */
import CheckFallback from './checks/CheckFallback.jsx';

/** Maps a check's validationMode to its check component. */
const CHECKS = {
  multipleChoice: lazy(() => import('./checks/MultipleChoiceCheck.jsx')),
  classify: lazy(() => import('./checks/ClassifyCheck.jsx')),
  matching: lazy(() => import('./checks/MatchingCheck.jsx')),
  balance: lazy(() => import('./checks/BalanceCheck.jsx')),
  pHPlacement: lazy(() => import('./checks/PHPlacementCheck.jsx')),
  nameBuilder: lazy(() => import('./checks/NameBuilderCheck.jsx')),
  freeResponse: lazy(() => import('./checks/FreeResponseCheck.jsx')),
  freeRecall: lazy(() => import('./checks/FreeRecallCheck.jsx')),
};

export function getInteractionComponent(key) {
  return INTERACTIONS[key] || PlaceholderInteraction;
}

export function getCheckComponent(validationMode) {
  return CHECKS[validationMode] || CheckFallback;
}
