export default function Crown() {
  return (
    <g>
      <defs>
        <linearGradient id="crown-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="35%" stopColor="#f2cd5c" />
          <stop offset="70%" stopColor="#d49a26" />
          <stop offset="100%" stopColor="#9c6d15" />
        </linearGradient>
        <linearGradient id="crown-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6da78" />
          <stop offset="100%" stopColor="#b07f1c" />
        </linearGradient>
        <radialGradient id="crown-ruby" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#ff8fa3" />
          <stop offset="55%" stopColor="#d61f3c" />
          <stop offset="100%" stopColor="#7d0f22" />
        </radialGradient>
        <radialGradient id="crown-sapphire" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#9fd0ff" />
          <stop offset="55%" stopColor="#2a6fd6" />
          <stop offset="100%" stopColor="#143d80" />
        </radialGradient>
      </defs>
      {/* Crown body with points */}
      <path d="M34 40 L34 22 L44 31 L52 16 L60 28 L68 16 L76 31 L86 22 L86 40 Z" fill="url(#crown-gold)" stroke="#7a560f" strokeWidth="1" strokeLinejoin="round" />
      {/* Inner highlight */}
      <path d="M37 38 L37 26 L44 33 L52 21 L60 31 L68 21 L76 33 L83 26 L83 38 Z" fill="#ffe9a0" opacity="0.35" />
      {/* Band */}
      <path d="M33 36 Q60 31 87 36 L87 42 Q60 38 33 42 Z" fill="url(#crown-band)" stroke="#7a560f" strokeWidth="1" />
      {/* Band jewels */}
      <ellipse cx="44" cy="39" rx="2.4" ry="2.8" fill="url(#crown-sapphire)" stroke="#143d80" strokeWidth="0.5" />
      <ellipse cx="60" cy="39.2" rx="2.8" ry="3.2" fill="url(#crown-ruby)" stroke="#7d0f22" strokeWidth="0.5" />
      <ellipse cx="76" cy="39" rx="2.4" ry="2.8" fill="url(#crown-sapphire)" stroke="#143d80" strokeWidth="0.5" />
      <circle cx="52" cy="39" r="1.4" fill="#fff3bf" stroke="#b07f1c" strokeWidth="0.4" />
      <circle cx="68" cy="39" r="1.4" fill="#fff3bf" stroke="#b07f1c" strokeWidth="0.4" />
      {/* Jewel sparkles */}
      <circle cx="59" cy="38" r="0.8" fill="#ffd9e0" opacity="0.9" />
      <circle cx="43.2" cy="38.2" r="0.6" fill="#d6e8ff" opacity="0.9" />
      <circle cx="75.2" cy="38.2" r="0.6" fill="#d6e8ff" opacity="0.9" />
      {/* Pearl tips on points */}
      <circle cx="52" cy="15" r="2.4" fill="#fdfbf2" stroke="#cdbf8a" strokeWidth="0.5" />
      <circle cx="51.3" cy="14.3" r="0.7" fill="#ffffff" />
      <circle cx="68" cy="15" r="2.4" fill="#fdfbf2" stroke="#cdbf8a" strokeWidth="0.5" />
      <circle cx="67.3" cy="14.3" r="0.7" fill="#ffffff" />
      <circle cx="34" cy="21" r="1.8" fill="#fdfbf2" stroke="#cdbf8a" strokeWidth="0.5" />
      <circle cx="86" cy="21" r="1.8" fill="#fdfbf2" stroke="#cdbf8a" strokeWidth="0.5" />
      {/* Vertical sheen */}
      <path d="M60 28 L60 17" stroke="#fff7d6" strokeWidth="0.8" opacity="0.6" />
    </g>
  );
}
