import { useEffect } from 'react';
import v from './viz.module.css';
import s from './ExplainerGraphic.module.css';

const SHADE = (
  <defs>
    <radialGradient id="eg-shade" cx="34%" cy="30%" r="78%">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
      <stop offset="34%" stopColor="#fff" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
    </radialGradient>
  </defs>
);

function Ball({ cx, cy, r, color, label, labelSize }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(0,0,0,0.3)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#eg-shade)" />
      {label != null && (
        <text x={cx} y={cy + (labelSize || r) * 0.35} textAnchor="middle" fontSize={labelSize || r} fontWeight="800" fill="#0e0f13">
          {label}
        </text>
      )}
    </g>
  );
}

const PURPLE = 'var(--accent-purple)';
const GREEN = 'var(--accent-green)';
const BLUE = 'var(--accent-blue)';
const PINK = 'var(--accent-pink)';
const YELLOW = 'var(--accent-yellow)';
const ORANGE = 'var(--accent-orange)';
const SUB = 'var(--color-text-subtle)';
const TEXT = 'var(--color-text)';

const Frame = ({ children, label }) => (
  <div className={s.wrap}>
    <svg viewBox="0 0 220 150" role="img" aria-label={label}>
      {SHADE}
      {children}
    </svg>
  </div>
);

const Spark = ({ x, y, r = 7, color = YELLOW }) => (
  <path
    d={`M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z`}
    fill={color}
  />
);

