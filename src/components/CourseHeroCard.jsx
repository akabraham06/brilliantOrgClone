import { Link } from 'react-router-dom';
import LessonIcon from './LessonIcon.jsx';
import ProgressBar from './ProgressBar.jsx';
import styles from './CourseHeroCard.module.css';

export default function CourseHeroCard({ course, percent = 0, lessonCount, to, ctaLabel }) {
  const started = percent > 0;
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <LessonIcon icon={course.coverIcon} size={64} />
        <div>
          <span className={styles.level}>{course.level}</span>
          <h2 className={styles.title}>{course.title}</h2>
        </div>
      </div>

      <p className={styles.description}>{course.description}</p>

      <div className={styles.metaRow}>
        <span>{lessonCount} lessons</span>
        <span aria-hidden="true">&middot;</span>
        <span>~{course.estimatedMinutes} min</span>
      </div>

      <ProgressBar
        percent={percent}
        label={<span>{started ? `${percent}% complete` : 'Not started yet'}</span>}
      />

      <Link to={to} className={styles.cta}>
        {ctaLabel || (started ? 'Continue course' : 'Start course')}
      </Link>
    </section>
  );
}
