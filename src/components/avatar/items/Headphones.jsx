export default function Headphones() {
  return (
    <g>
      <defs>
        <linearGradient id="headphones-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a2e38" />
          <stop offset="50%" stopColor="#444b5a" />
          <stop offset="100%" stopColor="#23262f" />
        </linearGradient>
        <radialGradient id="headphones-cup" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#4a5160" />
          <stop offset="100%" stopColor="#22252e" />
        </radialGradient>
        <radialGradient id="headphones-pad" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#3a3f4b" />
          <stop offset="100%" stopColor="#16181d" />
        </radialGradient>
      </defs>
      {/* Headband arcing over the top of the head */}
      <path d="M35 42 Q35 13 60 13 Q85 13 85 42" fill="none" stroke="url(#headphones-band)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M36 40 Q37 16 60 15.5 Q83 16 84 40" fill="none" stroke="#5b6477" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      {/* Band end yokes */}
      <rect x="32.5" y="36" width="6" height="9" rx="2.4" fill="#2a2e38" stroke="#15171d" strokeWidth="0.8" />
      <rect x="81.5" y="36" width="6" height="9" rx="2.4" fill="#2a2e38" stroke="#15171d" strokeWidth="0.8" />
      {/* Left ear cup over the ear */}
      <ellipse cx="35.5" cy="44" rx="8" ry="10" fill="url(#headphones-cup)" stroke="#15171d" strokeWidth="1.1" />
      <ellipse cx="35.5" cy="44" rx="5" ry="6.6" fill="url(#headphones-pad)" stroke="#0e1014" strokeWidth="0.7" />
      <path d="M31 39 Q30 42 30.5 46" stroke="#6a7385" strokeWidth="0.9" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Right ear cup over the ear */}
      <ellipse cx="84.5" cy="44" rx="8" ry="10" fill="url(#headphones-cup)" stroke="#15171d" strokeWidth="1.1" />
      <ellipse cx="84.5" cy="44" rx="5" ry="6.6" fill="url(#headphones-pad)" stroke="#0e1014" strokeWidth="0.7" />
      <path d="M89 39 Q90 42 89.5 46" stroke="#6a7385" strokeWidth="0.9" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Accent rings */}
      <circle cx="35.5" cy="44" r="1.3" fill="#3a78c4" stroke="#1d4677" strokeWidth="0.4" />
      <circle cx="84.5" cy="44" r="1.3" fill="#3a78c4" stroke="#1d4677" strokeWidth="0.4" />
    </g>
  );
}