/* 0a. Chemistry is everywhere: a flask bubbling with sparks of change */
function Flask() {
  const bubbles = [[100, 102], [112, 108], [122, 98]];
  return (
    <Frame label="Chemistry studies matter - everything around you - and how it changes">
      <path
        d="M 100 38 H 120 V 70 L 150 116 Q 155 126 143 126 H 77 Q 65 126 70 116 L 100 70 Z"
        fill="rgba(96,165,250,0.10)"
        stroke="var(--color-border-strong)"
        strokeWidth="2.5"
      />
      <rect x="95" y="30" width="30" height="9" rx="3" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      <path d="M 82 102 L 110 70 L 138 102 L 145 113 Q 149 121 141 121 H 79 Q 71 121 75 113 Z" fill={GREEN} opacity="0.5" />
      {bubbles.map(([x, y], i) => (
        <circle key={i} className={s.rise} cx={x} cy={y} r={i === 1 ? 4 : 3} fill="#fff" opacity="0.85" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <g className={s.twinkle} style={{ animationDelay: '0.1s' }}><Spark x={54} y={54} r={8} /></g>
      <g className={s.twinkle} style={{ animationDelay: '0.9s' }}><Spark x={168} y={62} r={7} color={PURPLE} /></g>
      <g className={s.twinkle} style={{ animationDelay: '1.6s' }}><Spark x={150} y={40} r={6} /></g>
    </Frame>
  );
}

/* 0b. Matter = mass + takes up space */
function Matter() {
  return (
    <Frame label="Matter is anything that has mass and takes up space">
      <g className={s.float}>
        <line x1="110" y1="20" x2="110" y2="40" stroke={SUB} strokeWidth="2" />
        <rect x="95" y="8" width="30" height="17" rx="4" fill={ORANGE} stroke="rgba(0,0,0,0.25)" />
        <text x="110" y="21" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0e0f13">kg</text>
        <text x="150" y="21" fontSize="11" fill={SUB} fontWeight="700">has mass</text>
      </g>
      <rect x="56" y="44" width="108" height="72" rx="10" fill="none" stroke="var(--color-border-strong)" strokeWidth="2.5" strokeDasharray="7 7" />
      <g className={s.pulse}>{Ball({ cx: 110, cy: 80, r: 28, color: BLUE })}</g>
      <text x="110" y="132" textAnchor="middle" fontSize="11" fill={SUB} fontWeight="700">takes up space</text>
    </Frame>
  );
}

/* 1. Building blocks assemble */
function Blocks() {
  const homes = [
    [82, 52], [110, 52], [138, 52],
    [82, 82], [110, 82], [138, 82],
  ];
  const starts = [
    [-50, -30, -30], [0, -50, 20], [55, -28, -25],
    [-55, 30, 25], [4, 55, -20], [52, 30, 28],
  ];
  const colors = [BLUE, GREEN, PINK, YELLOW, PURPLE, ORANGE];
  return (
    <Frame label="Small blocks fly together to build a larger structure">
      {homes.map(([x, y], i) => (
        <rect
          key={i}
          className={s.block}
          x={x} y={y} width="26" height="26" rx="5"
          fill={colors[i]} stroke="rgba(0,0,0,0.25)"
          style={{ '--tx': `${starts[i][0]}px`, '--ty': `${starts[i][1]}px`, '--tr': `${starts[i][2]}deg`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </Frame>
  );
}

/* 2. Organized grid fills in order */
function Grid() {
  const cells = [];
  let i = 0;
  for (let r = 0; r < 3; r += 1)
    for (let c = 0; c < 5; c += 1) {
      cells.push({ x: 30 + c * 34, y: 36 + r * 30, i });
      i += 1;
    }
  return (
    <Frame label="Tiles fill an organized grid one by one, like the periodic table">
      {cells.map(({ x, y, i: k }) => (
        <rect key={k} className={s.cell} x={x} y={y} width="28" height="24" rx="4" fill={k % 4 === 0 ? PURPLE : k % 3 === 0 ? GREEN : BLUE} style={{ animationDelay: `${k * 0.12}s` }} />
      ))}
    </Frame>
  );
}

/* 3. Pure substance vs mixture jars */
function Jars() {
  const beaker = (ox) => `M ${ox} 40 H ${ox + 56} V 96 Q ${ox + 56} 116 ${ox + 28} 116 Q ${ox} 116 ${ox} 96 Z`;
  const pure = [BLUE, BLUE, BLUE, BLUE, BLUE];
  const mix = [BLUE, PINK, GREEN, YELLOW, PURPLE];
  const spots = [[16, 70], [38, 64], [28, 90], [14, 98], [40, 96]];
  return (
    <Frame label="A pure substance has identical particles; a mixture has different ones">
      <path d={beaker(20)} fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <path d={beaker(144)} fill="var(--color-bg-elevated)" stroke="var(--color-border-strong)" strokeWidth="2" />
      {spots.map(([x, y], i) => <g key={`p${i}`} className={s.dropDot} style={{ animationDelay: `${i * 0.18}s` }}>{Ball({ cx: 20 + x, cy: y, r: 7, color: pure[i] })}</g>)}
      {spots.map(([x, y], i) => <g key={`m${i}`} className={s.dropDot} style={{ animationDelay: `${i * 0.18 + 0.1}s` }}>{Ball({ cx: 144 + x, cy: y, r: 7, color: mix[i] })}</g>)}
      <text x="48" y="134" textAnchor="middle" fontSize="11" fill={SUB} fontWeight="700">pure</text>
      <text x="172" y="134" textAnchor="middle" fontSize="11" fill={SUB} fontWeight="700">mixture</text>
    </Frame>
  );
}

/* 4. Unique ID badge - the atomic number scales for emphasis */
function Badge() {
  return (
    <Frame label="An atomic number is a unique ID, like a badge number">
      <rect x="56" y="22" width="108" height="106" rx="14" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <rect x="56" y="22" width="108" height="26" rx="14" fill="var(--accent-blue)" opacity="0.25" />
      <text x="110" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill={BLUE} letterSpacing="1.5">ATOMIC NUMBER</text>
      <g className={s.scaleNum} style={{ transformOrigin: '110px 86px' }}>
        <text x="110" y="100" textAnchor="middle" fontSize="46" fontWeight="800" fill={TEXT}>6</text>
      </g>
      <text x="110" y="122" textAnchor="middle" fontSize="12" fontWeight="700" fill={SUB}>= Carbon, always</text>
    </Frame>
  );
}

/* 4b. Inside the atom - nucleus of protons/neutrons + orbiting electrons */
function InsideAtom() {
  return (
    <Frame label="Protons and neutrons sit in the nucleus while electrons orbit">
      <ellipse cx="110" cy="75" rx="76" ry="34" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      <ellipse cx="110" cy="75" rx="48" ry="64" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {Ball({ cx: 102, cy: 70, r: 9, color: ORANGE })}
      {Ball({ cx: 118, cy: 72, r: 9, color: SUB })}
      {Ball({ cx: 110, cy: 82, r: 9, color: ORANGE })}
      {Ball({ cx: 100, cy: 84, r: 9, color: SUB })}
      <circle className={s.orbit1} cx="186" cy="75" r="5.5" fill={BLUE} />
      <circle className={s.orbit2} cx="110" cy="139" r="5.5" fill={BLUE} />
      <text x="110" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill={SUB}>nucleus + electron shells</text>
    </Frame>
  );
}

/* 4c. Energy shells - electrons fill rings from the inside out */
function Shells() {
  return (
    <Frame label="Electrons fill energy shells from the inside out, like seats in a stadium">
      {Ball({ cx: 110, cy: 78, r: 16, color: ORANGE, label: '+', labelSize: 16 })}
      <circle cx="110" cy="78" r="34" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      <circle cx="110" cy="78" r="58" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {/* inner shell: full (2) */}
      {Ball({ cx: 76, cy: 78, r: 6, color: BLUE })}
      {Ball({ cx: 144, cy: 78, r: 6, color: BLUE })}
      {/* outer shell: filling, last one pops in */}
      {Ball({ cx: 110, cy: 20, r: 6, color: BLUE })}
      {Ball({ cx: 168, cy: 78, r: 6, color: BLUE })}
      <g className={s.popLate}>{Ball({ cx: 110, cy: 136, r: 6, color: YELLOW })}</g>
      <text x="110" y="148" textAnchor="middle" fontSize="10" fill={SUB}>inner fills first, then outer</text>
    </Frame>
  );
}

/* 7c. Ways to draw an atom/molecule: shell model, Lewis dots, line structure */
function Diagrams() {
  const dots = [
    [40, 40], [60, 40], [40, 88], [60, 88], [30, 64], [70, 64],
  ];
  return (
    <Frame label="Three common ways to draw atoms: shell model, Lewis dots, and line structures">
      {/* panel 1: shell model */}
      <circle cx="50" cy="64" r="30" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {Ball({ cx: 50, cy: 64, r: 11, color: ORANGE })}
      {Ball({ cx: 50, cy: 34, r: 5, color: BLUE })}
      {Ball({ cx: 80, cy: 64, r: 5, color: BLUE })}
      <text x="50" y="116" textAnchor="middle" fontSize="10" fill={SUB}>shell model</text>

      {/* panel 2: Lewis dots */}
      <text x="110" y="72" textAnchor="middle" fontSize="22" fontWeight="800" fill={TEXT}>O</text>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x + 70} cy={y} r="3" fill={YELLOW} />
      ))}
      <text x="110" y="116" textAnchor="middle" fontSize="10" fill={SUB}>Lewis dots</text>

      {/* panel 3: line / structural */}
      {Ball({ cx: 158, cy: 64, r: 9, color: GREEN })}
      {Ball({ cx: 196, cy: 64, r: 9, color: BLUE })}
      <line x1="167" y1="64" x2="187" y2="64" stroke="var(--color-text)" strokeWidth="2.5" />
      <text x="178" y="116" textAnchor="middle" fontSize="10" fill={SUB}>line structure</text>
    </Frame>
  );
}

/* 6b. Why lattices form - opposite charges pull in every direction */
function Lattice() {
  const cells = [];
  for (let r = 0; r < 3; r += 1)
    for (let c = 0; c < 3; c += 1) cells.push({ r, c, plus: (r + c) % 2 === 0 });
  return (
    <Frame label="Opposite ions attract in all directions and stack into a repeating grid">
      {cells.map(({ r, c, plus }) => (
        <g key={`${r}-${c}`} className={s.popLate} style={{ animationDelay: `${(r + c) * 0.12}s` }}>
          {Ball({
            cx: 74 + c * 36,
            cy: 42 + r * 36,
            r: plus ? 12 : 14,
            color: plus ? ORANGE : GREEN,
            label: plus ? '+' : '\u2212',
            labelSize: 13,
          })}
        </g>
      ))}
    </Frame>
  );
}

/* 9b. Polarity in water - bent molecule with partial charges + and - ends */
function Water() {
  return (
    <Frame label="Water is bent and polar: the oxygen end is slightly negative, the hydrogen end slightly positive">
      {/* bonds */}
      <line x1="110" y1="64" x2="72" y2="104" stroke="var(--color-border-strong)" strokeWidth="5" />
      <line x1="110" y1="64" x2="148" y2="104" stroke="var(--color-border-strong)" strokeWidth="5" />
      {/* oxygen (greedy, slightly negative) */}
      {Ball({ cx: 110, cy: 60, r: 26, color: GREEN, label: 'O', labelSize: 16 })}
      <text className={s.pulse} x="110" y="26" textAnchor="middle" fontSize="16" fontWeight="800" fill={BLUE}>&#948;&#8722;</text>
      {/* hydrogens (slightly positive) */}
      {Ball({ cx: 66, cy: 110, r: 15, color: BLUE, label: 'H', labelSize: 11 })}
      {Ball({ cx: 154, cy: 110, r: 15, color: BLUE, label: 'H', labelSize: 11 })}
      <text className={s.pulse} x="50" y="134" textAnchor="middle" fontSize="13" fontWeight="800" fill={ORANGE}>&#948;+</text>
      <text className={s.pulse} x="170" y="134" textAnchor="middle" fontSize="13" fontWeight="800" fill={ORANGE}>&#948;+</text>
    </Frame>
  );
}

/* 5. Isotope: backpack weight changes, identity stays */
function Backpack() {
  return (
    <Frame label="Isotopes are the same element carrying a heavier or lighter nucleus">
      <circle cx="96" cy="48" r="14" fill={SUB} />
      <line x1="96" y1="62" x2="96" y2="98" stroke={SUB} strokeWidth="6" strokeLinecap="round" />
      <line x1="96" y1="72" x2="74" y2="88" stroke={SUB} strokeWidth="5" strokeLinecap="round" />
      <g className={s.pulse}>
        <rect x="104" y="64" width="34" height="40" rx="8" fill={ORANGE} stroke="rgba(0,0,0,0.25)" />
        <text x="121" y="89" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0e0f13">n</text>
      </g>
      <rect x="70" y="108" width="60" height="20" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" />
      <text x="100" y="122" textAnchor="middle" fontSize="11" fontWeight="700" fill={TEXT}>still Carbon</text>
    </Frame>
  );
}

/* 6. Ion formation: electron crosses, charges appear */
function Transfer() {
  return (
    <Frame label="An atom gives away an electron and becomes a charged ion">
      {Ball({ cx: 56, cy: 80, r: 26, color: PURPLE, label: 'Na', labelSize: 16 })}
      {Ball({ cx: 168, cy: 80, r: 30, color: GREEN, label: 'Cl', labelSize: 16 })}
      <circle className={s.mover} cx="80" cy="54" r="7" fill={BLUE} stroke="rgba(0,0,0,0.3)" />
      <text className={s.fadeLate} x="56" y="34" textAnchor="middle" fontSize="16" fontWeight="800" fill={ORANGE}>+1</text>
      <text className={s.fadeLate} x="168" y="30" textAnchor="middle" fontSize="16" fontWeight="800" fill={BLUE}>-1</text>
    </Frame>
  );
}

/* 7. Octet stability: a full hand of cards */
function Cards() {
  const xs = [70, 92, 114, 136];
  return (
    <Frame label="Atoms are stable with a full set, like a complete hand of cards">
      {xs.map((x, i) => (
        <g key={i} className={s.deal} style={{ animationDelay: `${i * 0.25}s` }}>
          <rect x={x} y="52" width="24" height="40" rx="5" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
          <circle cx={x + 12} cy="72" r="5" fill={YELLOW} />
        </g>
      ))}
      <text className={s.fadeLate} x="110" y="116" textAnchor="middle" fontSize="13" fontWeight="800" fill={GREEN}>full shell &#10003;</text>
    </Frame>
  );
}

/* 8. Covalent share: shared pair between two atoms */
function Share() {
  return (
    <Frame label="Two atoms share a pair of electrons">
      <g className={s.float}>
        {Ball({ cx: 80, cy: 80, r: 26, color: '#e9edf7', label: 'H', labelSize: 14 })}
        {Ball({ cx: 140, cy: 80, r: 26, color: '#e9edf7', label: 'H', labelSize: 14 })}
        <circle cx="104" cy="80" r="5.5" fill={BLUE} />
        <circle cx="116" cy="80" r="5.5" fill={BLUE} />
      </g>
      <text x="110" y="124" textAnchor="middle" fontSize="11" fill={SUB}>shared = belongs to both</text>
    </Frame>
  );
}

/* 9. Metallic sea of electrons */
function Sea() {
  const ions = [[60, 60], [110, 60], [160, 60], [60, 100], [110, 100], [160, 100]];
  const es = [[80, 70], [130, 64], [150, 96], [90, 104], [120, 84]];
  return (
    <Frame label="Metal ions sit in a flowing sea of shared electrons">
      {ions.map(([x, y], i) => <g key={`i${i}`}>{Ball({ cx: x, cy: y, r: 14, color: ORANGE, label: '+', labelSize: 14 })}</g>)}
      {es.map(([x, y], i) => (
        <circle key={i} className={s.drift} cx={x} cy={y} r="5" fill={BLUE} style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </Frame>
  );
}

/* 10. Recipe card with ingredient counts */
function Recipe() {
  return (
    <Frame label="A formula is a recipe listing how many of each atom">
      <rect x="46" y="28" width="128" height="96" rx="10" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <text x="110" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill={TEXT}>Recipe: H&#8322;O</text>
      <g className={s.appear} style={{ animationDelay: '0.1s' }}>
        {Ball({ cx: 70, cy: 74, r: 8, color: '#e9edf7' })}
        {Ball({ cx: 90, cy: 74, r: 8, color: '#e9edf7' })}
        <text x="120" y="79" fontSize="12" fill={SUB} fontWeight="700">2 H</text>
      </g>
      <g className={s.appear} style={{ animationDelay: '0.5s' }}>
        {Ball({ cx: 70, cy: 102, r: 9, color: PINK })}
        <text x="120" y="107" fontSize="12" fill={SUB} fontWeight="700">1 O</text>
      </g>
    </Frame>
  );
}

/* 11. Formula -> name, part by part (metal keeps its name; nonmetal + -ide) */
function Label() {
  return (
    <Frame label="In NaCl the metal keeps its name and the nonmetal gains an -ide ending">
      {/* metal part */}
      <text x="74" y="60" textAnchor="middle" fontSize="26" fontWeight="800" fill={PURPLE}>Na</text>
      <line x1="74" y1="70" x2="74" y2="88" stroke={SUB} strokeWidth="1.5" />
      <text x="74" y="102" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEXT}>sodium</text>
      <text x="74" y="118" textAnchor="middle" fontSize="9" fill={SUB}>metal: keeps name</text>

      {/* nonmetal part */}
      <text x="150" y="60" textAnchor="middle" fontSize="26" fontWeight="800" fill={GREEN}>Cl</text>
      <line x1="150" y1="70" x2="150" y2="88" stroke={SUB} strokeWidth="1.5" />
      <text x="150" y="102" textAnchor="middle" fontSize="12" fontWeight="700" fill={TEXT}>chlor<tspan fill={ORANGE}>ide</tspan></text>
      <text x="150" y="118" textAnchor="middle" fontSize="9" fill={SUB}>nonmetal: + -ide</text>

      <text x="112" y="30" textAnchor="middle" fontSize="13" fontWeight="800" fill={SUB}>NaCl</text>
    </Frame>
  );
}

/* 11b. Naming building blocks: count prefixes + the -ide ending */
function Affixes() {
  const rows = [
    ['mono-', '1'],
    ['di-', '2'],
    ['tri-', '3'],
    ['tetra-', '4'],
  ];
  return (
    <Frame label="Covalent prefixes count atoms: mono 1, di 2, tri 3, tetra 4; -ide ends a simple compound">
      <text x="64" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill={BLUE}>prefix = how many</text>
      {rows.map(([p, n], i) => (
        <g key={p} className={s.appear} style={{ animationDelay: `${i * 0.12}s` }}>
          <text x="40" y={48 + i * 19} fontSize="12" fontWeight="700" fill={TEXT}>{p}</text>
          <text x="92" y={48 + i * 19} fontSize="12" fill={SUB}>{n}</text>
        </g>
      ))}
      <line x1="120" y1="36" x2="120" y2="116" stroke="var(--color-border)" strokeWidth="1.5" />
      <text x="166" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill={ORANGE}>ending</text>
      <text x="166" y="60" textAnchor="middle" fontSize="15" fontWeight="800" fill={TEXT}>-ide</text>
      <text x="166" y="80" textAnchor="middle" fontSize="9" fill={SUB}>simple</text>
      <text x="166" y="92" textAnchor="middle" fontSize="9" fill={SUB}>2-element</text>
      <text x="166" y="104" textAnchor="middle" fontSize="9" fill={SUB}>compound</text>
    </Frame>
  );
}

/* 12. Servings: one plate -> three */
function Plates() {
  return (
    <Frame label="A coefficient multiplies whole servings, not the recipe inside one">
      <g>
        {Ball({ cx: 60, cy: 78, r: 22, color: BLUE, label: 'H\u2082O', labelSize: 13 })}
      </g>
      <g className={s.appear} style={{ animationDelay: '0.2s' }}>{Ball({ cx: 110, cy: 78, r: 22, color: BLUE })}</g>
      <g className={s.appear} style={{ animationDelay: '0.5s' }}>{Ball({ cx: 160, cy: 78, r: 22, color: BLUE })}</g>
      <text x="110" y="120" textAnchor="middle" fontSize="12" fill={SUB} fontWeight="700">3H&#8322;O = 3 whole molecules</text>
    </Frame>
  );
}

/* 13. Balance seesaw */
function Seesaw() {
  return (
    <Frame label="A balanced equation has equal weight on both sides">
      <g className={s.beam}>
        <rect x="40" y="72" width="140" height="8" rx="4" fill={SUB} />
        {Ball({ cx: 56, cy: 60, r: 14, color: BLUE })}
        {Ball({ cx: 164, cy: 60, r: 14, color: GREEN })}
      </g>
      <path d="M 96 120 L 124 120 L 110 80 Z" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      <text x="110" y="138" textAnchor="middle" fontSize="11" fill={SUB}>same atoms each side</text>
    </Frame>
  );
}

/* 14. Synthesis pattern A + B -> AB */
function Patterns() {
  return (
    <Frame label="Reactions follow repeatable patterns, like A plus B becomes AB">
      <g className={s.xfadeA}>
        {Ball({ cx: 78, cy: 70, r: 20, color: BLUE, label: 'A' })}
        <text x="110" y="76" textAnchor="middle" fontSize="20" fontWeight="800" fill={SUB}>+</text>
        {Ball({ cx: 142, cy: 70, r: 20, color: PINK, label: 'B' })}
      </g>
      <g className={s.xfadeB}>
        {Ball({ cx: 98, cy: 70, r: 20, color: BLUE, label: 'A' })}
        {Ball({ cx: 122, cy: 70, r: 20, color: PINK, label: 'B' })}
      </g>
      <text x="110" y="116" textAnchor="middle" fontSize="12" fill={SUB} fontWeight="700">synthesis: A + B &#8594; AB</text>
    </Frame>
  );
}

/* 15. Counting unit: carton scales to a huge count */
function Carton() {
  const eggs = [];
  for (let r = 0; r < 2; r += 1) for (let c = 0; c < 6; c += 1) eggs.push([54 + c * 19, 56 + r * 22]);
  return (
    <Frame label="A mole is a counting unit, like a dozen scaled up enormously">
      <rect x="44" y="44" width="132" height="50" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      {eggs.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="9" fill={YELLOW} />)}
      <text className={s.xfadeA} x="110" y="118" textAnchor="middle" fontSize="13" fontWeight="800" fill={TEXT}>a dozen = 12</text>
      <text className={s.xfadeB} x="110" y="118" textAnchor="middle" fontSize="13" fontWeight="800" fill={GREEN}>a mole = 6.022&#215;10&#178;&#179;</text>
    </Frame>
  );
}

/* 16. Molar mass: weigh a known count */
function Scale() {
  return (
    <Frame label="Molar mass is the mass of one mole, read off a scale">
      <rect x="70" y="96" width="80" height="30" rx="6" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      <g className={s.float}>
        {[[96, 74], [110, 70], [124, 74], [103, 84], [117, 84]].map(([x, y], i) => <g key={i}>{Ball({ cx: x, cy: y, r: 8, color: BLUE })}</g>)}
      </g>
      <text x="110" y="116" textAnchor="middle" fontSize="14" fontWeight="800" fill={GREEN}>18 g/mol</text>
      <text x="110" y="138" textAnchor="middle" fontSize="11" fill={SUB}>one mole of water</text>
    </Frame>
  );
}

/* 17. States of matter: people in three rooms (packed, mingling, sprinting) */
function Person({ x, y, color, cls, delay }) {
  return (
    <g className={cls} style={{ animationDelay: `${delay}s`, transformBox: 'fill-box', transformOrigin: 'center' }}>
      <circle cx={x} cy={y - 6} r="4" fill={color} stroke="rgba(0,0,0,0.2)" />
      <rect x={x - 4} y={y - 2} width="8" height="13" rx="4" fill={color} stroke="rgba(0,0,0,0.2)" />
    </g>
  );
}

function States() {
  // Solid: packed 2x3, only swaying. Liquid: mingling. Gas: sprinting apart.
  const solid = [[28, 50], [50, 50], [28, 76], [50, 76], [28, 102], [50, 102]];
  const liquid = [[95, 52], [122, 48], [105, 76], [92, 100], [126, 96]];
  const gas = [[162, 48], [192, 70], [166, 100]];
  const room = (x, label) => (
    <>
      <rect x={x} y="26" width="62" height="92" rx="8" fill="rgba(96,165,250,0.08)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      <text x={x + 31} y="134" textAnchor="middle" fontSize="11" fontWeight="700" fill={SUB}>{label}</text>
    </>
  );
  return (
    <Frame label="Particles act like people: packed in a solid, mingling in a liquid, sprinting in a gas">
      {room(8, 'solid')}
      {room(79, 'liquid')}
      {room(150, 'gas')}
      {solid.map(([x, y], i) => <Person key={`s${i}`} x={x} y={y} color={BLUE} cls={s.float} delay={i * 0.5} />)}
      {liquid.map(([x, y], i) => <Person key={`l${i}`} x={x} y={y} color={GREEN} cls={s.float} delay={i * 0.25} />)}
      {gas.map(([x, y], i) => <Person key={`g${i}`} x={x} y={y} color={ORANGE} cls={s.drift} delay={i * 0.3} />)}
    </Frame>
  );
}

/* 18. Dissolving: crystal disperses into ions */
function Dissolve() {
  const grid = [];
  let i = 0;
  for (let r = 0; r < 3; r += 1)
    for (let c = 0; c < 3; c += 1) {
      const isNa = (r + c) % 2 === 0;
      grid.push({ x: 96 + c * 16, y: 52 + r * 16, dx: (c - 1) * 46, dy: (r - 1) * 40, isNa, i });
      i += 1;
    }
  return (
    <Frame label="Salt dissolves by separating into ions that spread through water">
      <path d="M 40 36 H 180 V 110 Q 180 128 110 128 Q 40 128 40 110 Z" fill="rgba(96,165,250,0.12)" stroke="var(--color-border-strong)" strokeWidth="2" />
      {grid.map(({ x, y, dx, dy, isNa, i: k }) => (
        <g key={k} className={s.disperse} style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${k * 0.05}s` }}>
          {Ball({ cx: x, cy: y, r: 7, color: isNa ? PURPLE : GREEN })}
        </g>
      ))}
    </Frame>
  );
}

/* 19. pH dial sweep */
function Dial() {
  return (
    <Frame label="The pH scale is a dial sweeping from acidic to basic">
      <path d="M 40 110 A 70 70 0 0 1 180 110" fill="none" stroke="#e3342f" strokeWidth="12" strokeLinecap="round" />
      <path d="M 70 64 A 70 70 0 0 1 150 64" fill="none" stroke={GREEN} strokeWidth="12" />
      <path d="M 124 52 A 70 70 0 0 1 180 110" fill="none" stroke={BLUE} strokeWidth="12" strokeLinecap="round" />
      <g className={s.needle}>
        <line x1="110" y1="110" x2="110" y2="58" stroke={TEXT} strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx="110" cy="110" r="6" fill={TEXT} />
      <text x="44" y="128" textAnchor="middle" fontSize="11" fill={SUB} fontWeight="700">acid</text>
      <text x="176" y="128" textAnchor="middle" fontSize="11" fill={SUB} fontWeight="700">base</text>
    </Frame>
  );
}

const GRAPHICS = {
  flask: Flask,
  matter: Matter,
  blocks: Blocks,
  grid: Grid,
  jars: Jars,
  badge: Badge,
  insideAtom: InsideAtom,
  shells: Shells,
  lattice: Lattice,
  water: Water,
  diagrams: Diagrams,
  backpack: Backpack,
  transfer: Transfer,
  cards: Cards,
  share: Share,
  sea: Sea,
  recipe: Recipe,
  label: Label,
  plates: Plates,
  affixes: Affixes,
  seesaw: Seesaw,
  patterns: Patterns,
  carton: Carton,
  scale: Scale,
  states: States,
  dissolve: Dissolve,
  dial: Dial,
};

/**
 * Renders a text explainer's optional animated analogy graphic. The concept
 * title and copy live in the SlideShell; this centers a fluidly-animated SVG
 * (and optional caption) beneath it. All motion is reduced-motion gated.
 */
export default function ExplainerGraphic({ slide, onReady }) {
  const cfg = slide?.interactionConfig || {};
  const Graphic = GRAPHICS[cfg.graphic];

  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={v.stage} style={{ width: '100%' }}>
      {Graphic && <Graphic />}
      {cfg.caption && <p className={`${v.muted} ${s.caption}`}>{cfg.caption}</p>}
    </div>
  );
}
