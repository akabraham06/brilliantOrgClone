import { useEffect, useState } from 'react';
import ParticleField3D from './lib/ParticleField3D.jsx';
import { usePrefersReducedMotion, useSpring } from './lib/motion.js';
import v from './viz.module.css';

/*
 * Why does temperature "stick" while ice melts or water boils? Because the added
 * heat goes into pulling particles apart (breaking bonds), not into making them
 * move faster. Click "Add heat" to walk up the heating curve: the thermometer
 * climbs through the solid/liquid/gas segments but PAUSES on the melting and
 * boiling plateaus while the particles visibly loosen and break free.
 */

// Schematic temperature axis runs -20 C to 130 C.
const T_MIN = -20;
const T_MAX = 130;

function phaseFor(energy) {
  if (energy < 18) return { name: 'Solid', plateau: false, temp: lerp(T_MIN, 0, energy / 18) };
  if (energy < 38) return { name: 'Melting', plateau: true, temp: 0 };
  if (energy < 58) return { name: 'Liquid', plateau: false, temp: lerp(0, 100, (energy - 38) / 20) };
  if (energy < 82) return { name: 'Boiling', plateau: true, temp: 100 };
  return { name: 'Gas', plateau: false, temp: lerp(100, T_MAX, (energy - 82) / 18) };
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

const FIELD = {
  Solid: { mode: 'vibrate', count: 32, bounds: [2.0, 1.3, 2.0], color: '#60a5fa', radius: 0.21, speed: 0.26 },
  Melting: { mode: 'flow', count: 28, bounds: [2.2, 1.4, 2.2], color: '#38bdf8', radius: 0.2, speed: 0.5 },
  Liquid: { mode: 'flow', count: 26, bounds: [2.3, 1.45, 2.3], color: '#4ade80', radius: 0.2, speed: 0.72 },
  Boiling: { mode: 'random', count: 20, bounds: [2.5, 1.6, 2.5], color: '#fb923c', radius: 0.18, speed: 1.0 },
  Gas: { mode: 'random', count: 14, bounds: [2.6, 1.7, 2.6], color: '#f87171', radius: 0.17, speed: 1.2 },
};

const NOTE = {
  Solid: 'Heat is raising the temperature - the packed particles vibrate faster.',
  Melting: 'Plateau! The temperature holds steady - all the heat is breaking bonds so particles can start sliding.',
  Liquid: 'Heat is raising the temperature again - the liquid warms up.',
  Boiling: 'Plateau! Temperature holds while heat tears particles free into a gas.',
  Gas: 'All separated - now added heat speeds the free particles and the temperature climbs.',
};

export default function PhaseEnergyScene({ onReady }) {
  const [energy, setEnergy] = useState(0);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = phaseFor(energy);
  const cfg = FIELD[phase.name];
  const shownTemp = useSpring(phase.temp, { stiffness: 0.16, threshold: 0.2 });
  const fillPct = ((shownTemp - T_MIN) / (T_MAX - T_MIN)) * 100;

  const addHeat = () => setEnergy((e) => Math.min(100, e + 9));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> add heat and watch the thermometer. During melting and boiling it pauses -
        the energy is separating particles, not raising the temperature.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <div className={v.row} style={{ flexWrap: 'nowrap', alignItems: 'stretch', gap: 'var(--space-3)' }}>
          {/* thermometer */}
          <svg viewBox="0 0 44 200" width="40" height="200" role="img" aria-label={`Thermometer reading ${Math.round(shownTemp)} degrees Celsius`}>
            <rect x="16" y="8" width="12" height="150" rx="6" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" />
            <rect
              x="16"
              y={8 + 150 * (1 - Math.max(0, Math.min(1, fillPct / 100)))}
              width="12"
              height={150 * Math.max(0, Math.min(1, fillPct / 100))}
              rx="6"
              fill={cfg.color}
              style={{ transition: 'fill 0.4s' }}
            />
            <circle cx="22" cy="170" r="16" fill={cfg.color} stroke="var(--color-border-strong)" className={v.sceneShadow} style={{ transition: 'fill 0.4s' }} />
          </svg>

          <div style={{ flex: 1, minWidth: 0 }}>
            <ParticleField3D
              key={phase.name}
              count={cfg.count}
              mode={cfg.mode}
              bounds={cfg.bounds}
              color={cfg.color}
              radius={cfg.radius}
              speed={cfg.speed}
              height={210}
              camera={{ position: [0, 0, 8.5], fov: 45 }}
              label={`${phase.name}. ${NOTE[phase.name]}`}
            />
          </div>
        </div>
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>{phase.name}</div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)', color: cfg.color }} role="status" aria-live="polite">{Math.round(shownTemp)}&deg;C</div>
          <div className={v.statLabel}>temperature</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)' }}>{energy}%</div>
          <div className={v.statLabel}>heat added</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={addHeat} disabled={energy >= 100}>Add heat &#128293;</button>
        <button type="button" className={v.btn} onClick={() => setEnergy(0)} disabled={energy === 0}>Reset</button>
      </div>

      <p
        className={phase.plateau ? v.feedbackOk : v.muted}
        role="status"
        aria-live="polite"
        style={{ textAlign: 'center', maxWidth: 460 }}
      >
        {NOTE[phase.name]}
        {reduce && !phase.plateau ? ' (Motion reduced: the particle view updates without animation.)' : ''}
      </p>
    </div>
  );
}
