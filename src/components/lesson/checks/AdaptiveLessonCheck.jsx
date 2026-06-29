import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiEnabled } from '../../../firebase/ai.js';
import { useProgress } from '../../../context/ProgressContext.jsx';
import {
  computeInLessonComprehension,
  generateAdaptiveCheck,
} from '../../../ai/adaptiveLessonCheck.js';
import MultipleChoiceCheck from './MultipleChoiceCheck.jsx';
import styles from './AdaptiveLessonCheck.module.css';

// Easier questions get more leeway before proactive help kicks in; harder ones
// offer help sooner.
const DIFFICULTY_HELP_AFTER = { challenge: 1, medium: 2, foundational: 3 };

/**
 * Adaptive end-of-lesson skill check. On first visit (when AI is enabled) it
 * generates a randomized, difficulty-tuned multiple-choice set grounded in the
 * lesson's content and renders it through the existing MultipleChoiceCheck, so
 * Next-unlock and recordCheckResult keep working unchanged. The generated set is
 * persisted in savedState so returning to the slide does not regenerate. On
 * generation failure (or when AI is off) it renders the authored static check.
 */
export default function AdaptiveLessonCheck({
  slide,
  onResult,
  savedState,
  onSaveState,
  lessonSlides,
}) {
  const { progress } = useProgress();
  const checkResults = progress?.lessons?.[slide.lessonId]?.checkResults;

  // Difficulty (from in-lesson comprehension) sets the proactive-help threshold.
  const helpAfterAttempts = useMemo(() => {
    const comp = computeInLessonComprehension(lessonSlides, slide, checkResults);
    return DIFFICULTY_HELP_AFTER[comp.level] ?? DIFFICULTY_HELP_AFTER.medium;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlides, slide]);

  const [status, setStatus] = useState(() => {
    if (savedState?.generated) return 'ready';
    if (savedState?.failed) return 'failed';
    return aiEnabled ? 'idle' : 'failed';
  });
  const [generated, setGenerated] = useState(savedState?.generated || null);
  const runRef = useRef(0);
  const checkResultsRef = useRef(checkResults);
  checkResultsRef.current = checkResults;

  const runGeneration = useCallback(async () => {
    const runId = runRef.current + 1;
    runRef.current = runId;
    setStatus('loading');
    onResult?.(false);
    const cfg = await generateAdaptiveCheck({
      lessonSlides,
      finalSlide: slide,
      checkResults: checkResultsRef.current,
      lessonTitle: slide.title,
    });
    if (runRef.current !== runId) return;
    if (!cfg) {
      setStatus('failed');
      onSaveState?.({ failed: true });
      return;
    }
    setGenerated(cfg);
    setStatus('ready');
    onSaveState?.({ generated: cfg, inner: { answers: {}, submitted: false } });
  }, [lessonSlides, slide, onResult, onSaveState]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (aiEnabled && status === 'idle') runGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInnerSave = useCallback(
    (innerState) => {
      onSaveState?.({ generated, inner: innerState });
    },
    [generated, onSaveState],
  );

  const synthSlide = useMemo(
    () => (generated ? { ...slide, checkConfig: generated } : slide),
    [slide, generated],
  );

  if (status === 'failed' || !aiEnabled) {
    return (
      <MultipleChoiceCheck
        slide={slide}
        onResult={onResult}
        savedState={savedState?.inner}
        onSaveState={onSaveState}
        helpAfterAttempts={helpAfterAttempts}
        lessonSlides={lessonSlides}
      />
    );
  }

  if (status === 'loading' || status === 'idle' || !generated) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className={styles.loadingText}>Generating your personalized skill check&hellip;</p>
        <p className={styles.loadingSub}>
          Tuned to how you did earlier in this lesson.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span className={styles.badge}>
          <span className={styles.spark} aria-hidden="true">&#10022;</span>
          Adaptive
        </span>
        <button
          type="button"
          className={styles.regen}
          onClick={runGeneration}
          aria-label="Generate new adaptive questions"
        >
          New questions
        </button>
      </div>
      <MultipleChoiceCheck
        key={runRef.current}
        slide={synthSlide}
        onResult={onResult}
        savedState={savedState?.inner}
        onSaveState={handleInnerSave}
        helpAfterAttempts={helpAfterAttempts}
        lessonSlides={lessonSlides}
      />
    </div>
  );
}
