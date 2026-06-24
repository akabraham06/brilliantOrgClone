import { useState } from 'react';
import styles from './LandingMolecule.module.css';

const REAL_ANGLE = 104.5;
const REAL_LENGTH = 70;

/**
 * Interactive water molecule for the landing page. The learner controls the
 * real H-O-H bond angle and bond length with sliders (and can drag the
 * hydrogens directly); the molecule and read-outs update live.
 */
export default function LandingMolecule() {
  const [angle, setAngle] = useState(REAL_ANGLE);
  const [length, setLength] = useState(REAL_LENGTH);
  const [dragging, setDragging] = useState(false);

  const cx = 120;
  const cy = 82;
  const half = ((angle / 2) * Math.PI) / 180;
  const h1x = cx - length * Math.sin(half);
  const h2x = cx + length * Math.sin(half);
  const hy = cy + length * Math.cos(half);

  // Dragging a hydrogen sets both the angle (from horizontal offset) and the
  // length (from distance to O), keeping the molecule symmetric.
  function handlePointer(evt) {
    const svg = evt.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((evt.clientX - rect.left) / rect.width) * 240;
    const py = ((evt.clientY - rect.top) / rect.height) * 200;
    const dx = Math.abs(px - cx);
    const dy = Math.max(8, py - cy);
    const dist = Math.min(92, Math.max(48, Math.hypot(dx, dy)));
    const halfAngle = Math.atan2(dx, dy) * (180 / Math.PI);
    const fullAngle = Math.min(160, Math.max(70, halfAngle * 2));
    setAngle(Math.round(fullAngle * 10) / 10);
    setLength(Math.round(dist));
  }

  const isReal = Math.abs(angle - REAL_ANGLE) < 1.5;

  return (
    <div className={styles.wrap}>
      <p className={styles.formula}>H&#8322;O</p>
      <svg
        viewBox="0 0 240 200"
        className={styles.svg}
        onPointerMove={(e) => dragging && handlePointer(e)}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          e.currentTarget.releasePointerCapture?.(e.pointerId);
        }}
        onPointerCancel={() => setDragging(false)}
        role="img"
        aria-label={`Water molecule with bond angle ${angle} degrees`}
      >
        <line x1={cx} y1={cy} x2={h1x} y2={hy} className={styles.bond} />
        <line x1={cx} y1={cy} x2={h2x} y2={hy} className={styles.bond} />

        {/* angle arc */}
        <path
          d={`M ${cx + 26 * Math.sin(-half)} ${cy + 26 * Math.cos(-half)} A 26 26 0 0 1 ${cx + 26 * Math.sin(half)} ${cy + 26 * Math.cos(half)}`}
          className={styles.arc}
        />

        <circle cx={cx} cy={cy} r="32" className={styles.atomO} />
        <text x={cx} y={cy + 8} className={styles.atomLabel}>O</text>

        <circle cx={h1x} cy={hy} r="20" className={`${styles.atomH} ${styles.grab}`} />
        <text x={h1x} y={hy + 6} className={styles.atomLabelSm}>H</text>
        <circle cx={h2x} cy={hy} r="20" className={`${styles.atomH} ${styles.grab}`} />
        <text x={h2x} y={hy + 6} className={styles.atomLabelSm}>H</text>
      </svg>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span className={styles.controlTop}>
            Bond angle <strong>{angle.toFixed(1)}&deg;</strong>
          </span>
          <input
            type="range"
            min="70"
            max="160"
            step="0.5"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className={styles.slider}
            aria-label="Bond angle"
          />
        </label>
        <label className={styles.control}>
          <span className={styles.controlTop}>
            Bond length <strong>{length} pm</strong>
          </span>
          <input
            type="range"
            min="48"
            max="92"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className={styles.slider}
            aria-label="Bond length"
          />
        </label>
        <button
          type="button"
          className={`${styles.preset} ${isReal ? styles.presetActive : ''}`}
          onClick={() => {
            setAngle(REAL_ANGLE);
            setLength(REAL_LENGTH);
          }}
        >
          {isReal ? '\u2713 Real water (104.5\u00b0)' : 'Snap to real water (104.5\u00b0)'}
        </button>
      </div>
    </div>
  );
}
