import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';

/**
 * AI-managed adaptive end-of-lesson skill check.
 *
 * Generates fresh, randomized multiple-choice questions for the FINAL check
 * slide of a lesson, grounded in that lesson's concept slides. Difficulty and
 * topic focus are driven by the learner's in-lesson comprehension (how they did
 * on the earlier check slides of the same lesson). Output is shaped to the
 * app's `checkConfig` contract so it renders through MultipleChoiceCheck with no
 * renderer changes. Returns null on any failure so the caller falls back to the
 * authored static check.
 */

const DEFAULT_COUNT = 4;
const MIN_QUESTIONS = 2;

const ADAPTIVE_SCHEMA = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          prompt: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
          hint: Schema.string(),
        },
        optionalProperties: ['hint'],
      }),
    }),
    feedbackCorrect: Schema.string(),
    feedbackIncorrect: Schema.string(),
    hint: Schema.string(),
  },
  optionalProperties: ['feedbackCorrect', 'feedbackIncorrect', 'hint'],
});

/**
 * The final check slide of a lesson is the check slide with the highest
 * orderIndex among that lesson's slides.
 */
export function isFinalCheckSlide(slide, lessonSlides) {
  if (!slide?.isCheck || !Array.isArray(lessonSlides) || lessonSlides.length === 0) {
    return false;
  }
  const checks = lessonSlides.filter((s) => s?.isCheck);
  if (checks.length === 0) return false;
  const maxOrder = checks.reduce((m, s) => Math.max(m, s.orderIndex ?? 0), -Infinity);
  return (slide.orderIndex ?? 0) === maxOrder;
}

/**
 * Distills how the learner did on the EARLIER check slides of this lesson into a
 * comprehension score and difficulty level. Earlier = check slides with a
 * smaller orderIndex than the final check slide.
 */
export function computeInLessonComprehension(lessonSlides, finalSlide, checkResults) {
  const earlier = (lessonSlides || []).filter(
    (s) => s?.isCheck && (s.orderIndex ?? 0) < (finalSlide?.orderIndex ?? 0),
  );

  let answered = 0;
  let firstTry = 0;
  let totalAttempts = 0;
  const missed = [];

  for (const s of earlier) {
    const r = checkResults?.[s.slideId];
    if (!r) continue;
    answered += 1;
    if (r.firstAttemptCorrect) firstTry += 1;
    totalAttempts += r.attempts || 1;
    if (!r.firstAttemptCorrect) {
      missed.push({ subtitle: s.subtitle, learningGoal: s.learningGoal });
    }
  }

  const firstTryRate = answered ? firstTry / answered : null;
  const avgAttempts = answered ? totalAttempts / answered : null;

  let score = null;
  if (firstTryRate != null) {
    const attemptPenalty = avgAttempts ? Math.min(0.3, (avgAttempts - 1) * 0.15) : 0;
    score = Math.max(0, Math.min(1, firstTryRate - attemptPenalty));
  }

  let level = 'medium';
  if (score != null) {
    if (score < 0.5) level = 'foundational';
    else if (score >= 0.8) level = 'challenge';
  }

  return { answered, firstTryRate, avgAttempts, score, level, missed };
}

function percentLabel(rate) {
  return rate == null ? null : `${Math.round(rate * 100)}%`;
}

function difficultyInstruction(comp) {
  const pct = percentLabel(comp.firstTryRate);
  if (comp.level === 'foundational') {
    const topics = comp.missed.map((m) => m.subtitle).filter(Boolean);
    const focus = topics.length ? topics.join('; ') : 'the core ideas of this lesson';
    return `The learner STRUGGLED on the earlier checks in this lesson${pct ? ` (first-try accuracy ${pct})` : ''}. Make the questions FOUNDATIONAL and confidence-building: test core definitions and single-step recognition. Prioritize the specific concepts they missed: ${focus}. Avoid multi-step synthesis and trick questions.`;
  }
  if (comp.level === 'challenge') {
    return `The learner did VERY WELL on the earlier checks in this lesson${pct ? ` (first-try accuracy ${pct})` : ''}. Make the questions CHALLENGING: require connecting two or more ideas from the lesson, applying a concept to a new scenario, or light multi-step reasoning. Avoid trivial recall.`;
  }
  return `The learner showed MODERATE comprehension on the earlier checks${pct ? ` (first-try accuracy ${pct})` : ''}. Use a BALANCED mix: mostly solid core-understanding questions plus one slightly harder application question.`;
}

