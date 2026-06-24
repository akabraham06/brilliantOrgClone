/** Parse a simple chemical formula like "H2O" into { H: 2, O: 1 }. */
export function parseFormula(formula) {
  const counts = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  while ((m = re.exec(formula)) !== null) {
    if (!m[1]) continue;
    counts[m[1]] = (counts[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
  }
  return counts;
}

/** Accent color per element symbol, used to color-code atoms in diagrams. */
export const ATOM_COLORS = {
  H: '#e9edf7',
  O: 'var(--accent-pink)',
  C: 'var(--color-text-subtle)',
  N: 'var(--accent-blue)',
  Na: 'var(--accent-purple)',
  Cl: 'var(--accent-green)',
  Mg: 'var(--accent-orange)',
  Ca: 'var(--accent-yellow)',
};

export function atomColor(symbol) {
  return ATOM_COLORS[symbol] || 'var(--accent-blue)';
}
