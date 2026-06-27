import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';
import { formatProfileForPrompt, getWeakTopics } from './learnerProfile.js';
import { topMisconceptions } from './memoryModel.js';

/**
 * AI summarization for the rolling, cross-session learner memory.
 *
 * Folds the latest in-context progress profile + the accumulated misconception
 * ledger + the PREVIOUS memory summary into a fresh, compact memory: a short
 * narrative plus structured lists (recurring mistakes, mastered/weak concepts,
 * goals). Returns null on any failure so the store keeps the previous memory.
 *
 * This is what gives the tutor continuity: the output is fed back into the
 * learner profile (formatProfileForPrompt) so every AI feature reads the same
 * durable picture of the student across sessions and devices.
 */

const SUMMARY_SCHEMA = Schema.object({
  properties: {
    summary: Schema.string(),
    recurringMistakes: Schema.array({ items: Schema.string() }),
    masteredConcepts: Schema.array({ items: Schema.string() }),
    weakConcepts: Schema.array({ items: Schema.string() }),
    goals: Schema.array({ items: Schema.string() }),
  },
  optionalProperties: ['recurringMistakes', 'masteredConcepts', 'weakConcepts', 'goals'],
});

function list(arr) {
  return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim()) : [];
}

/**
 * @param {object} profile  enriched learner profile (progress-derived).
 * @param {object} prevMemory  the existing memory blob (for continuity).
 * @param {Array}  lessons  course lessons (for topic grounding).
 * @returns {Promise<null | {summary, recurringMistakes, masteredConcepts, weakConcepts, goals}>}
 */
export async function summarizeLearnerMemory(profile, prevMemory, lessons = []) {
  const profileText = formatProfileForPrompt({ ...profile, memory: null });
  const weak = getWeakTopics(profile, lessons, 6);
  const misc = topMisconceptions(prevMemory, 5)
    .map((m) => `${m.label} (seen ${m.count}x)`)
    .join('; ');

  const system = `You maintain a concise, durable "learner memory" for a student (ages 14-16) in an introductory chemistry course.
This memory persists across sessions and devices and is read by the tutor to personalize help. Be specific, kind, and accurate; never invent progress the data does not support.
Rules:
- "summary": 2-4 sentences in the third person about where this learner is — what they've got, what trips them up, and how to help. No greetings, no markdown.
- "recurringMistakes": short phrases naming patterns of error (not one-offs).
- "masteredConcepts" / "weakConcepts": short topic phrases.
- "goals": 1-3 concrete next steps for this learner.
- Keep every list to at most 6 short items. Stay strictly within introductory chemistry.`;

  const prompt = `Update the learner memory using the latest signals. Merge with the previous memory: keep what is still true, drop what is now stale, and reflect new progress.

Previous memory summary: ${prevMemory?.summary ? `"""${prevMemory.summary}"""` : '(none yet)'}
Previously noted weak concepts: ${list(prevMemory?.weakConcepts).join('; ') || '(none)'}
Previously noted mastered concepts: ${list(prevMemory?.masteredConcepts).join('; ') || '(none)'}
Recurring misconceptions logged: ${misc || '(none)'}

Latest progress profile:
${profileText || '(no graded activity yet)'}

Weak topics right now: ${weak.join('; ') || '(unknown)'}

Return the refreshed memory as JSON.`;

  const data = await generateJSON(prompt, SUMMARY_SCHEMA, { system });
  if (!data || typeof data.summary !== 'string' || !data.summary.trim()) return null;

  return {
    summary: data.summary.trim(),
    recurringMistakes: list(data.recurringMistakes),
    masteredConcepts: list(data.masteredConcepts),
    weakConcepts: list(data.weakConcepts),
    goals: list(data.goals),
  };
}
