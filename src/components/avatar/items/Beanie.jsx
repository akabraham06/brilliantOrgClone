export default function Beanie() {
  return (
    <g>
      <defs>
        <linearGradient id="beanie-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f7d6b" />
          <stop offset="50%" stopColor="#3fa088" />
          <stop offset="100%" stopColor="#256356" />
        </linearGradient>
        <linearGradient id="beanie-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#28705f" />
          <stop offset="50%" stopColor="#368f79" />
          <stop offset="100%" stopColor="#205447" />
        </linearGradient>
        <radialGradient id="beanie-pom" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#fbfdfc" />
          <stop offset="100%" stopColor="#cfe0da" />
        </radialGradient>
      </defs>
      {/* Dome */}
      <path d="M37 36 Q38 12 60 11 Q82 12 83 36 Z" fill="url(#beanie-body)" stroke="#173e35" strokeWidth="1" />
      {/* Knit ribs */}
      <path d="M46 35 Q46 18 48 13" fill="none" stroke="#256356" strokeWidth="0.9" opacity="0.7" />
      <path d="M52 36 Q52 16 53 12" fill="none" stroke="#256356" strokeWidth="0.9" opacity="0.7" />
      <path d="M60 36 L60 11.5" fill="none" stroke="#256356" strokeWidth="0.9" opacity="0.7" />
      <path d="M68 36 Q68 16 67 12" fill="none" stroke="#256356" strokeWidth="0.9" opacity="0.7" />
      <path d="M74 35 Q74 18 72 13" fill="none" stroke="#256356" strokeWidth="0.9" opacity="0.7" />
      <path d="M42 35 Q42 22 44 16" fill="none" stroke="#4cb89e" strokeWidth="0.7" opacity="0.5" />
      <path d="M78 35 Q78 22 76 16" fill="none" stroke="#4cb89e" strokeWidth="0.7" opacity="0.5" />
      {/* Fold band */}
      <path d="M35 34 Q60 28 85 34 L85 41 Q60 36 35 41 Z" fill="url(#beanie-band)" stroke="#173e35" strokeWidth="1" />
      <path d="M38 35 L38.6 40" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M44 34.4 L44.4 39.6" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M50 33.8 L50.2 39.2" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M56 33.4 L56 39" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M62 33.4 L62 39" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M68 33.6 L67.8 39.2" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M74 34.2 L74.4 39.6" stroke="#1d4f43" strokeWidth="0.9" />
      <path d="M80 35 L80.4 40" stroke="#1d4f43" strokeWidth="0.9" />
      {/* Pom-pom */}
      <circle cx="60" cy="9" r="5" fill="url(#beanie-pom)" stroke="#b9cfc8" strokeWidth="0.7" />
      <path d="M57 7 L58 9 M62 6 L61.6 8.4 M58 11 L59 9.4 M63 10 L61.8 9" stroke="#cfe0da" strokeWidth="0.6" strokeLinecap="round" />
    </g>
  );
}
