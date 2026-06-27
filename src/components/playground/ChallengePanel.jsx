import { useState } from 'react';
import styles from './ChallengePanel.module.css';

/**
 * Open-ended lab challenge card shown in the guide column. The guide poses a
 * "design an experiment / predict the outcome" task tied to the stage interactive;
 * the learner types their reasoning and the AI grades the thinking. Keeps the same
 * warm, exploratory tone as the rest of the lab.
 */
export default function ChallengePanel({ challenge, busy, grade, onSubmit, onNew, onDismiss }) {
  const [answer, setAnswer] = useState('');
  if (!challenge) return null;
  const graded = !!grade;

  return (
    <section className={styles.panel} aria-label="Lab challenge">
      <header className={styles.head}>
        <span className={styles.kind}>
          {challenge.kind === 'design' ? '\u{1F9EA} Design challenge' : '\u{1F52E} Predict challenge'}
        </span>
        <button type="button" className={styles.close} onClick={onDismiss} aria-label="Dismiss challenge">
          &times;
        </button>
      </header>

      <h3 className={styles.title}>{challenge.title}</h3>
      <p className={styles.scenario}>{challenge.scenario}</p>

      {!graded && (
        <>
          <textarea
            className={styles.textarea}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Explain your reasoning…"
            rows={3}
            disabled={busy}
            aria-label="Your reasoning"
          />
          <button
            type="button"
            className={styles.submit}
            onClick={() => onSubmit(answer)}
            disabled={busy || !answer.trim()}
          >
            {busy ? 'Grading…' : 'Submit reasoning'}
          </button>
        </>
      )}

      {graded && (
        <div className={grade.correct ? styles.feedbackOk : styles.feedbackBad} role="status" aria-live="polite">
          <div className={styles.gradeHead}>
            <span className={styles.badge}>Guide</span>
            {grade.score != null && (
              <span className={styles.scorePill}>
                {grade.correct ? 'Solid reasoning' : 'Almost'} &middot; {Math.round(grade.score * 100)}%
              </span>
            )}
          </div>
          <p className={styles.feedbackText}>{grade.feedback}</p>
          {grade.gaps?.length > 0 && (
            <p className={styles.gaps}>Tighten up: {grade.gaps.join(', ')}</p>
          )}
          <button type="button" className={styles.newBtn} onClick={onNew}>
            New challenge
          </button>
        </div>
      )}
    </section>
  );
}
