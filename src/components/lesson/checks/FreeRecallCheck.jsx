import { useState } from 'react';
import { aiEnabled } from '../../../firebase/ai.js';
import { gradeFreeResponse } from '../../../ai/gradeFreeResponse.js';
import checkStyles from './Check.module.css';
import styles from './FreeResponseCheck.module.css';

/**
 * Free-recall "brain dump" — effortful retrieval right before the lesson recap.
 *
 * Unlike a graded free-response question, this is intentionally NON-GATING: a
 * genuine attempt always satisfies the slide (onResult(true)). The pedagogical
 * value is the act of retrieving from memory before re-seeing the recap, not a
 * score (Karpicke & Roediger, 2008).
 *
 *  - AI ON  → the tutor reads the dump and names what was nailed vs. worth a
 *             second look, then the recap bullets are revealed for comparison.
 *  - AI OFF → a deterministic self-check: reveal the recap bullets as a checklist
 *             the learner ticks for what they remembered. Still active retrieval.
 *
 * Reads its config from `slide.checkConfig`: { prompt, recap[], objectives[] }.
 */
export default function FreeRecallCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide?.checkConfig || {};
  const recap = Array.isArray(cfg.recap) ? cfg.recap : [];
  const objectives = Array.isArray(cfg.objectives) ? cfg.objectives : [];
  const prompt =
    cfg.prompt || 'Without looking back, write everything you remember from this lesson.';
  const rubric = [...recap, ...objectives].join(' ');

  const [answer, setAnswer] = useState(savedState?.answer || '');
  const [status, setStatus] = useState(savedState?.status || 'idle'); // idle | grading | done
  const [grade, setGrade] = useState(savedState?.grade || null);
  const [checked, setChecked] = useState(savedState?.checked || {});

  function persist(next) {
    onSaveState?.({ answer, status, grade, checked, ...next });
  }

  async function submit() {
    if (!answer.trim() || status === 'grading' || status === 'done') return;

    // Retrieval attempt is the goal — always satisfy the slide.
    onResult?.(true);

    if (!aiEnabled) {
      setStatus('done');
      persist({ status: 'done' });
      return;
    }

    setStatus('grading');
    persist({ status: 'grading' });
    const result = await gradeFreeResponse({
      prompt,
      rubric,
      answer,
      slideContext: recap.join('\n'),
    });
    setGrade(result || null);
    setStatus('done');
    persist({ status: 'done', grade: result || null });
  }

  function toggle(i) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      persist({ checked: next });
      return next;
    });
  }

  const done = status === 'done';

  return (
    <div className={styles.fr}>
      <p className={styles.prompt}>{prompt}</p>

      <textarea
        className={styles.textarea}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          persist({ answer: e.target.value });
        }}
        placeholder="Dump everything you can recall — terms, ideas, examples…"
        rows={5}
        disabled={status === 'grading' || done}
        aria-label={prompt}
      />

      {status === 'idle' && (
        <button
          type="button"
          className={checkStyles.submit}
          onClick={submit}
          disabled={!answer.trim()}
        >
          Submit recall
        </button>
      )}

      {status === 'grading' && (
        <div className={checkStyles.aiThinking} role="status" aria-live="polite">
          <span className={checkStyles.aiDots}>
            <span />
            <span />
            <span />
          </span>
          Tutor is reading your recall…
        </div>
      )}

      {grade && (
        <div className={checkStyles.feedbackOk} role="status" aria-live="polite">
          <div className={styles.gradeHead}>
            <span className={checkStyles.badge}>Tutor</span>
          </div>
          <p className={styles.feedbackText}>{grade.feedback}</p>
          {grade.missedConcepts?.length > 0 && (
            <p className={styles.missed}>Worth another look: {grade.missedConcepts.join(', ')}</p>
          )}
        </div>
      )}

      {done && recap.length > 0 && (
        <div className={checkStyles.feedbackOk} role="status" aria-live="polite">
          <p className={styles.feedbackText}>
            {aiEnabled
              ? 'Now compare with the key ideas from this lesson:'
              : 'Tick each idea you recalled, then carry the rest into the recap:'}
          </p>
          <ul className={styles.recallList}>
            {recap.map((point, i) => (
              <li key={i} className={styles.recallRow}>
                {aiEnabled ? (
                  <span className={styles.recallItem}>{point}</span>
                ) : (
                  <label className={styles.recallItem}>
                    <input
                      type="checkbox"
                      checked={!!checked[i]}
                      onChange={() => toggle(i)}
                    />
                    <span>{point}</span>
                  </label>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
