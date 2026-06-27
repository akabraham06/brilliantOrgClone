export default function CargoPants() {
  return (
    <g>
      <defs>
        <linearGradient id="cargo-pants-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a7a4a" />
          <stop offset="50%" stopColor="#9a9a60" />
          <stop offset="100%" stopColor="#6e6e42" />
        </linearGradient>
        <linearGradient id="cargo-pants-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a4a468" />
          <stop offset="100%" stopColor="#7a7a4a" />
        </linearGradient>
      </defs>
      {/* Waistband */}
      <rect x="38" y="104" width="44" height="7" rx="2" fill="url(#cargo-pants-band)" stroke="#52522e" strokeWidth="1" />
      <line x1="38.5" y1="107.5" x2="81.5" y2="107.5" stroke="#52522e" strokeWidth="0.4" />
      {/* Belt loops */}
      <rect x="42" y="103.5" width="2.4" height="4" rx="0.5" fill="#6e6e42" stroke="#52522e" strokeWidth="0.5" />
      <rect x="58.8" y="103.5" width="2.4" height="4" rx="0.5" fill="#6e6e42" stroke="#52522e" strokeWidth="0.5" />
      <rect x="75.6" y="103.5" width="2.4" height="4" rx="0.5" fill="#6e6e42" stroke="#52522e" strokeWidth="0.5" />
      {/* Button */}
      <circle cx="60" cy="107.5" r="1.5" fill="#4a4a2a" stroke="#33331c" strokeWidth="0.5" />
      {/* Left leg */}
      <path d="M40 111 L58 111 L57 134 L45 134 L41.5 119 Z" fill="url(#cargo-pants-fabric)" stroke="#52522e" strokeWidth="1" />
      {/* Right leg */}
      <path d="M62 111 L80 111 L78.5 119 L75 134 L63 134 Z" fill="url(#cargo-pants-fabric)" stroke="#52522e" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 111 Q60 116 62 111" fill="none" stroke="#52522e" strokeWidth="1" />
      {/* Inseams */}
      <line x1="51" y1="119" x2="51" y2="133" stroke="#5c5c34" strokeWidth="0.7" />
      <line x1="69" y1="119" x2="69" y2="133" stroke="#5c5c34" strokeWidth="0.7" />
      {/* Large side flap pockets */}
      <rect x="41.5" y="120" width="13" height="11" rx="1.2" fill="#86864f" stroke="#52522e" strokeWidth="0.9" />
      <rect x="65.5" y="120" width="13" height="11" rx="1.2" fill="#86864f" stroke="#52522e" strokeWidth="0.9" />
      {/* Pocket flaps */}
      <path d="M41 119.5 L55 119.5 L54 123 L42 123 Z" fill="#90905a" stroke="#52522e" strokeWidth="0.8" />
      <path d="M65 119.5 L79 119.5 L78 123 L66 123 Z" fill="#90905a" stroke="#52522e" strokeWidth="0.8" />
      {/* Flap buttons */}
      <circle cx="48" cy="122.8" r="1" fill="#4a4a2a" stroke="#33331c" strokeWidth="0.4" />
      <circle cx="72" cy="122.8" r="1" fill="#4a4a2a" stroke="#33331c" strokeWidth="0.4" />
      {/* Pocket stitching */}
      <rect x="43" y="124" width="10" height="6" rx="0.6" fill="none" stroke="#5c5c34" strokeWidth="0.4" strokeDasharray="1.4 1" />
      <rect x="67" y="124" width="10" height="6" rx="0.6" fill="none" stroke="#5c5c34" strokeWidth="0.4" strokeDasharray="1.4 1" />
      {/* Thigh pocket hints */}
      <rect x="43" y="113" width="7" height="5" rx="0.6" fill="none" stroke="#5c5c34" strokeWidth="0.5" />
      <rect x="70" y="113" width="7" height="5" rx="0.6" fill="none" stroke="#5c5c34" strokeWidth="0.5" />
      {/* Knee seam reinforcement */}
      <path d="M45 126 L56 126" fill="none" stroke="#5c5c34" strokeWidth="0.5" />
      <path d="M64 126 L75 126" fill="none" stroke="#5c5c34" strokeWidth="0.5" />
      {/* Hem cuffs */}
      <rect x="44.5" y="131.5" width="12.5" height="2.5" rx="0.6" fill="#5c5c34" />
      <rect x="63" y="131.5" width="12.5" height="2.5" rx="0.6" fill="#5c5c34" />
    </g>
  );
}
