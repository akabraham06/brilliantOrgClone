import { useEffect, useRef, useState } from 'react';
import { streamText } from '../../firebase/ai.js';
import { useTutor } from '../../context/TutorContext.jsx';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import { formatProfileForPrompt } from '../../ai/learnerProfile.js';
import { buildTutorSystem } from '../../ai/tutorPrompt.js';
import TutorFeedback from './TutorFeedback.jsx';
import reading from './readingStyle.module.css';
import styles from '../lesson/checks/Check.module.css';

/**
 * Streams an AI explanation tailored to the learner's specific wrong choice into
 * the check's feedback area. Renders the static `fallbackHint` immediately and
 * permanently if the AI call fails — it never blocks or replaces the validation
 * flow. Only mounted by callers when `aiEnabled` is true and the answer is wrong.
 */
export default function AdaptiveFeedback({ slide, wrongs = [], fallbackHint }) {
  const profile = useLearnerProfile();
  const { reportWrongAnswer } = useTutor();
  const { prefs } = usePreferences();
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const first = wrongs[0];
    if (first) {
      reportWrongAnswer({
        prompt: first.prompt,
        selected: first.selected,
        correct: first.correct,
        slideId: slide?.slideId,
      });
    }

    let active = true;
    const wrongText = wrongs
      .map(
        (w, i) =>
          `${i + 1}. Question: ${w.prompt}\n   They chose: ${w.selected}\n   Correct answer: ${w.correct}`,
      )
      .join('\n');
    const system = buildTutorSystem({
      slide,
      profileText: formatProfileForPrompt(profile),
      wrongText: `The student just answered this check INCORRECTLY:\n${wrongText}`,
      withIllustration: false,
      prefs,
    });
    const prompt =
      'In 2-3 short sentences total, gently explain the specific misconception behind THEIR wrong choice and nudge them toward the right idea. Do not simply restate the correct answer — help them see why their choice does not work.';

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

  if (failed || (!text && wrongs.length === 0)) {
    return fallbackHint ? <p className={styles.hint}>Hint: {fallbackHint}</p> : null;
  }

  if (!text) {
    // Static hint shows instantly while the tailored explanation streams in.
    return (
      <div className={styles.aiBlock}>
        {fallbackHint && <p className={styles.hint}>Hint: {fallbackHint}</p>}
        <span className={styles.aiThinking}>
          <span className={styles.aiDots}><span /><span /><span /></span>
          Tutor is tailoring a hint…
        </span>
      </div>
    );
  }

  return (
    <div className={styles.aiBlock}>
      <span className={styles.badge}>Tutor</span>
      <p className={`${styles.aiText} ${reading.readingText}`}>{text}</p>
      <TutorFeedback surface="feedback" slideId={slide?.slideId} />
    </div>
  );
}
