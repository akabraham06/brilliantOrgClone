export default function Slacks() {
  return (
    <g>
      <defs>
        <linearGradient id="slacks-fabric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#33394a" />
          <stop offset="40%" stopColor="#495065" />
          <stop offset="50%" stopColor="#525a72" />
          <stop offset="60%" stopColor="#495065" />
          <stop offset="100%" stopColor="#2c3140" />
        </linearGradient>
        <linearGradient id="slacks-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5165" />
          <stop offset="100%" stopColor="#33394a" />
        </linearGradient>
      </defs>
      {/* Waistband */}
      <rect x="38" y="104" width="44" height="6.5" rx="1.5" fill="url(#slacks-band)" stroke="#1d212b" strokeWidth="1" />
      <line x1="38.5" y1="107.5" x2="81.5" y2="107.5" stroke="#1d212b" strokeWidth="0.4" />
      {/* Belt loops */}
      <rect x="42" y="103.5" width="2" height="3.5" rx="0.4" fill="#33394a" stroke="#1d212b" strokeWidth="0.5" />
      <rect x="59" y="103.5" width="2" height="3.5" rx="0.4" fill="#33394a" stroke="#1d212b" strokeWidth="0.5" />
      <rect x="76" y="103.5" width="2" height="3.5" rx="0.4" fill="#33394a" stroke="#1d212b" strokeWidth="0.5" />
      {/* Button / clasp */}
      <circle cx="60" cy="107.3" r="1.2" fill="#1d212b" stroke="#15181f" strokeWidth="0.4" />
      {/* Left leg (slim tailored) */}
      <path d="M42 110.5 L58 110.5 L56.5 134 L46 134 L43.5 120 Z" fill="url(#slacks-fabric)" stroke="#1d212b" strokeWidth="1" />
      {/* Right leg (slim tailored) */}
      <path d="M62 110.5 L78 110.5 L76.5 120 L74 134 L63.5 134 Z" fill="url(#slacks-fabric)" stroke="#1d212b" strokeWidth="1" />
      {/* Center seam */}
      <path d="M58 110.5 Q60 114.5 62 110.5" fill="none" stroke="#1d212b" strokeWidth="0.9" />
      {/* Sharp center crease line on each leg */}
      <line x1="50" y1="112" x2="51" y2="134" stroke="#7c8499" strokeWidth="0.8" opacity="0.8" />
      <line x1="70" y1="112" x2="69" y2="134" stroke="#7c8499" strokeWidth="0.8" opacity="0.8" />
      {/* Crease highlight */}
      <line x1="50.4" y1="112" x2="51.3" y2="134" stroke="#9aa2b8" strokeWidth="0.3" opacity="0.6" />
      <line x1="69.6" y1="112" x2="68.7" y2="134" stroke="#9aa2b8" strokeWidth="0.3" opacity="0.6" />
      {/* Slant front pockets */}
      <path d="M43.5 111 L48 115" fill="none" stroke="#1d212b" strokeWidth="0.6" />
      <path d="M76.5 111 L72 115" fill="none" stroke="#1d212b" strokeWidth="0.6" />
      {/* Inner leg shadow */}
      <path d="M55 112 L54 133 L55.5 133 L56 112 Z" fill="#252a36" opacity="0.5" />
      <path d="M65 112 L66 133 L64.5 133 L64 112 Z" fill="#252a36" opacity="0.5" />
      {/* Hem cuffs */}
      <rect x="45.5" y="131.5" width="11.5" height="2.5" rx="0.5" fill="#252a36" stroke="#1d212b" strokeWidth="0.5" />
      <rect x="63" y="131.5" width="11.5" height="2.5" rx="0.5" fill="#252a36" stroke="#1d212b" strokeWidth="0.5" />
    </g>
  );
}
