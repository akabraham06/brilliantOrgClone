import PlaceholderInteraction from './PlaceholderInteraction.jsx';

// Content interaction components (Phase 5).
import AtomDiagram from '../interactions/AtomDiagram.jsx';
import MiniPeriodicTable from '../interactions/MiniPeriodicTable.jsx';
import ElectronShellBuilder from '../interactions/ElectronShellBuilder.jsx';
import MatterSortBoard from '../interactions/MatterSortBoard.jsx';
import ParticleModelViewer from '../interactions/ParticleModelViewer.jsx';
import IonTransferCanvas from '../interactions/IonTransferCanvas.jsx';
import LewisDotBuilder from '../interactions/LewisDotBuilder.jsx';
import BondTypeClassifier from '../interactions/BondTypeClassifier.jsx';
import FormulaNameMatcher from '../interactions/FormulaNameMatcher.jsx';
import EquationBalancer from '../interactions/EquationBalancer.jsx';
import MoleConversionStepper from '../interactions/MoleConversionStepper.jsx';
import StateParticlesAnimator from '../interactions/StateParticlesAnimator.jsx';
import SolutionConcentrationMixer from '../interactions/SolutionConcentrationMixer.jsx';
import PHScalePlacement from '../interactions/PHScalePlacement.jsx';

// Scene / content-specific components.
import ClickableScene from '../interactions/ClickableScene.jsx';
import ZoomScaleViewer from '../interactions/ZoomScaleViewer.jsx';
import BondStabilityScene from '../interactions/BondStabilityScene.jsx';
import CovalentShareCanvas from '../interactions/CovalentShareCanvas.jsx';
import MetallicBondScene from '../interactions/MetallicBondScene.jsx';
import FormulaBreakdown from '../interactions/FormulaBreakdown.jsx';
import IonicFormulaBuilder from '../interactions/IonicFormulaBuilder.jsx';
import PolyatomicFlashcards from '../interactions/PolyatomicFlashcards.jsx';
import ReactionLayout from '../interactions/ReactionLayout.jsx';
import ConservationAnimator from '../interactions/ConservationAnimator.jsx';
import ReactionTypeCards from '../interactions/ReactionTypeCards.jsx';
import ReactionTypeClassifier from '../interactions/ReactionTypeClassifier.jsx';
import CountingUnitScene from '../interactions/CountingUnitScene.jsx';
import MoleConceptScene from '../interactions/MoleConceptScene.jsx';
import MolarMassLookup from '../interactions/MolarMassLookup.jsx';
import MoleRatioScene from '../interactions/MoleRatioScene.jsx';
import DensityCompare from '../interactions/DensityCompare.jsx';
import WaterRoleScene from '../interactions/WaterRoleScene.jsx';
import AcidBaseClassifier from '../interactions/AcidBaseClassifier.jsx';
import CompoundNameBuilder from '../interactions/CompoundNameBuilder.jsx';
import PredictRevealCard from '../interactions/PredictRevealCard.jsx';
import TemperatureSlider from '../interactions/TemperatureSlider.jsx';
import ReactionTypeDiagram from '../interactions/ReactionTypeDiagram.jsx';
import ChangeExplainer from '../interactions/ChangeExplainer.jsx';
import ExplainerGraphic from '../interactions/ExplainerGraphic.jsx';
import PureVsMixtureViewer from '../interactions/PureVsMixtureViewer.jsx';
import BuildingBlocksExercise from '../interactions/BuildingBlocksExercise.jsx';
import IonFormationScene from '../interactions/IonFormationScene.jsx';
import IsotopeAnalogy from '../interactions/IsotopeAnalogy.jsx';
import IonChargePredictor from '../interactions/IonChargePredictor.jsx';
import PolarBondViewer from '../interactions/PolarBondViewer.jsx';
import StabilityCardsScene from '../interactions/StabilityCardsScene.jsx';
import IonicBondScene from '../interactions/IonicBondScene.jsx';
import GiveVsShareScene from '../interactions/GiveVsShareScene.jsx';
import VseprViewer from '../interactions/VseprViewer.jsx';
import CoefficientSubscriptID from '../interactions/CoefficientSubscriptID.jsx';
import ServingsScene from '../interactions/ServingsScene.jsx';
import RearrangeBlocksScene from '../interactions/RearrangeBlocksScene.jsx';
import DissolveSim from '../interactions/DissolveSim.jsx';
import WeighMoleScene from '../interactions/WeighMoleScene.jsx';

// Check components.
import MultipleChoiceCheck from './checks/MultipleChoiceCheck.jsx';
import ClassifyCheck from './checks/ClassifyCheck.jsx';
import MatchingCheck from './checks/MatchingCheck.jsx';
import BalanceCheck from './checks/BalanceCheck.jsx';
import PHPlacementCheck from './checks/PHPlacementCheck.jsx';
import NameBuilderCheck from './checks/NameBuilderCheck.jsx';
import CheckFallback from './checks/CheckFallback.jsx';

/**
 * Maps a slide's interactionComponentKey to its React component. Keys that
 * don't yet have a dedicated component (content-specific scenes refined in
 * Phase 6) fall back to PlaceholderInteraction.
 */
const INTERACTIONS = {
  AtomDiagram,
  MiniPeriodicTable,
  ElectronShellBuilder,
  MatterSortBoard,
  ParticleModelViewer,
  IonTransferCanvas,
  LewisDotBuilder,
  BondTypeClassifier,
  FormulaNameMatcher,
  EquationBalancer,
  MoleConversionStepper,
  StateParticlesAnimator,
  SolutionConcentrationMixer,
  PHScalePlacement,
  ClickableScene,
  ZoomScaleViewer,
  BondStabilityScene,
  CovalentShareCanvas,
  MetallicBondScene,
  FormulaBreakdown,
  IonicFormulaBuilder,
  PolyatomicFlashcards,
  ReactionLayout,
  ConservationAnimator,
  ReactionTypeCards,
  ReactionTypeClassifier,
  CountingUnitScene,
  MoleConceptScene,
  MolarMassLookup,
  MoleRatioScene,
  DensityCompare,
  WaterRoleScene,
  AcidBaseClassifier,
  CompoundNameBuilder,
  PredictRevealCard,
  TemperatureSlider,
  ReactionTypeDiagram,
  ChangeExplainer,
  ExplainerGraphic,
  PureVsMixtureViewer,
  BuildingBlocksExercise,
  IonFormationScene,
  IsotopeAnalogy,
  IonChargePredictor,
  PolarBondViewer,
  StabilityCardsScene,
  IonicBondScene,
  GiveVsShareScene,
  VseprViewer,
  CoefficientSubscriptID,
  ServingsScene,
  RearrangeBlocksScene,
  DissolveSim,
  WeighMoleScene,
};

/** Maps a check's validationMode to its check component. */
const CHECKS = {
  multipleChoice: MultipleChoiceCheck,
  classify: ClassifyCheck,
  matching: MatchingCheck,
  balance: BalanceCheck,
  pHPlacement: PHPlacementCheck,
  nameBuilder: NameBuilderCheck,
};

export function getInteractionComponent(key) {
  return INTERACTIONS[key] || PlaceholderInteraction;
}

export function getCheckComponent(validationMode) {
  return CHECKS[validationMode] || CheckFallback;
}
