import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './PHScale.module.css';
import DragChip from './DragChip.jsx';
import { useSpring } from './lib/motion.js';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  ReducedMotionConfig,
  placeSpring,
  revealVariants,
} from './lib/Motion.jsx';

const ZONES = ['acidic', 'neutral', 'basic'];

// Graded reveal: each placed chip fades up in a short stagger (opacity only, so
// it never fights the layout transform that drops it into / out of a zone).
const placedChipVariants = {
  placed: { opacity: 1 },
  graded: (idx) => ({ opacity: [0.5, 1], transition: { delay: idx * 0.06, duration: 0.35 } }),
};
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
    <svg width="64" height="92" viewBox="0 0 64 92" role="img" aria-label={`${label || 'beaker'} indicator color`} className={v.sceneShadow}>
      <path d="M14 6 H50 V58 Q50 84 32 84 Q14 84 14 58 Z" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <clipPath id="beaker-clip">
        <path d="M14 6 H50 V58 Q50 84 32 84 Q14 84 14 58 Z" />
      </clipPath>
      <g clipPath="url(#beaker-clip)">
        <rect x="12" y={top} width="40" height="60" fill={color} style={{ transition: 'fill 350ms ease' }} />
        <ellipse cx="32" cy={top} rx="20" ry="3.5" fill="#ffffff" opacity="0.18" />
      </g>
      <line x1="14" y1="6" x2="50" y2="6" stroke="var(--color-border-strong)" strokeWidth="2" />
      <text x="32" y="50" textAnchor="middle" fontSize="13" fontWeight="800" fill="#ffffff" stroke="rgba(0,0,0,0.65)" strokeWidth="0.7" paintOrder="stroke">{Math.round(fill)}</text>
    </svg>
  );
}

/**
 * pH scale placement engine: assign each item to acidic / neutral / basic.
 * Used for the content slide (ungraded) and the pH check (graded).
 */
export default function PHScale({ items = [], graded = false, config = {}, onReady, onResult, savedState, onSaveState }) {
  const [assign, setAssign] = useState(() => savedState?.assign || {});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(() => savedState?.submitted || false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist board state so navigating away / refreshing doesn't wipe a
  // progress-gating check (matches the other graded checks' contract).
  useEffect(() => {
    onSaveState?.({ assign, submitted });
  }, [assign, submitted, onSaveState]);

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
    // Keep the placements that were correct; only the wrong ones return to the
    // tray to be re-tried (non-destructive retry).
    setAssign((p) => {
      const kept = {};
      items.forEach((i) => {
        if (p[i.id] === i.answer) kept[i.id] = p[i.id];
      });
      return kept;
    });
    setSelected(null);
    onResult?.(false);
  }

  return (
    <ReducedMotionConfig>
    <LayoutGroup>
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={`${v.panel} ${v.panelWide}`}>
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
                .map((i, idx) => {
                  const correct = assign[i.id] === i.answer;
                  let cls = v.chip;
                  if (submitted) cls += correct ? ` ${styles.chipCorrect}` : ` ${styles.chipWrong}`;
                  const label = submitted ? `${i.label} ${correct ? '\u2713' : '\u2717'}` : i.label;
                  return (
                    // layoutId shared with the tray chip: framer slides the chip
                    // into the zone (and back to the tray on a non-destructive
                    // retry) instead of teleporting. Additive wrapper around DragChip.
                    <motion.div
                      key={i.id}
                      layout
                      layoutId={`ph-${i.id}`}
                      custom={idx}
                      variants={placedChipVariants}
                      animate={submitted ? 'graded' : 'placed'}
                      transition={placeSpring}
                    >
                      <DragChip id={i.id} label={label} image={i.image} className={cls} disabled={submitted} onTap={tapItem} onDrop={assignTo} />
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {unassigned.length > 0 && (
          <motion.div
            className={v.row}
            data-dropzone="__tray__"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {unassigned.map((i) => (
              <motion.div key={i.id} layout layoutId={`ph-${i.id}`} transition={placeSpring}>
                <DragChip
                  id={i.id}
                  label={i.label}
                  image={i.image}
                  className={selected === i.id ? `${v.chip} ${v.chipSelected}` : v.chip}
                  disabled={submitted}
                  selected={selected === i.id}
                  onTap={tapItem}
                  onDrop={assignTo}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selected != null && <p className={v.muted}>Drag it to a zone, or tap acidic, neutral, or basic.</p>}

      <AnimatePresence>
        {((graded && submitted) || (!graded && allAssigned)) && (
          <motion.ul
            className={styles.explainList}
            variants={revealVariants}
            initial="hidden"
            animate="shown"
            exit="exit"
            transition={placeSpring}
          >
            {items.map((i) => (
              <li key={i.id}>
                <strong>{i.label}</strong> is {i.answer} - it has a {REASON[i.answer]}.
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {graded &&
        (submitted ? (
          <div className={allCorrect ? v.feedbackOk : v.feedbackBad} role="status" aria-live="polite">
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
    </LayoutGroup>
    </ReducedMotionConfig>
  );
}
