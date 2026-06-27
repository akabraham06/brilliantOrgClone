export default function TrackPants() {
  return (
    <g>
      <defs>
        <linearGradient id="track-pants-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f2530" />
          <stop offset="50%" stopColor="#2c3545" />
          <stop offset="100%" stopColor="#181d26" />
        </linearGradient>
        <linearGradient id="track-pants-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#323c4e" />
          <stop offset="100%" stopColor="#1f2530" />
        </linearGradient>
      </defs>
      {/* Elastic waistband */}
      <rect x="38" y="104" width="44" height="7" rx="2.5" fill="url(#track-pants-band)" stroke="#0f131a" strokeWidth="1" />
      <line x1="38.5" y1="106" x2="81.5" y2="106" stroke="#3d4860" strokeWidth="0.4" />
      <line x1="38.5" y1="108.5" x2="81.5" y2="108.5" stroke="#3d4860" strokeWidth="0.4" />
      {/* Left leg */}
      <path d="M40 111 L58 111 L57 134 L45 134 L41.5 119 Z" fill="url(#track-pants-fabric)" stroke="#0f131a" strokeWidth="1" />
      {/* Right leg */}
      <path d="M62 111 L80 111 L78.5 119 L75 134 L63 134 Z" fill="url(#track-pants-fabric)" stroke="#0f131a" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 111 Q60 116 62 111" fill="none" stroke="#0f131a" strokeWidth="1" />
      {/* Contrasting vertical stripes down each leg */}
      <path d="M42 111 L44.5 130 L47 130 L44.6 111 Z" fill="#e23b4a" stroke="#9c1f2c" strokeWidth="0.4" />
      <path d="M78 111 L75.5 130 L73 130 L75.4 111 Z" fill="#e23b4a" stroke="#9c1f2c" strokeWidth="0.4" />
      {/* Stripe inner highlight */}
      <path d="M43 111 L45 130 L45.6 130 L43.8 111 Z" fill="#f47481" opacity="0.6" />
      <path d="M77 111 L75 130 L74.4 130 L76.2 111 Z" fill="#f47481" opacity="0.6" />
      {/* Inseams */}
      <line x1="51" y1="119" x2="51" y2="132" stroke="#262f3d" strokeWidth="0.7" />
      <line x1="69" y1="119" x2="69" y2="132" stroke="#262f3d" strokeWidth="0.7" />
      {/* Fold shading */}
      <path d="M52 113 L54 130 L55 130 L53 113 Z" fill="#11151c" opacity="0.5" />
      <path d="M68 113 L66 130 L65 130 L67 113 Z" fill="#11151c" opacity="0.5" />
      {/* Knee highlights */}
      <ellipse cx="51" cy="123" rx="4" ry="2.6" fill="#3d4860" opacity="0.35" />
      <ellipse cx="69" cy="123" rx="4" ry="2.6" fill="#3d4860" opacity="0.35" />
      {/* Elastic cuffs */}
      <rect x="44" y="129.5" width="13" height="4.5" rx="1.4" fill="#181d26" stroke="#0f131a" strokeWidth="0.8" />
      <rect x="63" y="129.5" width="13" height="4.5" rx="1.4" fill="#181d26" stroke="#0f131a" strokeWidth="0.8" />
      <line x1="45" y1="130.2" x2="56" y2="130.2" stroke="#3d4860" strokeWidth="0.4" />
      <line x1="45" y1="132.2" x2="56" y2="132.2" stroke="#3d4860" strokeWidth="0.4" />
      <line x1="64" y1="130.2" x2="75" y2="130.2" stroke="#3d4860" strokeWidth="0.4" />
      <line x1="64" y1="132.2" x2="75" y2="132.2" stroke="#3d4860" strokeWidth="0.4" />
    </g>
  );
}
