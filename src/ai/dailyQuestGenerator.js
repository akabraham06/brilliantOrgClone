import { Schema, generateJSON } from '../firebase/ai.js';
import { aiEnabled } from '../firebase/ai.js';
import { getWeakTopics, formatProfileForPrompt } from './learnerProfile.js';
import { dueCards } from './srs.js';
import { getCoursePercent, getNextLesson, hasStarted } from '../data/progress.js';
import { selectDeterministicQuests, PRINCIPLE_META } from '../data/dailyQuests.js';

/**
 * AI-driven daily-quest generation.
 *
 * `buildDailyQuestContext` is PURE: it distills the learner's performance signal
 * (weak topics, misconceptions-via-memory, lessons due for spaced review,
 * interleaving candidates, course progress) into a compact context object.
 *
 * `generateDailyQuests` decides the day's 3–4 quests. The STRUCTURE (which
 * principles, their targets, links, and — critically — their REWARDS) is always
 * chosen deterministically by selectDeterministicQuests so the economy can never
 * be manipulated by the model. AI is used ONLY to rewrite the human-facing copy
 * (title/description/rationale) so quests feel personal. It degrades gracefully:
 * AI off, a network/parse failure, or unusable output all fall back to the
 * deterministic copy with no change to rewards or wiring.
 */

const COPY_SCHEMA = Schema.object({
  properties: {
    quests: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.string(),
          title: Schema.string(),
          description: Schema.string(),
          rationale: Schema.string(),
        },
        optionalProperties: ['rationale'],
      }),
    }),
  },
});

/** Distinct lesson titles the learner is at least familiar with (for interleaving). */
function interleaveCandidates(profile, lessons, progress) {
  const titles = new Set();
  const byId = new Map((lessons || []).map((l) => [l.lessonId, l.title]));
  (progress?.completedLessonIds || []).forEach((id) => byId.has(id) && titles.add(byId.get(id)));
  (profile?.weakLessons || []).forEach((w) => w.title && titles.add(w.title));
  return [...titles];
}

/**
 * Builds the pure performance context the quest selector + AI prompt consume.
 * Safe with empty/brand-new inputs.
 */
export function buildDailyQuestContext({ profile, memory, lessons = [], progress } = {}) {
  const courseId = lessons[0]?.courseId || null;
  const nextLesson = getNextLesson(lessons, progress);
  return {
    courseId,
    coursePercent: getCoursePercent(lessons, progress),
    started: hasStarted(progress),
    accuracyPercent: profile?.overall?.accuracyPercent ?? null,
    dueTopics: dueCards(memory?.srs).map((c) => c.topic).filter(Boolean),
    weakTopics: getWeakTopics(profile, lessons, 6),
    interleaveLessons: interleaveCandidates(profile, lessons, progress),
    nextLessonTo:
      nextLesson && courseId ? `/app/courses/${courseId}/lessons/${nextLesson.lessonId}` : null,
    // Free-response / challenge grading needs AI; gate the transfer quest on it.
    hasFreeResponse: aiEnabled,
  };
}

/** Merges validated AI copy onto the deterministic quests (structure preserved). */
function applyCopy(base, aiQuests) {
  if (!Array.isArray(aiQuests)) return base;
  const byId = new Map();
  for (const q of aiQuests) {
    if (q && typeof q.id === 'string') byId.set(q.id, q);
  }
  return base.map((quest) => {
    const c = byId.get(quest.id);
    if (!c) return quest;
    const title = typeof c.title === 'string' && c.title.trim() ? c.title.trim().slice(0, 80) : quest.title;
    const description =
      typeof c.description === 'string' && c.description.trim()
        ? c.description.trim().slice(0, 200)
        : quest.description;
    const rationale =
      typeof c.rationale === 'string' && c.rationale.trim()
        ? c.rationale.trim().slice(0, 240)
        : quest.rationale;
    // Only copy fields change — rewards/target/to/cta stay code-controlled.
    return { ...quest, title, description, rationale };
  });
}

/**
 * Returns the day's quests. Always resolves to a valid 3–4 quest set.
 * @returns {Promise<{ quests: Array, source: 'ai' | 'deterministic' }>}
 */
export async function generateDailyQuests({ context, profile } = {}) {
  const ctx = context || {};
  const base = selectDeterministicQuests(ctx);

  if (!aiEnabled) return { quests: base, source: 'deterministic' };

  const principles = base
    .map((q) => `- ${q.id} ("${PRINCIPLE_META[q.id]?.label}"): default → ${q.title} — ${q.description}`)
    .join('\n');
  const profileText = profile ? formatProfileForPrompt(profile) : '';
  const contextLines = [
    ctx.accuracyPercent != null ? `First-attempt accuracy: ${ctx.accuracyPercent}%.` : '',
    ctx.dueTopics.length ? `Topics due for spaced review: ${ctx.dueTopics.slice(0, 4).join('; ')}.` : '',
    ctx.weakTopics.length ? `Weaker areas: ${ctx.weakTopics.slice(0, 4).join('; ')}.` : '',
    ctx.interleaveLessons.length >= 2
      ? `Familiar lessons to interleave: ${ctx.interleaveLessons.slice(0, 4).join('; ')}.`
      : '',
    `Course progress: ${ctx.coursePercent || 0}%.`,
  ].filter(Boolean);

  const system = `You write short, motivating DAILY QUEST copy for a learner (ages 14-16) in an introductory chemistry course.
You are given a fixed list of quests (each with a stable "id"). Rewrite ONLY the wording so each quest feels personal and specific to THIS learner's situation.
Hard rules:
- Return EXACTLY one entry per provided id; do not invent, drop, merge, or reorder ids.
- A quest describes a LEARNING ACTION to perform in the app. NEVER include the answer to any chemistry question, hints, or chemistry facts.
- "title": punchy, <= 6 words. "description": one sentence (<= 22 words) that keeps the same action and any number/target implied by the default. "rationale": one short sentence on WHY this builds durable learning (no jargon, no citations).
- Encourage the student to do the thinking themselves; never imply AI will answer for them.
- Plain text only: no emoji, no markdown, no quotes.
${profileText ? `\n${profileText}` : ''}`;

  const prompt = `Learner context:\n${contextLines.join('\n')}\n\nQuests to rewrite (keep each id):\n${principles}\n\nReturn JSON { "quests": [ { "id", "title", "description", "rationale" } ] }.`;

  try {
    const data = await generateJSON(prompt, COPY_SCHEMA, { system });
    if (!data || !Array.isArray(data.quests)) return { quests: base, source: 'deterministic' };
    return { quests: applyCopy(base, data.quests), source: 'ai' };
  } catch {
    return { quests: base, source: 'deterministic' };
  }
}
