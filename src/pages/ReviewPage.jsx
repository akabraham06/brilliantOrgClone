import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useDailyQuests } from '../context/DailyQuestsContext.jsx';
import { buildReviewSet } from '../data/reviewQuestions.js';
import { getCheckComponent } from '../components/lesson/interactionRegistry.js';
import InteractionFallback from '../components/lesson/InteractionFallback.jsx';
import ContentGate from '../components/ContentGate.jsx';
import Formula from '../components/interactions/Formula.jsx';
import { aiEnabled } from '../firebase/ai.js';
import { useLearnerProfile } from '../ai/useLearnerProfile.js';
import { generateReviewItems } from '../ai/reviewGenerator.js';
import styles from './ReviewPage.module.css';

const REVIEW_COUNT = 40;

// Validation modes that have a real, reusable check UI. Anything outside this
// set falls back to the simple inline multiple-choice renderer below.
const REUSABLE_MODES = new Set([
  'multipleChoice',
  'classify',
  'matching',
  'balance',
  'pHPlacement',
  'nameBuilder',
]);

export default function ReviewPage() {
  return (
    <ContentGate>
      <ReviewPageInner />
    </ContentGate>
  );
}

function ReviewPageInner() {
  const { courseId } = useParams();
  const { lessons } = useContent();
  const { completeLesson } = useProgress();
  const { report: reportQuest } = useDailyQuests();
  const profile = useLearnerProfile();

  // A fresh shuffled set per attempt; bumping `attempt` reshuffles on restart.
  const [attempt, setAttempt] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const staticItems = useMemo(() => buildReviewSet(REVIEW_COUNT), [attempt]);

  // Additive AI mode: a personalized set generated from the learner's weak
  // spots. Falls back transparently to the static set when unavailable.
  const [aiItems, setAiItems] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const items = aiItems || staticItems;
  const total = items.length;

  const [index, setIndex] = useState(0);
  // Correctness keyed by question index, finalized as the learner advances.
  const [results, setResults] = useState({});
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);

  const current = items[index];
  const answered = Object.prototype.hasOwnProperty.call(results, index);
  const score = useMemo(
    () => Object.values(results).filter(Boolean).length,
    [results],
  );

  const handleResult = useCallback(
    (correct) => {
      setResults((prev) => ({ ...prev, [index]: !!correct }));
    },
    [index],
  );

  const courseLink = `/app/courses/${courseId}`;

  // On finish, mark every lesson complete so the course reads as 100%.
  useEffect(() => {
    if (!finished || completedRef.current) return;
    completedRef.current = true;
    lessons.forEach((l) => completeLesson(l.lessonId));
    // Daily quests: the review is retrieval practice AND inherently interleaved
    // (it mixes questions from every lesson), so it advances both.
    if (score > 0) reportQuest('retrieval', score);
    reportQuest('interleave', 1);
  }, [finished, lessons, completeLesson, score, reportQuest]);

  function goNext() {
    if (!answered) return;
    if (index < total - 1) setIndex((i) => i + 1);
    else setFinished(true);
  }

  function restart() {
    completedRef.current = false;
    setAiItems(null);
    setAiError(false);
    setAttempt((a) => a + 1);
    setIndex(0);
    setResults({});
    setFinished(false);
  }

  async function practiceWeakSpots() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(false);
    const generated = await generateReviewItems(profile, lessons, { count: 8 });
    setAiLoading(false);
    if (!generated) {
      setAiError(true);
      return;
    }
    completedRef.current = false;
    setAiItems(generated);
    setIndex(0);
    setResults({});
    setFinished(false);
  }

  if (finished) {
    return (
      <ResultsSummary
        score={score}
        total={total}
        courseLink={courseLink}
        onRestart={restart}
      />
    );
  }

  const progressPercent = Math.round(((index + 1) / total) * 100);
  const useFallback =
    !REUSABLE_MODES.has(current.validationMode) || current.fallback;
  const Check = getCheckComponent(current.validationMode);

  return (
    <div className={styles.player}>
      <header className={styles.header}>
        <Link to={courseLink} className={styles.breadcrumb}>
          &larr; Back to course
        </Link>
        <div className={styles.title}>Course Review</div>
        <div className={styles.counter} aria-live="polite">
          Question {index + 1} / {total}
        </div>
      </header>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`Question ${index + 1} of ${total}`}
      >
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {aiEnabled && (
        <div className={styles.aiBar}>
          {aiItems ? (
            <span className={styles.aiBadge}>
              Personalized practice &middot; tailored to what you missed
            </span>
          ) : (
            <button
              type="button"
              className={styles.aiBtn}
              onClick={practiceWeakSpots}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating your set\u2026' : '\u2728 Practice what you missed'}
            </button>
          )}
          {aiError && (
            <span className={styles.aiErr} role="status">
              Couldn&rsquo;t generate right now &mdash; showing the standard review.
            </span>
          )}
        </div>
      )}

      <main className={styles.stage}>
        <div className={styles.text}>
          {current.slide.subtitle && (
            <h2 className={styles.concept}>{current.slide.subtitle}</h2>
          )}
          {current.slide.bodyText && (
            <p className={styles.body}>{current.slide.bodyText}</p>
          )}
        </div>

        <div className={styles.checkArea}>
          {useFallback ? (
            <SimpleChoiceCheck
              key={current.id}
              slide={current.slide}
              onResult={handleResult}
            />
          ) : (
            <Suspense fallback={<InteractionFallback />}>
              <Check
                key={current.id}
                slide={current.slide}
                onResult={handleResult}
                savedState={undefined}
                onSaveState={undefined}
              />
            </Suspense>
          )}
        </div>

        {current.slide.instructions && (
          <p className={styles.instructions}>{current.slide.instructions}</p>
        )}
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerHint}>
          {answered ? 'Answer recorded.' : 'Check your answer to continue.'}
        </span>
        <button
          type="button"
          className={styles.nextBtn}
          onClick={goNext}
          disabled={!answered}
          title={!answered ? 'Check this question to continue' : undefined}
        >
          {index === total - 1 ? 'Finish review' : 'Next'}
        </button>
      </footer>
    </div>
  );
}

