/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import Viewport3D from './Viewport3D.jsx';
import { usePrefersReducedMotion } from './motion.js';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/*
 * Inner animated field. Must live inside the r3f <Canvas> (so useFrame works).
 * Renders `count` GPU-instanced spheres and moves them every frame per `mode`:
 *  - 'still'   : fixed positions (no per-frame motion)
 *  - 'vibrate' : small oscillation around a home position (solid lattice)
 *  - 'flow'    : slow drift with soft wall bounce (liquid)
 *  - 'random'  : faster brownian motion + bounce (gas)
 * All motion pauses under prefers-reduced-motion.
 */
function Field({ count, mode, bounds, color, radius, speed }) {
  const reduce = usePrefersReducedMotion();
  const refs = useRef([]);
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i += 1) {
      const home = [
        rand(-bounds[0], bounds[0]),
        rand(-bounds[1], bounds[1]),
        rand(-bounds[2], bounds[2]),
      ];
      arr.push({
        home,
        pos: [...home],
        vel: [rand(-1, 1) * speed, rand(-1, 1) * speed, rand(-1, 1) * speed],
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count, bounds, speed]);

  useFrame((state, delta) => {
    if (reduce || mode === 'still') return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < data.length; i += 1) {
      const p = data[i];
      const ref = refs.current[i];
      if (!ref) continue;
      if (mode === 'vibrate') {
        const a = radius * 0.7;
        ref.position.set(
          p.home[0] + Math.sin(t * 2 + p.phase) * a,
          p.home[1] + Math.cos(t * 2.4 + p.phase) * a,
          p.home[2] + Math.sin(t * 1.7 + p.phase) * a,
        );
      } else {
        for (let d = 0; d < 3; d += 1) {
          p.pos[d] += p.vel[d] * dt;
          if (p.pos[d] > bounds[d]) {
            p.pos[d] = bounds[d];
            p.vel[d] *= -1;
          } else if (p.pos[d] < -bounds[d]) {
            p.pos[d] = -bounds[d];
            p.vel[d] *= -1;
          }
        }
        if (mode === 'random') {
          const max = speed * 2.4;
          for (let d = 0; d < 3; d += 1) {
            p.vel[d] += rand(-1, 1) * speed * dt * 5;
            p.vel[d] = Math.max(-max, Math.min(max, p.vel[d]));
          }
        }
        ref.position.set(p.pos[0], p.pos[1], p.pos[2]);
      }
    }
  });

  return (
    <Instances limit={count} range={count}>
      <sphereGeometry args={[radius, 18, 18]} />
      <meshStandardMaterial roughness={0.35} metalness={0.05} color={color} />
      {data.map((p, i) => (
        <Instance
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={p.home}
        />
      ))}
    </Instances>
  );
}

/**
 * Shared GPU-instanced 3D particle field for matter / gas / solution scenes.
 * Wraps Viewport3D and draws an optional wireframe container box so particles
 * read as "inside" a vessel. Reuse this instead of hand-rolling canvas/SVG
 * particle systems. All animation is reduced-motion gated (via Field).
 */
export default function ParticleField3D({
  count = 40,
  mode = 'random',
  bounds = [2.4, 1.6, 2.4],
  color = '#60a5fa',
  radius = 0.18,
  speed = 0.6,
  height = 240,
  autoRotate = false,
  label = 'Animated 3D particle field',
  showBox = true,
  boxColor = '#94a3b8',
  boxOpacity = 0.25,
  camera = { position: [0, 0, 8], fov: 45 },
  children,
}) {
  return (
    <Viewport3D height={height} autoRotate={autoRotate} label={label} camera={camera}>
      {showBox && (
        <mesh>
          <boxGeometry args={[bounds[0] * 2, bounds[1] * 2, bounds[2] * 2]} />
          <meshBasicMaterial color={boxColor} wireframe transparent opacity={boxOpacity} />
        </mesh>
      )}
      <Field count={count} mode={mode} bounds={bounds} color={color} radius={radius} speed={speed} />
      {children}
    </Viewport3D>
  );
}
