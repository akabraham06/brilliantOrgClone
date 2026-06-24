import { useAuth } from '../context/AuthContext.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { getCoursePercent, getNextLesson, getLessonPercent, hasStarted, getCourseAccuracy } from '../data/progress.js';
import ContentGate from '../components/ContentGate.jsx';
import ContinueLearningCard from '../components/ContinueLearningCard.jsx';
import StreakWidget from '../components/StreakWidget.jsx';
import CourseHeroCard from '../components/CourseHeroCard.jsx';
import styles from './Home.module.css';

export default function Home() {
  return (
    <ContentGate>
      <HomeContent />
    </ContentGate>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const { course, lessons } = useContent();
  const { progress } = useProgress();
  const name = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  const percent = getCoursePercent(lessons, progress);
  const nextLesson = getNextLesson(lessons, progress);
  const started = hasStarted(progress);
  const slidePercent = getLessonPercent(nextLesson?.lessonId, progress);
  const accuracy = getCourseAccuracy(lessons, progress);

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
            streakCount={progress.streakCount || 0}
            completedLessons={progress.completedLessonIds?.length || 0}
          />
          <div className={styles.goalCard}>
            <span className={styles.goalEyebrow}>Today&rsquo;s goal</span>
            <p className={styles.goalText}>
              Finish one lesson to keep your streak alive.
            </p>
            <p className={styles.goalProgress}>
              You&rsquo;re <strong>{percent}%</strong> through {course.title}.
            </p>
            {accuracy && (
              <p className={styles.goalProgress}>
                Skill-check accuracy: <strong>{accuracy.percent}%</strong> ({accuracy.correct}/{accuracy.total} right)
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
