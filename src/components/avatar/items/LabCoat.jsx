export default function LabCoat() {
  return (
    <g>
      <defs>
        <linearGradient id="lab-coat-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#eef1f5" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dde2ea" />
        </linearGradient>
        <linearGradient id="lab-coat-lapel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e3e8ef" />
        </linearGradient>
        <linearGradient id="lab-coat-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfd6e0" />
          <stop offset="100%" stopColor="#aeb7c6" />
        </linearGradient>
      </defs>
      {/* Inner shirt visible at the open front */}
      <path d="M52 65 L68 65 L66 106 Q60 109 54 106 Z" fill="url(#lab-coat-inner)" stroke="#9aa4b4" strokeWidth="0.8" />
      <path d="M58 66 L62 66 L61 104 L59 104 Z" fill="#9da7b8" opacity="0.5" />
      {/* Coat body */}
      <path d="M34 66 Q44 63 52 64 L60 70 L68 64 Q76 63 86 66 L83 107 Q60 112 37 107 Z" fill="url(#lab-coat-body)" stroke="#b9c1cd" strokeWidth="1" />
      {/* Short sleeve caps */}
      <path d="M34 66 Q29 72 31 82 L40 80 L41 68 Z" fill="url(#lab-coat-body)" stroke="#b9c1cd" strokeWidth="1" />
      <path d="M86 66 Q91 72 89 82 L80 80 L79 68 Z" fill="url(#lab-coat-body)" stroke="#b9c1cd" strokeWidth="1" />
      <path d="M32 80 Q35 83 40 80 L40 78 L32 78 Z" fill="#cdd4de" opacity="0.7" />
      <path d="M88 80 Q85 83 80 80 L80 78 L88 78 Z" fill="#cdd4de" opacity="0.7" />
      {/* Front opening seam */}
      <path d="M60 70 L60 108" stroke="#c4ccd7" strokeWidth="0.8" fill="none" />
      {/* Lapels */}
      <path d="M52 64 L60 70 L55 88 L48 80 Z" fill="url(#lab-coat-lapel)" stroke="#bcc4d0" strokeWidth="0.9" />
      <path d="M68 64 L60 70 L65 88 L72 80 Z" fill="url(#lab-coat-lapel)" stroke="#bcc4d0" strokeWidth="0.9" />
      <path d="M53 66 L59 71 L55 84 Z" fill="#d7dde6" opacity="0.6" />
      <path d="M67 66 L61 71 L65 84 Z" fill="#d7dde6" opacity="0.6" />
      {/* Fold shading */}
      <path d="M40 70 Q44 88 42 105" stroke="#cfd6e0" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M80 70 Q76 88 78 105" stroke="#cfd6e0" strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M48 90 Q52 98 50 106" stroke="#d6dce5" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M72 90 Q68 98 70 106" stroke="#d6dce5" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Highlight */}
      <path d="M44 68 Q46 86 45 104" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.8" />
      {/* Buttons */}
      <circle cx="56" cy="84" r="1.3" fill="#cfd6e0" stroke="#9aa4b4" strokeWidth="0.5" />
      <circle cx="56" cy="94" r="1.3" fill="#cfd6e0" stroke="#9aa4b4" strokeWidth="0.5" />
      <circle cx="64" cy="84" r="1.3" fill="#cfd6e0" stroke="#9aa4b4" strokeWidth="0.5" />
      <circle cx="64" cy="94" r="1.3" fill="#cfd6e0" stroke="#9aa4b4" strokeWidth="0.5" />
      {/* Chest pocket */}
      <rect x="71" y="84" width="11" height="11" rx="0.8" fill="#f3f6fa" stroke="#bcc4d0" strokeWidth="0.8" />
      <path d="M71 84 L82 84" stroke="#c4ccd7" strokeWidth="0.8" />
      {/* Pen in pocket */}
      <rect x="74" y="80" width="2.2" height="9" rx="0.8" fill="#2f6fb0" stroke="#1f4f80" strokeWidth="0.5" />
      <path d="M74 80 L76.2 80 L75.1 78 Z" fill="#dfe6ee" />
      <rect x="74.4" y="83" width="1.4" height="2" fill="#9ec3e6" />
      {/* Lower hem shadow */}
      <path d="M37 107 Q60 112 83 107 L82 105 Q60 109 38 105 Z" fill="#cdd4de" opacity="0.6" />
    </g>
  );
}
