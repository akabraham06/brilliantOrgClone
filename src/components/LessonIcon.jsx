import styles from './LessonIcon.module.css';

const ACCENTS = {
  atom: 'var(--accent-blue)',
  shells: 'var(--accent-purple)',
  bond: 'var(--accent-green)',
  formula: 'var(--accent-yellow)',
  reaction: 'var(--accent-orange)',
  mole: 'var(--accent-teal)',
  beaker: 'var(--accent-pink)',
};

function Glyph({ icon }) {
  switch (icon) {
    case 'atom':
      return (
        <>
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(120 12 12)" />
        </>
      );
    case 'shells':
      return (
        <>
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="2.5" r="1.5" fill="currentColor" />
        </>
      );
    case 'bond':
      return (
        <>
          <circle cx="7" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <line x1="10.2" y1="12" x2="13.8" y2="12" stroke="currentColor" strokeWidth="1.8" />
        </>
      );
    case 'formula':
      return (
        <>
          <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor">
            H₂O
          </text>
        </>
      );
    case 'reaction':
      return (
        <>
          <line x1="3" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.8" />
          <polyline points="14,8 18,12 14,16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.8" />
        </>
      );
    case 'mole':
      return (
        <>
          <path d="M5 7 h14 l-2 11 a2 2 0 0 1 -2 1.6 h-6 a2 2 0 0 1 -2 -1.6 z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <line x1="5" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="10" cy="13" r="1.1" fill="currentColor" />
          <circle cx="14" cy="15" r="1.1" fill="currentColor" />
          <circle cx="13" cy="11" r="1.1" fill="currentColor" />
        </>
      );
    case 'beaker':
    default:
      return (
        <>
          <path d="M9 3 v6 l-4 9 a1.6 1.6 0 0 0 1.5 2.2 h11 a1.6 1.6 0 0 0 1.5 -2.2 l-4 -9 v-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="8" y1="3" x2="16" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6.8 15 h10.4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="11" cy="17.5" r="0.9" fill="currentColor" />
        </>
      );
  }
}

export default function LessonIcon({ icon = 'beaker', size = 48 }) {
  const accent = ACCENTS[icon] || ACCENTS.beaker;
  return (
    <span
      className={styles.tile}
      style={{ width: size, height: size, color: accent }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}>
        <Glyph icon={icon} />
      </svg>
    </span>
  );
}
