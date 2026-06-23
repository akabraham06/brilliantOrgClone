import { useAuth } from '../context/AuthContext.jsx';
import {
  course,
  lessons,
  mockProgress,
  getCoursePercent,
  getNextLesson,
} from '../data/staticContent.js';
import ContinueLearningCard from '../components/ContinueLearningCard.jsx';
import StreakWidget from '../components/StreakWidget.jsx';
import CourseHeroCard from '../components/CourseHeroCard.jsx';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();
  const name = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  const percent = getCoursePercent();
  const nextLesson = getNextLesson();
  const started = mockProgress.completedLessonIds.length > 0;
  const slidePercent = Math.round(
    (mockProgress.currentSlideIndex / (nextLesson.slideCount || 8)) * 100,
  );

  const lessonLink = `/app/courses/${course.courseId}/lessons/${nextLesson.lessonId}`;
  const courseLink = `/app/courses/${course.courseId}`;

  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1 className={styles.heading}>
          {started ? `Welcome back, ${name}` : `Welcome, ${name}`}
        </h1>
        <p className={styles.subhead}>
          {started
            ? 'Pick up right where you left off.'
            : 'Start your first chemistry lesson today.'}
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.main}>
          <ContinueLearningCard
            lesson={nextLesson}
            to={lessonLink}
            resume={started}
            slidePercent={slidePercent}
          />
          <CourseHeroCard
            course={course}
            percent={percent}
            lessonCount={lessons.length}
            to={courseLink}
            ctaLabel="Go to course"
          />
        </div>

        <aside className={styles.side}>
          <StreakWidget
            streakCount={mockProgress.streakCount}
            completedLessons={mockProgress.completedLessonIds.length}
          />
          <div className={styles.goalCard}>
            <span className={styles.goalEyebrow}>Today&rsquo;s goal</span>
            <p className={styles.goalText}>
              Finish one lesson to keep your streak alive.
            </p>
            <ProgressNote percent={percent} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProgressNote({ percent }) {
  return (
    <p className={styles.goalProgress}>
      You&rsquo;re <strong>{percent}%</strong> through Introduction to Chemistry.
    </p>
  );
}
