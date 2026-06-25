import { useEffect, useState } from 'react';
import ParticleField3D from './lib/ParticleField3D.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

const ORDER = ['Solid', 'Liquid', 'Gas'];

/*
 * Each state is the SAME matter at different energy. We change how the shared
 * 3D particle field behaves (and how tightly it is bounded) so the three states
 * read as locked / sliding / free:
 *  - Solid  : tightly packed lattice, particles only vibrate in place.
 *  - Liquid : loosely packed, particles drift and slide past one another.
 *  - Gas    : sparse, fast, bouncing off every wall and filling the box.
 * Containment is guaranteed by ParticleField3D, which clamps every particle to
 * the wireframe box bounds.
 */
const STATES = {
  Solid: {
    mode: 'vibrate',
    count: 36,
    bounds: [2.0, 1.3, 2.0],
    color: '#60a5fa',
    radius: 0.22,
    speed: 0.25,
    note: 'Particles are locked in a fixed pattern - they can only vibrate in place. Fixed shape, fixed volume.',
    accent: 'var(--accent-blue)',
  },
  Liquid: {
    mode: 'flow',
    count: 28,
    bounds: [2.3, 1.45, 2.3],
    color: '#4ade80',
    radius: 0.2,
    speed: 0.7,
    note: 'Particles stay close but slide and tumble past each other - a liquid keeps its volume but flows to fit its container.',
    accent: 'var(--accent-green)',
  },
  Gas: {
    mode: 'random',
    count: 16,
    bounds: [2.6, 1.7, 2.6],
    color: '#fb923c',
    radius: 0.18,
    speed: 1.1,
    note: 'Particles break free and zoom in every direction, bouncing off the walls to fill the whole container.',
    accent: 'var(--accent-orange)',
  },
};

const STATIC_NOTE = {
  Solid: 'Static view: a tightly packed, ordered grid of particles.',
  Liquid: 'Static view: particles loosely packed and touching, ready to flow.',
  Gas: 'Static view: a few particles spread far apart across the container.',
};

/**
 * Solid / liquid / gas explorer driven by a shared, fully-contained 3D particle
 * field. Toggling the state changes packing, speed and motion mode so the same
 * matter visibly transitions between locked, sliding and free behaviour.
 */
export default function StateParticlesAnimator({ onReady }) {
  const [idx, setIdx] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = ORDER[idx];
  const cfg = STATES[state];

  const heat = () => setIdx((i) => Math.min(ORDER.length - 1, i + 1));
  const freeze = () => setIdx((i) => Math.max(0, i - 1));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={`${v.panel} ${v.panelWide}`}>
        <ParticleField3D
          key={state}
          count={cfg.count}
          mode={cfg.mode}
          bounds={cfg.bounds}
          color={cfg.color}
          radius={cfg.radius}
          speed={cfg.speed}
          height={250}
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          label={`${state}: ${cfg.note}`}
        />
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>
          {state} &mdash; particles in a container
        </div>
      </div>

      <div className={v.toggleGroup} role="group" aria-label="State of matter">
        {ORDER.map((s, i) => (
          <button
            key={s}
            type="button"
            className={i === idx ? `${v.toggle} ${v.toggleActive}` : v.toggle}
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
          >
            {s}
          </button>
        ))}
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={freeze} disabled={idx === 0}>
          &#10052;&#65039; Cool
        </button>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={heat} disabled={idx === ORDER.length - 1}>
          Heat &#128293;
        </button>
      </div>

      <div className={v.legend}>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-blue)' }} />Solid</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-green)' }} />Liquid</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: 'var(--accent-orange)' }} />Gas</span>
      </div>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {cfg.note}
        {reduce ? ` ${STATIC_NOTE[state]}` : ''}
      </p>
    </div>
  );
}
