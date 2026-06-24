import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './StateParticlesAnimator.module.css';

const ORDER = ['Solid', 'Liquid', 'Gas'];

const STATES = {
  Solid: { note: 'Particles are packed in a fixed pattern - they only vibrate in place.', amp: styles.ampLow, temp: 0.12, color: 'var(--accent-blue)' },
  Liquid: { note: 'Particles stay close but slide past one another - the shape flows.', amp: styles.ampMed, temp: 0.5, color: 'var(--accent-green)' },
  Gas: { note: 'Particles break free and zoom far apart in every direction.', amp: styles.ampHigh, temp: 0.92, color: 'var(--accent-orange)' },
};

// The SAME 12 particles are reused for every state so they glide between
// arrangements instead of popping - read as melting / evaporating.
const POSITIONS = {
  Solid: [
    [80, 55], [130, 55], [180, 55], [230, 55],
    [80, 95], [130, 95], [180, 95], [230, 95],
    [80, 135], [130, 135], [180, 135], [230, 135],
  ],
  Liquid: [
    [70, 60], [128, 52], [188, 62], [248, 54],
    [60, 100], [120, 96], [185, 104], [250, 98],
    [78, 140], [134, 136], [200, 144], [258, 132],
  ],
  Gas: [
    [40, 40], [110, 28], [185, 48], [262, 34],
    [70, 92], [150, 84], [232, 100], [292, 72],
    [48, 146], [128, 138], [208, 150], [280, 136],
  ],
};

export default function StateParticlesAnimator({ onReady }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = ORDER[idx];
  const pts = POSITIONS[state];
  const cfg = STATES[state];

  const heat = () => setIdx((i) => Math.min(ORDER.length - 1, i + 1));
  const freeze = () => setIdx((i) => Math.max(0, i - 1));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.row} style={{ alignItems: 'stretch', gap: 'var(--space-3)', width: '100%', justifyContent: 'center' }}>
        {/* thermometer */}
        <svg viewBox="0 0 40 180" width="40" height="180" role="img" aria-label={`Temperature: ${state}`}>
          <rect x="14" y="10" width="12" height="140" rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" />
          <rect
            x="14"
            y={10 + 140 * (1 - cfg.temp)}
            width="12"
            height={140 * cfg.temp}
            rx="6"
            fill={cfg.color}
            style={{ transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1)' }}
          />
          <circle cx="20" cy="158" r="14" fill={cfg.color} stroke="var(--color-border-strong)" style={{ transition: 'fill 0.9s' }} />
        </svg>

        <div className={v.svgWrap} style={{ maxWidth: 300, flex: 1 }}>
          <svg viewBox="0 0 300 180" className={v.svg} role="img" aria-label={`${state} particle arrangement`}>
            <rect x="6" y="6" width="288" height="168" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
            {pts.map(([x, y], i) => (
              <g key={i} className={styles.mover} style={{ transform: `translate(${x}px, ${y}px)` }}>
                <circle
                  r="9"
                  fill={cfg.color}
                  style={{ transition: 'fill 0.9s' }}
                  className={`${styles.particle} ${cfg.amp}`}
                />
                <circle r="9" fill="none" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Current state">
        {ORDER.map((s, i) => (
          <button key={s} type="button" className={i === idx ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setIdx(i)}>{s}</button>
        ))}
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={freeze} disabled={idx === 0}>&#10052; Freeze</button>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={heat} disabled={idx === ORDER.length - 1}>Heat &#128293;</button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>{cfg.note}</p>
    </div>
  );
}
