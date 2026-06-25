import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './PHTools.module.css';

/*
 * Compare two solutions and let the learner do the "pH math" by counting steps.
 * Pick two pH values; the component shows |A - B| steps and 10^(steps) as the
 * fold difference in acidity, with a worked one-line calculation and beakers
 * colored by pH.
 */

function phColor(ph) {
  if (ph <= 3) return 'var(--accent-red)';
  if (ph <= 6) return 'var(--accent-orange)';
  if (ph === 7) return 'var(--accent-green)';
  if (ph <= 10) return 'var(--accent-blue)';
  return 'var(--accent-purple)';
}

function tenPow(n) {
  return Math.pow(10, n).toLocaleString('en-US');
}

function Beaker({ ph, label }) {
  return (
    <div className={s.beakerCol}>
      <svg width="64" height="84" viewBox="0 0 64 84" aria-hidden="true" className={v.sceneShadow}>
        <path d="M 12 14 H 52 L 50 70 Q 50 80 32 80 Q 14 80 14 70 L 12 14 Z" fill={phColor(ph)} opacity="0.5" stroke="var(--color-border-strong)" strokeWidth="2" style={{ transition: 'fill 0.3s' }} />
        <ellipse cx="32" cy="14" rx="20" ry="4" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" />
      </svg>
      <div className={v.statValue} style={{ color: phColor(ph), fontSize: 'var(--text-lg)' }}>pH {ph}</div>
      <div className={v.statLabel}>{label}</div>
    </div>
  );
}

export default function PHCompareCalc({ onReady }) {
  const [a, setA] = useState(2);
  const [b, setB] = useState(6);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = Math.abs(a - b);
  const fold = tenPow(steps);
  const moreAcidic = a < b ? 'A' : b < a ? 'B' : null;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> set two solutions, count the steps between them, and raise 10 to that
        power to find how many times more acidic one is.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <div className={s.beakers}>
          <Beaker ph={a} label="Solution A" />
          <div className={s.vs}>vs</div>
          <Beaker ph={b} label="Solution B" />
        </div>
      </div>

      <div className={v.row} style={{ gap: 'var(--space-4)', width: '100%' }}>
        <label className={v.muted} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          Solution A: pH {a}
          <input className={v.slider} type="range" min={0} max={14} step={1} value={a} onChange={(e) => setA(Number(e.target.value))} aria-label="pH of solution A" />
        </label>
        <label className={v.muted} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          Solution B: pH {b}
          <input className={v.slider} type="range" min={0} max={14} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} aria-label="pH of solution B" />
        </label>
      </div>

      {/* worked calculation */}
      <div className={s.calc}>
        <span className={s.calcStep}>|{a} &minus; {b}| = <strong>{steps}</strong> step{steps === 1 ? '' : 's'}</span>
        <span className={s.calcArrow}>&rarr;</span>
        <span className={s.calcStep}>10<sup>{steps}</sup> = <strong style={{ color: 'var(--accent-purple)' }}>{fold}&times;</strong></span>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 420 }}>
        {steps === 0
          ? 'Same pH - equally acidic.'
          : `Solution ${moreAcidic} is ${fold}\u00D7 more acidic than the other (${steps} step${steps === 1 ? '' : 's'} apart on the pH scale).`}
      </p>
    </div>
  );
}
