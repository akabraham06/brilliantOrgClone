export default function CowboyHat() {
  return (
    <g>
      <defs>
        <linearGradient id="cowboy-hat-crown" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a4d24" />
          <stop offset="45%" stopColor="#a06a35" />
          <stop offset="100%" stopColor="#5e3a1a" />
        </linearGradient>
        <linearGradient id="cowboy-hat-brim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e451f" />
          <stop offset="50%" stopColor="#976330" />
          <stop offset="100%" stopColor="#553418" />
        </linearGradient>
        <linearGradient id="cowboy-hat-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2410" />
          <stop offset="50%" stopColor="#5a3a1c" />
          <stop offset="100%" stopColor="#2c1b0c" />
        </linearGradient>
      </defs>
      {/* Crown with center crease */}
      <path d="M44 35 Q44 14 60 13 Q76 14 76 35 Z" fill="url(#cowboy-hat-crown)" stroke="#3a2410" strokeWidth="1" />
      <path d="M52 34 Q53 18 56 14" fill="none" stroke="#5e3a1a" strokeWidth="1" opacity="0.6" />
      <path d="M68 34 Q67 18 64 14" fill="none" stroke="#5e3a1a" strokeWidth="1" opacity="0.6" />
      <path d="M60 33 L60 14" stroke="#4a2e14" strokeWidth="1.4" opacity="0.7" />
      {/* Curved brim */}
      <path d="M28 36 Q34 30 60 33 Q86 30 92 36 Q86 43 60 40 Q34 43 28 36 Z" fill="url(#cowboy-hat-brim)" stroke="#3a2410" strokeWidth="1" strokeLinejoin="round" />
      <path d="M32 36 Q60 39 88 36" fill="none" stroke="#bb8444" strokeWidth="0.8" opacity="0.5" />
      {/* Leather band */}
      <path d="M44.5 33 Q60 37 75.5 33 L75 36.5 Q60 40 45 36.5 Z" fill="url(#cowboy-hat-band)" stroke="#241608" strokeWidth="0.7" />
      {/* Band buckle */}
      <rect x="57" y="33" width="6" height="4" rx="1" fill="#d9b24a" stroke="#a7822f" strokeWidth="0.6" />
      <rect x="58.6" y="34.2" width="2.8" height="1.6" rx="0.4" fill="#5a3a1c" />
      {/* Highlight */}
      <ellipse cx="52" cy="20" rx="4" ry="8" fill="#b87f3e" opacity="0.3" />
    </g>
  );
}
