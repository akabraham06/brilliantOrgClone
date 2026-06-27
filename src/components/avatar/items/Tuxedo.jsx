export default function Tuxedo() {
  return (
    <g>
      <defs>
        <linearGradient id="tuxedo-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#15161c" />
          <stop offset="45%" stopColor="#272a36" />
          <stop offset="100%" stopColor="#101117" />
        </linearGradient>
        <linearGradient id="tuxedo-lapel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3d4d" />
          <stop offset="50%" stopColor="#1d1f28" />
          <stop offset="100%" stopColor="#0e0f14" />
        </linearGradient>
        <linearGradient id="tuxedo-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e6ee" />
        </linearGradient>
      </defs>
      {/* Jacket body */}
      <path d="M34 66 Q44 63 52 64 L60 70 L68 64 Q76 63 86 66 L83 107 Q60 112 37 107 Z" fill="url(#tuxedo-body)" stroke="#08090d" strokeWidth="1" />
      {/* Sleeves */}
      <path d="M34 66 Q28 72 30 83 L41 81 L41 68 Z" fill="url(#tuxedo-body)" stroke="#08090d" strokeWidth="1" />
      <path d="M86 66 Q92 72 90 83 L79 81 L79 68 Z" fill="url(#tuxedo-body)" stroke="#08090d" strokeWidth="1" />
      {/* White shirt front */}
      <path d="M52 65 L60 71 L68 65 L66 106 Q60 109 54 106 Z" fill="url(#tuxedo-shirt)" stroke="#c6ccd6" strokeWidth="0.8" />
      <path d="M60 71 L60 105" stroke="#d2d8e0" strokeWidth="0.7" />
      {/* Shirt buttons */}
      <circle cx="60" cy="86" r="0.9" fill="#2a2c36" />
      <circle cx="60" cy="92" r="0.9" fill="#2a2c36" />
      <circle cx="60" cy="98" r="0.9" fill="#2a2c36" />
      {/* Satin lapels */}
      <path d="M52 64 L60 70 L57 90 L47 80 Z" fill="url(#tuxedo-lapel)" stroke="#06070a" strokeWidth="0.9" />
      <path d="M68 64 L60 70 L63 90 L73 80 Z" fill="url(#tuxedo-lapel)" stroke="#06070a" strokeWidth="0.9" />
      {/* Satin sheen */}
      <path d="M53 66 L59 71 L57 86 L50 79 Z" fill="#4a4f64" opacity="0.55" />
      <path d="M67 66 L61 71 L63 86 L70 79 Z" fill="#4a4f64" opacity="0.55" />
      <path d="M51 67 L58 72" stroke="#5d6480" strokeWidth="0.7" opacity="0.7" />
      <path d="M69 67 L62 72" stroke="#5d6480" strokeWidth="0.7" opacity="0.7" />
      {/* Bow tie */}
      <path d="M54 70 L60 73 L54 76 Z" fill="#101117" stroke="#05060a" strokeWidth="0.7" />
      <path d="M66 70 L60 73 L66 76 Z" fill="#101117" stroke="#05060a" strokeWidth="0.7" />
      <rect x="58.5" y="71.5" width="3" height="3" rx="0.5" fill="#1c1e27" stroke="#05060a" strokeWidth="0.6" />
      <path d="M55 71 L58.5 73 M55 75 L58.5 73" stroke="#2a2c36" strokeWidth="0.5" />
      <path d="M65 71 L61.5 73 M65 75 L61.5 73" stroke="#2a2c36" strokeWidth="0.5" />
      {/* Jacket buttons */}
      <circle cx="55" cy="96" r="1.4" fill="#3a3d4d" stroke="#08090d" strokeWidth="0.5" />
      <circle cx="55" cy="103" r="1.4" fill="#3a3d4d" stroke="#08090d" strokeWidth="0.5" />
      {/* Fold shading + highlight */}
      <path d="M42 70 Q44 90 42 106" stroke="#06070a" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M78 70 Q76 90 78 106" stroke="#06070a" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M45 69 Q47 88 46 104" stroke="#3a3d4d" strokeWidth="0.9" fill="none" opacity="0.6" />
      {/* Pocket square */}
      <path d="M72 84 L80 84 L79 88 L73 88 Z" fill="#0f1015" stroke="#06070a" strokeWidth="0.6" />
      <path d="M74 84 L74 81 L76 84 M76.5 84 L77 81 L78 84" stroke="#e2e6ee" strokeWidth="0.8" fill="none" />
    </g>
  );
}
