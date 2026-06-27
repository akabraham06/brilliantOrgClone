export default function StarShades() {
  return (
    <g>
      <defs>
        <linearGradient id="star-shades-lens" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ff6ec7" />
          <stop offset="45%" stopColor="#a45cff" />
          <stop offset="100%" stopColor="#3a6bff" />
        </linearGradient>
        <linearGradient id="star-shades-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe17a" />
          <stop offset="100%" stopColor="#d99a2a" />
        </linearGradient>
      </defs>
      {/* Temple arms */}
      <path d="M45 35.5 L42 34" fill="none" stroke="url(#star-shades-frame)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M75 35.5 L78 34" fill="none" stroke="url(#star-shades-frame)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Bridge */}
      <path d="M57.5 37.5 Q60 36 62.5 37.5" fill="none" stroke="url(#star-shades-frame)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Left star lens */}
      <path d="M51 30.5 L52.9 35.6 L58.3 35.8 L54 39.1 L55.5 44.3 L51 41.2 L46.5 44.3 L48 39.1 L43.7 35.8 L49.1 35.6 Z" fill="url(#star-shades-lens)" stroke="url(#star-shades-frame)" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Right star lens */}
      <path d="M69 30.5 L70.9 35.6 L76.3 35.8 L72 39.1 L73.5 44.3 L69 41.2 L64.5 44.3 L66 39.1 L61.7 35.8 L67.1 35.6 Z" fill="url(#star-shades-lens)" stroke="url(#star-shades-frame)" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Inner sparkle tint */}
      <circle cx="51" cy="38" r="2.4" fill="#ffffff" opacity="0.18" />
      <circle cx="69" cy="38" r="2.4" fill="#ffffff" opacity="0.18" />
      {/* Glossy highlights */}
      <path d="M48 34 Q50 33 52 33.6" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
      <path d="M66 34 Q68 33 70 33.6" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
      <circle cx="49" cy="36" r="0.8" fill="#ffffff" opacity="0.8" />
      <circle cx="67" cy="36" r="0.8" fill="#ffffff" opacity="0.8" />
    </g>
  );
}
