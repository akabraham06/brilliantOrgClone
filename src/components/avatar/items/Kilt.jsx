export default function Kilt() {
  return (
    <g>
      <defs>
        <linearGradient id="kilt-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f5a3a" />
          <stop offset="50%" stopColor="#3d7049" />
          <stop offset="100%" stopColor="#28502f" />
        </linearGradient>
        <linearGradient id="kilt-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#47744f" />
          <stop offset="100%" stopColor="#2f5a3a" />
        </linearGradient>
        <clipPath id="kilt-clip">
          <path d="M41 110 L79 110 L86 133 L34 133 Z" />
        </clipPath>
      </defs>
      {/* Waistband */}
      <rect x="40" y="104" width="40" height="6.5" rx="1.5" fill="url(#kilt-band)" stroke="#1f3d26" strokeWidth="1" />
      {/* Flared pleated panel base */}
      <path d="M41 110 L79 110 L86 133 L34 133 Z" fill="url(#kilt-base)" stroke="#1f3d26" strokeWidth="1" />
      {/* Plaid: vertical translucent stripes */}
      <g clipPath="url(#kilt-clip)">
        <rect x="38" y="110" width="4" height="23" fill="#1c3a24" opacity="0.45" />
        <rect x="48" y="110" width="4" height="23" fill="#1c3a24" opacity="0.45" />
        <rect x="58" y="110" width="4" height="23" fill="#1c3a24" opacity="0.45" />
        <rect x="68" y="110" width="4" height="23" fill="#1c3a24" opacity="0.45" />
        <rect x="78" y="110" width="4" height="23" fill="#1c3a24" opacity="0.45" />
        <rect x="43" y="110" width="1.6" height="23" fill="#d7c24a" opacity="0.55" />
        <rect x="63" y="110" width="1.6" height="23" fill="#d7c24a" opacity="0.55" />
        {/* Horizontal translucent crossing stripes */}
        <rect x="34" y="115" width="52" height="4" fill="#1c3a24" opacity="0.4" />
        <rect x="34" y="124" width="52" height="4" fill="#1c3a24" opacity="0.4" />
        <rect x="34" y="120.5" width="52" height="1.6" fill="#a8323a" opacity="0.5" />
        <rect x="34" y="129.5" width="52" height="1.6" fill="#a8323a" opacity="0.5" />
      </g>
      {/* Pleat shading lines */}
      <path d="M48 110 L43 132" fill="none" stroke="#1f3d26" strokeWidth="0.8" opacity="0.7" />
      <path d="M56 110 L53 132" fill="none" stroke="#1f3d26" strokeWidth="0.8" opacity="0.7" />
      <path d="M64 110 L67 132" fill="none" stroke="#1f3d26" strokeWidth="0.8" opacity="0.7" />
      <path d="M72 110 L77 132" fill="none" stroke="#1f3d26" strokeWidth="0.8" opacity="0.7" />
      <path d="M52 110 L49 132" fill="none" stroke="#5a8a64" strokeWidth="0.5" opacity="0.5" />
      <path d="M68 110 L72 132" fill="none" stroke="#5a8a64" strokeWidth="0.5" opacity="0.5" />
      {/* Hem band */}
      <path d="M34 133 L86 133 L85.5 136 L34.5 136 Z" fill="#1f3d26" stroke="#1f3d26" strokeWidth="0.6" />
      {/* Kilt pin on the front */}
      <line x1="62" y1="124" x2="62" y2="131" stroke="#cfa93f" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="62" cy="124" r="1.8" fill="none" stroke="#cfa93f" strokeWidth="1.2" />
      <circle cx="62" cy="131" r="1.1" fill="#cfa93f" />
      <circle cx="62" cy="124" r="0.6" fill="#e8cd6a" />
    </g>
  );
}
