export default function Backpack() {
  return (
    <g>
      <defs>
        <linearGradient id="backpack-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f7fb5" />
          <stop offset="55%" stopColor="#2f6396" />
          <stop offset="100%" stopColor="#244e78" />
        </linearGradient>
        <linearGradient id="backpack-pocket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a8cc2" />
          <stop offset="100%" stopColor="#2c5d8e" />
        </linearGradient>
        <linearGradient id="backpack-strap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#36699e" />
          <stop offset="50%" stopColor="#4884bb" />
          <stop offset="100%" stopColor="#2b5688" />
        </linearGradient>
      </defs>
      {/* Pack body peeking out on the left side */}
      <path d="M29 71 Q28.5 68.5 31 68 L41 68 L41 100 Q41 103 38 103 L31.5 103 Q29 103 29 100 Z" fill="url(#backpack-body)" stroke="#1e4063" strokeWidth="1" />
      <path d="M30.5 70.5 L40 70.5 L40 74 L30.5 74 Z" fill="#5a9bd0" opacity="0.4" />
      {/* Front pocket */}
      <path d="M30.5 85 Q30.5 83 32.5 83 L40.5 83 L40.5 98 Q40.5 100 38.5 100 L32.5 100 Q30.5 100 30.5 98 Z" fill="url(#backpack-pocket)" stroke="#1e4063" strokeWidth="0.8" />
      {/* Zipper across pocket */}
      <path d="M31.5 87.5 L39.5 87.5" stroke="#cdd9e4" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M31.5 87.5 L39.5 87.5" stroke="#7a8da0" strokeWidth="0.4" strokeDasharray="0.8 0.8" />
      <circle cx="39.6" cy="87.5" r="1.3" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.5" />
      {/* Top zipper of main body */}
      <path d="M30.5 78 L40.5 78" stroke="#cdd9e4" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="39.8" cy="78" r="1.2" fill="#e0b34d" stroke="#a7822f" strokeWidth="0.5" />
      {/* Left shoulder strap over chest */}
      <path d="M41 67 Q44 66 46 67 L43 100 Q42 102 40 101.5 L38 100 Z" fill="url(#backpack-strap)" stroke="#1e4063" strokeWidth="1" />
      <path d="M41.5 70 L44.5 70 L43.4 96 L40.5 96 Z" fill="#5a9bd0" opacity="0.3" />
      {/* Right shoulder strap over chest */}
      <path d="M74 67 Q77 66 79 67 L80 101 Q78 102 76 101 L73 100 Z" fill="url(#backpack-strap)" stroke="#1e4063" strokeWidth="1" />
      <path d="M75 70 L78 70 L78.6 96 L75.6 96 Z" fill="#5a9bd0" opacity="0.3" />
      {/* Sternum clip buckles */}
      <rect x="41.5" y="82" width="3.2" height="4" rx="0.8" fill="#1f2733" stroke="#0e1620" strokeWidth="0.5" />
      <rect x="75" y="82" width="3.2" height="4" rx="0.8" fill="#1f2733" stroke="#0e1620" strokeWidth="0.5" />
      <path d="M44.7 84 L75 84" stroke="#1f2733" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="57" y="82.4" width="6" height="3.2" rx="0.8" fill="#33414f" stroke="#0e1620" strokeWidth="0.5" />
    </g>
  );
}
