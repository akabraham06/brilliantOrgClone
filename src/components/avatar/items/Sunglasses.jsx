export default function Sunglasses() {
  return (
    <g>
      <defs>
        <linearGradient id="sunglasses-lens" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#3b4250" />
          <stop offset="45%" stopColor="#1c2027" />
          <stop offset="100%" stopColor="#0a0c10" />
        </linearGradient>
        <linearGradient id="sunglasses-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b2e36" />
          <stop offset="100%" stopColor="#101216" />
        </linearGradient>
      </defs>
      {/* Temple arms */}
      <path d="M44 35.5 L42 34.4" fill="none" stroke="url(#sunglasses-frame)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M76 35.5 L78 34.4" fill="none" stroke="url(#sunglasses-frame)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Lens bodies */}
      <rect x="44.5" y="33.5" width="13" height="9.5" rx="4" fill="url(#sunglasses-lens)" stroke="url(#sunglasses-frame)" strokeWidth="2" />
      <rect x="62.5" y="33.5" width="13" height="9.5" rx="4" fill="url(#sunglasses-lens)" stroke="url(#sunglasses-frame)" strokeWidth="2" />
      {/* Bridge */}
      <path d="M57.5 35.4 Q60 34.2 62.5 35.4" fill="none" stroke="url(#sunglasses-frame)" strokeWidth="2.4" strokeLinecap="round" />
      {/* Tint deepening at bottom */}
      <rect x="45.5" y="39.5" width="11" height="3" rx="2" fill="#04060a" opacity="0.5" />
      <rect x="63.5" y="39.5" width="11" height="3" rx="2" fill="#04060a" opacity="0.5" />
      {/* Glossy highlights */}
      <path d="M46.5 35.5 Q49 34 53 34.6" fill="none" stroke="#aebfd4" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      <path d="M64.5 35.5 Q67 34 71 34.6" fill="none" stroke="#aebfd4" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      <circle cx="47.6" cy="36.4" r="0.9" fill="#dfe8f3" opacity="0.6" />
      <circle cx="65.6" cy="36.4" r="0.9" fill="#dfe8f3" opacity="0.6" />
    </g>
  );
}
