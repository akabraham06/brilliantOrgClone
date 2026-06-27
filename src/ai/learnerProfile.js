/**
 * Learner-profile builder.
 *
 * Reads the per-learner progress signal already tracked by ProgressContext and
 * distills it into a compact summary that is injected into every AI prompt
 * (tutor, adaptive feedback, review generation, recap). This is the mechanism
 * that makes AI responses personalized to THIS student and their specific
 * mistakes.
 *
 * IMPORTANT: this is *in-context* personalization (prompting) — the profile is
 * passed as grounding text alongside the question. Nothing here trains or
 * fine-tunes a model; no learner data leaves the normal request path.
 *
 * The profile is additionally ENRICHED with the persistent, cross-session learner
 * memory (a rolling AI summary + recurring mistakes + top misconceptions, see
 * memoryModel.js). Memory is attached under `profile.memory` by buildLearnerProfile
 * and rendered by formatProfileForPrompt — WITHOUT changing the latter's call
 * signature — so every existing AI feature that already reads the profile
 * (tutor, adaptive feedback, review, recap) inherits long-term memory for free.
 */
import { hasMemorySignal, topMisconceptions } from './memoryModel.js';

const EMPTY_PROFILE = {
  overall: { attempted: 0, firstTryCorrect: 0, accuracyPercent: null },
  streak: 0,
  weakLessons: [],
  missedFirstTry: [],
  highAttempt: [],
};

function lessonTitle(lessons, lessonId) {
  const l = (lessons || []).find((x) => x.lessonId === lessonId);
  return l?.title || lessonId;
}

/**
 * Builds a structured profile from the progress object and the lesson list.
 *
 * @param {object} progress  ProgressContext `progress` shape.
 * @param {Array}  lessons   ContentContext `lessons` (for human-readable titles).
 * @returns structured profile (safe defaults when there is no signal yet).
 */
export function buildLearnerProfile(progress, lessons = [], memory = null) {
  if (!progress || !progress.lessons) return { ...EMPTY_PROFILE, memory: memory || null };

  let attempted = 0;
  let firstTryCorrect = 0;
  const weakLessons = [];
  const missedFirstTry = [];
  const highAttempt = [];

  for (const lesson of lessons) {
    const lp = progress.lessons[lesson.lessonId];
    if (!lp) continue;

    const percent = Math.min(100, Math.max(0, lp.percent || 0));
    const completed = !!lp.completed;
    // A lesson is "weak" if it's been touched but isn't mastered.
    if ((lp.completedSlideIds?.length || lp.lastSlideIndex) && (!completed || percent < 100)) {
      weakLessons.push({ lessonId: lesson.lessonId, title: lesson.title, percent });
    }

    const results = lp.checkResults || {};
    for (const slideId of Object.keys(results)) {
      const r = results[slideId];
      attempted += 1;
      if (r.firstAttemptCorrect) firstTryCorrect += 1;
      if (!r.firstAttemptCorrect) {
        missedFirstTry.push({ lessonId: lesson.lessonId, title: lesson.title, slideId });
      }
      if ((r.attempts || 0) >= 3 && !r.firstAttemptCorrect) {
        highAttempt.push({ lessonId: lesson.lessonId, title: lesson.title, slideId, attempts: r.attempts });
      }
    }
  }

  return {
    overall: {
      attempted,
      firstTryCorrect,
      accuracyPercent: attempted ? Math.round((firstTryCorrect / attempted) * 100) : null,
    },
    streak: progress.streakCount || 0,
    weakLessons,
    missedFirstTry,
    highAttempt,
    // Cross-session long-term memory (may be null for brand-new learners).
    memory: memory || null,
  };
}

/**
 * Renders the persistent learner memory as prompt-friendly lines. Returns [] when
 * there is no durable signal yet. Kept separate so formatProfileForPrompt can
 * fold it in without changing its signature.
 */
