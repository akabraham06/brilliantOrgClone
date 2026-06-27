export default function LabGoggles() {
  return (
    <g>
      <defs>
        <radialGradient id="lab-goggles-lens" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#eafaf0" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#c2e8d6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#9ccbb8" stopOpacity="0.32" />
        </radialGradient>
        <linearGradient id="lab-goggles-strap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d24a3a" />
          <stop offset="50%" stopColor="#f06a52" />
          <stop offset="100%" stopColor="#c23e30" />
        </linearGradient>
        <linearGradient id="lab-goggles-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5560" />
          <stop offset="100%" stopColor="#27303a" />
        </linearGradient>
      </defs>
      {/* Elastic strap around the head */}
      <path d="M40 38 Q26 40 22 44" fill="none" stroke="url(#lab-goggles-strap)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M80 38 Q94 40 98 44" fill="none" stroke="url(#lab-goggles-strap)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M22 44 Q60 56 98 44" fill="none" stroke="url(#lab-goggles-strap)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M22 44 Q60 55 98 44" fill="none" stroke="#7a261c" strokeWidth="0.6" opacity="0.5" />
      {/* Side vents */}
      <rect x="40.5" y="35.5" width="3.5" height="6.5" rx="1.5" fill="url(#lab-goggles-frame)" />
      <rect x="76" y="35.5" width="3.5" height="6.5" rx="1.5" fill="url(#lab-goggles-frame)" />
      <line x1="41.5" y1="36.8" x2="43" y2="36.8" stroke="#1b2128" strokeWidth="0.5" />
      <line x1="41.5" y1="38.5" x2="43" y2="38.5" stroke="#1b2128" strokeWidth="0.5" />
      <line x1="41.5" y1="40.2" x2="43" y2="40.2" stroke="#1b2128" strokeWidth="0.5" />
      <line x1="77" y1="36.8" x2="78.5" y2="36.8" stroke="#1b2128" strokeWidth="0.5" />
      <line x1="77" y1="38.5" x2="78.5" y2="38.5" stroke="#1b2128" strokeWidth="0.5" />
      <line x1="77" y1="40.2" x2="78.5" y2="40.2" stroke="#1b2128" strokeWidth="0.5" />
      {/* Goggle cups */}
      <ellipse cx="51" cy="38" rx="9" ry="7.5" fill="url(#lab-goggles-frame)" />
      <ellipse cx="69" cy="38" rx="9" ry="7.5" fill="url(#lab-goggles-frame)" />
      {/* Lenses */}
      <ellipse cx="51" cy="38" rx="6.6" ry="5.6" fill="url(#lab-goggles-lens)" stroke="#34404a" strokeWidth="1.2" />
      <ellipse cx="69" cy="38" rx="6.6" ry="5.6" fill="url(#lab-goggles-lens)" stroke="#34404a" strokeWidth="1.2" />
      {/* Bridge connector */}
      <rect x="57" y="36.5" width="6" height="3" rx="1.5" fill="url(#lab-goggles-frame)" />
      {/* Fog band */}
      <path d="M46 35.5 Q51 34.4 56 35.5" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <path d="M64 35.5 Q69 34.4 74 35.5" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      {/* Specular highlights */}
      <path d="M47.5 35.6 Q49.5 34.4 51.5 35.2" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
      <path d="M65.5 35.6 Q67.5 34.4 69.5 35.2" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}
