export default function Visor() {
  return (
    <g>
      <defs>
        <linearGradient id="visor-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3038" />
          <stop offset="100%" stopColor="#12161c" />
        </linearGradient>
        <linearGradient id="visor-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a5a6b" stopOpacity="0.2" />
          <stop offset="45%" stopColor="#28f0ff" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#28f0ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a5a6b" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Side mounts / temple */}
      <path d="M43 36 L42 34.6" fill="none" stroke="url(#visor-band)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M77 36 L78 34.6" fill="none" stroke="url(#visor-band)" strokeWidth="2.4" strokeLinecap="round" />
      {/* Visor band body */}
      <path d="M42 34 Q60 31 78 34 L78 42 Q60 45 42 42 Z" fill="url(#visor-band)" stroke="#0a0d11" strokeWidth="1" />
      {/* Inner dark recess */}
      <path d="M44 35 Q60 32.6 76 35 L76 41 Q60 43.4 44 41 Z" fill="#0c1014" />
      {/* Glowing scan-line gradient */}
      <path d="M45 37.6 Q60 35.8 75 37.6 L75 39.4 Q60 41.2 45 39.4 Z" fill="url(#visor-glow)" />
      {/* Sharp scan-line core */}
      <path d="M45.5 38.5 Q60 37 74.5 38.5" fill="none" stroke="#bafcff" strokeWidth="0.7" strokeLinecap="round" opacity="0.9" />
      {/* Tech tick marks */}
      <line x1="50" y1="36.2" x2="50" y2="40.8" stroke="#28f0ff" strokeWidth="0.5" opacity="0.5" />
      <line x1="60" y1="35.8" x2="60" y2="41.2" stroke="#28f0ff" strokeWidth="0.5" opacity="0.5" />
      <line x1="70" y1="36.2" x2="70" y2="40.8" stroke="#28f0ff" strokeWidth="0.5" opacity="0.5" />
      {/* Top edge sheen */}
      <path d="M45 33.8 Q60 31.4 75 33.8" fill="none" stroke="#4a5666" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      {/* Corner glow nodes */}
      <circle cx="45" cy="38.5" r="1" fill="#28f0ff" opacity="0.8" />
      <circle cx="75" cy="38.5" r="1" fill="#28f0ff" opacity="0.8" />
    </g>
  );
}
