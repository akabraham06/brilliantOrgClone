import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './StateParticlesAnimator.module.css';

function stateForTemp(t) {
  if (t < 34) return 'Solid';
  if (t < 67) return 'Liquid';
  return 'Gas';
}

// The SAME 12 particles are reused for every state so they glide (melt/boil)
// between arrangements instead of popping. Centered in a 300x180 stage.
const POSITIONS = {
  Solid: [
    [90, 55], [140, 55], [190, 55], [240, 55],
    [90, 95], [140, 95], [190, 95], [240, 95],
    [90, 135], [140, 135], [190, 135], [240, 135],
  ],
  Liquid: [
    [78, 62], [136, 54], [196, 64], [252, 56],
    [70, 102], [128, 98], [192, 106], [256, 100],
    [86, 142], [140, 138], [204, 146], [258, 134],
  ],
  Gas: [
    [44, 42], [112, 30], [186, 50], [258, 36],
    [72, 94], [150, 86], [228, 102], [284, 74],
    [52, 148], [128, 140], [206, 150], [276, 136],
  ],
};

const AMP = { Solid: styles.ampLow, Liquid: styles.ampMed, Gas: styles.ampHigh };
const COLOR = { Solid: 'var(--accent-blue)', Liquid: 'var(--accent-green)', Gas: 'var(--accent-orange)' };
const NOTE = {
  Solid: 'Cold: particles vibrate in a fixed, packed arrangement.',
  Liquid: 'Warmer: particles have enough energy to slide past each other.',
  Gas: 'Hot: particles break free and zoom around, filling the space.',
};

/**
 * Temperature slider that drives phase changes solid -> liquid -> gas. The same
 * particles glide smoothly between arrangements as the learner adds energy.
 */
export default function TemperatureSlider({ onReady }) {
  const [temp, setTemp] = useState(15);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = stateForTemp(temp);
  const pts = POSITIONS[state];

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap}>
        <svg viewBox="0 0 300 180" className={v.svg} role="img" aria-label={`${state} at temperature ${temp}`}>
          <rect x="6" y="6" width="288" height="168" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          {pts.map(([x, y], i) => (
            <g key={i} className={styles.mover} style={{ transform: `translate(${x}px, ${y}px)` }}>
              <circle
                r="9"
                fill={COLOR[state]}
                style={{ transition: 'fill 0.9s' }}
                className={`${styles.particle} ${AMP[state]}`}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-orange)' }}>{temp}&deg;</div>
          <div className={v.statLabel}>temperature</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)' }}>{state}</div>
          <div className={v.statLabel}>state of matter</div>
        </div>
      </div>

      <input className={v.slider} type="range" min={0} max={100} value={temp} onChange={(e) => setTemp(Number(e.target.value))} aria-label="Temperature" />
      <p className={v.muted} style={{ textAlign: 'center' }}>{NOTE[state]}</p>
    </div>
  );
}
