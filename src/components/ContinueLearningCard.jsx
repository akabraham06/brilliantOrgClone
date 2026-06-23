import { Link } from 'react-router-dom';
import LessonIcon from './LessonIcon.jsx';
import ProgressBar from './ProgressBar.jsx';
import styles from './ContinueLearningCard.module.css';

export default function ContinueLearningCard({ lesson, to, resume = false, slidePercent = 0 }) {
  return (
    <section className={styles.card}>
      <span className={styles.eyebrow}>
        {resume ? 'Continue where you left off' : 'Up next'}
      </span>

      <div className={styles.row}>
        <LessonIcon icon={lesson.icon} size={64} />
        <div className={styles.info}>
          <span className={styles.lessonNum}>Lesson {lesson.orderIndex}</span>
          <h2 className={styles.title}>{lesson.title}</h2>
          <p className={styles.desc}>{lesson.shortDescription}</p>
        </div>
      </div>

      {resume && (
        <ProgressBar
          percent={slidePercent}
          color="var(--accent-blue)"
          label={<span>Lesson progress</span>}
        />
      )}

      <Link to={to} className={styles.cta}>
        {resume ? 'Resume lesson' : 'Start lesson'}
      </Link>
    </section>
  );
}
