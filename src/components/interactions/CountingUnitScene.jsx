import { useEffect, useState } from 'react';
import v from './viz.module.css';

/*
 * Why chemists need a counting unit, made hands-on. Tap eggs into a carton to
 * build a "dozen" (12), then scale the very same idea up to a "mole"
 * (6.022 x 10^23). One bundle for the kitchen, one bundle for atoms.
 */

const COLS = 6;
const ROWS = 2;
const TOTAL = COLS * ROWS;

function Egg({ x, y, filled, onClick }) {
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* slot */}
      <ellipse cx={x} cy={y} rx="13" ry="11" fill="rgba(0,0,0,0.10)" />
      {filled ? (
        <g className={v.popIn}>
          <ellipse cx={x} cy={y - 2} rx="10.5" ry="13.5" fill="#f6e7c8" stroke="rgba(0,0,0,0.25)" />
          <ellipse cx={x - 3} cy={y - 6} rx="3.5" ry="5" fill="#fff" opacity="0.6" />
        </g>
      ) : (
        <ellipse cx={x} cy={y - 2} rx="10.5" ry="13.5" fill="none" stroke="var(--color-border-strong)" strokeDasharray="3 3" />
      )}
    </g>
  );
}

export default function CountingUnitScene({ onReady }) {
  const [eggs, setEggs] = useState(() => Array(TOTAL).fill(false));
  const [mole, setMole] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = eggs.filter(Boolean).length;
  const full = count === TOTAL;

  const toggle = (i) =>
    setEggs((prev) => prev.map((e, idx) => (idx === i ? !e : e)));

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> tap eggs to fill the carton. Twelve makes one <em>dozen</em> - the same
        idea scales up to a <em>mole</em> for counting atoms.
      </div>

      {!mole ? (
        <>
          <div className={v.svgWrap} style={{ maxWidth: 300 }}>
            <svg viewBox="0 0 260 150" className={v.svg} role="img" aria-label={`Egg carton with ${count} of 12 eggs`}>
              <rect x="10" y="40" width="240" height="96" rx="16" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
              {eggs.map((filled, i) => {
                const c = i % COLS;
                const r = Math.floor(i / COLS);
                const x = 36 + c * 38;
                const y = 70 + r * 40;
                return <Egg key={i} x={x} y={y} filled={filled} onClick={() => toggle(i)} />;
              })}
            </svg>
          </div>

          <div className={v.readout}>
            <div className={v.stat}><div className={v.statValue} style={{ color: full ? 'var(--accent-green)' : 'var(--color-text)' }}>{count} / 12</div><div className={v.statLabel}>eggs</div></div>
            <div className={v.stat}><div className={v.statValue}>{full ? '1' : '0'}</div><div className={v.statLabel}>dozens</div></div>
          </div>

          <p className={v.muted} style={{ textAlign: 'center' }}>
            {full ? 'A full carton = 1 dozen = 12 eggs. One word for a fixed count.' : 'Keep tapping - a dozen is exactly 12.'}
          </p>

          <div className={v.row}>
            <button type="button" className={v.btn} onClick={() => setEggs(Array(TOTAL).fill(true))}>Fill a dozen</button>
            <button type="button" className={v.btn} onClick={() => setEggs(Array(TOTAL).fill(false))}>Empty</button>
            {full && (
              <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setMole(true)}>Now scale to a mole &rarr;</button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={v.readout}>
            <div className={v.stat}><div className={v.statValue}>1 dozen</div><div className={v.statLabel}>= 12</div></div>
            <div className={v.stat}><div className={v.statValue} style={{ color: 'var(--accent-green)' }}>1 mole</div><div className={v.statLabel}>= 6.022 &times; 10&sup2;&sup3;</div></div>
          </div>
          <p className={v.muted} style={{ maxWidth: 420, textAlign: 'center' }}>
            A mole is just a much bigger bundle. A dozen eggs fits in your hand; a mole of eggs would
            bury the entire Earth. Atoms are so tiny that this enormous count is exactly what chemists need.
          </p>
          <div className={v.row}>
            <button type="button" className={v.btn} onClick={() => setMole(false)}>&larr; Back to the carton</button>
          </div>
        </>
      )}
    </div>
  );
}
