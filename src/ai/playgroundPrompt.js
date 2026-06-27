import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';
import {
  playgroundCatalog,
  isAllowedPlaygroundKey,
  PLAYGROUND_ALLOWLIST,
  PLAYGROUND_KEYS,
} from './playgroundAllowlist.js';

/**
 * Lab-guide grounding + structured-suggestion helpers for the AI Lab.
 *
 * Mirrors the tutor's `tutorPrompt.js` patterns: a `build*System` that is
 * appended to the shared SYSTEM_INSTRUCTION, and a streaming-safe directive
 * parser like `parseIllustration`. The guide is course-scoped (introductory
 * chemistry) and can swap the stage's interactive via a single `[[LOAD: Key]]`
 * directive, choosing only from the playground allowlist.
 */

const LOAD_PROTOCOL = `You can change the interactive on the Lab stage to match what the student should explore next. To do this, append EXACTLY ONE directive on its own final line, in this format and with nothing after it:
[[LOAD: ComponentKey | short caption]]
Only swap the stage when it genuinely helps the student explore the idea you are discussing. Choose ComponentKey ONLY from this list (use the exact key); never invent one:
${playgroundCatalog()}`;

function stageGrounding(currentKey) {
  if (currentKey && isAllowedPlaygroundKey(currentKey)) {
    return `The interactive currently on the Lab stage is "${currentKey}": ${PLAYGROUND_ALLOWLIST[currentKey]}\nWhen relevant, point out specific things the student can try with it right now.`;
  }
  return 'The Lab stage does not have an interactive loaded yet. Help the student pick one to start exploring.';
}

/**
 * Assembles the lab-guide system grounding (appended to SYSTEM_INSTRUCTION):
 * the lab-guide framing, what is on the stage, the learner profile, and the
 * stage-control protocol.
 */
export function buildGuideSystem({ profileText, currentKey } = {}) {
  const blocks = [
    `You are now acting as the student's friendly guide in the "AI Lab" — a hands-on sandbox where they freely play with one interactive at a time. Greet them warmly, suggest concrete things to try, react to what the interactive shows, and answer their questions. Keep the same beginner-friendly, encouraging, Socratic style. Stay strictly within introductory chemistry; gently redirect anything off-topic. Keep replies short (2-4 sentences) unless they ask for more.`,
    stageGrounding(currentKey),
  ];
  if (profileText) blocks.push(profileText);
  blocks.push(LOAD_PROTOCOL);
  return blocks.join('\n\n');
}

/**
 * Builds the synthetic user-turn text fed to the model when the learner
 * manipulates the stage interactive (a "live lab event"). It is NOT something
 * the learner typed — it tells the guide what just changed so it can chime in
 * on its own with a short, grounded teaching reaction. The system instruction
 * (via `buildGuideSystem`) already carries the stage + profile grounding.
 */
export function buildInteractionContext({ summary, name, currentKey } = {}) {
  const experiment = name || currentKey || 'the interactive';
  const change = summary || `adjusted the ${experiment}`;
  return `[Live lab event — the student just manipulated the interactive on the stage; they did NOT type this message.] While exploring "${experiment}", the student ${change}. React in 1-3 short sentences, like a guide watching over their shoulder: warmly acknowledge the specific change they made and teach one concrete, relevant idea about what it means in this experiment. Do not greet them, do not restate these instructions, do not ask them to do the thing they just did, and do not change the interactive.`;
}

const LOAD_RE = /\[\[\s*LOAD\s*:\s*([A-Za-z0-9]+)\s*(?:\|\s*([^\]]*?))?\s*\]\]/;

/**
 * Splits a (possibly partial, streaming) guide reply into displayable text and
 * a validated stage-load directive. Unknown component keys are dropped and the
 * directive text is always stripped from what the student sees.
 */
export function parseLoadDirective(text) {
  if (!text) return { text: '', load: null };
  const match = text.match(LOAD_RE);
  if (!match) {
    // Hide a partially-streamed, not-yet-complete directive from the student.
    const partialIdx = text.indexOf('[[');
    if (partialIdx !== -1) {
      return { text: text.slice(0, partialIdx).trimEnd(), load: null };
    }
    return { text, load: null };
  }
  const componentKey = match[1];
  const caption = (match[2] || '').trim();
  const cleaned = text.replace(LOAD_RE, '').trimEnd();
  if (!isAllowedPlaygroundKey(componentKey)) {
    return { text: cleaned, load: null };
  }
  return { text: cleaned, load: { componentKey, caption } };
}

const SUGGESTIONS_SCHEMA = Schema.object({
  properties: {
    suggestions: Schema.array({
      items: Schema.object({
        properties: {
          label: Schema.string(),
          componentKey: Schema.string(),
          seedPrompt: Schema.string(),
        },
      }),
    }),
  },
});

