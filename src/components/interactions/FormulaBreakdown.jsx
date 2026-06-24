import { useEffect, useState } from 'react';
import { parseFormula, atomColor } from './formula.js';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';
import styles from './FormulaBreakdown.module.css';

const CHOICES = ['H2O', 'CO2', 'NaCl'];

// Geometrically meaningful 2D layouts (SVG units, ~120 x 96 box).
const SHAPES = {
  H2O: {
    atoms: [
      { el: 'O', x: 60, y: 36, r: 19 },
      { el: 'H', x: 30, y: 66, r: 12 },
      { el: 'H', x: 90, y: 66, r: 12 },
    ],
    bonds: [[0, 1], [0, 2]],
    ionic: false,
  },
  CO2: {
    atoms: [
      { el: 'C', x: 60, y: 50, r: 17 },
      { el: 'O', x: 22, y: 50, r: 15 },
      { el: 'O', x: 98, y: 50, r: 15 },
    ],
    bonds: [[0, 1], [0, 2]],
    double: true,
    ionic: false,
  },
  NaCl: {
    atoms: [
      { el: 'Na', x: 40, y: 50, r: 16, charge: '+' },
      { el: 'Cl', x: 86, y: 50, r: 18, charge: '\u2212' },
    ],
    bonds: [],
    ionic: true,
  },
};

function CountUp({ value }) {
  return <>{Math.round(useSpring(value, { stiffness: 0.18 }))}</>;
}

/** One molecule drawn in its real shape (bent, linear, or an ion pair). */
function MoleculeCluster({ formula }) {
  const shape = SHAPES[formula];
  if (!shape) return null;
  const { atoms, bonds, double, ionic } = shape;
  return (
    <svg viewBox="0 0 120 96" width="120" height="96" aria-hidden="true">
      <defs>
        <radialGradient id="fb-shade" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      {bonds.map(([a, b], i) => {
        const A = atoms[a];
        const B = atoms[b];
        if (double) {
          const dx = B.y - A.y;
          const dy = A.x - B.x;
          const L = Math.hypot(dx, dy) || 1;
          const ox = (dx / L) * 3;
          const oy = (dy / L) * 3;
          return (
            <g key={i}>
              <line x1={A.x + ox} y1={A.y + oy} x2={B.x + ox} y2={B.y + oy} stroke="var(--color-text-subtle)" strokeWidth="2.5" />
              <line x1={A.x - ox} y1={A.y - oy} x2={B.x - ox} y2={B.y - oy} stroke="var(--color-text-subtle)" strokeWidth="2.5" />
            </g>
          );
        }
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--color-text-subtle)" strokeWidth="3" />;
      })}
      {ionic && <line x1={atoms[0].x} y1={atoms[0].y} x2={atoms[1].x} y2={atoms[1].y} stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 3" />}
      {atoms.map((a, i) => (
        <g key={i}>
          <circle cx={a.x} cy={a.y} r={a.r} fill={atomColor(a.el)} />
          <circle cx={a.x} cy={a.y} r={a.r} fill="url(#fb-shade)" />
          <text x={a.x} y={a.y + a.r * 0.34} textAnchor="middle" fontSize={a.r} fontWeight="800" fill="#0e0f13">{a.el}</text>
          {a.charge && (
            <text x={a.x + a.r + 5} y={a.y - a.r + 6} textAnchor="middle" fontSize="11" fontWeight="800" fill={a.charge === '+' ? 'var(--accent-orange)' : 'var(--accent-blue)'}>{a.charge}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * Breaks a formula into shaded ball-and-stick molecule clusters. The
 * coefficient stepper spawns whole molecules; subscripts stay within a
 * molecule. Total atoms count-animates so subscript vs coefficient is clear.
 */
export default function FormulaBreakdown({ slide, onReady }) {
  const initial = slide?.interactionConfig?.formula || 'H2O';
  const [formula, setFormula] = useState(CHOICES.includes(initial) ? initial : 'H2O');
  const [coeff, setCoeff] = useState(1);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const composition = parseFormula(formula);
  const moleculeAtoms = [];
  Object.entries(composition).forEach(([el, n]) => {
    for (let i = 0; i < n; i += 1) moleculeAtoms.push(el);
  });
  const perMolecule = moleculeAtoms.length;
  const totalAtoms = perMolecule * coeff;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose formula">
        {CHOICES.map((f) => (
          <button key={f} type="button" className={formula === f ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => { setFormula(f); setCoeff(1); }}>{f}</button>
        ))}
      </div>

      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
        <span style={{ color: 'var(--accent-yellow)' }}>{coeff > 1 ? coeff : ''}</span>
        {Object.entries(composition).map(([el, n]) => (
          <span key={el} style={{ color: atomColor(el) }}>
            {el}<sub>{n > 1 ? n : ''}</sub>
          </span>
        ))}
      </div>

      <div className={v.row} style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        {Array.from({ length: coeff }).map((_, mi) => (
          <div key={mi} className={`${styles.box} ${v.popIn}`} aria-label={`Molecule ${mi + 1}`}>
            <MoleculeCluster formula={formula} />
          </div>
        ))}
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-blue)' }}>{perMolecule}</div>
          <div className={v.statLabel}>atoms / molecule (subscripts)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-yellow)' }}>{coeff}</div>
          <div className={v.statLabel}>molecules (coefficient)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-green)' }}><CountUp value={totalAtoms} /></div>
          <div className={v.statLabel}>total atoms</div>
        </div>
      </div>

      <div className={v.row}>
        <span className={v.muted}>Coefficient (molecules):</span>
        <div className={v.stepper}>
          <button type="button" className={v.stepBtn} onClick={() => setCoeff((c) => Math.max(1, c - 1))} disabled={coeff <= 1} aria-label="Fewer molecules">&minus;</button>
          <span className={v.stepValue}>{coeff}</span>
          <button type="button" className={v.stepBtn} onClick={() => setCoeff((c) => Math.min(4, c + 1))} disabled={coeff >= 4} aria-label="More molecules">+</button>
        </div>
      </div>

      <p className={v.muted}>
        Subscripts count atoms inside one molecule; the coefficient multiplies whole molecules. {coeff} &times; {perMolecule} = {totalAtoms} atoms.
      </p>
    </div>
  );
}
