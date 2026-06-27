export default function Hoodie() {
  return (
    <g>
      <defs>
        <linearGradient id="hoodie-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b5a86" />
          <stop offset="50%" stopColor="#4a6ea3" />
          <stop offset="100%" stopColor="#324d73" />
        </linearGradient>
        <linearGradient id="hoodie-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a577f" />
          <stop offset="100%" stopColor="#2c4467" />
        </linearGradient>
        <linearGradient id="hoodie-pocket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c5b87" />
          <stop offset="100%" stopColor="#2f4a70" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 52 65 L60 71 L68 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" fill="url(#hoodie-body)" stroke="#243a59" strokeWidth="1" />
      {/* Short sleeve caps */}
      <path d="M34 67 Q28 73 30 84 L41 82 L41 69 Z" fill="url(#hoodie-body)" stroke="#243a59" strokeWidth="1" />
      <path d="M86 67 Q92 73 90 84 L79 82 L79 69 Z" fill="url(#hoodie-body)" stroke="#243a59" strokeWidth="1" />
      {/* Ribbed cuffs */}
      <path d="M30 84 L41 82 L41 87 L31 89 Z" fill="#2a4267" stroke="#1e3150" strokeWidth="0.7" />
      <path d="M90 84 L79 82 L79 87 L89 89 Z" fill="#2a4267" stroke="#1e3150" strokeWidth="0.7" />
      <path d="M32 84.5 L40 83" stroke="#3a577f" strokeWidth="0.5" />
      <path d="M32.5 86.5 L40.5 85" stroke="#3a577f" strokeWidth="0.5" />
      <path d="M88 84.5 L80 83" stroke="#3a577f" strokeWidth="0.5" />
      <path d="M87.5 86.5 L79.5 85" stroke="#3a577f" strokeWidth="0.5" />
      {/* Hood folds at neck */}
      <path d="M50 64 Q47 70 50 78 L56 70 Z" fill="url(#hoodie-hood)" stroke="#243a59" strokeWidth="0.9" />
      <path d="M70 64 Q73 70 70 78 L64 70 Z" fill="url(#hoodie-hood)" stroke="#243a59" strokeWidth="0.9" />
      <path d="M52 64 Q60 67 68 64 L66 70 Q60 73 54 70 Z" fill="#2c4467" stroke="#243a59" strokeWidth="0.9" />
      <path d="M53 65 Q60 68 67 65" stroke="#1f3252" strokeWidth="0.6" fill="none" />
      {/* Neck opening inner */}
      <path d="M55 67 Q60 70 65 67 L64 71 Q60 73 56 71 Z" fill="#21344f" />
      {/* Drawstrings */}
      <path d="M57 71 L56 86" stroke="#dfe6ee" strokeWidth="1.1" fill="none" />
      <path d="M63 71 L64 86" stroke="#dfe6ee" strokeWidth="1.1" fill="none" />
      <circle cx="56" cy="87" r="1.1" fill="#c4ccd7" />
      <circle cx="64" cy="87" r="1.1" fill="#c4ccd7" />
      {/* Kangaroo pocket */}
      <path d="M44 90 L76 90 L74 102 L46 102 Z" fill="url(#hoodie-pocket)" stroke="#243a59" strokeWidth="0.9" />
      <path d="M44 90 Q60 88 76 90" stroke="#2a4267" strokeWidth="0.8" fill="none" />
      <path d="M46 102 L48 96 M74 102 L72 96" stroke="#2a4267" strokeWidth="0.7" fill="none" />
      {/* Fold shading */}
      <path d="M42 72 Q45 90 43 106" stroke="#2c4467" strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M78 72 Q75 90 77 106" stroke="#2c4467" strokeWidth="1.3" fill="none" opacity="0.7" />
      <path d="M48 73 Q50 84 49 88" stroke="#5b7fb5" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Ribbed hem */}
      <path d="M37 107 Q60 112 83 107 L82.5 110 Q60 114.5 37.5 110 Z" fill="#2a4267" stroke="#1e3150" strokeWidth="0.8" />
      <path d="M42 109 L42 111 M50 110 L50 112.5 M60 110.5 L60 113 M70 110 L70 112.5 M78 109 L78 111" stroke="#3a577f" strokeWidth="0.6" />
      {/* Highlight */}
      <path d="M46 71 Q48 88 47 105" stroke="#6a8cc0" strokeWidth="0.9" fill="none" opacity="0.5" />
    </g>
  );
}
