export default function Tee() {
  return (
    <g>
      <defs>
        <linearGradient id="tee-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c44d52" />
          <stop offset="50%" stopColor="#d96367" />
          <stop offset="100%" stopColor="#b3403f" />
        </linearGradient>
        <radialGradient id="tee-print" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3d6" />
          <stop offset="100%" stopColor="#f4dca0" />
        </radialGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 111 37 107 Z" fill="url(#tee-body)" stroke="#8f2f30" strokeWidth="1" />
      {/* Short sleeves */}
      <path d="M34 67 Q28 72 30 82 L41 80 L41 69 Z" fill="url(#tee-body)" stroke="#8f2f30" strokeWidth="1" />
      <path d="M86 67 Q92 72 90 82 L79 80 L79 69 Z" fill="url(#tee-body)" stroke="#8f2f30" strokeWidth="1" />
      {/* Sleeve hems */}
      <path d="M30 82 L41 80 L41 82.5 L30.5 84.5 Z" fill="#a83a39" stroke="#8f2f30" strokeWidth="0.6" />
      <path d="M90 82 L79 80 L79 82.5 L89.5 84.5 Z" fill="#a83a39" stroke="#8f2f30" strokeWidth="0.6" />
      {/* Crew neck ribbing */}
      <path d="M53 65 Q60 71 67 65 Q60 67 53 65 Z" fill="#a83a39" stroke="#8f2f30" strokeWidth="0.8" />
      <path d="M54 66 Q60 70 66 66" stroke="#e07e80" strokeWidth="0.6" fill="none" />
      {/* Neck opening */}
      <path d="M55 66 Q60 70 65 66 L64 68 Q60 71 56 68 Z" fill="#8a2a2b" />
      {/* Fold shading */}
      <path d="M42 71 Q44 88 42 106" stroke="#b3403f" strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M78 71 Q76 88 78 106" stroke="#b3403f" strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M50 90 Q53 98 51 106" stroke="#b3403f" strokeWidth="0.9" fill="none" opacity="0.5" />
      <path d="M70 90 Q67 98 69 106" stroke="#b3403f" strokeWidth="0.9" fill="none" opacity="0.5" />
      {/* Highlight */}
      <path d="M46 70 Q48 88 47 105" stroke="#e88082" strokeWidth="0.9" fill="none" opacity="0.5" />
      {/* Chest print: atom graphic */}
      <circle cx="60" cy="86" r="9.5" fill="url(#tee-print)" stroke="#caa44e" strokeWidth="0.6" opacity="0.92" />
      <ellipse cx="60" cy="86" rx="7" ry="3" fill="none" stroke="#3b6ea5" strokeWidth="1" />
      <ellipse cx="60" cy="86" rx="7" ry="3" fill="none" stroke="#3b6ea5" strokeWidth="1" transform="rotate(60 60 86)" />
      <ellipse cx="60" cy="86" rx="7" ry="3" fill="none" stroke="#3b6ea5" strokeWidth="1" transform="rotate(-60 60 86)" />
      <circle cx="60" cy="86" r="1.6" fill="#d94f4f" stroke="#8f2f30" strokeWidth="0.5" />
      <circle cx="67" cy="86" r="1" fill="#3b6ea5" />
      <circle cx="56.5" cy="80" r="1" fill="#3b6ea5" />
      <circle cx="56.5" cy="92" r="1" fill="#3b6ea5" />
      {/* Hem */}
      <path d="M37 107 Q60 111 83 107 L82.5 109.5 Q60 113.5 37.5 109.5 Z" fill="#a83a39" stroke="#8f2f30" strokeWidth="0.8" />
    </g>
  );
}
