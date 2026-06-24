import { useState } from 'react';
import Formula from '../../interactions/Formula.jsx';
import styles from './Check.module.css';

/**
 * Functional multiple-choice check. Validates every question against its
 * answer, gives instant per-question feedback, and reports the overall result
 * to the player so the Next button can unlock on a fully-correct submission.
 *
 * `savedState` / `onSaveState` persist the learner's answers so returning to a
 * completed check shows their previous, graded answers (with a Try again
 * option, even when they got everything right).
 */
export default function MultipleChoiceCheck({ slide, onResult, savedState, onSaveState }) {
  const cfg = slide.checkConfig || {};
  const questions = cfg.questions || [];
  const [answers, setAnswers] = useState(savedState?.answers || {});
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);

  const allAnswered = questions.every((q) => answers[q.id] != null);
  const allCorrect = questions.every((q) => answers[q.id] === q.answer);

  function choose(qId, option) {
    if (submitted) return;
    setAnswers((prev) => {
      const next = { ...prev, [qId]: option };
      onSaveState?.({ answers: next, submitted: false });
      return next;
    });
  }

  function submit() {
    setSubmitted(true);
    onResult?.(allCorrect);
    onSaveState?.({ answers, submitted: true });
  }

  function tryAgain() {
    setSubmitted(false);
    setAnswers({});
    onResult?.(false);
    onSaveState?.({ answers: {}, submitted: false });
  }

  return (
    <div className={styles.check}>
      {questions.map((q) => (
        <fieldset key={q.id} className={styles.question}>
          <legend className={styles.prompt}>{q.prompt}</legend>
          <div className={styles.options}>
            {q.options.map((option) => {
              const selected = answers[q.id] === option;
              const isAnswer = option === q.answer;
              let cls = styles.option;
              if (submitted && isAnswer) cls += ` ${styles.correct}`;
              else if (submitted && selected && !isAnswer) cls += ` ${styles.incorrect}`;
              else if (selected) cls += ` ${styles.selected}`;
              return (
                <button
                  key={option}
                  type="button"
                  className={cls}
                  aria-pressed={selected}
                  onClick={() => choose(q.id, option)}
                >
                  <Formula value={option} />
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {submitted ? (
        <div
          className={allCorrect ? styles.feedbackOk : styles.feedbackBad}
          role="status"
        >
          <p>{allCorrect ? cfg.feedbackCorrect : cfg.feedbackIncorrect}</p>
          {!allCorrect && cfg.hint && <p className={styles.hint}>Hint: {cfg.hint}</p>}
          <button type="button" className={styles.tryAgain} onClick={tryAgain}>
            Try again
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.submit}
          onClick={submit}
          disabled={!allAnswered}
        >
          Check answer
        </button>
      )}
    </div>
  );
}
