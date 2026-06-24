import { useRef, useState } from 'react';
import { useRaf } from './motion.js';
import styles from './Scene3D.module.css';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * A drag-to-rotate 3D viewport using CSS 3D transforms. Children are laid out
 * in a preserve-3d space (position them with translateZ). Auto-rotates gently
 * until the user interacts; honors reduced motion via useRaf.
 */
export default function Scene3D({ children, height = 220, autoRotate = true, className = '', label }) {
  const [rot, setRot] = useState({ x: -14, y: 0 });
  const drag = useRef(null);
  const interacted = useRef(false);

  useRaf(
    (dt) => {
      if (interacted.current || drag.current) return;
      setRot((p) => ({ ...p, y: p.y + dt * 0.02 }));
    },
    autoRotate,
  );

  function down(e) {
    interacted.current = true;
    drag.current = { sx: e.clientX, sy: e.clientY, rx: rot.x, ry: rot.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function move(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    setRot({ x: clamp(drag.current.rx - dy * 0.4, -80, 80), y: drag.current.ry + dx * 0.4 });
  }
  function up() {
    drag.current = null;
  }

  return (
    <div
      className={`${styles.viewport} ${className}`}
      style={{ height }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={label}
    >
      <div className={styles.inner} style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
        {children}
      </div>
    </div>
  );
}
