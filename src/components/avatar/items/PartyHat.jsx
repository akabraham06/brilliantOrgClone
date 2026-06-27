export default function PartyHat() {
  return (
    <g>
      <defs>
        <linearGradient id="party-hat-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff6f91" />
          <stop offset="50%" stopColor="#ff9bb3" />
          <stop offset="100%" stopColor="#e84d72" />
        </linearGradient>
        <radialGradient id="party-hat-pom" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#fff6c2" />
          <stop offset="100%" stopColor="#f2c84b" />
        </radialGradient>
      </defs>
      {/* Cone */}
      <path d="M46 39 L60 7 L74 39 Z" fill="url(#party-hat-cone)" stroke="#b83456" strokeWidth="1" strokeLinejoin="round" />
      {/* Diagonal stripes */}
      <path d="M53.6 21 L57 13 L60.5 14 L55.4 25 Z" fill="#5ec5e0" opacity="0.9" />
      <path d="M50 31 L54.4 22 L57.8 23.4 L52.4 36 L51 36 Z" fill="#5ec5e0" opacity="0.9" />
      <path d="M61 11 L63.5 16 L60.2 17 L59.4 15 Z" fill="#a6e05e" opacity="0.9" />
      <path d="M60.6 21 L64.5 27 L61.2 28.6 L58 22.4 Z" fill="#a6e05e" opacity="0.9" />
      <path d="M62.5 31 L66 38 L62.6 39 L60.4 32 Z" fill="#a6e05e" opacity="0.9" />
      {/* Brim trim */}
      <path d="M46 39 Q60 35 74 39 L74 41 Q60 37 46 41 Z" fill="#ffe06b" stroke="#caa12f" strokeWidth="0.6" />
      {/* Pom-pom on top */}
      <circle cx="60" cy="6" r="4.5" fill="url(#party-hat-pom)" stroke="#d6a637" strokeWidth="0.7" />
      <path d="M57 4 L58 6 M62 3.5 L61.4 5.6 M58 8 L59 6.4 M63 7 L61.6 6" stroke="#f2c84b" strokeWidth="0.6" strokeLinecap="round" />
      {/* Confetti dots */}
      <circle cx="40" cy="20" r="1.6" fill="#5ec5e0" />
      <rect x="82" y="16" width="3" height="3" rx="0.6" fill="#a6e05e" transform="rotate(20 83 17)" />
      <circle cx="36" cy="34" r="1.4" fill="#ff9bb3" />
      <rect x="84" y="30" width="2.6" height="2.6" rx="0.5" fill="#ffe06b" transform="rotate(35 85 31)" />
      <circle cx="80" cy="8" r="1.3" fill="#5ec5e0" />
      <circle cx="42" cy="9" r="1.2" fill="#a6e05e" />
    </g>
  );
}
