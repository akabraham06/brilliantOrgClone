import { Link } from 'react-router-dom';
import LessonIcon from '../LessonIcon.jsx';
import styles from './LessonComplete.module.css';

/**
 * Lesson completion summary shown after the final slide: celebration, a recap
 * of the lesson, and a CTA to the next recommended lesson (or back to course).
 */
export default function LessonComplete({
  lesson,
  nextLesson,
  courseLink,
  nextLessonLink,
  accuracy = null,
  slideCount = 0,
  streakCount = 0,
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.badge} aria-hidden="true">
        &#10003;
      </div>
      <h1 className={styles.title}>Lesson complete!</h1>
      <p className={styles.subtitle}>
        You finished <strong>{lesson.title}</strong>. Great work building your
        intuition.
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{accuracy ? `${accuracy.percent}%` : '\u2014'}</span>
          <span className={styles.statLabel}>
            {accuracy ? `Skill-check accuracy (${accuracy.correct}/${accuracy.total})` : 'No checks in this lesson'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{slideCount}</span>
          <span className={styles.statLabel}>Slides completed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{streakCount}&#128293;</span>
          <span className={styles.statLabel}>Day streak</span>
        </div>
      </div>

      {Array.isArray(lesson.recap) && lesson.recap.length > 0 && (
        <div className={styles.recapCard}>
          <span className={styles.recapTitle}>You learned</span>
          <ul className={styles.recapList}>
            {lesson.recap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {nextLesson ? (
        <div className={styles.nextCard}>
          <span className={styles.nextEyebrow}>Up next</span>
          <div className={styles.nextRow}>
            <LessonIcon icon={nextLesson.icon} size={52} />
            <div>
              <div className={styles.nextLessonNum}>Lesson {nextLesson.orderIndex}</div>
              <div className={styles.nextTitle}>{nextLesson.title}</div>
            </div>
          </div>
          <Link to={nextLessonLink} className={styles.primaryCta}>
            Start next lesson
          </Link>
        </div>
      ) : (
        <div className={styles.nextCard}>
          <p className={styles.allDone}>
            That was the last lesson - you&rsquo;ve completed the course!
          </p>
        </div>
      )}

      <Link to={courseLink} className={styles.secondaryCta}>
        Back to course
      </Link>
    </div>
  );
}
