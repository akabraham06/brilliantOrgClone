import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchCourseWithLessons } from '../firebase/content.js';

const ContentContext = createContext(null);

/**
 * Loads the course + ordered lessons from Firestore once for the authenticated
 * shell, exposing loading/error/retry state for graceful empty/error UIs.
 */
export function ContentProvider({ children }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { course: c, lessons: l } = await fetchCourseWithLessons();
      setCourse(c);
      setLessons(l);
    } catch (err) {
      console.error('[content] failed to load course content:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = { course, lessons, loading, error, reload: load };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  const ctx = useContext(ContentContext);
  if (ctx === null) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return ctx;
}
