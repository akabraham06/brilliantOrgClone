import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiEnabled } from '../../firebase/ai.js';
import { useContent } from '../../context/ContentContext.jsx';
import { useProgress } from '../../context/ProgressContext.jsx';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import { useLearnerMemory } from '../../ai/useLearnerMemory.js';
import { formatProfileForPrompt } from '../../ai/learnerProfile.js';
import {
  buildRecommendation,
  generateRecommendationRationale,
} from '../../ai/recommender.js';
import styles from './NextStepCard.module.css';

const KIND_LABEL = {
  practice: 'Recommended practice',
  lesson: 'Recommended lesson',
  review: 'Recommended review',
  heatCheck: 'Recommended challenge',
};

/**
 * Adaptive "what next" card. Picks the single best next action from the learner's
 * profile + memory + progress (pure, rule-based) and decorates it with a one-line
 * AI rationale when AI is on. Also seeds spaced-repetition cards from genuine
 * weak spots so the "due for review" loop has something to schedule.
 */
export default function NextStepCard({ className = '' }) {
  const { lessons } = useContent();
  const { progress } = useProgress();
  const profile = useLearnerProfile();
  const { memory, loaded, seedReviewTopics } = useLearnerMemory();

  const recommendation = useMemo(
    () => buildRecommendation({ profile, memory, lessons, progress }),
    [profile, memory, lessons, progress],
  );

  const profileText = useMemo(() => formatProfileForPrompt(profile), [profile]);
  const [rationale, setRationale] = useState(null);
  const fetchedKeyRef = useRef(null);

  // Seed SRS from genuinely-missed topics so spaced review has cards to surface.
  useEffect(() => {
    if (!loaded) return;
    const topics = [];
    (profile.missedFirstTry || []).forEach((m) => topics.push({ topic: m.title, lessonId: m.lessonId }));
    (profile.highAttempt || []).forEach((m) => topics.push({ topic: m.title, lessonId: m.lessonId }));
    (memory.weakConcepts || []).forEach((t) => topics.push({ topic: t }));
    if (topics.length) seedReviewTopics(topics);
  }, [loaded, profile, memory.weakConcepts, seedReviewTopics]);

  // One AI rationale per distinct recommendation target; degrade to the rule-based reason.
  useEffect(() => {
    if (!aiEnabled) return undefined;
    const key = recommendation.to;
    if (fetchedKeyRef.current === key) return undefined;
    fetchedKeyRef.current = key;
    setRationale(null);
    let alive = true;
    generateRecommendationRationale(recommendation, profileText).then((r) => {
      if (alive && r) setRationale(r);
    });
    return () => {
      alive = false;
    };
  }, [recommendation, profileText]);

  return (
    <section className={`${styles.card} ${className}`} aria-label="Recommended next step">
      <div className={styles.head}>
        <span className={styles.eyebrow}>{KIND_LABEL[recommendation.kind] || 'Up next'}</span>
      </div>
      <h2 className={styles.title}>{recommendation.title}</h2>
      <p className={styles.reason}>{rationale || recommendation.reason}</p>
      <Link to={recommendation.to} className={styles.cta}>
        {recommendation.cta} <span aria-hidden="true">&rarr;</span>
      </Link>
    </section>
  );
}
