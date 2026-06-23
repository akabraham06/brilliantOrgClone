import { useState } from 'react';
import styles from './Check.module.css';

/**
 * Temporary check renderer for validation modes whose dedicated interactive
 * components (classify, matching, balance, pHPlacement) are built in Phase 5.
 * It surfaces the check's intent and lets the learner confirm understanding so
 * the player's gating flow works end-to-end today.
 */
export default function CheckFallback({ slide, onResult }) {
  const cfg = slide.checkConfig || {};
  const [done, setDone] = useState(false);

  function complete() {
    setDone(true);
    onResult?.(true);
  }

  return (
    <div className={styles.check}>
      <div className={styles.fallbackNote}>
        <span className={styles.badge}>{cfg.validationMode || 'check'}</span>
        <p>The interactive version of this check arrives in the next build.</p>
      </div>

      {cfg.hint && <p className={styles.hint}>Hint: {cfg.hint}</p>}

      {done ? (
        <div className={styles.feedbackOk} role="status">
          <p>{cfg.feedbackCorrect || 'Nice work!'}</p>
        </div>
      ) : (
        <button type="button" className={styles.submit} onClick={complete}>
          Mark as understood
        </button>
      )}
    </div>
  );
}
