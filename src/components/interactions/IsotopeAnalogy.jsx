import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './IsotopeAnalogy.module.css';

const NEUTRON = '#8b93a7';
const PROTON = 'var(--accent-orange)';
const PROTON_HEX = '#fb923c';
const PROTONS = 6; // Carbon - identity never changes in this analogy.
const MIN_N = 6;
const MAX_N = 8;

// Real carbon isotopes - shown so the abstract count maps to something concrete.
const FACTS = {
  12: 'Carbon-12 is the most common form (~98.9%) and the mass standard. Stable.',
  13: 'Carbon-13 is a stable, rarer form (~1.1%).',
  14: 'Carbon-14 is radioactive - its slow decay powers radiocarbon dating.',
};

/** Golden-angle (phyllotaxis) packing so nucleons cluster tightly and evenly. */
function nucleonLayout(total) {
  const cx = 100;
  const cy = 100;
  const spacing = 15.5;
  return Array.from({ length: total }, (_, i) => {
    const angle = i * 2.399963;
    const rad = i === 0 ? 0 : spacing * Math.sqrt(i);
    return { x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle) };
  });
}

/**
 * Isotopes of carbon: the proton count (6) is the atom's identity and never
 * changes - it is always Carbon. Adding or removing neutrons only changes the
 * mass number (Carbon-12, -13, -14...). Toggle between a packed-nucleus view and
 * the backpacker-with-weights analogy.
 */
export default function IsotopeAnalogy({ onReady, savedState, onSaveState }) {
  const [neutrons, setNeutrons] = useState(savedState?.neutrons ?? MIN_N);
  const [view, setView] = useState('nucleus');

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

  // Nucleus: protons fill the center first (the unchanging identity core), then
  // neutrons pack around the outside, so adding mass visibly grows the shell.
  const positions = nucleonLayout(PROTONS + neutrons);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Same element, different mass.</strong> 6 protons means it is always Carbon - only the neutrons change.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Choose view">
        <button type="button" className={view === 'nucleus' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setView('nucleus')}>
          Nucleus
        </button>
        <button type="button" className={view === 'backpack' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setView('backpack')}>
          Backpack analogy
        </button>
      </div>

      {view === 'nucleus' ? (
        <div className={v.svgWrap} style={{ maxWidth: 260 }}>
          <svg viewBox="0 0 200 200" className={v.svg} role="img" aria-label={`Carbon-${mass} nucleus: 6 protons and ${neutrons} neutrons`}>
            <defs>
              <radialGradient id="nuc-shade" cx="34%" cy="30%" r="78%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="34%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
              </radialGradient>
            </defs>
            {positions.map((p, i) => {
              const isProton = i < PROTONS;
              return (
                <g key={i} className={`${v.popIn} ${v.sceneShadow}`}>
                  <circle cx={p.x} cy={p.y} r="13" fill={isProton ? PROTON_HEX : NEUTRON} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
                  <circle cx={p.x} cy={p.y} r="13" fill="url(#nuc-shade)" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0e0f13">{isProton ? '+' : 'n'}</text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className={v.svgWrap} style={{ maxWidth: 340 }}>
          <svg viewBox="0 0 320 236" className={v.svg} role="img" aria-label={`Carbon-${mass} backpacker carrying ${neutrons} weights`}>
            <defs>
              <radialGradient id="ia-shade" cx="34%" cy="30%" r="78%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="34%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
              </radialGradient>
            </defs>

            <line x1="24" y1="208" x2="296" y2="208" stroke="var(--color-border-strong)" strokeWidth="2" />

            {/* straps linking the figure to the backpack */}
            <path d="M118 92 Q150 86 170 96" fill="none" stroke="#3a4356" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
            <path d="M116 132 Q150 138 170 150" fill="none" stroke="#3a4356" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

            {/* the figure - its identity is Carbon, shown on a clear chest badge */}
            <g className={s.person}>
              <circle cx="98" cy="50" r="20" fill="var(--accent-blue)" />
              <circle cx="98" cy="50" r="20" fill="url(#ia-shade)" />
              <rect x="78" y="72" width="42" height="78" rx="16" fill="var(--accent-blue)" opacity="0.95" />
              <rect x="78" y="72" width="42" height="78" rx="16" fill="url(#ia-shade)" />
              <rect x="84" y="148" width="11" height="50" rx="5.5" fill="#3a4356" />
              <rect x="103" y="148" width="11" height="50" rx="5.5" fill="#3a4356" />
              {/* chest badge: the carbon "sign", high-contrast and clear of the head */}
              <rect x="82" y="92" width="34" height="34" rx="8" fill="var(--color-surface)" stroke={PROTON} strokeWidth="2.5" />
              <text x="99" y="115" textAnchor="middle" fontSize="20" fontWeight="800" fill={PROTON}>C</text>
            </g>
            <text x="99" y="226" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text)">Carbon = 6 protons</text>

            {/* the backpack of neutron "weights" */}
            <text x="200" y="80" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--color-text)">neutrons = weights</text>
            <rect x="166" y="90" width="68" height="92" rx="13" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
            {Array.from({ length: neutrons }, (_, i) => {
              const col = i % 2;
              const rowFromBottom = Math.floor(i / 2);
              const cx = 184 + col * 32;
              const cy = 166 - rowFromBottom * 20;
              return (
                <g key={i} className={s.weight}>
                  <circle cx={cx} cy={cy} r="10" fill={NEUTRON} stroke="rgba(0,0,0,0.3)" />
                  <circle cx={cx} cy={cy} r="10" fill="url(#ia-shade)" />
                </g>
              );
            })}
            <text x="200" y="226" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text)">{neutrons} neutrons → Carbon-{mass}</text>
          </svg>
        </div>
      )}

      <div className={v.legend}>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: PROTON_HEX }} /> proton (identity)</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: NEUTRON }} /> neutron (mass)</span>
      </div>

      <div className={v.readout} role="status" aria-live="polite">
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: PROTON }}>6</div>
          <div className={v.statLabel}>protons (Carbon)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: NEUTRON }}>{neutrons}</div>
          <div className={v.statLabel}>neutrons</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--color-text)' }}>{mass}</div>
          <div className={v.statLabel}>mass number (6 + {neutrons})</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)' }}>Carbon-{mass}</div>
          <div className={v.statLabel}>isotope</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => change(-1)} disabled={neutrons <= MIN_N}>
          Remove neutron
        </button>
        <button type="button" className={v.btn} onClick={() => change(1)} disabled={neutrons >= MAX_N}>
          Add neutron
        </button>
      </div>

      {FACTS[mass] && <p className={v.muted} style={{ textAlign: 'center' }}>{FACTS[mass]}</p>}

      <p className={v.muted} style={{ textAlign: 'center' }}>
        Changing neutrons makes <strong>Carbon-{mass}</strong>, but the element is still
        {' '}<strong style={{ color: PROTON }}>Carbon</strong> - identity is the 6 protons, and that never changes. Same element, different mass = isotopes.
      </p>
    </div>
  );
}
