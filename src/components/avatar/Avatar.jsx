import { lazy, Suspense } from 'react';
import AvatarBase from './AvatarBase.jsx';
import { VIEWBOX, BODY_PALETTE, headwearTransform } from './layout.js';
import { SKIN_3D, is3DSkin } from './skins3d.js';
// Owned by the sibling cosmetics-art worker: a map of cosmetic id -> React
// component returning an SVG <g> fragment drawn to the shared 120x140 layout.
import { ITEM_COMPONENTS } from './items/index.js';
import styles from './Avatar.module.css';

// The 3D blob renderer pulls in three / @react-three-fiber, so it is lazy-loaded
// and only ever imported when a 3D skin is actually rendered in a rich context
// (Store preview, profile). The tiny navbar never triggers this import.
const Skin3D = lazy(() => import('./Skin3D.jsx'));

// A square "bust" crop (head + shoulders) for small circular slots like the nav
// and the headwear/eyewear store cards. Starts slightly above the viewBox top so
// tall headwear (wizard hat, party hat, flask helmet, beanie pom) isn't clipped.
const BUST_VIEWBOX = '26 -2 68 68';

// Front-to-back stacking for layers drawn OVER the base body. Slot values match
// the manifest exactly: headwear | eyewear | top | bottom | accessory.
//   bottom (0) -> top (1) -> accessory (2) -> headwear (3) -> eyewear (4)
const FRONT_Z = { bottom: 0, top: 1, accessory: 2, headwear: 3, eyewear: 4 };

// Accessories whose art is a large drape authored to sit BEHIND the torso (it
// would fully occlude the body if drawn in front). Everything else — including
// the backpack and satchel, whose straps are drawn over the chest — renders in
// front so its detail stays visible.
const BEHIND_ACCESSORIES = new Set(['cape']);

/**
 * Renders the avatar from an `equipped` map ({ slot: itemId }).
 *
 * If a 3D skin is equipped (equipped.skin in SKIN_3D) it REPLACES the SVG avatar
 * entirely (mutually exclusive). In rich contexts (`allow3D`) it mounts the
 * lazy-loaded 3D renderer; otherwise (e.g. the navbar) it shows a cheap static
 * SVG stand-in so no canvas is mounted.
 *
 * Otherwise it draws the layered SVG: equipped ids resolve to components in
 * ITEM_COMPONENTS (each returns a <g>); unknown/unowned ids are skipped silently.
 * Render order: behind-accessory (cape) -> base body -> bottom -> top -> front
 * accessories -> headwear -> eyewear. Decorative by default (aria-hidden) unless
 * a `title` is provided. Empty `equipped` renders just the clean blob base.
 *
 * `idle` adds a subtle looping breathing animation (Store), disabled under
 * prefers-reduced-motion. `allow3D` opts a mount-point into live 3D rendering.
 */
