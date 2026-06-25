import MatchBoard from './MatchBoard.jsx';

const DEFAULT_PAIRS = [
  { left: 'NaCl', right: 'sodium chloride' },
  { left: 'CO2', right: 'carbon dioxide' },
  { left: 'MgCl2', right: 'magnesium chloride' },
];

/**
 * Match formulas to their names. Runs in MatchBoard's "autoValidate" mode: it
 * grades itself the moment every formula has a name - no separate Check button.
 * A correct board unlocks Next; a wrong pair is flagged inline so the learner
 * just taps it to clear and retry.
 */
export default function FormulaNameMatcher({ slide, onReady, savedState, onSaveState }) {
  const cfg = slide?.interactionConfig || {};
  const pairs = cfg.pairs || DEFAULT_PAIRS;
  const config = {
    feedbackCorrect: cfg.feedbackCorrect || 'Nice - every formula is matched to its correct name.',
    feedbackIncorrect: cfg.feedbackIncorrect || 'Not quite - tap a highlighted formula to clear it and try a different name.',
    hint: cfg.hint,
  };
  return (
    <MatchBoard
      pairs={pairs}
      autoValidate
      config={config}
      onReady={onReady}
      savedState={savedState}
      onSaveState={onSaveState}
    />
  );
}
