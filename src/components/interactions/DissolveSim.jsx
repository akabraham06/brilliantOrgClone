import { useEffect, useState } from 'react';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Dissolving, at two scales at once. On the right, sugar cubes sit in a glass of
 * water; on the left, the same sugar is drawn as particles. Press "Stir" and
 * both animations run together: the cubes shrink away while the particles
 * spread out evenly - dissolving is mixing at the particle level.
 */

const PARTICLES = [
  { from: [66, 120], to: [32, 46] },
  { from: [80, 112], to: [74, 42] },
  { from: [92, 122], to: [116, 50] },
  { from: [70, 106], to: [40, 84] },
  { from: [86, 126], to: [82, 80] },
  { from: [60, 112], to: [122, 86] },
  { from: [98, 110], to: [34, 124] },
  { from: [78, 128], to: [78, 128] },
  { from: [68, 100], to: [120, 122] },
];

const CUBES = [
  [196, 126], [216, 130], [236, 126],
];

const lerp = (a, b, t) => a + (b - a) * t;

export default function DissolveSim({ onReady }) {
  const [stirred, setStirred] = useState(false);
  const t = useSpring(stirred ? 1 : 0, { stiffness: 0.08 });

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cubeSize = lerp(17, 0, t);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> stir and watch both views at once - the sugar cubes vanish into the
        water as the particles spread out evenly. Nothing is lost; it is just mixed too finely to see.
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 340 }}>
        <svg viewBox="0 0 300 170" className={v.svg} role="img" aria-label={stirred ? 'Sugar dissolved and spread through the water' : 'Sugar sitting undissolved in water'}>
          <defs>
            <radialGradient id="ds-shade" cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="36%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* LEFT: particle-level view */}
          <rect x="10" y="22" width="134" height="138" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />
          <text x="77" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-subtle)">particle view</text>
          {PARTICLES.map((p, i) => {
            const x = lerp(p.from[0], p.to[0], t);
            const y = lerp(p.from[1], p.to[1], t);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="7" fill="var(--accent-pink)" stroke="rgba(0,0,0,0.28)" />
                <circle cx={x} cy={y} r="7" fill="url(#ds-shade)" />
              </g>
            );
          })}

          {/* RIGHT: the glass of water */}
          <rect x="156" y="22" width="134" height="138" rx="12" fill="none" />
          <text x="223" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-subtle)">in the glass</text>
          <path d="M 178 44 H 268 L 260 150 Q 259 156 250 156 H 196 Q 187 156 186 150 Z" fill={`rgba(96,165,250,${0.12 + 0.12 * t})`} stroke="var(--color-border-strong)" strokeWidth="2" />
          {CUBES.map(([cx, cy], i) => (
            <g key={i} opacity={1 - t * 0.9}>
              <rect x={cx - cubeSize / 2} y={cy - cubeSize / 2} width={cubeSize} height={cubeSize} rx="2.5" fill="#f6f0e2" stroke="rgba(0,0,0,0.3)" />
            </g>
          ))}
        </svg>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setStirred((s) => !s)}>
          {stirred ? 'Reset' : 'Stir to dissolve'}
        </button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>
        {stirred ? 'Dissolved: the sugar is now spread evenly, so every sip tastes sweet.' : 'Sugar sits at the bottom - press stir to dissolve it.'}
      </p>
    </div>
  );
}
