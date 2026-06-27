import { Link } from 'react-router-dom';
import { useLearnerMemory } from '../../ai/useLearnerMemory.js';
import { topMisconceptions } from '../../ai/memoryModel.js';
import styles from './MisconceptionReport.module.css';

/**
 * Surfaced "misconception report": the recurring conceptual errors the tutor has
 * detected and accumulated over time, each with a count and a one-tap targeted
 * practice link. Renders nothing until at least one misconception is tracked, so
 * it never shows an empty shell to new learners.
 */
export default function MisconceptionReport({ limit = 4 }) {
  const { memory } = useLearnerMemory();
  const items = topMisconceptions(memory, limit);
  if (!items.length) return null;

  return (
    <section className={styles.card} aria-label="Misconception report">
      <span className={styles.eyebrow}>Things to clear up</span>
      <ul className={styles.list}>
        {items.map((m) => (
          <li key={m.id} className={styles.item}>
            <div className={styles.itemText}>
              <span className={styles.label}>{m.label}</span>
              {m.topic && <span className={styles.topic}>{m.topic}</span>}
            </div>
            <div className={styles.right}>
              <span className={styles.count} title={`Seen ${m.count} time${m.count === 1 ? '' : 's'}`}>
                {m.count}&times;
              </span>
              <Link
                className={styles.fix}
                to={`/app/practice?topic=${encodeURIComponent(m.topic || m.label)}`}
              >
                Practice
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
