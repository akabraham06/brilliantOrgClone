export default function PufferVest() {
  return (
    <g>
      <defs>
        <linearGradient id="puffer-vest-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2c4a3e" />
          <stop offset="50%" stopColor="#3c6453" />
          <stop offset="100%" stopColor="#243d33" />
        </linearGradient>
        <linearGradient id="puffer-vest-seg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#46715e" />
          <stop offset="50%" stopColor="#37594a" />
          <stop offset="100%" stopColor="#2a463a" />
        </linearGradient>
      </defs>
      {/* Vest body (no sleeves, armholes cut in) */}
      <path d="M42 66 Q49 63 53 65 L60 70 L67 65 Q71 63 78 66 Q82 70 81 80 L82 106 Q60 111 38 106 L39 80 Q38 70 42 66 Z" fill="url(#puffer-vest-body)" stroke="#18261f" strokeWidth="1" />
      {/* Armhole trim */}
      <path d="M42 66 Q38 70 39 80 L41 92" stroke="#1d3127" strokeWidth="1.4" fill="none" />
      <path d="M78 66 Q82 70 81 80 L79 92" stroke="#1d3127" strokeWidth="1.4" fill="none" />
      {/* Collar */}
      <path d="M52 64 Q60 70 68 64 L67 60 Q60 58 53 60 Z" fill="url(#puffer-vest-seg)" stroke="#18261f" strokeWidth="0.9" />
      {/* Neck opening */}
      <path d="M55 66 Q60 70 65 66 L64 68 Q60 71 56 68 Z" fill="#152019" />
      {/* Horizontal quilted segments */}
      <path d="M40 74 Q60 78 80 74" stroke="#1d3127" strokeWidth="1.2" fill="none" />
      <path d="M39 82 Q60 86 81 82" stroke="#1d3127" strokeWidth="1.2" fill="none" />
      <path d="M39 90 Q60 94 81 90" stroke="#1d3127" strokeWidth="1.2" fill="none" />
      <path d="M38 98 Q60 102 82 98" stroke="#1d3127" strokeWidth="1.2" fill="none" />
      {/* Segment puff highlights */}
      <path d="M44 71 Q60 74 76 71" stroke="#54836d" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M43 79 Q60 82 77 79" stroke="#54836d" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M43 87 Q60 90 77 87" stroke="#54836d" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M42 95 Q60 98 78 95" stroke="#54836d" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M42 103 Q60 106 78 103" stroke="#54836d" strokeWidth="0.8" fill="none" opacity="0.55" />
      {/* Center zipper */}
      <path d="M60 70 L60 108" stroke="#15211a" strokeWidth="1.8" />
      <path d="M59 72 L59 106 M61 72 L61 106" stroke="#9bb0a6" strokeWidth="0.4" opacity="0.7" />
      <rect x="58.6" y="73" width="2.8" height="3.4" rx="0.6" fill="#c3d1c9" stroke="#7d9085" strokeWidth="0.4" />
      <circle cx="60" cy="77.5" r="0.7" fill="#9bb0a6" />
      {/* Vertical quilt lines */}
      <path d="M50 71 L50 106 M70 71 L70 106" stroke="#1d3127" strokeWidth="0.8" opacity="0.5" />
      {/* Side fold shading */}
      <path d="M43 70 Q42 88 43 105" stroke="#1d3127" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M77 70 Q78 88 77 105" stroke="#1d3127" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Hem */}
      <path d="M38 106 Q60 111 82 106 L81.5 108.5 Q60 113.5 38.5 108.5 Z" fill="#243d33" stroke="#18261f" strokeWidth="0.8" />
    </g>
  );
}
