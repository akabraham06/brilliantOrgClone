import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './ChangeExplainer.module.css';

const O_COLOR = '#fb7185';
const H_COLOR = '#e2e8f0';
const VBW = 320;
const VBH = 150;
const CX = VBW / 2;
const CY = 74;

function Water({ x, y }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x - 11} y2={y - 9} stroke="var(--color-text-subtle)" strokeWidth="3" />
      <line x1={x} y1={y} x2={x + 11} y2={y - 9} stroke="var(--color-text-subtle)" strokeWidth="3" />
      <circle cx={x} cy={y} r="11" fill={O_COLOR} stroke="rgba(0,0,0,0.25)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">O</text>
      <circle cx={x - 11} cy={y - 9} r="6" fill={H_COLOR} stroke="rgba(0,0,0,0.25)" />
      <circle cx={x + 11} cy={y - 9} r="6" fill={H_COLOR} stroke="rgba(0,0,0,0.25)" />
    </g>
  );
}

function Diatomic({ x, y, color, label }) {
  return (
    <g>
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke="var(--color-text-subtle)" strokeWidth="3" />
      <circle cx={x - 9} cy={y} r="9" fill={color} stroke="rgba(0,0,0,0.25)" />
      <circle cx={x + 9} cy={y} r="9" fill={color} stroke="rgba(0,0,0,0.25)" />
      <text x={x - 9} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">{label}</text>
      <text x={x + 9} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0e0f13">{label}</text>
    </g>
  );
}

// Physical change: the SAME six water molecules go from a tight, ordered solid
// (left) to a looser liquid arrangement (right) when the change runs.
const ICE = [[66, 46], [100, 46], [66, 80], [100, 80], [66, 114], [100, 114]];
const LIQUID = [[206, 52], [250, 44], [284, 74], [214, 104], [256, 112], [288, 110]];

const MODES = {
  physical: {
    label: 'Physical change',
    before: 'Ice (solid)',
    after: 'Water (liquid)',
    note: 'Melting ice is a physical change: the H\u2082O molecules stay exactly the same, they just spread apart. Cooling reverses it easily.',
  },
  chemical: {
    label: 'Chemical change',
    before: 'Hydrogen + oxygen',
    after: 'Water (new substance)',
    note: 'Burning hydrogen in oxygen is a chemical change: bonds break and reform into brand-new water molecules. It is not easily reversed.',
  },
};

export default function ChangeExplainer({ onReady }) {
  const [mode, setMode] = useState('physical');
  const [after, setAfter] = useState(false);
  const [touched, setTouched] = useState(false); // has the learner run it yet?

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setTouched(true);
    setAfter((a) => !a);
  }

  function onArrowKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }

  const m = MODES[mode];

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Change type">
        {Object.keys(MODES).map((key) => (
          <button
            key={key}
            type="button"
            className={mode === key ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => { setMode(key); setAfter(false); setTouched(false); }}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 380 }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} role="img" aria-label={m.label}>
          <rect x="2" y="2" width={VBW - 4} height={VBH - 4} rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

          {mode === 'physical'
            ? ICE.map((p, i) => {
                const [sx, sy] = p;
                const [lx, ly] = LIQUID[i];
                return (
                  <g key={i} className={styles.mover} style={{ transform: after ? `translate(${lx - sx}px, ${ly - sy}px)` : 'translate(0,0)' }}>
                    <Water x={sx} y={sy} />
                  </g>
                );
              })
            : (
              <>
                <g className={styles.set} style={{ opacity: after ? 0 : 1, transform: after ? 'translateX(-14px)' : 'none' }}>
                  <Diatomic x={62} y={52} color={H_COLOR} label="H" />
                  <Diatomic x={62} y={104} color={H_COLOR} label="H" />
                  <Diatomic x={110} y={78} color={O_COLOR} label="O" />
                </g>
                <g className={styles.set} style={{ opacity: after ? 1 : 0, transform: after ? 'none' : 'translateX(14px)' }}>
                  <Water x={250} y={58} />
                  <Water x={250} y={110} />
                </g>
              </>
            )}

          {/* Clickable reaction arrow - the learner runs / reverses the change. */}
          <g
            role="button"
            tabIndex={0}
            aria-label={after ? `Reverse the ${m.label.toLowerCase()}` : `Run the ${m.label.toLowerCase()}`}
            className={styles.arrowBtn}
            onClick={toggle}
            onKeyDown={onArrowKey}
          >
            <circle cx={CX} cy={CY} r="22" className={`${styles.hit} ${!touched ? styles.invite : ''}`} />
            <g className={styles.arrowFlip} style={{ transform: after ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <line x1={CX - 14} y1={CY} x2={CX + 12} y2={CY} stroke="var(--accent-blue)" strokeWidth="3.5" strokeLinecap="round" />
              <path d={`M ${CX + 14} ${CY} l -9 -7 v 14 z`} fill="var(--accent-blue)" />
            </g>
          </g>
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>{after ? m.after : m.before}</div>
          <div className={v.statLabel}>{after ? 'after' : 'before'}</div>
        </div>
      </div>

      <p className={v.muted} style={{ maxWidth: 420, textAlign: 'center' }}>{m.note}</p>
      <p className={v.muted} style={{ fontSize: 'var(--text-xs)' }}>Tap the arrow to run and reverse the change.</p>
    </div>
  );
}
