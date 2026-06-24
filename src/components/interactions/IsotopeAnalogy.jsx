import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './IsotopeAnalogy.module.css';

const NEUTRON = '#8b93a7';
const PROTON = 'var(--accent-orange)';
const PROTONS = 6; // Carbon - identity never changes in this analogy.
const MIN_N = 6;
const MAX_N = 8;

/**
 * Isotope analogy: the same backpacker (their identity = the proton count) can
 * carry different numbers of identical weights in their pack (the neutrons).
 * The person is always the same - only the total weight (mass number) changes.
 * That is exactly what an isotope is: same element, different mass.
 */
export default function IsotopeAnalogy({ onReady, savedState, onSaveState }) {
  const [neutrons, setNeutrons] = useState(savedState?.neutrons ?? MIN_N);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mass = PROTONS + neutrons;
  function change(delta) {
    setNeutrons((n) => {
      const next = Math.max(MIN_N, Math.min(MAX_N, n + delta));
      onSaveState?.({ neutrons: next });
      return next;
    });
  }

  // Lay weights out in a tidy 2-wide stack inside the pack.
  const weights = Array.from({ length: neutrons }, (_, i) => i);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap} style={{ maxWidth: 320 }}>
        <svg viewBox="0 0 300 220" className={v.svg} role="img" aria-label={`Carbon-${mass} backpacker carrying ${neutrons} weights`}>
          <defs>
            <radialGradient id="ia-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* ground */}
          <line x1="20" y1="196" x2="280" y2="196" stroke="var(--color-border-strong)" strokeWidth="2" />

          {/* the person - always identical (same identity = carbon) */}
          <g className={s.person}>
            <circle cx="120" cy="62" r="20" fill="var(--accent-blue)" />
            <circle cx="120" cy="62" r="20" fill="url(#ia-shade)" />
            <rect x="104" y="84" width="32" height="64" rx="14" fill="var(--accent-blue)" opacity="0.92" />
            <rect x="104" y="84" width="32" height="64" rx="14" fill="url(#ia-shade)" />
            {/* legs */}
            <rect x="108" y="146" width="10" height="44" rx="5" fill="#3a4356" />
            <rect x="122" y="146" width="10" height="44" rx="5" fill="#3a4356" />
            {/* identity badge */}
            <g>
              <rect x="96" y="52" width="20" height="20" rx="5" fill="#0e0f13" stroke={PROTON} strokeWidth="2" />
              <text x="106" y="66" textAnchor="middle" fontSize="12" fontWeight="800" fill={PROTON}>C</text>
            </g>
          </g>

          {/* the backpack - holds the neutron "weights" */}
          <rect x="138" y="86" width="54" height="74" rx="12" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
          {weights.map((i) => {
            const col = i % 2;
            const rowFromBottom = Math.floor(i / 2);
            const cx = 152 + col * 26;
            const cy = 148 - rowFromBottom * 22;
            return (
              <g key={i} className={s.weight}>
                <circle cx={cx} cy={cy} r="9" fill={NEUTRON} stroke="rgba(0,0,0,0.3)" />
                <circle cx={cx} cy={cy} r="9" fill="url(#ia-shade)" />
              </g>
            );
          })}
          <text x="165" y="78" textAnchor="middle" fontSize="11" fill="var(--color-text-subtle)">neutrons = weights</text>
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: PROTON }}>6</div>
          <div className={v.statLabel}>protons (identity: Carbon)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: NEUTRON }}>{neutrons}</div>
          <div className={v.statLabel}>neutrons (the pack)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)' }}>C-{mass}</div>
          <div className={v.statLabel}>mass number {6} + {neutrons}</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => change(-1)} disabled={neutrons <= MIN_N}>
          Remove a weight
        </button>
        <button type="button" className={v.btn} onClick={() => change(1)} disabled={neutrons >= MAX_N}>
          Add a weight
        </button>
      </div>

      <p className={v.muted}>
        Same backpacker, different load. Adding or removing weights (neutrons) changes the total mass - carbon-{mass} -
        but it is still <strong style={{ color: PROTON }}>Carbon</strong>, because the identity (6 protons) never changed. Those are isotopes.
      </p>
    </div>
  );
}
