/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeSpriteTexture } from './heatSprite.js';
import { HEAT, TIER_LEVEL } from './heatPalette.js';

/*
 * Ambient WebGL "heat field" that sits BEHIND the live-round panel. It is a
 * slow, depth-distributed ember field plus a soft volumetric glow whose
 * intensity, speed and color temperature ramp up with the current streak tier
 * (cold -> warm -> hot -> blaze). The scene eases toward the target level every
 * frame so the backdrop breathes with the player's combo rather than snapping.
 *
 * Lazy-loaded from HeatCheck.jsx (keeps three / r3f out of the initial bundle)
 * and only mounted when reduced motion is OFF and WebGL is available; the CSS
 * gradient/aura is the fallback in every other case.
 */

const COUNT = 150;
const X_SPREAD = 7.5;
const Y_TOP = 4.8;
const Y_BOTTOM = -4.8;
const Z_BACK = -4;
const Z_FRONT = 1.5;

const SPAN = Y_TOP - Y_BOTTOM;

/** Depth-distributed ember field that rises, sways and recycles. */
function HeatField({ levelRef }) {
  const pointsRef = useRef();
  const texture = useMemo(makeSpriteTexture, []);
  const cur = useRef(TIER_LEVEL.cold);

  const { positions, colors, particles } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const list = [];
    for (let i = 0; i < COUNT; i += 1) {
      const x = (Math.random() * 2 - 1) * X_SPREAD;
      const y = Y_BOTTOM + Math.random() * SPAN;
      const z = Z_BACK + Math.random() * (Z_FRONT - Z_BACK);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = 1;
      col[i * 3 + 1] = 0.6;
      col[i * 3 + 2] = 0.25;
      list.push({
        baseX: x,
        speed: 0.5 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        sway: 0.1 + Math.random() * 0.35,
        twinkle: 0.6 + Math.random() * 0.8,
      });
    }
    return { positions: pos, colors: col, particles: list };
  }, []);

  useFrame((state, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const dt = Math.min(delta, 0.05);
    // Ease the live "heat level" toward the tier target (combo-driven).
    cur.current += (levelRef.current - cur.current) * Math.min(1, dt * 2.4);
    const level = cur.current;
    const t = state.clock.elapsedTime;

    const rise = 0.35 + level * 1.3; // faster plume when hotter
    const bright = 0.42 + level * 0.72; // brighter embers when hotter
    const redShift = Math.max(0, (level - 0.5) * 2); // push toward deep red at blaze

    const pos = geom.attributes.position.array;
    const col = geom.attributes.color.array;
    for (let i = 0; i < COUNT; i += 1) {
      const p = particles[i];
      let y = pos[i * 3 + 1] + p.speed * rise * dt;
      if (y > Y_TOP) y = Y_BOTTOM - Math.random() * 0.8;
      pos[i * 3] = p.baseX + Math.sin(t * (0.7 + p.twinkle * 0.3) + p.phase) * p.sway;
      pos[i * 3 + 1] = y;

      // life: 0 near base (gold/white hot) -> 1 at top (cooled, deep red).
      const life = Math.min(1, Math.max(0, (y - Y_BOTTOM) / SPAN));
      const flick = 0.85 + Math.sin(t * 3 * p.twinkle + p.phase) * 0.15;
      const b = bright * flick;
      col[i * 3] = b;
      // green channel: gold near base -> low at top, pulled lower at blaze.
      col[i * 3 + 1] = Math.max(0.05, b * (0.78 - life * 0.6 - redShift * 0.12));
      col[i * 3 + 2] = Math.max(0, b * (0.42 - life * 0.5));
    }
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.55}
        map={texture}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/** Soft volumetric glow centered behind the panel; scales/colors with heat. */
function VolumetricGlow({ levelRef }) {
  const ref = useRef();
  const matRef = useRef();
  const texture = useMemo(makeSpriteTexture, []);
  const cur = useRef(TIER_LEVEL.cold);
  const warm = useMemo(() => new THREE.Color(HEAT.ember), []);
  const blaze = useMemo(() => new THREE.Color(HEAT.deepRed), []);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    cur.current += (levelRef.current - cur.current) * 0.045;
    const level = cur.current;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.3) * 0.05;
    const scale = (6.5 + level * 3.4) * pulse;
    ref.current.scale.set(scale * 1.35, scale, 1);
    matRef.current.opacity = 0.1 + level * 0.42;
    matRef.current.color.copy(warm).lerp(blaze, Math.max(0, (level - 0.5) * 2));
  });

  return (
    <sprite ref={ref} position={[0, -0.6, -3]}>
      <spriteMaterial
        ref={matRef}
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.2}
      />
    </sprite>
  );
}

export default function HeatFieldScene({ tier = 'cold' }) {
  // Store the tier target in a ref so the inner useFrame loops ease toward it
  // without remounting the Canvas when the combo changes.
  const levelRef = useRef(TIER_LEVEL[tier] ?? TIER_LEVEL.cold);
  levelRef.current = TIER_LEVEL[tier] ?? TIER_LEVEL.cold;

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
    >
      <VolumetricGlow levelRef={levelRef} />
      <HeatField levelRef={levelRef} />
    </Canvas>
  );
}
