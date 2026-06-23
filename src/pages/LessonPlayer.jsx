import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { fetchLessonSlides } from '../firebase/content.js';
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

  const handleReady = useCallback(() => {
    setSatisfied((prev) =>
      prev[current?.slideId] ? prev : { ...prev, [current?.slideId]: true },
    );
  }, [current]);

  const handleResult = useCallback(
    (correct) => {
      setSatisfied((prev) => ({ ...prev, [current?.slideId]: correct }));
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
      />
    );
  }

  const isLast = index === slides.length - 1;
  const canNext = Boolean(satisfied[current.slideId]);
  const progressPercent = Math.round(((index + 1) / slides.length) * 100);

  function goBack() {
    if (index > 0) setIndex((i) => i - 1);
    else navigate(courseLink);
  }

  function goNext() {
    if (!canNext) return;
    if (isLast) setCompleted(true);
    else setIndex((i) => i + 1);
  }

  return (
    <div className={styles.player}>
      <header className={styles.header}>
        <Link to={courseLink} className={styles.breadcrumb}>
          &larr; Back to course
        </Link>
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
    </div>
  );
}
