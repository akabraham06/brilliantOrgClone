import ClassifyBoard from './ClassifyBoard.jsx';

const DEFAULT_ITEMS = [
  { id: 'water', label: 'Water', answer: 'Matter' },
  { id: 'rock', label: 'Rock', answer: 'Matter' },
  { id: 'air', label: 'Air', answer: 'Matter' },
  { id: 'light', label: 'Light', answer: 'Not matter' },
  { id: 'sound', label: 'Sound', answer: 'Not matter' },
  { id: 'heat', label: 'Heat', answer: 'Not matter' },
];

/** Sort everyday things into Matter vs Not matter (content practice). */
export default function MatterSortBoard({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  return (
    <ClassifyBoard
      items={items}
      categories={['Matter', 'Not matter']}
      graded={false}
      onReady={onReady}
    />
  );
}
