import PlaceholderInteraction from './PlaceholderInteraction.jsx';
import MultipleChoiceCheck from './checks/MultipleChoiceCheck.jsx';
import CheckFallback from './checks/CheckFallback.jsx';

/**
 * Maps a slide's interactionComponentKey to its React component. Phase 5 adds
 * the real interactive visuals here (AtomDiagram, MatterSortBoard, etc.);
 * anything not yet registered falls back to PlaceholderInteraction.
 */
const INTERACTIONS = {
  // Populated in Phase 5.
};

/**
 * Maps a check's validationMode to its check component. Today only
 * multipleChoice is fully interactive; the rest use CheckFallback until
 * their dedicated components land in Phase 5.
 */
const CHECKS = {
  multipleChoice: MultipleChoiceCheck,
};

export function getInteractionComponent(key) {
  return INTERACTIONS[key] || PlaceholderInteraction;
}

export function getCheckComponent(validationMode) {
  return CHECKS[validationMode] || CheckFallback;
}
