import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { getCoursePercent } from '../data/progress.js';
import ContentGate from '../components/ContentGate.jsx';
import LessonIcon from '../components/LessonIcon.jsx';
import styles from './Courses.module.css';

export default function Courses() {
  return (
    <ContentGate>
      <CoursesContent />
    </ContentGate>
  );
}

function CoursesContent() {
  const { course, lessons } = useContent();
  const { progress } = useProgress();
  const percent = getCoursePercent(lessons, progress);
  const courseLink = `/app/courses/${course.courseId}`;
  const isNew = percent === 0;

  return (
    <div className={styles.page}>
      <header className={styles.subjectHeader}>
        <span className={styles.subjectIcon} aria-hidden="true">
          <LessonIcon icon="beaker" size={64} />
        </span>
        <div>
          <p className={styles.eyebrow}>Grades 9-11</p>
          <h1 className={styles.subjectTitle}>Science</h1>
          <p className={styles.subjectTagline}>
            Build chemistry intuition for high school and beyond.
          </p>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.courseGrid}>
          <div className={styles.courseItem}>
            <div className={styles.cardWrap}>
              <span className={styles.gradeTag}>GR 9-11</span>
              {isNew && <span className={styles.newBadge}>NEW</span>}
              <Link to={courseLink} className={styles.courseCard}>
                <span className={styles.courseArt} aria-hidden="true">
                  <LessonIcon icon={course.coverIcon} size={84} />
                </span>
                {percent > 0 && (
                  <span className={styles.cardProgress} aria-hidden="true">
                    <span className={styles.cardProgressFill} style={{ width: `${percent}%` }} />
                  </span>
                )}
              </Link>
            </div>
            <span className={styles.courseLabel}>{course.title}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
