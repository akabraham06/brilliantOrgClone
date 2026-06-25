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
  // Three evenly spaced columns (centers) across the 220-wide frame, each in
  // its own gutter so the diagrams never crowd one another.
  const cols = [40, 110, 180];
  // Lewis dots arranged symmetrically around the central "O", radius ~21.
  const lewis = [
    [-9, -19], [9, -19], [21, 4], [9, 21], [-9, 21], [-21, 4],
  ];
  return (
    <Frame label="Three common ways to draw atoms: shell model, Lewis dots, and line structures">
      {/* faint dividers between the three panels */}
      <line x1="75" y1="24" x2="75" y2="112" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 5" />
      <line x1="145" y1="24" x2="145" y2="112" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 5" />

      {/* panel 1: shell model */}
      <circle cx={cols[0]} cy="60" r="23" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {Ball({ cx: cols[0], cy: 60, r: 10, color: ORANGE })}
      {Ball({ cx: cols[0], cy: 37, r: 4.5, color: BLUE })}
      {Ball({ cx: cols[0] + 23, cy: 60, r: 4.5, color: BLUE })}
      <text x={cols[0]} y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={SUB}>shell model</text>

      {/* panel 2: Lewis dots */}
      <text x={cols[1]} y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill={TEXT}>O</text>
      {lewis.map(([dx, dy], i) => (
        <circle key={i} cx={cols[1] + dx} cy={58 + dy} r="3" fill={YELLOW} />
      ))}
      <text x={cols[1]} y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={SUB}>Lewis dots</text>

      {/* panel 3: line / structural */}
      {Ball({ cx: cols[2] - 17, cy: 60, r: 9, color: GREEN })}
      {Ball({ cx: cols[2] + 17, cy: 60, r: 9, color: BLUE })}
      <line x1={cols[2] - 8} y1="60" x2={cols[2] + 8} y2="60" stroke="var(--color-text)" strokeWidth="2.5" />
      <text x={cols[2]} y="108" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={SUB}>line structure</text>
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
  const ions = [[58, 58], [110, 58], [162, 58], [58, 100], [110, 100], [162, 100]];
  const es = [[84, 68], [134, 62], [150, 96], [88, 104], [120, 84], [100, 74]];
  return (
    <Frame label="Fixed positive metal ions sit in a flowing sea of shared electrons">
      <rect x="34" y="34" width="152" height="90" rx="16" fill="rgba(96,165,250,0.10)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {ions.map(([x, y], i) => <g key={`i${i}`}>{Ball({ cx: x, cy: y, r: 14, color: ORANGE, label: '+', labelSize: 14 })}</g>)}
      {es.map(([x, y], i) => (
        <circle key={i} className={s.drift} cx={x} cy={y} r="5" fill={BLUE} style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      <text x="110" y="142" textAnchor="middle" fontSize="9.5" fill={SUB} fontWeight="700">mobile electrons flow around fixed + ions</text>
    </Frame>
  );
}

/* 10. Recipe card with ingredient counts */
function Recipe() {
  return (
    <Frame label="A formula is a recipe listing how many of each atom">
      <rect x="46" y="28" width="128" height="96" rx="10" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" />
      <text x="110" y="48" textAnchor="middle" fontSize="13" fontWeight="800" fill={TEXT}>Recipe: H&#8322;O</text>
      <g className={s.appearOnce} style={{ animationDelay: '0.1s' }}>
        {Ball({ cx: 70, cy: 74, r: 8, color: '#e9edf7' })}
        {Ball({ cx: 90, cy: 74, r: 8, color: '#e9edf7' })}
        <text x="120" y="79" fontSize="12" fill={SUB} fontWeight="700">2 H</text>
      </g>
      <g className={s.appearOnce} style={{ animationDelay: '0.5s' }}>
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
        <g key={p} className={s.appearOnce} style={{ animationDelay: `${i * 0.12}s` }}>
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
  const rows = [
    { y: 30, name: 'synthesis', eq: 'A + B \u2192 AB', c: BLUE },
    { y: 54, name: 'decomposition', eq: 'AB \u2192 A + B', c: PINK },
    { y: 78, name: 'single replace', eq: 'A + BC \u2192 AC + B', c: GREEN },
    { y: 102, name: 'double replace', eq: 'AB + CD \u2192 AD + CB', c: PURPLE },
    { y: 126, name: 'combustion', eq: 'CH\u2084 + O\u2082 \u2192 CO\u2082 + H\u2082O', c: ORANGE },
  ];
  return (
    <Frame label="The five common reaction patterns: synthesis, decomposition, single and double replacement, and combustion">
      {rows.map((r, i) => (
        <g key={r.name} className={s.appearOnce} style={{ animationDelay: `${i * 0.12}s` }}>
          <circle cx="14" cy={r.y - 4} r="5" fill={r.c} />
          <text x="24" y={r.y} fontSize="9" fontWeight="800" fill={r.c}>{r.name}</text>
          <text x="104" y={r.y} fontSize="9.5" fontWeight="700" fill={TEXT}>{r.eq}</text>
        </g>
      ))}
    </Frame>
  );
}

/* L6. Conservation of mass: the same atoms appear before and after */
function Conservation() {
  const before = [
    { cx: 24, cy: 46, c: '#e9edf7' }, { cx: 44, cy: 46, c: '#e9edf7' },
    { cx: 24, cy: 70, c: '#e9edf7' }, { cx: 44, cy: 70, c: '#e9edf7' },
    { cx: 68, cy: 46, c: PINK }, { cx: 68, cy: 70, c: PINK },
  ];
  return (
    <Frame label="The same atoms appear before and after a reaction, so mass is conserved">
      {before.map((b, i) => <g key={i}>{Ball({ cx: b.cx, cy: b.cy, r: 8, color: b.c })}</g>)}
      <text x="46" y="104" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>before: 4 H + 2 O</text>
      <text x="110" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill={GREEN}>=</text>
      {/* after: two water molecules from the same atoms */}
      <g>
        <line x1="150" y1="48" x2="138" y2="62" stroke="var(--color-text)" strokeWidth="2" />
        <line x1="150" y1="48" x2="162" y2="62" stroke="var(--color-text)" strokeWidth="2" />
        {Ball({ cx: 150, cy: 48, r: 8, color: PINK })}
        {Ball({ cx: 138, cy: 62, r: 6, color: '#e9edf7' })}
        {Ball({ cx: 162, cy: 62, r: 6, color: '#e9edf7' })}
      </g>
      <g>
        <line x1="186" y1="70" x2="174" y2="84" stroke="var(--color-text)" strokeWidth="2" />
        <line x1="186" y1="70" x2="198" y2="84" stroke="var(--color-text)" strokeWidth="2" />
        {Ball({ cx: 186, cy: 70, r: 8, color: PINK })}
        {Ball({ cx: 174, cy: 84, r: 6, color: '#e9edf7' })}
        {Ball({ cx: 198, cy: 84, r: 6, color: '#e9edf7' })}
      </g>
      <text x="174" y="104" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>after: 2 H&#8322;O</text>
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
  // Kept well inside the gas room (x 150-212) so the bounded jitter never
  // pushes a particle past the container wall.
  const gas = [[170, 50], [190, 74], [168, 100]];
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
      {gas.map(([x, y], i) => <Person key={`g${i}`} x={x} y={y} color={ORANGE} cls={s.statesGas} delay={i * 0.3} />)}
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

/* 2a. Ruler - measuring an object's length with tick marks */
function Ruler() {
  const ticks = [];
  for (let i = 0; i <= 10; i += 1) ticks.push(i);
  return (
    <Frame label="A ruler measures length with evenly spaced tick marks">
      <rect x="22" y="66" width="176" height="32" rx="6" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="2" />
      {ticks.map((i) => {
        const x = 30 + i * 16;
        const major = i % 5 === 0;
        return (
          <g key={i}>
            <line x1={x} y1="66" x2={x} y2={major ? 84 : 77} stroke={SUB} strokeWidth={major ? 2 : 1.2} />
            {major && <text x={x} y="95" textAnchor="middle" fontSize="8" fill={SUB} fontWeight="700">{i}</text>}
          </g>
        );
      })}
      <rect x="30" y="46" width="96" height="14" rx="4" fill={BLUE} opacity="0.85" stroke="rgba(0,0,0,0.2)" />
      <g className={s.pulse}>
        <line x1="30" y1="40" x2="126" y2="40" stroke={GREEN} strokeWidth="2.5" />
        <line x1="30" y1="35" x2="30" y2="45" stroke={GREEN} strokeWidth="2.5" />
        <line x1="126" y1="35" x2="126" y2="45" stroke={GREEN} strokeWidth="2.5" />
        <text x="78" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={GREEN}>6.0 cm</text>
      </g>
    </Frame>
  );
}

/* 2b. Balance scale - weighing a sample for its mass */
function BalanceScale() {
  return (
    <Frame label="A balance weighs a sample to read its mass in grams">
      <rect x="106" y="58" width="8" height="62" rx="3" fill={SUB} />
      <path d="M 84 120 H 136 L 128 130 H 92 Z" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      <g className={s.beam}>
        <rect x="46" y="55" width="128" height="7" rx="3.5" fill={SUB} />
        <line x1="56" y1="60" x2="56" y2="80" stroke={SUB} strokeWidth="1.5" />
        <path d="M 40 80 H 72 L 64 94 H 48 Z" fill={BLUE} opacity="0.65" stroke="rgba(0,0,0,0.25)" />
        <line x1="164" y1="60" x2="164" y2="78" stroke={SUB} strokeWidth="1.5" />
        <path d="M 148 80 H 180 L 172 94 H 156 Z" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
        {Ball({ cx: 164, cy: 73, r: 8, color: GREEN })}
      </g>
      <text x="110" y="144" textAnchor="middle" fontSize="11" fontWeight="800" fill={GREEN}>reads mass in grams</text>
    </Frame>
  );
}

/* 2c. Powers of ten - a big number written compactly as 1 x 10^n */
function PowersOfTen() {
  const zeros = [0, 1, 2, 3, 4, 5];
  return (
    <Frame label="Scientific notation packs a big number into a power of ten">
      <text x="28" y="74" fontSize="28" fontWeight="800" fill={TEXT}>1</text>
      {zeros.map((i) => (
        <text
          key={i}
          className={s.appearOnce}
          style={{ animationDelay: `${i * 0.12}s`, transformOrigin: `${48 + i * 22}px 64px` }}
          x={48 + i * 22}
          y="74"
          fontSize="28"
          fontWeight="800"
          fill={BLUE}
        >
          0
        </text>
      ))}
      <text x="110" y="116" textAnchor="middle" fontSize="16" fontWeight="800" fill={GREEN}>= 1 &#215; 10&#8310;</text>
    </Frame>
  );
}

/* 6c. Energy hill - activation energy with heat released (exothermic) */
function EnergyHill() {
  return (
    <Frame label="A reaction climbs an activation-energy hill, then releases energy as heat">
      <line x1="30" y1="122" x2="30" y2="26" stroke={SUB} strokeWidth="1.5" />
      <line x1="30" y1="122" x2="202" y2="122" stroke={SUB} strokeWidth="1.5" />
      <text x="22" y="30" fontSize="9" fill={SUB} fontWeight="700">E</text>
      <path d="M 40 76 C 70 76 78 40 100 40 C 122 40 128 100 184 100" fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
      <text x="42" y="68" fontSize="9" fill={SUB} fontWeight="700">reactants</text>
      <text x="138" y="114" fontSize="9" fill={SUB} fontWeight="700">products</text>
      <g className={s.pulse}>
        <line x1="100" y1="42" x2="100" y2="76" stroke={GREEN} strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="100" y="36" textAnchor="middle" fontSize="10" fontWeight="800" fill={GREEN}>E&#8336;</text>
      </g>
      <g className={s.float}>
        <line x1="192" y1="64" x2="192" y2="92" stroke={BLUE} strokeWidth="2.5" />
        <path d="M 192 98 L 187 88 L 197 88 Z" fill={BLUE} />
      </g>
      <text x="182" y="58" textAnchor="middle" fontSize="9" fontWeight="700" fill={BLUE}>heat out</text>
    </Frame>
  );
}

/* L1 17. Periodic size trend - atoms grow larger going down a group */
function PeriodicTrend() {
  const atoms = [
    { cy: 28, r: 8 },
    { cy: 56, r: 12 },
    { cy: 88, r: 17 },
    { cy: 126, r: 23 },
  ];
  return (
    <Frame label="Going down a group, atoms get larger because each row adds an electron shell">
      <line x1="36" y1="20" x2="36" y2="130" stroke={SUB} strokeWidth="2.5" />
      <path d="M 36 140 l -6 -12 h 12 Z" fill={SUB} />
      <text x="20" y="78" fontSize="10" fontWeight="700" fill={SUB} transform="rotate(-90 20 78)" textAnchor="middle">down a group</text>
      {atoms.map((a, i) => (
        <g key={i} className={s.appearOnce} style={{ animationDelay: `${i * 0.18}s` }}>
          {Ball({ cx: 112, cy: a.cy, r: a.r, color: BLUE })}
        </g>
      ))}
      <text x="186" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill={SUB}>smaller</text>
      <text x="186" y="124" textAnchor="middle" fontSize="11" fontWeight="800" fill={PURPLE}>larger</text>
    </Frame>
  );
}

/* L2 11. Accuracy vs. precision - two dartboards of measurement "hits" */
function PrecisionTargets() {
  const rings = (cx) => [22, 15, 8].map((r, i) => (
    <circle key={i} cx={cx} cy={66} r={r} fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
  ));
  const accurate = [[64, 66], [67, 62], [61, 64], [65, 69]];
  const offset = [[152, 80], [155, 76], [149, 78], [153, 83]];
  return (
    <Frame label="Accuracy means hitting the true value; precision means the hits cluster tightly">
      {rings(64)}
      <circle cx="64" cy="66" r="2" fill={SUB} />
      {accurate.map(([x, y], i) => <circle key={i} className={s.popLate} style={{ animationDelay: `${i * 0.12}s` }} cx={x} cy={y} r="3.5" fill={GREEN} />)}
      <text x="64" y="108" textAnchor="middle" fontSize="10" fontWeight="800" fill={GREEN}>accurate</text>
      <text x="64" y="122" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>+ precise</text>
      {rings(152)}
      <circle cx="152" cy="66" r="2" fill={SUB} />
      {offset.map(([x, y], i) => <circle key={i} className={s.popLate} style={{ animationDelay: `${i * 0.12}s` }} cx={x} cy={y} r="3.5" fill={PINK} />)}
      <text x="152" y="108" textAnchor="middle" fontSize="10" fontWeight="800" fill={PINK}>precise</text>
      <text x="152" y="122" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>not accurate</text>
    </Frame>
  );
}

/* L3 13. Valence electrons set the stage for bonding */
function ValenceBridge() {
  const valence = [[58, 41], [92, 75], [58, 109], [24, 75]];
  return (
    <Frame label="Valence electrons in the outer shell are the ones that go on to form bonds">
      <circle cx="58" cy="75" r="34" fill="none" stroke="var(--color-border-strong)" strokeWidth="1.5" />
      {Ball({ cx: 58, cy: 75, r: 12, color: ORANGE, label: '+', labelSize: 12 })}
      {valence.map(([x, y], i) => (
        <g key={i} className={s.pulse}>{Ball({ cx: x, cy: y, r: 6, color: YELLOW })}</g>
      ))}
      <text x="58" y="142" textAnchor="middle" fontSize="9.5" fill={SUB} fontWeight="700">valence electrons</text>
      <line x1="104" y1="75" x2="132" y2="75" stroke={SUB} strokeWidth="2.5" />
      <path d="M 140 75 l -10 -5 v 10 Z" fill={SUB} />
      {Ball({ cx: 168, cy: 75, r: 13, color: BLUE })}
      {Ball({ cx: 200, cy: 75, r: 13, color: GREEN })}
      <g className={s.pulse}>{Ball({ cx: 184, cy: 75, r: 5, color: YELLOW })}</g>
      <text x="184" y="142" textAnchor="middle" fontSize="9.5" fill={SUB} fontWeight="700">form a bond</text>
    </Frame>
  );
}

/* L4 21. Molecule shapes preview - linear, bent, tetrahedral */
function MoleculeShapes() {
  return (
    <Frame label="Electron-pair repulsion gives molecules their shapes: linear, bent, and tetrahedral">
      {/* linear: O=C=O */}
      <line x1="22" y1="52" x2="58" y2="52" stroke="var(--color-text)" strokeWidth="2.5" />
      {Ball({ cx: 22, cy: 52, r: 8, color: PINK })}
      {Ball({ cx: 40, cy: 52, r: 9, color: SUB })}
      {Ball({ cx: 58, cy: 52, r: 8, color: PINK })}
      <text x="40" y="92" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>linear</text>

      {/* bent: water */}
      <line x1="110" y1="44" x2="92" y2="66" stroke="var(--color-text)" strokeWidth="2.5" />
      <line x1="110" y1="44" x2="128" y2="66" stroke="var(--color-text)" strokeWidth="2.5" />
      {Ball({ cx: 110, cy: 44, r: 9, color: PINK })}
      {Ball({ cx: 92, cy: 66, r: 7, color: BLUE })}
      {Ball({ cx: 128, cy: 66, r: 7, color: BLUE })}
      <text x="110" y="92" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>bent</text>

      {/* tetrahedral: methane */}
      <line x1="184" y1="52" x2="184" y2="30" stroke="var(--color-text)" strokeWidth="2.5" />
      <line x1="184" y1="52" x2="164" y2="64" stroke="var(--color-text)" strokeWidth="2.5" />
      <line x1="184" y1="52" x2="204" y2="64" stroke="var(--color-text)" strokeWidth="2.5" />
      <line x1="184" y1="52" x2="184" y2="74" stroke="var(--color-text)" strokeWidth="2.5" />
      {Ball({ cx: 184, cy: 52, r: 9, color: SUB })}
      {Ball({ cx: 184, cy: 30, r: 6, color: BLUE })}
      {Ball({ cx: 164, cy: 64, r: 6, color: BLUE })}
      {Ball({ cx: 204, cy: 64, r: 6, color: BLUE })}
      {Ball({ cx: 184, cy: 74, r: 6, color: BLUE })}
      <text x="184" y="92" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={SUB}>tetrahedral</text>
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
  ruler: Ruler,
  balanceScale: BalanceScale,
  powersOfTen: PowersOfTen,
  energyHill: EnergyHill,
  periodicTrend: PeriodicTrend,
  precisionTargets: PrecisionTargets,
  valenceBridge: ValenceBridge,
  moleculeShapes: MoleculeShapes,
  conservation: Conservation,
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
