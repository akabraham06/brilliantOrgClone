import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';
import { atomColor } from './formula.js';
import { useSpring } from './lib/motion.js';
import { useStruggleReporter } from '../tutor/useStruggleReporter.js';

const clampN = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** A counting number that animates toward its value. */
function CountUp({ value }) {
  return <>{Math.round(useSpring(value, { stiffness: 0.2 }))}</>;
}

// Positionally meaningful layouts for common molecules (bent water, linear CO2,
// diatomics). Coordinates are in a 44x36 box; falls back to a bonded row.
const GLYPH_SHAPES = {
  H2O: { w: 44, atoms: [{ el: 'O', x: 22, y: 13 }, { el: 'H', x: 9, y: 27 }, { el: 'H', x: 35, y: 27 }], bonds: [[0, 1], [0, 2]] },
  CO2: { w: 50, atoms: [{ el: 'C', x: 25, y: 18 }, { el: 'O', x: 9, y: 18 }, { el: 'O', x: 41, y: 18 }], bonds: [[0, 1], [0, 2]] },
  O2: { w: 36, atoms: [{ el: 'O', x: 11, y: 18 }, { el: 'O', x: 27, y: 18 }], bonds: [[0, 1]] },
  H2: { w: 32, atoms: [{ el: 'H', x: 10, y: 18 }, { el: 'H', x: 24, y: 18 }], bonds: [[0, 1]] },
  N2: { w: 36, atoms: [{ el: 'N', x: 11, y: 18 }, { el: 'N', x: 27, y: 18 }], bonds: [[0, 1]] },
};

