import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './SciNotationSlider.module.css';

/**
 * Scientific-notation explorer: slide the exponent and watch 10^n expand into
 * the full number (zeros marching out, or a tiny decimal). Foreshadows
 * Avogadro's number and pH. Non-gating.
 */
const NOTES = {
  '-6': 'About the width of a bacterium in meters.',
  0: 'Ten to the zero is just 1.',
  3: 'A thousand - like 1000 m in a kilometer.',
  6: 'A million.',
  23: "Near Avogadro's number - one mole of particles!",
};

function expand(n) {
  if (n >= 0) {
    return '1' + '0'.repeat(n);
  }
  return '0.' + '0'.repeat(-n - 1) + '1';
}

function grouped(str) {
  // Add thin spaces every 3 digits from the right for readability.
  if (str.includes('.')) return str;
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

export default function SciNotationSlider({ onReady }) {
  const [n, setN] = useState(2);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.panel}>
        <p className={s.notation} aria-hidden="true">
          10<sup className={s.exp}>{n}</sup>
        </p>
        <p className={s.expanded} aria-live="polite">
          <span className="sr-only">10 to the power {n} equals </span>
          {grouped(expand(n))}
        </p>
      </div>

      <label className={s.sliderLabel}>
        <span>Exponent: {n}</span>
        <input
          type="range"
          className={v.slider}
          min={-6}
          max={23}
          step={1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          aria-label="Power of ten exponent"
          aria-valuetext={`10 to the ${n}`}
        />
      </label>

      {NOTES[n] && <p className={v.feedbackOk} role="status">{NOTES[n]}</p>}
      <p className={v.muted} style={{ maxWidth: 360, textAlign: 'center' }}>
        Scientific notation is just shorthand: the exponent counts how many places
        the decimal point moves.
      </p>
    </div>
  );
}
