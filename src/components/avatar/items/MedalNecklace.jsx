export default function MedalNecklace() {
  return (
    <g>
      <defs>
        <linearGradient id="medal-necklace-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#23538f" />
          <stop offset="50%" stopColor="#3a78c4" />
          <stop offset="100%" stopColor="#1d4677" />
        </linearGradient>
        <radialGradient id="medal-necklace-disc" cx="0.38" cy="0.34" r="0.75">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="45%" stopColor="#f4c84e" />
          <stop offset="100%" stopColor="#b9821f" />
        </radialGradient>
        <radialGradient id="medal-necklace-core" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#fff4cf" />
          <stop offset="100%" stopColor="#e0a82e" />
        </radialGradient>
      </defs>
      {/* Ribbon V around the neck down to chest */}
      <path d="M49 60 L58 80 L57 82 L48 62 Z" fill="url(#medal-necklace-ribbon)" stroke="#163659" strokeWidth="1" />
      <path d="M71 60 L62 80 L63 82 L72 62 Z" fill="url(#medal-necklace-ribbon)" stroke="#163659" strokeWidth="1" />
      <path d="M50 61 L58 79.5" stroke="#5a93d6" strokeWidth="0.5" opacity="0.6" />
      <path d="M70 61 L62 79.5" stroke="#5a93d6" strokeWidth="0.5" opacity="0.6" />
      {/* Ribbon clasp ring */}
      <circle cx="60" cy="81" r="2.2" fill="#cdd4dc" stroke="#8a929c" strokeWidth="0.8" />
      {/* Medal disc */}
      <circle cx="60" cy="88" r="8.5" fill="url(#medal-necklace-disc)" stroke="#9a6b16" strokeWidth="1.1" />
      <circle cx="60" cy="88" r="6.4" fill="none" stroke="#b9821f" strokeWidth="0.7" opacity="0.7" />
      {/* Sheen on disc */}
      <path d="M55 83.5 Q57 82 60 82" stroke="#fff6d8" strokeWidth="1.1" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* Embossed atom emblem */}
      <circle cx="60" cy="88" r="1.6" fill="url(#medal-necklace-core)" stroke="#9a6b16" strokeWidth="0.5" />
      <ellipse cx="60" cy="88" rx="5.2" ry="2" fill="none" stroke="#9a6b16" strokeWidth="0.8" />
      <ellipse cx="60" cy="88" rx="5.2" ry="2" fill="none" stroke="#9a6b16" strokeWidth="0.8" transform="rotate(60 60 88)" />
      <ellipse cx="60" cy="88" rx="5.2" ry="2" fill="none" stroke="#9a6b16" strokeWidth="0.8" transform="rotate(120 60 88)" />
      {/* Tiny gem electrons */}
      <circle cx="65.2" cy="88" r="0.9" fill="#7fd0ff" stroke="#2f6f9c" strokeWidth="0.3" />
      <circle cx="57.4" cy="83.6" r="0.9" fill="#7fd0ff" stroke="#2f6f9c" strokeWidth="0.3" />
      <circle cx="57.4" cy="92.4" r="0.9" fill="#7fd0ff" stroke="#2f6f9c" strokeWidth="0.3" />
    </g>
  );
}
