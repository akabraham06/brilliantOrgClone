import { useEffect, useState } from 'react';
import { getElement, valenceElectrons } from './elements.js';
import v from './viz.module.css';
import s from './LewisDotBuilder.module.css';

const CHOICES = [1, 6, 7, 8, 9];
// Lewis filling order: one dot per side, then pair up. [x, y] around the symbol.
const SLOTS = [
  [0, -34], [34, 0], [0, 34], [-34, 0],
  [-12, -34], [34, -12], [12, 34], [-34, 12],
];
const CX = 90;
const CY = 80;

export default function LewisDotBuilder({ onReady, savedState, onSaveState }) {
  const [atomicNumber, setAtomicNumber] = useState(savedState?.atomicNumber ?? 8);
  const [dots, setDots] = useState(savedState?.dots ?? 0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const element = getElement(atomicNumber);
  const target = valenceElectrons(element);
  const correct = dots === target;

  function selectElement(n) {
    setAtomicNumber(n);
    setDots(0);
    onSaveState?.({ atomicNumber: n, dots: 0 });
  }
  function addDot() {
    setDots((d) => {
      const next = Math.min(8, d + 1);
      onSaveState?.({ atomicNumber, dots: next });
      return next;
    });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose element">
        {CHOICES.map((n) => (
          <button
            key={n}
            type="button"
            className={atomicNumber === n ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => selectElement(n)}
          >
            {getElement(n).symbol}
          </button>
        ))}
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 220 }}>
        <svg
          viewBox="0 0 180 160"
          className={v.svg}
          role="button"
          tabIndex={0}
          aria-label={`Add a valence dot to ${element.name}`}
          onClick={addDot}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && addDot()}
          style={{ cursor: correct ? 'default' : 'pointer' }}
        >
          {/* tap affordance: a pulsing ring + hint while dots are still needed */}
          {!correct && (
            <>
              <circle cx={CX} cy={CY} r="30" fill="none" stroke="var(--accent-purple)" strokeWidth="2" strokeDasharray="4 5" className={s.tapRing} />
              <text x={CX} y={CY + 54} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--accent-purple)" className={s.tapHint}>tap to add a dot</text>
            </>
          )}

          <circle cx={CX} cy={CY} r="22" fill="rgba(255,255,255,0.04)" />
          <text x={CX} y={CY + 8} textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--color-text)">
            {element.symbol}
          </text>
          {SLOTS.slice(0, dots).map(([dx, dy], i) => (
            <circle
              key={i}
              className={s.dot}
              cx={CX + dx}
              cy={CY + dy}
              r="5"
              fill={correct ? 'var(--accent-green)' : 'var(--accent-yellow)'}
              style={{ '--dx': `${-dx}px`, '--dy': `${-dy}px` }}
            />
          ))}
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{dots}</div>
          <div className={v.statLabel}>Dots placed</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{target}</div>
          <div className={v.statLabel}>Valence electrons</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={addDot} disabled={dots >= 8}>
          Add a dot
        </button>
        <button type="button" className={v.btn} onClick={() => selectElement(atomicNumber)} disabled={dots === 0}>
          Reset
        </button>
      </div>

      <p className={correct ? v.feedbackOk : v.muted}>
        {correct
          ? `Correct - ${element.name} has ${target} valence electrons, so it gets ${target} dots.`
          : `Tap the symbol (or "Add a dot"). ${element.name} needs ${target} dot${target === 1 ? '' : 's'} - one per valence electron.`}
      </p>
    </div>
  );
}
