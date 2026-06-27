import { Schema } from '../firebase/ai.js';
import { generateJSON } from '../firebase/ai.js';

/**
 * AI-generated "challenge" questions for Heat Check — harder, application-style
 * multiple-choice items grounded in the course's topics. Worth a bonus in the
 * timed mode. Falls back to a curated static set when AI is off or generation
 * fails, so Heat Check always has spicy questions available.
 */

const CHALLENGE_SCHEMA = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          prompt: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
        },
      }),
    }),
  },
});

const COURSE_TOPICS = [
  'matter vs. energy and states of matter',
  'atomic structure (protons, neutrons, electrons, isotopes)',
  'the periodic table and trends',
  'ionic vs. covalent bonding and polarity',
  'chemical formulas and naming compounds',
  'balancing equations and conservation of mass',
  'the mole, molar mass, and simple stoichiometry',
  'solutions, dissolving, and the pH scale',
];

/** Curated harder questions used when AI is unavailable. */
export const CHALLENGE_FALLBACK = [
  {
    prompt: 'A neutral atom has 17 protons and 18 neutrons. What is its mass number?',
    options: ['17', '35', '18'],
    answer: '35',
  },
  {
    prompt: 'Which compound is held together by covalent bonds?',
    options: ['NaCl', 'CO\u2082', 'MgO'],
    answer: 'CO\u2082',
  },
  {
    prompt: 'To balance H\u2082 + O\u2082 \u2192 H\u2082O, the correct coefficients are:',
    options: ['2, 1, 2', '1, 1, 1', '2, 2, 1'],
    answer: '2, 1, 2',
  },
  {
    prompt: 'How many atoms total are in one formula unit of (NH\u2084)\u2082SO\u2084?',
    options: ['11', '15', '8'],
    answer: '15',
  },
  {
    prompt: 'A solution changes from pH 6 to pH 3. Its hydrogen-ion concentration becomes...',
    options: ['1000\u00d7 greater', '3\u00d7 greater', '1000\u00d7 smaller'],
    answer: '1000\u00d7 greater',
  },
  {
    prompt: 'Which sample contains the most molecules?',
    options: ['1 mole of O\u2082', '1 mole of H\u2082O', 'They contain the same number'],
    answer: 'They contain the same number',
  },
  {
    prompt: 'Going from a liquid to a gas, the particles...',
    options: [
      'move faster and spread far apart',
      'slow down and lock in place',
      'lose mass',
    ],
    answer: 'move faster and spread far apart',
  },
  {
    prompt: 'An atom that loses two electrons becomes an ion with a charge of...',
    options: ['2\u2212', '2+', '0'],
    answer: '2+',
  },
];

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function normalize(raw, i) {
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) return null;
  const options = Array.isArray(raw.options)
    ? [...new Set(raw.options.filter((o) => typeof o === 'string' && o.trim()).map((o) => o.trim()))]
    : [];
  if (options.length < 2) return null;
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : '';
  if (!answer || !options.includes(answer)) return null;
  return { id: `challenge-${i}`, prompt: raw.prompt.trim(), options: shuffle(options), answer };
}

/**
 * Generates `count` challenge questions. Returns a normalized array, or the
 * static fallback (shuffled, sliced) on any failure / when AI is off.
 */
export async function generateChallengeQuestions({ count = 4 } = {}) {
  const fallback = () =>
    shuffle(CHALLENGE_FALLBACK)
      .slice(0, count)
      .map((q, i) => ({ id: `challenge-fb-${i}`, ...q, options: shuffle(q.options) }));

  const system = `You are writing HARD but fair multiple-choice challenge questions for a timed quiz in an introductory chemistry course (ages 14-16).
Each question must have exactly 3 distinct options with exactly one correct answer, require a small calculation or applying a concept (not just recall), and stay strictly within introductory chemistry. Never fabricate facts.
Topics to draw from: ${COURSE_TOPICS.join('; ')}.`;

  const prompt = `Generate ${count} challenge questions. Each needs a "prompt", an "options" array of exactly 3 distinct strings, and an "answer" that exactly matches one option. Vary the topics and make them feel fresh.`;

  const data = await generateJSON(prompt, CHALLENGE_SCHEMA, { system });
  if (!data || !Array.isArray(data.questions)) return fallback();
  const questions = data.questions.map((q, i) => normalize(q, i)).filter(Boolean).slice(0, count);
  return questions.length >= 2 ? questions : fallback();
}
