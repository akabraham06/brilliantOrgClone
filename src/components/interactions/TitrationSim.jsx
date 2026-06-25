import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { VizChart, linePath } from './lib/VizChart.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Titration of a strong acid with a strong base. Add base with the slider and
 * watch the pH curve trace out, jump sharply at the equivalence point (25 mL,
 * pH 7), and the phenolphthalein indicator flip from colorless to pink.
 *
 * Built on visx via VizChart. Per the critique's scaffolding note this does NOT
 * just prettify: the steep region is shaded as "the jump", the equivalence
 * point is glossed in plain words, and the coaching text below stages the story
 * ("pH barely moves" -> "the jump" -> "levelling off") as base is added.
 */

const EQ = 25; // equivalence point (mL)

function pHat(vol) {
  // Sigmoid centered on the equivalence point: ~1 -> 7 -> ~13.
  return 7 + 6 * Math.tanh((vol - EQ) / 2.6);
}

const W = 320;
const H = 210;
const PAD = { l: 42, r: 14, t: 14, b: 38 };

export default function TitrationSim({ onReady, savedState, onSaveState }) {
  const [vol, setVol] = useState(savedState?.vol ?? 0);
  const reduce = usePrefersReducedMotion();
  const [prog, setProg] = useState(reduce ? 1 : 0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trace the faint underlying curve in on mount (snap when reduced motion).
  useEffect(() => {
    if (reduce) {
      setProg(1);
      return undefined;
    }
    setProg(0);
    let raf;
    const start = window.performance.now();
    const dur = 900;
    const loop = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setProg(p);
      if (p < 1) raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [reduce]);

  function setVolPersist(next) {
    setVol(next);
    onSaveState?.({ vol: next });
  }

  const curve = [];
  for (let mL = 0; mL <= 50; mL += 0.5) curve.push([mL, pHat(mL)]);
  const pH = pHat(vol);
  const pink = pH >= 8.2; // phenolphthalein turns pink
  const liquid = pink ? 'rgba(236,72,153,0.45)' : 'rgba(96,165,250,0.18)';
  const indicatorStage = pH < 3 ? 'Strongly acidic' : pH < 6 ? 'Acidic' : pH <= 8 ? 'Near neutral' : pH < 11 ? 'Basic' : 'Strongly basic';

  // Scaffolded story: barely-moves -> the jump -> levelling off.
  const eqZone = vol >= EQ - 4 && vol <= EQ + 4;
  let stageTag;
  let stageMsg;
  if (vol < EQ - 4) {
    stageTag = 'Stage 1 \u00b7 pH barely moves';
    stageMsg = 'You are adding base, but the acid soaks it up - the pH only creeps along, almost flat.';
  } else if (eqZone) {
    stageTag = 'The jump';
    stageMsg = 'Equivalence point reached: the acid is used up, so each extra drop now makes the pH leap through neutral.';
  } else {
    stageTag = 'Stage 3 \u00b7 levelling off';
    stageMsg = 'Past the leap the solution is basic; adding more base barely changes the pH again.';
  }

  const activeCurve = curve.filter((p) => p[0] <= vol * prog);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> add base drop by drop. Watch pH barely move, then leap at the
        equivalence point - exactly when the indicator turns pink.
      </div>

      <div className={`${v.panel} ${v.panelWide}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* beaker with indicator color */}
        <svg width="70" height="120" viewBox="0 0 70 120" aria-hidden="true" className={v.sceneShadow}>
          <path d="M 14 20 H 56 V 30 L 60 100 Q 60 112 35 112 Q 10 112 10 100 L 14 30 Z" fill={liquid} stroke="var(--color-border-strong)" strokeWidth="2" style={{ transition: 'fill 0.4s' }} />
          <ellipse cx="35" cy="22" rx="21" ry="4" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" />
        </svg>

        <div className={v.svgWrap} style={{ flex: 1, maxWidth: 300 }}>
          <VizChart
            width={W}
            height={H}
            padding={PAD}
            xDomain={[0, 50]}
            yDomain={[0, 14]}
            xTicks={[0, 25, 50]}
            yTicks={[0, 7, 14]}
            xLabel={'base added (mL) \u2192'}
            yLabel="pH"
            ariaLabel={`Titration curve. After ${vol} mL of base the pH is ${pH.toFixed(1)}, ${indicatorStage}. The curve is nearly flat, then jumps steeply at the equivalence point near 25 mL (pH 7).`}
          >
            {(x, y) => {
              const areaD = activeCurve.length > 1
                ? `${linePath(activeCurve, x, y)} L ${x(activeCurve[activeCurve.length - 1][0])} ${y(0)} L ${x(0)} ${y(0)} Z`
                : '';
              return (
                <>
                  <LinearGradient id="ti-area" from="var(--accent-pink)" to="var(--accent-pink)" fromOpacity={0.28} toOpacity={0.02} />

                  {/* shaded "the jump" band over the steep region */}
                  <rect x={x(EQ - 4)} y={y(14)} width={x(EQ + 4) - x(EQ - 4)} height={y(0) - y(14)} fill="var(--accent-pink)" opacity={0.1} />
                  <text x={x(EQ)} y={y(14) + 11} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--accent-pink)">the jump</text>

                  <line x1={x(EQ)} y1={y(0)} x2={x(EQ)} y2={y(14)} stroke="var(--color-text-subtle)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={x(0)} y1={y(7)} x2={x(50)} y2={y(7)} stroke="var(--color-border)" strokeWidth="1" />

                  {/* faint full curve traces in on mount */}
                  <LinePath
                    data={curve}
                    x={(d) => x(d[0])}
                    y={(d) => y(d[1])}
                    stroke="var(--accent-blue)"
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - prog}
                  />

                  {/* active trace + gradient area as base is added */}
                  {areaD && <path d={areaD} fill="url(#ti-area)" stroke="none" />}
                  {activeCurve.length > 1 && (
                    <LinePath data={activeCurve} x={(d) => x(d[0])} y={(d) => y(d[1])} stroke="var(--accent-pink)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
                  )}

                  {/* equivalence-point marker, emphasized with a pulse */}
                  {!reduce && <circle className={v.eqPulse} cx={x(EQ)} cy={y(7)} r="6" fill="none" stroke="var(--accent-green)" strokeWidth="2" />}
                  <circle cx={x(EQ)} cy={y(7)} r="5" fill="none" stroke="var(--accent-green)" strokeWidth="2" />

                  {/* leading point on the active trace */}
                  {vol > 0 && <circle cx={x(vol)} cy={y(pH)} r="6.5" fill="var(--accent-pink)" stroke="var(--color-bg-elevated)" strokeWidth="2" />}

                  {/* glossing tooltip anchored at the equivalence point */}
                  {(() => {
                    const lines = ['Equivalence point', 'acid exactly neutralized (pH 7)'];
                    const charW = 5.6;
                    const boxW = Math.max(...lines.map((l) => l.length)) * charW + 14;
                    const boxH = 28;
                    let bx = x(EQ) - boxW - 8;
                    if (bx < PAD.l + 2) bx = x(EQ) + 8;
                    bx = Math.min(bx, W - PAD.r - boxW - 2);
                    const by = Math.max(PAD.t + 2, y(7) - boxH - 6);
                    return (
                      <g pointerEvents="none" opacity={eqZone ? 1 : 0.85}>
                        <rect x={bx} y={by} width={boxW} height={boxH} rx={6} fill="var(--color-bg-elevated)" stroke="var(--accent-green)" strokeWidth={1} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                        <text x={bx + boxW / 2} y={by + 12} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--accent-green)">{lines[0]}</text>
                        <text x={bx + boxW / 2} y={by + 23} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--color-text)">{lines[1]}</text>
                      </g>
                    );
                  })()}
                </>
              );
            }}
          </VizChart>
        </div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}><div className={v.statValue}>{vol} mL</div><div className={v.statLabel}>base added</div></div>
        <div className={v.stat}><div className={v.statValue} style={{ color: 'var(--accent-pink)' }}>{pH.toFixed(1)}</div><div className={v.statLabel}>pH</div></div>
        <div className={v.stat}><div className={v.statValue} style={{ fontSize: 'var(--text-base)' }}>{indicatorStage}</div><div className={v.statLabel}>indicator: {pink ? 'pink' : 'colorless'}</div></div>
      </div>

      <input className={v.slider} type="range" min={0} max={50} step={0.5} value={vol} onChange={(e) => setVolPersist(Number(e.target.value))} aria-label="Base added in milliliters" />

      <div className={v.objective} style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.14), rgba(96,165,250,0.06))', borderColor: 'rgba(236,72,153,0.4)' }}>
        <strong style={{ color: 'var(--accent-pink)' }}>{stageTag}.</strong> {stageMsg}
      </div>
    </div>
  );
}