function conceptGrounding(lessonSlides) {
  const concepts = (lessonSlides || []).filter((s) => !s?.isCheck && (s.bodyText || s.subtitle));
  return concepts
    .map((s, i) => {
      const parts = [`${i + 1}. ${s.subtitle || 'Concept'}`];
      if (s.learningGoal && s.learningGoal !== s.subtitle) parts.push(`Goal: ${s.learningGoal}`);
      if (s.bodyText) parts.push(String(s.bodyText).slice(0, 500));
      return parts.join(' \u2014 ');
    })
    .join('\n');
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Validates + normalizes one raw AI question into a checkConfig question; null if bad. */
function normalizeQuestion(raw, i) {
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) return null;
  const options = Array.isArray(raw.options)
    ? raw.options.filter((o) => typeof o === 'string' && o.trim()).map((o) => o.trim())
    : [];
  const unique = [...new Set(options)];
  if (unique.length < 2) return null;
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : '';
  if (!answer || !unique.includes(answer)) return null;
  return {
    id: `ai-end-${i}`,
    prompt: raw.prompt.trim(),
    options: shuffle(unique),
    answer,
  };
}

/**
 * Generates a randomized, adaptive end-of-lesson checkConfig. Returns an object
 * shaped like the authored `checkConfig` ({ validationMode, questions,
 * feedbackCorrect, feedbackIncorrect, hint }) on success, or null on failure.
 */
export async function generateAdaptiveCheck({
  lessonSlides = [],
  finalSlide,
  checkResults,
  lessonTitle,
  count = DEFAULT_COUNT,
} = {}) {
  const comp = computeInLessonComprehension(lessonSlides, finalSlide, checkResults);
  const title = lessonTitle || finalSlide?.title || 'this lesson';

  const system = `You are writing an END-OF-LESSON skill check for an introductory chemistry course (ages 14-16).
Write clear, single-best-answer multiple-choice questions with exactly 3 distinct options each, only one correct.
Stay STRICTLY within introductory chemistry and ONLY use the lesson content provided. Never fabricate facts, values, formulas, or equations.
Keep prompts concise and unambiguous, with plausible (not silly) distractors.

Lesson content to ground every question in:
${conceptGrounding(lessonSlides)}`;

  const prompt = `Generate ${count} fresh multiple-choice questions that assess understanding of the lesson "${title}".
${difficultyInstruction(comp)}
Requirements:
- Base every question ONLY on the lesson content above; never introduce outside facts.
- Each question needs a "prompt", an "options" array of exactly 3 distinct strings, and an "answer" that EXACTLY matches one of the options.
- Exactly one option is correct; the other two are plausible but clearly wrong.
- Make the set DIFFERENT from what you might generate another time (vary wording, focus, and order) so repeated attempts feel fresh.
- Optionally add a one-sentence "hint" per question.
Also include a short encouraging "feedbackCorrect", a brief supportive "feedbackIncorrect", and one overall "hint".`;

  const data = await generateJSON(prompt, ADAPTIVE_SCHEMA, { system });
  if (!data || !Array.isArray(data.questions)) return null;

  const questions = data.questions
    .map((q, i) => normalizeQuestion(q, i))
    .filter(Boolean)
    .slice(0, count);

  if (questions.length < MIN_QUESTIONS) return null;

  return {
    validationMode: 'multipleChoice',
    questions,
    feedbackCorrect:
      typeof data.feedbackCorrect === 'string' && data.feedbackCorrect.trim()
        ? data.feedbackCorrect.trim()
        : 'Correct \u2014 great work pulling this lesson together!',
    feedbackIncorrect:
      typeof data.feedbackIncorrect === 'string' && data.feedbackIncorrect.trim()
        ? data.feedbackIncorrect.trim()
        : 'Not quite \u2014 review the idea and try again.',
    hint: typeof data.hint === 'string' && data.hint.trim() ? data.hint.trim() : undefined,
  };
}
