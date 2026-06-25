/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, intensity, ...) */
import { useEffect, useRef, useState } from 'react';
import { Instances, Instance } from '@react-three/drei';
import Sphere from './lib/Sphere.jsx';
import Viewport3D from './lib/Viewport3D.jsx';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';
import styles from './IonTransferCanvas.module.css';

const VBW = 320;
const VBH = 180;
const NA = 'var(--accent-purple)';
const CL = 'var(--accent-green)';
// Hex equivalents of the Na/Cl accent tokens for three.js materials.
const NA_HEX = '#a78bfa';
const CL_HEX = '#4ade80';

/**
 * Ionic bonding: drag sodium's lone valence electron onto chlorine. The
 * electron leaves a fading trail, sodium becomes Na+ and chlorine Cl-, the
 * charge meter updates, and the ions spring together into NaCl. A "view
 * crystal" toggle reveals a rotatable 3D NaCl lattice.
 */
export default function IonTransferCanvas({ onReady }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const rafRef = useRef(0);
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const [trail, setTrail] = useState([]);
  const [transferred, setTransferred] = useState(false);
  const [flying, setFlying] = useState(false);
  const [lattice, setLattice] = useState(false);

  useEffect(() => {
    onReady?.();
    return () => window.cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate the electron flying from sodium to chlorine in an arc, leaving a
  // trail, then commit the transfer. Under reduced motion we skip straight to
  // the committed state so the same outcome lands without movement.
  function animateTransfer() {
    if (transferred || flying) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) {
      commit(true);
      return;
    }
    setFlying(true);
    setTrail([]);
    const start = { x: 92, y: 70 };
    const end = { x: 196, y: 82 };
    const dur = 850;
    const t0 = window.performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // easeInOut
      const x = start.x + (end.x - start.x) * e;
      const y = start.y + (end.y - start.y) * e - Math.sin(e * Math.PI) * 28;
      setPos({ x, y });
      setTrail((tr) => [...tr.slice(-11), { x, y }]);
      if (t < 1) rafRef.current = window.requestAnimationFrame(step);
      else {
        setFlying(false);
        commit(true);
      }
    };
    rafRef.current = window.requestAnimationFrame(step);
  }

  const naX = useSpring(transferred ? 132 : 84, { stiffness: 0.12 });
  const clX = useSpring(transferred ? 196 : 240, { stiffness: 0.12 });

  function commit(next) {
    setTransferred(next);
    setTrail([]);
    setPos(next ? { x: 196, y: 86 } : { x: 84, y: 60 });
    if (!next) setLattice(false);
  }

  function toVb(e) {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VBW,
      y: ((e.clientY - rect.top) / rect.height) * VBH,
    };
  }
  function down(e) {
    if (transferred || flying) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function move(e) {
    if (!dragging.current) return;
    const p = toVb(e);
    setPos(p);
    setTrail((t) => [...t.slice(-11), p]);
  }
  function up() {
    if (!dragging.current) return;
    dragging.current = false;
    commit(pos.x > 168);
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      {lattice ? (
        <div key="lattice" className={styles.viewFade}>
          <NaClLattice />
        </div>
      ) : (
        <div key="atoms" className={`${v.svgWrap} ${styles.viewFade}`} style={{ maxWidth: 360 }}>
          <svg ref={svgRef} viewBox={`0 0 ${VBW} ${VBH}`} className={v.svg} style={{ touchAction: 'none' }} role="img" aria-label="Sodium and chlorine ionic bonding">
            <rect x="2" y="2" width={VBW - 4} height={VBH - 4} rx="14" fill="var(--color-bg-elevated)" stroke="var(--color-border)" />

            <Sphere cx={naX} cy={90} r={26} color={NA} />
            <text x={naX} y={95} textAnchor="middle" fontWeight="800" fontSize="16" fill="#0e0f13" pointerEvents="none">
              Na{transferred ? '\u207A' : ''}
            </text>

            <Sphere cx={clX} cy={90} r={30} color={CL} />
            <text x={clX} y={95} textAnchor="middle" fontWeight="800" fontSize="16" fill="#0e0f13" pointerEvents="none">
              Cl{transferred ? '\u207B' : ''}
            </text>

            {/* electron trail */}
            {trail.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2 + i * 0.35} fill="var(--accent-blue)" opacity={(i / trail.length) * 0.45} />
            ))}

            {/* electron in flight (button-triggered animation) */}
            {flying && (
              <Sphere cx={pos.x} cy={pos.y} r={8} color="var(--accent-blue)" ariaLabel="Electron transferring" />
            )}

            {/* draggable electron */}
            {!transferred && !flying && (
              <g onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ cursor: 'grab' }}>
                <circle cx={pos.x} cy={pos.y} r="14" fill="transparent" />
                <Sphere cx={pos.x} cy={pos.y} r={8} color="var(--accent-blue)" ariaLabel="Sodium valence electron" />
              </g>
            )}
          </svg>
        </div>
      )}

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: NA }}>{transferred ? '+1' : '0'}</div>
          <div className={v.statLabel}>Na charge</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: CL }}>{transferred ? '-1' : '0'}</div>
          <div className={v.statLabel}>Cl charge</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={v.btn} onClick={() => (transferred ? commit(false) : animateTransfer())} disabled={flying}>
          {transferred ? 'Reset' : 'Transfer electron'}
        </button>
        {transferred && (
          <button type="button" className={v.btn} onClick={() => setLattice((l) => !l)}>
            {lattice ? 'Back to atoms' : 'View NaCl crystal'}
          </button>
        )}
      </div>

      <p className={transferred ? v.feedbackOk : v.muted}>
        {transferred
          ? 'Sodium lost its electron (Na+), chlorine gained it (Cl-). Opposite charges attract - and in bulk they stack into a repeating NaCl crystal.'
          : 'Drag the blue electron from sodium onto chlorine to form an ionic bond.'}
      </p>
    </div>
  );
}

// 3x3x3 alternating Na+/Cl- ions. Na+ is smaller than Cl-, like the real salt.
const LATTICE_SPACING = 1.05;
const LATTICE_IONS = (() => {
  const cells = [];
  for (let i = 0; i < 3; i += 1)
    for (let j = 0; j < 3; j += 1)
      for (let k = 0; k < 3; k += 1) {
        const isNa = (i + j + k) % 2 === 0;
        cells.push({
          key: `${i}-${j}-${k}`,
          position: [(i - 1) * LATTICE_SPACING, (j - 1) * LATTICE_SPACING, (k - 1) * LATTICE_SPACING],
          scale: isNa ? 0.42 : 0.6,
          color: isNa ? NA_HEX : CL_HEX,
        });
      }
  return cells;
})();

/** Instanced spheres for the 27-ion NaCl lattice (one draw call). */
function LatticeScene() {
  return (
    <Instances limit={LATTICE_IONS.length} range={LATTICE_IONS.length}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial roughness={0.35} metalness={0.05} />
      {LATTICE_IONS.map((ion) => (
        <Instance key={ion.key} position={ion.position} scale={ion.scale} color={ion.color} />
      ))}
    </Instances>
  );
}

/** A rotatable r3f 3x3x3 NaCl lattice of alternating Na+/Cl- ions. */
function NaClLattice() {
  return (
    <Viewport3D
      height={248}
      camera={{ position: [3.6, 3, 4.4], fov: 45 }}
      label="Interactive 3D sodium chloride crystal: a 3 by 3 by 3 grid of alternating sodium (purple, smaller) and chloride (green, larger) ions. Drag to rotate."
    >
      <LatticeScene />
    </Viewport3D>
  );
}
