/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, ...) */
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import Viewport3D from './lib/Viewport3D.jsx';
import { usePrefersReducedMotion } from './lib/motion.js';
import v from './viz.module.css';

const D_MIN = 0.2;
const D_MAX = 3.0;
const WATER = 1.0;

// Tank geometry: water surface sits at y = 0, tank bottom at y = -WATER_DEPTH.
const HALF = 1.55;
const WATER_DEPTH = 2.4;
const TANK_BOTTOM = -WATER_DEPTH;
const CUBE = 1.0;

/** Resting cube-center height for a given density (water = 1.0). */
function restingY(density) {
  if (density <= WATER) {
    // Floating: fraction submerged = density; top stays above the surface until
    // density reaches 1.0, where it is exactly fully submerged.
    return CUBE * (0.5 - density);
  }
  // Denser than water: settles on the tank floor.
  return TANK_BOTTOM + CUBE / 2;
}

function verdictFor(density) {
  if (Math.abs(density - WATER) < 0.05) return { text: 'Neutral - same density as water', color: 'var(--accent-yellow)', hex: '#facc15' };
  if (density < WATER) return { text: 'Floats', color: 'var(--accent-green)', hex: '#4ade80' };
  return { text: 'Sinks', color: 'var(--accent-orange)', hex: '#fb923c' };
}

/** The adjustable object cube that animates to its resting buoyant height. */
function ObjectCube({ density, color }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef(null);
  const baseY = useRef(restingY(density));
  const target = restingY(density);
  const floating = density < WATER - 0.05;

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (reduce) {
      // Static correct frame: rest exactly at the buoyant height, no bobbing.
      baseY.current = target;
      mesh.position.y = target;
      return;
    }
    const k = Math.min(1, delta * 4);
    baseY.current += (target - baseY.current) * k;
    const bob = floating ? Math.sin(state.clock.elapsedTime * 1.6) * 0.05 : 0;
    mesh.position.y = baseY.current + bob;
  });

  return (
    <mesh ref={ref} position={[0, target, 0]}>
      <boxGeometry args={[CUBE, CUBE, CUBE]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.08} />
    </mesh>
  );
}

/** Semi-transparent water volume + a glass tank outline. */
function Tank() {
  return (
    <group>
      <mesh position={[0, -WATER_DEPTH / 2, 0]}>
        <boxGeometry args={[HALF * 2, WATER_DEPTH, HALF * 2]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.26} roughness={0.1} />
      </mesh>
      {/* bright waterline at the surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.35} />
      </mesh>
      {/* glass tank edges */}
      <mesh position={[0, -WATER_DEPTH / 2, 0]}>
        <boxGeometry args={[HALF * 2 + 0.06, WATER_DEPTH + 0.06, HALF * 2 + 0.06]} />
        <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/**
 * 3D float/sink density explorer. A semi-transparent tank of water holds an
 * object cube whose density is adjustable. Below water (density < 1) it floats
 * partly above the surface; equal to water it is neutrally buoyant; denser than
 * water it sinks to the bottom. Reduced motion renders the cube statically at
 * its correct resting height.
 */
export default function DensityFloat3D({ onReady, savedState, onSaveState }) {
  const [density, setDensity] = useState(savedState?.density ?? 0.6);

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function change(value) {
    setDensity(value);
    onSaveState?.({ density: value });
  }

  const verdict = verdictFor(density);
  const label = `A glass tank of water. An object cube with density ${density.toFixed(1)} grams per cubic centimeter ${verdict.text.toLowerCase()} relative to water at 1.0. Drag to rotate the view.`;

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.objective}>
        <strong>Float or sink?</strong> Change the cube&rsquo;s density and compare it to water (1.0 g/cm&sup3;).
      </div>

      <div className={v.panel} style={{ padding: 'var(--space-2)' }}>
        <Viewport3D
          height={260}
          autoRotate={false}
          camera={{ position: [3.6, 1.9, 4.2], fov: 45 }}
          label={label}
        >
          {/* Tank spans y=0 (surface) down to y=-2.4; lift the whole scene so its
              visible center sits at the origin the camera orbits, keeping it
              centered in the viewport instead of sitting low. */}
          <group position={[0, 1.05, 0]}>
            <Tank />
            <ObjectCube density={density} color={verdict.hex} />
          </group>
        </Viewport3D>
      </div>

      <div className={v.legend}>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: '#38bdf8' }} /> water (1.0 g/cm&sup3;)</span>
        <span className={v.legendItem}><span className={v.legendDot} style={{ background: verdict.hex }} /> object cube</span>
      </div>

      <div className={v.readout}>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: verdict.color }}>{density.toFixed(1)}</div>
          <div className={v.statLabel}>object density (g/cm&sup3;)</div>
        </div>
        <div className={v.stat}>
          <div className={v.statValue} style={{ color: verdict.color }}>{verdict.text}</div>
          <div className={v.statLabel}>vs water = 1.0</div>
        </div>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 360, alignItems: 'center' }}>
        <span className={v.statLabel}>Object density: <strong>{density.toFixed(1)} g/cm&sup3;</strong></span>
        <input
          className={v.slider}
          type="range"
          min={D_MIN}
          max={D_MAX}
          step={0.1}
          value={density}
          onChange={(e) => change(Number(e.target.value))}
          aria-label="Object density in grams per cubic centimeter"
        />
      </label>

      <p role="status" aria-live="polite" className={v.muted} style={{ textAlign: 'center', color: verdict.color, fontWeight: 700 }}>
        {density < WATER - 0.05
          ? 'Less dense than water - it floats, riding partly above the surface.'
          : density > WATER + 0.05
            ? 'Denser than water - it sinks to the bottom.'
            : 'Equal to water - neutrally buoyant, hovering fully submerged.'}
      </p>
    </div>
  );
}
