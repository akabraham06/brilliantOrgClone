import PHScale from './PHScale.jsx';

const DEFAULT_ITEMS = [
  { id: 'lemon', label: 'Lemon juice', answer: 'acidic', ph: 2, image: '/images/ph-lemon.png' },
  { id: 'vinegar', label: 'Vinegar', answer: 'acidic', ph: 3, image: '/images/ph-vinegar.png' },
  { id: 'water', label: 'Pure water', answer: 'neutral', ph: 7, image: '/images/ph-water.png' },
  { id: 'soap', label: 'Soap', answer: 'basic', ph: 10, image: '/images/ph-soap.png' },
  { id: 'baking', label: 'Baking soda', answer: 'basic', ph: 9, image: '/images/ph-baking-soda.png' },
];

/** Place household items on the pH scale (content practice). */
export default function PHScalePlacement({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  return <PHScale items={items} graded={false} onReady={onReady} />;
}
