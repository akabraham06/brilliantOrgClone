import { useEffect, useMemo, useRef, useState } from 'react';
import v from './viz.module.css';
import s from './IdealGasLawExplainer.module.css';
import { usePrefersReducedMotion } from './lib/motion.js';

/*
 * Ideal gas law explainer: the equation PV = nRT is the centerpiece, shown with
 * each variable color-coded and labeled. Sliders set the amount (n), temperature
 * (T), and volume (V); pressure (P) is solved live from P = nRT / V and the
 * substituted numbers update in real time. A piston-style container responds -
 * its width tracks volume, the particle count tracks amount, and the particles
 * warm from blue to red with temperature - while a gauge tracks pressure.
 *
 * R is the real gas constant in L*atm/(mol*K), so with n in mol, T in K, and V
 * in L the pressure comes out in atm.
 *
 * When `interactionConfig.descriptions` holds more than one entry, the same box
 * doubles as a sequence of thought experiments: pressing the global Next button
 * advances the caption (via `registerNextIntercept`) and, if a matching
 * `interactionConfig.demos` entry exists, snaps the sliders to act that
 * experiment out (e.g. heat it up, squeeze the box, add more gas) before the
 * player moves on.
 */

const R = 0.0821;

const N_MIN = 0.5;
const N_MAX = 4;
const T_MIN = 100;
const T_MAX = 400;
const V_MIN = 2;
const V_MAX = 20;

/** Round to at most 2 decimals, trimming trailing zeros (4.50 -> 4.5). */
function tidy(n) {
  return parseFloat(n.toFixed(2)).toString();
}

// Tiny deterministic RNG so particle positions stay stable for a given count.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function placeParticles(count, region) {
  const rng = mulberry32(count * 97 + 7);
  const pts = [];
  let tries = 0;
  const minDist = 16;
  while (pts.length < count && tries < count * 400) {
    tries += 1;
    const x = region.x0 + rng() * (region.x1 - region.x0);
    const y = region.y0 + rng() * (region.y1 - region.y0);
    if (pts.every(([px, py]) => (px - x) ** 2 + (py - y) ** 2 > minDist * minDist)) {
      pts.push([x, y]);
    }
  }
  return pts;
}

// Blend cool blue -> warm red as temperature climbs, for the particle fill.
function tempColor(t) {
  const frac = (t - T_MIN) / (T_MAX - T_MIN);
  const r = Math.round(96 + frac * (239 - 96));
  const g = Math.round(165 + frac * (68 - 165));
  const b = Math.round(250 + frac * (68 - 250));
  return `rgb(${r}, ${g}, ${b})`;
}

const BOX_W = 300;
const BOX_H = 170;
const WALL_MIN = 110; // narrowest inner gas width (small volume)
const WALL_MAX = 256; // widest inner gas width (large volume)

