import { useEffect, useState } from 'react';
import { atomColor } from './formula.js';
import { useSpring } from './lib/motion.js';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import s from './ServingsScene.module.css';

/** One "serving": a plate holding a single water molecule (2 H + 1 O). */
function Plate() {
  return (
    <svg viewBox="0 0 86 70" width="86" height="70" className={s.plate} aria-hidden="true">
      <ellipse cx="43" cy="58" rx="38" ry="9" fill="rgba(255,255,255,0.05)" stroke="var(--color-border)" />
      <circle cx="43" cy="30" r="15" fill={atomColor('O')} />
      <text x="43" y="35" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0e0f13">O</text>
      <circle cx="22" cy="44" r="9" fill={atomColor('H')} />
      <text x="22" y="48" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">H</text>
      <circle cx="64" cy="44" r="9" fill={atomColor('H')} />
      <text x="64" y="48" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">H</text>
    </svg>
  );
}

function CountUp({ value }) {
  return <>{Math.round(useSpring(value, { stiffness: 0.18 }))}</>;
}

/**
 * Servings vs. ingredients: the coefficient is how many whole servings (plates)
 * of a molecule you have; the subscripts are the fixed ingredients inside one
 * serving. Add servings and watch the totals scale while the recipe per plate
 * never changes.
 */
export default function ServingsScene({ onReady }) {
  const [servings, setServings] = useState(1);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
        <span style={{ color: 'var(--accent-yellow)' }}>{servings > 1 ? servings : ''}</span>
        <Formula value="H2O" />
      </div>

      <div className={s.plates}>
        {Array.from({ length: servings }).map((_, i) => (
          <div key={i} className={`${s.serving} ${v.popIn}`}>
            <Plate />
          </div>
        ))}
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-yellow)' }}>{servings}</div>
          <div className={v.statLabel}>servings (coefficient)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-blue)' }}>3</div>
          <div className={v.statLabel}>atoms per serving (subscripts)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)' }}><CountUp value={servings * 3} /></div>
          <div className={v.statLabel}>total atoms</div>
        </div>
      </div>

      <div className={v.row}>
        <span className={v.muted}>Servings:</span>
        <div className={v.stepper}>
          <button type="button" className={v.stepBtn} onClick={() => setServings((c) => Math.max(1, c - 1))} disabled={servings <= 1} aria-label="Fewer servings">&minus;</button>
          <span className={v.stepValue}>{servings}</span>
          <button type="button" className={v.stepBtn} onClick={() => setServings((c) => Math.min(4, c + 1))} disabled={servings >= 4} aria-label="More servings">+</button>
        </div>
      </div>

      <p className={v.muted}>
        The recipe inside each plate never changes (2 H + 1 O). The coefficient just says how many whole servings you have - so {servings} &times; 3 = {servings * 3} atoms.
      </p>
    </div>
  );
}
