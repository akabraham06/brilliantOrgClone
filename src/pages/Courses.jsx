import {
  course,
  lessons,
  getCoursePercent,
  getLessonStatus,
  getNextLesson,
} from '../data/staticContent.js';
import CourseHeroCard from '../components/CourseHeroCard.jsx';
import LessonCard from '../components/LessonCard.jsx';
import styles from './Courses.module.css';

export default function Courses() {
  const percent = getCoursePercent();
  const nextLesson = getNextLesson();
  const courseLink = `/app/courses/${course.courseId}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Learning path</p>
        <h1 className={styles.heading}>One path to get you started</h1>
      </header>

      <CourseHeroCard
        course={course}
        percent={percent}
        lessonCount={lessons.length}
        to={`${courseLink}/lessons/${nextLesson.lessonId}`}
      />

      <section className={styles.lessons}>
        <h2 className={styles.sectionTitle}>Lessons</h2>
        <div className={styles.lessonList}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.lessonId}
              lesson={lesson}
              status={getLessonStatus(lesson.lessonId)}
              to={`${courseLink}/lessons/${lesson.lessonId}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
