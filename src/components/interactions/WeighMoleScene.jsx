import { useEffect, useState } from 'react';
import { useSpring } from './lib/motion.js';
import Formula from './Formula.jsx';
import v from './viz.module.css';

/*
 * Molar mass made tangible: you cannot count atoms, but you can weigh them. Pick
 * a substance, press "Pour one mole", and watch powder fill the pan while the
 * balance reads up to exactly its molar mass in grams - that pile is one mole.
 */

const SUBSTANCES = {
  H2O: { label: 'H2O', mass: 18, color: 'var(--accent-blue)' },
  CO2: { label: 'CO2', mass: 44, color: 'var(--accent-orange)' },
  NaCl: { label: 'NaCl', mass: 58.5, color: 'var(--accent-purple)' },
};
const MAX_MASS = 60;

export default function WeighMoleScene({ onReady }) {
  const [key, setKey] = useState('H2O');
  const [poured, setPoured] = useState(false);
  const s = SUBSTANCES[key];

  const target = poured ? s.mass : 0;
  const grams = useSpring(target, { stiffness: 0.12 });
  const fill = (grams / MAX_MASS) * 46; // pan fill height in svg units

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(k) {
    setKey(k);
    setPoured(false);
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> weigh out one mole. Pour until the balance reads the substance&rsquo;s
        molar mass - that exact pile contains 6.022&times;10&sup2;&sup3; particles.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Choose a substance">
        {Object.keys(SUBSTANCES).map((k) => (
          <button key={k} type="button" className={key === k ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pick(k)}>
            <Formula value={SUBSTANCES[k].label} />
          </button>
        ))}
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 300 }}>
        <svg viewBox="0 0 240 170" className={v.svg} role="img" aria-label={`Balance reading ${grams.toFixed(1)} grams`}>
          {/* pan */}
          <path d="M 50 70 Q 120 70 190 70 L 175 116 Q 120 124 65 116 Z" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
          {/* powder fill */}
          <clipPath id="pan-clip">
            <path d="M 50 70 Q 120 70 190 70 L 175 116 Q 120 124 65 116 Z" />
          </clipPath>
          <g clipPath="url(#pan-clip)">
            <rect x="50" y={116 - fill} width="140" height={fill} fill={s.color} opacity="0.85" />
          </g>
          {/* stand + display */}
          <line x1="120" y1="70" x2="120" y2="40" stroke="var(--color-border-strong)" strokeWidth="3" />
          <rect x="78" y="126" width="84" height="34" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
          <text x="120" y="148" textAnchor="middle" fontSize="16" fontWeight="800" fill={poured && grams > s.mass - 0.3 ? 'var(--accent-green)' : 'var(--color-text)'}>
            {grams.toFixed(1)} g
          </text>
        </svg>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setPoured((p) => !p)}>
          {poured ? 'Empty the pan' : 'Pour one mole'}
        </button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>
        {poured ? (
          <>That&rsquo;s {s.mass} g of <Formula value={s.label} /> = exactly one mole = 6.022&times;10&sup2;&sup3; particles.</>
        ) : (
          <>Pour <Formula value={s.label} /> onto the pan until it reads its molar mass.</>
        )}
      </p>
    </div>
  );
}
