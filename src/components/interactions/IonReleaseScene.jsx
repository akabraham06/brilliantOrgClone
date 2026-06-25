import { useEffect, useState } from 'react';
import { useRaf, usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

/*
 * What makes water acidic or basic - shown as the actual process. Intact acid
 * (HCl) or base (NaOH) units sit in water; press "Dissolve" and each one splits
 * (dissociates) into two ions. The characteristic ion - H+ for acids, OH- for
 * bases - breaks away and spreads through the water, while the spectator ion
 * stays behind. A readout names the dominant ion and whether the water is now
 * acidic or basic. This makes "acids release H+, bases release OH-" literal.
 */

const MODES = {
  acid: {
    label: 'Acid',
    formula: 'HCl',
    cation: { sym: 'H', sign: '\u207A', color: '#ef4444' },
    anion: { sym: 'Cl', sign: '\u207B', color: '#4ade80' },
    characteristic: 'cation',
    ion: 'H\u207A',
    accent: 'var(--accent-red)',
    result: 'Acidic',
    note: 'Dissolving an acid like HCl splits it into H\u207A and Cl\u207B. The freed H\u207A ions flood the water - more H\u207A means the solution is acidic (pH below 7).',
  },
  base: {
    label: 'Base',
    formula: 'NaOH',
    cation: { sym: 'Na', sign: '\u207A', color: '#a78bfa' },
    anion: { sym: 'OH', sign: '\u207B', color: '#60a5fa' },
    characteristic: 'anion',
    ion: 'OH\u207B',
    accent: 'var(--accent-blue)',
    result: 'Basic',
    note: 'Dissolving a base like NaOH splits it into Na\u207A and OH\u207B. The freed OH\u207B ions flood the water - more OH\u207B means the solution is basic (pH above 7).',
  },
};

// Each unit: a resting (bonded) spot in the water and a "released" target the
// characteristic ion drifts to after dissociation.
const SPOTS = [
  { base: [98, 150], rel: [90, 100] },
  { base: [150, 138], rel: [150, 90] },
  { base: [204, 150], rel: [216, 102] },
  { base: [126, 180], rel: [118, 122] },
  { base: [196, 184], rel: [232, 124] },
];

export default function IonReleaseScene({ onReady }) {
  const [mode, setMode] = useState('acid');
  const [split, setSplit] = useState(false);
  const [phase, setPhase] = useState(0);
  const reduce = usePrefersReducedMotion();

  useRaf((dt) => setPhase((p) => p + dt * 0.0018), split);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cfg = MODES[mode];
  const charIsCation = cfg.characteristic === 'cation';

  function chooseMode(k) {
    setMode(k);
    setSplit(false);
  }

  function Ion({ x, y, ion, r, characteristic, drift }) {
    const dx = split && characteristic && !reduce ? Math.sin(phase * 1.1 + x) * drift : 0;
    const dy = split && characteristic && !reduce ? Math.cos(phase * 0.9 + y) * drift : 0;
    return (
      <g
        style={{
          transform: `translate(${x + dx}px, ${y + dy}px)`,
          transition: reduce ? 'none' : 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <circle cx={0} cy={0} r={r} fill={ion.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        {characteristic && <circle cx={0} cy={0} r={r + 3} fill="none" stroke={ion.color} strokeWidth="1.5" opacity="0.45" />}
        <text x={0} y={3} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0e0f13">{ion.sym}{ion.sign}</text>
      </g>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Goal:</strong> add an acid or a base, then dissolve it to watch it split and release its
        signature ion - H&#8314; for acids, OH&#8315; for bases.
      </div>

      <div className={v.toggleGroup} role="group" aria-label="What to add to the water">
        {Object.keys(MODES).map((k) => (
          <button key={k} type="button" className={k === mode ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => chooseMode(k)} aria-pressed={k === mode}>
            Add {MODES[k].label.toLowerCase()} ({MODES[k].formula})
          </button>
        ))}
      </div>

      <div className={`${v.panel} ${v.panelWide}`}>
        <div className={v.svgWrap}>
          <svg viewBox="0 0 320 230" className={v.svg} role="img" aria-label={`${cfg.formula} ${split ? `dissolved into ${cfg.cation.sym}${cfg.cation.sign} and ${cfg.anion.sym}${cfg.anion.sign}; the ${cfg.ion} ions have spread through the water, making it ${cfg.result.toLowerCase()}` : 'molecules sitting intact in water before dissolving'}.`}>
            {/* beaker + water */}
            <rect x="62" y="40" width="196" height="176" rx="14" fill="rgba(96,165,250,0.08)" stroke="var(--color-border-strong)" strokeWidth="2" />
            <path d="M66 92 H254 V200 Q254 212 200 212 H120 Q66 212 66 200 Z" fill="rgba(96,165,250,0.18)" />
            <line x1="66" y1="92" x2="254" y2="92" stroke="#7dd3fc" strokeWidth="2" opacity="0.7" />

            {SPOTS.map((spot, i) => {
              const [bx, by] = spot.base;
              const [rx, ry] = spot.rel;
              let cPos;
              let aPos;
              if (!split) {
                cPos = { x: bx - 11, y: by };
                aPos = { x: bx + 11, y: by };
              } else if (charIsCation) {
                cPos = { x: rx, y: ry };
                aPos = { x: bx, y: by };
              } else {
                aPos = { x: rx, y: ry };
                cPos = { x: bx, y: by };
              }
              return (
                <g key={i}>
                  {!split && (
                    <line x1={cPos.x} y1={cPos.y} x2={aPos.x} y2={aPos.y} stroke="var(--color-border-strong)" strokeWidth="2.5" />
                  )}
                  <Ion x={cPos.x} y={cPos.y} ion={cfg.cation} r={charIsCation ? 11 : 9} characteristic={charIsCation} drift={5} />
                  <Ion x={aPos.x} y={aPos.y} ion={cfg.anion} r={charIsCation ? 9 : 11} characteristic={!charIsCation} drift={5} />
                </g>
              );
            })}
          </svg>
        </div>

        <div className={v.row} style={{ marginTop: 'var(--space-2)' }}>
          <button type="button" className={`${v.btn} ${v.btnPrimary}`} onClick={() => setSplit((sv) => !sv)}>
            {split ? 'Reset molecules' : 'Dissolve in water'}
          </button>
        </div>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: cfg.accent, fontSize: 'var(--text-2xl)' }}>{split ? cfg.ion : '\u2014'}</div>
          <div className={v.statLabel}>{split ? 'ion released' : 'not dissolved yet'}</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: split ? cfg.accent : 'var(--color-text-subtle)', fontSize: 'var(--text-xl)' }} role="status" aria-live="polite">
            {split ? cfg.result : 'Neutral'}
          </div>
          <div className={v.statLabel}>solution is</div>
        </div>
      </div>

      <p className={v.muted} role="status" aria-live="polite" style={{ textAlign: 'center', maxWidth: 440 }}>
        {split ? cfg.note : `An intact ${cfg.formula} ${cfg.label.toLowerCase()} sits in water. Press "Dissolve" to split it apart and release its ${cfg.ion} ions.`}
      </p>
    </div>
  );
}
