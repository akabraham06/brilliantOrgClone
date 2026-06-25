import { useEffect, useState } from 'react';
import ParticleField3D from './lib/ParticleField3D.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

function bandForTemp(t) {
  if (t < 34) return 'Solid';
  if (t < 67) return 'Liquid';
  return 'Gas';
}

// One band per phase. The field is rebuilt (re-randomized) only when the band
// changes, so dragging within a phase stays smooth while crossing a threshold
// visibly switches behaviour. Motion is brownian/random, never synchronized.
const BANDS = {
  Solid: { mode: 'vibrate', count: 34, bounds: [2.0, 1.3, 2.0], color: '#60a5fa', radius: 0.22, speed: 0.28, accent: 'var(--accent-blue)' },
  Liquid: { mode: 'flow', count: 26, bounds: [2.3, 1.45, 2.3], color: '#4ade80', radius: 0.2, speed: 0.72, accent: 'var(--accent-green)' },
  Gas: { mode: 'random', count: 16, bounds: [2.6, 1.7, 2.6], color: '#fb923c', radius: 0.18, speed: 1.15, accent: 'var(--accent-orange)' },
};

const NOTE = {
  Solid: 'Cold: particles barely jiggle, locked in a packed arrangement.',
  Liquid: 'Warmer: particles now have enough energy to slide past each other.',
  Gas: 'Hot: particles break free and bounce around, filling the container.',
};

const STATIC_NOTE = {
  Solid: 'Static frame: a packed, ordered grid of cold particles.',
  Liquid: 'Static frame: loosely packed particles touching but disordered.',
  Gas: 'Static frame: a few particles spread far apart across the box.',
};

/**
 * Temperature slider that drives solid -> liquid -> gas. Adding energy speeds up
 * the random particle motion and, on crossing a threshold, switches the phase.
 * Layout is centered; motion short-circuits under reduced motion.
 */
export default function TemperatureSlider({ onReady }) {
  const [temp, setTemp] = useState(15);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = bandForTemp(temp);
  const cfg = BANDS[state];
  // Speed scales with temperature within the field's brownian motion (gas is
  // hottest / fastest). Kept per-band so the field doesn't re-randomize mid-drag.
  const speed = cfg.speed * (0.85 + (temp / 100) * 0.6);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={`${v.panel} ${v.panelWide}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ParticleField3D
          key={state}
          count={cfg.count}
          mode={cfg.mode}
          bounds={cfg.bounds}
          color={cfg.color}
          radius={cfg.radius}
          speed={speed}
          height={240}
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          label={`${state} at ${temp} degrees. ${NOTE[state]}`}
        />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: cfg.accent }}>{temp}&deg;</div>
          <div className={v.statLabel}>temperature</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)', color: cfg.accent }}>{state}</div>
          <div className={v.statLabel}>state of matter</div>
        </div>
      </div>

      <input
        className={v.slider}
        type="range"
        min={0}
        max={100}
        value={temp}
        onChange={(e) => setTemp(Number(e.target.value))}
        aria-label="Temperature"
      />

      <div className={v.legend}>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-blue)' }} />Solid</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-green)' }} />Liquid</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-orange)' }} />Gas</span>
      </div>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {NOTE[state]}
        {reduce ? ` ${STATIC_NOTE[state]}` : ''}
      </p>
    </div>
  );
}
