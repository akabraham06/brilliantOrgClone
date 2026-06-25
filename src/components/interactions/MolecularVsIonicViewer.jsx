import { useEffect, useState } from 'react';
import { useRaf } from './lib/motion.js';
import v from './viz.module.css';

/**
 * Molecular substances vs. ionic compounds - why one melts low and the other
 * melts high. Toggle between a molecular solid (CO2, discrete O=C=O units held
 * by weak forces) and an ionic compound (NaCl, one giant lattice of strong +/-
 * attractions). Raise the temperature: the molecular units drift apart almost
 * immediately, while the ionic lattice stays locked until a very high melting
 * point - making the structural reason for the property difference visible.
 */
const C = '#9aa3b2';
const OXY = 'var(--accent-pink)';
const NA = 'var(--accent-purple)';
const CL = 'var(--accent-green)';

const VBW = 320;
const VBH = 200;
const PAD = 26;

const CO2_BASES = [
  [72, 72], [160, 66], [248, 76], [70, 140], [162, 146], [250, 138],
];

// 6x4 alternating Na+/Cl- lattice.
const ION_COLS = 6;
const ION_ROWS = 4;
const IONS = (() => {
  const out = [];
  for (let r = 0; r < ION_ROWS; r += 1)
    for (let c = 0; c < ION_COLS; c += 1) {
      const na = (r + c) % 2 === 0;
      out.push({ r, c, na, x: 58 + c * 34, y: 64 + r * 30 });
    }
  return out;
})();

export default function MolecularVsIonicViewer({ onReady }) {
  const [mode, setMode] = useState('molecular');
  const [temp, setTemp] = useState(25);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useRaf((dt) => setPhase((p) => p + dt * 0.004));

  const t = temp / 1000; // 0..1
  const clampX = (x) => Math.max(PAD, Math.min(VBW - PAD, x));
  const clampY = (y) => Math.max(PAD, Math.min(VBH - PAD, y));

  const ionMelted = temp >= 801;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a substance">
        <button type="button" className={mode === 'molecular' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setMode('molecular')}>
          Molecular (CO&#8322;)
        </button>
        <button type="button" className={mode === 'ionic' ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => setMode('ionic')}>
          Ionic (NaCl)
        </button>
      </div>

      <div className={v.svgWrap}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} role="img" aria-label={mode === 'molecular' ? 'Discrete carbon dioxide molecules' : 'Sodium chloride ionic lattice'}>
          <rect x="2" y="2" width={VBW - 4} height={VBH - 4} rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

          {mode === 'molecular'
            ? CO2_BASES.map(([bx, by], i) => {
                // Weak intermolecular forces: units roam freely, more as it heats.
                const amp = 4 + t * 30;
                const ox = Math.sin(phase * 0.7 + i * 1.3) * amp;
                const oy = Math.cos(phase * 0.5 + i * 2.1) * (amp * 0.7);
                const cx = clampX(bx + ox);
                const cy = clampY(by + oy);
                return (
                  <g key={i}>
                    <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke="var(--color-border-strong)" strokeWidth="3" />
                    <circle cx={cx - 16} cy={cy} r="9" fill={OXY} stroke="rgba(0,0,0,0.25)" />
                    <circle cx={cx} cy={cy} r="11" fill={C} stroke="rgba(0,0,0,0.25)" />
                    <circle cx={cx + 16} cy={cy} r="9" fill={OXY} stroke="rgba(0,0,0,0.25)" />
                  </g>
                );
              })
            : (
              <>
                {/* lattice bonds (hidden once it melts) */}
                {!ionMelted &&
                  IONS.map((ion) => (
                    <g key={`b-${ion.r}-${ion.c}`}>
                      {ion.c < ION_COLS - 1 && (
                        <line x1={ion.x} y1={ion.y} x2={ion.x + 34} y2={ion.y} stroke="var(--color-border-strong)" strokeWidth="1.5" opacity="0.5" />
                      )}
                      {ion.r < ION_ROWS - 1 && (
                        <line x1={ion.x} y1={ion.y} x2={ion.x} y2={ion.y + 30} stroke="var(--color-border-strong)" strokeWidth="1.5" opacity="0.5" />
                      )}
                    </g>
                  ))}
                {IONS.map((ion, i) => {
                  const amp = ionMelted ? 22 : 1 + t * 3;
                  const ox = Math.sin(phase * (ionMelted ? 0.9 : 0.4) + i) * amp;
                  const oy = Math.cos(phase * (ionMelted ? 0.7 : 0.3) + i * 1.7) * amp;
                  return (
                    <g key={`i-${ion.r}-${ion.c}`}>
                      <circle cx={clampX(ion.x + ox)} cy={clampY(ion.y + oy)} r={ion.na ? 8 : 10} fill={ion.na ? NA : CL} stroke="rgba(0,0,0,0.25)" />
                      <text x={clampX(ion.x + ox)} y={clampY(ion.y + oy) + 3} textAnchor="middle" fontSize="8" fontWeight="800" fill="#0e0f13" pointerEvents="none">
                        {ion.na ? '+' : '\u2212'}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="mvi-temp" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Temperature</span>
          <span style={{ color: 'var(--accent-orange)' }}>{temp}&deg;C</span>
        </label>
        <input
          id="mvi-temp"
          type="range"
          min="0"
          max="1000"
          step="25"
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>{mode === 'molecular' ? 'Discrete molecules' : 'Giant lattice'}</div>
          <div className={v.statLabel}>structure</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-orange)' }}>{mode === 'molecular' ? '\u221278\u00b0C' : '801\u00b0C'}</div>
          <div className={v.statLabel}>melting point</div>
        </div>
      </div>

      <p className={mode === 'molecular' || ionMelted ? v.feedbackOk : v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        {mode === 'molecular'
          ? 'Only weak forces hold these separate CO\u2082 units together, so even gentle heat lets them drift apart - molecular substances melt and boil at low temperatures (CO\u2082 is already a gas at room temperature).'
          : ionMelted
            ? 'It finally melts near 801\u00b0C: only enormous heat can overcome the strong + / \u2212 attractions woven through the whole lattice.'
            : 'Every ion is locked to oppositely charged neighbors in all directions. These strong attractions run through the entire crystal, so it barely moves - ionic compounds melt only at very high temperatures.'}
      </p>
    </div>
  );
}
