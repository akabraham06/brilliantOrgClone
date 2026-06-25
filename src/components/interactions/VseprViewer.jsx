/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, intensity, ...) */
import { useEffect, useMemo, useState } from 'react';
import { Vector3, Quaternion } from 'three';
import Viewport3D from './lib/Viewport3D.jsx';
import Formula from './Formula.jsx';
import v from './viz.module.css';

// Tetrahedral frame with one vertex pointing up (methane orientation).
const TOP = [0, 1, 0];
const B0 = [0.9428, -0.3333, 0];
const B1 = [-0.4714, -0.3333, 0.8165];
const B2 = [-0.4714, -0.3333, -0.8165];

/**
 * Each shape is keyed by how many electron domains surround the central atom
 * and how many of those are lone pairs. Bonds and lone pairs both occupy real
 * 3D directions so the molecular shape that remains is geometrically correct.
 */
const SHAPES = {
  linear: { name: 'Linear', angle: '180\u00b0', example: 'CO2', central: 'C', terminal: 'O', bonds: [[1, 0, 0], [-1, 0, 0]], lone: [] },
  trigonal: { name: 'Trigonal planar', angle: '120\u00b0', example: 'BF3', central: 'B', terminal: 'F', bonds: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866]], lone: [] },
  tetrahedral: { name: 'Tetrahedral', angle: '109.5\u00b0', example: 'CH4', central: 'C', terminal: 'H', bonds: [TOP, B0, B1, B2], lone: [] },
  pyramidal: { name: 'Trigonal pyramidal', angle: '107\u00b0', example: 'NH3', central: 'N', terminal: 'H', bonds: [B0, B1, B2], lone: [TOP] },
  bent: { name: 'Bent', angle: '104.5\u00b0', example: 'H2O', central: 'O', terminal: 'H', bonds: [B1, B2], lone: [TOP, B0] },
};
const ORDER = ['linear', 'trigonal', 'tetrahedral', 'pyramidal', 'bent'];

// CPK-ish hex colors aligned with the app's atomColor convention (formula.js),
// resolved to literals because three.js materials can't read CSS custom props.
const ATOM_3D = { H: '#e9edf7', O: '#f472b6', C: '#9aa3b2', N: '#60a5fa', B: '#fb923c', F: '#ffd34e', Na: '#a78bfa', Cl: '#4ade80' };
const colorFor = (sym) => ATOM_3D[sym] || '#60a5fa';

const BOND_LEN = 1.75;
const LONE_LEN = 1.3;
const UP = new Vector3(0, 1, 0);

/** A lit sphere representing one atom. */
function Atom({ position, radius, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
    </mesh>
  );
}

/** A cylinder bond from the central atom (origin) out to `to`. */
function Bond({ to, color = '#c2c9d6' }) {
  const { position, quaternion, length } = useMemo(() => {
    const end = new Vector3(...to);
    const len = end.length() || 1;
    const q = new Quaternion().setFromUnitVectors(UP, end.clone().normalize());
    return { position: end.clone().multiplyScalar(0.5).toArray(), quaternion: [q.x, q.y, q.z, q.w], length: len };
  }, [to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.1, 0.1, length, 20]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

/** A translucent electron cloud lobe sitting where a lone pair points. */
function LonePair({ dir }) {
  const { position, quaternion } = useMemo(() => {
    const d = new Vector3(...dir).normalize();
    const q = new Quaternion().setFromUnitVectors(UP, d);
    return { position: d.clone().multiplyScalar(LONE_LEN).toArray(), quaternion: [q.x, q.y, q.z, q.w] };
  }, [dir]);
  return (
    <mesh position={position} quaternion={quaternion} scale={[0.6, 0.92, 0.6]}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial color="#ffd34e" transparent opacity={0.34} roughness={0.4} emissive="#ffd34e" emissiveIntensity={0.18} depthWrite={false} />
    </mesh>
  );
}

function VseprScene({ shape, showLone }) {
  return (
    <group>
      <Atom position={[0, 0, 0]} radius={0.62} color={colorFor(shape.central)} />
      {shape.bonds.map((dir, i) => {
        const pos = new Vector3(...dir).normalize().multiplyScalar(BOND_LEN).toArray();
        return (
          <group key={`bond-${i}`}>
            <Bond to={pos} />
            <Atom position={pos} radius={0.43} color={colorFor(shape.terminal)} />
          </group>
        );
      })}
      {showLone && shape.lone.map((dir, i) => <LonePair key={`lone-${i}`} dir={dir} />)}
    </group>
  );
}

export default function VseprViewer({ onReady, savedState, onSaveState }) {
  const [shapeKey, setShapeKey] = useState(savedState?.shapeKey || 'tetrahedral');
  const [showLone, setShowLone] = useState(savedState?.showLone ?? true);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shape = SHAPES[shapeKey];

  function pick(next) {
    setShapeKey(next);
    onSaveState?.({ shapeKey: next, showLone });
  }
  function toggleLone() {
    const next = !showLone;
    setShowLone(next);
    onSaveState?.({ shapeKey, showLone: next });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Choose a shape">
        {ORDER.map((key) => (
          <button key={key} type="button" className={shapeKey === key ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => pick(key)}>
            {SHAPES[key].name}
          </button>
        ))}
      </div>

      <Viewport3D
        height={252}
        camera={{ position: [0, 0, 6.4], fov: 45 }}
        label={`Interactive 3D ball-and-stick model of ${shape.name} geometry (${shape.example}), bond angle ${shape.angle}${shape.lone.length ? `, with ${shape.lone.length} lone pair${shape.lone.length > 1 ? 's' : ''}` : ''}. Drag to rotate.`}
      >
        <VseprScene shape={shape} showLone={showLone} />
      </Viewport3D>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.angle}</div>
          <div className={v.statLabel}>bond angle</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.bonds.length}</div>
          <div className={v.statLabel}>bonded atoms</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}>{shape.lone.length}</div>
          <div className={v.statLabel}>lone pairs</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue}><Formula value={shape.example} /></div>
          <div className={v.statLabel}>example</div>
        </div>
      </div>

      <div className={v.row}>
        <button type="button" className={showLone ? `${v.btn} ${v.btnPrimary}` : v.btn} onClick={toggleLone}>
          {showLone ? 'Hide lone pairs' : 'Show lone pairs'}
        </button>
      </div>

      <p className={v.muted}>
        {shape.lone.length > 0
          ? `Drag to rotate. ${shape.name}: ${shape.lone.length} lone pair${shape.lone.length > 1 ? 's' : ''} take up room too and push the bonds closer together, narrowing the angle to about ${shape.angle}.`
          : `Drag to rotate. With ${shape.bonds.length} bonding pairs and no lone pairs, the atoms spread as far apart as possible - a ${shape.name.toLowerCase()} shape at ${shape.angle}.`}
      </p>
    </div>
  );
}
