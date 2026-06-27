export default function BaseballCap() {
  return (
    <g>
      <defs>
        <linearGradient id="baseball-cap-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f5fa8" />
          <stop offset="50%" stopColor="#2e7bd1" />
          <stop offset="100%" stopColor="#17467d" />
        </linearGradient>
        <linearGradient id="baseball-cap-brim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c539a" />
          <stop offset="100%" stopColor="#103562" />
        </linearGradient>
      </defs>
      {/* Curved brim */}
      <path d="M40 37 Q26 38 24 43 Q40 44 58 40 Q50 37 40 37 Z" fill="url(#baseball-cap-brim)" stroke="#0d2a4d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M28 42 Q40 43 54 40" fill="none" stroke="#3a86d6" strokeWidth="0.7" opacity="0.5" />
      {/* Dome */}
      <path d="M40 38 Q40 14 60 13 Q82 14 82 36 Q62 40 40 38 Z" fill="url(#baseball-cap-dome)" stroke="#0d2a4d" strokeWidth="1" />
      {/* Panel seams */}
      <path d="M60 13 L60 37" stroke="#16467e" strokeWidth="0.8" opacity="0.7" />
      <path d="M50 14 Q52 26 53 37" fill="none" stroke="#16467e" strokeWidth="0.8" opacity="0.6" />
      <path d="M70 14 Q68 26 67 37" fill="none" stroke="#16467e" strokeWidth="0.8" opacity="0.6" />
      {/* Top button */}
      <circle cx="60" cy="13.5" r="2" fill="#2e7bd1" stroke="#0d2a4d" strokeWidth="0.7" />
      {/* Front emblem: chemistry flask */}
      <path d="M58 22 L58 26 L54.5 32 Q54 34 56 34 L64 34 Q66 34 65.5 32 L62 26 L62 22 Z" fill="#f4f7fb" stroke="#0d2a4d" strokeWidth="0.8" strokeLinejoin="round" />
      <rect x="57.4" y="20.5" width="5.2" height="2" rx="0.6" fill="#cdd9e6" stroke="#0d2a4d" strokeWidth="0.6" />
      <path d="M56 31 Q60 30 64 31 L64.6 32.4 Q60 33.4 55.4 32.4 Z" fill="#3fd17a" />
      <circle cx="58.5" cy="31.4" r="0.7" fill="#bff5d6" />
      <circle cx="61.5" cy="32.2" r="0.5" fill="#bff5d6" />
      {/* Dome highlight */}
      <ellipse cx="50" cy="20" rx="5" ry="9" fill="#5a9be0" opacity="0.3" />
    </g>
  );
}
