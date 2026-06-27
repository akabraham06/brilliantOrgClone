import { useEffect, useId, useRef, useState } from 'react';
import { aiEnabled } from '../../firebase/ai.js';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import styles from './PreferencesMenu.module.css';

/**
 * Compact accessibility/preferences control for the navbar. Opens a popover
 * exposing the learner's reading-level / dyslexia-friendly text settings and the
 * tutor response language. Preferences persist client-side (PreferencesContext)
 * and apply to subsequent tutor replies immediately.
 *
 * Language and "simpler language" only affect AI replies, so they're hidden when
 * AI is disabled; the dyslexia-friendly reading style is purely visual and stays
 * available regardless.
 */
export default function PreferencesMenu() {
  const { prefs, toggleSimpleLanguage, toggleDyslexiaFont, setLanguage, languages } =
    usePreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const baseId = useId();

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Accessibility and tutor preferences"
        title="Accessibility & tutor preferences"
      >
        <span aria-hidden="true" className={styles.triggerGlyph}>
          Aa
        </span>
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Accessibility preferences">
          <p className={styles.heading}>Reading &amp; tutor</p>

          <label className={styles.toggleRow} htmlFor={`${baseId}-dyslexia`}>
            <span className={styles.toggleText}>
              <span className={styles.toggleLabel}>Dyslexia-friendly text</span>
              <span className={styles.toggleHint}>Easier-to-read font &amp; spacing</span>
            </span>
            <button
              id={`${baseId}-dyslexia`}
              type="button"
              role="switch"
              aria-checked={prefs.dyslexiaFont}
              className={`${styles.switch} ${prefs.dyslexiaFont ? styles.switchOn : ''}`}
              onClick={toggleDyslexiaFont}
            >
              <span className={styles.knob} aria-hidden="true" />
            </button>
          </label>

          {aiEnabled && (
            <>
              <label className={styles.toggleRow} htmlFor={`${baseId}-simple`}>
                <span className={styles.toggleText}>
                  <span className={styles.toggleLabel}>Simpler language</span>
                  <span className={styles.toggleHint}>Shorter sentences, plainer words</span>
                </span>
                <button
                  id={`${baseId}-simple`}
                  type="button"
                  role="switch"
                  aria-checked={prefs.simpleLanguage}
                  className={`${styles.switch} ${prefs.simpleLanguage ? styles.switchOn : ''}`}
                  onClick={toggleSimpleLanguage}
                >
                  <span className={styles.knob} aria-hidden="true" />
                </button>
              </label>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor={`${baseId}-lang`}>
                  Tutor language
                </label>
                <select
                  id={`${baseId}-lang`}
                  className={styles.select}
                  value={prefs.language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <p className={styles.note}>Saved on this device.</p>
        </div>
      )}
    </div>
  );
}
