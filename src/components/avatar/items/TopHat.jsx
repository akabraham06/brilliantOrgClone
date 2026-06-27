export default function TopHat() {
  return (
    <g>
      <defs>
        <linearGradient id="top-hat-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b1d24" />
          <stop offset="45%" stopColor="#33384a" />
          <stop offset="100%" stopColor="#15171d" />
        </linearGradient>
        <linearGradient id="top-hat-brim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#23252e" />
          <stop offset="50%" stopColor="#3a3f52" />
          <stop offset="100%" stopColor="#1a1c23" />
        </linearGradient>
      </defs>
      {/* Brim */}
      <ellipse cx="60" cy="38" rx="32" ry="7.5" fill="url(#top-hat-brim)" stroke="#0e0f14" strokeWidth="1" />
      <ellipse cx="60" cy="36.5" rx="32" ry="6.5" fill="#2b2f3c" opacity="0.7" />
      {/* Crown */}
      <path d="M40 37 L42 8 Q60 3 78 8 L80 37 Z" fill="url(#top-hat-body)" stroke="#0e0f14" strokeWidth="1" />
      <path d="M44 36 L45.5 10 Q47 9 49 8.6 L48 36 Z" fill="#454b60" opacity="0.55" />
      {/* Hat band */}
      <path d="M40.4 31 L79.6 31 L80 37 L40 37 Z" fill="#7a1f2b" />
      <path d="M40.4 31 L79.6 31 L79.8 33.5 L40.2 33.5 Z" fill="#9c2c3a" opacity="0.8" />
      {/* Band buckle */}
      <rect x="56" y="30.5" width="8" height="6.5" rx="1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.8" />
      <rect x="58" y="32" width="4" height="3.5" rx="0.5" fill="#7a1f2b" />
      {/* Top sheen */}
      <ellipse cx="60" cy="8" rx="18" ry="3.5" fill="#3f4760" />
      <ellipse cx="56" cy="7.6" rx="7" ry="1.6" fill="#6b7490" opacity="0.6" />
    </g>
  );
}