function formatMemoryLines(memory) {
  if (!hasMemorySignal(memory)) return [];
  const lines = [];
  if (memory.summary) lines.push(`- Long-term memory: ${memory.summary}`);
  if (memory.recurringMistakes?.length) {
    lines.push(`- Recurring mistakes: ${memory.recurringMistakes.slice(0, 5).join('; ')}.`);
  }
  const misc = topMisconceptions(memory, 4);
  if (misc.length) {
    lines.push(
      `- Tracked misconceptions: ${misc.map((m) => `${m.label} (${m.count}x)`).join('; ')}.`,
    );
  }
  if (memory.masteredConcepts?.length) {
    lines.push(`- Looks solid on: ${memory.masteredConcepts.slice(0, 5).join('; ')}.`);
  }
  if (memory.goals?.length) {
    lines.push(`- Current goals: ${memory.goals.slice(0, 3).join('; ')}.`);
  }
  return lines;
}

/**
 * Renders a profile as a short, prompt-friendly block. Returns '' when there is
 * no meaningful signal so prompts stay lean for brand-new learners.
 */
export function formatProfileForPrompt(profile) {
  if (!profile) return '';
  const memoryLines = formatMemoryLines(profile.memory);
  const hasProgressSignal = profile.overall.attempted > 0 || profile.weakLessons.length > 0;
  // Brand-new learner with no progress AND no durable memory → stay lean.
  if (!hasProgressSignal && !memoryLines.length) return '';

  const lines = ['Learner profile (use this to tailor your help; do not read it back verbatim):'];

  if (profile.overall.accuracyPercent != null) {
    lines.push(
      `- First-attempt accuracy: ${profile.overall.accuracyPercent}% (${profile.overall.firstTryCorrect}/${profile.overall.attempted} checks).`,
    );
  }
  if (profile.streak) lines.push(`- Current day streak: ${profile.streak}.`);

  if (profile.weakLessons.length) {
    const names = profile.weakLessons.slice(0, 4).map((w) => `${w.title} (${w.percent}%)`).join('; ');
    lines.push(`- Lessons still in progress / weaker: ${names}.`);
  }
  if (profile.missedFirstTry.length) {
    const topics = [...new Set(profile.missedFirstTry.map((m) => m.title))].slice(0, 4).join('; ');
    lines.push(`- Topics where they missed a check on the first try: ${topics}.`);
  }
  if (profile.highAttempt.length) {
    const topics = [...new Set(profile.highAttempt.map((m) => m.title))].slice(0, 3).join('; ');
    lines.push(`- Topics that took several attempts: ${topics}.`);
  }

  // Fold in the durable, cross-session memory.
  for (const line of memoryLines) lines.push(line);

  return lines.join('\n');
}

/**
 * Compact list of the lesson titles the learner is weakest at, used to seed the
 * AI review generator. Falls back to lesson titles when there's no signal.
 */
export function getWeakTopics(profile, lessons = [], limit = 5) {
  const titles = new Set();
  // Durable memory first: misconception topics + remembered weak concepts.
  const memory = profile?.memory;
  if (memory) {
    topMisconceptions(memory, 4).forEach((m) => m.topic && titles.add(m.topic));
    (memory.weakConcepts || []).forEach((t) => titles.add(t));
  }
  (profile?.highAttempt || []).forEach((m) => titles.add(m.title));
  (profile?.missedFirstTry || []).forEach((m) => titles.add(m.title));
  (profile?.weakLessons || []).forEach((m) => titles.add(m.title));
  const out = [...titles].slice(0, limit);
  if (out.length) return out;
  return (lessons || []).slice(0, limit).map((l) => `${lessonTitle(lessons, l.lessonId)}`);
}

/**
 * Formats a "current event" — the specific wrong option the learner just chose
 * on a check — into a one-line block to append at call time.
 */
export function formatWrongAnswerEvent(event) {
  if (!event) return '';
  const parts = ['The student just answered a check INCORRECTLY:'];
  if (event.prompt) parts.push(`Question: ${event.prompt}`);
  if (event.selected != null) {
    const chosen = Array.isArray(event.selected) ? event.selected.join(', ') : event.selected;
    parts.push(`They chose: ${chosen}`);
  }
  if (event.correct != null) {
    const right = Array.isArray(event.correct) ? event.correct.join(', ') : event.correct;
    parts.push(`Correct answer: ${right}`);
  }
  return parts.join('\n');
}
