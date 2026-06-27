export default function Jeans() {
  return (
    <g>
      <defs>
        <linearGradient id="jeans-denim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a6ea5" />
          <stop offset="45%" stopColor="#4f86c6" />
          <stop offset="100%" stopColor="#345f93" />
        </linearGradient>
        <linearGradient id="jeans-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a91cf" />
          <stop offset="100%" stopColor="#3f6fa8" />
        </linearGradient>
      </defs>
      {/* Waistband */}
      <rect x="38" y="104" width="44" height="7" rx="2" fill="url(#jeans-band)" stroke="#274a73" strokeWidth="1" />
      <line x1="38" y1="107.5" x2="82" y2="107.5" stroke="#f0a14b" strokeWidth="0.5" strokeDasharray="1.6 1.4" />
      {/* Belt loops */}
      <rect x="41" y="103.5" width="2.4" height="4" rx="0.6" fill="#345f93" stroke="#274a73" strokeWidth="0.5" />
      <rect x="58.8" y="103.5" width="2.4" height="4" rx="0.6" fill="#345f93" stroke="#274a73" strokeWidth="0.5" />
      <rect x="76.8" y="103.5" width="2.4" height="4" rx="0.6" fill="#345f93" stroke="#274a73" strokeWidth="0.5" />
      {/* Button */}
      <circle cx="60" cy="107.5" r="1.6" fill="#d9b24a" stroke="#9c7c2c" strokeWidth="0.6" />
      <circle cx="60" cy="107.5" r="0.6" fill="#9c7c2c" />
      {/* Left leg */}
      <path d="M40 111 L58 111 L57 134 L45 134 L41.5 118 Z" fill="url(#jeans-denim)" stroke="#274a73" strokeWidth="1" />
      {/* Right leg */}
      <path d="M62 111 L80 111 L78.5 118 L75 134 L63 134 Z" fill="url(#jeans-denim)" stroke="#274a73" strokeWidth="1" />
      {/* Center seam / crotch */}
      <path d="M58 111 Q60 116 62 111" fill="none" stroke="#274a73" strokeWidth="1" />
      {/* Inseams */}
      <line x1="50" y1="118" x2="50" y2="133" stroke="#2c527f" strokeWidth="0.7" />
      <line x1="70" y1="118" x2="70" y2="133" stroke="#2c527f" strokeWidth="0.7" />
      {/* Outer leg fold shading */}
      <path d="M41.5 118 L45 134 L47 134 L44 117 Z" fill="#2f588a" opacity="0.5" />
      <path d="M78.5 118 L75 134 L73 134 L76 117 Z" fill="#2f588a" opacity="0.5" />
      {/* Front pockets with orange topstitching */}
      <path d="M41 112 L48 112 L46 119 Z" fill="none" stroke="#f0a14b" strokeWidth="0.7" />
      <path d="M72 112 L79 112 L74 119 Z" fill="none" stroke="#f0a14b" strokeWidth="0.7" />
      <path d="M41 112.8 L47.4 112.8 L45.6 118 Z" fill="none" stroke="#f0a14b" strokeWidth="0.4" />
      <path d="M72.6 112.8 L78.4 112.8 L74 117.6 Z" fill="none" stroke="#f0a14b" strokeWidth="0.4" />
      {/* Coin pocket */}
      <path d="M46.5 112 L49 112 L48.2 114.5 Z" fill="none" stroke="#f0a14b" strokeWidth="0.5" />
      {/* Knee fade highlights */}
      <ellipse cx="50" cy="124" rx="5" ry="3" fill="#6fa0d6" opacity="0.3" />
      <ellipse cx="70" cy="124" rx="5" ry="3" fill="#6fa0d6" opacity="0.3" />
      {/* Hem cuffs */}
      <rect x="44.5" y="131.5" width="12.5" height="2.5" rx="0.8" fill="#2c527f" />
      <rect x="63" y="131.5" width="12.5" height="2.5" rx="0.8" fill="#2c527f" />
      <line x1="45" y1="132.6" x2="56.5" y2="132.6" stroke="#f0a14b" strokeWidth="0.4" strokeDasharray="1.4 1.2" />
      <line x1="63.5" y1="132.6" x2="75" y2="132.6" stroke="#f0a14b" strokeWidth="0.4" strokeDasharray="1.4 1.2" />
    </g>
  );
}
