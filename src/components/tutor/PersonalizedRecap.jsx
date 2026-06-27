import { useEffect, useRef, useState } from 'react';
import { streamText } from '../../firebase/ai.js';
import { useProgress } from '../../context/ProgressContext.jsx';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import { formatProfileForPrompt } from '../../ai/learnerProfile.js';
import { buildPreferenceInstruction } from '../../ai/tutorPrompt.js';
import reading from './readingStyle.module.css';
import styles from '../lesson/LessonComplete.module.css';

/**
 * Personalized lesson recap shown on the completion screen. Emphasizes the
 * concepts the learner struggled with in THIS lesson (from checkResults). Only
 * mounted when aiEnabled; renders nothing if generation fails, leaving the
 * static "You learned" recap as the fallback.
 */
export default function PersonalizedRecap({ lesson, accuracy }) {
  const { progress } = useProgress();
  const profile = useLearnerProfile();
  const { prefs } = usePreferences();
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const lp = progress.lessons?.[lesson.lessonId];
    const results = lp?.checkResults || {};
    const ids = Object.keys(results);
    const missedFirst = ids.filter((id) => !results[id].firstAttemptCorrect).length;
    const recapBullets = Array.isArray(lesson.recap) ? lesson.recap.join('; ') : '';

    const prefsInstruction = buildPreferenceInstruction(prefs);
    const system = `You are a warm chemistry tutor writing a short recap for a 14-16 year old who just finished the lesson "${lesson.title}".
Ground the recap ONLY in these key ideas from the lesson: ${recapBullets || lesson.title}.
Write 2-3 short sentences in second person ("you"). No markdown, no bullet lists. Be encouraging and concrete.
${formatProfileForPrompt(profile)}${prefsInstruction ? `\n\n${prefsInstruction}` : ''}`;

    const accuracyLine = accuracy
      ? `They got ${accuracy.correct}/${accuracy.total} checks right on the first try.`
      : 'There were no graded checks in this lesson.';
    const struggleLine = missedFirst
      ? `They stumbled on ${missedFirst} check${missedFirst > 1 ? 's' : ''} at first, so gently point them to the idea(s) worth a second look.`
      : 'They did well, so reinforce what they nailed and what it sets up next.';

    const prompt = `${accuracyLine} ${struggleLine} Write the recap now.`;

    let active = true;
    streamText(prompt, { system }, (_d, full) => {
      if (active) setText(full);
    }).then((full) => {
      if (active && full == null) setFailed(true);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed || !text) {
    // Nothing (or a brief nothing while streaming) — the static recap remains.
    return null;
  }

  return (
    <div className={styles.recapCard}>
      <span className={styles.recapTitle}>Your personalized recap</span>
      <p className={`${styles.recapAiText} ${reading.readingText}`}>{text}</p>
    </div>
  );
}
