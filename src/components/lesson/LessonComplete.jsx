import { Link } from 'react-router-dom';
import LessonIcon from '../LessonIcon.jsx';
import { aiEnabled } from '../../firebase/ai.js';
import { useEconomy } from '../../context/EconomyContext.jsx';
import Avatar from '../avatar/Avatar.jsx';
import CoinIcon from '../economy/CoinIcon.jsx';
import PersonalizedRecap from '../tutor/PersonalizedRecap.jsx';
import styles from './LessonComplete.module.css';

/**
 * Lesson completion summary shown after the final slide: celebration, a recap
 * of the lesson, and a CTA to the next recommended lesson (or back to course).
 */
export default function LessonComplete({
  lesson,
  nextLesson,
  courseLink,
  nextLessonLink,
  accuracy = null,
  slideCount = 0,
  streakCount = 0,
  startStats = null,
}) {
  const { economy, level, coins, levelInfo } = useEconomy();
  const earnedXp = startStats ? Math.max(0, economy.xp - startStats.xp) : 0;
  const earnedCoins = startStats ? Math.max(0, coins - startStats.coins) : 0;
  const leveledUp = startStats ? level > startStats.level : false;
  const showReward = earnedXp > 0 || earnedCoins > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.avatarCelebrate}>
        <Avatar equipped={economy.equipped} size={120} title="Your avatar" allow3D />
        <span className={styles.badge} aria-hidden="true">&#10003;</span>
      </div>
      <h1 className={styles.title}>Lesson complete!</h1>
      <p className={styles.subtitle}>
        You finished <strong>{lesson.title}</strong>. Great work building your
        intuition.
      </p>

      {showReward && (
        <div className={styles.rewardCard}>
          {leveledUp && (
            <div className={styles.levelUpBanner}>
              &#11088; Level up! You reached <strong>level {level}</strong>.
            </div>
          )}
          <div className={styles.rewardRow}>
            <div className={styles.rewardChip}>
              <span className={styles.rewardChipVal}>+{earnedXp}</span>
              <span className={styles.rewardChipLabel}>XP earned</span>
            </div>
            <div className={styles.rewardChip}>
              <span className={styles.rewardChipVal}>
                <CoinIcon size={18} /> +{earnedCoins}
              </span>
              <span className={styles.rewardChipLabel}>Coins earned</span>
            </div>
          </div>
          <div className={styles.levelRow}>
            <span className={styles.levelBadge}>Lv {level}</span>
            <span className={styles.xpBar} aria-hidden="true">
              <span className={styles.xpFill} style={{ width: `${levelInfo.pct}%` }} />
            </span>
            <span className={styles.levelNext}>
              {levelInfo.atMax ? 'Max level' : `${levelInfo.toNext} XP to next`}
            </span>
          </div>
          <Link to="/app/store" className={styles.spendLink}>
            Spend coins in the Store &rarr;
          </Link>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{accuracy ? `${accuracy.percent}%` : '\u2014'}</span>
          <span className={styles.statLabel}>
            {accuracy ? `Skill-check accuracy (${accuracy.correct}/${accuracy.total})` : 'No checks in this lesson'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{slideCount}</span>
          <span className={styles.statLabel}>Slides completed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{streakCount}&#128293;</span>
          <span className={styles.statLabel}>Day streak</span>
        </div>
      </div>

      {aiEnabled && <PersonalizedRecap lesson={lesson} accuracy={accuracy} />}

      {Array.isArray(lesson.recap) && lesson.recap.length > 0 && (
        <div className={styles.recapCard}>
          <span className={styles.recapTitle}>You learned</span>
          <ul className={styles.recapList}>
            {lesson.recap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {nextLesson ? (
        <div className={styles.nextCard}>
          <span className={styles.nextEyebrow}>Up next</span>
          <div className={styles.nextRow}>
            <LessonIcon icon={nextLesson.icon} size={52} />
            <div>
              <div className={styles.nextLessonNum}>Lesson {nextLesson.orderIndex}</div>
              <div className={styles.nextTitle}>{nextLesson.title}</div>
            </div>
          </div>
          <Link to={nextLessonLink} className={styles.primaryCta}>
            Start next lesson
          </Link>
        </div>
      ) : (
        <div className={styles.nextCard}>
          <p className={styles.allDone}>
            That was the last lesson - you&rsquo;ve completed the course!
          </p>
        </div>
      )}

      <Link to={courseLink} className={styles.secondaryCta}>
        Back to course
      </Link>
    </div>
  );
}
