export default function SafetySpecs() {
  return (
    <g>
      <defs>
        <radialGradient id="safety-specs-lens" cx="0.4" cy="0.35" r="0.85">
          <stop offset="0%" stopColor="#eef6ff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#d3e6f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#b3cee6" stopOpacity="0.22" />
        </radialGradient>
        <linearGradient id="safety-specs-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8edf2" />
          <stop offset="100%" stopColor="#b8c2cc" />
        </linearGradient>
      </defs>
      {/* Side shields */}
      <path d="M42 34 Q40 38 42 43 L45 42.5 L45 35 Z" fill="url(#safety-specs-lens)" stroke="url(#safety-specs-frame)" strokeWidth="1" />
      <path d="M78 34 Q80 38 78 43 L75 42.5 L75 35 Z" fill="url(#safety-specs-lens)" stroke="url(#safety-specs-frame)" strokeWidth="1" />
      {/* Temple arms */}
      <path d="M44 35 L42 34" fill="none" stroke="url(#safety-specs-frame)" strokeWidth="2" strokeLinecap="round" />
      <path d="M76 35 L78 34" fill="none" stroke="url(#safety-specs-frame)" strokeWidth="2" strokeLinecap="round" />
      {/* Single-piece protective lens shield */}
      <path d="M44 34 Q60 31.5 76 34 Q77 39 74 43 Q60 45.5 46 43 Q43 39 44 34 Z" fill="url(#safety-specs-lens)" stroke="url(#safety-specs-frame)" strokeWidth="1.4" />
      {/* Faint blue tint sweep */}
      <path d="M45 35 Q60 33 75 35 Q75.5 38 74 41 L46 41 Q44.5 38 45 35 Z" fill="#7fb4e0" opacity="0.12" />
      {/* Center brow ridge */}
      <path d="M45 34 Q60 31.6 75 34" fill="none" stroke="url(#safety-specs-frame)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Bridge dip */}
      <path d="M56.5 33.6 Q60 36 63.5 33.6" fill="none" stroke="url(#safety-specs-frame)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Lens divider over nose */}
      <line x1="60" y1="34" x2="60" y2="43.5" stroke="#cdd6df" strokeWidth="0.5" opacity="0.6" />
      {/* Specular highlights */}
      <path d="M47.5 35.5 Q50 34 54 34.8" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <path d="M65.5 35.5 Q68 34 72 34.8" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <circle cx="48.6" cy="36.6" r="0.7" fill="#ffffff" opacity="0.7" />
      <circle cx="66.6" cy="36.6" r="0.7" fill="#ffffff" opacity="0.7" />
    </g>
  );
}
