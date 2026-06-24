import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './PHScale.module.css';
import DragChip from './DragChip.jsx';
import { useSpring } from './lib/motion.js';

const ZONES = ['acidic', 'neutral', 'basic'];
const REASON = {
  acidic: 'pH below 7',
  neutral: 'pH of exactly 7',
  basic: 'pH above 7',
};
const PH_BY_ZONE = { acidic: 3, neutral: 7, basic: 11 };

/** Approximate universal-indicator color for a given pH (0-14). */
const UNIVERSAL = [
  '#e3342f', '#e3342f', '#ef4444', '#f97316', '#fb923c', '#f59e0b',
  '#c7d11a', '#4ade80', '#34d399', '#2dd4bf', '#22b8cf', '#3b82f6',
  '#6366f1', '#7c3aed', '#7c3aed',
];
function indicatorColor(ph) {
  const i = Math.max(0, Math.min(14, Math.round(ph)));
  return UNIVERSAL[i];
}

/** A CSS/SVG beaker whose liquid takes the universal-indicator color. */
function Beaker({ ph, label }) {
  const fill = useSpring(ph, { stiffness: 0.16 });
  const color = indicatorColor(ph);
  // liquid height grows slightly with pH just for visual life; mostly fixed
  const top = 30;
  return (
    <svg width="64" height="92" viewBox="0 0 64 92" role="img" aria-label={`${label || 'beaker'} indicator color`}>
      <path d="M14 6 H50 V58 Q50 84 32 84 Q14 84 14 58 Z" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <clipPath id="beaker-clip">
        <path d="M14 6 H50 V58 Q50 84 32 84 Q14 84 14 58 Z" />
      </clipPath>
      <g clipPath="url(#beaker-clip)">
        <rect x="12" y={top} width="40" height="60" fill={color} style={{ transition: 'fill 350ms ease' }} />
        <ellipse cx="32" cy={top} rx="20" ry="3.5" fill="#ffffff" opacity="0.18" />
      </g>
      <line x1="14" y1="6" x2="50" y2="6" stroke="var(--color-border-strong)" strokeWidth="2" />
      <text x="32" y="50" textAnchor="middle" fontSize="13" fontWeight="800" fill="#06210f">{Math.round(fill)}</text>
    </svg>
  );
}

/**
 * pH scale placement engine: assign each item to acidic / neutral / basic.
 * Used for the content slide (ungraded) and the pH check (graded).
 */
export default function PHScale({ items = [], graded = false, config = {}, onReady, onResult }) {
  const [assign, setAssign] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unassigned = items.filter((i) => assign[i.id] == null);
  const allAssigned = items.length > 0 && unassigned.length === 0;
  const allCorrect = items.every((i) => assign[i.id] === i.answer);

  const activeItem = items.find((i) => i.id === activeId) || null;
  const activePh = activeItem ? activeItem.ph ?? PH_BY_ZONE[activeItem.answer] ?? 7 : 7;
  const indicatorPh = useSpring(activePh, { stiffness: 0.14 });

  function assignTo(itemId, zone) {
    if (submitted || itemId == null) return;
    setAssign((p) => {
      const next = { ...p };
      if (zone === '__tray__') delete next[itemId];
      else next[itemId] = zone;
      return next;
    });
    if (zone !== '__tray__') setActiveId(itemId);
    setSelected(null);
  }

  function place(zone) {
    if (selected == null) return;
    assignTo(selected, zone);
  }

  function tapItem(itemId) {
    if (submitted) return;
    setActiveId(itemId);
    if (assign[itemId] != null) assignTo(itemId, '__tray__');
    else setSelected((cur) => (cur === itemId ? null : itemId));
  }

  function submit() {
    setSubmitted(true);
    onResult?.(allCorrect);
  }

  function reset() {
    setSubmitted(false);
    setAssign({});
    setSelected(null);
    onResult?.(false);
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={styles.scaleRow}>
        <Beaker ph={indicatorPh} label={activeItem?.label} />
        <div className={styles.scaleCol}>
          <div className={styles.bar} aria-hidden="true">
            <div className={styles.indicator} style={{ left: `${(indicatorPh / 14) * 100}%`, borderTopColor: indicatorColor(indicatorPh) }} />
          </div>
          <div className={styles.ticks} aria-hidden="true">
            <span>0</span>
            <span>7</span>
            <span>14</span>
          </div>
          <p className={v.muted} style={{ margin: '4px 0 0' }}>
            {activeItem ? `${activeItem.label}: pH ${activePh}` : 'Tap or place an item to read its pH'}
          </p>
        </div>
      </div>

      <div className={v.bins}>
        {ZONES.map((zone) => (
          <div key={zone} className={v.bin} data-dropzone={zone}>
            <button type="button" className={v.binLabel} onClick={() => place(zone)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              {zone}
            </button>
            <div className={v.binItems}>
              {items
                .filter((i) => assign[i.id] === zone)
                .map((i) => {
                  let cls = v.chip;
                  if (submitted) cls += assign[i.id] === i.answer ? ` ${v.chipSelected}` : '';
                  return (
                    <DragChip key={i.id} id={i.id} label={i.label} image={i.image} className={cls} disabled={submitted} onTap={tapItem} onDrop={assignTo} />
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {unassigned.length > 0 && (
        <div className={v.row} data-dropzone="__tray__">
          {unassigned.map((i) => (
            <DragChip
              key={i.id}
              id={i.id}
              label={i.label}
              image={i.image}
              className={selected === i.id ? `${v.chip} ${v.chipSelected}` : v.chip}
              disabled={submitted}
              onTap={tapItem}
              onDrop={assignTo}
            />
          ))}
        </div>
      )}

      {selected != null && <p className={v.muted}>Drag it to a zone, or tap acidic, neutral, or basic.</p>}

      {((graded && submitted) || (!graded && allAssigned)) && (
        <ul className={styles.explainList}>
          {items.map((i) => (
            <li key={i.id}>
              <strong>{i.label}</strong> is {i.answer} - it has a {REASON[i.answer]}.
            </li>
          ))}
        </ul>
      )}

      {graded &&
        (submitted ? (
          <div className={allCorrect ? v.feedbackOk : v.feedbackBad}>
            <p>{allCorrect ? config.feedbackCorrect : config.feedbackIncorrect}</p>
            {!allCorrect && config.hint && <p>Hint: {config.hint}</p>}
            {!allCorrect && (
              <button type="button" className={v.btn} onClick={reset} style={{ marginTop: 8 }}>Try again</button>
            )}
          </div>
        ) : (
          <button type="button" className={v.btnPrimary} onClick={submit} disabled={!allAssigned}>
            Check answer
          </button>
        ))}
    </div>
  );
}
