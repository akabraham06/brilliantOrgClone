import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import {
  getCoursePercent,
  getLessonStatus,
  getNextLesson,
  getLessonAccuracy,
} from '../data/progress.js';
import ContentGate from '../components/ContentGate.jsx';
import LessonIcon from '../components/LessonIcon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
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
  const { progress } = useProgress();

  const percent = getCoursePercent(lessons, progress);
  const nextLesson = getNextLesson(lessons, progress);
  const started = percent > 0;
  const courseComplete = percent >= 100;
  const totalExercises = lessons.reduce((sum, l) => sum + (l.slideCount || 0), 0);
  const base = `/app/courses/${courseId}`;
  const nextLink = `${base}/lessons/${nextLesson.lessonId}`;

  return (
    <div className={styles.page}>
      <Link to="/app/courses" className={styles.back}>
        &larr; Back to Science
      </Link>

      <div className={styles.layout}>
        <aside className={styles.info}>
          <LessonIcon icon={course.coverIcon} size={76} />
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.description}>{course.description}</p>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <span className={styles.statValue}>{lessons.length}</span> Lessons
            </span>
            <span className={styles.stat}>
              <span className={styles.statValue}>{totalExercises}</span> Exercises
            </span>
          </div>
          <ProgressBar
            percent={percent}
            label={<span>{started ? `${percent}% complete` : 'Not started yet'}</span>}
          />
        </aside>

        <div className={styles.pathCol}>
          <div className={styles.levelPill}>
            <span className={styles.levelEyebrow}>Level {nextLesson.orderIndex}</span>
            <span className={styles.levelName}>{nextLesson.title}</span>
          </div>

          <ol className={styles.path}>
            {lessons.map((lesson) => {
              const status = getLessonStatus(lesson.lessonId, progress);
              const isCurrent = lesson.lessonId === nextLesson.lessonId;
              const completed = status === 'completed';
              const accuracy = getLessonAccuracy(lesson.lessonId, progress);
              let nodeCls = styles.node;
              if (completed) nodeCls += ` ${styles.nodeDone}`;
              else if (isCurrent) nodeCls += ` ${styles.nodeCurrent}`;
              else nodeCls += ` ${styles.nodeLocked}`;

              return (
                <li key={lesson.lessonId}>
                  <Link to={`${base}/lessons/${lesson.lessonId}`} className={nodeCls}>
                    <span className={styles.marker} aria-hidden="true">
                      {completed ? (
                        <span className={styles.check}>&#10003;</span>
                      ) : isCurrent ? (
                        <span className={styles.pin} />
                      ) : (
                        <span className={styles.disc} />
                      )}
                    </span>
                    <span className={styles.nodeBody}>
                      <span className={styles.nodeNum}>Lesson {lesson.orderIndex}</span>
                      <span className={styles.nodeTitle}>{lesson.title}</span>
                      <span className={styles.nodeMeta}>
                        {completed
                          ? accuracy
                            ? `Completed \u00b7 ${accuracy.percent}% accuracy`
                            : 'Completed'
                          : isCurrent
                          ? started
                            ? 'Continue where you left off'
                            : 'Start here'
                          : `${lesson.slideCount} steps \u00b7 ~${lesson.estimatedMinutes} min`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <Link
            to={`${base}/review`}
            className={`${styles.reviewNode} ${courseComplete ? styles.reviewNodeDone : ''}`}
          >
            <span className={styles.reviewMarker} aria-hidden="true">
              {courseComplete ? '\u2605' : '\u{1F3C6}'}
            </span>
            <span className={styles.reviewBody}>
              <span className={styles.reviewEyebrow}>Capstone</span>
              <span className={styles.reviewTitle}>Course Review</span>
              <span className={styles.reviewMeta}>
                {courseComplete
                  ? 'Completed \u00b7 reshuffle for a fresh set'
                  : '~40 mixed questions from every lesson \u00b7 finish to complete the course'}
              </span>
            </span>
            <span className={styles.reviewArrow} aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      <div className={styles.ctaCard}>
        <div className={styles.ctaInfo}>
          <span className={styles.ctaEyebrow}>Lesson {nextLesson.orderIndex}</span>
          <span className={styles.ctaTitle}>{nextLesson.title}</span>
        </div>
        <Link to={nextLink} className={styles.ctaBtn}>
          {started ? 'Continue' : 'Start'}
        </Link>
      </div>
    </div>
  );
}
