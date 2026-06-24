import { useEffect, useState } from 'react';
import v from './viz.module.css';

/**
 * Two equal-volume containers with different particle packing. Tap the one you
 * think is denser; more particles in the same volume = denser. Instant feedback
 * plus a relative-density readout.
 */
export default function DensityCompare({ onReady }) {
  const [pick, setPick] = useState(null);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function Box({ id, count, label }) {
    const selected = pick === id;
    const correct = id === 'A';
    let border = 'var(--color-border-strong)';
    if (selected) border = correct ? 'var(--accent-green)' : 'var(--accent-orange)';
    return (
      <button
        type="button"
        onClick={() => setPick(id)}
        className={selected ? v.chipSelected : undefined}
        style={{ border: `2px solid ${border}`, borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-elevated)', padding: 10, cursor: 'pointer', transition: 'transform 0.15s, border-color 0.2s', transform: selected ? 'translateY(-2px)' : 'none' }}
        aria-label={`Container ${label} with ${count} particles`}
        aria-pressed={selected}
      >
        <svg viewBox="0 0 120 120" width="116" height="116">
          <rect x="4" y="4" width="112" height="112" rx="8" fill="none" stroke="var(--color-border)" />
          {Array.from({ length: count }).map((_, i) => {
            const perRow = Math.ceil(Math.sqrt(count));
            const gap = 108 / perRow;
            return (
              <circle
                key={i}
                className={v.popIn}
                cx={10 + (i % perRow) * gap + gap / 2}
                cy={10 + Math.floor(i / perRow) * gap + gap / 2}
                r={gap / 3}
                fill="var(--accent-blue)"
                stroke="rgba(0,0,0,0.2)"
                style={{ animationDelay: `${i * 0.02}s` }}
              />
            );
          })}
        </svg>
        <div className={v.binLabel}>Container {label} &middot; {count} particles</div>
      </button>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Same volume, different packing.</strong> Tap the container you think is denser.
      </div>

      <div className={v.row} style={{ gap: 'var(--space-3)' }}>
        <Box id="A" count={16} label="A" />
        <Box id="B" count={4} label="B" />
      </div>

      {pick == null ? (
        <p className={v.muted}>Density = particles packed into a fixed space. Which one is denser?</p>
      ) : pick === 'A' ? (
        <p className={v.feedbackOk}>Correct! A holds 16 vs 4 particles in the same volume - about 4&times; denser.</p>
      ) : (
        <div className={v.feedbackBad}>
          <p>Not quite - more particles in the same volume means denser. A (16) beats B (4).</p>
          <button type="button" className={v.btn} onClick={() => setPick(null)} style={{ marginTop: 8 }}>Try again</button>
        </div>
      )}
    </div>
  );
}
