import { firebaseEnabled } from './firebase/config.js';
import styles from './App.module.css';

/**
 * Phase 0 shell: a styled, dark-themed placeholder that verifies the Vite +
 * React + theme-token setup boots correctly. Routing, auth, and the portal
 * are layered on in later phases.
 */
export default function App() {
  return (
    <div className={styles.shell}>
      <main className={styles.hero}>
        <span className={styles.badge}>Introduction to Chemistry</span>
        <h1 className={styles.title}>
          Learn chemistry visually,
          <br />
          <span className={styles.accent}>one idea at a time.</span>
        </h1>
        <p className={styles.subtitle}>
          A Brilliant-inspired, interactive learning portal. The project
          scaffold is ready &mdash; routing, authentication, and the lesson
          player arrive in the next phases.
        </p>

        <div className={styles.swatches} aria-hidden="true">
          <span style={{ background: 'var(--accent-yellow)' }} />
          <span style={{ background: 'var(--accent-green)' }} />
          <span style={{ background: 'var(--accent-purple)' }} />
          <span style={{ background: 'var(--accent-blue)' }} />
          <span style={{ background: 'var(--accent-orange)' }} />
        </div>

        <p
          className={`${styles.status} ${
            firebaseEnabled ? styles.statusOk : styles.statusWarn
          }`}
        >
          {firebaseEnabled
            ? 'Firebase configured'
            : 'Firebase not configured \u2014 add credentials to .env'}
        </p>
      </main>
    </div>
  );
}
