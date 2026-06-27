import { illustrationCatalog, isAllowedIllustration } from './illustrationAllowlist.js';

/** Builds the grounding block describing the current slide for the tutor. */
function slideGrounding(slide) {
  if (!slide) {
    return 'Context: the student is browsing the "Introduction to Chemistry" course (not on a specific slide right now). Keep help general to introductory chemistry.';
  }
  const lines = ['Current slide the student is looking at:'];
  if (slide.subtitle) lines.push(`Title: ${slide.subtitle}`);
  if (slide.learningGoal) lines.push(`Learning goal: ${slide.learningGoal}`);
  if (slide.bodyText) lines.push(`Explanation shown: ${slide.bodyText}`);
  if (slide.instructions) lines.push(`On-screen instructions: ${slide.instructions}`);
  if (slide.isCheck && slide.checkConfig) {
    const cfg = slide.checkConfig;
    if (Array.isArray(cfg.questions)) {
      cfg.questions.forEach((q) => {
        lines.push(
          `Check question: ${q.prompt} Options: ${(q.options || []).join(', ')}. Correct: ${q.answer}.`,
        );
      });
    }
    if (cfg.hint) lines.push(`Authoring hint: ${cfg.hint}`);
  }
  return lines.join('\n');
}

const ILLUSTRATION_PROTOCOL = `You may optionally illustrate your explanation with ONE of the app's existing interactive visuals. Only do this when it genuinely helps. If you choose to, append EXACTLY ONE directive on its own final line in this format and nothing after it:
[[ILLUSTRATE: ComponentKey | short caption]]
Choose ComponentKey ONLY from this list (use the exact key); never invent one:
${illustrationCatalog()}`;

/**
 * Progressive hint ladder. Instead of one fixed hint, the tutor escalates the
 * depth of help as the learner keeps struggling or asks for "another hint".
 * Levels are 1-indexed; level 4 finally gives the full worked answer.
 */
export const HINT_MAX_LEVEL = 4;

const HINT_LADDER = {
  1: `HINT MODE — LEVEL 1 of ${HINT_MAX_LEVEL} (gentle nudge): The learner is STRUGGLING on this exact task and has NOT solved it. Reply with EXACTLY ONE short, gentle sentence that points them at the very next thing to think about, grounded in the slide's learning goal and their current mistake. Do NOT name the full method, state any value/placement, or walk through steps. A single encouraging nudge only — no lists, no preamble.`,
  2: `HINT MODE — LEVEL 2 of ${HINT_MAX_LEVEL} (bigger conceptual hint): The learner asked for more help. In 1-2 short sentences, name the key concept, rule, or relationship they need to apply here and why it matters for this task. Still do NOT give the answer, the final value(s)/placement, or a full step-by-step solution — point clearly at the idea, not the result.`,
  3: `HINT MODE — LEVEL 3 of ${HINT_MAX_LEVEL} (worked next step): The learner is still stuck. Show ONLY the very next concrete step worked out (set up the first move, the first part of the calculation, or the first placement and how to reason it), then stop and invite them to finish. In 2-3 short sentences. Do NOT reveal the final answer or complete every remaining step — leave the last move to them.`,
  4: `HINT MODE — LEVEL 4 of ${HINT_MAX_LEVEL} (full explanation): The learner has worked through the earlier hints and needs the answer now. Give the complete, correct solution with the reasoning, in 3-5 short sentences. Be clear and encouraging, walk through how to get there, and confirm the final answer/placement. Stay grounded strictly in the slide.`,
};

function hintProtocol(level) {
  const lvl = Math.min(HINT_MAX_LEVEL, Math.max(1, Number(level) || 1));
  return HINT_LADDER[lvl];
}

/**
 * Extra "don't fabricate" reinforcement appended to every tutor call (a
 * lightweight, zero-latency output guardrail). The base persona already forbids
 * fabrication; this re-states it at call time, right beside the slide grounding,
 * where it most reliably steers the model.
 */
const GROUNDING_GUARDRAIL = `GROUNDING CHECK (important): Base every chemistry claim ONLY on the slide content and well-established introductory chemistry. Before stating a formula, value, name, or equation, make sure it is correct and actually supported by the material above — if you are not certain, do NOT guess: say what you are unsure about and suggest how to check it (re-read the slide, try the interactive). Never invent chemical facts, numbers, or steps to sound complete.`;

