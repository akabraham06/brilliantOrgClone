import { useEffect, useState } from 'react';
import v from './viz.module.css';

const DEFAULT_ITEMS = [
  { id: 'ice', label: 'Ice' },
  { id: 'water', label: 'Water' },
  { id: 'air', label: 'Air in a balloon' },
  { id: 'rock', label: 'Rock' },
];

/**
 * "What is chemistry?" - click everyday objects to reveal they are all matter
 * (they have mass and take up space). Revealed items use the standard purple
 * "active" highlight shared across the interactive scenes.
 */
export default function ClickableScene({ slide, onReady }) {
  const items = slide?.interactionConfig?.items || DEFAULT_ITEMS;
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRevealed = items.every((i) => revealed[i.id]);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.row}>
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            className={revealed[i.id] ? `${v.chip} ${v.chipActive}` : v.chip}
            onClick={() => setRevealed((r) => ({ ...r, [i.id]: true }))}
          >
            {i.label}{revealed[i.id] ? ' = matter' : ''}
          </button>
        ))}
      </div>
      <p className={allRevealed ? v.feedbackOk : v.muted}>
        {allRevealed
          ? 'Everything you tapped has mass and takes up space - so it is all matter. Chemistry is the study of matter and how it changes.'
          : 'Matter is anything that has mass and takes up space. Tap each everyday thing to confirm it is matter.'}
      </p>
    </div>
  );
}
