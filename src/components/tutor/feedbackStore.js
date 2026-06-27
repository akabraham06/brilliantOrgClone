/**
 * Lightweight client-side store for "Was this helpful?" tutor feedback.
 *
 * Captures thumbs up/down (plus an optional note) on tutor explanations and
 * feedback into localStorage: a small rolling log of recent votes and a running
 * aggregate. Nothing here changes tutor behaviour automatically yet — the goal
 * is just to capture the signal cleanly so it can inform tuning later.
 *
 * Server-side persistence is intentionally out of scope (another worker owns
 * Firestore); shipping this to a backend collection is a future follow-up.
 */

const STORAGE_KEY = 'chem-tutor-feedback';
const MAX_LOG = 50;

const EMPTY = { up: 0, down: 0, log: [] };

function read() {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      up: Number(parsed.up) || 0,
      down: Number(parsed.down) || 0,
      log: Array.isArray(parsed.log) ? parsed.log.slice(0, MAX_LOG) : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode); feedback is best-effort.
  }
}

/**
 * Records one feedback vote.
 *
 * @param {object} entry
 * @param {'up'|'down'} entry.vote     Thumbs up or down.
 * @param {string}      [entry.surface] Where it came from (panel/anchored/feedback).
 * @param {string}      [entry.note]    Optional free-text note.
 * @param {string}      [entry.slideId] The slide the tutor was grounded on.
 * @returns the updated aggregate ({ up, down }).
 */
export function recordFeedback({ vote, surface = 'tutor', note = '', slideId = null } = {}) {
  if (vote !== 'up' && vote !== 'down') return read();
  const state = read();
  if (vote === 'up') state.up += 1;
  else state.down += 1;
  state.log = [
    { vote, surface, note: (note || '').slice(0, 500), slideId, ts: Date.now() },
    ...state.log,
  ].slice(0, MAX_LOG);
  write(state);
  return { up: state.up, down: state.down };
}

/** Returns the running aggregate { up, down, total }. */
export function getFeedbackAggregate() {
  const { up, down } = read();
  return { up, down, total: up + down };
}
