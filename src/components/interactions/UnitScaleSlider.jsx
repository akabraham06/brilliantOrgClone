import { useEffect, useState } from 'react';
import v from './viz.module.css';
import s from './UnitScaleSlider.module.css';

/**
 * Metric-prefix scale explorer. The same physical length (1 meter) is shown in
 * different units; tapping a prefix updates the value, the conversion factor,
 * and a ruler whose tick density reflects the unit size. Non-gating.
 */
const UNITS = [
  { id: 'km', name: 'kilometer', symbol: 'km', value: '0.001', factor: '1 km = 1000 m', ticks: 4 },
  { id: 'm', name: 'meter', symbol: 'm', value: '1', factor: 'the base unit', ticks: 8 },
  { id: 'cm', name: 'centimeter', symbol: 'cm', value: '100', factor: '1 m = 100 cm', ticks: 20 },
  { id: 'mm', name: 'millimeter', symbol: 'mm', value: '1000', factor: '1 m = 1000 mm', ticks: 40 },
];

export default function UnitScaleSlider({ onReady }) {
  const [idx, setIdx] = useState(1);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const u = UNITS[idx];
  const ticks = Array.from({ length: u.ticks + 1 });

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="tablist" aria-label="Metric unit">
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            type="button"
            role="tab"
            aria-selected={i === idx}
            className={`${v.toggle} ${i === idx ? v.toggleActive : ''}`}
            onClick={() => setIdx(i)}
          >
            {unit.symbol}
          </button>
        ))}
      </div>

      <div className={v.panel}>
        <p className={s.readout} aria-live="polite">
          <span className={s.big}>1 meter</span>
          <span className={s.eq}>=</span>
          <span className={s.bigAccent}>
            {u.value} {u.symbol}
          </span>
        </p>
        <svg viewBox="0 0 300 48" className={v.svg} role="img" aria-label={`A 1 meter ruler divided into ${u.symbol}`}>
          <rect x="6" y="14" width="288" height="20" rx="5" fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" />
          {ticks.map((_, i) => {
            const x = 6 + (288 * i) / u.ticks;
            return <line key={i} x1={x} y1="14" x2={x} y2={i % 5 === 0 ? 34 : 26} stroke="var(--accent-purple)" strokeWidth="1.5" />;
          })}
        </svg>
        <p className={s.factor}>{u.factor}</p>
      </div>
      <p className={v.muted} style={{ maxWidth: 360, textAlign: 'center' }}>
        Smaller units need more of them to measure the same length - that is all a prefix changes.
      </p>
    </div>
  );
}
