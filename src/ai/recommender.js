import { generateText } from '../firebase/ai.js';
import { getCoursePercent, getNextLesson } from '../data/progress.js';
import { dueCount } from './srs.js';
import { topMisconceptions } from './memoryModel.js';

/**
 * Adaptive "what next" recommender.
 *
 * `buildRecommendation` is a PURE, rule-based decision over the learner profile,
 * persistent memory, and progress — it always returns a sensible next action even
 * with AI off (graceful degradation). `generateRecommendationRationale` adds a
 * single warm, one-line AI rationale on top; callers self-gate it on aiEnabled.
 *
 * Recommendation kinds: 'practice' (targeted / spaced review), 'lesson' (continue
 * the path), 'review' (course capstone), 'heatCheck' (timed mode for mastery).
 */

function courseIdOf(lessons) {
  return lessons?.[0]?.courseId || null;
}

/**
 * @returns {{
 *   kind: 'practice'|'lesson'|'review'|'heatCheck',
 *   title: string,
 *   reason: string,
 *   to: string,
 *   cta: string,
 *   topic?: string,
 * }}
 */
export function buildRecommendation({ profile, memory, lessons = [], progress } = {}) {
  const courseId = courseIdOf(lessons);
  const percent = getCoursePercent(lessons, progress);
  const due = dueCount(memory?.srs);
  const misc = topMisconceptions(memory, 1)[0];
  const nextLesson = getNextLesson(lessons, progress);

  // 1) Spaced-repetition cards that are due take priority — that's the whole point.
  if (due > 0) {
    return {
      kind: 'practice',
      title: 'Spaced review is due',
      reason: `${due} ${due === 1 ? 'topic is' : 'topics are'} due for review — a quick refresh now locks them into long-term memory.`,
      to: '/app/practice?due=1',
      cta: 'Start review',
    };
  }

  // 2) A recurring misconception worth targeting directly.
  if (misc && misc.count >= 2) {
    return {
      kind: 'practice',
      title: 'Clear up a sticking point',
      reason: `You've slipped on "${misc.label}" a few times. A short, targeted set can fix it.`,
      to: `/app/practice?topic=${encodeURIComponent(misc.topic || misc.label)}`,
      cta: 'Practice this',
      topic: misc.topic || misc.label,
    };
  }

  // 3) Course finished → consolidate via capstone review or push for mastery.
  if (percent >= 100) {
    const acc = profile?.overall?.accuracyPercent;
    if (acc != null && acc < 85 && courseId) {
      return {
        kind: 'review',
        title: 'Sharpen your weak spots',
        reason: `You've finished the course at ${acc}% first-try accuracy. Reshuffle the review to push toward mastery.`,
        to: `/app/courses/${courseId}/review`,
        cta: 'Open review',
      };
    }
    return {
      kind: 'heatCheck',
      title: 'Prove your mastery',
      reason: 'Course complete! Take a timed Heat Check to test recall under pressure and bank XP.',
      to: '/app/heat-check',
      cta: 'Start Heat Check',
    };
  }

  // 4) Otherwise, continue the learning path.
  if (nextLesson && courseId) {
    const started = percent > 0;
    return {
      kind: 'lesson',
      title: started ? `Continue: ${nextLesson.title}` : `Start: ${nextLesson.title}`,
      reason: started
        ? `Pick up Lesson ${nextLesson.orderIndex} where you left off and keep your streak alive.`
        : `Begin with Lesson ${nextLesson.orderIndex} to build your foundation.`,
      to: `/app/courses/${courseId}/lessons/${nextLesson.lessonId}`,
      cta: started ? 'Continue lesson' : 'Start lesson',
    };
  }

  // 5) Last-resort fallback when there is no course content at all.
  return {
    kind: 'practice',
    title: 'Practice anything',
    reason: 'Generate a custom practice set on any topic you want to strengthen.',
    to: '/app/practice',
    cta: 'Generate practice',
  };
}

/**
 * Produces a single warm, specific one-liner explaining the recommendation,
 * grounded in the learner profile text. Returns null on failure so callers fall
 * back to `recommendation.reason`.
 */
export async function generateRecommendationRationale(recommendation, profileText) {
  if (!recommendation) return null;
  const system = `You are a friendly chemistry tutor writing ONE short sentence (max ~22 words) telling a student (ages 14-16) why a recommended next step is a good idea right now.
Be warm, specific, and motivating. No greetings, no emoji, no quotes, no markdown — just the sentence.${
    profileText ? `\n\n${profileText}` : ''
  }`;
  const prompt = `Recommended next step: ${recommendation.title} (${recommendation.kind}).
Default rationale: ${recommendation.reason}
Write a better one-sentence rationale tailored to this learner.`;

  const text = await generateText(prompt, { system });
  if (!text) return null;
  const cleaned = text.trim().replace(/^["']|["']$/g, '').split('\n')[0].trim();
  return cleaned || null;
}
