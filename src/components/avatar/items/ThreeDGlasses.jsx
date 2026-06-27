export default function ThreeDGlasses() {
  return (
    <g>
      <defs>
        <linearGradient id="three-d-glasses-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2efe6" />
          <stop offset="100%" stopColor="#d8d2c0" />
        </linearGradient>
        <linearGradient id="three-d-glasses-red" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ff5a5a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c41f1f" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="three-d-glasses-cyan" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#5af2f2" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1f9fc4" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* Temple arms */}
      <path d="M44 35.2 L42 34.2" fill="none" stroke="#cdc6b2" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M76 35.2 L78 34.2" fill="none" stroke="#cdc6b2" strokeWidth="2.2" strokeLinecap="round" />
      {/* Cardboard frame band */}
      <path d="M43 32 L77 32 L77 44 L43 44 Z" fill="url(#three-d-glasses-frame)" stroke="#b3ac98" strokeWidth="0.8" />
      {/* Lens cut-outs */}
      <rect x="45" y="33.5" width="12" height="9" rx="1.5" fill="url(#three-d-glasses-red)" stroke="#9c1515" strokeWidth="1" />
      <rect x="63" y="33.5" width="12" height="9" rx="1.5" fill="url(#three-d-glasses-cyan)" stroke="#177a96" strokeWidth="1" />
      {/* Bridge notch */}
      <path d="M57 33.5 Q60 36 63 33.5" fill="url(#three-d-glasses-frame)" stroke="#b3ac98" strokeWidth="0.6" />
      {/* Cardboard texture lines */}
      <line x1="46" y1="38" x2="56" y2="38" stroke="#ffffff" strokeWidth="0.4" opacity="0.25" />
      <line x1="64" y1="38" x2="74" y2="38" stroke="#ffffff" strokeWidth="0.4" opacity="0.25" />
      {/* Glossy highlights */}
      <path d="M46.5 35 Q49 34 52 34.6" fill="none" stroke="#ffd0d0" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <path d="M64.5 35 Q67 34 70 34.6" fill="none" stroke="#cffafa" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}
