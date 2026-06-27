export default function Flannel() {
  return (
    <g>
      <defs>
        <linearGradient id="flannel-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a1f24" />
          <stop offset="100%" stopColor="#5e161b" />
        </linearGradient>
        <clipPath id="flannel-clip">
          <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" />
        </clipPath>
      </defs>
      {/* Base */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" fill="url(#flannel-base)" stroke="#3f0e12" strokeWidth="1" />
      {/* Plaid built from translucent overlapping stripes (clipped to body) */}
      <g clipPath="url(#flannel-clip)">
        {/* Vertical dark stripes */}
        <rect x="40" y="63" width="4" height="48" fill="#3f0e12" opacity="0.55" />
        <rect x="52" y="63" width="4" height="48" fill="#3f0e12" opacity="0.55" />
        <rect x="64" y="63" width="4" height="48" fill="#3f0e12" opacity="0.55" />
        <rect x="76" y="63" width="4" height="48" fill="#3f0e12" opacity="0.55" />
        {/* Horizontal dark stripes */}
        <rect x="32" y="74" width="56" height="4" fill="#3f0e12" opacity="0.55" />
        <rect x="32" y="88" width="56" height="4" fill="#3f0e12" opacity="0.55" />
        <rect x="32" y="102" width="56" height="4" fill="#3f0e12" opacity="0.55" />
        {/* Light accent thin stripes */}
        <rect x="46" y="63" width="1.4" height="48" fill="#e8c98f" opacity="0.5" />
        <rect x="58" y="63" width="1.4" height="48" fill="#e8c98f" opacity="0.5" />
        <rect x="70" y="63" width="1.4" height="48" fill="#e8c98f" opacity="0.5" />
        <rect x="32" y="81" width="56" height="1.4" fill="#e8c98f" opacity="0.5" />
        <rect x="32" y="95" width="56" height="1.4" fill="#e8c98f" opacity="0.5" />
        {/* Cross intersections (darker squares) */}
        <rect x="40" y="74" width="4" height="4" fill="#2c090c" opacity="0.5" />
        <rect x="52" y="88" width="4" height="4" fill="#2c090c" opacity="0.5" />
        <rect x="64" y="102" width="4" height="4" fill="#2c090c" opacity="0.5" />
        <rect x="76" y="74" width="4" height="4" fill="#2c090c" opacity="0.5" />
      </g>
      {/* Sleeves */}
      <path d="M34 67 Q28 73 30 84 L41 82 L41 69 Z" fill="url(#flannel-base)" stroke="#3f0e12" strokeWidth="1" />
      <path d="M86 67 Q92 73 90 84 L79 82 L79 69 Z" fill="url(#flannel-base)" stroke="#3f0e12" strokeWidth="1" />
      <path d="M32 76 L41 74.5 M31 80 L41 78.5" stroke="#3f0e12" strokeWidth="2" opacity="0.5" />
      <path d="M88 76 L79 74.5 M89 80 L79 78.5" stroke="#3f0e12" strokeWidth="2" opacity="0.5" />
      {/* Sleeve cuffs */}
      <path d="M30 84 L41 82 L41 87 L31 89 Z" fill="#5e161b" stroke="#3f0e12" strokeWidth="0.7" />
      <path d="M90 84 L79 82 L79 87 L89 89 Z" fill="#5e161b" stroke="#3f0e12" strokeWidth="0.7" />
      {/* Collar */}
      <path d="M52 64 L60 70 L55 75 L49 68 Z" fill="#6a1a1f" stroke="#3f0e12" strokeWidth="0.9" />
      <path d="M68 64 L60 70 L65 75 L71 68 Z" fill="#6a1a1f" stroke="#3f0e12" strokeWidth="0.9" />
      {/* Neck opening */}
      <path d="M55 66 Q60 70 65 66 L64 68 Q60 71 56 68 Z" fill="#3a0d11" />
      {/* Button placket */}
      <path d="M58.5 70 L58.5 108 L61.5 108 L61.5 70 Z" fill="#6a1a1f" stroke="#3f0e12" strokeWidth="0.6" />
      <circle cx="60" cy="78" r="1.1" fill="#e8c98f" stroke="#a07a3a" strokeWidth="0.4" />
      <circle cx="60" cy="86" r="1.1" fill="#e8c98f" stroke="#a07a3a" strokeWidth="0.4" />
      <circle cx="60" cy="94" r="1.1" fill="#e8c98f" stroke="#a07a3a" strokeWidth="0.4" />
      <circle cx="60" cy="102" r="1.1" fill="#e8c98f" stroke="#a07a3a" strokeWidth="0.4" />
      {/* Fold shading */}
      <path d="M44 72 Q46 90 44 106" stroke="#3f0e12" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M76 72 Q74 90 76 106" stroke="#3f0e12" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Hem */}
      <path d="M37 107 Q60 112 83 107 L82.5 109.5 Q60 114 37.5 109.5 Z" fill="#5e161b" stroke="#3f0e12" strokeWidth="0.8" />
    </g>
  );
}
