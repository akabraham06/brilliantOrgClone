import MatchBoard from '../../interactions/MatchBoard.jsx';

/** Graded matching check, driven by slide.checkConfig. */
export default function MatchingCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide.checkConfig || {};
  return <MatchBoard pairs={cfg.pairs || []} graded config={cfg} onResult={onResult} savedState={savedState} onSaveState={onSaveState} />;
}
