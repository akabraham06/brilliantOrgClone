export default function Bowtie() {
  return (
    <g>
      <defs>
        <linearGradient id="bowtie-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2a6b" />
          <stop offset="100%" stopColor="#5a45a0" />
        </linearGradient>
        <linearGradient id="bowtie-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a45a0" />
          <stop offset="100%" stopColor="#3a2a6b" />
        </linearGradient>
        <radialGradient id="bowtie-knot" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#6a52b8" />
          <stop offset="100%" stopColor="#34265f" />
        </radialGradient>
      </defs>
      {/* Left wing */}
      <path d="M59 64 L47 59 Q44 62 44 66 Q44 70 47 73 L59 66 Z" fill="url(#bowtie-left)" stroke="#28204a" strokeWidth="1" />
      {/* Right wing */}
      <path d="M61 64 L73 59 Q76 62 76 66 Q76 70 73 73 L61 66 Z" fill="url(#bowtie-right)" stroke="#28204a" strokeWidth="1" />
      {/* Fabric folds left */}
      <path d="M57 64.5 L48 61" stroke="#28204a" strokeWidth="0.6" opacity="0.7" />
      <path d="M57 65.5 L48 70.5" stroke="#28204a" strokeWidth="0.6" opacity="0.7" />
      <path d="M50 62 L50 70" stroke="#7a64c8" strokeWidth="0.5" opacity="0.5" />
      {/* Fabric folds right */}
      <path d="M63 64.5 L72 61" stroke="#28204a" strokeWidth="0.6" opacity="0.7" />
      <path d="M63 65.5 L72 70.5" stroke="#28204a" strokeWidth="0.6" opacity="0.7" />
      <path d="M70 62 L70 70" stroke="#7a64c8" strokeWidth="0.5" opacity="0.5" />
      {/* Wing highlights */}
      <path d="M52 60.5 Q49 63 49 66" stroke="#8c78d4" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M68 60.5 Q71 63 71 66" stroke="#8c78d4" strokeWidth="0.8" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Center knot */}
      <rect x="56.5" y="60.5" width="7" height="9" rx="1.6" fill="url(#bowtie-knot)" stroke="#28204a" strokeWidth="1" />
      <path d="M58 62 L58 68" stroke="#8c78d4" strokeWidth="0.6" opacity="0.5" />
      <path d="M62 62 L62 68" stroke="#241a44" strokeWidth="0.6" opacity="0.6" />
    </g>
  );
}
