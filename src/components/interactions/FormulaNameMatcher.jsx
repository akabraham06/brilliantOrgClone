import MatchBoard from './MatchBoard.jsx';

const DEFAULT_PAIRS = [
  { left: 'NaCl', right: 'sodium chloride' },
  { left: 'CO2', right: 'carbon dioxide' },
  { left: 'MgCl2', right: 'magnesium chloride' },
];

/** Match formulas to their names (content practice). */
export default function FormulaNameMatcher({ slide, onReady, savedState, onSaveState }) {
  const pairs = slide?.interactionConfig?.pairs || DEFAULT_PAIRS;
  return <MatchBoard pairs={pairs} graded={false} onReady={onReady} savedState={savedState} onSaveState={onSaveState} />;
}
