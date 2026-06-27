export default function Turtleneck() {
  return (
    <g>
      <defs>
        <linearGradient id="turtleneck-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b4f7a" />
          <stop offset="50%" stopColor="#856597" />
          <stop offset="100%" stopColor="#5c4369" />
        </linearGradient>
        <linearGradient id="turtleneck-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d6da0" />
          <stop offset="100%" stopColor="#664a76" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" fill="url(#turtleneck-body)" stroke="#3f2e4a" strokeWidth="1" />
      {/* Sleeves */}
      <path d="M34 67 Q28 72 30 83 L41 81 L41 69 Z" fill="url(#turtleneck-body)" stroke="#3f2e4a" strokeWidth="1" />
      <path d="M86 67 Q92 72 90 83 L79 81 L79 69 Z" fill="url(#turtleneck-body)" stroke="#3f2e4a" strokeWidth="1" />
      {/* Ribbed cuffs */}
      <path d="M30 83 L41 81 L41 86 L31 88 Z" fill="#5c4369" stroke="#3f2e4a" strokeWidth="0.7" />
      <path d="M90 83 L79 81 L79 86 L89 88 Z" fill="#5c4369" stroke="#3f2e4a" strokeWidth="0.7" />
      <path d="M32 83.5 L32.5 87.5 M35 83 L35.5 87 M38 82.5 L38.5 86.5" stroke="#7a5b8c" strokeWidth="0.5" />
      <path d="M88 83.5 L87.5 87.5 M85 83 L84.5 87 M82 82.5 L81.5 86.5" stroke="#7a5b8c" strokeWidth="0.5" />
      {/* Tall folded ribbed collar around the neck */}
      <path d="M53 66 Q60 70 67 66 L68 56 Q60 53 52 56 Z" fill="url(#turtleneck-collar)" stroke="#3f2e4a" strokeWidth="0.9" />
      {/* Fold line at top of collar */}
      <path d="M52.5 58.5 Q60 56 67.5 58.5" stroke="#4a3656" strokeWidth="0.9" fill="none" />
      <path d="M52.5 58.5 Q60 55 67.5 58.5" stroke="#9d7cb0" strokeWidth="0.6" fill="none" opacity="0.7" />
      {/* Collar ribs */}
      <path d="M54 56 L54.5 66 M57 54.5 L57.3 67 M60 54 L60 68 M63 54.5 L62.7 67 M66 56 L65.5 66" stroke="#4a3656" strokeWidth="0.6" />
      {/* Vertical body shading */}
      <path d="M42 72 Q44 90 42 106" stroke="#5c4369" strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M78 72 Q76 90 78 106" stroke="#5c4369" strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M48 72 L48 106 M54 73 L54 106 M66 73 L66 106 M72 72 L72 106" stroke="#54405f" strokeWidth="0.5" opacity="0.4" />
      {/* Highlight */}
      <path d="M45 72 Q47 90 46 105" stroke="#9d7cb0" strokeWidth="0.9" fill="none" opacity="0.55" />
      <path d="M60 73 L60 106" stroke="#9d7cb0" strokeWidth="0.5" opacity="0.35" />
      {/* Ribbed hem */}
      <path d="M37 107 Q60 112 83 107 L82.5 110.5 Q60 115 37.5 110.5 Z" fill="#5c4369" stroke="#3f2e4a" strokeWidth="0.8" />
      <path d="M42 108.5 L42 112 M50 109.5 L50 113 M60 109.7 L60 113.2 M70 109.5 L70 113 M78 108.5 L78 112" stroke="#7a5b8c" strokeWidth="0.5" />
    </g>
  );
}
