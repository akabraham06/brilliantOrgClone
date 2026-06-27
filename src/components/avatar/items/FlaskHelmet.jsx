export default function FlaskHelmet() {
  return (
    <g>
      <defs>
        <linearGradient id="flask-helmet-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dff2f7" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#a9d6e2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#74b0c2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="flask-helmet-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7df0a8" />
          <stop offset="100%" stopColor="#16a85a" />
        </linearGradient>
        <linearGradient id="flask-helmet-cork" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c79a5c" />
          <stop offset="100%" stopColor="#8a6536" />
        </linearGradient>
      </defs>
      {/* Erlenmeyer glass dome */}
      <path d="M40 39 L46 18 L46 12 L74 12 L74 18 L80 39 Q60 43 40 39 Z" fill="url(#flask-helmet-glass)" stroke="#4d8a99" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Liquid */}
      <path d="M43 30 Q60 27 77 30 L80 39 Q60 43 40 39 Z" fill="url(#flask-helmet-liquid)" />
      <path d="M43 30 Q60 33 77 30" fill="none" stroke="#bdf7d2" strokeWidth="0.8" opacity="0.7" />
      {/* Bubbles */}
      <circle cx="50" cy="34" r="1.8" fill="#d6fbe4" opacity="0.85" />
      <circle cx="58" cy="36" r="1.2" fill="#d6fbe4" opacity="0.85" />
      <circle cx="66" cy="33" r="2.1" fill="#d6fbe4" opacity="0.85" />
      <circle cx="71" cy="36" r="1" fill="#d6fbe4" opacity="0.85" />
      <circle cx="54" cy="28" r="1" fill="#eafff2" opacity="0.7" />
      <circle cx="62" cy="26" r="0.8" fill="#eafff2" opacity="0.7" />
      <circle cx="68" cy="24" r="0.6" fill="#eafff2" opacity="0.6" />
      {/* Measure lines */}
      <path d="M73 33 L76 33 M72 28 L74.5 28 M71 23 L73 23" stroke="#4d8a99" strokeWidth="0.6" opacity="0.6" />
      {/* Glass highlight */}
      <path d="M50 36 L48 20 L49.5 14" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      {/* Neck rim */}
      <rect x="45" y="11" width="30" height="3" rx="1.2" fill="#bfe2ea" stroke="#4d8a99" strokeWidth="0.9" />
      {/* Cork / valve on top */}
      <path d="M52 11 L54 4 L66 4 L68 11 Z" fill="url(#flask-helmet-cork)" stroke="#5e421f" strokeWidth="0.9" strokeLinejoin="round" />
      <ellipse cx="60" cy="4" rx="6" ry="1.8" fill="#d8ac6e" stroke="#5e421f" strokeWidth="0.7" />
      <rect x="58.6" y="1" width="2.8" height="3.5" rx="0.8" fill="#9aa3ad" stroke="#5e6670" strokeWidth="0.6" />
      <circle cx="60" cy="1" r="1.4" fill="#c2cad3" stroke="#5e6670" strokeWidth="0.5" />
    </g>
  );
}
