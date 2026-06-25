import { useState } from 'react';
import styles from './Check.module.css';

/**
 * Reflection card for any check whose validationMode has no dedicated graded
 * component. Rather than fake a graded "pass", it simply presents the prompt to
 * reflect on and lets the learner continue. It is non-gating by design and does
 * not claim correctness.
 */
export default function CheckFallback({ slide, onResult }) {
  const cfg = slide.checkConfig || {};
  const [done, setDone] = useState(false);

  function complete() {
    setDone(true);
    // Non-gating: let the learner proceed. No correctness is asserted here.
    onResult?.(true);
  }

  return (
    <div className={styles.check}>
      {cfg.prompt && <p className={styles.hint}>{cfg.prompt}</p>}
      {cfg.hint && <p className={styles.hint}>Hint: {cfg.hint}</p>}

      {done ? (
        <div className={styles.feedbackOk} role="status">
          <p>Nice - keep going.</p>
        </div>
      ) : (
        <button type="button" className={styles.submit} onClick={complete}>
          Continue
        </button>
      )}
    </div>
  );
}
