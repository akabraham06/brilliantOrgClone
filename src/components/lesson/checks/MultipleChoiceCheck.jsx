import { useEffect, useMemo, useRef, useState } from 'react';
import Formula from '../../interactions/Formula.jsx';
import { aiEnabled } from '../../../firebase/ai.js';
import { useTutor } from '../../../context/TutorContext.jsx';
import { buildCourseContext } from '../../../ai/courseContext.js';
import AdaptiveFeedback from '../../tutor/AdaptiveFeedback.jsx';
import styles from './Check.module.css';

const DEFAULT_HELP_AFTER = 2;
const HELP_SEED =
  'I keep getting this question wrong. Can you help me understand what I\u2019m missing?';

/**
 * Functional multiple-choice check. Validates every question against its
 * answer, gives instant per-question feedback, and reports the overall result
 * to the player so the Next button can unlock on a fully-correct submission.
 *
 * `savedState` / `onSaveState` persist the learner's answers so returning to a
 * completed check shows their previous, graded answers (with a Try again
 * option, even when they got everything right).
 */
export default function MultipleChoiceCheck({
  slide,
  onResult,
  savedState,
  onSaveState,
  helpAfterAttempts,
  lessonSlides,
}) {
  const cfg = slide.checkConfig || {};
  const questions = cfg.questions || [];
  const [answers, setAnswers] = useState(savedState?.answers || {});
  const [submitted, setSubmitted] = useState(savedState?.submitted || false);
  const { reportCheckOutcome, resetProactive, explainAtAnchor } = useTutor();

  // Compact summary of the lesson's analogies/exercises so the anchored
  // explanation can tie back to the same metaphors the learner just saw.
  const courseContext = useMemo(
    () => buildCourseContext({ lessonSlides, currentSlide: slide }),
    [lessonSlides, slide],
  );

  // DOM nodes of every option button, so the tutor can fly to the chosen one.
  const optionRefs = useRef({});
  const submitNoRef = useRef(0);

  const allAnswered = questions.every((q) => answers[q.id] != null);
  const allCorrect = questions.every((q) => answers[q.id] === q.answer);

  // Fresh proactive-help streak each time this check mounts (slide entry / regen).
  useEffect(() => {
    if (aiEnabled) resetProactive(slide.slideId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resolveThreshold(wrongList) {
    let base = Number.isFinite(helpAfterAttempts)
      ? helpAfterAttempts
      : Number.isFinite(cfg.helpAfterAttempts)
        ? cfg.helpAfterAttempts
        : DEFAULT_HELP_AFTER;
    const perQuestion = wrongList
      .map((w) => w.helpAfterAttempts)
      .filter((n) => Number.isFinite(n));
    if (perQuestion.length) base = Math.min(base, ...perQuestion);
    return Math.max(1, base);
  }

  const wrongs =
    submitted && !allCorrect
      ? questions
          .filter((q) => answers[q.id] !== q.answer)
          .map((q) => ({ prompt: q.prompt, selected: answers[q.id], correct: q.answer }))
      : [];

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

    if (!aiEnabled) return;

    // Now that the learner has fully attempted this check, the tutor glides over
    // to their chosen answer (the first wrong one, or the last when all correct)
    // and opens a tailored, in-depth explanation beside it.
    submitNoRef.current += 1;
    const anchorQ = allCorrect
      ? questions[questions.length - 1]
      : questions.find((q) => answers[q.id] !== q.answer);
    if (anchorQ) {
      const sel = answers[anchorQ.id];
      explainAtAnchor({
        key: `${slide.slideId}:mcq:${submitNoRef.current}`,
        anchorEl: optionRefs.current[`${anchorQ.id}::${sel}`] || null,
        context: {
          slide,
          kind: 'mcq',
          prompt: anchorQ.prompt,
          selected: sel,
          correct: anchorQ.answer,
          isCorrect: allCorrect,
          courseContext,
        },
      });
    }

    if (allCorrect) {
      reportCheckOutcome(slide.slideId, true);
      return;
    }
    const wrongList = questions
      .filter((q) => answers[q.id] !== q.answer)
      .map((q) => ({
        prompt: q.prompt,
        selected: answers[q.id],
        correct: q.answer,
        helpAfterAttempts: q.helpAfterAttempts,
      }));
    const first = wrongList[0];
    reportCheckOutcome(slide.slideId, false, {
      threshold: resolveThreshold(wrongList),
      seedPrompt: HELP_SEED,
      event: first
        ? {
            prompt: first.prompt,
            selected: first.selected,
            correct: first.correct,
            slideId: slide.slideId,
          }
        : null,
    });
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
                  ref={(el) => {
                    optionRefs.current[`${q.id}::${option}`] = el;
                  }}
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
          {!allCorrect &&
            (aiEnabled ? (
              <AdaptiveFeedback slide={slide} wrongs={wrongs} fallbackHint={cfg.hint} />
            ) : (
              cfg.hint && <p className={styles.hint}>Hint: {cfg.hint}</p>
            ))}
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
