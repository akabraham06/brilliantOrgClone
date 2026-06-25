import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { ELEMENTS } from './elements.js';
import { VizChart } from './lib/VizChart.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Real x-y graph of a periodic property vs atomic number for elements 1-20.
 * Toggle between atomic radius, mass, and electronegativity and the sawtooth
 * pattern (resets each new period) makes periodic trends visible. Hover or tap
 * any point to read that element. Built on visx (scaleLinear + LinePath) via the
 * shared VizChart frame; points have large invisible hit targets for touch, the
 * background is banded by period, and switching property re-traces the line.
 */

// Approximate covalent radii (pm) and Pauling electronegativity (null = noble).
const RADIUS = { H: 31, He: 28, Li: 128, Be: 96, B: 84, C: 76, N: 71, O: 66, F: 57, Ne: 58, Na: 166, Mg: 141, Al: 121, Si: 111, P: 107, S: 105, Cl: 102, Ar: 106, K: 203, Ca: 176 };
const EN = { H: 2.2, He: null, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Ne: null, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.9, P: 2.19, S: 2.58, Cl: 3.16, Ar: null, K: 0.82, Ca: 1.0 };

const PROPS = {
  radius: {
    label: 'Atomic radius',
    unit: 'pm',
    color: 'var(--accent-blue)',
    get: (el) => RADIUS[el.symbol],
    domain: [0, 220],
    trend: 'Radius grows down a group and shrinks left-to-right across a period.',
    explain:
      'Why: going down a group adds a whole new electron shell each row, so the atom gets bigger. Going across a period adds protons to the same shell - the stronger pull drags the electrons inward, so the atom actually shrinks. That is the sawtooth: a big jump up at each new row, then a steady fall.',
  },
  mass: {
    label: 'Atomic mass',
    unit: 'u',
    color: 'var(--accent-green)',
    get: (el) => el.mass,
    domain: [0, 45],
    trend: 'Mass climbs steadily with atomic number as protons and neutrons are added.',
    explain:
      'Why: each step to the next element adds a proton (and on average about one neutron) to the nucleus. Since protons and neutrons carry essentially all of an atom\u2019s mass, the line just rises almost straight - no reset at each period.',
  },
  electronegativity: {
    label: 'Electronegativity',
    unit: '',
    color: 'var(--accent-pink)',
    get: (el) => EN[el.symbol],
    domain: [0, 4.2],
    trend: 'Electronegativity rises across a period and falls down a group (noble gases omitted).',
    explain:
      'Why: electronegativity is how hard an atom pulls on shared electrons. Across a period the nucleus gains charge while the atom stays small, so the pull strengthens (peaking at fluorine). Down a group the outer electrons sit farther out and are shielded by inner shells, so the pull weakens. Noble gases rarely bond, so they are left off.',
  },
};

const CAT_COLOR = { metal: 'var(--accent-orange)', nonmetal: 'var(--accent-blue)', metalloid: 'var(--accent-purple)' };

// Period boundaries (atomic-number ranges) for the 1-20 window, used to shade
// alternating background bands so "the trend resets each new period" is visible.
const PERIODS = [
  { n: 1, lo: 1, hi: 2 },
  { n: 2, lo: 3, hi: 10 },
  { n: 3, lo: 11, hi: 18 },
  { n: 4, lo: 19, hi: 20 },
];

const W = 360;
const H = 220;
const PAD = { l: 42, r: 14, t: 14, b: 38 };

