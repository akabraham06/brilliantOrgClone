/**
 * End-of-course Review question pool.
 *
 * Aggregates every graded check/quiz authored across the course into a single,
 * normalized pool of "review items", then layers on a handful of new
 * cross-cutting conceptual questions. The Course Review page (`ReviewPage`)
 * consumes this to present a randomized, mixed-type exam that reuses the real
 * lesson check UIs.
 *
 * This module is intentionally dependency-free and READ-ONLY against
 * chemistryCourse.js (it only imports the already-derived `slides`/`lessons`).
 *
 * Item shape:
 *   {
 *     id,                 // unique, stable per pool entry
 *     lessonId,           // origin lesson (or 'concept' for new questions)
 *     validationMode,     // 'multipleChoice' | 'classify' | 'matching' | ...
 *     source,             // 'lesson' | 'concept'
 *     slide,              // a slide-like object a check component can render
 *   }
 * The `slide` carries { slideId, isCheck, subtitle, bodyText, instructions,
 * checkConfig } so it plugs straight into getCheckComponent(...).
 */

import { lessons, slides } from './chemistryCourse.js';

/** Deterministic PRNG (mulberry32) so an optional seed gives a stable shuffle. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hashes a string seed into a 32-bit int for the PRNG. */
function hashSeed(seed) {
  if (typeof seed === 'number') return seed;
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** In-place-safe Fisher-Yates shuffle returning a new array. */
function shuffle(array, rng = Math.random) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * New, cross-cutting conceptual questions that span the whole course. These are
 * authored here (not in the course data) and rendered with the multiple-choice
 * check UI just like lesson quizzes.
 */
const CONCEPT_QUESTIONS = [
  {
    topic: 'Matter',
    prompt: 'Which of these is a form of energy, not matter?',
    options: ['Steam', 'Sound', 'Air'],
    answer: 'Sound',
    hint: 'Matter has mass and takes up space; light, sound, and heat do not.',
  },
  {
    topic: 'Atoms',
    prompt: 'A neutral atom always has equal numbers of...',
    options: ['protons and neutrons', 'protons and electrons', 'neutrons and electrons'],
    answer: 'protons and electrons',
    hint: 'Positive protons and negative electrons must cancel for a neutral charge.',
  },
  {
    topic: 'Bonding',
    prompt: 'The bond between two identical nonmetal atoms, as in O\u2082, is best described as...',
    options: ['ionic', 'nonpolar covalent', 'metallic'],
    answer: 'nonpolar covalent',
    hint: 'Identical atoms pull on the shared electrons equally, so there is no charge separation.',
  },
  {
    topic: 'Formulas',
    prompt: 'How many oxygen atoms are in one formula unit of Ca(OH)\u2082?',
    options: ['1', '2', '3'],
    answer: '2',
    hint: 'The subscript 2 multiplies everything inside the parentheses.',
  },
  {
    topic: 'Reactions',
    prompt: 'Which quantity is always conserved in a chemical reaction?',
    options: ['The number of molecules', 'The total mass', 'The volume of gas'],
    answer: 'The total mass',
    hint: 'Atoms are only rearranged, never created or destroyed.',
  },
  {
    topic: 'Moles',
    prompt: 'One mole of any substance contains about...',
    options: ['6.02 \u00d7 10\u00b2\u00b3 particles', '1000 particles', '100 grams'],
    answer: '6.02 \u00d7 10\u00b2\u00b3 particles',
    hint: 'A mole is a counting unit - Avogadro\u2019s number of particles.',
  },
  {
    topic: 'States of matter',
    prompt: 'Which list orders the states from most ordered to least ordered particles?',
    options: ['gas, liquid, solid', 'solid, liquid, gas', 'liquid, solid, gas'],
    answer: 'solid, liquid, gas',
    hint: 'Solids are tightly packed; gases are spread far apart.',
  },
  {
    topic: 'Acids & bases',
    prompt: 'Adding a base to an acidic solution will make its pH...',
    options: ['decrease', 'increase', 'stay exactly the same'],
    answer: 'increase',
    hint: 'Bases neutralize H\u207A, moving the pH up toward (and past) 7.',
  },
];

/** Wraps a single multiple-choice question into a renderable review item. */
function multipleChoiceItem({ id, lessonId, source, question, cfg, subtitle }) {
  return {
    id,
    lessonId,
    validationMode: 'multipleChoice',
    source,
    slide: {
      slideId: id,
      isCheck: true,
      subtitle: subtitle || 'Review question',
      bodyText: '',
      instructions: '',
      checkConfig: {
        validationMode: 'multipleChoice',
        questions: [question],
        hint: cfg?.hint,
        feedbackCorrect: cfg?.feedbackCorrect || 'Correct!',
        feedbackIncorrect: cfg?.feedbackIncorrect || 'Not quite - review and try again.',
      },
    },
  };
}

/**
 * Builds the full, normalized review pool from every graded check across the
 * course plus the conceptual questions. Multiple-choice quizzes that bundle
 * several questions are split into independent single-question items so they
 * shuffle separately.
 */
function buildPool() {
  const pool = [];

  slides
    .filter((s) => s.isCheck && s.checkConfig)
    .forEach((slide) => {
      const cfg = slide.checkConfig;
      const mode = cfg.validationMode;

      if (mode === 'multipleChoice' && Array.isArray(cfg.questions)) {
        cfg.questions.forEach((q, i) => {
          pool.push(
            multipleChoiceItem({
              id: `${slide.slideId}-q${i}`,
              lessonId: slide.lessonId,
              source: 'lesson',
              question: q,
              cfg,
              subtitle: slide.subtitle,
            }),
          );
        });
        return;
      }

      // Non-multiple-choice checks (classify / matching / balance / nameBuilder
      // / pHPlacement) are reused whole - their UIs grade a single prompt.
      pool.push({
        id: slide.slideId,
        lessonId: slide.lessonId,
        validationMode: mode,
        source: 'lesson',
        slide: {
          slideId: slide.slideId,
          isCheck: true,
          subtitle: slide.subtitle,
          bodyText: slide.bodyText || '',
          instructions: slide.instructions || '',
          checkConfig: cfg,
        },
      });
    });

  CONCEPT_QUESTIONS.forEach((c, i) => {
    pool.push(
      multipleChoiceItem({
        id: `concept-${i}`,
        lessonId: 'concept',
        source: 'concept',
        question: {
          id: `concept-${i}-q`,
          prompt: c.prompt,
          options: c.options,
          answer: c.answer,
        },
        cfg: {
          hint: c.hint,
          feedbackCorrect: 'Exactly right.',
          feedbackIncorrect: 'Not quite - revisit that idea.',
        },
        subtitle: `Concept review \u00b7 ${c.topic}`,
      }),
    );
  });

  return pool;
}

/** The complete, normalized pool of review items (lesson checks + concepts). */
export const reviewPool = buildPool();

/** Lessons represented in the pool, handy for callers that mark progress. */
export const reviewLessonIds = lessons.map((l) => l.lessonId);

/**
 * Builds a randomized review set.
 *
 * @param {number} count  Target number of items (capped at the pool size).
 * @param {number|string} [seed]  Optional seed for a deterministic shuffle.
 * @returns {Array} shuffled, mixed-type review items.
 */
export function buildReviewSet(count = 40, seed) {
  const rng = seed == null ? Math.random : mulberry32(hashSeed(seed));
  const shuffled = shuffle(reviewPool, rng);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
