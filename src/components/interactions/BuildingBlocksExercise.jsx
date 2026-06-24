import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';
import b from './BuildingBlocksExercise.module.css';

const COLORS = {
  red: 'var(--accent-pink)',
  blue: 'var(--accent-blue)',
  yellow: 'var(--accent-yellow)',
};
const ORDER = ['red', 'blue', 'yellow'];
const NAMES = { red: 'red', blue: 'blue', yellow: 'yellow' };

// The SAME three brick types build every creation - just in different amounts.
const TARGETS = [
  {
    name: 'a tower',
    slots: [
      { c: 'blue', x: 50, y: 86 }, { c: 'blue', x: 84, y: 86 },
      { c: 'red', x: 50, y: 68 }, { c: 'red', x: 84, y: 68 },
      { c: 'yellow', x: 67, y: 50 },
    ],
  },
  {
    name: 'a rocket',
    slots: [
      { c: 'red', x: 67, y: 46 },
      { c: 'yellow', x: 67, y: 64 }, { c: 'yellow', x: 67, y: 82 },
      { c: 'blue', x: 47, y: 82 }, { c: 'blue', x: 87, y: 82 },
    ],
  },
  {
    name: 'a robot',
    slots: [
      { c: 'yellow', x: 67, y: 48 },
      { c: 'red', x: 50, y: 66 }, { c: 'red', x: 84, y: 66 },
      { c: 'blue', x: 50, y: 84 }, { c: 'blue', x: 84, y: 84 },
    ],
  },
];

function Brick({ x, y, color, ghost, animate }) {
  const fill = ghost ? 'none' : color;
  const stroke = ghost ? 'var(--color-border-strong)' : 'rgba(0,0,0,0.3)';
  return (
    <g className={!ghost && animate ? b.snap : ''} style={{ transformOrigin: `${x}px ${y}px` }}>
      <rect x={x - 15} y={y - 8} width="30" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={ghost ? '4 4' : '0'} />
      <circle cx={x - 7} cy={y - 11} r="3.2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <circle cx={x + 7} cy={y - 11} r="3.2" fill={fill} stroke={stroke} strokeWidth="1.5" />
    </g>
  );
}

/**
 * "Just a few kinds of building blocks" - an interactive LEGO analogy. The
 * learner has only three brick types but builds several different creations
 * from them, mirroring how ~100 kinds of atoms build everything around us.
 */
export default function BuildingBlocksExercise({ onReady }) {
  const [idx, setIdx] = useState(0);
  const [counts, setCounts] = useState({ red: 0, blue: 0, yellow: 0 });

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = TARGETS[idx];

  const recipe = useMemo(() => {
    const r = { red: 0, blue: 0, yellow: 0 };
    target.slots.forEach((s) => { r[s.c] += 1; });
    return r;
  }, [target]);

  const built = ORDER.every((c) => counts[c] === recipe[c]);

  function add(color) {
    if (built) return;
    setCounts((prev) => (prev[color] >= recipe[color] ? prev : { ...prev, [color]: prev[color] + 1 }));
  }

  function removeColor(color) {
    setCounts((prev) => (prev[color] <= 0 ? prev : { ...prev, [color]: prev[color] - 1 }));
  }

  function nextCreation() {
    setIdx((i) => (i + 1) % TARGETS.length);
    setCounts({ red: 0, blue: 0, yellow: 0 });
  }

  // For each slot, the first `counts[color]` slots of that color are filled.
  const filledIndexByColor = { red: 0, blue: 0, yellow: 0 };

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>Build {target.name}</div>
          <div className={v.statLabel}>creation {idx + 1} of {TARGETS.length}</div>
        </div>
      </div>

      <div className={b.board}>
        <svg viewBox="0 0 134 110" className={b.svg} aria-label={`Target: ${target.name}`}>
          {target.slots.map((slot, i) => {
            const seen = filledIndexByColor[slot.c];
            filledIndexByColor[slot.c] += 1;
            const isFilled = seen < counts[slot.c];
            return (
              <Brick key={i} x={slot.x} y={slot.y} color={COLORS[slot.c]} ghost={!isFilled} animate={isFilled} />
            );
          })}
        </svg>
      </div>

      <div className={b.palette} role="group" aria-label="Brick bin">
        {ORDER.map((color) => (
          <div key={color} className={b.paletteItem}>
            <button
              type="button"
              className={b.brickBtn}
              onClick={() => add(color)}
              disabled={built || counts[color] >= recipe[color]}
              aria-label={`Add a ${NAMES[color]} brick`}
            >
              <svg viewBox="0 0 44 30" aria-hidden="true">
                <rect x="6" y="10" width="32" height="16" rx="3" fill={COLORS[color]} stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                <circle cx="15" cy="7" r="3.4" fill={COLORS[color]} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                <circle cx="29" cy="7" r="3.4" fill={COLORS[color]} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
              </svg>
            </button>
            <div className={b.counter}>
              <button type="button" className={b.countBtn} onClick={() => removeColor(color)} disabled={counts[color] <= 0} aria-label={`Remove a ${NAMES[color]} brick`}>
                &minus;
              </button>
              <span className={b.countVal}>{counts[color]}/{recipe[color]}</span>
            </div>
          </div>
        ))}
      </div>

      {built ? (
        <div className={v.feedbackOk}>
          <p style={{ fontWeight: 700 }}>Built {target.name}!</p>
          <p>Same three brick types - a brand-new creation. Atoms work exactly like this.</p>
          <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={nextCreation} style={{ marginTop: 8 }}>
            Build something else
          </button>
        </div>
      ) : (
        <p className={v.muted} style={{ textAlign: 'center' }}>
          Tap bricks to match the build. Just a few brick types make endless things - exactly how ~100 kinds of atoms build everything.
        </p>
      )}
    </div>
  );
}
