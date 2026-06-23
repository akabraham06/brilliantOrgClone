import { Link, useParams } from 'react-router-dom';
import styles from './Placeholder.module.css';

export default function CourseOverview() {
  const { courseId } = useParams();

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Course</p>
      <h1 className={styles.heading}>Introduction to Chemistry</h1>
      <p className={styles.note}>
        Course overview with the lesson list and start/resume button arrives in
        Phase 3 (course id: <code>{courseId}</code>).
      </p>
      <div className={styles.card}>
        <Link
          to={`/app/courses/${courseId}/lessons/lesson-1`}
          className={styles.link}
        >
          Open Lesson 1 &rarr;
        </Link>
      </div>
      <Link to="/app/courses" className={styles.link}>
        &larr; Back to Courses
      </Link>
    </div>
  );
}
