import { useEffect, useRef, useState } from 'react';
import { LinePath } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { VizChart, linePath, makeScale, svgPointFromEvent } from './lib/VizChart.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/*
 * The classic heating curve: temperature vs heat added for water. Flat
 * plateaus appear during melting and boiling, where added energy breaks
 * bonds instead of raising temperature. Drag along the curve (or use the
 * slider) and a particle inset shows ice -> water -> steam. Built on visx via
 * the shared VizChart frame: a gradient area sits under the curve, the curve
 * traces in on mount, the two plateaus are shaded + labelled, and a tooltip at
 * the dragged point reads "phase + temperature".
 */

const W = 340;
const H = 220;
const PAD = { l: 44, r: 14, t: 14, b: 38 };
const X_DOMAIN = [0, 100];
const Y_DOMAIN = [-20, 130];

// Key points of the piecewise curve: [heat added, temperature].
const KEY = [
  [0, -20], [15, 0], [38, 0], [62, 100], [88, 100], [100, 125],
];

// Plateau ranges (heat added) where temperature is flat during a phase change.
const PLATEAUS = [
  { from: 15, to: 38, label: 'Melting', temp: '0\u00B0C' },
  { from: 62, to: 88, label: 'Boiling', temp: '100\u00B0C' },
];

function tempAt(h) {
  for (let i = 1; i < KEY.length; i += 1) {
    const [x0, y0] = KEY[i - 1];
    const [x1, y1] = KEY[i];
    if (h <= x1) {
      const f = (h - x0) / (x1 - x0 || 1);
      return y0 + f * (y1 - y0);
    }
  }
  return KEY[KEY.length - 1][1];
}

function phaseAt(h) {
  if (h < 15) return { label: 'Solid ice', kind: 'solid', note: 'Heat warms the ice; particles vibrate faster in place.' };
  if (h < 38) return { label: 'Melting', kind: 'mix', note: 'Plateau: energy breaks the rigid structure, so temperature holds at 0 degrees C.' };
  if (h < 62) return { label: 'Liquid water', kind: 'liquid', note: 'Heat warms the water; particles move faster and slide past each other.' };
  if (h < 88) return { label: 'Boiling', kind: 'mix', note: 'Plateau: energy frees particles into gas, so temperature holds at 100 degrees C.' };
  return { label: 'Steam (gas)', kind: 'gas', note: 'Heat warms the vapor; particles zoom freely and spread out.' };
}

const PARTICLES = {
  solid: [[18, 18], [34, 18], [50, 18], [18, 34], [34, 34], [50, 34]],
  liquid: [[16, 22], [33, 16], [50, 24], [22, 38], [42, 36], [56, 30]],
  gas: [[12, 14], [40, 10], [60, 20], [22, 40], [52, 44], [34, 30]],
  mix: [[18, 30], [34, 30], [50, 30], [22, 14], [44, 16], [58, 22]],
};

/** A small theme-aware SVG tooltip anchored above the dragged point. */
function CurveTip({ cx, cy, lines, accent }) {
  const charW = 6.2;
  const boxW = Math.max(...lines.map((l) => l.length)) * charW + 16;
  const boxH = lines.length * 13 + 10;
  let bx = cx - boxW / 2;
  bx = Math.max(PAD.l + 2, Math.min(W - PAD.r - boxW - 2, bx));
  let by = cy - boxH - 14;
  if (by < PAD.t) by = cy + 16;
  return (
    <g pointerEvents="none">
      <rect x={bx} y={by} width={boxW} height={boxH} rx={7} fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth={1} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
      {lines.map((line, i) => (
        <text key={i} x={bx + boxW / 2} y={by + 15 + i * 13} textAnchor="middle" fontSize={i === 0 ? 11 : 10} fontWeight={i === 0 ? 800 : 600} fill={i === 0 ? accent : 'var(--color-text)'}>
          {line}
        </text>
      ))}
    </g>
  );
}

