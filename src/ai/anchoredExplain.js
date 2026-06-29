import { Schema } from '../firebase/ai.js';
import { buildTutorSystem } from './tutorPrompt.js';

/**
 * Structured-output schemas for the anchored explanation. Both modes return a
 * short headline plus an array of steps so the card can render a clean, stepped
 * list; the deeper mode adds a common-misconception note and asks for an
 * explicit tie-back to a named course analogy/exercise.
 */
export const CONCISE_EXPLAIN_SCHEMA = Schema.object({
  properties: {
    headline: Schema.string(),
    steps: Schema.array({ items: Schema.string() }),
    analogyRef: Schema.string(),
  },
  optionalProperties: ['analogyRef'],
});

export const DEEPER_EXPLAIN_SCHEMA = Schema.object({
  properties: {
    headline: Schema.string(),
    steps: Schema.array({ items: Schema.string() }),
    misconception: Schema.string(),
    analogyRef: Schema.string(),
  },
  optionalProperties: ['misconception', 'analogyRef'],
});

/**
 * Builds the system grounding + user prompt for the tutor's anchored
 * explanation — the tailored, structured explanation that opens next to the
 * learner's chosen answer once they have FULLY attempted an assessment (correct
 * or not). Uses structured JSON output (see schemas above) so the card can
 * render a concise stepped list by default and a richer breakdown on demand.
 *
 * `context` is supplied by the assessment that triggered it:
 *   { slide, kind, prompt, selected, correct, isCorrect, reveal, courseContext }
 * where `courseContext` is the compact analogy/exercise summary from
 * `buildCourseContext` (may be empty).
 *
 * `deeper` switches to the richer "Go deeper" breakdown (more detailed steps, a
 * common-misconception note, and an explicit tie-back to a course analogy or a
 * specific exercise). Default (`deeper: false`) stays concise and fast.
 */
export function buildAnchoredExplainRequest({
  slide,
  profileText,
  context = {},
  prefs,
  deeper = false,
} = {}) {
  const { prompt, selected, correct, isCorrect, reveal, courseContext } = context;

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

  const groundingBlocks = [lines.join('\n')];
  if (courseContext) {
    groundingBlocks.push(
      `COURSE GROUNDING — these are the actual analogies and exercises THIS learner has already seen in the lesson. Prefer to anchor your explanation to one of these by name ("remember the backpack analogy from earlier…", "like the ID-badge exercise…") whenever it genuinely fits. NEVER invent an analogy or exercise that is not listed here.\n${courseContext}`,
    );
  }

  const system = buildTutorSystem({
    slide,
    profileText,
    wrongText: groundingBlocks.join('\n\n'),
    withIllustration: false,
    prefs,
  });

  const ask = deeper
    ? buildDeeperAsk(isCorrect, Boolean(courseContext))
    : buildConciseAsk(isCorrect, Boolean(courseContext));

  return { system, prompt: ask };
}

const ANALOGY_CLAUSE =
  ' If one of the lesson analogies or exercises listed in the course grounding fits, name it in `analogyRef` (a short pointer like "Ties back to the backpack analogy") and weave it into a step; otherwise omit `analogyRef`. Never reference an analogy/exercise that is not listed.';

function buildConciseAsk(isCorrect, hasCourse) {
  const base = isCorrect
    ? 'They got it RIGHT. Return a concise, stepped explanation as JSON: `headline` is ONE short sentence affirming WHY their answer is correct; `steps` is 2-4 very short steps (one idea each) that reinforce the reasoning and add one small connection that stretches their understanding. Be specific to THIS exact question — never generic.'
    : 'They got it WRONG. Return a concise, stepped explanation as JSON: `headline` is ONE short sentence naming the core fix (the key idea they missed); `steps` is 2-4 very short steps (one idea each) that unpack WHY their specific choice does not work and walk to the right idea. Guide their understanding, stay warm and encouraging, never condescending.';
  return `${base} Keep every step to a single short sentence.${hasCourse ? ANALOGY_CLAUSE : ''}`;
}

function buildDeeperAsk(isCorrect, hasCourse) {
  const base = isCorrect
    ? 'They got it RIGHT and tapped "Go deeper". Return a richer structured breakdown as JSON: `headline` is one short sentence framing the deeper idea; `steps` is 3-5 steps of more detailed, worked reasoning that extend their understanding beyond the immediate answer; `misconception` is a short note on a common misconception or trap others fall into here.'
    : 'They got it WRONG and tapped "Go deeper". Return a richer structured breakdown as JSON: `headline` is one short sentence naming the core idea to fix; `steps` is 3-5 steps of more detailed, worked reasoning that walk from their mistake to full understanding; `misconception` is a short note on the common misconception their answer likely reflects.';
  const tie = hasCourse
    ? ' In `analogyRef`, give an explicit tie-back to one of the named course analogies or a specific exercise/question from the course grounding (e.g. "Revisit the backpack analogy" or "Try the ID-badge exercise again"). Only use analogies/exercises listed in the grounding — never invent one.'
    : ' Omit `analogyRef` unless a concrete, real course analogy is provided.';
  return `${base}${tie} Keep steps tight — a sentence or two each — and stay strictly grounded in introductory chemistry.`;
}
