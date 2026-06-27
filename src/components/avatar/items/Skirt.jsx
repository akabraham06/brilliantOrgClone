export default function Skirt() {
  return (
    <g>
      <defs>
        <linearGradient id="skirt-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a3d8f" />
          <stop offset="50%" stopColor="#9b54b3" />
          <stop offset="100%" stopColor="#6c3380" />
        </linearGradient>
        <linearGradient id="skirt-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a861bf" />
          <stop offset="100%" stopColor="#7a3d8f" />
        </linearGradient>
      </defs>
      {/* Waistband */}
      <rect x="40" y="104" width="40" height="6.5" rx="2" fill="url(#skirt-band)" stroke="#552765" strokeWidth="1" />
      <line x1="40.5" y1="106" x2="79.5" y2="106" stroke="#c98fd9" strokeWidth="0.5" opacity="0.7" />
      {/* Single flared A-line panel */}
      <path d="M41 110 L79 110 L86 133 L34 133 Z" fill="url(#skirt-fabric)" stroke="#552765" strokeWidth="1" />
      {/* Pleat shading lines */}
      <path d="M48 110 L42 132" fill="none" stroke="#5e2c70" strokeWidth="1" opacity="0.6" />
      <path d="M55 110 L51 132" fill="none" stroke="#5e2c70" strokeWidth="1" opacity="0.6" />
      <path d="M60 110 L60 132" fill="none" stroke="#5e2c70" strokeWidth="1" opacity="0.6" />
      <path d="M65 110 L69 132" fill="none" stroke="#5e2c70" strokeWidth="1" opacity="0.6" />
      <path d="M72 110 L78 132" fill="none" stroke="#5e2c70" strokeWidth="1" opacity="0.6" />
      {/* Pleat highlights */}
      <path d="M51.5 110 L46.5 132" fill="none" stroke="#bd7dd1" strokeWidth="0.7" opacity="0.5" />
      <path d="M57.5 110 L55.5 132" fill="none" stroke="#bd7dd1" strokeWidth="0.7" opacity="0.5" />
      <path d="M62.5 110 L64.5 132" fill="none" stroke="#bd7dd1" strokeWidth="0.7" opacity="0.5" />
      <path d="M68.5 110 L73.5 132" fill="none" stroke="#bd7dd1" strokeWidth="0.7" opacity="0.5" />
      {/* Hem band */}
      <path d="M34 133 L86 133 L85 136 L35 136 Z" fill="#5e2c70" stroke="#552765" strokeWidth="0.7" />
      <path d="M35.5 134 L84.5 134" fill="none" stroke="#c98fd9" strokeWidth="0.4" strokeDasharray="2 1.6" opacity="0.6" />
      {/* Scalloped hem hint */}
      <path d="M34 133 Q39 135 44 133 Q49 135 54 133 Q60 135 66 133 Q71 135 76 133 Q81 135 86 133" fill="none" stroke="#552765" strokeWidth="0.6" />
      {/* Top inner shadow */}
      <path d="M41 110 L79 110 L78 113 L42 113 Z" fill="#5e2c70" opacity="0.35" />
    </g>
  );
}
