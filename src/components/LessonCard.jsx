import { Link } from 'react-router-dom';
import LessonIcon from './LessonIcon.jsx';
import styles from './LessonCard.module.css';

const STATUS_META = {
  completed: { label: 'Completed', className: 'completed' },
  'in-progress': { label: 'In progress', className: 'inProgress' },
  'not-started': { label: 'Not started', className: 'notStarted' },
};

export default function LessonCard({ lesson, status = 'not-started', to }) {
  const meta = STATUS_META[status] || STATUS_META['not-started'];

  return (
    <Link to={to} className={styles.card}>
      <LessonIcon icon={lesson.icon} size={52} />
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.order}>Lesson {lesson.orderIndex}</span>
          <span className={`${styles.status} ${styles[meta.className]}`}>
            {meta.label}
          </span>
        </div>
        <h3 className={styles.title}>{lesson.title}</h3>
        <p className={styles.description}>{lesson.shortDescription}</p>
        <div className={styles.metaRow}>
          <span>{lesson.slideCount} slides</span>
          <span aria-hidden="true">&middot;</span>
          <span>~{lesson.estimatedMinutes} min</span>
        </div>
      </div>
      <span className={styles.chevron} aria-hidden="true">
        &rarr;
      </span>
    </Link>
  );
}
