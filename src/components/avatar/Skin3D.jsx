/* eslint-disable react/no-unknown-property -- react-three-fiber intrinsics use three.js props (position, args, intensity, ...) */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { usePrefersReducedMotion } from '../interactions/lib/motion.js';
import { SKIN_3D } from './skins3d.js';

/**
 * Lazy-loaded, fully-3D avatar skin: a stylized gummy "blob-human" rendered with
 * react-three-fiber. Idle rotation + bob, soft aurora lighting, and a glossy
 * distorted material. Honors prefers-reduced-motion by freezing all motion (and
 * switching the canvas to on-demand rendering) so it presents a static frame.
 *
 * This module is the ONLY place three.js is pulled into the avatar, and it is
 * imported via React.lazy from Avatar.jsx — keeping it out of the main bundle.
 */
function Blob({ skin, reduce }) {
  const group = useRef();
  useFrame((state) => {
    if (reduce || !group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.45) * 0.55;
    group.current.position.y = Math.sin(t * 1.15) * 0.07;
  });

  return (
    <group ref={group}>
      {/* Body — a soft, slightly tall gummy blob */}
      <mesh scale={[1, 1.16, 1]} castShadow>
        <sphereGeometry args={[1.12, 96, 96]} />
        <MeshDistortMaterial
          color={skin.colorB}
          distort={reduce ? 0.08 : 0.26}
          speed={reduce ? 0 : 1.5}
          roughness={0.22}
          metalness={0.18}
          clearcoat={1}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.33, 0.2, 1.0]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#2a3340" roughness={0.35} />
      </mesh>
      <mesh position={[0.33, 0.2, 1.0]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#2a3340" roughness={0.35} />
      </mesh>
      {/* Tiny eye glints */}
      <mesh position={[-0.29, 0.26, 1.12]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.37, 0.26, 1.12]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function Skin3D({ skinId, size = 240 }) {
  const reduce = usePrefersReducedMotion();
  const skin = SKIN_3D[skinId] || Object.values(SKIN_3D)[0];

  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.1], fov: 42 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        frameloop={reduce ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 5]} intensity={1.15} />
        <pointLight position={[-3.5, 1.5, 2.5]} intensity={2.4} color={skin.colorC} />
        <pointLight position={[3.5, -1.5, 2]} intensity={1.9} color={skin.colorA} />
        <pointLight position={[0, 2.5, 1]} intensity={1.2} color={skin.glow} />
        <Blob skin={skin} reduce={reduce} />
      </Canvas>
    </div>
  );
}
