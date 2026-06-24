import { useEffect, useState } from 'react';
import v from './viz.module.css';
import styles from './ReactionTypeDiagram.module.css';

/*
 * Animated reaction-type explainer. Reactant molecules are drawn on the left
 * and continuously animate across an arrow to become product molecules on the
 * right - combining, splitting, or swapping partners depending on the type.
 * Each atom is a custom-drawn token (gradient sphere + bond), and the whole
 * scene morphs with smooth CSS transitions on a gentle loop.
 */

const C = {
  A: '#f87171', // red
  B: '#60a5fa', // blue
  C: '#34d399', // green
  D: '#fbbf24', // amber
  C_: '#94a3b8', // carbon gray
  O: '#fb7185', // oxygen pink
  H: '#e2e8f0', // hydrogen
};

// A molecule is a list of atoms (label + color); atoms in a molecule are bonded
// in a row. Reactants and products are lists of molecules.
const REACTIONS = {
  synthesis: {
    name: 'Synthesis',
    pattern: 'A + B \u2192 AB',
    example: '2H\u2082 + O\u2082 \u2192 2H\u2082O',
    reactants: [[{ t: 'A', c: C.A }], [{ t: 'B', c: C.B }]],
    products: [[{ t: 'A', c: C.A }, { t: 'B', c: C.B }]],
    desc: 'Two or more simple substances combine into one more complex product. Atoms join up, so the product count goes down.',
  },
  decomposition: {
    name: 'Decomposition',
    pattern: 'AB \u2192 A + B',
    example: '2H\u2082O \u2192 2H\u2082 + O\u2082',
    reactants: [[{ t: 'A', c: C.A }, { t: 'B', c: C.B }]],
    products: [[{ t: 'A', c: C.A }], [{ t: 'B', c: C.B }]],
    desc: 'A single compound breaks apart into two or more simpler substances - often driven by heat, light, or electricity.',
  },
  single: {
    name: 'Single replacement',
    pattern: 'A + BC \u2192 AC + B',
    example: 'Zn + 2HCl \u2192 ZnCl\u2082 + H\u2082',
    reactants: [[{ t: 'A', c: C.A }], [{ t: 'B', c: C.B }, { t: 'C', c: C.C }]],
    products: [[{ t: 'A', c: C.A }, { t: 'C', c: C.C }], [{ t: 'B', c: C.B }]],
    desc: 'One element takes the place of another in a compound. The more reactive element kicks out the less reactive one.',
  },
  double: {
    name: 'Double replacement',
    pattern: 'AB + CD \u2192 AD + CB',
    example: 'AgNO\u2083 + NaCl \u2192 AgCl + NaNO\u2083',
    reactants: [[{ t: 'A', c: C.A }, { t: 'B', c: C.B }], [{ t: 'C', c: C.C }, { t: 'D', c: C.D }]],
    products: [[{ t: 'A', c: C.A }, { t: 'D', c: C.D }], [{ t: 'C', c: C.C }, { t: 'B', c: C.B }]],
    desc: 'Two compounds swap partners. Positive and negative ions trade places to form two new compounds.',
  },
  combustion: {
    name: 'Combustion',
    pattern: 'fuel + O\u2082 \u2192 CO\u2082 + H\u2082O',
    example: 'CH\u2084 + 2O\u2082 \u2192 CO\u2082 + 2H\u2082O',
    reactants: [[{ t: 'C', c: C.C_ }, { t: 'H', c: C.H }], [{ t: 'O', c: C.O }, { t: 'O', c: C.O }]],
    products: [[{ t: 'O', c: C.O }, { t: 'C', c: C.C_ }, { t: 'O', c: C.O }], [{ t: 'H', c: C.H }, { t: 'O', c: C.O }]],
    desc: 'A fuel reacts rapidly with oxygen, releasing energy as heat and light, and producing carbon dioxide and water.',
    flame: true,
  },
};

const VBW = 320;
const VBH = 150;
const ATOM_R = 13;

