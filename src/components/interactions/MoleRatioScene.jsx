import { useEffect, useState } from 'react';
import v from './viz.module.css';

/*
 * Coefficients are mole ratios. For 2H2 + O2 -> 2H2O, slide the batch size and
 * watch each species scale by the balanced 2 : 1 : 2 ratio - drawn as little
 * pseudo-3D molecule tokens that pop in and out as the amounts change.
 */

function Molecule({ kind }) {
  // kind: 'H2' | 'O2' | 'H2O' - tiny shaded ball-and-stick token
  const blue = 'var(--accent-blue)';
  const orange = 'var(--accent-orange)';
  if (kind === 'H2') {
    return (
      <svg className={v.popIn} width="40" height="26" viewBox="0 0 40 26" aria-hidden="true">
        <Shade />
        <line x1="13" y1="13" x2="27" y2="13" stroke="var(--color-text-subtle)" strokeWidth="3" />
        <Ball x={13} y={13} r={8} c={blue} t="H" />
        <Ball x={27} y={13} r={8} c={blue} t="H" />
      </svg>
    );
  }
  if (kind === 'O2') {
    return (
      <svg className={v.popIn} width="44" height="26" viewBox="0 0 44 26" aria-hidden="true">
        <Shade />
        <line x1="15" y1="13" x2="29" y2="13" stroke="var(--color-text-subtle)" strokeWidth="3" />
        <Ball x={15} y={13} r={10} c={orange} t="O" />
        <Ball x={29} y={13} r={10} c={orange} t="O" />
      </svg>
    );
  }
  return (
    <svg className={v.popIn} width="44" height="30" viewBox="0 0 44 30" aria-hidden="true">
      <Shade />
      <line x1="22" y1="11" x2="11" y2="22" stroke="var(--color-text-subtle)" strokeWidth="3" />
      <line x1="22" y1="11" x2="33" y2="22" stroke="var(--color-text-subtle)" strokeWidth="3" />
      <Ball x={22} y={11} r={9} c={orange} t="O" />
      <Ball x={11} y={22} r={6} c={blue} t="H" />
      <Ball x={33} y={22} r={6} c={blue} t="H" />
    </svg>
  );
}

function Shade() {
  return (
    <defs>
      <radialGradient id="mr-shade" cx="34%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
        <stop offset="34%" stopColor="#fff" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
      </radialGradient>
    </defs>
  );
}

function Ball({ x, y, r, c, t }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={c} stroke="rgba(0,0,0,0.3)" />
      <circle cx={x} cy={y} r={r} fill="url(#mr-shade)" />
      <text x={x} y={y + r * 0.35} textAnchor="middle" fontSize={r * 0.95} fontWeight="800" fill="#0e0f13">{t}</text>
    </g>
  );
}

function Group({ kind, n, color }) {
  return (
    <div style={{ flex: 1, minWidth: 92 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 60, alignItems: 'center' }}>
        {Array.from({ length: n }).map((_, i) => (
          <Molecule key={i} kind={kind} />
        ))}
      </div>
      <div className={v.stat}>
        <div className={v.statValue} style={{ color }}>{n}</div>
        <div className={v.statLabel}>mol {kind}</div>
      </div>
    </div>
  );
}

export default function MoleRatioScene({ onReady }) {
  const [batch, setBatch] = useState(1);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const h2 = 2 * batch;
  const o2 = 1 * batch;
  const h2o = 2 * batch;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>2 H&#8322; + O&#8322; &rarr; 2 H&#8322;O</div>

      <div className={v.row} style={{ alignItems: 'flex-start', gap: 'var(--space-2)', width: '100%' }}>
        <Group kind="H2" n={h2} color="var(--accent-blue)" />
        <span style={{ fontWeight: 800, alignSelf: 'center' }}>+</span>
        <Group kind="O2" n={o2} color="var(--accent-orange)" />
        <span style={{ fontWeight: 800, alignSelf: 'center' }}>&rarr;</span>
        <Group kind="H2O" n={h2o} color="var(--accent-green)" />
      </div>

      <label className={v.muted} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
        Batch size (&times;{batch})
        <input
          className={v.slider}
          type="range"
          min={1}
          max={4}
          step={1}
          value={batch}
          onChange={(e) => setBatch(Number(e.target.value))}
          aria-label="Reaction batch size"
        />
      </label>
      <p className={v.muted} style={{ textAlign: 'center' }}>The 2 : 1 : 2 ratio holds no matter how big the batch - double everything and the recipe is unchanged.</p>
    </div>
  );
}
