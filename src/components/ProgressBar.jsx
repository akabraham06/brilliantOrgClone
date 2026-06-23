import styles from './ProgressBar.module.css';

export default function ProgressBar({ percent = 0, label, color }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={styles.wrap}>
      {label && <div className={styles.label}>{label}</div>}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, background: color || 'var(--color-primary)' }}
        />
      </div>
    </div>
  );
}
