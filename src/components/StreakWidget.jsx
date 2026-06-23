import styles from './StreakWidget.module.css';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreakWidget({ streakCount = 0, completedLessons = 0 }) {
  // Light up the most recent `streakCount` days (demo visual for Phase 2).
  const activeFrom = Math.max(0, DAYS.length - streakCount);

  return (
    <section className={styles.card}>
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.flame} aria-hidden="true">
            &#128293;
          </span>
          <div>
            <div className={styles.statValue}>{streakCount}</div>
            <div className={styles.statLabel}>day streak</div>
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValueAlt}>{completedLessons}</div>
          <div className={styles.statLabel}>lessons done</div>
        </div>
      </div>

      <div className={styles.week} aria-label={`Active ${streakCount} of 7 days`}>
        {DAYS.map((day, i) => (
          <div key={i} className={styles.day}>
            <span
              className={`${styles.dot} ${i >= activeFrom ? styles.dotActive : ''}`}
              aria-hidden="true"
            />
            <span className={styles.dayLabel}>{day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
