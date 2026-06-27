export default function Overalls() {
  return (
    <g>
      <defs>
        <linearGradient id="overalls-denim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3461a0" />
          <stop offset="50%" stopColor="#4a7cc0" />
          <stop offset="100%" stopColor="#2e5790" />
        </linearGradient>
        <linearGradient id="overalls-bib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a7cc0" />
          <stop offset="100%" stopColor="#3461a0" />
        </linearGradient>
      </defs>
      {/* Shoulder straps (extend onto torso) */}
      <path d="M46 64 L51 64 L53 98 L48 98 Z" fill="url(#overalls-denim)" stroke="#244875" strokeWidth="1" />
      <path d="M69 64 L74 64 L72 98 L67 98 Z" fill="url(#overalls-denim)" stroke="#244875" strokeWidth="1" />
      {/* Strap stitching */}
      <line x1="47.5" y1="66" x2="49.3" y2="96" stroke="#e8943f" strokeWidth="0.4" strokeDasharray="1.6 1.4" />
      <line x1="70.5" y1="66" x2="72.5" y2="96" stroke="#e8943f" strokeWidth="0.4" strokeDasharray="1.6 1.4" />
      {/* Strap buckles */}
      <rect x="47" y="92" width="6" height="5" rx="1" fill="#cfa93f" stroke="#9c7c2c" strokeWidth="0.7" />
      <rect x="67" y="92" width="6" height="5" rx="1" fill="#cfa93f" stroke="#9c7c2c" strokeWidth="0.7" />
      <rect x="48.5" y="93.2" width="3" height="2.6" rx="0.4" fill="#3461a0" />
      <rect x="68.5" y="93.2" width="3" height="2.6" rx="0.4" fill="#3461a0" />
      {/* Bib panel */}
      <path d="M48 96 L72 96 L73 110 L47 110 Z" fill="url(#overalls-bib)" stroke="#244875" strokeWidth="1" />
      {/* Front bib pocket */}
      <rect x="53" y="99" width="14" height="9" rx="1" fill="#3c6aa8" stroke="#244875" strokeWidth="0.8" />
      <rect x="54.5" y="100.5" width="11" height="6" rx="0.6" fill="none" stroke="#e8943f" strokeWidth="0.5" strokeDasharray="1.6 1.2" />
      <line x1="60" y1="99" x2="60" y2="108" stroke="#244875" strokeWidth="0.5" />
      {/* Waistband */}
      <rect x="40" y="109" width="40" height="6" rx="1.5" fill="#2e5790" stroke="#244875" strokeWidth="1" />
      <line x1="40.5" y1="112" x2="79.5" y2="112" stroke="#e8943f" strokeWidth="0.4" strokeDasharray="1.6 1.4" />
      {/* Side buttons */}
      <circle cx="42" cy="112" r="1.3" fill="#cfa93f" stroke="#9c7c2c" strokeWidth="0.5" />
      <circle cx="78" cy="112" r="1.3" fill="#cfa93f" stroke="#9c7c2c" strokeWidth="0.5" />
      {/* Left leg */}
      <path d="M40 114 L58 114 L57 134 L45 134 L41.5 120 Z" fill="url(#overalls-denim)" stroke="#244875" strokeWidth="1" />
      {/* Right leg */}
      <path d="M62 114 L80 114 L78.5 120 L75 134 L63 134 Z" fill="url(#overalls-denim)" stroke="#244875" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 114 Q60 118 62 114" fill="none" stroke="#244875" strokeWidth="1" />
      {/* Inseams */}
      <line x1="51" y1="120" x2="51" y2="133" stroke="#27507f" strokeWidth="0.7" />
      <line x1="69" y1="120" x2="69" y2="133" stroke="#27507f" strokeWidth="0.7" />
      {/* Leg highlights */}
      <path d="M43 116 L46 132 L47 132 L44 116 Z" fill="#6592cf" opacity="0.4" />
      <path d="M77 116 L74 132 L73 132 L76 116 Z" fill="#6592cf" opacity="0.4" />
      {/* Hem cuffs */}
      <rect x="44.5" y="131.5" width="12.5" height="2.5" rx="0.7" fill="#27507f" />
      <rect x="63" y="131.5" width="12.5" height="2.5" rx="0.7" fill="#27507f" />
    </g>
  );
}
