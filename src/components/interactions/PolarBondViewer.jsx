import { useEffect, useState } from 'react';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';
import s from './PolarBondViewer.module.css';

const VBW = 320;
const VBH = 180;
const AX = 96; // left atom centre
const BX = 224; // right atom centre
const CY = 96;

function regime(diff) {
  if (diff < 0.5) {
    return {
      type: 'Nonpolar covalent',
      example: 'like Cl-Cl',
      blurb: 'The two atoms pull equally, so the shared electrons sit right in the middle. No end is more negative - the bond is nonpolar.',
      color: 'var(--accent-green)',
    };
  }
  if (diff < 1.8) {
    return {
      type: 'Polar covalent',
      example: 'like H-Cl or O-H',
      blurb: 'One atom pulls harder, so the shared electrons spend more time near it. That end becomes slightly negative (delta-) and the other slightly positive (delta+).',
      color: 'var(--accent-purple)',
    };
  }
  return {
    type: 'Ionic',
    example: 'like Na-Cl',
    blurb: 'The pull is so lopsided that the electron is taken completely. One atom becomes a full + ion, the other a full - ion.',
    color: 'var(--accent-orange)',
  };
}

/**
 * Polarity slider: drag the electronegativity difference between two atoms and
 * watch the shared electron pair slide from the middle (nonpolar) toward the
 * greedier atom (polar, with delta+/delta- partial charges) and finally a full
 * transfer (ionic). One continuous, animated picture of the bonding spectrum.
 */
export default function PolarBondViewer({ onReady, savedState, onSaveState }) {
  const [diff, setDiff] = useState(savedState?.diff ?? 0.9);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = regime(diff);
  const ionic = diff >= 1.8;
  const polar = diff >= 0.5 && diff < 1.8;

  // Electron-pair position: midpoint at diff 0, fully on B by diff ~2.4.
  const t = Math.min(1, diff / 2.4);
  const mid = (AX + BX) / 2;
  const eX = useSpring(ionic ? BX : mid + (BX - mid) * t, { stiffness: 0.14 });
  const cloudShift = useSpring(t, { stiffness: 0.14 });

  function update(val) {
    setDiff(val);
    onSaveState?.({ diff: val });
  }

  const aCharge = ionic ? '+' : polar ? '\u03B4+' : '';
  const bCharge = ionic ? '\u2212' : polar ? '\u03B4\u2212' : '';

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.svgWrap} style={{ maxWidth: 360 }}>
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} role="img" aria-label={`Bond polarity: ${r.type}`}>
          <defs>
            <radialGradient id="pb-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="pb-cloud" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="2" y="2" width={VBW - 4} height={VBH - 4} rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

          {/* bond line (hidden once ionic / fully transferred) */}
          {!ionic && <line x1={AX} y1={CY} x2={BX} y2={CY} stroke="var(--color-border-strong)" strokeWidth="3" />}

          {/* shared electron cloud - drifts toward the greedier atom */}
          {!ionic && (
            <ellipse
              cx={mid + (BX - mid) * cloudShift}
              cy={CY}
              rx={34 - 8 * cloudShift}
              ry="22"
              fill="url(#pb-cloud)"
            />
          )}

          {/* atom A (less electronegative) */}
          <circle cx={AX} cy={CY} r="26" fill="var(--accent-blue)" />
          <circle cx={AX} cy={CY} r="26" fill="url(#pb-shade)" />
          <text x={AX} y={CY + 5} textAnchor="middle" fontWeight="800" fontSize="15" fill="#0e0f13">A</text>
          {aCharge && <text x={AX} y={CY - 34} textAnchor="middle" fontWeight="800" fontSize="16" fill="var(--accent-orange)">{aCharge}</text>}

          {/* atom B (more electronegative - drawn a touch bigger/greedier) */}
          <circle cx={BX} cy={CY} r="30" fill={r.color} />
          <circle cx={BX} cy={CY} r="30" fill="url(#pb-shade)" />
          <text x={BX} y={CY + 5} textAnchor="middle" fontWeight="800" fontSize="15" fill="#0e0f13">B</text>
          {bCharge && <text x={BX} y={CY - 38} textAnchor="middle" fontWeight="800" fontSize="16" fill="var(--accent-blue)">{bCharge}</text>}

          {/* shared electron pair */}
          <circle cx={eX - 6} cy={CY + 1} r="4.5" fill="#fff" />
          <circle cx={eX + 6} cy={CY + 1} r="4.5" fill="#fff" />
        </svg>
      </div>

      <div className={s.sliderWrap}>
        <div className={s.sliderLabels}>
          <span>equal pull</span>
          <span>greedy atom B</span>
        </div>
        <input
          type="range"
          min="0"
          max="2.6"
          step="0.1"
          value={diff}
          onChange={(e) => update(parseFloat(e.target.value))}
          aria-label="Electronegativity difference"
        />
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: r.color }}>{r.type}</div>
          <div className={v.statLabel}>{r.example}</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{diff.toFixed(1)}</div>
          <div className={v.statLabel}>electronegativity gap</div>
        </div>
      </div>

      <p className={v.muted}>{r.blurb}</p>
    </div>
  );
}
