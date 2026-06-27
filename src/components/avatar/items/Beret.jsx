export default function Beret() {
  return (
    <g>
      <defs>
        <radialGradient id="beret-body" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#b5384a" />
          <stop offset="60%" stopColor="#8e1f33" />
          <stop offset="100%" stopColor="#5f1322" />
        </radialGradient>
        <linearGradient id="beret-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a1018" />
          <stop offset="50%" stopColor="#5a1a26" />
          <stop offset="100%" stopColor="#2c0c12" />
        </linearGradient>
      </defs>
      {/* Soft tilted disc */}
      <path d="M32 36 Q30 18 56 14 Q86 11 88 30 Q89 38 70 39 Q48 41 32 36 Z" fill="url(#beret-body)" stroke="#48101c" strokeWidth="1" />
      {/* Fabric folds */}
      <path d="M40 32 Q54 24 72 24" fill="none" stroke="#a32f42" strokeWidth="0.9" opacity="0.5" />
      <path d="M44 36 Q60 30 80 31" fill="none" stroke="#6e1828" strokeWidth="0.9" opacity="0.6" />
      <path d="M38 24 Q52 19 66 18" fill="none" stroke="#c44256" strokeWidth="0.7" opacity="0.4" />
      {/* Highlight */}
      <ellipse cx="52" cy="22" rx="12" ry="5" fill="#c44256" opacity="0.35" transform="rotate(-12 52 22)" />
      {/* Band hugging head */}
      <path d="M36 35 Q60 40 80 36 L80 41 Q60 45 36 40 Z" fill="url(#beret-band)" stroke="#2c0c12" strokeWidth="0.9" />
      {/* Little stalk */}
      <path d="M58 14 Q59 9 61 9 Q63 9.5 61.5 13" fill="#5f1322" stroke="#48101c" strokeWidth="0.7" strokeLinejoin="round" />
      <circle cx="60" cy="9" r="1.6" fill="#8e1f33" stroke="#48101c" strokeWidth="0.5" />
    </g>
  );
}
