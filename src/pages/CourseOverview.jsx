import { Link, useParams } from 'react-router-dom';
import {
  course,
  lessons,
  getCoursePercent,
  getLessonStatus,
  getNextLesson,
} from '../data/staticContent.js';
import CourseHeroCard from '../components/CourseHeroCard.jsx';
import LessonCard from '../components/LessonCard.jsx';
import styles from './CourseOverview.module.css';

export default function CourseOverview() {
  const { courseId } = useParams();
  const percent = getCoursePercent();
  const nextLesson = getNextLesson();
  const base = `/app/courses/${courseId}`;

  return (
    <div className={styles.page}>
      <Link to="/app/courses" className={styles.back}>
        &larr; Back to Courses
      </Link>

      <CourseHeroCard
        course={course}
        percent={percent}
        lessonCount={lessons.length}
        to={`${base}/lessons/${nextLesson.lessonId}`}
      />

      <section className={styles.lessons}>
        <h2 className={styles.sectionTitle}>
          {lessons.length} lessons in this course
        </h2>
        <div className={styles.lessonList}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonId}
              lesson={lesson}
              status={getLessonStatus(lesson.lessonId)}
              to={`${base}/lessons/${lesson.lessonId}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
