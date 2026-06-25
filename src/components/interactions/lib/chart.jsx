/* eslint-disable react-refresh/only-export-components */
/*
 * Tiny dependency-free charting primitives for the interactive graphs.
 *
 * Everything works in SVG user units inside a fixed viewBox so charts scale
 * responsively. `makeScale` maps data -> pixels (and back via .invert), and
 * `ChartFrame` renders gridlines, axes, ticks, and axis labels, then hands the
 * x/y scales to its children via a render prop so each graph plots itself.
 */

/** Linear scale: maps a value in `domain` to a coordinate in `range`. */
export function makeScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const m = (r1 - r0) / span;
  const fn = (v) => r0 + (v - d0) * m;
  fn.invert = (p) => d0 + (p - r0) / m;
  fn.domain = domain;
  fn.range = range;
  return fn;
}

/** A handful of "nice" round tick values spanning [min, max]. */
export function niceTicks(min, max, count = 5) {
  if (min === max) return [min];
  const rawStep = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  step *= mag;
  const start = Math.ceil(min / step) * step;
  const out = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    out.push(Math.round(v * 1e6) / 1e6);
  }
  return out;
}

/** Convert a pointer event to viewBox coordinates for the given <svg> element. */
export function svgPointFromEvent(evt, svgEl) {
  if (!svgEl) return { x: 0, y: 0 };
  const pt = svgEl.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

const AXIS = 'var(--color-border-strong)';
const GRID = 'var(--color-border)';
const TEXT = 'var(--color-text-subtle)';

/**
 * Renders the axes/grid for a chart and provides x/y pixel scales to children.
 *
 * children: (xScale, yScale) => ReactNode
 */
export function ChartFrame({
  width = 320,
  height = 210,
  padding = { l: 42, r: 14, t: 14, b: 38 },
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  xLabel,
  yLabel,
  formatX = (v) => `${v}`,
  formatY = (v) => `${v}`,
  ariaLabel,
  svgRef,
  onPointer,
  children,
}) {
  const x = makeScale(xDomain, [padding.l, width - padding.r]);
  const y = makeScale(yDomain, [height - padding.b, padding.t]);
  const xt = xTicks || niceTicks(xDomain[0], xDomain[1], 5);
  const yt = yTicks || niceTicks(yDomain[0], yDomain[1], 5);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ height: 'auto', display: 'block', touchAction: 'none' }}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
    >
      {/* horizontal gridlines + y ticks */}
      {yt.map((t) => (
        <g key={`y${t}`}>
          <line x1={padding.l} y1={y(t)} x2={width - padding.r} y2={y(t)} stroke={GRID} strokeWidth="1" />
          <text x={padding.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="9" fill={TEXT}>{formatY(t)}</text>
        </g>
      ))}
      {/* x ticks */}
      {xt.map((t) => (
        <g key={`x${t}`}>
          <line x1={x(t)} y1={height - padding.b} x2={x(t)} y2={height - padding.b + 4} stroke={AXIS} strokeWidth="1" />
          <text x={x(t)} y={height - padding.b + 15} textAnchor="middle" fontSize="9" fill={TEXT}>{formatX(t)}</text>
        </g>
      ))}
      {/* axes */}
      <line x1={padding.l} y1={padding.t} x2={padding.l} y2={height - padding.b} stroke={AXIS} strokeWidth="1.5" />
      <line x1={padding.l} y1={height - padding.b} x2={width - padding.r} y2={height - padding.b} stroke={AXIS} strokeWidth="1.5" />
      {/* axis labels */}
      {xLabel && (
        <text x={(padding.l + width - padding.r) / 2} y={height - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={TEXT}>{xLabel}</text>
      )}
      {yLabel && (
        <text x={12} y={(padding.t + height - padding.b) / 2} textAnchor="middle" fontSize="10" fontWeight="700" fill={TEXT} transform={`rotate(-90 12 ${(padding.t + height - padding.b) / 2})`}>{yLabel}</text>
      )}
      {children(x, y)}
    </svg>
  );
}

/** Build an SVG path "d" string from [x,y] data points using the scales. */
export function linePath(points, x, y) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p[0]).toFixed(2)} ${y(p[1]).toFixed(2)}`).join(' ');
}
