import { useEffect, useRef, useState } from 'react';
import { ELEMENTS, CATEGORY_LABEL } from './elements.js';
import v from './viz.module.css';
import styles from './MiniPeriodicTable.module.css';

const CATEGORY_COLOR = {
  metal: 'var(--accent-orange)',
  nonmetal: 'var(--accent-blue)',
  metalloid: 'var(--accent-purple)',
};

/**
 * Mini periodic table of the first 20 elements laid out by real period/group.
 * Hover or tap an element to see its details; the shared row/column highlight
 * shows how groups and periods organize the table.
 *
 * When `interactionConfig.descriptions` holds more than one entry, the slide
 * shows them one at a time and cross-fades to the next when the learner presses
 * the global Next button (via `registerNextIntercept`) - letting a single slide
 * cover multiple ideas without leaving the table.
 */
export default function MiniPeriodicTable({ slide, onReady, registerNextIntercept }) {
  const [active, setActive] = useState(null);
  const descriptions = slide?.interactionConfig?.descriptions || null;
  const multiStage = Array.isArray(descriptions) && descriptions.length > 1;
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    if (!multiStage || !registerNextIntercept) return undefined;
    registerNextIntercept(() => {
      if (stageRef.current < descriptions.length - 1) {
        setStage((s) => s + 1);
        return true; // handled - stay on this slide and reveal the next idea
      }
      return false; // let the player advance normally
    });
    return () => registerNextIntercept(null);
  }, [multiStage, descriptions, registerNextIntercept]);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      {descriptions && (
        <>
          <div className={styles.descBox}>
            {descriptions.map((d, i) => (
              <p key={i} className={`${styles.desc} ${i === stage ? styles.descShow : ''}`} aria-hidden={i !== stage}>
                {d}
              </p>
            ))}
          </div>
          {multiStage && (
            <div className={styles.pager} aria-hidden="true">
              {descriptions.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === stage ? styles.dotActive : ''}`} />
              ))}
            </div>
          )}
        </>
      )}

      <div className={styles.grid}>
        {ELEMENTS.map((el) => {
          const related =
            active && (el.group === active.group || el.period === active.period);
          let cls = styles.cell;
          if (active?.number === el.number) cls += ` ${styles.cellActive}`;
          else if (related) cls += ` ${styles.cellRelated}`;
          return (
            <button
              key={el.number}
              type="button"
              className={cls}
              style={{ gridColumn: el.group, gridRow: el.period }}
              onMouseEnter={() => setActive(el)}
              onFocus={() => setActive(el)}
              onClick={() => setActive(el)}
              aria-label={`${el.name}, atomic number ${el.number}`}
            >
              <span className={styles.num}>{el.number}</span>
              <span className={styles.sym} style={{ color: CATEGORY_COLOR[el.category] }}>{el.symbol}</span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className={styles.detail}>
          <div className={styles.detailSymbol} style={{ color: CATEGORY_COLOR[active.category] }}>
            {active.symbol}
          </div>
          <div className={styles.detailGrid}>
            <div><span className={v.statLabel}>Name</span><div>{active.name}</div></div>
            <div><span className={v.statLabel}>Atomic number</span><div>{active.number}</div></div>
            <div><span className={v.statLabel}>Atomic mass</span><div>{active.mass}</div></div>
            <div><span className={v.statLabel}>Group / Period</span><div>{active.group} / {active.period}</div></div>
            <div><span className={v.statLabel}>Type</span><div style={{ color: CATEGORY_COLOR[active.category] }}>{CATEGORY_LABEL[active.category]}</div></div>
          </div>
        </div>
      ) : (
        <p className={v.muted}>
          {multiStage
            ? stage < descriptions.length - 1
              ? 'Tap any element to explore it - then press Next to reveal groups and periods.'
              : 'Tap elements in the same column (group), then the same row (period), to compare.'
            : 'Hover or tap an element to see its full details.'}
        </p>
      )}
    </div>
  );
}