// Lay molecules out vertically-centered within the left or right half.
function layout(molecules, side) {
  const cxBase = side === 'left' ? VBW * 0.27 : VBW * 0.73;
  const groups = molecules.length;
  const out = [];
  molecules.forEach((mol, mi) => {
    const gy = VBH / 2 + (mi - (groups - 1) / 2) * 56;
    const width = (mol.length - 1) * (ATOM_R * 2 + 4);
    mol.forEach((atom, ai) => {
      const ax = cxBase - width / 2 + ai * (ATOM_R * 2 + 4);
      out.push({ ...atom, x: ax, y: gy, bondTo: ai > 0 ? out.length - 1 : null });
    });
  });
  return out;
}

function Atom({ x, y, t, c }) {
  const id = `g-${t}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="35%" stopColor={c} />
          <stop offset="100%" stopColor={c} stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={ATOM_R} fill={`url(#${id})`} stroke="rgba(0,0,0,0.28)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0e0f13">{t}</text>
    </g>
  );
}

function MoleculeSet({ atoms, visible, fromSide }) {
  const shift = fromSide === 'left' ? -22 : 22;
  return (
    <g
      className={styles.set}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${shift}px) scale(0.92)`,
      }}
    >
      {atoms.map((a, i) =>
        a.bondTo != null ? (
          <line key={`b${i}`} x1={atoms[a.bondTo].x} y1={atoms[a.bondTo].y} x2={a.x} y2={a.y} stroke="var(--color-text-subtle)" strokeWidth="4" strokeLinecap="round" />
        ) : null,
      )}
      {atoms.map((a, i) => (
        <Atom key={i} {...a} />
      ))}
    </g>
  );
}

export default function ReactionTypeDiagram({ slide, onReady }) {
  const cfg = slide?.interactionConfig || {};
  const r = REACTIONS[cfg.reactionType] || REACTIONS.synthesis;
  const [phase, setPhase] = useState('before');

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to the "before" state whenever the reaction type changes.
  useEffect(() => {
    setPhase('before');
  }, [cfg.reactionType]);

  const reactants = layout(r.reactants, 'left');
  const products = layout(r.products, 'right');
  const showAfter = phase === 'after';

  function react() {
    setPhase((p) => (p === 'before' ? 'after' : 'before'));
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={styles.head}>
        <span className={styles.badge}>{r.name}</span>
        <span className={styles.pattern}>{r.pattern}</span>
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 360 }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} role="img" aria-label={`${r.name} reaction animation`}>
          <rect x="2" y="2" width={VBW - 4} height={VBH - 4} rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

          {/* reactants (fade out as the reaction proceeds) */}
          <MoleculeSet atoms={reactants} visible={!showAfter} fromSide="left" />

          {/* clickable arrow triggers the reaction */}
          <g
            className={styles.arrow}
            style={{ opacity: showAfter ? 1 : 0.55, cursor: 'pointer' }}
            onClick={react}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && react()}
            aria-label={showAfter ? 'Reverse the reaction' : 'Run the reaction'}
          >
            <circle cx={VBW / 2} cy={VBH / 2} r="22" fill="transparent" />
            <line x1={VBW / 2 - 18} y1={VBH / 2} x2={VBW / 2 + 18} y2={VBH / 2} stroke="var(--accent-blue)" strokeWidth="3" />
            <path d={`M ${VBW / 2 + 18} ${VBH / 2} l -8 -6 v 12 z`} fill="var(--accent-blue)" />
          </g>

          {/* optional flame for combustion */}
          {r.flame && (
            <g className={styles.flame} style={{ opacity: showAfter ? 0.9 : 0 }}>
              <path d={`M ${VBW / 2} ${VBH / 2 - 30} q 14 16 0 30 q -14 -14 0 -30 z`} fill="var(--accent-orange)" />
              <path d={`M ${VBW / 2} ${VBH / 2 - 20} q 8 10 0 18 q -8 -8 0 -18 z`} fill="var(--accent-yellow)" />
            </g>
          )}

          {/* products (fade in) */}
          <MoleculeSet atoms={products} visible={showAfter} fromSide="right" />
        </svg>
      </div>

      <p className={v.muted} style={{ maxWidth: 420, textAlign: 'center' }}>{r.desc}</p>
      <div className={v.row}>
        <span className={v.muted}>e.g. {r.example}</span>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={react}>
          {showAfter ? 'Reverse \u2190' : 'React \u2192'}
        </button>
      </div>
    </div>
  );
}
