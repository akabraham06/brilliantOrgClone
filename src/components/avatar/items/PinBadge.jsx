export default function PinBadge() {
  return (
    <g>
      <defs>
        <radialGradient id="pin-badge-rim" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#eef2f6" />
          <stop offset="55%" stopColor="#b8c2cc" />
          <stop offset="100%" stopColor="#7d8893" />
        </radialGradient>
        <linearGradient id="pin-badge-enamel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3aa6c4" />
          <stop offset="100%" stopColor="#1f6f8c" />
        </linearGradient>
        <linearGradient id="pin-badge-flask" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfeefc" />
          <stop offset="100%" stopColor="#6fd1a6" />
        </linearGradient>
      </defs>
      {/* Pin needle behind */}
      <path d="M50.5 80.5 L54.5 84" stroke="#8a929c" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="50.4" cy="80.4" r="0.8" fill="#cdd4dc" />
      {/* Metallic rim */}
      <circle cx="46" cy="77" r="6.5" fill="url(#pin-badge-rim)" stroke="#5f6973" strokeWidth="0.9" />
      {/* Enamel field */}
      <circle cx="46" cy="77" r="5" fill="url(#pin-badge-enamel)" stroke="#175468" strokeWidth="0.6" />
      {/* Beaker emblem */}
      <path d="M44 74.5 L48 74.5 L48 76 L49.2 79.5 Q49.5 80.6 48.4 80.6 L43.6 80.6 Q42.5 80.6 42.8 79.5 L44 76 Z" fill="url(#pin-badge-flask)" stroke="#176849" strokeWidth="0.6" />
      <path d="M43.5 78 L48.5 78" stroke="#176849" strokeWidth="0.5" opacity="0.7" />
      <path d="M43.6 73.8 L48.4 73.8" stroke="#cdd4dc" strokeWidth="0.9" strokeLinecap="round" />
      {/* Bubbles */}
      <circle cx="45.4" cy="79" r="0.5" fill="#ffffff" opacity="0.8" />
      <circle cx="46.8" cy="79.4" r="0.4" fill="#ffffff" opacity="0.7" />
      {/* Rim sheen */}
      <path d="M42 73 Q43.5 71 46 71" stroke="#ffffff" strokeWidth="0.9" fill="none" opacity="0.7" strokeLinecap="round" />
    </g>
  );
}
