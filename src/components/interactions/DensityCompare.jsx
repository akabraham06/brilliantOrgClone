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
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          border: `2px solid ${border}`,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-elevated)',
          padding: 'var(--space-3)',
          cursor: 'pointer',
          transition: 'transform 0.15s, border-color 0.2s, box-shadow 0.2s',
          transform: selected ? 'translateY(-3px)' : 'none',
          boxShadow: selected ? '0 6px 18px rgba(0,0,0,0.3)' : 'var(--shadow-sm)',
        }}
        aria-label={`Container ${label} with ${count} particles`}
        aria-pressed={selected}
      >
        <svg viewBox="0 0 120 120" width="116" height="116" aria-hidden="true">
          <defs>
            <radialGradient id={`dc-shade-${id}`} cx="34%" cy="28%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="38%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <rect x="4" y="4" width="112" height="112" rx="12" fill="var(--color-bg)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          {(() => {
            // Lay particles out on a square-ish grid that is inset from the box
            // walls and centered both axes. Partial last rows are centered too.
            const pad = 16;
            const usable = 120 - pad * 2;
            const perRow = Math.ceil(Math.sqrt(count));
            const rows = Math.ceil(count / perRow);
            const cell = usable / Math.max(perRow, rows);
            const r = cell * 0.3;
            const offsetX = (120 - perRow * cell) / 2;
            const offsetY = (120 - rows * cell) / 2;
            return Array.from({ length: count }).map((_, i) => {
              const row = Math.floor(i / perRow);
              const col = i % perRow;
              const itemsInRow = Math.min(perRow, count - row * perRow);
              const rowInset = ((perRow - itemsInRow) * cell) / 2;
              const cx = offsetX + rowInset + col * cell + cell / 2;
              const cy = offsetY + row * cell + cell / 2;
              return (
                <g key={i} className={`${v.popIn} ${v.sceneShadow}`} style={{ animationDelay: `${i * 0.02}s` }}>
                  <circle cx={cx} cy={cy} r={r} fill="var(--accent-blue)" stroke="rgba(0,0,0,0.2)" />
                  <circle cx={cx} cy={cy} r={r} fill={`url(#dc-shade-${id})`} />
                </g>
              );
            });
          })()}
        </svg>
        <div className={v.sceneTitle}>Container {label}</div>
        <div className={v.statValue} style={{ fontSize: 'var(--text-lg)' }}>{count} <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', fontWeight: 600 }}>particles</span></div>
      </button>
    );
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Same volume, different packing.</strong> Both boxes are the same size - tap the one you think is denser.
      </div>

      <div className={v.panel}>
        <div className={v.row} style={{ gap: 'var(--space-4)', flexWrap: 'nowrap' }}>
          <Box id="A" count={16} label="A" />
          <Box id="B" count={4} label="B" />
        </div>

        <div className={v.legend} style={{ marginTop: 'var(--space-3)' }}>
          <span className={v.legendItem}>
            <span className={v.legendDot} style={{ background: 'var(--accent-blue)' }} />
            particle (matter)
          </span>
          <span className={v.legendItem}>more particles per box = denser</span>
        </div>
      </div>

      {pick == null ? (
        <p className={v.muted} style={{ textAlign: 'center' }}>
          Density = how much matter is packed into a fixed space. Which container is denser?
        </p>
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