/** Validates + normalizes one raw AI suggestion; null when unusable. */
function normalizeSuggestion(raw) {
  if (!raw) return null;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  const componentKey = typeof raw.componentKey === 'string' ? raw.componentKey.trim() : '';
  const seedPrompt = typeof raw.seedPrompt === 'string' ? raw.seedPrompt.trim() : '';
  if (!label || !isAllowedPlaygroundKey(componentKey)) return null;
  return { label: label.slice(0, 80), componentKey, seedPrompt: seedPrompt.slice(0, 240) };
}

/**
 * Generates 3-4 personalized exploration starts, each tied to an allowlisted
 * interactive. Returns a non-empty array on success, or null when AI is
 * unavailable / the output is unusable (caller falls back to a static set).
 */
export async function generateSuggestions(profileText, { count = 4 } = {}) {
  const system = `You are planning starter experiments for a student in an introductory chemistry "AI Lab".
Each suggestion must use one of these interactives (use the exact componentKey):
${playgroundCatalog()}

Rules:
- Pick ${count} varied, beginner-friendly experiments that sound inviting and concrete.
- "label" is a short call-to-action chip (max ~6 words), e.g. "Build a water molecule".
- "componentKey" MUST be one of the keys above, exactly.
- "seedPrompt" is a first-person message the student could send to start that exploration, written as the student.
- Stay strictly within introductory chemistry.${profileText ? `\n\n${profileText}\nWhen it helps, bias suggestions toward the weaker or in-progress topics above.` : ''}`;

  const prompt = `Generate ${count} exploration suggestions as described. Return an array "suggestions", each with "label", "componentKey", and "seedPrompt".`;

  const data = await generateJSON(prompt, SUGGESTIONS_SCHEMA, { system });
  if (!data || !Array.isArray(data.suggestions)) return null;

  const seen = new Set();
  const out = [];
  for (const raw of data.suggestions) {
    const s = normalizeSuggestion(raw);
    if (!s || seen.has(s.label)) continue;
    seen.add(s.label);
    out.push(s);
    if (out.length >= count) break;
  }
  return out.length ? out : null;
}

/* ------------------------------------------------------------------ *
 * Open-ended lab challenges
 *
 * "Design an experiment / predict the outcome" prompts the guide can pose, with
 * the learner's free-text reasoning graded by AI. These reuse the same lab UX
 * (the guide chat + the allowlisted stage interactives): a challenge always names
 * an allowlisted componentKey so the relevant sandbox is loaded alongside it.
 * ------------------------------------------------------------------ */

const CHALLENGE_SCHEMA = Schema.object({
  properties: {
    kind: Schema.string(), // "design" | "predict"
    title: Schema.string(),
    scenario: Schema.string(),
    componentKey: Schema.string(),
  },
});

const CHALLENGE_GRADE_SCHEMA = Schema.object({
  properties: {
    correct: Schema.boolean(),
    score: Schema.number(),
    feedback: Schema.string(),
    strengths: Schema.array({ items: Schema.string() }),
    gaps: Schema.array({ items: Schema.string() }),
  },
  optionalProperties: ['strengths', 'gaps'],
});

/**
 * Static fallback challenges (used when AI is unavailable). Each is tied to an
 * allowlisted interactive so the stage can load it. Kept beginner-friendly and
 * strictly within introductory chemistry.
 */
export const FALLBACK_CHALLENGES = [
  {
    kind: 'predict',
    title: 'Predict the melting points',
    scenario:
      'Before you open the viewer: will table salt (an ionic solid) or dry ice / CO2 (a molecular solid) melt at a much higher temperature? Explain your reasoning in terms of the forces holding the particles together.',
    componentKey: 'MolecularVsIonicViewer',
  },
  {
    kind: 'design',
    title: 'Design a stable atom',
    scenario:
      'Design an electrically neutral, stable atom of a specific element using the builder. Explain how many protons, neutrons, and electrons you chose and WHY that makes it neutral and stable.',
    componentKey: 'AtomDiagram',
  },
  {
    kind: 'predict',
    title: 'Predict the phase change',
    scenario:
      'Predict what will happen to the particles as you raise the temperature from cold to hot. Describe the order of phase changes and what happens to particle motion and spacing at each step.',
    componentKey: 'TemperatureSlider',
  },
  {
    kind: 'design',
    title: 'Balance it yourself',
    scenario:
      'Use the balancer to make H2 + O2 -> H2O obey conservation of mass. Explain what coefficients you used and why you can change coefficients but not subscripts.',
    componentKey: 'EquationBalancer',
  },
].filter((c) => isAllowedPlaygroundKey(c.componentKey));