/** Locales the multilingual tutor can answer in. `en` is the default (no-op). */
export const TUTOR_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español (Spanish)', name: 'Spanish' },
  { code: 'fr', label: 'Français (French)', name: 'French' },
  { code: 'de', label: 'Deutsch (German)', name: 'German' },
  { code: 'pt', label: 'Português (Portuguese)', name: 'Portuguese' },
  { code: 'hi', label: 'हिन्दी (Hindi)', name: 'Hindi' },
  { code: 'zh', label: '中文 (Chinese, Simplified)', name: 'Simplified Chinese' },
  { code: 'ar', label: 'العربية (Arabic)', name: 'Arabic' },
];

function languageName(code) {
  const entry = TUTOR_LANGUAGES.find((l) => l.code === code);
  return entry?.name || null;
}

/**
 * Turns the learner's client-side accessibility preferences into call-time
 * system instructions. Returns '' when no preference changes the output, so
 * default behaviour and prompt length are unchanged for most learners.
 */
export function buildPreferenceInstruction(prefs) {
  if (!prefs) return '';
  const parts = [];
  if (prefs.simpleLanguage) {
    parts.push(
      'ACCESSIBILITY — SIMPLER LANGUAGE: Write for a learner who finds dense text hard. Use short, plain sentences (aim for under ~12 words each), everyday words instead of jargon, and define any chemistry term the first time you use it. Prefer one idea per sentence. Keep the meaning fully accurate — simplify the wording, never the chemistry.',
    );
  }
  const lang = languageName(prefs.language);
  if (lang) {
    parts.push(
      `ACCESSIBILITY — LANGUAGE: Respond entirely in ${lang}. Keep all chemistry terms, element names, symbols, formulas, and numbers scientifically accurate (you may give the standard English/symbolic form in parentheses the first time if it aids understanding). Translate your explanation naturally rather than word-for-word.`,
    );
  }
  return parts.join('\n\n');
}

/**
 * Assembles the per-call system grounding (appended to SYSTEM_INSTRUCTION):
 * slide context + learner profile + optional wrong-answer event + the optional
 * illustration protocol + an always-on grounding guardrail + the learner's
 * accessibility preferences. When `hintMode` is set, appends the progressive
 * hint-ladder instruction for `hintLevel` (1..HINT_MAX_LEVEL): the depth of help
 * escalates with the level (gentle nudge → concept → worked step → full answer).
 */
export function buildTutorSystem({
  slide,
  profileText,
  wrongText,
  withIllustration,
  hintMode,
  hintLevel = 1,
  prefs,
} = {}) {
  const blocks = [slideGrounding(slide)];
  if (profileText) blocks.push(profileText);
  if (wrongText) blocks.push(wrongText);
  blocks.push(GROUNDING_GUARDRAIL);
  if (withIllustration) blocks.push(ILLUSTRATION_PROTOCOL);
  if (hintMode) blocks.push(hintProtocol(hintLevel));
  const prefsBlock = buildPreferenceInstruction(prefs);
  if (prefsBlock) blocks.push(prefsBlock);
  return blocks.join('\n\n');
}

const ILLUSTRATE_RE = /\[\[\s*ILLUSTRATE\s*:\s*([A-Za-z0-9]+)\s*(?:\|\s*([^\]]*?))?\s*\]\]/;

/**
 * Splits a (possibly partial, streaming) model reply into displayable text and
 * a validated illustration directive. Unknown component keys are dropped and
 * the directive text is always stripped from what the user sees.
 */
export function parseIllustration(text) {
  if (!text) return { text: '', illustration: null };
  const match = text.match(ILLUSTRATE_RE);
  if (!match) {
    // Hide a partially-streamed, not-yet-complete directive from the user.
    const partialIdx = text.indexOf('[[');
    if (partialIdx !== -1) {
      return { text: text.slice(0, partialIdx).trimEnd(), illustration: null };
    }
    return { text, illustration: null };
  }
  const componentKey = match[1];
  const caption = (match[2] || '').trim();
  const cleaned = text.replace(ILLUSTRATE_RE, '').trimEnd();
  if (!isAllowedIllustration(componentKey)) {
    return { text: cleaned, illustration: null };
  }
  return { text: cleaned, illustration: { componentKey, caption } };
}
