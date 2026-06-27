import CompoundNameBuilder from '../../interactions/CompoundNameBuilder.jsx';

/** Graded compound-name builder, driven by slide.checkConfig. */
export default function NameBuilderCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide.checkConfig || {};
  return <CompoundNameBuilder slide={slide} graded config={cfg} onResult={onResult} savedState={savedState} onSaveState={onSaveState} />;
}
