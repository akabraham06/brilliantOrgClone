import { AVATAR, BODY_PALETTE } from './layout.js';

/**
 * The base "blob" the avatar is built on: a single soft, rounded mint creature
 * that only vaguely resembles a human — a fused head+body silhouette with two
 * little stub arms, stubby feet, and a minimal abstract face (small simple eyes,
 * a tiny smile). Authored against the shared layout.js anchors (viewBox 120×140)
 * so the 50 cosmetic layers still line up exactly:
 *   head center (60,40) r24 · eyes y38 (x51/x69) · torso x34..86 y62..108 ·
 *   legs y108..134.
 *
 * Everything is drawn in one calm color so equipped items read clearly.
 */
export default function AvatarBase() {
  const { eyes } = AVATAR;
  const p = BODY_PALETTE;
  return (
    <g>
      {/* ── Little stub arms resting at the blob's sides (give accessories like
            the wristband a wrist to sit on, and read as cute paws). ───────── */}
      <g>
        <path
          d="M36 76 Q30 80 31 92 Q32 104 39 106 Q45 106 45 98 L44 80 Q41 75 36 76 Z"
          fill={p.blobShade}
        />
        <circle cx="38" cy="103" r="7" fill={p.blob} />
        <path
          d="M84 76 Q90 80 89 92 Q88 104 81 106 Q75 106 75 98 L76 80 Q79 75 84 76 Z"
          fill={p.blobShade}
        />
        <circle cx="82" cy="103" r="7" fill={p.blob} />
      </g>

      {/* ── Stubby feet poking out the bottom (covered by bottoms when worn) ── */}
      <ellipse cx="51" cy="125" rx="9" ry="8" fill={p.blobShade} />
      <ellipse cx="69" cy="125" rx="9" ry="8" fill={p.blobShade} />
      <ellipse cx="51" cy="123" rx="7.5" ry="6" fill={p.blob} />
      <ellipse cx="69" cy="123" rx="7.5" ry="6" fill={p.blob} />

      {/* ── Main fused head + body blob (one soft silhouette) ──────────────── */}
      <path
        d="M60 15
           C 78 15, 86 28, 86 44
           C 86 54, 83 60, 82 66
           C 90 72, 92 88, 88 102
           C 84 116, 74 122, 60 122
           C 46 122, 36 116, 32 102
           C 28 88, 30 72, 38 66
           C 37 60, 34 54, 34 44
           C 34 28, 42 15, 60 15 Z"
        fill={p.blob}
      />

      {/* Soft belly / cheek highlight to give the blob volume */}
      <ellipse cx="60" cy="86" rx="22" ry="26" fill={p.blobHi} opacity="0.5" />
      {/* Gentle underside shading */}
      <path
        d="M32 96 Q60 122 88 96 Q88 112 74 120 Q60 124 46 120 Q32 112 32 96 Z"
        fill={p.blobShade}
        opacity="0.35"
      />
      {/* Top sheen on the head dome */}
      <ellipse cx="53" cy="28" rx="13" ry="9" fill={p.blobHi} opacity="0.45" />

      {/* ── Minimal abstract face ──────────────────────────────────────────── */}
      {/* Cheeks */}
      <ellipse cx={eyes.left - 5} cy={eyes.y + 8} rx="4.5" ry="3.2" fill={p.blush} opacity="0.55" />
      <ellipse cx={eyes.right + 5} cy={eyes.y + 8} rx="4.5" ry="3.2" fill={p.blush} opacity="0.55" />
      {/* Eyes — small, simple, friendly */}
      <ellipse cx={eyes.left} cy={eyes.y} rx="3" ry="3.6" fill={p.outline} />
      <ellipse cx={eyes.right} cy={eyes.y} rx="3" ry="3.6" fill={p.outline} />
      <circle cx={eyes.left + 1} cy={eyes.y - 1.2} r="1" fill="#fff" />
      <circle cx={eyes.right + 1} cy={eyes.y - 1.2} r="1" fill="#fff" />
      {/* Tiny smile */}
      <path
        d={`M ${eyes.left + 4} ${eyes.y + 8} Q 60 ${eyes.y + 12} ${eyes.right - 4} ${eyes.y + 8}`}
        stroke={p.outline}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
