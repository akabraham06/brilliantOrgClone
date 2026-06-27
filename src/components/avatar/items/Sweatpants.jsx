export default function Sweatpants() {
  return (
    <g>
      <defs>
        <linearGradient id="sweatpants-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a8f96" />
          <stop offset="50%" stopColor="#a7adb5" />
          <stop offset="100%" stopColor="#7d828a" />
        </linearGradient>
        <linearGradient id="sweatpants-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b3b9c0" />
          <stop offset="100%" stopColor="#8a8f96" />
        </linearGradient>
      </defs>
      {/* Elastic waistband */}
      <rect x="38" y="104" width="44" height="7.5" rx="3" fill="url(#sweatpants-band)" stroke="#5f646b" strokeWidth="1" />
      {/* Elastic ribbing */}
      <line x1="38.5" y1="105.5" x2="81.5" y2="105.5" stroke="#6f747b" strokeWidth="0.4" />
      <line x1="38.5" y1="107.5" x2="81.5" y2="107.5" stroke="#6f747b" strokeWidth="0.4" />
      <line x1="38.5" y1="109.5" x2="81.5" y2="109.5" stroke="#6f747b" strokeWidth="0.4" />
      {/* Drawstring */}
      <path d="M54 111.5 Q57 109.5 60 111 Q63 109.5 66 111.5" fill="none" stroke="#5f646b" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="54" cy="111.5" r="0.9" fill="#5f646b" />
      <circle cx="66" cy="111.5" r="0.9" fill="#5f646b" />
      {/* Left leg (relaxed) */}
      <path d="M40 111 Q39 122 43 130 L55 130 Q57 120 57.5 111 Z" fill="url(#sweatpants-fabric)" stroke="#5f646b" strokeWidth="1" />
      {/* Right leg (relaxed) */}
      <path d="M62.5 111 Q63 120 65 130 L77 130 Q81 122 80 111 Z" fill="url(#sweatpants-fabric)" stroke="#5f646b" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 111 Q60 116 62 111" fill="none" stroke="#5f646b" strokeWidth="0.9" />
      {/* Relaxed fold wrinkles */}
      <path d="M46 114 Q44 122 47 129" fill="none" stroke="#6f747b" strokeWidth="0.6" opacity="0.7" />
      <path d="M52 114 Q51 122 52 129" fill="none" stroke="#6f747b" strokeWidth="0.6" opacity="0.7" />
      <path d="M68 114 Q69 122 68 129" fill="none" stroke="#6f747b" strokeWidth="0.6" opacity="0.7" />
      <path d="M74 114 Q76 122 73 129" fill="none" stroke="#6f747b" strokeWidth="0.6" opacity="0.7" />
      {/* Highlights */}
      <path d="M42 113 Q41 122 44 129" fill="none" stroke="#c4cad1" strokeWidth="0.7" opacity="0.5" />
      <path d="M78 113 Q79 122 76 129" fill="none" stroke="#c4cad1" strokeWidth="0.7" opacity="0.5" />
      {/* Ribbed ankle cuffs */}
      <rect x="42" y="129.5" width="14" height="4.5" rx="1.4" fill="#7d828a" stroke="#5f646b" strokeWidth="0.8" />
      <rect x="64" y="129.5" width="14" height="4.5" rx="1.4" fill="#7d828a" stroke="#5f646b" strokeWidth="0.8" />
      <line x1="44" y1="130" x2="44" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="47" y1="130" x2="47" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="50" y1="130" x2="50" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="53" y1="130" x2="53" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="66" y1="130" x2="66" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="69" y1="130" x2="69" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="72" y1="130" x2="72" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
      <line x1="75" y1="130" x2="75" y2="133.5" stroke="#5f646b" strokeWidth="0.4" />
    </g>
  );
}
