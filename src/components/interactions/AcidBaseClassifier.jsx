import ClassifyBoard from './ClassifyBoard.jsx';

const DEFAULT_ITEMS = [
  { id: 'lemon', label: 'Lemon juice (sour)', answer: 'acid' },
  { id: 'vinegar', label: 'Vinegar (sour)', answer: 'acid' },
  { id: 'soap', label: 'Soap (slippery)', answer: 'base' },
  { id: 'baking', label: 'Baking soda (slippery)', answer: 'base' },
];

/** Drag everyday substances into acid vs base using sensory cues. */
export default function AcidBaseClassifier({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  return (
    <ClassifyBoard items={items} categories={['acid', 'base']} graded={false} onReady={onReady} />
  );
}
