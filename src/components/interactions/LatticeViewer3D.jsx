/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, scale, ...) */
import { useEffect } from 'react';
import { Instances, Instance } from '@react-three/drei';
import Viewport3D from './lib/Viewport3D.jsx';
import v from './viz.module.css';

// Accent tokens can't be read by three.js materials, so mirror the hex values
// used by IonTransferCanvas's lattice (Na+ purple, Cl- green).
const NA_HEX = '#a78bfa';
const CL_HEX = '#4ade80';

// 4x4x4 alternating Na+/Cl- ions. Na+ is drawn smaller than Cl-, like real salt.
const GRID = 4;
const SPACING = 1.05;
const IONS = (() => {
  const cells = [];
  const c = (GRID - 1) / 2;
  for (let i = 0; i < GRID; i += 1)
    for (let j = 0; j < GRID; j += 1)
      for (let k = 0; k < GRID; k += 1) {
        const isNa = (i + j + k) % 2 === 0;
        cells.push({
          key: `${i}-${j}-${k}`,
          position: [(i - c) * SPACING, (j - c) * SPACING, (k - c) * SPACING],
          scale: isNa ? 0.42 : 0.6,
          color: isNa ? NA_HEX : CL_HEX,
        });
      }
  return cells;
})();

/** Instanced spheres for the NaCl lattice (one draw call). */
function LatticeScene() {
  return (
    <Instances limit={IONS.length} range={IONS.length}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial roughness={0.35} metalness={0.05} />
      {IONS.map((ion) => (
        <Instance key={ion.key} position={ion.position} scale={ion.scale} color={ion.color} />
      ))}
    </Instances>
  );
}

/**
 * Standalone rotatable 3D sodium chloride crystal lattice. A 4x4x4 grid of
 * alternating sodium (Na+, purple, smaller) and chloride (Cl-, green, larger)
 * ions shows how ionic compounds extend into a repeating 3D pattern rather than
 * forming discrete molecules. Auto-rotate is disabled under reduced motion by
 * Viewport3D; the user can always drag to orbit.
 */
export default function LatticeViewer3D({ onReady }) {
  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Explore:</strong> drag to rotate the salt crystal. Notice that every Na<sup>+</sup> is
        surrounded by Cl<sup>&minus;</sup> neighbours (and vice versa) in a repeating 3D grid.
      </div>

      <Viewport3D
        height={280}
        camera={{ position: [4.4, 3.6, 5.2], fov: 45 }}
        label="Interactive 3D sodium chloride crystal: a 4 by 4 by 4 grid of alternating sodium (purple, smaller) and chloride (green, larger) ions, packed in a repeating cubic pattern. Drag to rotate."
      >
        <LatticeScene />
      </Viewport3D>

      <div className={v.legend} aria-hidden="true">
        <span className={v.legendItem}>
          <span className={v.legendDot} style={{ background: NA_HEX }} /> Na<sup>+</sup> (sodium)
        </span>
        <span className={v.legendItem}>
          <span className={v.legendDot} style={{ background: CL_HEX }} /> Cl<sup>&minus;</sup> (chloride)
        </span>
      </div>

      <p className={v.muted} style={{ textAlign: 'center', maxWidth: 440 }}>
        Table salt isn&rsquo;t made of separate NaCl molecules. Each ion locks into a repeating grid
        where opposite charges alternate in every direction &mdash; this regular pattern is what gives
        salt its cube-shaped crystals.
      </p>
    </div>
  );
}
