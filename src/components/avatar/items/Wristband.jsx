export default function Wristband() {
  return (
    <g>
      <defs>
        <linearGradient id="wristband-cloth" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1f6f53" />
          <stop offset="50%" stopColor="#2f9b73" />
          <stop offset="100%" stopColor="#185a43" />
        </linearGradient>
      </defs>
      {/* Terry sweatband cuff */}
      <path d="M34 98 Q39 96 44 98 L44 108 Q39 110 34 108 Z" fill="url(#wristband-cloth)" stroke="#134031" strokeWidth="1" />
      {/* Knit ribbing lines */}
      <path d="M35.5 98.4 L35.5 108" stroke="#185a43" strokeWidth="0.6" />
      <path d="M37.5 97.8 L37.5 108.6" stroke="#185a43" strokeWidth="0.6" />
      <path d="M39 97.6 L39 108.8" stroke="#1c6b50" strokeWidth="0.6" />
      <path d="M40.5 97.8 L40.5 108.6" stroke="#185a43" strokeWidth="0.6" />
      <path d="M42.5 98.4 L42.5 108" stroke="#185a43" strokeWidth="0.6" />
      {/* Stripe accents */}
      <path d="M34.4 101.5 Q39 99.8 43.6 101.5" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.85" />
      <path d="M34.4 104.5 Q39 103 43.6 104.5" stroke="#f4c84e" strokeWidth="1.2" fill="none" opacity="0.9" />
      {/* Top edge highlight */}
      <path d="M35 98 Q39 96.4 43 98" stroke="#52c79b" strokeWidth="0.7" fill="none" opacity="0.6" strokeLinecap="round" />
    </g>
  );
}
