import styles from './ThemeToggle.module.css';

/** Sun/moon toggle for switching between light and dark themes. */
export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      role="switch"
      aria-checked={!isLight}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className={`${styles.thumb} ${isLight ? styles.thumbLight : styles.thumbDark}`}>
        {isLight ? (
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="12" y1="2.5" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="21.5" />
              <line x1="2.5" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="21.5" y2="12" />
              <line x1="5.2" y1="5.2" x2="7" y2="7" />
              <line x1="17" y1="17" x2="18.8" y2="18.8" />
              <line x1="5.2" y1="18.8" x2="7" y2="17" />
              <line x1="17" y1="7" x2="18.8" y2="5.2" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
