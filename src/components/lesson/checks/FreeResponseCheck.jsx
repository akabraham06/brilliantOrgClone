import { useEffect, useRef, useState } from 'react';
import { aiEnabled } from '../../../firebase/ai.js';
import { gradeFreeResponse } from '../../../ai/gradeFreeResponse.js';
import { useTutor } from '../../../context/TutorContext.jsx';
import checkStyles from './Check.module.css';
import styles from './FreeResponseCheck.module.css';

const DEFAULT_HELP_AFTER = 2;
const HELP_SEED =
  'I keep getting this question wrong. Can you help me understand what I\u2019m missing?';

/**
 * A single free-response question: textarea + submit, AI-graded with warm,
 * specific feedback. Reports the outcome via onResult(correct) and (optionally)
 * a richer onGraded({ questionId, correct, score, firstAttempt, missedConcepts, answer }).
 *
 * Degrades gracefully:
 *  - AI OFF        → a non-gating self-check: the learner writes an answer, then
 *                    reveals "what a strong answer covers" (the rubric) and may
 *                    continue (onResult(true)). Keeps non-AI users fully unblocked.
 *  - AI grade fails → same non-gating self-check fallback.
 *
 * Usable standalone via the CHECKS registry (reads slide.checkConfig) or embedded
 * in SkillCheck via the `question` prop.
 *
 * `tutorAssist` opts a lesson surface into the same AI tutor hooks MCQ uses — an
 * anchored deep-explanation beside the answer and proactive wrong-streak help.
 * Off by default so the standalone Practice usage is unchanged. Only fires on a
 * REAL grade verdict (never the AI-off / grade-failure self-check fallbacks).
 */
