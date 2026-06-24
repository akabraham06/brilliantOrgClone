import ClassifyBoard from '../../interactions/ClassifyBoard.jsx';

/** Graded classification check, driven by slide.checkConfig. */
export default function ClassifyCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide.checkConfig || {};
  return (
    <ClassifyBoard
      items={cfg.items || []}
      categories={cfg.categories || []}
      graded
      config={cfg}
      onResult={onResult}
      savedState={savedState}
      onSaveState={onSaveState}
    />
  );
}
