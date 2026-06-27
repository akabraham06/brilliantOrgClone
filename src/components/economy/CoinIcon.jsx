/**
 * The app's coin glyph — a small bespoke SVG used wherever coins are shown.
 * A warm gold disc stamped with a stylized molecule.
 */
export default function CoinIcon({ size = 18, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" fill="#f0c23b" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#c79a26" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#d9ad33" strokeWidth="1" />
      <circle cx="12" cy="8.5" r="1.8" fill="#fff7df" />
      <circle cx="8.5" cy="14" r="1.8" fill="#fff7df" />
      <circle cx="15.5" cy="14" r="1.8" fill="#fff7df" />
      <path d="M12 8.5 L8.5 14 M12 8.5 L15.5 14 M8.5 14 L15.5 14" stroke="#fff7df" strokeWidth="1.1" />
    </svg>
  );
}