export default function FreeResponseCheck({
  slide,
  question,
  slideContext,
  onResult,
  onGraded,
  savedState,
  onSaveState,
  autoFocus = false,
  tutorAssist = false,
  helpAfterAttempts = DEFAULT_HELP_AFTER,
}) {
  const q = question || slide?.checkConfig || {};
  const questionId = q.id || slide?.slideId || 'fr';
  const rubric = q.rubric || '';
  const context = slideContext || slide?.bodyText || '';

  const [answer, setAnswer] = useState(savedState?.answer || '');
  const [status, setStatus] = useState(savedState?.status || 'idle'); // idle|grading|graded|selfcheck
  const [grade, setGrade] = useState(savedState?.grade || null);
  const [attempts, setAttempts] = useState(savedState?.attempts || 0);

  const { reportCheckOutcome, explainAtAnchor, resetProactive } = useTutor();
  // The chosen-answer element the tutor's anchored explanation flies to.
  const textareaRef = useRef(null);
  const tutorSubmitRef = useRef(0);
  // Stable per-question key for the proactive-help streak + anchored explain,
  // composed with the host slide so it never collides with the slide's MCQ.
  const tutorKey = slide?.slideId ? `${slide.slideId}:fr:${questionId}` : questionId;

  // Fresh proactive-help streak each time this check mounts (slide entry / regen).
  useEffect(() => {
    if (tutorAssist && aiEnabled) resetProactive(tutorKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next) {
    onSaveState?.({ answer, status, grade, attempts, ...next });
  }

  async function submit() {
    if (!answer.trim() || status === 'grading') return;
    const firstAttempt = attempts === 0;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (!aiEnabled) {
      // Non-gating self-check: let them proceed and self-assess against the rubric.
      setStatus('selfcheck');
      onResult?.(true);
      onGraded?.({ questionId, correct: true, score: null, firstAttempt, selfCheck: true });
      persist({ status: 'selfcheck', attempts: nextAttempts });
      return;
    }

    setStatus('grading');
    persist({ status: 'grading', attempts: nextAttempts });
    const result = await gradeFreeResponse({
      prompt: q.prompt,
      rubric,
      answer,
      slideContext: context,
    });

    if (!result) {
      // AI couldn't grade — fall back to the non-gating self-check.
      setStatus('selfcheck');
      onResult?.(true);
      onGraded?.({ questionId, correct: true, score: null, firstAttempt, selfCheck: true });
      persist({ status: 'selfcheck', attempts: nextAttempts });
      return;
    }

    setGrade(result);
    setStatus('graded');
    onResult?.(result.correct);
    onGraded?.({
      questionId,
      correct: result.correct,
      score: result.score,
      firstAttempt,
      missedConcepts: result.missedConcepts,
      answer,
    });
    persist({ status: 'graded', grade: result, attempts: nextAttempts });

    if (!tutorAssist) return;
    // Mirror MCQ: glide the tutor to the answer with a tailored deep explanation,
    // and drive proactive wrong-streak help. A per-submit key lets each fresh
    // attempt explain again without re-firing on re-render.
    tutorSubmitRef.current += 1;
    explainAtAnchor({
      key: `${tutorKey}:${tutorSubmitRef.current}`,
      anchorEl: textareaRef.current || null,
      context: {
        slide,
        kind: 'fr',
        prompt: q.prompt,
        selected: answer,
        correct: rubric,
        isCorrect: result.correct,
        reveal: result.feedback,
      },
    });
    reportCheckOutcome(tutorKey, result.correct, {
      threshold: Math.max(1, helpAfterAttempts || DEFAULT_HELP_AFTER),
      seedPrompt: HELP_SEED,
      event: result.correct
        ? null
        : { prompt: q.prompt, selected: answer, correct: rubric, slideId: tutorKey },
    });
  }

  function tryAgain() {
    setStatus('idle');
    setGrade(null);
    onResult?.(false);
    persist({ status: 'idle', grade: null });
  }

  const graded = status === 'graded' && grade;
  const isCorrect = graded && grade.correct;

  return (
    <div className={styles.fr}>
      <p className={styles.prompt}>{q.prompt}</p>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          persist({ answer: e.target.value });
        }}
        placeholder="Write your answer in a sentence or two…"
        rows={4}
        disabled={status === 'grading' || status === 'graded' || status === 'selfcheck'}
        aria-label={q.prompt}
        autoFocus={autoFocus}
      />

      {status === 'idle' && (
        <button
          type="button"
          className={checkStyles.submit}
          onClick={submit}
          disabled={!answer.trim()}
        >
          Submit answer
        </button>
      )}

      {status === 'grading' && (
        <div className={checkStyles.aiThinking} role="status" aria-live="polite">
          <span className={checkStyles.aiDots}>
            <span />
            <span />
            <span />
          </span>
          Tutor is reading your answer…
        </div>
      )}

      {graded && (
        <div
          className={isCorrect ? checkStyles.feedbackOk : checkStyles.feedbackBad}
          role="status"
          aria-live="polite"
        >
          <div className={styles.gradeHead}>
            <span className={checkStyles.badge}>Tutor</span>
            <span className={styles.scorePill}>
              {isCorrect ? 'On track' : 'Almost'} · {Math.round((grade.score || 0) * 100)}%
            </span>
          </div>
          <p className={styles.feedbackText}>{grade.feedback}</p>
          {grade.missedConcepts?.length > 0 && (
            <p className={styles.missed}>
              Revisit: {grade.missedConcepts.join(', ')}
            </p>
          )}
          {!isCorrect && (
            <button type="button" className={checkStyles.tryAgain} onClick={tryAgain}>
              Revise &amp; resubmit
            </button>
          )}
        </div>
      )}

      {status === 'selfcheck' && (
        <div className={checkStyles.feedbackOk} role="status" aria-live="polite">
          <p className={styles.feedbackText}>
            Answer saved. Compare it against what a strong answer covers:
          </p>
          {rubric && <p className={styles.rubric}>{rubric}</p>}
        </div>
      )}
    </div>
  );
}
