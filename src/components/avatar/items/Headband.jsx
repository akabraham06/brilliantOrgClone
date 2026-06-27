export default function Headband() {
  return (
    <g>
      <defs>
        <linearGradient id="headband-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4a8c" />
          <stop offset="50%" stopColor="#4a5da8" />
          <stop offset="100%" stopColor="#2c3a6e" />
        </linearGradient>
      </defs>
      {/* Sweatband across forehead */}
      <path d="M37 30 Q60 24 83 30 L83 38 Q60 33 37 38 Z" fill="url(#headband-body)" stroke="#222d56" strokeWidth="1" />
      {/* Top and bottom edge ribs */}
      <path d="M38 31 Q60 25.5 82 31" fill="none" stroke="#5d70bd" strokeWidth="0.8" opacity="0.6" />
      <path d="M38 37 Q60 32 82 37" fill="none" stroke="#222d56" strokeWidth="0.8" opacity="0.7" />
      {/* Center stripe accent */}
      <path d="M37.3 32.4 Q60 27 82.7 32.4 L82.7 34.4 Q60 29 37.3 34.4 Z" fill="#e8554a" />
      <path d="M37.3 33 Q60 28 82.7 33" fill="none" stroke="#ff8077" strokeWidth="0.6" opacity="0.7" />
      {/* Stitch dots */}
      <circle cx="44" cy="31.5" r="0.5" fill="#222d56" />
      <circle cx="54" cy="30" r="0.5" fill="#222d56" />
      <circle cx="66" cy="30" r="0.5" fill="#222d56" />
      <circle cx="76" cy="31.5" r="0.5" fill="#222d56" />
      <circle cx="44" cy="36.4" r="0.5" fill="#222d56" />
      <circle cx="60" cy="35" r="0.5" fill="#222d56" />
      <circle cx="76" cy="36.4" r="0.5" fill="#222d56" />
      {/* Soft highlight */}
      <ellipse cx="50" cy="29" rx="8" ry="2" fill="#6f82c9" opacity="0.3" />
    </g>
  );
}