/** A small theme-aware SVG tooltip anchored above a data point. */
function PointTip({ cx, cy, lines, accent }) {
  const charW = 6.4;
  const boxW = Math.max(...lines.map((l) => l.length)) * charW + 16;
  const boxH = lines.length * 13 + 10;
  let bx = cx - boxW / 2;
  bx = Math.max(PAD.l + 2, Math.min(W - PAD.r - boxW - 2, bx));
  let by = cy - boxH - 12;
  if (by < PAD.t) by = cy + 14;
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

export default function PeriodicTrendsGraph({ onReady, savedState, onSaveState }) {
  const [prop, setProp] = useState(savedState?.prop ?? 'radius');
  const [selected, setSelected] = useState(savedState?.selected ?? 'O');
  const [hovered, setHovered] = useState(null);
  const reduce = usePrefersReducedMotion();
  const [prog, setProg] = useState(reduce ? 1 : 0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-trace the line whenever the property changes (snap when reduced motion).
  useEffect(() => {
    if (reduce) {
      setProg(1);
      return undefined;
    }
    setProg(0);
    let raf;
    const start = window.performance.now();
    const dur = 750;
    const loop = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setProg(p);
      if (p < 1) raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [prop, reduce]);

  function chooseProp(key) {
    setProp(key);
    setHovered(null);
    onSaveState?.({ prop: key, selected });
  }
  function chooseElement(symbol) {
    setSelected(symbol);
    onSaveState?.({ prop, selected: symbol });
  }

  const cfg = PROPS[prop];
  const data = ELEMENTS.map((el) => ({ el, val: cfg.get(el) })).filter((d) => d.val != null);
  const points = data.map((d) => [d.el.number, d.val]);
  const sel = ELEMENTS.find((e) => e.symbol === selected);
  const selVal = cfg.get(sel);
  const tipSymbol = hovered || selected;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a property">
        {Object.entries(PROPS).map(([key, p]) => (
          <button key={key} type="button" className={prop === key ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseProp(key)}>{p.label}</button>
        ))}
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 380 }}>
        <VizChart
          width={W}
          height={H}
          padding={PAD}
          xDomain={[1, 20]}
          yDomain={cfg.domain}
          xTicks={[1, 5, 10, 15, 20]}
          xLabel={'atomic number \u2192'}
          yLabel={cfg.unit ? `${cfg.label} (${cfg.unit})` : cfg.label}
          ariaLabel={`${cfg.label} versus atomic number for elements 1 to 20. ${cfg.trend}`}
        >
          {(x, y) => {
            const x0 = x(1);
            const x1 = x(20);
            const yTop = y(cfg.domain[1]);
            const yBot = y(cfg.domain[0]);
            return (
              <>
                {/* period bands: alternate shading + label so resets are visible */}
                {PERIODS.map((p, i) => {
                  const left = Math.max(x0, x(p.lo - 0.5));
                  const right = Math.min(x1, x(p.hi + 0.5));
                  return (
                    <g key={p.n}>
                      <rect x={left} y={yTop} width={Math.max(0, right - left)} height={yBot - yTop} fill={i % 2 === 0 ? 'var(--accent-purple)' : 'transparent'} opacity={i % 2 === 0 ? 0.06 : 0} />
                      <text x={(left + right) / 2} y={yTop + 11} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--color-text-subtle)" pointerEvents="none">P{p.n}</text>
                    </g>
                  );
                })}

                {/* the trend line, drawn in (pathLength normalized so dash = progress) */}
                <LinePath
                  data={points}
                  x={(d) => x(d[0])}
                  y={(d) => y(d[1])}
                  curve={curveMonotoneX}
                  stroke={cfg.color}
                  strokeWidth={2.5}
                  strokeOpacity={0.55}
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - prog}
                />

                {data.map((d, i) => {
                  const isSel = d.el.symbol === selected;
                  const isHover = d.el.symbol === hovered;
                  const appear = prog >= i / Math.max(1, data.length - 1) - 0.001;
                  const r = isSel ? 7.5 : isHover ? 6.5 : 5;
                  return (
                    <g
                      key={d.el.symbol}
                      style={{ cursor: 'pointer', opacity: appear ? 1 : 0, transition: reduce ? 'none' : 'opacity 0.18s' }}
                      onClick={() => chooseElement(d.el.symbol)}
                      onPointerEnter={() => setHovered(d.el.symbol)}
                      onPointerLeave={() => setHovered((h) => (h === d.el.symbol ? null : h))}
                    >
                      {/* large invisible hit target for touch / pointer */}
                      <circle cx={x(d.el.number)} cy={y(d.val)} r={14} fill="transparent" />
                      <circle cx={x(d.el.number)} cy={y(d.val)} r={r} fill={CAT_COLOR[d.el.category]} stroke={isSel ? 'var(--color-text)' : 'rgba(0,0,0,0.25)'} strokeWidth={isSel ? 2 : 1} />
                    </g>
                  );
                })}

                {/* tooltip for the hovered (or selected) element */}
                {(() => {
                  const d = data.find((p) => p.el.symbol === tipSymbol);
                  if (!d) return null;
                  return (
                    <PointTip
                      cx={x(d.el.number)}
                      cy={y(d.val)}
                      accent={cfg.color}
                      lines={[`${d.el.symbol} - ${d.el.name}`, `${cfg.label}: ${d.val}${cfg.unit ? ` ${cfg.unit}` : ''}`]}
                    />
                  );
                })()}
              </>
            );
          }}
        </VizChart>
      </div>

      <div className={v.readout}>
        <div className={v.stat}><div className={v.statValue}>{sel.symbol}</div><div className={v.statLabel}>{sel.name}</div></div>
        <div className={v.stat}><div className={v.statValue} style={{ color: cfg.color }}>{selVal != null ? `${selVal}${cfg.unit ? ` ${cfg.unit}` : ''}` : 'n/a'}</div><div className={v.statLabel}>{cfg.label}</div></div>
      </div>
      <div className={v.objective} style={{ maxWidth: 460 }}>
        <strong style={{ color: cfg.color }}>{cfg.label}:</strong> {cfg.trend}
        <p style={{ margin: '6px 0 0' }}>{cfg.explain}</p>
      </div>
      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 420 }}>Switch the property above to compare each trend. Hover or tap a point to read its element.</p>
    </div>
  );
}
