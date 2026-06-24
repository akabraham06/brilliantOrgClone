import ClassifyBoard from './ClassifyBoard.jsx';

const DEFAULT_ITEMS = [
  { id: 'nacl', label: 'NaCl', answer: 'ionic' },
  { id: 'h2o', label: 'H2O', answer: 'covalent' },
  { id: 'cu', label: 'Copper metal', answer: 'metallic' },
  { id: 'mgo', label: 'MgO', answer: 'ionic' },
];

/** Classify examples by bond type (content practice). */
export default function BondTypeClassifier({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  return (
    <ClassifyBoard
      items={items}
      categories={['ionic', 'covalent', 'metallic']}
      graded={false}
      onReady={onReady}
    />
  );
}
