import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { getCoursePercent, getLessonStatus, getNextLesson } from '../data/progress.js';
import ContentGate from '../components/ContentGate.jsx';
import CourseHeroCard from '../components/CourseHeroCard.jsx';
import LessonCard from '../components/LessonCard.jsx';
import styles from './CourseOverview.module.css';

export default function CourseOverview() {
  return (
    <ContentGate>
      <CourseOverviewContent />
    </ContentGate>
  );
}

function CourseOverviewContent() {
  const { courseId } = useParams();
  const { course, lessons } = useContent();
  const percent = getCoursePercent(lessons);
  const nextLesson = getNextLesson(lessons);
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