export default function HeatingCurve({ onReady, savedState, onSaveState }) {
  const [heat, setHeat] = useState(savedState?.heat ?? 8);
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const reduce = usePrefersReducedMotion();
  const [prog, setProg] = useState(reduce ? 1 : 0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-shot trace-in of the curve on mount (snap when reduced motion).
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

  useEffect(() => {
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  const xInvert = makeScale(X_DOMAIN, [PAD.l, W - PAD.r]).invert;

  function setHeatPersist(next) {
    setHeat(next);
    onSaveState?.({ heat: next });
  }

  function onPointer(evt) {
    if (evt.type === 'pointerdown') dragging.current = true;
    if (evt.type === 'pointermove' && !dragging.current) return;
    const { x } = svgPointFromEvent(evt, svgRef.current);
    const next = Math.max(0, Math.min(100, xInvert(x)));
    setHeatPersist(next);
  }

  const curve = [];
  for (let h = 0; h <= 100; h += 1) curve.push([h, tempAt(h)]);
  const temp = tempAt(heat);
  const phase = phaseAt(heat);
  const particles = PARTICLES[phase.kind];

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> drag along the curve. The flat parts are melting and boiling - added
        heat breaks bonds there instead of raising the temperature.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <VizChart
          svgRef={svgRef}
          onPointer={onPointer}
          width={W}
          height={H}
          padding={PAD}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          xTicks={[0, 25, 50, 75, 100]}
          yTicks={[-20, 0, 50, 100, 130]}
          xLabel={'heat added \u2192'}
          yLabel={'temperature (\u00B0C)'}
          formatX={() => ''}
          ariaLabel={`Heating curve of water. Currently ${phase.label} at ${Math.round(temp)} degrees Celsius after adding ${Math.round(heat)} units of heat. Flat plateaus mark melting at 0 and boiling at 100 degrees.`}
        >
          {(x, y) => {
            const areaD = `${linePath(curve, x, y)} L ${x(100)} ${y(Y_DOMAIN[0])} L ${x(0)} ${y(Y_DOMAIN[0])} Z`;
            return (
              <>
                <LinearGradient id="hc-area" from="var(--accent-orange)" to="var(--accent-orange)" fromOpacity={0.3} toOpacity={0.02} />

                {/* shaded plateau bands so the two phase changes stand out */}
                {PLATEAUS.map((p) => (
                  <g key={p.label}>
                    <rect x={x(p.from)} y={y(Y_DOMAIN[1])} width={x(p.to) - x(p.from)} height={y(Y_DOMAIN[0]) - y(Y_DOMAIN[1])} fill="var(--accent-blue)" opacity={0.1} />
                    <text x={(x(p.from) + x(p.to)) / 2} y={y(Y_DOMAIN[1]) + 11} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--accent-blue)">{p.label}</text>
                    <text x={(x(p.from) + x(p.to)) / 2} y={y(Y_DOMAIN[1]) + 22} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--color-text-subtle)">{p.temp}</text>
                  </g>
                ))}

                <path d={areaD} fill="url(#hc-area)" stroke="none" opacity={prog} />

                {/* base curve traces in on mount */}
                <LinePath
                  data={curve}
                  x={(d) => x(d[0])}
                  y={(d) => y(d[1])}
                  stroke="var(--accent-orange)"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - prog}
                />

                {/* progress overlay up to current heat (interactive drag) */}
                <LinePath
                  data={curve.filter((p) => p[0] <= heat)}
                  x={(d) => x(d[0])}
                  y={(d) => y(d[1])}
                  stroke="var(--accent-red)"
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={prog}
                />

                <line x1={x(heat)} y1={PAD.t} x2={x(heat)} y2={H - PAD.b} stroke="var(--color-text-subtle)" strokeWidth="1" strokeDasharray="3 3" opacity={prog} />
                <circle cx={x(heat)} cy={y(temp)} r="7" fill="var(--accent-red)" stroke="var(--color-bg-elevated)" strokeWidth="2" opacity={prog} />

                {prog >= 1 && (
                  <CurveTip cx={x(heat)} cy={y(temp)} accent="var(--accent-orange)" lines={[phase.label, `${Math.round(temp)}\u00B0C`]} />
                )}
              </>
            );
          }}
        </VizChart>
      </div>

      <div className={v.row} style={{ gap: 'var(--space-3)' }}>
        {/* particle inset */}
        <svg width="80" height="64" viewBox="0 0 72 56" aria-hidden="true" style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg)' }}>
          <defs>
            <radialGradient id="hc-shade" cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="38%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          {particles.map(([px, py], i) => (
            <g key={i} style={{ transition: 'transform 0.4s' }}>
              <circle cx={px} cy={py} r="6" fill="var(--accent-blue)" stroke="rgba(0,0,0,0.25)" style={{ transition: 'cx 0.4s, cy 0.4s' }} />
              <circle cx={px} cy={py} r="6" fill="url(#hc-shade)" style={{ transition: 'cx 0.4s, cy 0.4s' }} />
            </g>
          ))}
        </svg>
        <div className={v.readout}>
          <div className={v.stat}><div className={v.statValue} style={{ color: 'var(--accent-orange)' }}>{Math.round(temp)}&deg;C</div><div className={v.statLabel}>temperature</div></div>
          <div className={v.stat}><div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>{phase.label}</div><div className={v.statLabel}>phase</div></div>
        </div>
      </div>

      <input className={v.slider} type="range" min={0} max={100} step={1} value={heat} onChange={(e) => setHeatPersist(Number(e.target.value))} aria-label="Heat added" />
      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 420 }}>{phase.note}</p>
    </div>
  );
}
