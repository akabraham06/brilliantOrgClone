import { useEffect, useState } from 'react';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';

/*
 * The LEGO analogy for conservation of mass, made interactive. The exact same
 * eight bricks build a castle; click "Rebuild" and they slide into a ship.
 * No brick is added or removed - they are only rearranged, just like atoms in a
 * chemical reaction.
 */

const COLORS = [
  'var(--accent-red)',
  'var(--accent-blue)',
  'var(--accent-green)',
  'var(--accent-yellow)',
  'var(--accent-orange)',
  'var(--accent-purple)',
  'var(--accent-blue)',
  'var(--accent-green)',
];

// castle: two towers + a connecting wall. ship: stacked hull + a mast block.
const CASTLE = [
  [30, 96], [30, 74], [30, 52],
  [150, 96], [150, 74], [150, 52],
  [90, 96], [90, 74],
];
const SHIP = [
  [60, 104], [94, 104], [128, 104], [162, 104],
  [77, 84], [111, 84], [145, 84],
  [111, 56],
];

const BW = 34;
const BH = 18;
const lerp = (a, b, t) => a + (b - a) * t;

export default function RearrangeBlocksScene({ onReady }) {
  const [ship, setShip] = useState(false);
  const t = useSpring(ship ? 1 : 0, { stiffness: 0.13 });

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> rebuild the same bricks into something new. Count them before and
        after - the total never changes, exactly like atoms in a reaction.
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 320 }}>
        <svg viewBox="0 0 220 150" className={v.svg} role="img" aria-label={ship ? 'A ship built from eight bricks' : 'A castle built from eight bricks'}>
          {/* ground line */}
          <line x1="8" y1="128" x2="212" y2="128" stroke="var(--color-border-strong)" strokeWidth="2" strokeDasharray="4 5" />
          {CASTLE.map((from, i) => {
            const to = SHIP[i];
            const x = lerp(from[0], to[0], t);
            const y = lerp(from[1], to[1], t);
            return (
              <g key={i}>
                <rect x={x} y={y} width={BW} height={BH} rx="4" fill={COLORS[i]} stroke="rgba(0,0,0,0.28)" />
                <circle cx={x + 10} cy={y + BH / 2} r="2.4" fill="rgba(255,255,255,0.55)" />
                <circle cx={x + 24} cy={y + BH / 2} r="2.4" fill="rgba(255,255,255,0.55)" />
              </g>
            );
          })}
        </svg>
      </div>

      <p className={v.muted} style={{ textAlign: 'center' }}>
        {ship ? 'A ship - same eight bricks, brand-new build.' : 'A castle made of eight bricks.'}
      </p>

      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setShip((p) => !p)}>
          {ship ? 'Rebuild the castle' : 'Rebuild into a ship'}
        </button>
      </div>

      <div className={v.readout}>
        <div className={v.stat}><div className={v.statValue}>8</div><div className={v.statLabel}>bricks before</div></div>
        <div className={v.stat}><div className={v.statValue}>8</div><div className={v.statLabel}>bricks after</div></div>
        <div className={v.stat}><div className={v.statValue} style={{ color: 'var(--accent-green)' }}>0</div><div className={v.statLabel}>created or lost</div></div>
      </div>
    </div>
  );
}
