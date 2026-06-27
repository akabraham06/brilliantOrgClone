export default function RoundGlasses() {
  return (
    <g>
      <defs>
        <linearGradient id="round-glasses-wire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d680" />
          <stop offset="50%" stopColor="#d9ab43" />
          <stop offset="100%" stopColor="#a87c25" />
        </linearGradient>
        <radialGradient id="round-glasses-lens" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#eaf4ff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#cfe2f2" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#aac4da" stopOpacity="0.18" />
        </radialGradient>
      </defs>
      {/* Lenses fill */}
      <circle cx="51" cy="38" r="7.5" fill="url(#round-glasses-lens)" />
      <circle cx="69" cy="38" r="7.5" fill="url(#round-glasses-lens)" />
      {/* Wire rims */}
      <circle cx="51" cy="38" r="7.5" fill="none" stroke="url(#round-glasses-wire)" strokeWidth="1.6" />
      <circle cx="51" cy="38" r="7.5" fill="none" stroke="#8a6420" strokeWidth="0.4" opacity="0.6" />
      <circle cx="69" cy="38" r="7.5" fill="none" stroke="url(#round-glasses-wire)" strokeWidth="1.6" />
      <circle cx="69" cy="38" r="7.5" fill="none" stroke="#8a6420" strokeWidth="0.4" opacity="0.6" />
      {/* Bridge */}
      <path d="M58.5 36.5 Q60 34.6 61.5 36.5" fill="none" stroke="url(#round-glasses-wire)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Temple arms */}
      <path d="M43.6 36.2 L42 35.4" fill="none" stroke="url(#round-glasses-wire)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M76.4 36.2 L78 35.4" fill="none" stroke="url(#round-glasses-wire)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Lens hinges */}
      <circle cx="43.6" cy="36.4" r="0.9" fill="#caa23c" stroke="#8a6420" strokeWidth="0.3" />
      <circle cx="76.4" cy="36.4" r="0.9" fill="#caa23c" stroke="#8a6420" strokeWidth="0.3" />
      {/* Specular highlights */}
      <path d="M47.5 34 Q49.5 32.5 51.5 33.4" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <path d="M65.5 34 Q67.5 32.5 69.5 33.4" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <circle cx="48.4" cy="35.6" r="0.7" fill="#ffffff" opacity="0.7" />
      <circle cx="66.4" cy="35.6" r="0.7" fill="#ffffff" opacity="0.7" />
    </g>
  );
}
