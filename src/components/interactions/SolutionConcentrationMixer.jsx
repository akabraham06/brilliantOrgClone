import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';

/**
 * Concentration as a ratio of solute to water. "Add solute" drops more purple
 * particles into the beaker (placed at random, non-overlapping spots); "Add
 * water" raises the water level, spreading the same solute through more liquid.
 * The readout slides from dilute to concentrated as that ratio changes.
 */
const MIN_SOLUTE = 1;
const MAX_SOLUTE = 26;
const MIN_WATER = 1;
const MAX_WATER = 5;

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

// Reject samples closer than MIN_DIST so solute particles never overlap.
const MIN_DIST = 18;

function placeParticles(count, region) {
  const rng = mulberry32(count * 31 + region.top);
  const pts = [];
  let tries = 0;
  while (pts.length < count && tries < count * 400) {
    tries += 1;
    const x = region.x0 + rng() * (region.x1 - region.x0);
    const y = region.top + rng() * (region.bottom - region.top);
    if (pts.every(([px, py]) => (px - x) ** 2 + (py - y) ** 2 > MIN_DIST * MIN_DIST)) {
      pts.push([x, y]);
    }
  }
  return pts;
}

export default function SolutionConcentrationMixer({ onReady }) {
  const [solute, setSolute] = useState(6);
  const [water, setWater] = useState(2);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // More water -> higher fill (smaller top y) -> bigger region to spread into.
  const fillFrac = 0.42 + ((water - MIN_WATER) / (MAX_WATER - MIN_WATER)) * 0.5;
  const liquidTop = 178 - fillFrac * 128;
  const region = { x0: 64, x1: 236, top: liquidTop + 8, bottom: 172 };

  // region is derived from `water` (via liquidTop), so [solute, water] fully
  // captures the inputs; the object identity is intentionally not a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const positions = useMemo(() => placeParticles(solute, region), [solute, water]);

  // Concentration ~ solute per unit of water.
  const ratio = solute / (water * 5);
  const label = ratio <= 0.45 ? 'Dilute' : ratio <= 1.0 ? 'Moderate' : 'Concentrated';
  const tone = ratio <= 0.45 ? 'var(--accent-blue)' : ratio <= 1.0 ? 'var(--accent-green)' : 'var(--accent-purple)';

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> add solute to concentrate the solution, or add water to dilute it.
        Concentration is the balance of solute to water.
      </div>

      <div className={v.panel}>
        <div className={v.svgWrap} style={{ maxWidth: '100%' }}>
          <svg viewBox="0 0 300 200" className={v.svg} role="img" aria-label={`${label} solution: ${solute} solute particles in water level ${water} of ${MAX_WATER}.`}>
            <defs>
              <linearGradient id="sc-water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(96,165,250,0.12)" />
                <stop offset="100%" stopColor="rgba(96,165,250,0.3)" />
              </linearGradient>
              <radialGradient id="sc-shade" cx="34%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
                <stop offset="38%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
              </radialGradient>
            </defs>

            {/* beaker walls */}
            <path d="M60 26 v18 l-6 0 v118 a10 10 0 0 0 10 12 h172 a10 10 0 0 0 10 -12 v-118 l-6 0 v-18" fill="none" stroke="var(--color-border-strong)" strokeWidth="2" />
            {/* water fill */}
            <rect
              x="56"
              y={liquidTop}
              width="188"
              height={178 - liquidTop}
              rx="6"
              fill="url(#sc-water)"
              style={{ transition: 'y 0.35s, height 0.35s' }}
            />
            <line x1="56" y1={liquidTop} x2="244" y2={liquidTop} stroke="var(--accent-blue)" strokeWidth="2" opacity="0.5" style={{ transition: 'y1 0.35s, y2 0.35s' }} />

            {positions.map(([x, y], i) => (
              <g key={i} className={v.sceneShadow}>
                <circle cx={x} cy={y} r="6" fill="var(--accent-purple)" stroke="rgba(0,0,0,0.22)" />
                <circle cx={x} cy={y} r="6" fill="url(#sc-shade)" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{solute}</div>
          <div className={v.statLabel}>solute particles</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{water}</div>
          <div className={v.statLabel}>water level</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: tone, fontSize: 'var(--text-xl)' }} role="status" aria-live="polite">{label}</div>
          <div className={v.statLabel}>concentration</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setSolute((s) => Math.min(MAX_SOLUTE, s + 2))} disabled={solute >= MAX_SOLUTE}>+ Solute</button>
        <button type="button" className={v.btn} onClick={() => setSolute((s) => Math.max(MIN_SOLUTE, s - 2))} disabled={solute <= MIN_SOLUTE}>&minus; Solute</button>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setWater((w) => Math.min(MAX_WATER, w + 1))} disabled={water >= MAX_WATER}>+ Water</button>
        <button type="button" className={v.btn} onClick={() => setWater((w) => Math.max(MIN_WATER, w - 1))} disabled={water <= MIN_WATER}>&minus; Water</button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        Same particles, more water = more dilute. Same water, more particles = more concentrated.
      </p>
    </div>
  );
}
