export default function Satchel() {
  return (
    <g>
      <defs>
        <linearGradient id="satchel-strap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a4a26" />
          <stop offset="50%" stopColor="#9c6334" />
          <stop offset="100%" stopColor="#5e3618" />
        </linearGradient>
        <linearGradient id="satchel-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a06b3a" />
          <stop offset="100%" stopColor="#6e451f" />
        </linearGradient>
        <linearGradient id="satchel-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b27c47" />
          <stop offset="100%" stopColor="#8a5a2c" />
        </linearGradient>
      </defs>
      {/* Diagonal strap from right shoulder to left hip */}
      <path d="M76 65 L40 104 L44 107 L80 67 Z" fill="url(#satchel-strap)" stroke="#4a2b12" strokeWidth="1" />
      <path d="M77 67 L43 104" stroke="#bb8550" strokeWidth="0.6" opacity="0.5" />
      {/* Stitching on strap */}
      <path d="M75 67 L41 105" stroke="#4a2b12" strokeWidth="0.4" strokeDasharray="1.4 1.4" opacity="0.6" />
      {/* Bag body at the lower-left hip */}
      <path d="M33 100 Q33 98 35 98 L47 98 Q49 98 49 100 L49 110 Q49 112 47 112 L35 112 Q33 112 33 110 Z" fill="url(#satchel-body)" stroke="#4a2b12" strokeWidth="1" />
      {/* Flap */}
      <path d="M32.5 98.5 Q32.5 96.5 34.5 96.5 L47.5 96.5 Q49.5 96.5 49.5 98.5 L49.5 104 Q41 107 32.5 104 Z" fill="url(#satchel-flap)" stroke="#4a2b12" strokeWidth="1" />
      <path d="M34 98 L48 98" stroke="#c89460" strokeWidth="0.5" opacity="0.5" />
      {/* Flap stitching */}
      <path d="M34 102.5 Q41 104.6 48 102.5" fill="none" stroke="#4a2b12" strokeWidth="0.4" strokeDasharray="1.4 1.4" opacity="0.6" />
      {/* Buckle strap on flap */}
      <rect x="39.5" y="101" width="3" height="8" rx="0.6" fill="#6e451f" stroke="#4a2b12" strokeWidth="0.6" />
      <rect x="38.8" y="103.5" width="4.4" height="3.4" rx="0.7" fill="#d9b066" stroke="#9a6b16" strokeWidth="0.6" />
      <rect x="40.4" y="104.4" width="1.2" height="1.6" rx="0.3" fill="#6e451f" />
      {/* Side gusset shadow */}
      <path d="M47 100 L49 100 L49 110 Q49 112 47 112 Z" fill="#5e3618" opacity="0.5" />
      {/* Body highlight */}
      <path d="M35 107 L46 107" stroke="#bb8550" strokeWidth="0.5" opacity="0.4" />
    </g>
  );
}
