export default function WizardHat() {
  return (
    <g>
      <defs>
        <linearGradient id="wizard-hat-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#161a40" />
          <stop offset="45%" stopColor="#2a3170" />
          <stop offset="100%" stopColor="#0d1030" />
        </linearGradient>
        <linearGradient id="wizard-hat-brim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1e4a" />
          <stop offset="50%" stopColor="#323a82" />
          <stop offset="100%" stopColor="#11143a" />
        </linearGradient>
      </defs>
      {/* Tall cone with curled tip */}
      <path d="M44 38 L54 12 Q58 4 64 6 Q70 8 66 14 Q63 18 60 16 L52 38 Z" fill="url(#wizard-hat-cone)" stroke="#080a22" strokeWidth="1" strokeLinejoin="round" />
      {/* Brim */}
      <ellipse cx="60" cy="38" rx="28" ry="6.5" fill="url(#wizard-hat-brim)" stroke="#080a22" strokeWidth="1" />
      <ellipse cx="60" cy="37" rx="24" ry="4.2" fill="#0d1030" opacity="0.5" />
      {/* Band */}
      <path d="M48 35 Q60 39 71 34 L70 38 Q60 42 49 39 Z" fill="#1b2050" stroke="#080a22" strokeWidth="0.7" />
      {/* Tip star */}
      <path d="M64 5.5 L64.9 8 L67.3 8.1 L65.4 9.6 L66.1 12 L64 10.6 L61.9 12 L62.6 9.6 L60.7 8.1 L63.1 8 Z" fill="#ffe98c" stroke="#caa23a" strokeWidth="0.4" />
      {/* Stars on cone */}
      <path d="M55 22 L55.7 24 L57.7 24.1 L56.1 25.3 L56.7 27.3 L55 26 L53.3 27.3 L53.9 25.3 L52.3 24.1 L54.3 24 Z" fill="#ffd95e" />
      <path d="M58 31 L58.5 32.4 L59.9 32.5 L58.8 33.4 L59.2 34.8 L58 33.9 L56.8 34.8 L57.2 33.4 L56.1 32.5 L57.5 32.4 Z" fill="#f4e1a0" />
      {/* Crescent moon */}
      <path d="M50 30 a3 3 0 1 0 0.1 0 a2.3 2.3 0 1 1 -0.1 0 Z" fill="#ffe98c" />
      {/* Sparkle dots */}
      <circle cx="62" cy="26" r="0.8" fill="#bcd0ff" />
      <circle cx="53" cy="20" r="0.7" fill="#ffffff" opacity="0.8" />
      <circle cx="60" cy="34" r="0.6" fill="#ffe98c" />
      {/* Cone sheen */}
      <path d="M52 30 L56.5 14" stroke="#4a55ad" strokeWidth="0.9" opacity="0.5" />
    </g>
  );
}
