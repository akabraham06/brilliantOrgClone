export default function Halo() {
  return (
    <g>
      <defs>
        <radialGradient id="halo-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6c2" stopOpacity="0.7" />
          <stop offset="55%" stopColor="#ffe071" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffe071" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="halo-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4c842" />
          <stop offset="50%" stopColor="#fff3b0" />
          <stop offset="100%" stopColor="#d49a26" />
        </linearGradient>
      </defs>
      {/* Soft radial glow */}
      <ellipse cx="60" cy="13" rx="30" ry="14" fill="url(#halo-glow)" />
      {/* Ring outer */}
      <ellipse cx="60" cy="13" rx="22" ry="7.5" fill="none" stroke="url(#halo-ring)" strokeWidth="4" />
      {/* Ring inner shading */}
      <ellipse cx="60" cy="13" rx="22" ry="7.5" fill="none" stroke="#b07f1c" strokeWidth="1.2" opacity="0.6" />
      <ellipse cx="60" cy="12.4" rx="21.5" ry="7" fill="none" stroke="#fff7d6" strokeWidth="0.9" opacity="0.7" />
      {/* Sparkles */}
      <path d="M38 9 L38.8 11 L40.8 11.4 L38.8 11.8 L38 13.8 L37.2 11.8 L35.2 11.4 L37.2 11 Z" fill="#fff6c2" />
      <path d="M82 11 L82.7 12.6 L84.3 13 L82.7 13.4 L82 15 L81.3 13.4 L79.7 13 L81.3 12.6 Z" fill="#fff6c2" />
      <path d="M60 2.5 L60.6 4 L62.1 4.4 L60.6 4.8 L60 6.3 L59.4 4.8 L57.9 4.4 L59.4 4 Z" fill="#ffffff" />
      <circle cx="48" cy="7" r="0.8" fill="#fff3b0" />
      <circle cx="72" cy="7" r="0.8" fill="#fff3b0" />
      <circle cx="60" cy="20" r="0.7" fill="#ffe071" opacity="0.8" />
      {/* Ring front highlight glints */}
      <circle cx="44" cy="15" r="1" fill="#fffbe0" opacity="0.9" />
      <circle cx="76" cy="11" r="1" fill="#fffbe0" opacity="0.9" />
    </g>
  );
}
