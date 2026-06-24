import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './StabilityCardsScene.module.css';

const TARGET = 8;
const START = 5;
const ACX = 78; // atom centre x
const ACY = 96;
const AR = 46;
const HPX = 232; // hand pivot x
const HPY = 188;

/**
 * Bridges the "stability = a full hand" analogy: the atom's outer shell and a
 * hand of cards fill in lockstep. Each tap adds one electron AND one card; when
 * both reach a full set of 8 they glow together - a complete hand is a stable
 * octet. The shared counter makes the link between the two ideas explicit.
 */
export default function StabilityCardsScene({ onReady, savedState, onSaveState }) {
  const [count, setCount] = useState(savedState?.count ?? START);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const full = count >= TARGET;
  function set(n) {
    const next = Math.max(0, Math.min(TARGET, n));
    setCount(next);
    onSaveState?.({ count: next });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap} style={{ maxWidth: 340 }}>
        <svg viewBox="0 0 320 210" className={v.svg} role="img" aria-label={`Atom shell and card hand, ${count} of ${TARGET} filled`}>
          <defs>
            <radialGradient id="sc-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* ===== atom (left) ===== */}
          <g className={full ? s.glow : undefined}>
            <circle cx={ACX} cy={ACY} r={AR} fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
            <circle cx={ACX} cy={ACY} r="18" fill="rgba(167,139,250,0.22)" stroke="var(--accent-purple)" />
            <text x={ACX} y={ACY + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-text)">atom</text>
            {Array.from({ length: TARGET }).map((_, j) => {
              const a = (j / TARGET) * Math.PI * 2 - Math.PI / 2;
              const x = ACX + AR * Math.cos(a);
              const y = ACY + AR * Math.sin(a);
              const on = j < count;
              return (
                <circle
                  key={j}
                  className={s.dot}
                  cx={x}
                  cy={y}
                  r="6"
                  style={{
                    fill: full ? 'var(--accent-green)' : 'var(--accent-yellow)',
                    opacity: on ? 1 : 0.12,
                    transform: on ? 'scale(1)' : 'scale(0.5)',
                    transformOrigin: `${x}px ${y}px`,
                  }}
                />
              );
            })}
          </g>

          {/* ===== hand of cards (right) ===== */}
          <g className={full ? s.glow : undefined}>
            {Array.from({ length: TARGET }).map((_, j) => {
              const deg = (j - (TARGET - 1) / 2) * 10;
              const on = j < count;
              return (
                <g key={j} className={s.card} style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${HPX}px ${HPY}px` }}>
                  <rect
                    x={HPX - 13}
                    y={HPY - 96}
                    width="26"
                    height="40"
                    rx="5"
                    style={{
                      fill: on ? 'var(--color-surface)' : 'transparent',
                      stroke: on ? (full ? 'var(--accent-green)' : 'var(--color-border-strong)') : 'var(--color-border)',
                      strokeDasharray: on ? '0' : '4 3',
                      opacity: on ? 1 : 0.5,
                      transition: 'fill 300ms ease, stroke 300ms ease, opacity 300ms ease',
                    }}
                  />
                  {on && <circle cx={HPX} cy={HPY - 76} r="5" style={{ fill: full ? 'var(--accent-green)' : 'var(--accent-yellow)', transition: 'fill 300ms ease' }} />}
                </g>
              );
            })}
            <text x={HPX} y={HPY + 14} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--color-text)">hand</text>
          </g>
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: full ? 'var(--accent-green)' : 'var(--color-text)' }}>{count}/{TARGET}</div>
          <div className={v.statLabel}>electrons = cards</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => set(count - 1)} disabled={count <= 0}>
          Remove one
        </button>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => set(count + 1)} disabled={full}>
          Deal an electron + card
        </button>
      </div>

      <p className={full ? v.feedbackOk : v.muted}>
        {full
          ? 'A complete hand of 8 - and a full outer shell. Both are "complete sets", so the atom is stable and stops reacting.'
          : 'Each deal adds one electron to the shell and one card to the hand together. Fill all 8 to complete the set.'}
      </p>
    </div>
  );
}
