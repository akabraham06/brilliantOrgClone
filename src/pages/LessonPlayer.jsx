import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { fetchLessonSlides } from '../firebase/content.js';
import { getLessonAccuracy } from '../data/progress.js';
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
    getResumeIndex,
  } = useProgress();
  const resumedRef = useRef(null);
  const [confirmQuit, setConfirmQuit] = useState(false);

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

  // Track the current slide as last-visited (drives Home's resume + lesson %).
  useEffect(() => {
    if (current && !completed) recordSlideViewed(lessonId, current.slideId, index);
  }, [current, index, completed, lessonId, recordSlideViewed]);

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
      if (current?.isCheck) recordCheckResult(lessonId, current.slideId, correct);
    },
    [current, lessonId, recordCheckResult],
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
      completeLesson(lessonId);
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

      <main className={styles.stage}>
        <SlideRenderer
          key={current.slideId}
          slide={current}
          onReady={handleReady}
          onResult={handleResult}
          registerNextIntercept={registerNextIntercept}
          savedState={slideState[current.slideId]}
          onSaveState={saveSlideState}
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
