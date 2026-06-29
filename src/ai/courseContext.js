/**
 * Builds a COMPACT, token-frugal summary of the active lesson's teaching
 * analogies and a few representative exercises/check questions, so the tutor's
 * anchored explanations can tie back to the SAME named analogies and exercises
 * the learner already saw ("remember the backpack analogy from earlier…")
 * instead of reaching for generic chemistry.
 *
 * `lessonSlides` are the flattened slides for the active lesson (as passed by
 * LessonPlayer -> SlideRenderer), each shaped like
 *   { slideId, type, subtitle, bodyText, isCheck, checkConfig, ... }.
 *
 * Returns '' when there is nothing useful to ground in (e.g. AI surfaces that
 * don't have the lesson's slides), so callers stay a graceful no-op.
 */

const MAX_ANALOGIES = 4;
const MAX_EXERCISES = 3;
const GIST_CHARS = 130;
const PROMPT_CHARS = 120;
const TOTAL_CHARS = 850;

/** First sentence (or a clipped slice) of a body string, for a one-line gist. */
function firstSentence(text, max = GIST_CHARS) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  const match = clean.match(/^.*?[.!?](?=\s|$)/);
  const sentence = (match ? match[0] : clean).trim();
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trimEnd()}\u2026`;
}

function clip(text, max) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}\u2026`;
}

/** Pulls a short prompt out of a check slide's config (MCQ / classify / FR / etc.). */
function checkPrompt(slide) {
  const cfg = slide?.checkConfig;
  if (!cfg) return '';
  if (Array.isArray(cfg.questions) && cfg.questions[0]?.prompt) return cfg.questions[0].prompt;
  if (cfg.prompt) return cfg.prompt;
  return '';
}

/**
 * Extracts the compact analogy + exercise context string. Analogies are the
 * lesson's explainer/analogy slides (their title + a one-line gist); exercises
 * are a few representative check prompts. The current slide is skipped so we
 * never echo the question the learner just answered back at them.
 */
export function buildCourseContext({ lessonSlides, currentSlide } = {}) {
  if (!Array.isArray(lessonSlides) || lessonSlides.length === 0) return '';
  const currentId = currentSlide?.slideId;

  const analogies = [];
  const exercises = [];

  for (const slide of lessonSlides) {
    if (!slide) continue;
    if (slide.isCheck) {
      if (slide.slideId === currentId) continue;
      const prompt = checkPrompt(slide);
      if (prompt && exercises.length < MAX_EXERCISES) {
        const label = slide.subtitle ? `${slide.subtitle}: ` : '';
        exercises.push(`${label}${clip(prompt, PROMPT_CHARS)}`);
      }
      continue;
    }
    // Analogy / explainer slides carry the named teaching metaphors.
    if (slide.type === 'explainer' && slide.subtitle && analogies.length < MAX_ANALOGIES) {
      const gist = firstSentence(slide.bodyText);
      analogies.push(gist ? `"${slide.subtitle}" \u2014 ${gist}` : `"${slide.subtitle}"`);
    }
  }

  if (analogies.length === 0 && exercises.length === 0) return '';

  const blocks = [];
  if (analogies.length) {
    blocks.push(
      `Analogies/explainers taught in this lesson (reference these by name when they fit):\n- ${analogies.join('\n- ')}`,
    );
  }
  if (exercises.length) {
    blocks.push(`Exercises/questions from this lesson:\n- ${exercises.join('\n- ')}`);
  }
  // Newline-preserving cap (clip() collapses whitespace, so only use it per item).
  const joined = blocks.join('\n\n');
  return joined.length <= TOTAL_CHARS ? joined : `${joined.slice(0, TOTAL_CHARS - 1).trimEnd()}\u2026`;
}
