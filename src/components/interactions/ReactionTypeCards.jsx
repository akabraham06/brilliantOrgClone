import { useEffect, useState } from 'react';
import v from './viz.module.css';

const TYPES = [
  { type: 'Synthesis', pattern: 'A + B -> AB', example: '2H2 + O2 -> 2H2O' },
  { type: 'Decomposition', pattern: 'AB -> A + B', example: '2H2O -> 2H2 + O2' },
  { type: 'Single replacement', pattern: 'A + BC -> AC + B', example: 'Zn + 2HCl -> ZnCl2 + H2' },
  { type: 'Double replacement', pattern: 'AB + CD -> AD + CB', example: 'AgNO3 + NaCl -> AgCl + NaNO3' },
  { type: 'Combustion', pattern: 'CxHy + O2 -> CO2 + H2O', example: 'CH4 + 2O2 -> CO2 + 2H2O' },
];

/** Carousel of common reaction types, each with its pattern and an example. */
export default function ReactionTypeCards({ slide, onReady }) {
  const cards = slide?.interactionConfig?.cards || TYPES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = cards[index];

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-strong)',
          background: 'var(--color-bg-elevated)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-purple)' }}>{card.type}</div>
        <div style={{ margin: '10px 0', fontFamily: 'monospace', fontSize: 'var(--text-lg)' }}>{card.pattern}</div>
        <div className={v.muted}>e.g. {card.example}</div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => setIndex((i) => (i - 1 + cards.length) % cards.length)}>Previous</button>
        <span className={v.muted}>{index + 1} / {cards.length}</span>
        <button type="button" className={v.btn} onClick={() => setIndex((i) => (i + 1) % cards.length)}>Next</button>
      </div>
    </div>
  );
}
