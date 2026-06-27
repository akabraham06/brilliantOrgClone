/**
 * Builds the mixed item queue for Heat Check (the timed farming mode). Items are
 * snappy, single-answer questions so the speed scoring feels good:
 *   - 'mcq'      : a single multiple-choice question pulled from the course review
 *                  pool (every authored lesson check + cross-cutting concepts).
 *   - 'diagram'  : renders an allowlisted interactive and asks which concept it
 *                  explores (options drawn from the playground catalog).
 * AI 'challenge' items are spliced in at runtime by the HeatCheck page.
 *
 * Read-only against the course data; dependency-light.
 */
import { reviewPool } from './reviewQuestions.js';
import { PLAYGROUND_ALLOWLIST, PLAYGROUND_KEYS } from '../ai/playgroundAllowlist.js';

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Normalized MCQ items from the review pool (one question each). */
function mcqItems() {
  return reviewPool
    .filter((p) => p.validationMode === 'multipleChoice' && p.slide?.checkConfig?.questions?.[0])
    .map((p) => {
      const q = p.slide.checkConfig.questions[0];
      return {
        id: `hc-${p.id}`,
        kind: 'mcq',
        subtitle: p.slide.subtitle || 'Quick question',
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
      };
    });
}

/** Short, readable label from a playground description (first clause). */
function shortDesc(key) {
  const d = PLAYGROUND_ALLOWLIST[key] || '';
  const clause = d.split(/[;.]/)[0].trim();
  return clause.charAt(0).toUpperCase() + clause.slice(1);
}

/**
 * Diagram-recognition items: show an interactive, ask which concept it explores.
 * The correct option is its own catalog description; distractors are two others.
 */
function diagramItems() {
  const keys = shuffle(PLAYGROUND_KEYS);
  return keys.map((key) => {
    const others = shuffle(PLAYGROUND_KEYS.filter((k) => k !== key)).slice(0, 2);
    const correct = shortDesc(key);
    const options = shuffle([correct, ...others.map(shortDesc)]);
    return {
      id: `hc-diagram-${key}`,
      kind: 'diagram',
      diagramKey: key,
      subtitle: 'Spot the interactive',
      prompt: 'Which concept does this interactive help you explore?',
      options,
      answer: correct,
    };
  });
}

/**
 * Builds a shuffled, mixed Heat Check queue. The run ends on the first wrong
 * answer or when the timer expires, so this just needs to be comfortably longer
 * than any single run.
 */
export function buildHeatQueue({ count = 50 } = {}) {
  const mcq = mcqItems();
  const diagrams = diagramItems();
  // ~25% diagram items, the rest MCQ.
  const diagramTarget = Math.round(count * 0.25);
  const pool = shuffle([...shuffle(diagrams).slice(0, diagramTarget), ...shuffle(mcq)]);
  return pool.slice(0, Math.min(count, pool.length));
}
