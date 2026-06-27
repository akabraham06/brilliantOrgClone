import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';
import { formatProfileForPrompt } from './learnerProfile.js';

/**
 * On-demand practice-set generator.
 *
 * Turns a learner's request ("10 questions on moles") into a fresh MIXED set of
 * multiple-choice + short free-response questions, grounded in the course's own
 * topics so it never drifts beyond introductory chemistry. MCQ items are checked
 * locally; FR items reuse the existing AI grading path (gradeFreeResponse) on the
 * practice page. Returns null on any failure so the page can show a friendly
 * fallback message.
 */

const PRACTICE_SCHEMA = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          type: Schema.string(), // "mcq" | "fr"
          prompt: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
          rubric: Schema.string(),
          topic: Schema.string(),
          hint: Schema.string(),
        },
        optionalProperties: ['options', 'answer', 'rubric', 'topic', 'hint'],
      }),
    }),
  },
});

/** Compact, prompt-friendly catalog of the course's topics for grounding. */
export function courseTopics(lessons = []) {
  return lessons
    .map((l) => {
      const objs = Array.isArray(l.learningObjectives) ? l.learningObjectives.slice(0, 3).join('; ') : '';
      return `- ${l.title}${objs ? `: ${objs}` : ''}`;
    })
    .join('\n');
}

function normalizeItem(raw, i) {
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) return null;
  const topic = typeof raw.topic === 'string' ? raw.topic.trim() : '';
  const id = `practice-${i}`;
  const type = raw.type === 'fr' ? 'fr' : raw.options ? 'mcq' : raw.rubric ? 'fr' : 'mcq';

  if (type === 'fr') {
    const rubric = typeof raw.rubric === 'string' ? raw.rubric.trim() : '';
    if (!rubric) return null;
    return { id, type: 'fr', prompt: raw.prompt.trim(), rubric, topic };
  }

  const options = Array.isArray(raw.options)
    ? [...new Set(raw.options.filter((o) => typeof o === 'string' && o.trim()).map((o) => o.trim()))]
    : [];
  if (options.length < 2) return null;
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : '';
  if (!answer || !options.includes(answer)) return null;
  return {
    id,
    type: 'mcq',
    prompt: raw.prompt.trim(),
    options,
    answer,
    topic,
    hint: typeof raw.hint === 'string' ? raw.hint.trim() : '',
  };
}

/**
 * @param {object} params
 * @param {string} params.topic    learner's requested focus (free text).
 * @param {number} [params.count]  desired question count (clamped 3..12).
 * @param {object} [params.profile] enriched learner profile (for tailoring).
 * @param {Array}  [params.lessons] course lessons (topic grounding).
 * @returns {Promise<null | Array<object>>}
 */
export async function generatePracticeSet({ topic, count = 8, profile, lessons = [] } = {}) {
  const n = Math.max(3, Math.min(12, Math.round(count) || 8));
  const focus = (topic || '').trim();
  const profileText = profile ? formatProfileForPrompt(profile) : '';
  const catalog = courseTopics(lessons);

  const system = `You are writing a practice set for an introductory chemistry course (ages 14-16).
Produce a MIX of "mcq" (single-best-answer multiple choice, exactly 3 distinct options, one correct) and "fr" (short free-response) questions — aim for roughly 70% mcq, 30% fr.
Rules:
- Each question has a "type" of exactly "mcq" or "fr".
- mcq: include "options" (3 distinct strings), an "answer" that EXACTLY matches one option, and an optional one-sentence "hint".
- fr: include a "rubric" describing what a correct short answer must convey (used to grade it).
- Always include a short "topic" label.
- Stay STRICTLY within the course's topics below; never invent facts or go beyond introductory chemistry.
- Keep prompts clear and concise.

Course topics:
${catalog}
${profileText ? `\n${profileText}` : ''}`;

  const prompt = `Generate ${n} practice questions${
    focus ? ` focused on: "${focus}"` : ' spanning the learner\'s weak areas'
  }. Return an array "questions" as specified.`;

  const data = await generateJSON(prompt, PRACTICE_SCHEMA, { system });
  if (!data || !Array.isArray(data.questions)) return null;

  const items = data.questions.map((q, i) => normalizeItem(q, i)).filter(Boolean).slice(0, n);
  return items.length ? items : null;
}
