import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';

const MAX = 22;

/**
 * Adjust how much solute dissolves in a fixed volume of water. A stable pool of
 * particle positions stays put; moving the lever fades particles in and out
 * smoothly (no jumping), so dilute -> concentrated reads as a continuous change.
 */
export default function SolutionConcentrationMixer({ onReady }) {
  const [solute, setSolute] = useState(6);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = solute <= 5 ? 'Dilute' : solute <= 14 ? 'Moderate' : 'Concentrated';

  // Fixed scatter of all MAX positions, computed once and centered in the
  // liquid. We reveal the first `solute` of them; the rest fade out.
  const pool = useMemo(() => {
    const pts = [];
    let seed = 7;
    for (let i = 0; i < MAX; i += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const x = 54 + (seed % 192);
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const y = 86 + (seed % 78);
      pts.push([x, y]);
    }
    return pts;
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap} style={{ maxWidth: 340 }}>
        <svg viewBox="0 0 300 200" className={v.svg} role="img" aria-label={`${label} solution with ${solute} solute particles`}>
          <path d="M60 30 v20 l-30 120 a10 10 0 0 0 10 12 h220 a10 10 0 0 0 10 -12 l-30 -120 v-20" fill="rgba(96,165,250,0.12)" stroke="var(--color-border-strong)" strokeWidth="2" />
          <path d="M34 110 h232" stroke="var(--accent-blue)" strokeWidth="2" opacity="0.5" />
          {pool.map(([x, y], i) => {
            const on = i < solute;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="6"
                fill="var(--accent-purple)"
                stroke="rgba(0,0,0,0.22)"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? 'scale(1)' : 'scale(0.3)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transition: 'opacity 0.35s, transform 0.35s',
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{solute}</div>
          <div className={v.statLabel}>solute particles</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-purple)', fontSize: 'var(--text-xl)' }}>{label}</div>
          <div className={v.statLabel}>concentration</div>
        </div>
      </div>

      <input
        className={v.slider}
        type="range"
        min={1}
        max={MAX}
        value={solute}
        onChange={(e) => setSolute(Number(e.target.value))}
        aria-label="Amount of solute"
      />
      <p className={v.muted} style={{ textAlign: 'center' }}>Same volume of water, more solute = more concentrated.</p>
    </div>
  );
}
