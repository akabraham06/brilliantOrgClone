/**
 * Mock progress used to bring the portal widgets to life in Phases 2-3.
 * Replaced by real Firestore userCourseProgress/userLessonProgress in Phase 7.
 * Helpers accept the (Firestore-loaded) lessons array so nothing is hardcoded.
 */
export const mockProgress = {
  completedLessonIds: ['lesson-1'],
  currentLessonId: 'lesson-2',
  currentSlideIndex: 3,
  streakCount: 3,
};

export function getLessonStatus(lessonId, progress = mockProgress) {
  if (progress.completedLessonIds.includes(lessonId)) return 'completed';
  if (progress.currentLessonId === lessonId) return 'in-progress';
  return 'not-started';
}

export function getCoursePercent(lessons = [], progress = mockProgress) {
  if (!lessons.length) return 0;
  return Math.round(
    (progress.completedLessonIds.length / lessons.length) * 100,
  );
}

export function getNextLesson(lessons = [], progress = mockProgress) {
  if (!lessons.length) return null;
  return (
    lessons.find((l) => l.lessonId === progress.currentLessonId) ||
    lessons.find((l) => !progress.completedLessonIds.includes(l.lessonId)) ||
    lessons[0]
  );
}
