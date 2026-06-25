import { useEffect, useRef, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { VizChart, linePath, svgPointFromEvent } from './lib/VizChart.jsx';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Reaction energy diagram: energy vs reaction progress. Toggle exothermic vs
 * endothermic to see reactants and products at different heights, and drag the
 * activation-energy handle on the peak (or the slider) to raise or lower the
 * hump the reaction must climb. Built on visx via VizChart: a gradient area is
 * shaded under the curve, an Ea bracket annotates the barrier, level guides and
 * a net-deltaE arrow are labelled, and the whole landscape morphs smoothly (via
 * springs) when toggling exo/endo or dragging Ea (snaps under reduced motion).
 */

const W = 340;
const H = 220;
const PAD = { l: 42, r: 14, t: 14, b: 38 };
const Y_DOMAIN = [0, 130];

// Reconstruct the visx y-scale inverse (data <- pixel) so the drag handle can
// turn a pointer position into an activation-energy value. Mirrors VizChart's
// scaleLinear({ domain: Y_DOMAIN, range: [H - PAD.b, PAD.t] }).
const Y_R0 = H - PAD.b;
const Y_R1 = PAD.t;
const pxToEnergy = (py) => Y_DOMAIN[0] + ((py - Y_R0) * (Y_DOMAIN[1] - Y_DOMAIN[0])) / (Y_R1 - Y_R0);

function buildCurve(reactantE, productE, peakE) {
  // Smooth-ish path: reactants flat -> rise to peak -> fall to products flat.
  const pts = [];
  for (let i = 0; i <= 60; i += 1) {
    const t = i / 60; // 0..1 reaction progress
    let e;
    if (t < 0.2) e = reactantE;
    else if (t > 0.8) e = productE;
    else {
      const u = (t - 0.2) / 0.6; // 0..1 across the hump
      const hump = Math.sin(u * Math.PI); // 0 -> 1 -> 0
      const base = reactantE + (productE - reactantE) * u;
      e = base + (peakE - Math.max(reactantE, productE)) * hump;
    }
    pts.push([t, e]);
  }
  return pts;
}

export default function EnergyDiagram({ onReady, savedState, onSaveState }) {
  const [exo, setExo] = useState(savedState?.exo ?? true);
  const [activation, setActivation] = useState(savedState?.activation ?? 60); // extra height of the hump
  const svgRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reactantE = exo ? 70 : 30;
  const productE = exo ? 25 : 75;
  const peakE = Math.max(reactantE, productE) + activation * 0.4 + 10;

  // Spring toward the targets so exo/endo + Ea changes morph fluidly.
  const aReactant = useSpring(reactantE);
  const aProduct = useSpring(productE);
  const aPeak = useSpring(peakE);

  const curve = buildCurve(aReactant, aProduct, aPeak);

  const deltaE = Math.round(productE - reactantE); // negative when exothermic
  const eaValue = Math.round(peakE - reactantE); // barrier above the reactants
  const releasedAbsorbed = exo ? 'released to the surroundings' : 'absorbed from the surroundings';
  const statusText = exo
    ? `Exothermic: products sit lower, so net energy is released (ΔE = ${deltaE}).`
    : `Endothermic: products sit higher, so net energy is absorbed (ΔE = +${deltaE}).`;

  function chooseExo(next) {
    setExo(next);
    onSaveState?.({ exo: next, activation });
  }
  function chooseActivation(next) {
    const clamped = Math.min(100, Math.max(10, Math.round(next)));
    setActivation(clamped);
    onSaveState?.({ exo, activation: clamped });
  }

  // Drag the peak handle vertically -> map pixel back to an activation value.
  function onHandleDown(e) {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onHandleMove(e) {
    if (!dragging.current) return;
    const { y: py } = svgPointFromEvent(e, svgRef.current);
    const energy = pxToEnergy(py);
    // invert peakE = max(reactantE, productE) + activation*0.4 + 10
    const next = (energy - Math.max(reactantE, productE) - 10) / 0.4;
    chooseActivation(next);
  }
  function onHandleUp(e) {
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> compare reactant and product energy, and drag the orange handle on the
        peak to raise or lower the activation-energy hump every reaction must climb.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Reaction type">
        <button type="button" className={exo ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseExo(true)}>Exothermic</button>
        <button type="button" className={!exo ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseExo(false)}>Endothermic</button>
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 360 }}>
        <VizChart
          width={W}
          height={H}
          padding={PAD}
          svgRef={svgRef}
          xDomain={[0, 1]}
          yDomain={Y_DOMAIN}
          xTicks={[0, 0.5, 1]}
          yTicks={[0, 50, 100]}
          xLabel={'reaction progress \u2192'}
          yLabel="energy"
          formatX={(t) => (t === 0 ? 'start' : t === 1 ? 'end' : '')}
          formatY={() => ''}
          ariaLabel={`${exo ? 'Exothermic' : 'Endothermic'} reaction energy diagram. Reactants ${exo ? 'higher' : 'lower'} than products, with an activation-energy barrier of about ${eaValue} units the reaction must climb. Net energy change ${exo ? deltaE : `+${deltaE}`}.`}
        >
          {(x, y) => {
            const peakX = 0.5;
            const areaD = `${linePath(curve, x, y)} L ${x(1)} ${y(Y_DOMAIN[0])} L ${x(0)} ${y(Y_DOMAIN[0])} Z`;
            const eaTop = y(aPeak);
            const eaBot = y(aReactant);
            const eaX = x(peakX);
            const handleY = y(peakE);
            const netX = x(0.5);
            const netColor = exo ? 'var(--accent-green)' : 'var(--accent-pink)';
            return (
              <>
                <LinearGradient id="ed-area" from="var(--accent-purple)" to="var(--accent-purple)" fromOpacity={0.32} toOpacity={0.03} />
                <path d={areaD} fill="url(#ed-area)" stroke="none" />

                <LinePath
                  data={curve}
                  x={(d) => x(d[0])}
                  y={(d) => y(d[1])}
                  curve={curveMonotoneX}
                  stroke="var(--accent-purple)"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* reactant / product level guides spanning the chart for comparison */}
                <line x1={x(0)} y1={y(aReactant)} x2={x(1)} y2={y(aReactant)} stroke="var(--color-text-subtle)" strokeDasharray="3 3" strokeOpacity="0.7" />
                <line x1={x(0)} y1={y(aProduct)} x2={x(1)} y2={y(aProduct)} stroke="var(--color-text-subtle)" strokeDasharray="3 3" strokeOpacity="0.7" />

                {/* net deltaE arrow between the two levels */}
                <g stroke={netColor} strokeWidth="1.5">
                  <line x1={netX} y1={y(aReactant)} x2={netX} y2={y(aProduct)} />
                  <path d={`M ${netX - 4} ${y(aProduct) + (exo ? -6 : 6)} L ${netX} ${y(aProduct)} L ${netX + 4} ${y(aProduct) + (exo ? -6 : 6)}`} fill="none" />
                </g>
                <rect x={netX + 5} y={(y(aReactant) + y(aProduct)) / 2 - 8} width={34} height={15} rx={4} fill="var(--color-bg-elevated)" stroke={netColor} strokeWidth={1} />
                <text x={netX + 22} y={(y(aReactant) + y(aProduct)) / 2 + 3} textAnchor="middle" fontSize="8.5" fill={netColor} fontWeight="800">{`ΔE ${exo ? deltaE : `+${deltaE}`}`}</text>

                {/* activation-energy bracket: top + bottom ticks + arrowed stem */}
                <g stroke="var(--accent-orange)" strokeWidth="1.5">
                  <line x1={eaX - 5} y1={eaTop} x2={eaX + 5} y2={eaTop} />
                  <line x1={eaX - 5} y1={eaBot} x2={eaX + 5} y2={eaBot} />
                  <line x1={eaX} y1={eaBot} x2={eaX} y2={eaTop} strokeDasharray="2 2" />
                </g>
                <rect x={eaX + 4} y={(eaTop + eaBot) / 2 - 8} width={22} height={15} rx={4} fill="var(--color-bg-elevated)" stroke="var(--accent-orange)" strokeWidth={1} />
                <text x={eaX + 15} y={(eaTop + eaBot) / 2 + 3} textAnchor="middle" fontSize="9" fill="var(--accent-orange)" fontWeight="800">Ea</text>

                {/* draggable peak handle */}
                <circle
                  cx={eaX}
                  cy={handleY}
                  r={9}
                  fill="var(--accent-orange)"
                  stroke="#0e0f13"
                  strokeWidth="1.5"
                  style={{ cursor: 'ns-resize', touchAction: 'none' }}
                  onPointerDown={onHandleDown}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  onPointerCancel={onHandleUp}
                  role="slider"
                  aria-label="Activation energy"
                  aria-valuemin={10}
                  aria-valuemax={100}
                  aria-valuenow={activation}
                />

                <text x={x(0.04)} y={y(aReactant) - 6} fontSize="9" fill="var(--color-text)" fontWeight="700">reactants</text>
                <text x={x(0.96)} y={y(aProduct) - 6} textAnchor="end" fontSize="9" fill="var(--color-text)" fontWeight="700">products</text>
              </>
            );
          }}
        </VizChart>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--color-text)' }}>{Math.round(reactantE)}</div>
          <div className={v.statLabel}>reactant level</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--color-text)' }}>{Math.round(productE)}</div>
          <div className={v.statLabel}>product level</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-orange)' }}>{eaValue}</div>
          <div className={v.statLabel}>activation energy</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: exo ? 'var(--accent-green)' : 'var(--accent-pink)' }}>{exo ? deltaE : `+${deltaE}`}</div>
          <div className={v.statLabel}>net ΔE</div>
        </div>
      </div>

      <label className={v.muted} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
        Activation energy
        <input className={v.slider} type="range" min={10} max={100} step={1} value={activation} onChange={(e) => chooseActivation(Number(e.target.value))} aria-label="Activation energy" />
      </label>

      <p className={exo ? v.feedbackOk : v.feedbackBad} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {statusText} Energy is {releasedAbsorbed}.
      </p>
    </div>
  );
}
