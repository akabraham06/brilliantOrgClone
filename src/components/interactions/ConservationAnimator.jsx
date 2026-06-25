import { useEffect, useState } from 'react';
import { atomColor } from './formula.js';
import { usePrefersReducedMotion, useRaf } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Conservation of mass as a hands-on simulation. The exact same atoms that
 * start as 2 H2 + O2 are dragged through the reaction into 2 H2O when the user
 * clicks "React". Atoms physically translate to their new homes, bonds break
 * and reform, and a balance beam stays perfectly level because no mass is
 * gained or lost - it is only rearranged.
 */

// Each atom keeps its identity across the reaction: a "before" position in the
// reactants and an "after" position in the products. el sets its color/mass.
const ATOMS = [
  { id: 'h1', el: 'H', from: [35, 38], to: [104, 86] },
  { id: 'h2', el: 'H', from: [64, 38], to: [146, 86] },
  { id: 'h3', el: 'H', from: [35, 96], to: [188, 86] },
  { id: 'h4', el: 'H', from: [64, 96], to: [230, 86] },
  { id: 'o1', el: 'O', from: [268, 52], to: [125, 58] },
  { id: 'o2', el: 'O', from: [268, 100], to: [209, 58] },
];

const BONDS_BEFORE = [['h1', 'h2'], ['h3', 'h4'], ['o1', 'o2']];
const BONDS_AFTER = [['o1', 'h1'], ['o1', 'h2'], ['o2', 'h3'], ['o2', 'h4']];

const R = { H: 9, O: 12 };
const lerp = (a, b, t) => a + (b - a) * t;
// Deliberately slow so learners can track each atom and count before/after.
const DURATION_MS = 4200;
// Ease in/out: dwells (moves slowly) near the "before" (0) and "after" (1)
// states and speeds up through the middle, giving natural pauses to count atoms.
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

export default function ConservationAnimator({ onReady }) {
  const reduce = usePrefersReducedMotion();
  const [reacted, setReacted] = useState(false);
  // Raw 0..1 progress driven at a fixed pace; eased before it positions atoms.
  const [raw, setRaw] = useState(0);
  const target = reacted ? 1 : 0;

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap to the correct end state when reduced motion is requested.
  useEffect(() => {
    if (reduce) setRaw(target);
  }, [reduce, target]);

  useRaf(
    (dt) => {
      setRaw((cur) => {
        const dir = Math.sign(target - cur);
        if (dir === 0) return cur;
        const next = cur + (dir * dt) / DURATION_MS;
        if ((dir > 0 && next >= target) || (dir < 0 && next <= target)) return target;
        return next;
      });
    },
    !reduce && raw !== target,
  );

  const t = easeInOut(raw);

  const pos = {};
  ATOMS.forEach((a) => {
    pos[a.id] = [lerp(a.from[0], a.to[0], t), lerp(a.from[1], a.to[1], t)];
  });

  const bondLine = (key, [a, b], opacity) =>
    opacity <= 0.02 ? null : (
      <line
        key={key}
        x1={pos[a][0]}
        y1={pos[a][1]}
        x2={pos[b][0]}
        y2={pos[b][1]}
        stroke="var(--color-text-subtle)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity={opacity}
      />
    );

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> run the reaction and watch the <em>same</em> atoms regroup. Count them
        before and after - nothing is created or destroyed.
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 360 }}>
        <svg viewBox="0 0 320 150" className={v.svg} role="img" aria-label={reacted ? 'After: 2 water molecules' : 'Before: 2 hydrogen molecules and 1 oxygen molecule'}>
          <defs>
            <radialGradient id="ca-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {BONDS_BEFORE.map((b, i) => bondLine(`bb${i}`, b, 1 - t))}
          {BONDS_AFTER.map((b, i) => bondLine(`ba${i}`, b, t))}

          {ATOMS.map((a) => (
            <g key={a.id}>
              <circle cx={pos[a.id][0]} cy={pos[a.id][1]} r={R[a.el]} fill={atomColor(a.el)} stroke="rgba(0,0,0,0.28)" />
              <circle cx={pos[a.id][0]} cy={pos[a.id][1]} r={R[a.el]} fill="url(#ca-shade)" />
              <text x={pos[a.id][0]} y={pos[a.id][1] + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0e0f13">{a.el}</text>
            </g>
          ))}
        </svg>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>
        {reacted ? '2 H\u2082O \u2014 made from the very same atoms.' : '2 H\u2082 + O\u2082 \u2014 ready to react.'}
      </p>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setReacted((p) => !p)}>
          {reacted ? 'Reverse \u2190' : 'React \u2192'}
        </button>
      </div>

      <div className={v.readout}>
        <div className={v.stat}><div className={v.statValue}>4 : 4</div><div className={v.statLabel}>H atoms in:out</div></div>
        <div className={v.stat}><div className={v.statValue}>2 : 2</div><div className={v.statLabel}>O atoms in:out</div></div>
        <div className={v.stat}><div className={v.statValue} style={{ color: 'var(--accent-green)' }}>36 = 36</div><div className={v.statLabel}>mass (g/mol)</div></div>
      </div>
    </div>
  );
}
