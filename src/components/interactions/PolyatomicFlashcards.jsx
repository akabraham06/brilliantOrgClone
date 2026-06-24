import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './PolyatomicFlashcards.module.css';

const CARDS = [
  { name: 'Ammonium', formula: 'NH\u2084\u207A' },
  { name: 'Hydroxide', formula: 'OH\u207B' },
  { name: 'Nitrate', formula: 'NO\u2083\u207B' },
  { name: 'Sulfate', formula: 'SO\u2084\u00B2\u207B' },
  { name: 'Carbonate', formula: 'CO\u2083\u00B2\u207B' },
];

/** Animated 3D flip-cards for the essential polyatomic ions. */
export default function PolyatomicFlashcards({ slide, onReady }) {
  const cards = slide?.interactionConfig?.cards || CARDS;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(() => new Set());

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = cards[index];

  function go(delta) {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  }
  function flip() {
    setFlipped((f) => !f);
    setSeen((prev) => new Set(prev).add(index));
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={s.scene}>
        <button
          type="button"
          className={`${s.card} ${flipped ? s.flipped : ''}`}
          onClick={flip}
          aria-label={`Flashcard: ${flipped ? card.formula : card.name}. Tap to flip.`}
        >
          <span key={`f-${index}`} className={`${s.face} ${s.front}`}>
            <span className={s.big}>{card.name}</span>
            <span className={s.hint}>tap to reveal formula</span>
          </span>
          <span className={`${s.face} ${s.back}`}>
            <span className={s.big}>{card.formula}</span>
            <span className={s.hint}>{card.name}</span>
          </span>
        </button>
      </div>

      <div className={s.dots} aria-hidden="true">
        {cards.map((c, i) => (
          <span key={c.name} className={`${s.dot} ${i === index ? s.dotActive : ''} ${seen.has(i) ? s.dotSeen : ''}`} />
        ))}
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => go(-1)}>Previous</button>
        <span className={v.muted}>{index + 1} / {cards.length}</span>
        <button type="button" className={v.btn} onClick={() => go(1)}>Next</button>
      </div>
    </div>
  );
}