export default function Avatar({
  equipped = {},
  size = 64,
  title,
  className,
  crop,
  idle = false,
  allow3D = false,
  style,
}) {
  const skinId = equipped?.skin;

  // ── 3D skin path (replaces the SVG avatar) ──────────────────────────────────
  if (is3DSkin(skinId)) {
    const skin = SKIN_3D[skinId];
    if (allow3D) {
      return (
        <div
          className={className}
          style={{ width: size, height: size, ...style }}
          role={title ? 'img' : undefined}
          aria-label={title || undefined}
        >
          <Suspense fallback={<Skin3DStatic skin={skin} size={size} crop={crop} />}>
            <Skin3D skinId={skinId} size={size} />
          </Suspense>
        </div>
      );
    }
    return (
      <Skin3DStatic
        skin={skin}
        size={size}
        crop={crop}
        className={className}
        style={style}
        title={title}
      />
    );
  }

  // ── Layered SVG path ────────────────────────────────────────────────────────
  const entries = Object.entries(equipped || {}).filter(
    ([slot, id]) => slot !== 'skin' && id && ITEM_COMPONENTS?.[id],
  );

  const behind = [];
  const front = [];
  for (const [slot, id] of entries) {
    if (slot === 'accessory' && BEHIND_ACCESSORIES.has(id)) behind.push([slot, id]);
    else front.push([slot, id]);
  }
  front.sort((a, b) => (FRONT_Z[a[0]] ?? 99) - (FRONT_Z[b[0]] ?? 99));

  const renderLayer = ([slot, id]) => {
    const Item = ITEM_COMPONENTS[id];
    // Headwear is authored for an older, lower head; lift it onto the crown of
    // the redesigned blob so hats rest on top instead of over the face.
    if (slot === 'headwear') {
      return (
        <g key={slot} transform={headwearTransform(id)}>
          <Item />
        </g>
      );
    }
    return <Item key={slot} />;
  };

  return (
    <svg
      className={`${className || ''} ${idle ? styles.idle : ''}`.trim() || undefined}
      style={style}
      viewBox={crop === 'bust' ? BUST_VIEWBOX : VIEWBOX}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      {title && <title>{title}</title>}
      {behind.map(renderLayer)}
      <AvatarBase />
      {front.map(renderLayer)}
    </svg>
  );
}

/**
 * Cheap static stand-in for a 3D skin: a glossy aurora blob drawn with the skin's
 * palette and a couple of sparkles. Used in the navbar and as the Suspense
 * fallback while the real 3D renderer loads. No canvas, no three.js.
 */
function Skin3DStatic({ skin, size = 64, crop, className, style, title }) {
  const gid = `skin3d-${skin.name.replace(/\s+/g, '')}`;
  const p = BODY_PALETTE;
  return (
    <svg
      className={className}
      style={style}
      viewBox={crop === 'bust' ? BUST_VIEWBOX : VIEWBOX}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`${gid}-body`} cx="0.4" cy="0.32" r="0.85">
          <stop offset="0%" stopColor={skin.glow} />
          <stop offset="45%" stopColor={skin.colorA} />
          <stop offset="80%" stopColor={skin.colorB} />
          <stop offset="100%" stopColor={skin.colorC} />
        </radialGradient>
        <radialGradient id={`${gid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={skin.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={skin.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="76" rx="40" ry="46" fill={`url(#${gid}-glow)`} />
      {/* Same fused-blob silhouette as the base, filled with the aurora gradient */}
      <path
        d="M60 15 C 78 15, 86 28, 86 44 C 86 54, 83 60, 82 66
           C 90 72, 92 88, 88 102 C 84 116, 74 122, 60 122
           C 46 122, 36 116, 32 102 C 28 88, 30 72, 38 66
           C 37 60, 34 54, 34 44 C 34 28, 42 15, 60 15 Z"
        fill={`url(#${gid}-body)`}
      />
      {/* Glossy top highlight */}
      <ellipse cx="52" cy="34" rx="15" ry="11" fill="#ffffff" opacity="0.4" />
      {/* Eyes */}
      <ellipse cx="51" cy="38" rx="3" ry="3.8" fill={p.outline} />
      <ellipse cx="69" cy="38" rx="3" ry="3.8" fill={p.outline} />
      <circle cx="52.1" cy="36.8" r="1.1" fill="#fff" />
      <circle cx="70.1" cy="36.8" r="1.1" fill="#fff" />
      {/* Sparkles to signal it's special */}
      <path d="M86 30 l1.4 3.2 l3.2 1.4 l-3.2 1.4 l-1.4 3.2 l-1.4 -3.2 l-3.2 -1.4 l3.2 -1.4 Z" fill="#fff" opacity="0.9" />
      <path d="M34 58 l1 2.3 l2.3 1 l-2.3 1 l-1 2.3 l-1 -2.3 l-2.3 -1 l2.3 -1 Z" fill="#fff" opacity="0.8" />
    </svg>
  );
}
