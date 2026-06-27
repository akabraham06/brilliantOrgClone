export default function Shorts() {
  return (
    <g>
      <defs>
        <linearGradient id="shorts-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c44f3a" />
          <stop offset="50%" stopColor="#e06848" />
          <stop offset="100%" stopColor="#b8442f" />
        </linearGradient>
        <linearGradient id="shorts-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e87a59" />
          <stop offset="100%" stopColor="#c44f3a" />
        </linearGradient>
      </defs>
      {/* Waistband */}
      <rect x="38" y="104" width="44" height="7" rx="3" fill="url(#shorts-band)" stroke="#8f3322" strokeWidth="1" />
      <line x1="38.5" y1="106" x2="81.5" y2="106" stroke="#f3b9a8" strokeWidth="0.5" opacity="0.7" />
      <line x1="38.5" y1="109" x2="81.5" y2="109" stroke="#8f3322" strokeWidth="0.4" />
      {/* Drawstring */}
      <path d="M55 111 Q58 109 60 110.5 Q62 109 65 111" fill="none" stroke="#f5e9c8" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="55" cy="111" r="0.9" fill="#e8d49a" />
      <circle cx="65" cy="111" r="0.9" fill="#e8d49a" />
      {/* Left leg panel */}
      <path d="M40 110 L58 110 L57.5 122 L44 122 L41 116 Z" fill="url(#shorts-fabric)" stroke="#8f3322" strokeWidth="1" />
      {/* Right leg panel */}
      <path d="M62 110 L80 110 L79 116 L76 122 L62.5 122 Z" fill="url(#shorts-fabric)" stroke="#8f3322" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 110 Q60 115 62 110" fill="none" stroke="#8f3322" strokeWidth="1" />
      {/* Side seams */}
      <line x1="41" y1="116" x2="44" y2="122" stroke="#8f3322" strokeWidth="0.7" />
      <line x1="79" y1="116" x2="76" y2="122" stroke="#8f3322" strokeWidth="0.7" />
      {/* Fold shading */}
      <path d="M48 110 L50 122 L52 122 L50 110 Z" fill="#9c3a27" opacity="0.4" />
      <path d="M68 110 L70 122 L72 122 L70 110 Z" fill="#9c3a27" opacity="0.4" />
      {/* Highlights */}
      <path d="M43 111 L45 120 L46 120 L44 111 Z" fill="#f08f73" opacity="0.45" />
      <path d="M73 111 L75 120 L76 120 L74 111 Z" fill="#f08f73" opacity="0.45" />
      {/* Hem cuffs */}
      <rect x="43" y="120.5" width="15" height="3" rx="1" fill="#a93c28" stroke="#8f3322" strokeWidth="0.6" />
      <rect x="62" y="120.5" width="15" height="3" rx="1" fill="#a93c28" stroke="#8f3322" strokeWidth="0.6" />
      <line x1="44" y1="122" x2="57" y2="122" stroke="#f3b9a8" strokeWidth="0.4" strokeDasharray="1.4 1.2" />
      <line x1="63" y1="122" x2="76" y2="122" stroke="#f3b9a8" strokeWidth="0.4" strokeDasharray="1.4 1.2" />
      {/* Side pocket hints */}
      <path d="M42 113 L42 118" fill="none" stroke="#8f3322" strokeWidth="0.5" />
      <path d="M78 113 L78 118" fill="none" stroke="#8f3322" strokeWidth="0.5" />
    </g>
  );
}
