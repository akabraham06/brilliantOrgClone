import { useEffect, useState } from 'react';
import { useSpring } from './lib/motion.js';
import v from './viz.module.css';

const AX = 84;
const BX = 216;
const CY = 84;

/**
 * "Giving vs. sharing": one toggle contrasts the two ways atoms settle their
 * electron needs. Give = ionic (the electron pair moves fully onto one atom,
 * which gains charge); Share = covalent (the pair sits between both atoms, no
 * charges). The shared pair springs between positions so the contrast is fluid.
 */
export default function GiveVsShareScene({ onReady, savedState, onSaveState }) {
  const [mode, setMode] = useState(savedState?.mode || 'share');

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const give = mode === 'give';
  const eX = useSpring(give ? BX - 22 : (AX + BX) / 2, { stiffness: 0.16 });

  function choose(next) {
    setMode(next);
    onSaveState?.({ mode: next });
  }

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      <div className={v.toggleGroup} role="group" aria-label="Bonding style">
        <button type="button" className={!give ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => choose('share')}>Share (covalent)</button>
        <button type="button" className={give ? `${v.toggle} ${v.toggleActive}` : v.toggle} onClick={() => choose('give')}>Give (ionic)</button>
      </div>

      <div className={v.svgWrap} style={{ maxWidth: 320 }}>
        <svg viewBox="0 0 300 150" className={v.svg} role="img" aria-label={give ? 'Ionic: electron given away' : 'Covalent: electron pair shared'}>
          <defs>
            <radialGradient id="gs-shade" cx="34%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="34%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          {/* bond line only when sharing */}
          <line x1={AX} y1={CY} x2={BX} y2={CY} stroke="var(--color-border-strong)" strokeWidth="3" style={{ opacity: give ? 0 : 1, transition: 'opacity 300ms ease' }} />

          {/* atom A */}
          <circle cx={AX} cy={CY} r="26" fill="var(--accent-purple)" />
          <circle cx={AX} cy={CY} r="26" fill="url(#gs-shade)" />
          <text x={AX} y={CY + 5} textAnchor="middle" fontWeight="800" fontSize="15" fill="#0e0f13">A</text>
          <text x={AX} y={CY - 34} textAnchor="middle" fontWeight="800" fontSize="16" fill="var(--accent-orange)" style={{ opacity: give ? 1 : 0, transition: 'opacity 320ms ease' }}>+</text>

          {/* atom B */}
          <circle cx={BX} cy={CY} r="30" fill="var(--accent-green)" />
          <circle cx={BX} cy={CY} r="30" fill="url(#gs-shade)" />
          <text x={BX} y={CY + 5} textAnchor="middle" fontWeight="800" fontSize="15" fill="#0e0f13">B</text>
          <text x={BX} y={CY - 38} textAnchor="middle" fontWeight="800" fontSize="16" fill="var(--accent-blue)" style={{ opacity: give ? 1 : 0, transition: 'opacity 320ms ease' }}>&#8722;</text>

          {/* the shared / given electron pair - bright accent + dark stroke so the
              dots stay visible against any surface (dark or light theme) */}
          <circle cx={eX - 6} cy={CY + 1} r="5.5" fill="var(--accent-yellow)" stroke="#0e0f13" strokeWidth="1.5" />
          <circle cx={eX + 6} cy={CY + 1} r="5.5" fill="var(--accent-yellow)" stroke="#0e0f13" strokeWidth="1.5" />
        </svg>
      </div>

      <p className={v.muted}>
        {give
          ? 'Giving = ionic. Atom A hands its electrons fully to atom B. Now A is positive and B is negative - opposite charges that attract.'
          : 'Sharing = covalent. The electron pair sits between A and B, so both atoms count it toward a full shell. No full charges form.'}
      </p>
    </div>
  );
}
