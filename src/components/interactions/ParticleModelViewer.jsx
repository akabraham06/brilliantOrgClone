import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './ParticleModelViewer.module.css';

const O = 'var(--accent-blue)';
const RED = 'var(--accent-pink)';
const WHITE = '#e9edf7';
const NA = 'var(--accent-purple)';
const CL = 'var(--accent-green)';
const NUT = 'var(--accent-orange)';

// Each substance: a classification + a list of molecules (atoms with offsets).
const SUBSTANCES = {
  Oxygen: {
    type: 'Element',
    note: 'One kind of atom, bonded in pairs (O\u2082).',
    molecules: [[{ c: O, dx: -7 }, { c: O, dx: 7 }]],
    repeat: 4,
  },
  Water: {
    type: 'Compound',
    note: 'Different atoms bonded together (H\u2082O).',
    molecules: [[{ c: RED, r: 11 }, { c: WHITE, dx: -11, dy: 8, r: 6 }, { c: WHITE, dx: 11, dy: 8, r: 6 }]],
    repeat: 4,
  },
  Saltwater: {
    type: 'Mixture',
    note: 'Water plus dissolved ions, physically combined.',
    molecules: [
      [{ c: RED, r: 11 }, { c: WHITE, dx: -11, dy: 8, r: 6 }, { c: WHITE, dx: 11, dy: 8, r: 6 }],
      [{ c: NA, r: 9 }],
      [{ c: CL, r: 10 }],
    ],
    repeat: 2,
  },
  'Trail mix': {
    type: 'Mixture',
    note: 'Different things mixed but not bonded.',
    molecules: [[{ c: NUT, r: 12 }], [{ c: CL, r: 9 }], [{ c: RED, r: 10 }], [{ c: WHITE, r: 8 }]],
    repeat: 2,
  },
};

export default function ParticleModelViewer({ onReady }) {
  const [active, setActive] = useState('Oxygen');

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub = SUBSTANCES[active];
  const molecules = [];
  for (let r = 0; r < sub.repeat; r += 1) molecules.push(...sub.molecules);

  const cols = 4;
  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a substance">
        {Object.keys(SUBSTANCES).map((name) => (
          <button
            key={name}
            type="button"
            className={active === name ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => setActive(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={v.svgWrap}>
        <svg viewBox="0 0 320 160" className={v.svg} role="img" aria-label={`${active} particles`}>
          {/* Re-keyed by substance so the molecules pop in fresh on each toggle. */}
          <g key={active}>
            {molecules.slice(0, 8).map((mol, mi) => {
              const gx = 50 + (mi % cols) * 72;
              const gy = 50 + Math.floor(mi / cols) * 70;
              return (
                <g key={mi} className={s.mol} style={{ animationDelay: `${mi * 0.05}s, ${0.5 + mi * 0.12}s` }}>
                  {mol.length > 1 &&
                    mol.slice(1).map((a, ai) => (
                      <line key={ai} x1={gx} y1={gy} x2={gx + (a.dx || 0)} y2={gy + (a.dy || 0)} stroke="var(--color-border-strong)" strokeWidth="3" />
                    ))}
                  {mol.map((a, ai) => (
                    <circle key={ai} cx={gx + (a.dx || 0)} cy={gy + (a.dy || 0)} r={a.r || 8} fill={a.c} stroke="rgba(0,0,0,0.25)" />
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)' }}>{sub.type}</div>
          <div className={v.statLabel}>{active}</div>
        </div>
      </div>
      <p className={v.muted}>{sub.note}</p>
    </div>
  );
}