/** One molecule drawn as a small shaded ball-and-stick cluster. */
function MoleculeGlyph({ formula }) {
  const shape = GLYPH_SHAPES[formula];
  let atoms;
  let bonds;
  let w;
  const h = 36;
  if (shape) {
    atoms = shape.atoms;
    bonds = shape.bonds;
    w = shape.w;
  } else {
    const comp = {};
    const re = /([A-Z][a-z]?)(\d*)/g;
    let m;
    while ((m = re.exec(formula)) !== null) {
      if (!m[1]) continue;
      comp[m[1]] = (comp[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
    }
    const flat = [];
    Object.entries(comp).forEach(([el, n]) => {
      for (let i = 0; i < n; i += 1) flat.push(el);
    });
    w = Math.max(28, flat.length * 18 + 10);
    atoms = flat.map((el, i) => ({ el, x: 14 + i * 18, y: h / 2 }));
    bonds = flat.map((_, i) => (i > 0 ? [i - 1, i] : null)).filter(Boolean);
  }
  return (
    <svg className={v.popIn} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <radialGradient id="mg-shade" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      {bonds.map(([a, b], i) => (
        <line key={`b${i}`} x1={atoms[a].x} y1={atoms[a].y} x2={atoms[b].x} y2={atoms[b].y} stroke="var(--color-text-subtle)" strokeWidth="2.5" />
      ))}
      {atoms.map((a, i) => (
        <g key={`a${i}`}>
          <circle cx={a.x} cy={a.y} r="8" fill={atomColor(a.el)} stroke="rgba(0,0,0,0.3)" />
          <circle cx={a.x} cy={a.y} r="8" fill="url(#mg-shade)" />
          <text x={a.x} y={a.y + 3} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#0e0f13">{a.el}</text>
        </g>
      ))}
    </svg>
  );
}

/** A balance beam that tilts when atom totals differ and levels when balanced. */
function BalanceBeam({ leftTotal, rightTotal, balanced }) {
  const target = balanced ? 0 : leftTotal === rightTotal ? 5 : clampN((rightTotal - leftTotal) * 3, -13, 13);
  const angle = useSpring(target, { stiffness: 0.12 });
  const W = 240;
  const cx = W / 2;
  const beamY = 30;
  const rad = (angle * Math.PI) / 180;
  const half = 86;
  const lx = cx - half * Math.cos(rad);
  const ly = beamY + half * Math.sin(rad);
  const rx = cx + half * Math.cos(rad);
  const ry = beamY - half * Math.sin(rad);
  const color = balanced ? 'var(--accent-green)' : 'var(--accent-orange)';
  const pan = (px, py, total, label) => (
    <g>
      <line x1={px} y1={py} x2={px} y2={py + 22} stroke="var(--color-border-strong)" strokeWidth="1.5" />
      <rect x={px - 26} y={py + 22} width="52" height="22" rx="6" fill="var(--color-bg-elevated)" stroke={color} />
      <text x={px} y={py + 37} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-text)">{total}</text>
      <text x={px} y={py - 6} textAnchor="middle" fontSize="9" fill="var(--color-text-subtle)">{label}</text>
    </g>
  );
  return (
    <svg width="100%" viewBox={`0 0 ${W} 96`} style={{ maxWidth: 300 }} role="img" aria-label={balanced ? 'Balanced' : 'Not balanced'}>
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={color} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={beamY} r="5" fill={color} />
      <path d={`M ${cx - 16} 90 L ${cx + 16} 90 L ${cx} ${beamY + 4} Z`} fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      {pan(lx, ly, leftTotal, 'reactants')}
      {pan(rx, ry, rightTotal, 'products')}
    </svg>
  );
}

function parseFormula(formula) {
  const counts = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  while ((m = re.exec(formula)) !== null) {
    if (!m[1]) continue;
    counts[m[1]] = (counts[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
  }
  return counts;
}

function parseEquation(eq) {
  const [left, right] = eq.split('->').map((s) => s.trim());
  const reactants = left.split('+').map((s) => s.trim());
  const products = right.split('+').map((s) => s.trim());
  return { reactants, products };
}

function sideCounts(terms, coeffs, offset) {
  const total = {};
  terms.forEach((formula, i) => {
    const comp = parseFormula(formula);
    const c = coeffs[offset + i];
    Object.entries(comp).forEach(([el, n]) => {
      total[el] = (total[el] || 0) + n * c;
    });
  });
  return total;
}

/** One side of the equation: each term repeated `coeff` times as molecules. */
function MoleculeSide({ terms, coeffs, offset }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', flex: 1, minWidth: 100 }}>
      {terms.map((formula, i) =>
        Array.from({ length: coeffs[offset + i] }).map((_, k) => (
          <span key={`${formula}-${k}`} style={{ padding: 4, borderRadius: 8, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}>
            <MoleculeGlyph formula={formula} />
          </span>
        )),
      )}
    </div>
  );
}

/**
 * Coefficient-stepper equation balancer. Used for guided practice (ungraded)
 * and for the balance check (graded - correct when both sides match).
 */
export default function EquationBalancer({
  slide,
  graded = false,
  config = {},
  onReady,
  onResult,
  savedState,
  onSaveState,
}) {
  const equation = config.equation || slide?.interactionConfig?.equation || 'H2 + O2 -> H2O';
  const { reactants, products } = useMemo(() => parseEquation(equation), [equation]);
  const all = [...reactants, ...products];

  const [coeffs, setCoeffs] = useState(() =>
    Array.isArray(savedState?.coeffs) && savedState.coeffs.length === all.length
      ? savedState.coeffs
      : all.map(() => 1),
  );
  // Graded mode only: whether the learner has pressed "Check answer".
  const [submitted, setSubmitted] = useState(savedState?.submitted ?? false);

  const reportStruggle = useStruggleReporter({
    enabled: graded,
    slideId: slide?.slideId,
    hintSeed:
      'I\u2019m stuck balancing this equation \u2014 can you give me one small hint for the next step?',
  });

  const left = sideCounts(reactants, coeffs, 0);
  const right = sideCounts(products, coeffs, reactants.length);
  const elements = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
  const balanced = elements.every((el) => (left[el] || 0) === (right[el] || 0));
  const leftTotal = Object.values(left).reduce((a, b) => a + b, 0);
  const rightTotal = Object.values(right).reduce((a, b) => a + b, 0);

  // Ungraded practice is always "ready" on mount. Graded checks do NOT
  // auto-report: the learner must press "Check answer" (see check()), so we
  // intentionally never call onResult from an effect here.
  useEffect(() => {
    if (!graded) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCoeff(i, delta) {
    setCoeffs((prev) => {
      const next = prev.map((c, idx) => (idx === i ? Math.min(9, Math.max(1, c + delta)) : c));
      // Adjusting coefficients clears a previous graded submission so stale
      // feedback never lingers while the learner keeps tweaking.
      onSaveState?.({ coeffs: next, submitted: false });
      return next;
    });
    if (graded) setSubmitted(false);
  }

  function check() {
    setSubmitted(true);
    onResult?.(balanced);
    onSaveState?.({ coeffs, submitted: true });
    reportStruggle(balanced, {
      event: {
        prompt: `Balance the equation: ${equation}`,
        selected: `current coefficients ${all.map((f, i) => `${coeffs[i]} ${f}`).join(' + ')}`,
      },
    });
  }

  function tryAgain() {
    setSubmitted(false);
    onSaveState?.({ coeffs, submitted: false });
  }

  function Term({ formula, i }) {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" className={v.stepBtn} style={{ fontSize: 16 }} onClick={() => setCoeff(i, -1)} aria-label={`Decrease ${formula}`}>&minus;</button>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', minWidth: 56, textAlign: 'center' }}>
            <span style={{ color: 'var(--accent-yellow)' }}>{coeffs[i]}</span> {formula}
          </span>
          <button type="button" className={v.stepBtn} style={{ fontSize: 16 }} onClick={() => setCoeff(i, 1)} aria-label={`Increase ${formula}`}>+</button>
        </span>
      </span>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> adjust the coefficients with the +/&minus; buttons until every atom count
        matches on both sides. The beam levels and turns green when it&rsquo;s balanced.
      </div>

      <div className={v.row} style={{ gap: 'var(--space-2)' }}>
        {reactants.map((f, i) => (
          <span key={`r-${f}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span style={{ fontWeight: 700 }}>+</span>}
            <Term formula={f} i={i} />
          </span>
        ))}
        <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', margin: '0 6px' }}>&rarr;</span>
        {products.map((f, i) => (
          <span key={`p-${f}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span style={{ fontWeight: 700 }}>+</span>}
            <Term formula={f} i={reactants.length + i} />
          </span>
        ))}
      </div>

      {/* Visual molecule view: each side shows its molecules scaled by coefficient. */}
      <div className={v.row} style={{ alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <MoleculeSide terms={reactants} coeffs={coeffs} offset={0} />
        <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', alignSelf: 'center' }}>&rarr;</span>
        <MoleculeSide terms={products} coeffs={coeffs} offset={reactants.length} />
      </div>

      <BalanceBeam leftTotal={leftTotal} rightTotal={rightTotal} balanced={balanced} />

      <div className={v.readout}>
        {elements.map((el) => {
          const ok = (left[el] || 0) === (right[el] || 0);
          return (
            <div key={el} className={v.stat}>
              <div className={v.statValue} style={{ color: ok ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                <CountUp value={left[el] || 0} /> : <CountUp value={right[el] || 0} />
              </div>
              <div className={v.statLabel}>{el} (left:right)</div>
            </div>
          );
        })}
      </div>

      {graded ? (
        <>
          {!submitted && (
            <div className={v.row}>
              <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={check}>
                Check answer
              </button>
            </div>
          )}
          {submitted && balanced && (
            <p className={v.feedbackOk} role="status" aria-live="polite">
              {config.feedbackCorrect || 'Balanced! Matter is conserved.'}
            </p>
          )}
          {submitted && !balanced && (
            <>
              <p className={v.feedbackBad} role="status" aria-live="polite">
                {config.feedbackIncorrect || 'Not balanced yet.'}
                {config.hint ? ` Hint: ${config.hint}` : ''}
              </p>
              <div className={v.row}>
                <button type="button" className={v.btn} onClick={tryAgain}>
                  Try again
                </button>
              </div>
            </>
          )}
        </>
      ) : balanced ? (
        <p className={v.feedbackOk}>Balanced! Every atom count matches.</p>
      ) : (
        <p className={v.muted}>Not balanced yet - keep adjusting the coefficients.</p>
      )}
    </div>
  );
}
