import { useEffect, useState } from 'react';
import v from './viz.module.css';

const AVOGADRO = 6.022e23;

/**
 * What is a mole? Each shaded cluster stands for one mole - a fixed, enormous
 * group of particles. Slide the moles up and watch both the clusters and the
 * particle count grow by Avogadro's number, making "moles -> particles"
 * concrete without heavy math.
 */

function MoleCluster() {
  const dots = [[30, 14], [18, 24], [42, 24], [12, 38], [30, 36], [48, 38], [22, 50], [38, 50]];
  return (
    <svg className={v.popIn} width="64" height="76" viewBox="0 0 60 76" aria-hidden="true">
      <defs>
        <radialGradient id="mc-shade" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="36%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="33" r="29" fill="rgba(52,211,153,0.12)" stroke="var(--accent-green)" strokeOpacity="0.4" strokeDasharray="3 3" />
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5.5" fill="var(--accent-green)" stroke="rgba(0,0,0,0.25)" />
          <circle cx={x} cy={y} r="5.5" fill="url(#mc-shade)" />
        </g>
      ))}
      <text x="30" y="72" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text-subtle)">1 mol</text>
    </svg>
  );
}

export default function MoleConceptScene({ onReady }) {
  const [moles, setMoles] = useState(1);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', minHeight: 84, alignItems: 'center' }}>
        {Array.from({ length: moles }).map((_, mi) => (
          <MoleCluster key={mi} />
        ))}
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{moles}</div>
          <div className={v.statLabel}>mole{moles === 1 ? '' : 's'}</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--color-text-subtle)' }}>&times;6.022&times;10&sup2;&sup3;</div>
          <div className={v.statLabel}>per mole</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)', fontSize: 'var(--text-xl)' }}>
            {(moles * AVOGADRO).toExponential(3)}
          </div>
          <div className={v.statLabel}>particles</div>
        </div>
      </div>

      <input
        className={v.slider}
        type="range"
        min={1}
        max={8}
        value={moles}
        onChange={(e) => setMoles(Number(e.target.value))}
        aria-label="Number of moles"
      />
      <p className={v.muted} style={{ textAlign: 'center' }}>
        Each cluster is one mole. To go from moles to particles, multiply by Avogadro&rsquo;s number
        (6.022&times;10&sup2;&sup3;); to go back, divide.
      </p>
    </div>
  );
}
