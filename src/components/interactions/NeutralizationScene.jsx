import { useEffect, useMemo, useState } from 'react';
import v from './viz.module.css';

/*
 * Neutralization: add base to an acid and the free H+ ions pair up with OH- to
 * form water (H2O). The pH readout climbs toward 7 as acid is consumed; at the
 * equivalence point the acid is exactly used up. Past it, leftover OH- makes the
 * solution basic. State-driven, so it reads correctly with reduced motion.
 */

const ACID0 = 8; // initial free H+ ions
const MAX_BASE = 16;

const H_COLOR = 'var(--accent-red)';
const OH_COLOR = 'var(--accent-blue)';
const WATER_COLOR = 'var(--accent-green)';

function gridPos(i) {
  const col = i % 6;
  const row = Math.floor(i / 6);
  return [72 + col * 28, 88 + row * 30];
}

export default function NeutralizationScene({ onReady }) {
  const [base, setBase] = useState(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingH = Math.max(0, ACID0 - base);
  const excessOH = Math.max(0, base - ACID0);
  const water = Math.min(ACID0, base);
  const atEquivalence = base === ACID0;

  // p in [0..2]: 0 = all acid (pH 1), 1 = neutral (pH 7), 2 = all excess base (pH 13)
  const p = base / ACID0;
  const ph = Math.max(1, Math.min(13, 1 + p * 6));
  const phLabel = ph < 6.5 ? 'Acidic' : ph > 7.5 ? 'Basic' : 'Neutral';
  const phColor = ph < 6.5 ? H_COLOR : ph > 7.5 ? OH_COLOR : WATER_COLOR;

  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < remainingH; i += 1) list.push({ type: 'H', label: 'H\u207A', color: H_COLOR });
    for (let i = 0; i < water; i += 1) list.push({ type: 'W', label: 'H\u2082O', color: WATER_COLOR });
    for (let i = 0; i < excessOH; i += 1) list.push({ type: 'OH', label: 'OH\u207B', color: OH_COLOR });
    return list;
  }, [remainingH, water, excessOH]);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> add base to the acid. Each OH&#8315; pairs with an H&#8314; to make water,
        and the pH climbs toward 7. Find the equivalence point where the acid runs out.
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <svg viewBox="0 0 300 200" className={v.svg} role="img" aria-label={`${remainingH} hydrogen ions, ${water} water molecules, ${excessOH} hydroxide ions. ${phLabel}, about pH ${ph.toFixed(1)}.`}>
          <defs>
            <radialGradient id="ns-shade" cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="38%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <path d="M40 36 h220 v118 a14 14 0 0 1 -14 14 h-192 a14 14 0 0 1 -14 -14 z" fill="rgba(96,165,250,0.1)" stroke="var(--color-border-strong)" strokeWidth="2" />
          {atEquivalence && (
            <rect x="30" y="26" width="240" height="152" rx="14" fill="none" stroke="var(--accent-green)" strokeWidth="3" className={v.glow} />
          )}
          {particles.map((pt, i) => {
            const [x, y] = gridPos(i);
            return (
              <g key={i} className={v.sceneShadow}>
                <circle cx={x} cy={y} r={pt.type === 'W' ? 11 : 9} fill={pt.color} stroke="rgba(0,0,0,0.25)" />
                <circle cx={x} cy={y} r={pt.type === 'W' ? 11 : 9} fill="url(#ns-shade)" />
                <text x={x} y={y + 3} textAnchor="middle" fontSize={pt.type === 'W' ? 7.5 : 8} fontWeight="800" fill="#0e0f13">{pt.label}</text>
              </g>
            );
          })}
        </svg>
        <div className={v.sceneTitle} style={{ marginTop: 'var(--space-2)' }}>
          {atEquivalence ? 'Equivalence point - acid fully neutralized' : remainingH > 0 ? 'Acid still has free H\u207A' : 'Excess base remains'}
        </div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: H_COLOR, fontSize: 'var(--text-xl)' }}>{remainingH}</div>
          <div className={v.statLabel}>free H&#8314;</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: phColor }} role="status" aria-live="polite">{ph.toFixed(1)}</div>
          <div className={v.statLabel}>pH ({phLabel})</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: OH_COLOR, fontSize: 'var(--text-xl)' }}>{excessOH}</div>
          <div className={v.statLabel}>excess OH&#8315;</div>
        </div>
      </div>

      <input
        className={v.slider}
        type="range"
        min={0}
        max={MAX_BASE}
        step={1}
        value={base}
        onChange={(e) => setBase(Number(e.target.value))}
        aria-label="Amount of base added"
      />
      <div className={v.row}>
        <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setBase((b) => Math.min(MAX_BASE, b + 1))} disabled={base >= MAX_BASE}>Add base (OH&#8315;)</button>
        <button type="button" className={v.btn} onClick={() => setBase(0)} disabled={base === 0}>Reset</button>
      </div>

      <p className={atEquivalence ? v.feedbackOk : v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {atEquivalence
          ? 'Equivalence point! Every H\u207A has paired with an OH\u207B to form water - the solution is neutral.'
          : remainingH > 0
            ? `${remainingH} H\u207A still free - keep adding base to neutralize the acid.`
            : `Acid is used up and ${excessOH} OH\u207B remain, so the solution is now basic.`}
      </p>
    </div>
  );
}
