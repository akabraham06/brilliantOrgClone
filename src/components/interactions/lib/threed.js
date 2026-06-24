/** Lightweight 3D helpers for SVG "fake 3D": rotate a point by camera angles
 *  (around Y then X) and project orthographically with mild perspective. */
export function rotateProject(x, y, z, ax, ay, persp = 540) {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y1 = y;
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y2 = y1 * cx - z1 * sx;
  const z2 = y1 * sx + z1 * cx;
  const s = persp / (persp - z2);
  return { x: x1 * s, y: y2 * s, z: z2, s };
}

/** A point on a circle of `radius` (in its own plane) tilted around X by `tilt`. */
export function ringPoint(radius, angle, tilt) {
  const lx = radius * Math.cos(angle);
  const ly = radius * Math.sin(angle);
  return { x: lx, y: ly * Math.cos(tilt), z: ly * Math.sin(tilt) };
}

/** Deterministic near-uniform packing of `count` points in a sphere of `radius`
 *  (golden-spiral), used for nucleus clusters. */
export function spherePack(count, radius) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = phi * i;
    pts.push([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius]);
  }
  return pts;
}

/** Map a projected z (roughly [-R, R]) to an opacity in [min, 1] for depth cue. */
export function depthOpacity(z, range, min = 0.5) {
  const n = (z + range) / (2 * range || 1);
  return min + Math.min(1, Math.max(0, n)) * (1 - min);
}
