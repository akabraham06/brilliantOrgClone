import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext.jsx';
import { useContent } from './ContentContext.jsx';
import { fetchProgress, saveProgress } from '../firebase/progress.js';

const ProgressContext = createContext(null);

const EMPTY = {
  startedAt: null,
  currentLessonId: null,
  currentSlideId: null,
  currentSlideIndex: 0,
  completedLessonIds: [],
  streakCount: 0,
  lastActiveDay: null,
  lessons: {},
};

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isYesterday(prevKey) {
  if (!prevKey) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dayKey(yesterday) === prevKey;
}

/**
 * Hydrates per-user progress from Firestore and exposes actions to record
 * lesson starts, slide completion, and lesson completion. Writes are debounced
 * so rapid slide advances coalesce into a single network write.
 */
export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const { course } = useContent();
  const courseId = course?.courseId;

  const [progress, setProgress] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const hydratedRef = useRef(false);
  const dirtyRef = useRef(false);
  const saveTimer = useRef(null);

  // Hydrate once user + course are known.
  useEffect(() => {
    let active = true;
    if (!user || !courseId) return undefined;
    setLoading(true);
    hydratedRef.current = false;
    fetchProgress(user.uid, courseId)
      .then((data) => {
        if (!active) return;
        setProgress({ ...EMPTY, ...(data || {}) });
      })
      .catch((err) => {
        console.error('[progress] failed to load:', err);
        if (active) setProgress(EMPTY);
      })
      .finally(() => {
        if (!active) return;
        hydratedRef.current = true;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, courseId]);

  // Debounced persistence whenever progress changes after a mutation.
  useEffect(() => {
    if (!hydratedRef.current || !dirtyRef.current || !user || !courseId) return undefined;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      dirtyRef.current = false;
      saveProgress(user.uid, courseId, progress).catch((err) =>
        console.error('[progress] save failed:', err),
      );
    }, 700);
    return () => saveTimer.current && window.clearTimeout(saveTimer.current);
  }, [progress, user, courseId]);

  const mutate = useCallback((updater) => {
    dirtyRef.current = true;
    setProgress((prev) => updater(prev));
  }, []);

  const startLesson = useCallback(
    (lessonId, slideCount) => {
      mutate((prev) => {
        const lessons = { ...prev.lessons };
        if (!lessons[lessonId]) {
          lessons[lessonId] = {
            completedSlideIds: [],
            slideCount: slideCount || 0,
            percent: 0,
            completed: false,
            lastSlideIndex: 0,
          };
        }
        return {
          ...prev,
          startedAt: prev.startedAt || dayKey(),
          currentLessonId: lessonId,
          lessons,
        };
      });
    },
    [mutate],
  );

  const recordSlideViewed = useCallback(
    (lessonId, slideId, index) => {
      mutate((prev) => {
        const lessons = { ...prev.lessons };
        const lp = { ...(lessons[lessonId] || { completedSlideIds: [], percent: 0 }) };
        lp.lastSlideIndex = index;
        lessons[lessonId] = lp;
        return { ...prev, currentLessonId: lessonId, currentSlideId: slideId, currentSlideIndex: index, lessons };
      });
    },
    [mutate],
  );

  const recordSlideComplete = useCallback(
    (lessonId, slideId, index, slideCount) => {
      mutate((prev) => {
        const lessons = { ...prev.lessons };
        const lp = {
          completedSlideIds: [],
          slideCount: slideCount || 0,
          percent: 0,
          completed: false,
          lastSlideIndex: 0,
          ...(lessons[lessonId] || {}),
        };
        const done = new Set(lp.completedSlideIds);
        done.add(slideId);
        lp.completedSlideIds = [...done];
        lp.slideCount = slideCount || lp.slideCount;
        lp.lastSlideIndex = index;
        // Guard against stale state where stored completedSlideIds outnumber the
        // current slideCount (lessons get restructured over time). Clamp both the
        // counted slides and the resulting percent so it can never exceed 100.
        const completedCount = lp.slideCount
          ? Math.min(lp.completedSlideIds.length, lp.slideCount)
          : lp.completedSlideIds.length;
        lp.percent = lp.slideCount
          ? Math.min(100, Math.round((completedCount / lp.slideCount) * 100))
          : 0;
        lessons[lessonId] = lp;
        return { ...prev, lessons };
      });
    },
    [mutate],
  );

  // Records the outcome of a graded skill check. Keeps the first-attempt
  // result (the honest mastery signal) plus a latched "ever correct" flag and
  // an attempt count, so accuracy can be reported without try-again inflating it.
  const recordCheckResult = useCallback(
    (lessonId, slideId, correct) => {
      if (!lessonId || !slideId) return;
      mutate((prev) => {
        const lessons = { ...prev.lessons };
        const lp = {
          completedSlideIds: [],
          slideCount: 0,
          percent: 0,
          completed: false,
          lastSlideIndex: 0,
          ...(lessons[lessonId] || {}),
        };
        const checkResults = { ...(lp.checkResults || {}) };
        const existing = checkResults[slideId];
        checkResults[slideId] = {
          firstAttemptCorrect: existing ? existing.firstAttemptCorrect : !!correct,
          correct: existing ? existing.correct || !!correct : !!correct,
          attempts: (existing?.attempts || 0) + 1,
        };
        lp.checkResults = checkResults;
        lessons[lessonId] = lp;
        return { ...prev, lessons };
      });
    },
    [mutate],
  );

  const completeLesson = useCallback(
    (lessonId) => {
      mutate((prev) => {
        const lessons = { ...prev.lessons };
        const lp = { ...(lessons[lessonId] || { completedSlideIds: [] }) };
        lp.completed = true;
        lp.percent = 100;
        lessons[lessonId] = lp;

        const completedLessonIds = prev.completedLessonIds.includes(lessonId)
          ? prev.completedLessonIds
          : [...prev.completedLessonIds, lessonId];

        // Streak: bump once per new active day.
        const today = dayKey();
        let { streakCount, lastActiveDay } = prev;
        if (lastActiveDay !== today) {
          streakCount = isYesterday(lastActiveDay) ? (streakCount || 0) + 1 : 1;
          lastActiveDay = today;
        }

        return { ...prev, lessons, completedLessonIds, streakCount, lastActiveDay };
      });
    },
    [mutate],
  );

  const getResumeIndex = useCallback(
    (lessonId) => progress.lessons?.[lessonId]?.lastSlideIndex || 0,
    [progress],
  );

  const value = useMemo(
    () => ({
      progress,
      loading,
      startLesson,
      recordSlideViewed,
      recordSlideComplete,
      recordCheckResult,
      completeLesson,
      getResumeIndex,
    }),
    [progress, loading, startLesson, recordSlideViewed, recordSlideComplete, recordCheckResult, completeLesson, getResumeIndex],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (ctx === null) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}
