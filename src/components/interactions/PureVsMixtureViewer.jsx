import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './PureVsMixtureViewer.module.css';

const BLUE = 'var(--accent-blue)';
const COLORS = [
  'var(--accent-blue)',
  'var(--accent-pink)',
  'var(--accent-green)',
  'var(--accent-yellow)',
  'var(--accent-purple)',
  'var(--accent-orange)',
  'var(--accent-teal)',
  'var(--accent-blue)',
  'var(--accent-pink)',
];

// 3x3 lattice of particle "homes" inside the beaker.
const HOMES = [];
for (let r = 0; r < 3; r += 1) {
  for (let c = 0; c < 3; c += 1) {
    HOMES.push({ x: 96 + c * 24, y: 66 + r * 24 });
  }
}
// Gentle scatter applied only in the "mixture" state.
const JITTER = [
  [-6, 4], [5, -5], [-3, 6], [6, 3], [-5, -4], [4, 6], [-6, -3], [3, -6], [5, 4],
];

/**
 * Pure substance vs. mixture, toggled on click. A pure substance shows
 * identical particles in a neat lattice; tapping morphs it into a mixture of
 * different particles, gently scattered. Particle color + position transition
 * smoothly between the two states.
 */
export default function PureVsMixtureViewer({ onReady }) {
  const [mixed, setMixed] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <button
        type="button"
        className={s.card}
        onClick={() => setMixed((m) => !m)}
        aria-pressed={mixed}
        aria-label={mixed ? 'Mixture - tap to show a pure substance' : 'Pure substance - tap to show a mixture'}
      >
        <svg viewBox="0 0 240 170" className={s.svg} aria-hidden="true">
          <defs>
            <radialGradient id="pvm-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* beaker */}
          <path
            d="M 70 44 H 170 V 124 Q 170 150 120 150 Q 70 150 70 124 Z"
            fill="rgba(96,165,250,0.07)"
            stroke="var(--color-border-strong)"
            strokeWidth="2.5"
          />

          {HOMES.map((h, i) => {
            const [jx, jy] = JITTER[i];
            const color = mixed ? COLORS[i] : BLUE;
            return (
              <g
                key={i}
                className={s.particle}
                style={{ transform: mixed ? `translate(${jx}px, ${jy}px)` : 'translate(0,0)' }}
              >
                <circle cx={h.x} cy={h.y} r="11" fill={color} stroke="rgba(0,0,0,0.28)" className={s.dot} />
                <circle cx={h.x} cy={h.y} r="11" fill="url(#pvm-shade)" />
              </g>
            );
          })}
        </svg>
      </button>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)', color: mixed ? 'var(--accent-pink)' : 'var(--accent-blue)' }}>
            {mixed ? 'Mixture' : 'Pure substance'}
          </div>
          <div className={v.statLabel}>{mixed ? 'different particles, separable' : 'all identical particles'}</div>
        </div>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 420 }}>
        {mixed
          ? 'A mixture (like saltwater or air) contains more than one substance. The particles keep their own identities and can be separated again.'
          : 'A pure substance (an element or compound, like distilled water) is made of one kind of particle, identical throughout.'}
      </p>
      <p className={`${v.muted} ${s.hint}`}>Tap the beaker to switch between the two.</p>
    </div>
  );
}
