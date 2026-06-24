/**
 * Brilliant-style logo: a green "sparkle" diamond mark + the "Brilliant"
 * wordmark. Used on the public-facing landing/auth screens.
 */
export default function BrilliantLogo({
  size = 28,
  showWordmark = true,
  wordmarkColor = '#1b1b1b',
  className,
}) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Brilliant"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="brilliantSparkle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b6f36b" />
            <stop offset="55%" stopColor="#3ecf5b" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        {/* Four-pointed concave sparkle */}
        <path
          d="M24 1 C26.5 18 30 21.5 47 24 C30 26.5 26.5 30 24 47 C21.5 30 18 26.5 1 24 C18 21.5 21.5 18 24 1 Z"
          fill="url(#brilliantSparkle)"
        />
        {/* White rounded tile + black square notch */}
        <rect x="16.5" y="16.5" width="15" height="15" rx="4" fill="#ffffff" />
        <rect x="20.5" y="20.5" width="7" height="7" rx="1.5" fill="#111111" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily:
              "'Fredoka', 'Baloo 2', 'Quicksand', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: size * 0.82,
            letterSpacing: '-0.005em',
            color: wordmarkColor,
          }}
        >
          Brilliant
        </span>
      )}
    </span>
  );
}
