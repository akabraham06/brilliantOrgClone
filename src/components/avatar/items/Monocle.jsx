export default function Monocle() {
  return (
    <g>
      <defs>
        <linearGradient id="monocle-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d680" />
          <stop offset="50%" stopColor="#d9ab43" />
          <stop offset="100%" stopColor="#a87c25" />
        </linearGradient>
        <radialGradient id="monocle-lens" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#f0f7ff" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#d3e5f4" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#aec7dc" stopOpacity="0.18" />
        </radialGradient>
      </defs>
      {/* Lens fill */}
      <circle cx="69" cy="38" r="8" fill="url(#monocle-lens)" />
      {/* Gold rim */}
      <circle cx="69" cy="38" r="8" fill="none" stroke="url(#monocle-rim)" strokeWidth="1.8" />
      <circle cx="69" cy="38" r="8" fill="none" stroke="#8a6420" strokeWidth="0.4" opacity="0.6" />
      <circle cx="69" cy="38" r="6.8" fill="none" stroke="#fbe9b0" strokeWidth="0.4" opacity="0.5" />
      {/* Rim mount nub for chain */}
      <circle cx="69" cy="46.2" r="1.2" fill="#caa23c" stroke="#8a6420" strokeWidth="0.3" />
      {/* Dangling chain */}
      <path d="M69 47.4 Q66 54 64 62 Q62.5 70 60 78" fill="none" stroke="#caa23c" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="0.6 1.6" />
      {/* Specular highlights */}
      <path d="M65 34.5 Q67.5 32.8 70 33.8" fill="none" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      <circle cx="66" cy="36" r="0.7" fill="#ffffff" opacity="0.7" />
    </g>
  );
}
