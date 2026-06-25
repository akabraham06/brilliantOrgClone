import styles from './StreakWidget.module.css';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreakWidget({ streakCount = 0, completedLessons = 0 }) {
  // Anchor the week row to the real calendar week and light up the streak days
  // ending on TODAY, so today's dot is the one that glows. JS getDay() is
  // Sun=0..Sat=6; shift to Mon=0..Sun=6 to match the labels above.
  const todayIdx = (new Date().getDay() + 6) % 7;
  // First lit day this week (a longer streak that started last week clamps to 0).
  const streakStart = todayIdx - streakCount + 1;
  const isActive = (i) => streakCount > 0 && i >= streakStart && i <= todayIdx;

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

      <div className={styles.week} aria-label={`${streakCount}-day streak, ending today`}>
        {DAYS.map((day, i) => {
          const active = isActive(i);
          const today = i === todayIdx;
          return (
            <div key={i} className={styles.day}>
              <span
                className={`${styles.dot} ${active ? styles.dotActive : ''} ${today ? styles.dotToday : ''}`}
                aria-hidden="true"
              />
              <span className={`${styles.dayLabel} ${today ? styles.dayLabelToday : ''}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
