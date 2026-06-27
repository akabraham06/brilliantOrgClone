export default function Raincoat() {
  return (
    <g>
      <defs>
        <linearGradient id="raincoat-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e6ad17" />
          <stop offset="45%" stopColor="#ffcf3f" />
          <stop offset="100%" stopColor="#d99c0f" />
        </linearGradient>
        <linearGradient id="raincoat-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd84f" />
          <stop offset="100%" stopColor="#e0a615" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L84 108 Q60 113 36 108 Z" fill="url(#raincoat-body)" stroke="#9c6f08" strokeWidth="1" />
      {/* Sleeves */}
      <path d="M34 67 Q27 73 29 86 L41 84 L41 69 Z" fill="url(#raincoat-body)" stroke="#9c6f08" strokeWidth="1" />
      <path d="M86 67 Q93 73 91 86 L79 84 L79 69 Z" fill="url(#raincoat-body)" stroke="#9c6f08" strokeWidth="1" />
      {/* Cuffs */}
      <path d="M29 86 L41 84 L41 89 L30 91 Z" fill="#d99c0f" stroke="#9c6f08" strokeWidth="0.7" />
      <path d="M91 86 L79 84 L79 89 L90 91 Z" fill="#d99c0f" stroke="#9c6f08" strokeWidth="0.7" />
      {/* Hood folds at neck */}
      <path d="M50 64 Q46 71 50 80 L57 71 Z" fill="url(#raincoat-hood)" stroke="#9c6f08" strokeWidth="0.9" />
      <path d="M70 64 Q74 71 70 80 L63 71 Z" fill="url(#raincoat-hood)" stroke="#9c6f08" strokeWidth="0.9" />
      <path d="M52 64 Q60 67 68 64 L66 71 Q60 74 54 71 Z" fill="#e0a615" stroke="#9c6f08" strokeWidth="0.9" />
      {/* Neck opening */}
      <path d="M55 67 Q60 70 65 67 L64 71 Q60 73 56 71 Z" fill="#a37708" />
      {/* Front seam */}
      <path d="M60 71 L60 109" stroke="#b8850c" strokeWidth="1" />
      {/* Toggle buttons */}
      <rect x="53" y="80" width="14" height="3.2" rx="1.6" fill="#5e4708" stroke="#3f3005" strokeWidth="0.5" />
      <rect x="53" y="90" width="14" height="3.2" rx="1.6" fill="#5e4708" stroke="#3f3005" strokeWidth="0.5" />
      <rect x="53" y="100" width="14" height="3.2" rx="1.6" fill="#5e4708" stroke="#3f3005" strokeWidth="0.5" />
      <circle cx="54.5" cy="81.6" r="0.9" fill="#3f3005" />
      <circle cx="65.5" cy="81.6" r="0.9" fill="#3f3005" />
      <circle cx="54.5" cy="91.6" r="0.9" fill="#3f3005" />
      <circle cx="65.5" cy="91.6" r="0.9" fill="#3f3005" />
      <circle cx="54.5" cy="101.6" r="0.9" fill="#3f3005" />
      <circle cx="65.5" cy="101.6" r="0.9" fill="#3f3005" />
      {/* Flap pockets */}
      <path d="M40 96 L51 96 L51 104 L40 104 Z" fill="#e6ad17" stroke="#9c6f08" strokeWidth="0.7" />
      <path d="M69 96 L80 96 L80 104 L69 104 Z" fill="#e6ad17" stroke="#9c6f08" strokeWidth="0.7" />
      <path d="M40 96 L51 96 L51 99 L40 99 Z" fill="#d99c0f" stroke="#9c6f08" strokeWidth="0.6" />
      <path d="M69 96 L80 96 L80 99 L69 99 Z" fill="#d99c0f" stroke="#9c6f08" strokeWidth="0.6" />
      {/* Glossy sheen highlights */}
      <path d="M44 70 Q46 90 45 107" stroke="#fff0b8" strokeWidth="1.6" fill="none" opacity="0.65" />
      <path d="M48 71 Q49 88 48 104" stroke="#ffe27a" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M78 71 Q76 90 78 107" stroke="#c9920d" strokeWidth="1.2" fill="none" opacity="0.6" />
      {/* Hem */}
      <path d="M36 108 Q60 113 84 108 L83.5 110.5 Q60 115.5 36.5 110.5 Z" fill="#d99c0f" stroke="#9c6f08" strokeWidth="0.8" />
    </g>
  );
}
