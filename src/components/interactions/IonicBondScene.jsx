import { useEffect, useState } from 'react';
import { getElement, valenceElectrons } from './elements.js';
import Formula from './Formula.jsx';
import v from './viz.module.css';
import s from './IonicBondScene.module.css';

const METALS = [11, 12, 19, 20]; // Na, Mg, K, Ca
const NONMETALS = [17, 9, 8]; // Cl, F, O
const METAL_COLOR = 'var(--accent-purple)';
const NONMETAL_COLOR = 'var(--accent-green)';

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Ionic bonding builder (distinct from the Na->Cl transfer canvas): pick any
 * metal and nonmetal, then transfer electrons. The component crosses the
 * charges to find how many of each ion are needed, animates the electron
 * hand-off, and reveals the neutral formula with proper subscripts.
 */
export default function IonicBondScene({ onReady, savedState, onSaveState }) {
  const [metalN, setMetalN] = useState(savedState?.metalN ?? 12);
  const [nonmetalN, setNonmetalN] = useState(savedState?.nonmetalN ?? 17);
  const [done, setDone] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metal = getElement(metalN);
  const nonmetal = getElement(nonmetalN);
  const metalCharge = valenceElectrons(metal); // e.g. Mg -> 2
  const nonmetalNeed = 8 - valenceElectrons(nonmetal); // e.g. Cl -> 1
  const g = gcd(metalCharge, nonmetalNeed);
  const metalCount = nonmetalNeed / g;
  const nonmetalCount = metalCharge / g;

  const formula = `${metal.symbol}${metalCount > 1 ? metalCount : ''}${nonmetal.symbol}${nonmetalCount > 1 ? nonmetalCount : ''}`;

  function pickMetal(n) {
    setMetalN(n);
    setDone(false);
    onSaveState?.({ metalN: n, nonmetalN });
  }
  function pickNonmetal(n) {
    setNonmetalN(n);
    setDone(false);
    onSaveState?.({ metalN, nonmetalN: n });
  }

  // Lay metals down the left, nonmetals down the right.
  const leftX = 70;
  const rightX = 250;
  const place = (count, x) => {
    const gap = 150 / (count + 1);
    return Array.from({ length: count }, (_, i) => ({ x, y: 40 + gap * (i + 1) }));
  };
  const metalPos = place(metalCount, leftX);
  const nonmetalPos = place(nonmetalCount, rightX);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.row}>
        <div>
          <div className={v.statLabel} style={{ marginBottom: 4, textAlign: 'center' }}>Metal</div>
          <div className={v.toggleGroup} role="group" aria-label="Choose metal">
            {METALS.map((n) => (
              <button key={n} type="button" className={metalN === n ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pickMetal(n)}>
                {getElement(n).symbol}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className={v.statLabel} style={{ marginBottom: 4, textAlign: 'center' }}>Nonmetal</div>
          <div className={v.toggleGroup} role="group" aria-label="Choose nonmetal">
            {NONMETALS.map((n) => (
              <button key={n} type="button" className={nonmetalN === n ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pickNonmetal(n)}>
                {getElement(n).symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 340 }}>
        <svg viewBox="0 0 320 200" className={v.svg} role="img" aria-label={`${metal.name} bonding with ${nonmetal.name}`}>
          <defs>
            <radialGradient id="ib-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          {/* electron transfer arrows */}
          {metalPos.map((mp, i) => {
            const np = nonmetalPos[i % nonmetalPos.length];
            return (
              <line
                key={`arrow-${i}`}
                x1={mp.x + 22}
                y1={mp.y}
                x2={np.x - 22}
                y2={np.y}
                stroke="var(--accent-blue)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className={s.arrow}
                style={{ opacity: done ? 0 : 0.6 }}
              />
            );
          })}

          {metalPos.map((p, i) => (
            <g key={`m-${i}`}>
              <circle cx={p.x} cy={p.y} r="22" fill={METAL_COLOR} />
              <circle cx={p.x} cy={p.y} r="22" fill="url(#ib-shade)" />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="800" fontSize="14" fill="#0e0f13">{metal.symbol}</text>
              {/* valence dots fade away after transfer */}
              {Array.from({ length: metalCharge }).map((_, j) => {
                const a = (j / Math.max(1, metalCharge)) * Math.PI * 2 - Math.PI / 2;
                return (
                  <circle key={j} cx={p.x + 30 * Math.cos(a)} cy={p.y + 30 * Math.sin(a)} r="3.5" fill="var(--accent-yellow)" className={s.fade} style={{ opacity: done ? 0 : 1 }} />
                );
              })}
              <text x={p.x} y={p.y - 30} textAnchor="middle" fontWeight="800" fontSize="13" fill="var(--accent-orange)" className={s.charge} style={{ opacity: done ? 1 : 0 }}>
                {metalCharge === 1 ? '+' : `${metalCharge}+`}
              </text>
            </g>
          ))}

          {nonmetalPos.map((p, i) => (
            <g key={`n-${i}`}>
              <circle cx={p.x} cy={p.y} r="24" fill={NONMETAL_COLOR} />
              <circle cx={p.x} cy={p.y} r="24" fill="url(#ib-shade)" />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="800" fontSize="14" fill="#0e0f13">{nonmetal.symbol}</text>
              {/* gained electrons appear after transfer */}
              {Array.from({ length: nonmetalNeed }).map((_, j) => {
                const a = (j / Math.max(1, nonmetalNeed)) * Math.PI * 2 - Math.PI / 2;
                return (
                  <circle key={j} cx={p.x + 32 * Math.cos(a)} cy={p.y + 32 * Math.sin(a)} r="3.5" fill="var(--accent-blue)" className={s.fade} style={{ opacity: done ? 1 : 0 }} />
                );
              })}
              <text x={p.x} y={p.y - 32} textAnchor="middle" fontWeight="800" fontSize="13" fill="var(--accent-blue)" className={s.charge} style={{ opacity: done ? 1 : 0 }}>
                {nonmetalNeed === 1 ? '\u2212' : `${nonmetalNeed}\u2212`}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setDone((d) => !d)}>
          {done ? 'Reset' : 'Transfer electrons'}
        </button>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}><Formula value={formula} /></div>
          <div className={v.statLabel}>neutral formula</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{metalCount}:{nonmetalCount}</div>
          <div className={v.statLabel}>ion ratio</div>
        </div>
      </div>

      <p className={done ? v.feedbackOk : v.muted}>
        {done ? (
          <>
            {metal.name} gives up its outer electrons to {nonmetal.name}. The charges cross to balance, giving neutral <Formula value={formula} />.
          </>
        ) : (
          `${metal.name} has ${metalCharge} valence electron${metalCharge === 1 ? '' : 's'} to give; each ${nonmetal.name} needs ${nonmetalNeed}. Press transfer to balance them.`
        )}
      </p>
    </div>
  );
}
