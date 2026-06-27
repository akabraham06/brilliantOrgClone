export default function Sweater() {
  return (
    <g>
      <defs>
        <linearGradient id="sweater-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9c6b3f" />
          <stop offset="50%" stopColor="#b8824f" />
          <stop offset="100%" stopColor="#8c5e35" />
        </linearGradient>
        <linearGradient id="sweater-rib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a06d40" />
          <stop offset="100%" stopColor="#80552f" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M34 67 Q44 64 53 65 L60 71 L67 65 Q76 64 86 67 L83 107 Q60 112 37 107 Z" fill="url(#sweater-body)" stroke="#5f3e21" strokeWidth="1" />
      {/* Sleeves */}
      <path d="M34 67 Q27 73 29 85 L41 83 L41 69 Z" fill="url(#sweater-body)" stroke="#5f3e21" strokeWidth="1" />
      <path d="M86 67 Q93 73 91 85 L79 83 L79 69 Z" fill="url(#sweater-body)" stroke="#5f3e21" strokeWidth="1" />
      {/* Ribbed cuffs */}
      <path d="M29 85 L41 83 L41 90 L30 92 Z" fill="url(#sweater-rib)" stroke="#5f3e21" strokeWidth="0.8" />
      <path d="M91 85 L79 83 L79 90 L90 92 Z" fill="url(#sweater-rib)" stroke="#5f3e21" strokeWidth="0.8" />
      <path d="M31 85.5 L31.5 91 M34 85 L34.5 90.5 M37 84.5 L37.5 90 M40 84 L40.5 89.5" stroke="#6e4a28" strokeWidth="0.6" />
      <path d="M89 85.5 L88.5 91 M86 85 L85.5 90.5 M83 84.5 L82.5 90 M80 84 L79.5 89.5" stroke="#6e4a28" strokeWidth="0.6" />
      {/* Ribbed collar */}
      <path d="M52 64 Q60 71 68 64 Q66 60 60 61 Q54 60 52 64 Z" fill="url(#sweater-rib)" stroke="#5f3e21" strokeWidth="0.9" />
      <path d="M54 63 L55 67 M57 62 L57.5 68 M60 61.5 L60 69 M63 62 L62.5 68 M66 63 L65 67" stroke="#6e4a28" strokeWidth="0.6" />
      {/* Neck opening */}
      <path d="M55 66 Q60 70 65 66 L64 68 Q60 71 56 68 Z" fill="#5a3a1f" />
      {/* Knit texture: rows of small V stitches */}
      <path d="M40 74 l2 2 l2 -2 M46 74 l2 2 l2 -2 M52 74 l2 2 l2 -2 M62 74 l2 2 l2 -2 M68 74 l2 2 l2 -2 M74 74 l2 2 l2 -2" stroke="#6e4a28" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M40 82 l2 2 l2 -2 M46 82 l2 2 l2 -2 M52 82 l2 2 l2 -2 M58 82 l2 2 l2 -2 M64 82 l2 2 l2 -2 M70 82 l2 2 l2 -2 M76 82 l2 2 l2 -2" stroke="#6e4a28" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M40 90 l2 2 l2 -2 M46 90 l2 2 l2 -2 M52 90 l2 2 l2 -2 M58 90 l2 2 l2 -2 M64 90 l2 2 l2 -2 M70 90 l2 2 l2 -2 M76 90 l2 2 l2 -2" stroke="#6e4a28" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M42 98 l2 2 l2 -2 M48 98 l2 2 l2 -2 M54 98 l2 2 l2 -2 M60 98 l2 2 l2 -2 M66 98 l2 2 l2 -2 M72 98 l2 2 l2 -2" stroke="#6e4a28" strokeWidth="0.6" fill="none" opacity="0.7" />
      {/* Fold shading + highlight */}
      <path d="M42 72 Q44 90 42 106" stroke="#7a512b" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M78 72 Q76 90 78 106" stroke="#7a512b" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M46 71 Q48 88 47 104" stroke="#c79560" strokeWidth="0.9" fill="none" opacity="0.5" />
      {/* Ribbed hem */}
      <path d="M37 107 Q60 112 83 107 L82.5 111 Q60 116 37.5 111 Z" fill="url(#sweater-rib)" stroke="#5f3e21" strokeWidth="0.8" />
      <path d="M42 108.5 L42 112.5 M48 109 L48 113.5 M54 109.5 L54 114 M60 109.5 L60 114.2 M66 109.5 L66 114 M72 109 L72 113.5 M78 108.5 L78 112.5" stroke="#6e4a28" strokeWidth="0.6" />
    </g>
  );
}
