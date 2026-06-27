import { buildTutorSystem } from './tutorPrompt.js';

/**
 * Builds the system grounding + user prompt for the tutor's anchored
 * "deep explanation" — the tailored, slightly longer explanation that opens
 * next to the learner's chosen answer once they have FULLY attempted an
 * assessment (correct or not).
 *
 * `context` is supplied by the assessment that triggered it:
 *   { slide, kind, prompt, selected, correct, isCorrect, reveal }
 */
export function buildAnchoredExplainRequest({ slide, profileText, context = {}, prefs } = {}) {
  const { prompt, selected, correct, isCorrect, reveal } = context;

  const lines = [];
  if (prompt) lines.push(`Question: ${prompt}`);
  if (selected != null && `${selected}`.trim() !== '') {
    lines.push(`The answer the student gave: ${selected}`);
  }
  if (correct != null && `${correct}`.trim() !== '') {
    lines.push(`The correct answer: ${correct}`);
  }
  if (reveal) lines.push(`Explanation already shown on screen: ${reveal}`);
  lines.push(
    `The student just finished a full attempt and answered ${
      isCorrect ? 'CORRECTLY' : 'INCORRECTLY'
    }.`,
  );

  const system = buildTutorSystem({
    slide,
    profileText,
    wrongText: lines.join('\n'),
    withIllustration: false,
    prefs,
  });

  const ask = isCorrect
    ? 'They got it right. In 3-4 short sentences, affirm WHY their answer is correct and add ONE deeper insight or connection that stretches their understanding a little further. Be specific to this exact question — do not be generic.'
    : 'They got it wrong. In 3-5 short sentences, explain a bit more deeply WHY their specific choice does not work and walk them through the reasoning that leads to the right idea. Guide their understanding rather than only restating the correct answer. Stay warm and encouraging, never condescending.';

  return { system, prompt: ask };
}
