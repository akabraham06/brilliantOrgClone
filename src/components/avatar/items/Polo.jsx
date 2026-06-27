export default function Polo() {
  return (
    <g>
      <defs>
        <linearGradient id="polo-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f5fa0" />
          <stop offset="50%" stopColor="#3d74bf" />
          <stop offset="100%" stopColor="#274f87" />
        </linearGradient>
        <linearGradient id="polo-collar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a82cc" />
          <stop offset="100%" stopColor="#2f5fa0" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" fill="url(#polo-body)" stroke="#1d3a64" strokeWidth="1" />
      {/* Sleeves */}
      <path d="M34 67 Q28 72 30 83 L41 81 L41 69 Z" fill="url(#polo-body)" stroke="#1d3a64" strokeWidth="1" />
      <path d="M86 67 Q92 72 90 83 L79 81 L79 69 Z" fill="url(#polo-body)" stroke="#1d3a64" strokeWidth="1" />
      {/* Sleeve cuffs */}
      <path d="M30 83 L41 81 L41 86 L31 88 Z" fill="#2a5491" stroke="#1d3a64" strokeWidth="0.7" />
      <path d="M90 83 L79 81 L79 86 L89 88 Z" fill="#2a5491" stroke="#1d3a64" strokeWidth="0.7" />
      <path d="M31 84 L40 82.4 M31.5 86 L40.5 84.4" stroke="#4a82cc" strokeWidth="0.5" opacity="0.7" />
      <path d="M89 84 L80 82.4 M88.5 86 L79.5 84.4" stroke="#4a82cc" strokeWidth="0.5" opacity="0.7" />
      {/* Short button placket */}
      <path d="M57 70 L57 84 L63 84 L63 70 Z" fill="#2a5491" stroke="#1d3a64" strokeWidth="0.7" />
      <path d="M60 70 L60 84" stroke="#1d3a64" strokeWidth="0.6" />
      <circle cx="60" cy="74" r="0.9" fill="#dbe6f3" stroke="#9fb4d2" strokeWidth="0.4" />
      <circle cx="60" cy="80" r="0.9" fill="#dbe6f3" stroke="#9fb4d2" strokeWidth="0.4" />
      {/* Folded collar */}
      <path d="M52 64 L60 71 L56 68 L50 70 Z" fill="url(#polo-collar)" stroke="#1d3a64" strokeWidth="0.9" />
      <path d="M68 64 L60 71 L64 68 L70 70 Z" fill="url(#polo-collar)" stroke="#1d3a64" strokeWidth="0.9" />
      <path d="M50 70 L56 68 L60 71 Z" fill="#5a8fd6" opacity="0.5" />
      <path d="M70 70 L64 68 L60 71 Z" fill="#5a8fd6" opacity="0.5" />
      {/* Neck opening */}
      <path d="M56 68 Q60 71 64 68 L63 70 Q60 72 57 70 Z" fill="#1b3559" />
      {/* Fold shading */}
      <path d="M42 72 Q44 90 42 106" stroke="#274f87" strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M78 72 Q76 90 78 106" stroke="#274f87" strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M50 88 Q53 98 51 106" stroke="#274f87" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M70 88 Q67 98 69 106" stroke="#274f87" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Highlight */}
      <path d="M46 71 Q48 89 47 105" stroke="#6499dc" strokeWidth="0.9" fill="none" opacity="0.5" />
      {/* Hem */}
      <path d="M37 107 Q60 112 83 107 L82.5 109.5 Q60 114 37.5 109.5 Z" fill="#2a5491" stroke="#1d3a64" strokeWidth="0.8" />
    </g>
  );
}
