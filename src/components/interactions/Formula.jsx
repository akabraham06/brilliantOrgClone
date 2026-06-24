/* eslint-disable react-refresh/only-export-components */
/**
 * Renders chemical formulas with proper subscripts and superscripts.
 *
 *   H2O    -> H<sub>2</sub>O
 *   CO2    -> CO<sub>2</sub>
 *   MgCl2  -> MgCl<sub>2</sub>
 *   Na+    -> Na<sup>+</sup>
 *   Mg2+   -> Mg<sup>2+</sup>
 *   O2-    -> O<sup>2-</sup>
 *   2H2O   -> 2H<sub>2</sub>O   (leading coefficient stays full size)
 *
 * A digit run is a subscript when it follows an element letter or a closing
 * bracket. A digit run (or lone +/-) immediately tied to a charge sign becomes a
 * superscript. Leading coefficients and standalone numbers are left untouched.
 */
export function formatFormula(input) {
  const str = String(input ?? '');
  const nodes = [];
  let buf = '';
  let key = 0;
  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = '';
    }
  };

  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    const prev = str[i - 1];
    const prevIsFormula = prev != null && /[A-Za-z)\]]/.test(prev);

    if (/\d/.test(ch)) {
      let j = i;
      while (j < str.length && /\d/.test(str[j])) j += 1;
      const digits = str.slice(i, j);
      const next = str[j];
      if ((next === '+' || next === '-') && prevIsFormula) {
        flush();
        nodes.push(
          <sup key={key} className="chem-sup">
            {digits}
            {next === '-' ? '\u2212' : '+'}
          </sup>,
        );
        key += 1;
        i = j; // skip the sign too
        continue;
      }
      if (prevIsFormula) {
        flush();
        nodes.push(
          <sub key={key} className="chem-sub">
            {digits}
          </sub>,
        );
        key += 1;
        i = j - 1;
        continue;
      }
      buf += digits;
      i = j - 1;
      continue;
    }

    if ((ch === '+' || ch === '-') && prevIsFormula) {
      // Only a charge when it is not a hyphen between words (e.g. "C-O").
      const next = str[i + 1];
      const isCharge = next == null || /[\s),.;:]/.test(next);
      if (isCharge) {
        flush();
        nodes.push(
          <sup key={key} className="chem-sup">
            {ch === '-' ? '\u2212' : '+'}
          </sup>,
        );
        key += 1;
        continue;
      }
    }

    buf += ch;
  }
  flush();
  return nodes;
}

/** Inline chemical formula. Pass the formula via `value` or as children. */
export default function Formula({ value, children }) {
  return <>{formatFormula(value != null ? value : children)}</>;
}
