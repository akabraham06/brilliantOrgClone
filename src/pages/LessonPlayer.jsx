import { Link, useParams } from 'react-router-dom';
import styles from './Placeholder.module.css';

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Lesson</p>
      <h1 className={styles.heading}>Lesson player</h1>
      <p className={styles.note}>
        The slide-by-slide lesson player and interactive components arrive in
        Phases 4&ndash;6 (lesson id: <code>{lessonId}</code>).
      </p>
      <Link to={`/app/courses/${courseId}`} className={styles.link}>
        &larr; Back to Course
      </Link>
    </div>
  );
}
