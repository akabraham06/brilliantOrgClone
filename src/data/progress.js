/**
 * Pure helpers for deriving UI state from a progress object. The progress
 * object is the real Firestore-backed shape exposed by ProgressContext:
 *   { completedLessonIds, currentLessonId, currentSlideIndex, lessons: {...} }
 */
const EMPTY = { completedLessonIds: [], currentLessonId: null, lessons: {} };

export function getLessonStatus(lessonId, progress = EMPTY) {
  const lp = progress.lessons?.[lessonId];
  if (lp?.completed || progress.completedLessonIds?.includes(lessonId)) return 'completed';
  if (lp && (lp.completedSlideIds?.length || lp.lastSlideIndex)) return 'in-progress';
  if (progress.currentLessonId === lessonId) return 'in-progress';
  return 'not-started';
}

export function getLessonPercent(lessonId, progress = EMPTY) {
  const raw = progress.lessons?.[lessonId]?.percent || 0;
  // Clamp to [0,100]: stored percents can be stale/over-100 after a lesson was
  // restructured (more completed slide ids than the current slide count).
  return Math.min(100, Math.max(0, raw));
}

/** Course percent = average of per-lesson percents across all lessons. */
export function getCoursePercent(lessons = [], progress = EMPTY) {
  if (!lessons.length) return 0;
  // getLessonPercent already clamps each lesson to [0,100], so the average can
  // never exceed 100 even when stored progress is stale.
  const total = lessons.reduce((sum, l) => sum + getLessonPercent(l.lessonId, progress), 0);
  return Math.min(100, Math.round(total / lessons.length));
}

/** Next lesson to work on: the in-progress one, else first not-completed. */
export function getNextLesson(lessons = [], progress = EMPTY) {
  if (!lessons.length) return null;
  const completed = new Set(progress.completedLessonIds || []);
  return (
    lessons.find((l) => l.lessonId === progress.currentLessonId && !completed.has(l.lessonId)) ||
    lessons.find((l) => !completed.has(l.lessonId)) ||
    lessons[0]
  );
}

/**
 * Skill-check accuracy for a lesson, based on first-attempt results so the
 * try-again loop doesn't inflate mastery. Returns null when no checks attempted.
 */
export function getLessonAccuracy(lessonId, progress = EMPTY) {
  const results = progress.lessons?.[lessonId]?.checkResults || {};
  const ids = Object.keys(results);
  if (!ids.length) return null;
  const correct = ids.filter((id) => results[id].firstAttemptCorrect).length;
  return { correct, total: ids.length, percent: Math.round((correct / ids.length) * 100) };
}

/** Aggregate skill-check accuracy across the whole course. */
export function getCourseAccuracy(lessons = [], progress = EMPTY) {
  let correct = 0;
  let total = 0;
  lessons.forEach((l) => {
    const a = getLessonAccuracy(l.lessonId, progress);
    if (a) {
      correct += a.correct;
      total += a.total;
    }
  });
  if (!total) return null;
  return { correct, total, percent: Math.round((correct / total) * 100) };
}

export function hasStarted(progress = EMPTY) {
  return Boolean(
    progress.startedAt ||
      progress.completedLessonIds?.length ||
      Object.keys(progress.lessons || {}).length,
  );
}
