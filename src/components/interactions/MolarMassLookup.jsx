import { useEffect, useState } from 'react';
import { ELEMENTS } from './elements.js';
import { parseFormula, atomColor } from './formula.js';
import Formula from './Formula.jsx';
import v from './viz.module.css';

const CHOICES = ['H2O', 'CO2', 'NaCl', 'C6H12O6'];

function massOf(symbol) {
  return ELEMENTS.find((e) => e.symbol === symbol)?.mass ?? 0;
}

/**
 * Select a compound and watch its molar mass build up from each element. The
 * atoms are drawn as shaded balls and a stacked bar shows how much mass each
 * element contributes, so "sum of atomic masses" becomes visual.
 */
export default function MolarMassLookup({ slide, onReady }) {
  const initial = slide?.interactionConfig?.formula;
  const [formula, setFormula] = useState(CHOICES.includes(initial) ? initial : 'H2O');

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comp = parseFormula(formula);
  const parts = Object.entries(comp).map(([el, n]) => ({ el, n, mass: massOf(el) * n }));
  const total = parts.reduce((sum, p) => sum + p.mass, 0);

  // Flatten atoms for the ball diagram (cap to keep glucose readable).
  const atoms = [];
  parts.forEach((p) => {
    for (let i = 0; i < p.n; i += 1) atoms.push(p.el);
  });
  const perRow = Math.min(8, Math.ceil(Math.sqrt(atoms.length)));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a compound">
        {CHOICES.map((f) => (
          <button key={f} type="button" className={formula === f ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setFormula(f)}>
            <Formula value={f} />
          </button>
        ))}
      </div>

      {/* Ball diagram of the atoms in one formula unit */}
      <div className={v.svgWrap} style={{ maxWidth: 320 }}>
        <svg viewBox="0 0 280 110" className={v.svg} role="img" aria-label={`Atoms in ${formula}`}>
          <defs>
            <radialGradient id="mm-shade" cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="36%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          {atoms.map((el, i) => {
            const col = i % perRow;
            const row = Math.floor(i / perRow);
            const rows = Math.ceil(atoms.length / perRow);
            const x = 140 - (Math.min(perRow, atoms.length) - 1) * 15 + col * 30;
            const y = 55 - (rows - 1) * 15 + row * 30;
            return (
              <g key={i} className={v.popIn}>
                <circle cx={x} cy={y} r="12" fill={atomColor(el)} stroke="rgba(0,0,0,0.28)" />
                <circle cx={x} cy={y} r="12" fill="url(#mm-shade)" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0e0f13">{el}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stacked mass contribution bar */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ display: 'flex', height: 22, borderRadius: 'var(--radius-pill)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          {parts.map((p) => (
            <div
              key={p.el}
              title={`${p.el}: ${p.mass.toFixed(1)}`}
              style={{ width: `${(p.mass / total) * 100}%`, background: atomColor(p.el), transition: 'width 0.4s' }}
            />
          ))}
        </div>
        {parts.map((p) => (
          <div key={p.el} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: atomColor(p.el), display: 'inline-block' }} />
              {p.n} &times; {p.el} ({massOf(p.el)})
            </span>
            <span style={{ fontWeight: 700 }}>{p.mass.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 800 }}>
          <span>Molar mass</span>
          <span style={{ color: 'var(--accent-green)' }}>{total.toFixed(2)} g/mol</span>
        </div>
      </div>
      <p className={v.muted} style={{ textAlign: 'center' }}>Molar mass = sum of every atom&rsquo;s atomic mass in the formula.</p>
    </div>
  );
}
