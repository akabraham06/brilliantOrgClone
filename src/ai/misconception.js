import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';

/**
 * Misconception detection & naming.
 *
 * When a learner misses a check, this classifies the underlying error into a
 * NAMED, reusable misconception (a stable id + short human label + topic) so the
 * app can accumulate counts over time and surface a "misconception report" and
 * targeted remediation. Returns null on any failure so callers simply skip
 * logging (the miss is still recorded elsewhere via progress).
 *
 * The id is normalized from the label so the same misconception logged on
 * different questions collapses into one accumulating entry.
 */

const MISCONCEPTION_SCHEMA = Schema.object({
  properties: {
    isMisconception: Schema.boolean(),
    label: Schema.string(),
    topic: Schema.string(),
  },
  optionalProperties: ['topic'],
});

/** Stable id from a label, e.g. "Confuses mass and weight" -> "confuses-mass-and-weight". */
export function misconceptionId(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * @param {object} params
 * @param {string} params.prompt        the question prompt.
 * @param {string} [params.selected]    the learner's (wrong) answer, if known.
 * @param {string} [params.correct]     the correct answer.
 * @param {string} [params.topic]       topic/lesson title for grounding.
 * @param {string} [params.slideContext] extra lesson context.
 * @returns {Promise<null | {id, label, topic}>}
 */
export async function classifyMisconception({
  prompt,
  selected,
  correct,
  topic,
  slideContext,
} = {}) {
  if (!prompt || typeof prompt !== 'string') return null;

  const system = `You are analyzing a single wrong answer from a student (ages 14-16) in an introductory chemistry course.
Name the SPECIFIC underlying misconception in a short, reusable phrase (e.g. "Confuses mass and weight", "Thinks coefficients change subscripts", "Reads pH scale backwards").
Rules:
- "isMisconception" is false for careless slips or when no clear conceptual error is identifiable.
- "label" is a concise noun/verb phrase (max ~8 words), reusable across questions, describing the MISTAKE — not the topic.
- "topic" is the short chemistry topic it falls under.
- Stay strictly within introductory chemistry; never invent facts.${
    slideContext ? `\n\nLesson context:\n${String(slideContext).slice(0, 600)}` : ''
  }`;

  const userPrompt = `Question: ${prompt}
${selected != null ? `Student's answer: ${Array.isArray(selected) ? selected.join(', ') : selected}` : ''}
${correct != null ? `Correct answer: ${Array.isArray(correct) ? correct.join(', ') : correct}` : ''}
${topic ? `Topic: ${topic}` : ''}

Classify the misconception.`;

  const data = await generateJSON(userPrompt, MISCONCEPTION_SCHEMA, { system });
  if (!data || data.isMisconception === false) return null;
  const label = typeof data.label === 'string' ? data.label.trim() : '';
  if (!label) return null;
  const id = misconceptionId(label);
  if (!id) return null;

  return {
    id,
    label: label.slice(0, 140),
    topic: typeof data.topic === 'string' ? data.topic.trim().slice(0, 80) : topic || '',
  };
}
