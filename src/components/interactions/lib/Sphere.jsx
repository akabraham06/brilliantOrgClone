import { useId } from 'react';

/**
 * A 3D-looking atom rendered inside an SVG: a flat color base with a radial
 * overlay that adds a white specular highlight (top-left) and a darker rim.
 * The overlay is color-independent, so any element color reads as a sphere.
 *
 * Use within an <svg>. `color` may be any CSS color or var().
 */
export default function Sphere({
  cx,
  cy,
  r,
  color = 'var(--accent-blue)',
  label,
  labelColor = '#0e0f13',
  glow = false,
  glowColor = 'var(--accent-green)',
  className = '',
  style,
  onClick,
  ariaLabel,
}) {
  const gid = `sph${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const interactive = Boolean(onClick);

  return (
    <g
      className={className}
      style={{ cursor: interactive ? 'pointer' : undefined, ...style }}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      aria-label={ariaLabel}
    >
      <defs>
        <radialGradient id={gid} cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="34%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      {glow && (
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={glowColor} strokeOpacity="0.5" strokeWidth="4" />
      )}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(0,0,0,0.32)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gid})`} />
      {label != null && (
        <text x={cx} y={cy + r * 0.34} textAnchor="middle" fontSize={r} fontWeight="800" fill={labelColor} pointerEvents="none">
          {label}
        </text>
      )}
    </g>
  );
}
