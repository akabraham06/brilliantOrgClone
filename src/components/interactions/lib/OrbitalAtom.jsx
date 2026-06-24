import { useRef, useState } from 'react';
import { useRaf } from './motion.js';
import { rotateProject, ringPoint, spherePack, depthOpacity } from './threed.js';

const SHELL_TILT = [0.5, -0.45, 0.7, -0.6];
const SHELL_SPEED = [1.0, 0.72, 0.55, 0.44];
const PROTON = 'var(--accent-orange)';
const NEUTRON = '#8b93a7';
const ELECTRON = 'var(--accent-blue)';
const VALENCE = 'var(--accent-yellow)';

/**
 * A pseudo-3D atom drawn in one SVG: a golden-spiral nucleus of proton/neutron
 * spheres and electrons revolving on tilted orbital rings. Depth is faked with
 * perspective scaling + opacity. Drag to rotate the camera; it auto-rotates and
 * the electrons revolve until the user interacts. A single shared radial
 * gradient shades every sphere (cheap, scales to each circle).
 */
export default function OrbitalAtom({
  protons = 0,
  neutrons = 0,
  shells = [],
  symbol,
  size = 240,
  outerHighlight = false,
  glow = false,
  autoRotate = true,
  ariaLabel,
}) {
  const [cam, setCam] = useState({ ax: -0.32, ay: 0.4 });
  const [phase, setPhase] = useState(0);
  const drag = useRef(null);
  const interacted = useRef(false);

  useRaf((dt) => {
    setPhase((p) => p + dt * 0.0011);
    if (autoRotate && !interacted.current && !drag.current) {
      setCam((c) => ({ ...c, ay: c.ay + dt * 0.00028 }));
    }
  });

  function down(e) {
    interacted.current = true;
    drag.current = { sx: e.clientX, sy: e.clientY, ...cam };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function move(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    setCam({
      ax: Math.min(1.3, Math.max(-1.3, drag.current.ax - dy * 0.01)),
      ay: drag.current.ay + dx * 0.01,
    });
  }
  function up() {
    drag.current = null;
  }

  const c = size / 2;
  const nucCount = protons + neutrons;
  const nucRadius = Math.min(size * 0.17, 9 + Math.sqrt(nucCount) * 4.2);
  const baseShell = nucRadius + 26;
  const shellR = shells.map((_, i) => baseShell + i * 28);
  const maxR = (shellR[shellR.length - 1] || nucRadius) + 6;

  // Build nucleus spheres (interleave protons/neutrons for a mixed look).
  const nucleus = [];
  const offs = spherePack(nucCount, nucRadius);
  let pUsed = 0;
  let nUsed = 0;
  offs.forEach(([x, y, z], i) => {
    let type;
    if (i % 2 === 0 && pUsed < protons) {
      type = 'p';
      pUsed += 1;
    } else if (nUsed < neutrons) {
      type = 'n';
      nUsed += 1;
    } else {
      type = 'p';
      pUsed += 1;
    }
    const wob = Math.sin(phase * 3 + i) * 0.8;
    const pr = rotateProject(x + wob, y - wob, z, cam.ax, cam.ay);
    nucleus.push({ ...pr, r: nucRadius < 12 ? 7 : 6, color: type === 'p' ? PROTON : NEUTRON, kind: 'nuc' });
  });

  // Build electron spheres on tilted, revolving rings.
  const electrons = [];
  shells.forEach((count, i) => {
    const R = shellR[i];
    const tilt = SHELL_TILT[i % SHELL_TILT.length];
    const speed = SHELL_SPEED[i % SHELL_SPEED.length];
    const isOuter = outerHighlight && i === shells.length - 1;
    for (let j = 0; j < count; j += 1) {
      const a = phase * speed + (j / count) * Math.PI * 2 + i * 0.7;
      const lp = ringPoint(R, a, tilt);
      const pr = rotateProject(lp.x, lp.y, lp.z, cam.ax, cam.ay);
      electrons.push({ ...pr, r: 5, color: isOuter ? VALENCE : ELECTRON, kind: 'e' });
    }
  });

  const spheres = [...nucleus, ...electrons].sort((a, b) => a.z - b.z);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ display: 'block', touchAction: 'none', cursor: 'grab', maxWidth: size + 40 }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={ariaLabel || `${symbol || 'atom'} model`}
    >
      <defs>
        <radialGradient id="oa-shade" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="34%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </radialGradient>
        {glow && (
          <filter id="oa-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* orbital rings (drawn behind everything, faint) */}
      <g opacity="0.5">
        {shells.map((_, i) => {
          const R = shellR[i];
          const tilt = SHELL_TILT[i % SHELL_TILT.length];
          let d = '';
          for (let k = 0; k <= 48; k += 1) {
            const lp = ringPoint(R, (k / 48) * Math.PI * 2, tilt);
            const pr = rotateProject(lp.x, lp.y, lp.z, cam.ax, cam.ay);
            d += `${k === 0 ? 'M' : 'L'} ${c + pr.x} ${c + pr.y} `;
          }
          return <path key={i} d={d} fill="none" stroke="var(--color-border-strong)" strokeWidth="1.2" />;
        })}
      </g>

      <g filter={glow ? 'url(#oa-glow)' : undefined}>
        {spheres.map((s, i) => (
          <g key={i} opacity={depthOpacity(s.z, maxR)}>
            <circle cx={c + s.x} cy={c + s.y} r={s.r * s.s} fill={s.color} stroke="rgba(0,0,0,0.32)" />
            <circle cx={c + s.x} cy={c + s.y} r={s.r * s.s} fill="url(#oa-shade)" />
          </g>
        ))}
      </g>

      {symbol && (
        <text x={c} y={c + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--color-text)" pointerEvents="none" opacity="0.92">
          {symbol}
        </text>
      )}
    </svg>
  );
}
