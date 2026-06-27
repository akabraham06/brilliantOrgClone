export default function Scarf() {
  return (
    <g>
      <defs>
        <linearGradient id="scarf-wrap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a83246" />
          <stop offset="50%" stopColor="#cc4358" />
          <stop offset="100%" stopColor="#962a3d" />
        </linearGradient>
        <linearGradient id="scarf-tail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c43e52" />
          <stop offset="100%" stopColor="#8f283a" />
        </linearGradient>
      </defs>
      {/* Wrap around the neck */}
      <path d="M47 60 Q60 55 73 60 Q74 67 72 70 Q60 64 48 70 Q46 65 47 60 Z" fill="url(#scarf-wrap)" stroke="#71202f" strokeWidth="1" />
      {/* Knit ribbing on the wrap */}
      <path d="M49 60.5 L48.5 69" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M53 58.5 L52.5 67.5" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M57 57.5 L57 66.5" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M61 57.3 L61.2 66.5" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M65 58 L65.5 67" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M69 59.5 L70 68.5" stroke="#8f283a" strokeWidth="0.7" />
      {/* Highlight along top fold */}
      <path d="M48 60 Q60 56 72 60" stroke="#e2697a" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Front overlap knot */}
      <path d="M55 66 Q60 62 66 66 Q66 71 60 72 Q54 71 55 66 Z" fill="url(#scarf-wrap)" stroke="#71202f" strokeWidth="1" />
      {/* Long hanging tail */}
      <path d="M56 70 L52 100 Q52 102 55 102 L62 102 Q64 102 63 100 L62 70 Z" fill="url(#scarf-tail)" stroke="#71202f" strokeWidth="1" />
      <path d="M57.5 73 L55 99" stroke="#8f283a" strokeWidth="0.7" />
      <path d="M60 73 L60 99" stroke="#a4304180" strokeWidth="0.7" />
      <path d="M62 73 L62.5 99" stroke="#8f283a" strokeWidth="0.7" />
      {/* Short hanging tail behind */}
      <path d="M63 70 L66 92 Q66 94 68.5 94 L72 94 Q73.5 94 73 92 L69 70 Z" fill="#9a2c3e" stroke="#71202f" strokeWidth="1" />
      <path d="M66.5 73 L68.5 91" stroke="#7d2333" strokeWidth="0.7" />
      <path d="M69.5 73 L70.5 91" stroke="#7d2333" strokeWidth="0.7" />
      {/* Fringe on long tail */}
      <path d="M52.5 102 L52 106 M55 102 L54.7 106.5 M57.5 102 L57.5 106.5 M60 102 L60 106.5 M62.5 102 L63 106 M63 102 L63.3 105.5" stroke="#c43e52" strokeWidth="1.1" strokeLinecap="round" />
      {/* Fringe on short tail */}
      <path d="M66.5 94 L66.2 97.5 M68.5 94 L68.5 98 M70.5 94 L70.8 97.5 M72.5 94 L72.8 97" stroke="#9a2c3e" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}
