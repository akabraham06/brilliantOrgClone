export default function TankTop() {
  return (
    <g>
      <defs>
        <linearGradient id="tank-top-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f8a7a" />
          <stop offset="50%" stopColor="#27a892" />
          <stop offset="100%" stopColor="#17776a" />
        </linearGradient>
        <linearGradient id="tank-top-strap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27a892" />
          <stop offset="100%" stopColor="#1c8175" />
        </linearGradient>
        <pattern id="tank-top-mesh" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.5" fill="#0f6358" opacity="0.4" />
        </pattern>
      </defs>
      {/* Thin shoulder straps */}
      <path d="M48 64 L52 65 L50 73 L46 72 Z" fill="url(#tank-top-strap)" stroke="#13665b" strokeWidth="0.8" />
      <path d="M72 64 L68 65 L70 73 L74 72 Z" fill="url(#tank-top-strap)" stroke="#13665b" strokeWidth="0.8" />
      {/* Body */}
      <path d="M46 72 Q44 73 43 76 L41 104 Q60 109 79 104 L77 76 Q76 73 74 72 L70 73 Q60 80 50 73 Z" fill="url(#tank-top-body)" stroke="#13665b" strokeWidth="1" />
      {/* Breathable mesh hint */}
      <path d="M46 72 Q44 73 43 76 L41 104 Q60 109 79 104 L77 76 Q76 73 74 72 L70 73 Q60 80 50 73 Z" fill="url(#tank-top-mesh)" opacity="0.7" />
      {/* Scoop neckline */}
      <path d="M50 73 Q60 80 70 73 Q60 84 50 73 Z" fill="#13665b" opacity="0.8" />
      <path d="M50 73 Q60 80 70 73" stroke="#34c4ac" strokeWidth="0.8" fill="none" />
      {/* Armhole trim */}
      <path d="M46 72 L43 76 L42 90" stroke="#34c4ac" strokeWidth="1" fill="none" />
      <path d="M74 72 L77 76 L78 90" stroke="#34c4ac" strokeWidth="1" fill="none" />
      {/* Strap highlights */}
      <path d="M47.5 65 L49.5 72" stroke="#3fd0b6" strokeWidth="0.7" opacity="0.7" />
      <path d="M72.5 65 L70.5 72" stroke="#3fd0b6" strokeWidth="0.7" opacity="0.7" />
      {/* Fold shading */}
      <path d="M48 76 Q50 90 48 103" stroke="#15786b" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M72 76 Q70 90 72 103" stroke="#15786b" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M60 82 L60 105" stroke="#15786b" strokeWidth="0.9" opacity="0.45" />
      {/* Highlight */}
      <path d="M52 76 Q54 90 53 102" stroke="#48d8be" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Hem */}
      <path d="M41 104 Q60 109 79 104 L78.5 106.5 Q60 111.5 41.5 106.5 Z" fill="#1c8175" stroke="#13665b" strokeWidth="0.8" />
    </g>
  );
}
