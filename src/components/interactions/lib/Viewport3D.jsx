/* eslint-disable react/no-unknown-property */
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { usePrefersReducedMotion } from './motion.js';
import styles from './Viewport3D.module.css';

/**
 * Shared react-three-fiber viewport for the 3D molecular/lattice interactives
 * (VseprViewer, CovalentShareCanvas geometry view, IonTransferCanvas crystal
 * view). Provides a lit canvas + drag-to-orbit controls and a gentle
 * auto-rotate that is disabled under prefers-reduced-motion.
 *
 * Children are r3f scene contents (meshes, groups, lights as needed). The
 * wrapper supplies sensible default lighting; pass your own inside `children`
 * to override.
 *
 * Accessibility: the canvas is decorative-but-labelled via role="img" +
 * aria-label; components MUST keep a non-3D textual/2D description of the same
 * information elsewhere on the slide for keyboard/screen-reader users.
 */
export default function Viewport3D({
  children,
  height = 240,
  autoRotate = true,
  autoRotateSpeed = 1.1,
  camera = { position: [0, 0, 6], fov: 45 },
  enableZoom = false,
  minPolarAngle,
  maxPolarAngle,
  className = '',
  label,
}) {
  const reduce = usePrefersReducedMotion();
  return (
    <div className={`${styles.viewport} ${className}`} style={{ height }} role="img" aria-label={label}>
      <Canvas camera={camera} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.05} />
        <directionalLight position={[-5, -3, -4]} intensity={0.35} />
        <Suspense fallback={null}>{children}</Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={enableZoom}
          autoRotate={autoRotate && !reduce}
          autoRotateSpeed={autoRotateSpeed}
          enableDamping
          dampingFactor={0.12}
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
        />
      </Canvas>
    </div>
  );
}
