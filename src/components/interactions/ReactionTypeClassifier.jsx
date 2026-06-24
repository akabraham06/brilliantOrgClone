import ClassifyBoard from './ClassifyBoard.jsx';

const DEFAULT_ITEMS = [
  { id: 'syn', label: '2H2 + O2 -> 2H2O', answer: 'synthesis' },
  { id: 'dec', label: '2H2O -> 2H2 + O2', answer: 'decomposition' },
  { id: 'com', label: 'CH4 + 2O2 -> CO2 + 2H2O', answer: 'combustion' },
  { id: 'syn2', label: 'N2 + 3H2 -> 2NH3', answer: 'synthesis' },
];

/** Sort example equations into reaction-type categories. */
export default function ReactionTypeClassifier({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  return (
    <ClassifyBoard
      items={items}
      categories={['synthesis', 'decomposition', 'combustion']}
      graded={false}
      onReady={onReady}
    />
  );
}