/** Picks a fallback challenge, preferring one tied to the current stage. */
export function pickFallbackChallenge(currentKey) {
  const onStage = FALLBACK_CHALLENGES.find((c) => c.componentKey === currentKey);
  if (onStage) return onStage;
  const i = Math.floor(Math.random() * FALLBACK_CHALLENGES.length);
  return FALLBACK_CHALLENGES[i] || null;
}

function normalizeChallenge(raw) {
  if (!raw) return null;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const scenario = typeof raw.scenario === 'string' ? raw.scenario.trim() : '';
  const componentKey = typeof raw.componentKey === 'string' ? raw.componentKey.trim() : '';
  if (!title || !scenario || !isAllowedPlaygroundKey(componentKey)) return null;
  return {
    kind: raw.kind === 'design' ? 'design' : 'predict',
    title: title.slice(0, 80),
    scenario: scenario.slice(0, 400),
    componentKey,
  };
}

/**
 * Generates one open-ended challenge tied to an allowlisted interactive, biased
 * toward the current stage and the learner's weak spots. Returns null on failure
 * so callers fall back to FALLBACK_CHALLENGES.
 */
export async function generateLabChallenge({ profileText, currentKey } = {}) {
  const system = `You are posing ONE open-ended challenge to a student (ages 14-16) in an introductory chemistry "AI Lab".
The challenge must be either a "design" (design/build something with an interactive) or a "predict" (predict an outcome before testing it) task.
Rules:
- "componentKey" MUST be exactly one of the interactives below; prefer "${currentKey || 'any'}" if it fits.
- "scenario" is 2-3 sentences: set up the task and ask the student to EXPLAIN THEIR REASONING (not just give a number).
- Keep it beginner-friendly and strictly within introductory chemistry. Never invent facts.

Interactives:
${playgroundCatalog()}
${profileText ? `\n${profileText}\nBias the challenge toward a weaker or in-progress topic when it fits.` : ''}`;

  const prompt = 'Generate one challenge as specified, with kind, title, scenario, and componentKey.';
  const data = await generateJSON(prompt, CHALLENGE_SCHEMA, { system });
  return normalizeChallenge(data);
}

/**
 * Grades a learner's free-text reasoning for a challenge. Returns a structured
 * grade, or null on failure so the caller can show a graceful fallback message.
 */
export async function gradeChallengeReasoning({ challenge, answer } = {}) {
  const text = typeof answer === 'string' ? answer.trim() : '';
  if (!challenge || !text) return null;

  const system = `You are grading a student's REASONING for an open-ended introductory-chemistry lab challenge (student ages 14-16).
Grade the quality of the scientific thinking, not spelling. Be encouraging but honest.
- "correct" is true when the core reasoning is sound (minor gaps are fine).
- "score" is 0..1 for how complete and correct the reasoning is.
- "feedback" is 2-3 short sentences: affirm what's right, then nudge what's missing. Never just restate the scenario.
- "strengths"/"gaps" are short bullet phrases.
- Stay strictly within introductory chemistry; never invent facts.`;

  const prompt = `Challenge (${challenge.kind}): ${challenge.title}
Scenario: ${challenge.scenario}
Student's reasoning: """${text.slice(0, 1200)}"""

Grade the reasoning.`;

  const data = await generateJSON(prompt, CHALLENGE_GRADE_SCHEMA, { system });
  if (!data || typeof data.feedback !== 'string' || !data.feedback.trim()) return null;
  const score = Math.max(0, Math.min(1, Number(data.score)));
  const correct = typeof data.correct === 'boolean' ? data.correct : score >= 0.7;
  return {
    correct,
    score: Number.isFinite(score) ? score : correct ? 1 : 0,
    feedback: data.feedback.trim(),
    strengths: Array.isArray(data.strengths) ? data.strengths.filter((s) => typeof s === 'string' && s.trim()) : [],
    gaps: Array.isArray(data.gaps) ? data.gaps.filter((s) => typeof s === 'string' && s.trim()) : [],
  };
}

/** Static fallback suggestions used when AI is unavailable. Keys are allowlisted. */
export const FALLBACK_SUGGESTIONS = [
  {
    label: 'Build an atom',
    componentKey: 'AtomDiagram',
    seedPrompt: 'Help me build an atom — where should I start?',
  },
  {
    label: 'Balance an equation',
    componentKey: 'EquationBalancer',
    seedPrompt: 'How do I balance this equation step by step?',
  },
  {
    label: 'Heat matter up',
    componentKey: 'TemperatureSlider',
    seedPrompt: 'What happens to particles as I raise the temperature?',
  },
  {
    label: 'Explore the pH scale',
    componentKey: 'PHPowersOfTen',
    seedPrompt: 'Why is each step on the pH scale a tenfold change?',
  },
].filter((s) => PLAYGROUND_KEYS.includes(s.componentKey));
