import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './BondStabilityScene.module.css';

const CX = 110;
const CY = 100;
const R = 70;

/**
 * Why atoms bond: toggle between an incomplete (reactive) and a complete
 * (stable) outer shell. The two extra electrons scale in smoothly and every
 * dot crossfades its colour, so the transition between states is seamless.
 */
export default function BondStabilityScene({ onReady }) {
  const [stable, setStable] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outer = stable ? 8 : 6;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap} style={{ maxWidth: 240 }}>
        <svg viewBox="0 0 220 200" className={v.svg} role="img" aria-label={stable ? 'Complete outer shell' : 'Incomplete outer shell'}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          {Array.from({ length: 8 }).map((_, j) => {
            const angle = (j / 8) * Math.PI * 2 - Math.PI / 2;
            const x = CX + R * Math.cos(angle);
            const y = CY + R * Math.sin(angle);
            const visible = j < outer;
            return (
              <circle
                key={j}
                className={s.dot}
                cx={x}
                cy={y}
                r="6"
                style={{
                  fill: stable ? 'var(--accent-green)' : 'var(--accent-orange)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0)',
                  transformOrigin: `${x}px ${y}px`,
                }}
              />
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r="22"
            className={s.core}
            style={{
              fill: stable ? 'rgba(74,222,128,0.18)' : 'rgba(251,146,60,0.18)',
              stroke: stable ? 'var(--accent-green)' : 'var(--accent-orange)',
            }}
          />
        </svg>
      </div>

      <div className={v.toggleGroup} role="group" aria-label="Shell completeness">
        <button type="button" className={!stable ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setStable(false)}>Incomplete</button>
        <button type="button" className={stable ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setStable(true)}>Complete</button>
      </div>

      <p className={stable ? v.feedbackOk : v.muted}>
        {stable
          ? 'A full outer shell (8 electrons) is stable - the atom is content and unreactive.'
          : 'An incomplete outer shell is reactive - the atom will bond to fill it.'}
      </p>
    </div>
  );
}
