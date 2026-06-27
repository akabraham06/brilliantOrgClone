import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';

/**
 * AI grading for short free-response answers in skill checks.
 *
 * Given a question prompt, a grading rubric, the learner's written answer, and
 * some lesson context, returns a structured grade. Mirrors the validate/fallback
 * pattern of adaptiveLessonCheck.js: returns null on any failure so callers can
 * degrade gracefully (the FreeResponseCheck treats null as "couldn't grade").
 */

const GRADE_SCHEMA = Schema.object({
  properties: {
    correct: Schema.boolean(),
    score: Schema.number(), // 0..1 mastery of the rubric
    feedback: Schema.string(), // 2-3 sentences, warm + specific
    missedConcepts: Schema.array({ items: Schema.string() }),
  },
  optionalProperties: ['missedConcepts'],
});

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(1, x));
}

/**
 * @returns {Promise<{correct:boolean, score:number, feedback:string, missedConcepts:string[]} | null>}
 */
export async function gradeFreeResponse({ prompt, rubric, answer, slideContext } = {}) {
  const text = typeof answer === 'string' ? answer.trim() : '';
  // Empty answers are graded locally as incorrect (no need to spend a call).
  if (!text) {
    return {
      correct: false,
      score: 0,
      feedback: 'It looks like the answer was empty — give it a try in a sentence or two!',
      missedConcepts: [],
    };
  }

  const system = `You are grading a SHORT free-response answer from a student (ages 14-16) in an introductory chemistry course.
Grade ONLY against the provided rubric and lesson context. Be encouraging but honest.
- "correct" is true only if the answer captures the rubric's essential idea (minor wording/omissions are fine).
- "score" is 0..1 reflecting how fully the rubric was met.
- "feedback" is 2-3 short sentences: affirm what's right, then gently fix what's missing. Never just restate the rubric verbatim.
- Stay strictly within introductory chemistry; never invent facts.${
    slideContext ? `\n\nLesson context:\n${String(slideContext).slice(0, 800)}` : ''
  }`;

  const userPrompt = `Question: ${prompt}
Rubric (what a correct answer must convey): ${rubric}
Student's answer: """${text.slice(0, 1200)}"""

Grade the answer.`;

  const data = await generateJSON(userPrompt, GRADE_SCHEMA, { system });
  if (!data || typeof data.feedback !== 'string' || !data.feedback.trim()) return null;

  const score = clamp01(data.score);
  const correct = typeof data.correct === 'boolean' ? data.correct : score != null && score >= 0.7;

  return {
    correct,
    score: score == null ? (correct ? 1 : 0) : score,
    feedback: data.feedback.trim(),
    missedConcepts: Array.isArray(data.missedConcepts)
      ? data.missedConcepts.filter((c) => typeof c === 'string' && c.trim()).map((c) => c.trim())
      : [],
  };
}
