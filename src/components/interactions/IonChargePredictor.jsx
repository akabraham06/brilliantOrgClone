import { useEffect, useState } from 'react';
import { getElement, valenceElectrons } from './elements.js';
import v from './viz.module.css';
import s from './IonChargePredictor.module.css';

// Main-group elements with a single, predictable ion charge.
const SAMPLES = [11, 12, 13, 19, 20, 8, 9, 16, 17, 7];

function predict(element) {
  const g = element.group;
  const valence = valenceElectrons(element);
  if (g === 1) return { charge: 1, action: 'lose', count: 1 };
  if (g === 2) return { charge: 2, action: 'lose', count: 2 };
  if (g === 13) return { charge: 3, action: 'lose', count: 3 };
  if (g === 15) return { charge: -3, action: 'gain', count: 3 };
  if (g === 16) return { charge: -2, action: 'gain', count: 2 };
  if (g === 17) return { charge: -1, action: 'gain', count: 1 };
  return { charge: 0, action: 'keep', count: 0, valence };
}

function fmtCharge(c) {
  if (c === 0) return '0';
  return c > 0 ? `+${c}` : `${c}`;
}

/**
 * Shows the easy shortcut for predicting an ion's charge: count the outer
 * (valence) electrons, decide whether it is faster to lose them or gain a few
 * to fill the shell, and read off the resulting charge. Tap any element to walk
 * through the reasoning.
 */
export default function IonChargePredictor({ onReady, savedState, onSaveState }) {
  const [atomicNumber, setAtomicNumber] = useState(savedState?.atomicNumber ?? 11);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const element = getElement(atomicNumber);
  const valence = valenceElectrons(element);
  const { charge, action, count } = predict(element);

  function select(n) {
    setAtomicNumber(n);
    onSaveState?.({ atomicNumber: n });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose an element">
        {SAMPLES.map((n) => {
          const el = getElement(n);
          return (
            <button
              key={n}
              type="button"
              className={atomicNumber === n ? `${v.toggle} ${v.toggleActive}` : v.toggle}
              onClick={() => select(n)}
            >
              {el.symbol}
            </button>
          );
        })}
      </div>

      <div className={s.steps}>
        <div className={s.step}>
          <div className={s.stepNum}>1</div>
          <div>
            <div className={s.stepTitle}>Count outer electrons</div>
            <div className={s.stepBody}>{element.name} is in group {element.group}, so it has <strong>{valence}</strong> valence electron{valence === 1 ? '' : 's'}.</div>
          </div>
        </div>
        <div className={s.step}>
          <div className={s.stepNum}>2</div>
          <div>
            <div className={s.stepTitle}>Lose or gain - whichever is fewer</div>
            <div className={s.stepBody}>
              {action === 'lose'
                ? `Losing ${count} empties the outer shell faster than gaining ${8 - valence}.`
                : `Gaining ${count} fills the outer shell faster than losing ${valence}.`}
            </div>
          </div>
        </div>
        <div className={s.step}>
          <div className={s.stepNum}>3</div>
          <div>
            <div className={s.stepTitle}>Read off the charge</div>
            <div className={s.stepBody}>
              {action === 'lose'
                ? `Lose ${count} electron${count === 1 ? '' : 's'} -> ${count} more proton${count === 1 ? '' : 's'} than electrons.`
                : `Gain ${count} electron${count === 1 ? '' : 's'} -> ${count} more electron${count === 1 ? '' : 's'} than protons.`}
            </div>
          </div>
        </div>
      </div>

      <div className={s.result} key={atomicNumber}>
        <span className={s.formula}>charge = protons &minus; electrons =</span>
        <span className={s.chargeBadge} style={{ color: charge > 0 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
          {fmtCharge(charge)}
        </span>
        <span className={s.ion}>
          {element.symbol}
          <sup>{charge > 0 ? `${charge === 1 ? '' : charge}+` : `${charge === -1 ? '' : Math.abs(charge)}-`}</sup>
        </span>
      </div>

      <p className={v.muted}>
        Shortcut: group 1 -&gt; +1, group 2 -&gt; +2, group 13 -&gt; +3, group 15 -&gt; &minus;3, group 16 -&gt; &minus;2, group 17 -&gt; &minus;1.
      </p>
    </div>
  );
}
