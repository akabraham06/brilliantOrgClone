export default function GraduationCap() {
  return (
    <g>
      <defs>
        <linearGradient id="graduation-cap-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34384a" />
          <stop offset="50%" stopColor="#1c1e28" />
          <stop offset="100%" stopColor="#0e0f16" />
        </linearGradient>
        <linearGradient id="graduation-cap-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2d3b" />
          <stop offset="100%" stopColor="#13141c" />
        </linearGradient>
        <linearGradient id="graduation-cap-tassel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4d978" />
          <stop offset="100%" stopColor="#bd8f2c" />
        </linearGradient>
      </defs>
      {/* Skull cap hugging the head */}
      <path d="M44 34 Q60 24 76 34 L75 39 Q60 35 45 39 Z" fill="url(#graduation-cap-cap)" stroke="#0a0b10" strokeWidth="1" />
      <path d="M46 35 Q60 30 74 35" fill="none" stroke="#3d4255" strokeWidth="0.8" opacity="0.7" />
      {/* Mortarboard */}
      <path d="M60 18 L92 30 L60 42 L28 30 Z" fill="url(#graduation-cap-board)" stroke="#0a0b10" strokeWidth="1" strokeLinejoin="round" />
      <path d="M60 18 L92 30 L60 35 L28 30 Z" fill="#3a3e52" opacity="0.5" />
      <path d="M28 30 L60 42 L60 35 Z" fill="#000000" opacity="0.25" />
      {/* Center button */}
      <circle cx="60" cy="29.5" r="3" fill="#1a1c26" stroke="#0a0b10" strokeWidth="0.8" />
      <circle cx="60" cy="29.5" r="1.4" fill="#d9b24a" />
      <circle cx="59.4" cy="28.9" r="0.5" fill="#fff2c6" />
      {/* Tassel cord */}
      <path d="M60 29.5 Q72 30 78 31 L79 34" fill="none" stroke="#d9b24a" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="79" cy="34" r="1.8" fill="#e6c25e" stroke="#a7822f" strokeWidth="0.6" />
      {/* Tassel strands */}
      <path d="M77.6 35 L77 48" stroke="url(#graduation-cap-tassel)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M78.6 35.2 L78.6 48.5" stroke="url(#graduation-cap-tassel)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M79.6 35.2 L80.4 48" stroke="url(#graduation-cap-tassel)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M80.4 35 L81.8 47.5" stroke="url(#graduation-cap-tassel)" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="76.6" y="34.6" width="5.6" height="2.4" rx="1" fill="#c89a36" />
      <ellipse cx="79.3" cy="48.5" rx="2.6" ry="1.4" fill="#bd8f2c" />
    </g>
  );
}
