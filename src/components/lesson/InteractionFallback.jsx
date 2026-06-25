import styles from './InteractionFallback.module.css';

/**
 * Lightweight, theme-aware placeholder shown while a code-split interaction
 * chunk loads. The shimmer is paused under prefers-reduced-motion (handled in
 * CSS), so it degrades to a static panel.
 */
export default function InteractionFallback() {
  return (
    <div className={styles.fallback} role="status" aria-live="polite">
      <div className={styles.shimmer} aria-hidden="true" />
      <span className={styles.srOnly}>Loading interactive...</span>
    </div>
  );
}
