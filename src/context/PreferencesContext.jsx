import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TUTOR_LANGUAGES } from '../ai/tutorPrompt.js';

const PreferencesContext = createContext(null);

const STORAGE_KEY = 'chem-tutor-prefs';

const DEFAULT_PREFS = {
  // "Simpler language" — adds a reading-level instruction to AI calls.
  simpleLanguage: false,
  // Dyslexia-friendly reading style — applies a legible font/spacing class to
  // tutor explanation text (purely client-side, no AI change).
  dyslexiaFont: false,
  // Tutor response language (BCP-ish code from TUTOR_LANGUAGES). 'en' = default.
  language: 'en',
};

const VALID_LANG = new Set(TUTOR_LANGUAGES.map((l) => l.code));

function readStoredPrefs() {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      simpleLanguage: !!parsed.simpleLanguage,
      dyslexiaFont: !!parsed.dyslexiaFont,
      language: VALID_LANG.has(parsed.language) ? parsed.language : 'en',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Client-side learner preferences for the tutor experience (accessibility &
 * reach): "simpler language", a dyslexia-friendly reading style, and the tutor
 * response language. Persisted to localStorage so the choice survives sessions.
 *
 * Server-side persistence is intentionally out of scope here (another worker
 * owns Firestore); syncing these prefs to the user profile is a future
 * follow-up. The dyslexia reading style is reflected onto a
 * <html data-tutor-reading> attribute so scoped CSS modules can opt their text
 * elements into it. All AI-affecting prefs (`simpleLanguage`, `language`) flow
 * into `buildTutorSystem` at call time, so changes apply to the next AI reply
 * immediately.
 */
export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(readStoredPrefs);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Storage may be unavailable (private mode); prefs still work in-session.
    }
  }, [prefs]);

  // Reflect the reading style onto <html> so tutor CSS modules can target it.
  useEffect(() => {
    const el = document.documentElement;
    if (prefs.dyslexiaFont) el.setAttribute('data-tutor-reading', 'dyslexic');
    else el.removeAttribute('data-tutor-reading');
  }, [prefs.dyslexiaFont]);

  const setPref = useCallback((key, value) => {
    setPrefs((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const toggleSimpleLanguage = useCallback(
    () => setPrefs((p) => ({ ...p, simpleLanguage: !p.simpleLanguage })),
    [],
  );
  const toggleDyslexiaFont = useCallback(
    () => setPrefs((p) => ({ ...p, dyslexiaFont: !p.dyslexiaFont })),
    [],
  );
  const setLanguage = useCallback(
    (code) => setPref('language', VALID_LANG.has(code) ? code : 'en'),
    [setPref],
  );

  const value = useMemo(
    () => ({
      prefs,
      setPref,
      toggleSimpleLanguage,
      toggleDyslexiaFont,
      setLanguage,
      languages: TUTOR_LANGUAGES,
    }),
    [prefs, setPref, toggleSimpleLanguage, toggleDyslexiaFont, setLanguage],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (ctx === null) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
