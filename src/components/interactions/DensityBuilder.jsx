import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './DensityBuilder.module.css';

const MASS_MIN = 0;
const MASS_MAX = 200;
const VOL_MIN = 1;
const VOL_MAX = 100;
const WATER = 1.0; // g/cm^3 reference for float/sink.

/** Round to at most 2 decimals, trimming trailing zeros (1.50 -> 1.5, 2.00 -> 2). */
function tidy(n) {
  return parseFloat(n.toFixed(2)).toString();
}

/**
 * Density builder: pick a mass (g) and a volume (cm^3) and watch
 * density = mass / volume update live. A container fills with particle packing
 * that reflects the density, and a badge shows whether the object floats or
 * sinks in water (density vs 1.0 g/cm^3).
 */
export default function DensityBuilder({ onReady, savedState, onSaveState }) {
  const [mass, setMass] = useState(savedState?.mass ?? 50);
  const [volume, setVolume] = useState(savedState?.volume ?? 50);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const density = volume > 0 ? mass / volume : 0;

  function changeMass(value) {
    setMass(value);
    onSaveState?.({ mass: value, volume });
  }
  function changeVolume(value) {
    setVolume(value);
    onSaveState?.({ mass, volume: value });
  }

  // Packing: dot count scales with density so denser = more crowded.
  const dotCount = Math.max(1, Math.min(144, Math.round(density * 12)));
  const perRow = Math.ceil(Math.sqrt(dotCount));
  const gap = 92 / perRow;

  let verdict;
  let verdictColor;
  if (Math.abs(density - WATER) < 0.001) {
    verdict = 'Neutral - same density as water';
    verdictColor = 'var(--accent-yellow)';
  } else if (density < WATER) {
    verdict = 'Floats in water';
    verdictColor = 'var(--accent-green)';
  } else {
    verdict = 'Sinks in water';
    verdictColor = 'var(--accent-orange)';
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Density = mass &divide; volume.</strong> Set a mass and a volume and watch how tightly the matter packs.
      </div>

      <div className={v.panel}>
        <div className={s.scene}>
          <svg viewBox="0 0 100 100" width="160" height="160" role="img" aria-label={`Container packed with matter at ${tidy(density)} grams per cubic centimeter`}>
            <defs>
              <radialGradient id="db-shade" cx="34%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="38%" stopColor="#fff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
              </radialGradient>
            </defs>
            <rect x="3" y="3" width="94" height="94" rx="10" fill="var(--color-bg)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
            {Array.from({ length: dotCount }).map((_, i) => {
              const cx = 4 + (i % perRow) * gap + gap / 2;
              const cy = 4 + Math.floor(i / perRow) * gap + gap / 2;
              const r = Math.min(gap / 3, 4);
              return (
                <g key={i} className={v.sceneShadow}>
                  <circle cx={cx} cy={cy} r={r} fill="var(--accent-blue)" stroke="rgba(0,0,0,0.2)" />
                  <circle cx={cx} cy={cy} r={r} fill="url(#db-shade)" />
                </g>
              );
            })}
          </svg>
          <div className={v.sceneTitle}>{dotCount} particles in a fixed space</div>
        </div>
      </div>

      <div className={s.formula} role="status" aria-live="polite">
        <span className={s.formulaLabel}>density =</span>
        <span className={s.frac}>
          <span className={s.num}>{mass} g</span>
          <span className={s.den}>{volume} cm&sup3;</span>
        </span>
        <span className={s.equals}>=</span>
        <span className={s.result} style={{ color: verdictColor }}>{tidy(density)} g/cm&sup3;</span>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-purple)' }}>{mass}</div>
          <div className={v.statLabel}>mass (g)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: 'var(--accent-blue)' }}>{volume}</div>
          <div className={v.statLabel}>volume (cm&sup3;)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: verdictColor }}>{tidy(density)}</div>
          <div className={v.statLabel}>density (g/cm&sup3;)</div>
        </div>
      </div>

      <div className={s.controls}>
        <label className={s.control}>
          <span className={s.controlLabel}>Mass: <strong>{mass} g</strong></span>
          <input
            className={v.slider}
            type="range"
            min={MASS_MIN}
            max={MASS_MAX}
            step={1}
            value={mass}
            onChange={(e) => changeMass(Number(e.target.value))}
            aria-label="Mass in grams"
          />
        </label>
        <label className={s.control}>
          <span className={s.controlLabel}>Volume: <strong>{volume} cm&sup3;</strong></span>
          <input
            className={v.slider}
            type="range"
            min={VOL_MIN}
            max={VOL_MAX}
            step={1}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume in cubic centimeters"
          />
        </label>
      </div>

      <p className={v.feedbackOk} style={{ background: 'transparent', color: verdictColor, fontWeight: 700 }} role="status" aria-live="polite">
        {verdict} (water = 1.0 g/cm&sup3;)
      </p>
    </div>
  );
}
