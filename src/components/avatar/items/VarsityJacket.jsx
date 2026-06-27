export default function VarsityJacket() {
  return (
    <g>
      <defs>
        <linearGradient id="varsity-jacket-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a2230" />
          <stop offset="50%" stopColor="#9c2c3a" />
          <stop offset="100%" stopColor="#6a1d28" />
        </linearGradient>
        <linearGradient id="varsity-jacket-sleeve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f3f7" />
          <stop offset="100%" stopColor="#d6dbe4" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M40 67 Q48 64 53 65 L60 71 L67 65 Q72 64 80 67 L82 107 Q60 112 38 107 Z" fill="url(#varsity-jacket-body)" stroke="#511620" strokeWidth="1" />
      {/* Contrasting leather sleeves */}
      <path d="M40 67 Q30 73 31 88 L43 86 L43 69 Z" fill="url(#varsity-jacket-sleeve)" stroke="#9aa3b2" strokeWidth="1" />
      <path d="M80 67 Q90 73 89 88 L77 86 L77 69 Z" fill="url(#varsity-jacket-sleeve)" stroke="#9aa3b2" strokeWidth="1" />
      <path d="M34 76 Q37 79 42 77" stroke="#c3c9d4" strokeWidth="0.7" fill="none" opacity="0.7" />
      <path d="M86 76 Q83 79 78 77" stroke="#c3c9d4" strokeWidth="0.7" fill="none" opacity="0.7" />
      {/* Ribbed cuffs (striped) */}
      <path d="M31 88 L43 86 L43 92 L32 94 Z" fill="#511620" stroke="#3a0f17" strokeWidth="0.7" />
      <path d="M89 88 L77 86 L77 92 L88 94 Z" fill="#511620" stroke="#3a0f17" strokeWidth="0.7" />
      <path d="M31.5 90 L43 88 M32 92 L43 90" stroke="#f1f3f7" strokeWidth="0.7" />
      <path d="M88.5 90 L77 88 M88 92 L77 90" stroke="#f1f3f7" strokeWidth="0.7" />
      {/* Ribbed collar (striped) */}
      <path d="M52 64 Q60 70 68 64 L67 60 Q60 58 53 60 Z" fill="#511620" stroke="#3a0f17" strokeWidth="0.9" />
      <path d="M53 61 Q60 63 67 61 M53 62.7 Q60 64.7 67 62.7" stroke="#f1f3f7" strokeWidth="0.7" fill="none" />
      {/* Neck opening */}
      <path d="M55 66 Q60 70 65 66 L64 68 Q60 71 56 68 Z" fill="#4a131c" />
      {/* Front zipper placket */}
      <path d="M60 70 L60 108" stroke="#3a0f17" strokeWidth="1.4" />
      <path d="M58.6 74 L58.6 106 M61.4 74 L61.4 106" stroke="#c9a04a" strokeWidth="0.5" opacity="0.7" />
      {/* Snap buttons */}
      <circle cx="56" cy="80" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      <circle cx="56" cy="90" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      <circle cx="56" cy="100" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      <circle cx="64" cy="80" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      <circle cx="64" cy="90" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      <circle cx="64" cy="100" r="1.1" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.4" />
      {/* Chenille letter patch */}
      <path d="M67 80 L80 80 L79 93 L68 93 Z" fill="#f0e3c2" stroke="#caa44e" strokeWidth="0.9" />
      <text x="73.4" y="90" fontSize="11" fontWeight="bold" fill="#7a2230" textAnchor="middle" fontFamily="Georgia, serif">C</text>
      {/* Fold shading + highlight */}
      <path d="M46 72 Q48 90 46 106" stroke="#6a1d28" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M50 71 Q52 88 51 104" stroke="#b8404f" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Ribbed hem (striped) */}
      <path d="M38 107 Q60 112 82 107 L81.5 111 Q60 116 38.5 111 Z" fill="#511620" stroke="#3a0f17" strokeWidth="0.8" />
      <path d="M40 108.5 Q60 113 80 108.5 M40 110.3 Q60 114.8 80 110.3" stroke="#f1f3f7" strokeWidth="0.7" fill="none" />
    </g>
  );
}
