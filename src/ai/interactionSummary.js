/**
 * Generic, resilient summarizer for AI-Lab interaction signals.
 *
 * Interactives in the Lab share the `onSaveState(state)` contract but each has a
 * different state shape (flat objects of numbers/booleans/arrays, occasionally
 * an opaque value). To let the guide "watch" the learner, we diff a previous
 * state snapshot against the next one and produce a short, human-readable
 * description of what the learner just changed — without knowing any specific
 * interactive's schema. It always degrades gracefully: when the change can't be
 * articulated, callers fall back to a generic "adjusted the <experiment>" note.
 */

/** Humanizes a camelCase / snake_case field name into spaced lowercase words. */
function humanizeField(field) {
  return String(field)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Formats an arbitrary value into a compact, token-cheap string. */
function formatValue(v) {
  if (v === null || v === undefined) return 'none';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  }
  if (typeof v === 'string') return v.length > 28 ? `${v.slice(0, 27)}\u2026` : v;
  if (Array.isArray(v)) {
    const inner = v.slice(0, 6).map(formatValue).join(', ');
    return `[${inner}${v.length > 6 ? ', \u2026' : ''}]`;
  }
  if (typeof v === 'object') {
    try {
      const s = JSON.stringify(v);
      return s.length > 40 ? `${s.slice(0, 39)}\u2026` : s;
    } catch {
      return 'updated';
    }
  }
  return String(v);
}

/** Structural equality good enough for plain state snapshots. */
function isEqual(a, b) {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function joinList(parts) {
  if (parts.length <= 1) return parts.join('');
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

const MAX_FIELDS = 4;

/**
 * Describes the difference between two interaction-state snapshots as a short
 * verb phrase (e.g. "set protons to 6 and turned passed on"), suitable for
 * dropping into a sentence like "the student <summary>".
 *
 * Returns null when there is no meaningful, describable change (callers should
 * then skip reacting, or use a generic fallback for opaque-but-changed state).
 */
export function summarizeInteraction(prev, next, { name } = {}) {
  const bothPlainObjects =
    prev &&
    next &&
    typeof prev === 'object' &&
    typeof next === 'object' &&
    !Array.isArray(prev) &&
    !Array.isArray(next);

  // Opaque / primitive / array state: describe the whole value if it changed.
  if (!bothPlainObjects) {
    if (isEqual(prev, next)) return null;
    if (next === undefined || next === null) {
      return name ? `adjusted the ${name}` : 'adjusted the interactive';
    }
    return `set it to ${formatValue(next)}`;
  }

  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]));
  const changes = [];
  for (const k of keys) {
    if (isEqual(prev[k], next[k])) continue;
    const before = prev[k];
    const after = next[k];
    const field = humanizeField(k);
    if (typeof after === 'boolean') {
      changes.push(after ? `turned ${field} on` : `turned ${field} off`);
    } else if (before === undefined) {
      changes.push(`set ${field} to ${formatValue(after)}`);
    } else {
      changes.push(`changed ${field} from ${formatValue(before)} to ${formatValue(after)}`);
    }
  }

  if (changes.length === 0) return null;

  const shown = changes.slice(0, MAX_FIELDS);
  const extra = changes.length - shown.length;
  let text = joinList(shown);
  if (extra > 0) text += `, and ${extra} more change${extra > 1 ? 's' : ''}`;
  return text;
}
