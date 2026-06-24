import { useEffect, useRef, useState } from 'react';
import Sphere from './lib/Sphere.jsx';
import Scene3D from './lib/Scene3D.jsx';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';
import styles from './IonTransferCanvas.module.css';

const VBW = 320;
const VBH = 180;
const NA = 'var(--accent-purple)';
const CL = 'var(--accent-green)';

/**
 * Ionic bonding: drag sodium's lone valence electron onto chlorine. The
 * electron leaves a fading trail, sodium becomes Na+ and chlorine Cl-, the
 * charge meter updates, and the ions spring together into NaCl. A "view
 * crystal" toggle reveals a rotatable 3D NaCl lattice.
 */
export default function IonTransferCanvas({ onReady }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const [trail, setTrail] = useState([]);
  const [transferred, setTransferred] = useState(false);
  const [lattice, setLattice] = useState(false);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (transferred) return;
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

            {/* draggable electron */}
            {!transferred && (
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
        <button type="button" className={v.btn} onClick={() => commit(!transferred)}>
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

/** A small rotatable 3x3x3 NaCl lattice built from CSS spheres in a Scene3D. */
function NaClLattice() {
  const cells = [];
  const n = 3;
  const s = 34;
  for (let i = 0; i < n; i += 1)
    for (let j = 0; j < n; j += 1)
      for (let k = 0; k < n; k += 1) {
        const isNa = (i + j + k) % 2 === 0;
        cells.push({ i, j, k, isNa });
      }
  return (
    <Scene3D height={240} label="Rotatable sodium chloride crystal lattice">
      <div className={styles.lattice}>
        {cells.map(({ i, j, k, isNa }) => (
          <div
            key={`${i}-${j}-${k}`}
            className={`${styles.ion3d} ${isNa ? styles.ionNa : styles.ionCl}`}
            style={{ transform: `translate3d(${(i - 1) * s}px, ${(j - 1) * s}px, ${(k - 1) * s}px)` }}
          >
            {isNa ? 'Na' : 'Cl'}
          </div>
        ))}
      </div>
    </Scene3D>
  );
}
