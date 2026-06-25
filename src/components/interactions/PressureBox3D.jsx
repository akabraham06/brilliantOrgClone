import { useEffect, useState } from 'react';
import ParticleField3D from './lib/ParticleField3D.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/**
 * Pressure as wall taps. More particles, or faster (hotter) particles, means
 * more collisions with the container walls each second - and that is exactly
 * what pressure measures. Learners add particles and add heat and watch the
 * pressure reading climb. Reduced motion shows a static box plus the readout.
 */
const MIN_N = 8;
const MAX_N = 60;

export default function PressureBox3D({ onReady }) {
  const [count, setCount] = useState(18);
  const [heat, setHeat] = useState(1); // 1..4 speed multiplier
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speed = 0.55 * heat;
  // Wall taps per second scale with particle count and their speed.
  const taps = Math.round(count * heat * 1.8);
  // Relative pressure gauge.
  const pPct = Math.max(4, Math.min(100, (count / MAX_N) * 55 + (heat - 1) * 15));
  const pLabel = pPct > 70 ? 'High' : pPct > 40 ? 'Medium' : 'Low';
  const pColor = pPct > 70 ? 'var(--accent-red)' : pPct > 40 ? 'var(--accent-orange)' : 'var(--accent-green)';

  const addParticles = () => setCount((c) => Math.min(MAX_N, c + 8));
  const removeParticles = () => setCount((c) => Math.max(MIN_N, c - 8));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> pressure is just particles tapping the walls. Add particles or add heat
        and watch the wall taps - and the pressure - go up.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <ParticleField3D
          key={`${count}-${heat}`}
          count={count}
          mode="random"
          bounds={[2.5, 1.7, 2.5]}
          color={heat >= 3 ? '#fb923c' : '#60a5fa'}
          radius={0.16}
          speed={speed}
          height={250}
          showBox
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          label={`${count} gas particles bouncing in a box at heat level ${heat}. About ${taps} wall taps per second, pressure ${pLabel}.`}
        />
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>Every wall tap adds to the pressure</div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)' }}>{count}</div>
          <div className={v.statLabel}>particles</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)' }}>{taps}/s</div>
          <div className={v.statLabel}>wall taps</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-xl)', color: pColor }} role="status" aria-live="polite">{pLabel}</div>
          <div className={v.statLabel}>pressure</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ height: 16, borderRadius: 'var(--radius-pill)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <div style={{ width: `${pPct}%`, height: '100%', background: pColor, transition: 'width 0.3s, background 0.3s' }} />
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={removeParticles} disabled={count <= MIN_N}>&minus; Particles</button>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={addParticles} disabled={count >= MAX_N}>+ Particles</button>
        <button type="button" className={v.btn} onClick={() => setHeat((h) => (h >= 4 ? 1 : h + 1))}>
          Heat &#128293; ({heat}&times;)
        </button>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        More particles or faster particles both create more collisions per second, so the pressure rises.
        {reduce ? ' (Motion reduced: the readouts update without animation.)' : ''}
      </p>
    </div>
  );
}
