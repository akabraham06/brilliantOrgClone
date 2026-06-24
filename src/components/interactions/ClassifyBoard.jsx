import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './ClassifyBoard.module.css';
import DragChip from './DragChip.jsx';
import Formula from './Formula.jsx';

const PARTICLE_TYPES = ['element', 'compound', 'mixture'];

/** Derive a particle category for the flip reveal (explicit field or answer). */
function particleType(item) {
  if (item.particle && PARTICLE_TYPES.includes(item.particle)) return item.particle;
  const a = String(item.answer || '').toLowerCase();
  return PARTICLE_TYPES.find((t) => a.includes(t)) || null;
}

/** A tiny particle diagram: lone atoms, a bonded molecule, or a mixture. */
function ParticleGlyph({ type }) {
  const dot = (x, y, color) => (
    <g>
      <circle cx={x} cy={y} r="7" fill={color} stroke="rgba(0,0,0,0.3)" />
      <circle cx={x} cy={y} r="7" fill="url(#cb-shade)" />
    </g>
  );
  const B = 'var(--accent-blue)';
  const P = 'var(--accent-pink)';
  const G = 'var(--accent-green)';
  return (
    <svg width="92" height="38" viewBox="0 0 92 38" aria-hidden="true">
      <defs>
        <radialGradient id="cb-shade" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      {type === 'element' && [dot(20, 19, B), dot(46, 19, B), dot(72, 19, B)]}
      {type === 'compound' && (
        <>
          <line x1="34" y1="19" x2="58" y2="19" stroke="var(--color-text-subtle)" strokeWidth="3" />
          {dot(34, 19, B)}
          {dot(58, 19, P)}
        </>
      )}
      {type === 'mixture' && (
        <>
          <line x1="22" y1="14" x2="40" y2="14" stroke="var(--color-text-subtle)" strokeWidth="2.5" />
          {dot(22, 14, B)}
          {dot(40, 14, P)}
          {dot(66, 12, G)}
          {dot(58, 28, B)}
          {dot(78, 28, P)}
        </>
      )}
    </svg>
  );
}

/** Placed chip that flips to reveal its particle diagram shortly after mount. */
function FlipChip({ item, type, onTap }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setFlipped(true), 260);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className={`${styles.flip} ${styles.dropIn}`}>
      <button type="button" className={`${styles.flipInner} ${flipped ? styles.flipped : ''}`} onClick={() => onTap(item.id)} aria-label={`${item.label}: ${type}. Tap to remove.`}>
        <span className={`${styles.face} ${styles.front}`}>
          {item.image && <img src={item.image} alt="" className={styles.faceImg} />}
          <Formula value={item.label} />
        </span>
        <span className={`${styles.face} ${styles.back}`}>
          <ParticleGlyph type={type} />
          <span className={styles.caption}>{type}</span>
        </span>
      </button>
    </div>
  );
}

/**
 * Reusable classification activity: drag an item onto a category bin, or tap an
 * item then tap a bin (keyboard/touch fallback). Powers content sorting
 * (MatterSortBoard, BondTypeClassifier) and the classify check (graded). When
 * graded, validates item.answer === category.
 */
export default function ClassifyBoard({
  items = [],
  categories = [],
  graded = false,
  config = {},
  onReady,
  onResult,
  savedState,
  onSaveState,
}) {
  const [assignments, setAssignments] = useState(savedState?.assignments || {});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);

  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unassigned = items.filter((i) => assignments[i.id] == null);
  const allAssigned = items.length > 0 && unassigned.length === 0;
  const allCorrect = items.every((i) => assignments[i.id] === i.answer);

  function assign(itemId, category) {
    if (submitted || itemId == null) return;
    setAssignments((prev) => {
      const next = { ...prev };
      if (category === '__tray__') delete next[itemId];
      else next[itemId] = category;
      onSaveState?.({ assignments: next, submitted: false });
      return next;
    });
    setSelected(null);
  }

  // Tap on a bin label places the currently-selected item there.
  function placeInto(category) {
    if (selected == null) return;
    assign(selected, category);
  }

  // Tap an unassigned chip selects it; tap a placed chip returns it to the tray.
  function tapItem(itemId) {
    if (submitted) return;
    if (assignments[itemId] != null) assign(itemId, '__tray__');
    else setSelected((cur) => (cur === itemId ? null : itemId));
  }

  function submit() {
    setSubmitted(true);
    onResult?.(allCorrect);
    onSaveState?.({ assignments, submitted: true });
  }

  function reset() {
    setSubmitted(false);
    setAssignments({});
    setSelected(null);
    onResult?.(false);
    onSaveState?.({ assignments: {}, submitted: false });
  }

  function itemClass(itemId) {
    const correct = items.find((i) => i.id === itemId)?.answer;
    let cls = `${v.chip} ${styles.dropIn}`;
    if (submitted && assignments[itemId] === correct) cls += ` ${v.chipSelected}`;
    return cls;
  }

  // Reveal the particle diagram once placed (ungraded) or when correct (graded).
  function shouldReveal(item) {
    const type = particleType(item);
    if (!type) return false;
    return graded ? submitted && assignments[item.id] === item.answer : true;
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.bins}>
        {categories.map((cat) => (
          <div key={cat} className={`${v.bin} ${styles.trayInner}`} data-dropzone={cat}>
            <button
              type="button"
              className={v.binLabel}
              onClick={() => placeInto(cat)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {cat}
            </button>
            <div className={v.binItems}>
              {items
                .filter((i) => assignments[i.id] === cat)
                .map((i) =>
                  shouldReveal(i) ? (
                    <FlipChip key={i.id} item={i} type={particleType(i)} onTap={submitted ? () => {} : tapItem} />
                  ) : (
                    <DragChip
                      key={i.id}
                      id={i.id}
                      label={<Formula value={i.label} />}
                      image={i.image}
                      className={itemClass(i.id)}
                      disabled={submitted}
                      onTap={tapItem}
                      onDrop={assign}
                    />
                  ),
                )}
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
              label={<Formula value={i.label} />}
              image={i.image}
              className={selected === i.id ? `${v.chip} ${v.chipSelected}` : v.chip}
              disabled={submitted}
              onTap={tapItem}
              onDrop={assign}
            />
          ))}
        </div>
      )}

      {selected != null && (
        <p className={v.muted}>Drag it to a bin, or tap a category above to place it.</p>
      )}

      {graded && (
        submitted ? (
          <div className={allCorrect ? v.feedbackOk : v.feedbackBad}>
            <p>{allCorrect ? config.feedbackCorrect : config.feedbackIncorrect}</p>
            {!allCorrect && config.hint && <p>Hint: {config.hint}</p>}
            <button type="button" className={v.btn} onClick={reset} style={{ marginTop: 8 }}>
              Try again
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`${v.btn} ${v.btnPrimary}`}
            onClick={submit}
            disabled={!allAssigned}
          >
            Check answer
          </button>
        )
      )}
    </div>
  );
}