export default function IdealGasLawExplainer({ slide, onReady, registerNextIntercept, savedState, onSaveState }) {
  const [n, setN] = useState(savedState?.n ?? 1);
  const [temp, setTemp] = useState(savedState?.temp ?? 300);
  const [vol, setVol] = useState(savedState?.vol ?? 10);
  const reduce = usePrefersReducedMotion();

  const descriptions = slide?.interactionConfig?.descriptions || null;
  const demos = slide?.interactionConfig?.demos || null;
  const multiStage = Array.isArray(descriptions) && descriptions.length > 1;
  const [stage, setStage] = useState(savedState?.stage ?? 0);
  const stageRef = useRef(stage);
  // Which slider the current thought experiment is exercising, for a highlight.
  const focus = useMemo(() => {
    const d = demos?.[stage];
    if (!d) return null;
    if (d.temp !== undefined) return 'temp';
    if (d.vol !== undefined) return 'vol';
    if (d.n !== undefined) return 'n';
    return null;
  }, [demos, stage]);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  function change(next) {
    const merged = { n, temp, vol, ...next, stage: stageRef.current };
    if (next.n !== undefined) setN(next.n);
    if (next.temp !== undefined) setTemp(next.temp);
    if (next.vol !== undefined) setVol(next.vol);
    onSaveState?.(merged);
  }

  // Snap the sliders to act out a thought experiment when entering its stage.
  function applyDemo(demo, nextStage) {
    if (demo) {
      if (demo.n !== undefined) setN(demo.n);
      if (demo.temp !== undefined) setTemp(demo.temp);
      if (demo.vol !== undefined) setVol(demo.vol);
    }
    onSaveState?.({
      n: demo?.n ?? n,
      temp: demo?.temp ?? temp,
      vol: demo?.vol ?? vol,
      stage: nextStage,
    });
  }

  useEffect(() => {
    if (!multiStage || !registerNextIntercept) return undefined;
    registerNextIntercept(() => {
      if (stageRef.current < descriptions.length - 1) {
        const nextStage = stageRef.current + 1;
        setStage(nextStage);
        applyDemo(demos?.[nextStage], nextStage);
        return true; // handled - stay on this slide and run the next experiment
      }
      return false; // let the player advance normally
    });
    return () => registerNextIntercept(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiStage, descriptions, demos, registerNextIntercept]);

  const pressure = (n * R * temp) / vol;

  // Inner gas width tracks volume; piston sits at the right edge of the gas.
  const volFrac = (vol - V_MIN) / (V_MAX - V_MIN);
  const gasWidth = WALL_MIN + volFrac * (WALL_MAX - WALL_MIN);
  const gasX0 = 18;
  const gasX1 = gasX0 + gasWidth;

  const particleCount = Math.max(3, Math.min(28, Math.round(n * 7)));
  const region = { x0: gasX0 + 12, x1: gasX1 - 12, y0: 22, y1: BOX_H - 22 };
  // Positions depend on the particle count and the current gas width; object
  // identity of `region` is intentionally not a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const positions = useMemo(() => placeParticles(particleCount, region), [particleCount, gasWidth]);

  const fill = tempColor(temp);
  // Faster particles at higher T -> shorter vibration cycle.
  const vibeDur = 1.4 - ((temp - T_MIN) / (T_MAX - T_MIN)) * 1.0;

  // Color P by magnitude so pressure reads at a glance (no separate gauge).
  const pNorm = (pressure / 12) * 100;
  const pColor = pNorm > 75 ? 'var(--accent-red)' : pNorm > 45 ? 'var(--accent-orange)' : 'var(--accent-green)';

  return (
    <div className={`${v.stage} ${s.compact}`} style={{ width: '100%' }}>
      <div className={v.objective}>
        {multiStage ? (
          descriptions[stage]
        ) : (
          <>
            <strong>One equation ties a gas together.</strong> Change the amount, temperature, or volume and
            watch the pressure - and every number in PV = nRT - update live.
          </>
        )}
      </div>

      {/* One living equation does the work of the static formula, the legend,
          and the substitution line at once: each variable carries its current
          value and unit, and P (the solved-for answer) is color-coded by
          magnitude so pressure reads at a glance - no separate gauge needed. */}
      <div className={s.liveEq} aria-hidden="true">
        <span className={s.cell}>
          <span className={`${s.sym} ${s.varP}`}>P</span>
          <span className={s.val} style={{ color: pColor }}>{tidy(pressure)}</span>
          <span className={s.unit}>atm</span>
        </span>
        <span className={s.op}>&middot;</span>
        <span className={s.cell}>
          <span className={`${s.sym} ${s.varV}`}>V</span>
          <span className={s.val}>{vol}</span>
          <span className={s.unit}>L</span>
        </span>
        <span className={s.op}>=</span>
        <span className={s.cell}>
          <span className={`${s.sym} ${s.varN}`}>n</span>
          <span className={s.val}>{tidy(n)}</span>
          <span className={s.unit}>mol</span>
        </span>
        <span className={s.op}>&middot;</span>
        <span className={s.cell}>
          <span className={`${s.sym} ${s.varR}`}>R</span>
          <span className={s.val}>{R}</span>
          <span className={s.unit}>const</span>
        </span>
        <span className={s.op}>&middot;</span>
        <span className={s.cell}>
          <span className={`${s.sym} ${s.varT}`}>T</span>
          <span className={s.val}>{temp}</span>
          <span className={s.unit}>K</span>
        </span>
      </div>
      <p className={s.srOnly} role="status" aria-live="polite">
        Pressure {tidy(pressure)} atmospheres, from {tidy(n)} moles at {temp} kelvin in {vol} liters.
      </p>

      <div className={s.grid}>
        {/* Left column: the gas box. */}
        <div className={s.colVisual}>
          <div className={`${v.panel} ${v.panelWide} ${s.panelFill}`}>
            <svg
              viewBox={`0 0 ${BOX_W} ${BOX_H}`}
              className={s.svg}
              role="img"
              aria-label={`Gas container holding ${tidy(n)} moles at ${temp} kelvin in ${vol} liters, pressure ${tidy(pressure)} atmospheres.`}
            >
              <defs>
                <radialGradient id="igl-shade" cx="34%" cy="28%" r="80%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
                  <stop offset="38%" stopColor="#fff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
                </radialGradient>
              </defs>

              {/* swept (empty) region the piston has pushed past */}
              <rect x={gasX1} y="10" width={Math.max(0, gasX0 + WALL_MAX - gasX1)} height={BOX_H - 20} fill="rgba(148,163,184,0.08)" />
              {/* gas region */}
              <rect
                x={gasX0}
                y="10"
                width={gasWidth}
                height={BOX_H - 20}
                rx="8"
                fill="var(--color-bg-elevated)"
                stroke="var(--color-border-strong)"
                strokeWidth="2"
                style={reduce ? undefined : { transition: 'width 0.3s' }}
              />
              {/* piston handle at the right wall */}
              <rect
                x={gasX1 - 3}
                y={BOX_H / 2 - 18}
                width="6"
                height="36"
                rx="2"
                fill="var(--color-border-strong)"
                style={reduce ? undefined : { transition: 'x 0.3s' }}
              />

              {positions.map(([x, y], i) => (
                <g
                  key={i}
                  className={reduce ? undefined : s.particle}
                  style={reduce ? undefined : { animationDuration: `${vibeDur}s`, animationDelay: `${(i % 7) * 0.13}s` }}
                >
                  <circle cx={x} cy={y} r="6" fill={fill} stroke="rgba(0,0,0,0.22)" style={reduce ? undefined : { transition: 'fill 0.3s' }} />
                  <circle cx={x} cy={y} r="6" fill="url(#igl-shade)" />
                </g>
              ))}
            </svg>
            <div className={v.sceneTitle}>{particleCount} particles in a {vol} L box</div>
          </div>
        </div>

        {/* Right column: the three sliders. */}
        <div className={s.colControls}>
          <div className={s.controls}>
            <label className={focus === 'n' ? `${s.control} ${s.controlFocus}` : s.control}>
              <span className={s.controlLabel}>Amount n: <strong>{tidy(n)} mol</strong></span>
              <input
                className={v.slider}
                type="range"
                min={N_MIN}
                max={N_MAX}
                step={0.5}
                value={n}
                onChange={(e) => change({ n: Number(e.target.value) })}
                aria-label="Amount of gas in moles"
              />
            </label>
            <label className={focus === 'temp' ? `${s.control} ${s.controlFocus}` : s.control}>
              <span className={s.controlLabel}>Temperature T: <strong>{temp} K</strong></span>
              <input
                className={v.slider}
                type="range"
                min={T_MIN}
                max={T_MAX}
                step={25}
                value={temp}
                onChange={(e) => change({ temp: Number(e.target.value) })}
                aria-label="Temperature in kelvin"
              />
            </label>
            <label className={focus === 'vol' ? `${s.control} ${s.controlFocus}` : s.control}>
              <span className={s.controlLabel}>Volume V: <strong>{vol} L</strong></span>
              <input
                className={v.slider}
                type="range"
                min={V_MIN}
                max={V_MAX}
                step={1}
                value={vol}
                onChange={(e) => change({ vol: Number(e.target.value) })}
                aria-label="Volume in liters"
              />
            </label>
          </div>
        </div>
      </div>

      {multiStage ? (
        <div className={s.pager} aria-hidden="true">
          {descriptions.map((_, i) => (
            <span key={i} className={i === stage ? `${s.dot} ${s.dotActive}` : s.dot} />
          ))}
        </div>
      ) : (
        <p className={v.muted} style={{ textAlign: 'center', maxWidth: 460 }}>
          More gas (n) or more heat (T) pushes pressure up; a bigger box (V) lets it fall. R never changes -
          it is the fixed number that keeps the units honest.
        </p>
      )}
    </div>
  );
}
