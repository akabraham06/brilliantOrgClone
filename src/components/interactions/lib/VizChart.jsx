/* eslint-disable react-refresh/only-export-components */
/*
 * visx-backed chart frame. This is the modern replacement for the hand-rolled
 * `ChartFrame` in chart.jsx: it keeps the SAME render-prop contract
 * (`children(xScale, yScale)`) so the existing graphs migrate with minimal
 * churn, but draws axes/gridlines with @visx/axis + @visx/grid and uses real
 * d3 scales (callable, with `.invert`, `.domain`, `.range`).
 *
 * The scales handed to children are visx `scaleLinear` instances, so plotting
 * code can keep calling `x(value)` / `y(value)` and `x.invert(px)` exactly as
 * before. Helper utilities (`svgPointFromEvent`, `linePath`, `niceTicks`,
 * `makeScale`) are re-exported from chart.jsx so there is a single import site.
 */
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { svgPointFromEvent, linePath, niceTicks, makeScale } from './chart.jsx';

export { svgPointFromEvent, linePath, niceTicks, makeScale };

const AXIS = 'var(--color-border-strong)';
const GRID = 'var(--color-border)';
const TEXT = 'var(--color-text-subtle)';
const LABEL = 'var(--color-text)';

const tickLabelProps = (anchor) => () => ({
  fill: TEXT,
  fontSize: 9,
  textAnchor: anchor,
  dy: anchor === 'middle' ? '0.2em' : '0.32em',
});

/**
 * children: (xScale, yScale) => ReactNode  (visx scaleLinear instances)
 *
 * Props mirror the old ChartFrame so it is a drop-in replacement. `onPointer`
 * is wired to pointer down/move on the <svg>; pair with `svgPointFromEvent` to
 * read viewBox coordinates.
 */
export function VizChart({
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
  const x = scaleLinear({ domain: xDomain, range: [padding.l, width - padding.r] });
  const y = scaleLinear({ domain: yDomain, range: [height - padding.b, padding.t] });
  const innerWidth = width - padding.l - padding.r;
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
      <GridRows scale={y} left={padding.l} width={innerWidth} tickValues={yt} stroke={GRID} strokeWidth={1} />
      <AxisBottom
        top={height - padding.b}
        scale={x}
        tickValues={xt}
        tickFormat={formatX}
        stroke={AXIS}
        strokeWidth={1.5}
        tickStroke={AXIS}
        tickLength={4}
        tickLabelProps={tickLabelProps('middle')}
      />
      <AxisLeft
        left={padding.l}
        scale={y}
        tickValues={yt}
        tickFormat={formatY}
        stroke={AXIS}
        strokeWidth={1.5}
        tickStroke="transparent"
        tickLabelProps={tickLabelProps('end')}
      />
      {xLabel && (
        <text
          x={(padding.l + width - padding.r) / 2}
          y={height - 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={LABEL}
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={12}
          y={(padding.t + height - padding.b) / 2}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={LABEL}
          transform={`rotate(-90 12 ${(padding.t + height - padding.b) / 2})`}
        >
          {yLabel}
        </text>
      )}
      {children(x, y)}
    </svg>
  );
}

export default VizChart;
