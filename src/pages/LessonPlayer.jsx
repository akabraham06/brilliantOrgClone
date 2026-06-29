import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useTutor } from '../context/TutorContext.jsx';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useDailyQuests } from '../context/DailyQuestsContext.jsx';
import { useRewardToast } from '../context/RewardToastContext.jsx';
import { fetchLessonSlides } from '../firebase/content.js';
import { getLessonAccuracy } from '../data/progress.js';
import { REWARDS, streakReward, economyDayKey } from '../data/economy.js';
import { useLearnerMemory } from '../ai/useLearnerMemory.js';
import ContentGate from '../components/ContentGate.jsx';
import SlideRenderer from '../components/lesson/SlideRenderer.jsx';
import LessonComplete from '../components/lesson/LessonComplete.jsx';
import styles from './LessonPlayer.module.css';

export default function LessonPlayer() {
  return (
    <ContentGate>
      <LessonPlayerInner />
    </ContentGate>
  );
}

function LessonPlayerInner() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { lessons } = useContent();
  const {
    progress,
    startLesson,
    recordSlideViewed,
    recordSlideComplete,
    recordCheckResult,
    completeLesson,
    markDailyActive,
    getResumeIndex,
  } = useProgress();
  const { setGroundingSlide } = useTutor();
  const { report: reportQuest } = useDailyQuests();
  const { pushReward } = useRewardToast();
  const { seedReviewTopics } = useLearnerMemory();
  const {
    grant,
    grantCosmetic,
    hasGranted,
    loading: economyLoading,
    xp: economyXp,
    coins: economyCoins,
    level: economyLevel,
  } = useEconomy();
  const resumedRef = useRef(null);
  // Snapshot of XP/coins/level when the lesson begins, so LessonComplete can show
  // exactly what was earned during this run (checks + free-response + bonuses).
  const startStatsRef = useRef(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  // Whether the just-finished lesson earned the no-hint "clean run" bonus, so
  // the completion screen can show the Flawless badge.
  const [cleanRun, setCleanRun] = useState(false);

  const lesson = useMemo(
    () => lessons.find((l) => l.lessonId === lessonId),
    [lessons, lessonId],
  );
  const nextLesson = useMemo(
    () => (lesson ? lessons.find((l) => l.orderIndex === lesson.orderIndex + 1) : null),
    [lessons, lesson],
  );

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [satisfied, setSatisfied] = useState({});
  // Per-slide answer state (keyed by slideId) so a check shows the learner's
  // previous answers when they navigate back to it.
  const [slideState, setSlideState] = useState({});
  // A slide may intercept the global Next press to run an in-slide transition
  // first (e.g. swap its description) before the player advances.
  const nextInterceptRef = useRef(null);

  // Missing lesson -> back to the course overview (per PRD error handling).
  useEffect(() => {
    if (!lesson) {
      navigate(`/app/courses/${courseId}`, { replace: true });
    }
  }, [lesson, courseId, navigate]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setIndex(0);
    setCompleted(false);
    setSatisfied({});
    setSlideState({});
    fetchLessonSlides(lessonId)
      .then((data) => {
        if (active) setSlides(data);
      })
      .catch((err) => {
        console.error('[lesson] failed to load slides:', err);
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lessonId]);

  const current = slides[index];

  // Once slides + progress are ready, resume where the learner left off and
  // mark the lesson started. Guarded by a ref so it runs once per lesson.
  useEffect(() => {
    if (loading || slides.length === 0) return;
    if (resumedRef.current === lessonId) return;
    resumedRef.current = lessonId;
    const resume = Math.min(getResumeIndex(lessonId), slides.length - 1);
    setIndex(resume > 0 ? resume : 0);
    startLesson(lessonId, slides.length);
  }, [loading, slides, lessonId, getResumeIndex, startLesson]);

  // Snapshot the economy at lesson start (once it has hydrated) so the completion
  // screen can report exactly what this run earned.
  useEffect(() => {
    if (economyLoading) return;
    if (startStatsRef.current?.lessonId === lessonId) return;
    startStatsRef.current = {
      lessonId,
      xp: economyXp,
      coins: economyCoins,
      level: economyLevel,
    };
  }, [economyLoading, lessonId, economyXp, economyCoins, economyLevel]);

  // Track the current slide as last-visited (drives Home's resume + lesson %).
  useEffect(() => {
    if (current && !completed) recordSlideViewed(lessonId, current.slideId, index);
  }, [current, index, completed, lessonId, recordSlideViewed]);

  // Keep the AI tutor grounded in the slide the learner is currently viewing.
  useEffect(() => {
    setGroundingSlide(!completed ? current || null : null);
  }, [current, completed, setGroundingSlide]);

  // Drop the grounding slide when leaving the lesson player.
  useEffect(() => () => setGroundingSlide(null), [setGroundingSlide]);

  // When a slide's requirement is satisfied, persist it as completed.
  useEffect(() => {
    if (current && satisfied[current.slideId]) {
      recordSlideComplete(lessonId, current.slideId, index, slides.length);
    }
  }, [satisfied, current, index, slides.length, lessonId, recordSlideComplete]);

  const handleReady = useCallback(() => {
    setSatisfied((prev) =>
      prev[current?.slideId] ? prev : { ...prev, [current?.slideId]: true },
    );
  }, [current]);

  const handleResult = useCallback(
    (correct) => {
      setSatisfied((prev) => ({ ...prev, [current?.slideId]: correct }));
      if (current?.isCheck) {
        recordCheckResult(lessonId, current.slideId, correct);
        // Idempotent reward on the first time a check is answered correctly.
        // (Granting only on correct avoids the adaptive check's pre-answer
        // onResult(false) locking in an "attempt" tier.)
        if (correct) {
          // Low-stakes retrieval checks (free-recall, warm-ups, discrimination)
          // grant a small fixed reward to keep the completion economy calibrated.
          const reward = current.checkConfig?.lowStakes
            ? REWARDS.lowStakes
            : REWARDS.check.correct;
          const res = grant({
            key: `check:${current.slideId}`,
            xp: reward.xp,
            coins: reward.coins,
          });
          // Frame the reward by the learning behavior (retrieval), not the coins.
          if (res.granted) {
            pushReward({
              amount: res.xp,
              coins: res.coins,
              behavior: 'Recalled from memory',
              icon: '\u{1F9E0}',
            });
          }
        }
      }
    },
    [current, lessonId, recordCheckResult, grant, pushReward],
  );

  const registerNextIntercept = useCallback((fn) => {
    nextInterceptRef.current = fn;
  }, []);

  const saveSlideState = useCallback(
    (st) => {
      setSlideState((prev) => ({ ...prev, [current?.slideId]: st }));
    },
    [current],
  );

  const courseLink = `/app/courses/${courseId}`;
  const nextLessonLink = nextLesson
    ? `${courseLink}/lessons/${nextLesson.lessonId}`
    : courseLink;

  if (!lesson) return null;

  if (loading) {
    return (
      <div className={styles.center} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <span className="sr-only">Loading lesson</span>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className={styles.errorCard}>
        <h2>We couldn&rsquo;t load this lesson</h2>
        <Link to={courseLink} className={styles.backLink}>
          &larr; Back to course
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <LessonComplete
        lesson={lesson}
        nextLesson={nextLesson}
        courseLink={courseLink}
        nextLessonLink={nextLessonLink}
        accuracy={getLessonAccuracy(lessonId, progress)}
        slideCount={slides.length}
        streakCount={progress.streakCount || 0}
        startStats={startStatsRef.current}
        cleanRun={cleanRun}
      />
    );
  }

  const isLast = index === slides.length - 1;
  const canNext = Boolean(satisfied[current.slideId]);
  const progressPercent = Math.round(((index + 1) / slides.length) * 100);

  function goBack() {
    nextInterceptRef.current = null;
    if (index > 0) setIndex((i) => i - 1);
    else setConfirmQuit(true);
  }

  function quitLesson() {
    setConfirmQuit(false);
    navigate(courseLink);
  }

  function goNext() {
    if (!canNext) return;
    // Let the current slide handle this press first (e.g. advance its own
    // internal stage). If it does, don't move to the next slide yet.
    if (nextInterceptRef.current && nextInterceptRef.current()) return;
    nextInterceptRef.current = null;
    if (isLast) {
      // Count today's activity BEFORE completeLesson (which also marks the day,
      // idempotently) so we capture isNewDay and grant the streak reward once.
      const daily = markDailyActive();
      completeLesson(lessonId);
      // Lesson-completion base reward (idempotent per lesson).
      grant({
        key: `lesson:${lessonId}`,
        xp: REWARDS.lesson.base.xp,
        coins: REWARDS.lesson.base.coins,
      });
      // No-hint "clean run" bonus: zero hints used AND every graded, non-low-stakes
      // check first-attempt-correct. Reuses the recorded check-results + hint count
      // (see ProgressContext). Granting the bonus keeps a clean run at the full
      // 80 XP / 25 coins per lesson; a non-clean finish earns only the base.
      const lp = progress.lessons?.[lessonId] || {};
      const gradedChecks = slides.filter((s) => s.isCheck && !s.checkConfig?.lowStakes);
      const checkResults = lp.checkResults || {};
      const allFirstTry =
        gradedChecks.length > 0 &&
        gradedChecks.every((s) => checkResults[s.slideId]?.firstAttemptCorrect);
      const isClean = (lp.hintsUsed || 0) === 0 && allFirstTry;
      setCleanRun(isClean);
      if (isClean) {
        const cleanRes = grant({
          key: `cleanrun:${lessonId}`,
          xp: REWARDS.lesson.cleanRunBonus.xp,
          coins: REWARDS.lesson.cleanRunBonus.coins,
        });
        if (cleanRes.granted) {
          pushReward({
            amount: cleanRes.xp,
            coins: cleanRes.coins,
            behavior: 'Flawless, no-hint run',
            icon: '\u26A1',
          });
        }
        // Mastery exclusive: "flawless-scholar" once EVERY lesson has a clean run.
        const allClean = lessons.every((l) =>
          l.lessonId === lessonId ? true : hasGranted(`cleanrun:${l.lessonId}`),
        );
        if (allClean) {
          const ex = grantCosmetic('flawless-scholar', 'cosmetic:flawless-scholar');
          if (ex.granted) {
            pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
          }
        }
      }
      // Streak / consistency reward: on a genuinely new active day grant the
      // tiny capped streak reward (idempotent per day via the streak:<day> key).
      const { streakCount, isNewDay } = daily;
      if (isNewDay) {
        const sr = streakReward(streakCount);
        const streakRes = grant({ key: `streak:${economyDayKey()}`, xp: sr.xp, coins: sr.coins });
        if (streakRes.granted) {
          pushReward({
            amount: streakRes.xp,
            coins: streakRes.coins,
            behavior: `Day ${streakCount} streak`,
            icon: '\u{1F525}',
          });
        }
        // Mastery exclusive: "devoted" at a 14-day streak.
        if (streakCount >= 14) {
          const ex = grantCosmetic('devoted', 'cosmetic:devoted');
          if (ex.granted) {
            pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
          }
        }
        // Mastery exclusive: "iron-will" at a 30-day streak.
        if (streakCount >= 30) {
          const ex = grantCosmetic('iron-will', 'cosmetic:iron-will');
          if (ex.granted) {
            pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
          }
        }
      }
      // Seed spaced-repetition cards for every concept this lesson taught, so the
      // existing scheduler actually tracks learned material (not just mistakes).
      // Idempotent: seedCards skips topics already tracked.
      const learnedTopics = [
        ...(lesson.learningObjectives || []),
        ...(lesson.recap || []),
      ]
        .filter((t) => typeof t === 'string' && t.trim())
        .map((topic) => ({ topic, lessonId }));
      if (learnedTopics.length) seedReviewTopics(learnedTopics);
      // Daily quest: "foundation" — finishing a lesson builds the prerequisite base.
      reportQuest('foundation', 1);
      // Course 100% bonus the moment the final lesson is done (idempotent per course).
      const completedSet = new Set(progress.completedLessonIds || []);
      completedSet.add(lessonId);
      if (lessons.length > 0 && lessons.every((l) => completedSet.has(l.lessonId))) {
        grant({ key: `course:${courseId}`, xp: REWARDS.course.xp, coins: REWARDS.course.coins });
        // Mastery exclusive: "course-master" for reaching 100% completion.
        const ex = grantCosmetic('course-master', 'cosmetic:course-master');
        if (ex.granted) {
          pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
        }
      }
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className={styles.player}>
      <header className={styles.header}>
        <button type="button" className={styles.breadcrumb} onClick={() => setConfirmQuit(true)}>
          &larr; Back to course
        </button>
        <div className={styles.lessonTitle}>{lesson.title}</div>
        <div className={styles.counter}>
          Slide {index + 1} of {slides.length}
        </div>
      </header>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {current.learningGoal && (
        <p className={styles.goalBar} aria-live="polite">
          <span className={styles.goalIcon} aria-hidden="true">&#9678;</span>
          <span className={styles.goalLabel}>Focus:</span>
          <span className={styles.goalText}>{current.learningGoal}</span>
        </p>
      )}

      <main className={styles.stage}>
        <SlideRenderer
          key={current.slideId}
          slide={current}
          onReady={handleReady}
          onResult={handleResult}
          registerNextIntercept={registerNextIntercept}
          savedState={slideState[current.slideId]}
          onSaveState={saveSlideState}
          lessonSlides={slides}
        />
      </main>

      <footer className={styles.footer}>
        <button type="button" className={styles.backBtn} onClick={goBack}>
          Back
        </button>
        <button
          type="button"
          className={styles.nextBtn}
          onClick={goNext}
          disabled={!canNext}
          title={!canNext ? 'Complete this slide to continue' : undefined}
        >
          {isLast ? 'Finish lesson' : 'Next'}
        </button>
      </footer>

      {confirmQuit && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quit-title"
          onClick={() => setConfirmQuit(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 id="quit-title" className={styles.modalTitle}>Quit this lesson?</h2>
            <p className={styles.modalBody}>
              Your progress is saved, so you can pick up right where you left off.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalNo} onClick={() => setConfirmQuit(false)}>
                No, keep going
              </button>
              <button type="button" className={styles.modalYes} onClick={quitLesson}>
                Yes, quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