function ResultsSummary({ score, total, courseLink, onRestart }) {
  const percent = total ? Math.round((score / total) * 100) : 0;
  let headline = 'Review complete!';
  if (percent >= 90) headline = 'Outstanding - course mastered!';
  else if (percent >= 70) headline = 'Great work - course complete!';
  else if (percent >= 50) headline = 'Nice effort - course complete!';

  return (
    <div className={styles.results}>
      <div className={styles.trophy} aria-hidden="true">
        &#127942;
      </div>
      <h1 className={styles.resultsTitle}>{headline}</h1>
      <p className={styles.scoreLine} role="status" aria-live="polite">
        You scored{' '}
        <strong className={styles.scoreValue}>
          {score} / {total}
        </strong>{' '}
        ({percent}%)
      </p>
      <p className={styles.resultsBody}>
        Finishing the review marks the whole course complete. Reshuffle for a
        brand-new set of questions any time.
      </p>
      <div className={styles.resultsActions}>
        <button type="button" className={styles.restartBtn} onClick={onRestart}>
          Restart review
        </button>
        <Link to={courseLink} className={styles.overviewBtn}>
          Back to course
        </Link>
      </div>
    </div>
  );
}

/**
 * Minimal, self-contained multiple-choice renderer. Used only as a safety net
 * when a review item's validation mode has no reusable graded component, so the
 * review never dead-ends on an unrenderable question type.
 */
function SimpleChoiceCheck({ slide, onResult }) {
  const cfg = slide.checkConfig || {};
  const question = (cfg.questions && cfg.questions[0]) || {};
  const options = question.options || [];
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = choice === question.answer;

  function submit() {
    setSubmitted(true);
    onResult?.(correct);
  }

  return (
    <div className={styles.simple}>
      <fieldset className={styles.simpleField}>
        <legend className={styles.simplePrompt}>{question.prompt}</legend>
        <div className={styles.simpleOptions}>
          {options.map((option) => {
            const selected = choice === option;
            const isAnswer = option === question.answer;
            let cls = styles.simpleOption;
            if (submitted && isAnswer) cls += ` ${styles.simpleCorrect}`;
            else if (submitted && selected && !isAnswer) cls += ` ${styles.simpleWrong}`;
            else if (selected) cls += ` ${styles.simpleSelected}`;
            return (
              <button
                key={option}
                type="button"
                className={cls}
                aria-pressed={selected}
                disabled={submitted}
                onClick={() => setChoice(option)}
              >
                <Formula value={option} />
              </button>
            );
          })}
        </div>
      </fieldset>
      {submitted ? (
        <p className={correct ? styles.simpleFeedbackOk : styles.simpleFeedbackBad} role="status">
          {correct ? cfg.feedbackCorrect : cfg.feedbackIncorrect}
        </p>
      ) : (
        <button
          type="button"
          className={styles.simpleSubmit}
          onClick={submit}
          disabled={choice == null}
        >
          Check answer
        </button>
      )}
    </div>
  );
}
