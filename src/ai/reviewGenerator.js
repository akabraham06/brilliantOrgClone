import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';
import { formatProfileForPrompt, getWeakTopics } from './learnerProfile.js';

/**
 * AI "Practice what you missed" generator.
 *
 * Produces fresh multiple-choice review items targeted at the learner's weak
 * spots, shaped to match the existing review-item `slide` contract so they plug
 * straight into getCheckComponent('multipleChoice') with no renderer changes.
 * Returns null on any failure so callers fall back to the static pool.
 */

const REVIEW_SCHEMA = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          prompt: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
          topic: Schema.string(),
          hint: Schema.string(),
        },
        optionalProperties: ['topic', 'hint'],
      }),
    }),
  },
});

/** Validates and normalizes one raw AI question into a review item; null if bad. */
function normalizeItem(raw, i) {
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) return null;
  const options = Array.isArray(raw.options)
    ? raw.options.filter((o) => typeof o === 'string' && o.trim()).map((o) => o.trim())
    : [];
  const unique = [...new Set(options)];
  if (unique.length < 2) return null;
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : '';
  if (!answer || !unique.includes(answer)) return null;

  const id = `ai-review-${i}`;
  return {
    id,
    lessonId: 'ai',
    validationMode: 'multipleChoice',
    source: 'ai',
    slide: {
      slideId: id,
      isCheck: true,
      subtitle: raw.topic ? `Practice \u00b7 ${String(raw.topic).slice(0, 60)}` : 'Practice question',
      bodyText: '',
      instructions: '',
      checkConfig: {
        validationMode: 'multipleChoice',
        questions: [{ id: `${id}-q`, prompt: raw.prompt.trim(), options: unique, answer }],
        hint: typeof raw.hint === 'string' ? raw.hint.trim() : undefined,
        feedbackCorrect: 'Correct!',
        feedbackIncorrect: 'Not quite - review the idea and try again.',
      },
    },
  };
}

/**
 * Generates up to `count` review items tailored to the profile. Returns a
 * non-empty array on success, or null when AI is unavailable / output is unusable.
 */
export async function generateReviewItems(profile, lessons = [], { count = 6 } = {}) {
  const topics = getWeakTopics(profile, lessons, 6);
  const profileText = formatProfileForPrompt(profile);

  const system = `You are writing practice questions for an introductory chemistry course (ages 14-16).
Write clear, single-best-answer multiple-choice questions with exactly 3 plausible options each, only one correct.
Stay strictly within introductory chemistry. Never fabricate facts. Keep prompts concise.
Focus the questions on the student's weak topics: ${topics.join('; ')}.
${profileText ? `\n${profileText}` : ''}`;

  const prompt = `Generate ${count} multiple-choice review questions targeting the weak topics above. Each must have a "prompt", an "options" array of 3 distinct strings, an "answer" that exactly matches one option, an optional one-sentence "hint", and an optional "topic" label.`;

  const data = await generateJSON(prompt, REVIEW_SCHEMA, { system });
  if (!data || !Array.isArray(data.questions)) return null;

  const items = data.questions
    .map((q, i) => normalizeItem(q, i))
    .filter(Boolean)
    .slice(0, count);

  return items.length ? items : null;
}
