/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeSpriteTexture } from './heatSprite.js';
import { HEAT } from './heatPalette.js';

const TOP = 5.2;
const BOTTOM = -3.6;

/**
 * Rising-ember particle field. Particles spawn near a tight base, drift upward
 * while swaying, cool from white/gold to deep red as they rise, then recycle
 * to the bottom. Built on a single <points> cloud with additive blending so it
 * reads as a glowing flame/heat plume. Colors track the shared heat palette so
 * the intro matches the live-round heat field.
 */
function Embers({ count = 280 }) {
  const pointsRef = useRef();
  const texture = useMemo(makeSpriteTexture, []);

  const { positions, colors, particles } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const list = [];
    for (let i = 0; i < count; i += 1) {
      const radius = Math.pow(Math.random(), 0.55) * 1.7;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = BOTTOM + Math.random() * (TOP - BOTTOM);
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = 1;
      col[i * 3 + 1] = 0.6;
      col[i * 3 + 2] = 0.2;
      list.push({
        baseX: x,
        baseZ: z,
        speed: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        sway: 0.12 + Math.random() * 0.4,
      });
    }
    return { positions: pos, colors: col, particles: list };
  }, [count]);

  useFrame((state, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const pos = geom.attributes.position.array;
    const col = geom.attributes.color.array;
    const span = TOP - BOTTOM;
    for (let i = 0; i < count; i += 1) {
      const p = particles[i];
      let y = pos[i * 3 + 1] + p.speed * dt;
      if (y > TOP) y = BOTTOM - Math.random() * 0.6;
      pos[i * 3] = p.baseX + Math.sin(t * 1.3 + p.phase) * p.sway;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = p.baseZ + Math.cos(t * 1.1 + p.phase) * p.sway;

      // life: 0 at base (hot, white/gold) -> 1 at top (cool, deep red).
      const life = Math.min(1, Math.max(0, (y - BOTTOM) / span));
      col[i * 3] = 1;
      col[i * 3 + 1] = Math.max(0.08, 0.82 - life * 0.72);
      col[i * 3 + 2] = Math.max(0, 0.4 - life * 0.55);
    }
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
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

/** Pulsing warm glow anchored at the base of the plume (ember orange token). */
function CoreGlow() {
  const ref = useRef();
  const texture = useMemo(makeSpriteTexture, []);
  useFrame((state) => {
    const sprite = ref.current;
    if (!sprite) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.14;
    sprite.scale.setScalar(4.4 * pulse);
  });
  return (
    <sprite ref={ref} position={[0, -2.4, -0.5]}>
      <spriteMaterial
        map={texture}
        color={HEAT.ember}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </sprite>
  );
}

/** Wide, slow deep-red bloom low behind the plume to ground it in the charcoal. */
function BaseBloom() {
  const ref = useRef();
  const texture = useMemo(makeSpriteTexture, []);
  useFrame((state) => {
    const sprite = ref.current;
    if (!sprite) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.1 + 1) * 0.06;
    sprite.scale.set(11 * pulse, 7 * pulse, 1);
  });
  return (
    <sprite ref={ref} position={[0, -3.4, -2.5]}>
      <spriteMaterial
        map={texture}
        color={HEAT.deepRed}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.32}
      />
    </sprite>
  );
}

/**
 * Full-canvas three.js lead-in for the Heat Check intro. Lazy-loaded (see
 * HeatCheck.jsx) so three / @react-three/fiber stay out of the initial bundle,
 * and only mounted when prefers-reduced-motion is NOT set and WebGL is present.
 */
export default function HeatIntroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 8.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <BaseBloom />
      <CoreGlow />
      <Embers />
    </Canvas>
  );
}
