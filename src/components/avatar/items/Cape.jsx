export default function Cape() {
  return (
    <g>
      <defs>
        <linearGradient id="cape-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7a1530" />
          <stop offset="50%" stopColor="#a51e40" />
          <stop offset="100%" stopColor="#5e0f24" />
        </linearGradient>
        <linearGradient id="cape-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8324f" />
          <stop offset="100%" stopColor="#7a1530" />
        </linearGradient>
        <radialGradient id="cape-clasp" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="100%" stopColor="#c08a22" />
        </radialGradient>
      </defs>
      {/* Cape body sweeping wide behind the torso */}
      <path d="M52 62 Q35 64 30 84 Q27 104 33 120 Q46 114 60 116 Q74 114 87 120 Q93 104 90 84 Q85 64 68 62 Q60 60 52 62 Z" fill="url(#cape-cloth)" stroke="#4a0c1c" strokeWidth="1.2" />
      {/* Inner lining peeking at the collar */}
      <path d="M52 62 Q60 66 68 62 Q66 70 60 71 Q54 70 52 62 Z" fill="url(#cape-inner)" stroke="#4a0c1c" strokeWidth="0.8" />
      {/* Flowing fold shading */}
      <path d="M44 66 Q40 88 38 116" stroke="#5e0f24" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M52 68 Q50 90 48 118" stroke="#5e0f24" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M60 71 Q60 92 60 116" stroke="#6e1228" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M68 68 Q70 90 72 118" stroke="#5e0f24" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M76 66 Q80 88 82 116" stroke="#5e0f24" strokeWidth="1.4" fill="none" opacity="0.7" />
      {/* Fold highlights */}
      <path d="M48 70 Q46 92 44 114" stroke="#c8324f" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M64 70 Q66 92 68 114" stroke="#c8324f" strokeWidth="0.8" fill="none" opacity="0.5" />
      {/* Scalloped hem */}
      <path d="M33 120 Q39 116 46 119 Q53 115 60 116 Q67 115 74 119 Q81 116 87 120" fill="none" stroke="#4a0c1c" strokeWidth="1" />
      {/* Neck cord and clasps */}
      <path d="M52 63 Q60 67 68 63" fill="none" stroke="#c08a22" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="52" cy="63" r="2.6" fill="url(#cape-clasp)" stroke="#8a6014" strokeWidth="0.8" />
      <circle cx="68" cy="63" r="2.6" fill="url(#cape-clasp)" stroke="#8a6014" strokeWidth="0.8" />
      <circle cx="52" cy="62.4" r="0.8" fill="#fff4cf" opacity="0.8" />
      <circle cx="68" cy="62.4" r="0.8" fill="#fff4cf" opacity="0.8" />
    </g>
  );
}
