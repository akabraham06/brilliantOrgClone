import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './PHPowersOfTen.module.css';

/*
 * "Each pH step is a tenfold change." A clean horizontal pH dial (0-14) with a
 * neutral reference at pH 7. Sliding the dial lays out one x10 jump chip per
 * whole step between the chosen pH and neutral, making the powers of ten literal
 * and countable - no vertical scrolling or layout hacks.
 */

const EXAMPLES = {
  0: 'battery acid', 1: 'stomach acid', 2: 'lemon juice', 3: 'vinegar', 4: 'tomato', 5: 'black coffee',
  6: 'milk', 7: 'pure water', 8: 'seawater', 9: 'baking soda', 10: 'antacid', 11: 'ammonia', 12: 'soapy water', 13: 'bleach', 14: 'drain cleaner',
};

function tenPow(n) {
  return Math.pow(10, n).toLocaleString('en-US');
}

export default function PHPowersOfTen({ onReady }) {
  const [ph, setPh] = useState(3);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = Math.abs(7 - ph);
  const acidic = ph < 7;
  const neutral = ph === 7;
  const fold = tenPow(steps);
  const tone = neutral ? 'var(--accent-green)' : acidic ? 'var(--accent-red)' : 'var(--accent-blue)';

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> move the pH dial and count the <strong>&times;10</strong> jumps back to
        neutral water (pH 7). Each whole step is a tenfold change in acidity.
      </div>

      <div className={`${v.panel} ${v.panelWide}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5) var(--space-5) var(--space-4)' }}>
        {/* horizontal pH dial */}
        <div className={s.dialWrap}>
          <div className={s.dialBar} />
          <div className={s.neutralTick} />
          <div className={s.neutralLabel}>pH 7</div>
          {/* marker maps onto the inset track (16px gutter each side) so it can
              never sit flush against the panel edge at pH 0 or 14. */}
          <div className={s.marker} style={{ left: `calc(16px + (100% - 32px) * ${ph / 14})` }}>
            <span className={s.markerLabel}>pH {ph}</span>
            <span className={s.markerDot} style={{ background: tone }} />
          </div>
        </div>
        <input className={v.slider} style={{ width: '100%', maxWidth: 420 }} type="range" min={0} max={14} step={1} value={ph} onChange={(e) => setPh(Number(e.target.value))} aria-label="pH value" />

        {/* horizontal row of tenfold jumps */}
        <div className={s.jumps} role="status" aria-live="polite">
          {neutral ? (
            <div className={s.neutralNote}>pH 7 is neutral - the reference point, zero jumps away.</div>
          ) : (
            <>
              <span className={s.jumpArrow}>pH {ph}</span>
              {Array.from({ length: steps }).map((_, i) => (
                <span key={i} className={s.jumpChip} style={{ borderColor: tone }}>&times;10</span>
              ))}
              <span className={s.jumpArrow}>&rarr; pH 7</span>
            </>
          )}
        </div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: tone }}>
            {neutral ? '1\u00D7' : `${fold}\u00D7`}
          </div>
          <div className={v.statLabel}>{neutral ? 'same as neutral' : acidic ? 'more acidic than water' : 'more basic than water'}</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>
            1&times;10<sup>{-ph}</sup>
          </div>
          <div className={v.statLabel}>[H&#8314;] in mol/L</div>
        </div>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        pH {ph} is about like <strong>{EXAMPLES[ph]}</strong>. {neutral
          ? 'Equal H\u207A and OH\u207B - perfectly balanced.'
          : `That is ${steps} step${steps > 1 ? 's' : ''} from neutral, so 10^${steps} = ${fold}\u00D7 ${acidic ? 'more acidic' : 'more basic'} than water.`}
      </p>
    </div>
  );
}
