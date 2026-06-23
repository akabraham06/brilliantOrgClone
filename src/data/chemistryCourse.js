/**
 * Data-driven content for the "Introduction to Chemistry" course.
 *
 * This single module is the source of truth for both:
 *  - the Firestore seed (scripts/seed.js writes courses/lessons/slides), and
 *  - a local fallback / reference for the client.
 *
 * Slide `type` is one of the PRD's slide types and `component` names the
 * interactive React component that renders it (built in Phase 5). Deep
 * interactionConfig is refined in Phase 6; here we capture structure, concise
 * copy, and check definitions for every slide.
 */

export const COURSE_ID = 'intro-to-chemistry';

export const SLIDE_TYPES = [
  'intro',
  'explainer',
  'classify',
  'dragSort',
  'clickableDiagram',
  'formulaBuilder',
  'steppers',
  'flashcards',
  'matching',
  'pHPlacement',
  'summary',
];

const courseMeta = {
  courseId: COURSE_ID,
  slug: 'intro-to-chemistry',
  title: 'Introduction to Chemistry',
  description:
    'A visual, interactive starter path. Build intuition for atoms, bonding, reactions, and everyday chemistry, one idea at a time.',
  audience: 'Beginner high school chemistry student (ages 14-16)',
  level: 'Beginner',
  estimatedMinutes: 95,
  coverIcon: 'beaker',
  isPublished: true,
};

/**
 * Lessons, each with its ordered slides. IDs, ordering, courseId, and the
 * slideOrder/lesson refs are derived below so authoring stays concise.
 */
const LESSON_DEFS = [
  {
    title: 'Matter, Atoms, and the Periodic Table',
    shortDescription:
      'See what chemistry studies and meet atoms, elements, and the periodic table.',
    estimatedMinutes: 14,
    icon: 'atom',
    learningObjectives: [
      'Describe what chemistry studies',
      'Tell matter apart from non-matter',
      'Recognize elements, compounds, and mixtures',
      'Name the parts of an atom and read a simple periodic table',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'ClickableScene',
        title: 'What is chemistry?',
        body: 'Chemistry is the study of matter and how it changes. Almost everything around you is matter.',
        instructions: 'Click each everyday object to see it is a form of matter.',
      },
      {
        type: 'classify',
        component: 'MatterSortBoard',
        title: 'Matter vs. non-matter',
        body: 'Matter is anything that has mass and takes up space. Light, sound, and heat are forms of energy, not matter.',
        instructions: 'Drag each item into the Matter or Not Matter bin.',
      },
      {
        type: 'clickableDiagram',
        component: 'ParticleModelViewer',
        title: 'Elements, compounds, and mixtures',
        body: 'Elements are one kind of atom, compounds are atoms bonded together, and mixtures are substances physically combined.',
        instructions: 'Toggle between oxygen, water, saltwater, and trail mix to see the particles change.',
      },
      {
        type: 'clickableDiagram',
        component: 'ZoomScaleViewer',
        title: 'Atoms are the building blocks',
        body: 'Zoom in on any object far enough and you reach molecules, then single atoms - the building blocks of all matter.',
        instructions: 'Drag the slider to zoom from an everyday object down to a single atom.',
      },
      {
        type: 'clickableDiagram',
        component: 'AtomDiagram',
        title: 'Parts of an atom',
        body: 'Atoms have protons (+) and neutrons in a tiny nucleus, with electrons (-) around them.',
        instructions: 'Click the proton, neutron, and electron to reveal their charge and location.',
      },
      {
        type: 'clickableDiagram',
        component: 'MiniPeriodicTable',
        title: 'Meet the periodic table',
        body: 'The periodic table organizes every element. Each box shows a symbol, name, and atomic number.',
        instructions: 'Hover over the highlighted elements to see their details.',
      },
      {
        type: 'clickableDiagram',
        component: 'MiniPeriodicTable',
        title: 'Groups and periods',
        body: 'Columns are groups (similar properties) and rows are periods. This organization is what makes the table powerful.',
        instructions: 'Highlight a column and a row to see how the table is organized.',
      },
      {
        type: 'classify',
        component: 'ClassifyCheck',
        title: 'Check: element, compound, or mixture?',
        body: 'Use what you learned to classify a few examples and find an element on the table.',
        instructions: 'Sort each example, then locate the element.',
        isCheck: true,
        check: {
          validationMode: 'classify',
          prompt: 'Classify each example.',
          items: [
            { id: 'oxygen', label: 'Oxygen (O2)', answer: 'element' },
            { id: 'water', label: 'Water (H2O)', answer: 'compound' },
            { id: 'saltwater', label: 'Saltwater', answer: 'mixture' },
            { id: 'iron', label: 'Iron (Fe)', answer: 'element' },
          ],
          categories: ['element', 'compound', 'mixture'],
          hint: 'One type of atom = element. Different atoms bonded = compound. Physically mixed = mixture.',
          feedbackCorrect: 'Nice - you can tell these apart now!',
          feedbackIncorrect: 'Close! Remember what bonds vs. just mixes.',
        },
      },
    ],
  },
  {
    title: 'Atomic Structure and Ions',
    shortDescription:
      'Discover what makes each element unique and how atoms become ions.',
    estimatedMinutes: 14,
    icon: 'shells',
    learningObjectives: [
      'Relate protons and neutrons to atomic and mass number',
      'Explain how protons define an element',
      'Describe isotopes and valence electrons',
      'Predict simple ion charges',
    ],
    slides: [
      {
        type: 'steppers',
        component: 'AtomDiagram',
        title: 'Atomic number vs. mass number',
        body: 'Atomic number = number of protons. Mass number = protons + neutrons.',
        instructions: 'Change the proton and neutron counts and watch the numbers update.',
      },
      {
        type: 'steppers',
        component: 'AtomDiagram',
        title: 'Identity of an element',
        body: 'The number of protons decides which element an atom is. Change protons and you change the element.',
        instructions: 'Adjust the proton count and watch the element name change.',
      },
      {
        type: 'clickableDiagram',
        component: 'AtomDiagram',
        title: 'Isotopes',
        body: 'Isotopes are atoms of the same element with different numbers of neutrons.',
        instructions: 'Toggle the neutron count to see different isotopes of the same element.',
      },
      {
        type: 'clickableDiagram',
        component: 'ElectronShellBuilder',
        title: 'Electrons and energy shells',
        body: 'Electrons live in shells around the nucleus. Inner shells fill first.',
        instructions: 'Click to place electrons into the shells for the first few elements.',
      },
      {
        type: 'clickableDiagram',
        component: 'ElectronShellBuilder',
        title: 'Valence electrons',
        body: 'Valence electrons are the electrons in the outer shell - they drive chemical behavior.',
        instructions: 'Select an atom and count how many valence electrons it has.',
      },
      {
        type: 'explainer',
        component: 'IonTransferCanvas',
        title: 'Why atoms form ions',
        body: 'Atoms gain or lose electrons to reach a stable, full outer shell. This gives them a charge.',
        instructions: 'Watch sodium lose one electron and chlorine gain one.',
      },
      {
        type: 'dragSort',
        component: 'IonTransferCanvas',
        title: 'Cations vs. anions',
        body: 'Losing electrons makes a positive cation; gaining electrons makes a negative anion.',
        instructions: 'Drag each atom to the "lose" or "gain" side and see the resulting charge.',
      },
      {
        type: 'matching',
        component: 'IonChargeCheck',
        title: 'Check: ion charges & isotopes',
        body: 'Predict charges and tell isotopes from different elements.',
        instructions: 'Pick the charge for each atom.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'na', prompt: 'Charge of a sodium (Na) ion?', options: ['+1', '-1', '+2'], answer: '+1' },
            { id: 'mg', prompt: 'Charge of a magnesium (Mg) ion?', options: ['+1', '+2', '-2'], answer: '+2' },
            { id: 'cl', prompt: 'Charge of a chlorine (Cl) ion?', options: ['+1', '-1', '-2'], answer: '-1' },
            { id: 'o', prompt: 'Charge of an oxygen (O) ion?', options: ['-1', '-2', '+2'], answer: '-2' },
          ],
          hint: 'Metals tend to lose electrons (+); nonmetals tend to gain (-).',
          feedbackCorrect: 'You predicted those charges perfectly.',
          feedbackIncorrect: 'Think about whether the atom gains or loses electrons.',
        },
      },
    ],
  },
  {
    title: 'Chemical Bonding',
    shortDescription:
      'Explore why atoms bond and how ionic, covalent, and metallic bonds differ.',
    estimatedMinutes: 14,
    icon: 'bond',
    learningObjectives: [
      'Explain why atoms bond',
      'Distinguish ionic, covalent, and metallic bonds',
      'Read simple Lewis dot structures',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'BondStabilityScene',
        title: 'Why atoms bond',
        body: 'Atoms bond to reach a stable, full outer shell - lower energy means more stability.',
        instructions: 'Compare an incomplete shell to a complete one.',
      },
      {
        type: 'clickableDiagram',
        component: 'IonTransferCanvas',
        title: 'Ionic bonding',
        body: 'In ionic bonds, a metal gives electrons to a nonmetal, and the opposite charges attract.',
        instructions: 'Drag the electron from sodium to chlorine to form NaCl.',
      },
      {
        type: 'clickableDiagram',
        component: 'CovalentShareCanvas',
        title: 'Covalent bonding',
        body: 'In covalent bonds, nonmetal atoms share electron pairs.',
        instructions: 'Drag shared electron pairs between atoms in H2, O2, or H2O.',
      },
      {
        type: 'clickableDiagram',
        component: 'MetallicBondScene',
        title: 'Metallic bonding',
        body: 'Metal ions sit in a "sea" of mobile electrons, which explains conductivity and malleability.',
        instructions: 'Toggle "push" to see the layers slide without breaking.',
      },
      {
        type: 'explainer',
        component: 'ParticleModelViewer',
        title: 'Molecules vs. ionic compounds',
        body: 'Molecules are discrete groups of bonded atoms; ionic compounds form repeating lattices.',
        instructions: 'Compare the two particle diagrams side by side.',
      },
      {
        type: 'clickableDiagram',
        component: 'LewisDotBuilder',
        title: 'Lewis dot basics',
        body: 'Lewis dots show an atom\u2019s valence electrons around its symbol.',
        instructions: 'Place the correct number of dots around the element symbol.',
      },
      {
        type: 'formulaBuilder',
        component: 'LewisDotBuilder',
        title: 'Simple Lewis structures',
        body: 'Shared pairs connect atoms in a molecule.',
        instructions: 'Assemble a simple Lewis structure for H2O, CO2, or NH3.',
      },
      {
        type: 'classify',
        component: 'BondTypeClassifier',
        title: 'Check: classify the bond',
        body: 'Identify bond types and tell molecules from ionic compounds.',
        instructions: 'Classify each example by bond type.',
        isCheck: true,
        check: {
          validationMode: 'classify',
          prompt: 'What type of bond is in each?',
          items: [
            { id: 'nacl', label: 'NaCl', answer: 'ionic' },
            { id: 'h2o', label: 'H2O', answer: 'covalent' },
            { id: 'cu', label: 'Copper metal', answer: 'metallic' },
            { id: 'mgo', label: 'MgO', answer: 'ionic' },
          ],
          categories: ['ionic', 'covalent', 'metallic'],
          hint: 'Metal + nonmetal = ionic. Two nonmetals = covalent. All-metal = metallic.',
          feedbackCorrect: 'You classified every bond correctly!',
          feedbackIncorrect: 'Check whether each element is a metal or nonmetal.',
        },
      },
    ],
  },
  {
    title: 'Chemical Formulas and Naming Compounds',
    shortDescription: 'Learn to read formulas and decode basic chemical names.',
    estimatedMinutes: 14,
    icon: 'formula',
    learningObjectives: [
      'Interpret subscripts and coefficients',
      'Build neutral ionic formulas from charges',
      'Name ionic and simple covalent compounds',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'FormulaBreakdown',
        title: 'What formulas mean',
        body: 'A formula lists which atoms and how many are in a substance, using symbols and subscripts.',
        instructions: 'Explore H2O, CO2, and NaCl with color-coded atoms.',
      },
      {
        type: 'steppers',
        component: 'FormulaBreakdown',
        title: 'Subscripts vs. coefficients',
        body: 'A subscript counts atoms in one molecule; a coefficient counts whole molecules.',
        instructions: 'Toggle between H2O and 2H2O and watch the atom counts.',
      },
      {
        type: 'formulaBuilder',
        component: 'IonicFormulaBuilder',
        title: 'Reading ionic formulas',
        body: 'Ionic compounds are neutral overall, so charges must balance.',
        instructions: 'Combine Mg2+ and Cl- until the charges balance into MgCl2.',
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Naming ionic compounds',
        body: 'Name = metal name + nonmetal root + "-ide" (e.g., sodium chloride).',
        instructions: 'Assemble the correct name from the blocks.',
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Naming covalent compounds',
        body: 'Covalent names use prefixes: mono-, di-, tri-, tetra-.',
        instructions: 'Match formulas like CO, CO2, and N2O4 to their names.',
      },
      {
        type: 'flashcards',
        component: 'PolyatomicFlashcards',
        title: 'Polyatomic ions',
        body: 'A few essential polyatomic ions: ammonium, hydroxide, nitrate, sulfate, carbonate.',
        instructions: 'Flip each tile to learn its name and formula.',
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Naming compounds with polyatomic ions',
        body: 'Treat the polyatomic ion as one unit when naming.',
        instructions: 'Match NaNO3 and CaCO3 to their names.',
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Check: formula \u2194 name',
        body: 'Match formulas to names and names to formulas.',
        instructions: 'Pair each formula with its correct name.',
        isCheck: true,
        check: {
          validationMode: 'matching',
          pairs: [
            { left: 'NaCl', right: 'sodium chloride' },
            { left: 'CO2', right: 'carbon dioxide' },
            { left: 'MgCl2', right: 'magnesium chloride' },
            { left: 'CaCO3', right: 'calcium carbonate' },
          ],
          hint: 'Metal first, then nonmetal; covalent uses prefixes.',
          feedbackCorrect: 'You can read chemistry like a language now!',
          feedbackIncorrect: 'Re-check the metal/nonmetal order and prefixes.',
        },
      },
    ],
  },
  {
    title: 'Chemical Reactions and Balancing Equations',
    shortDescription:
      'Watch reactions rearrange atoms and balance simple equations.',
    estimatedMinutes: 14,
    icon: 'reaction',
    learningObjectives: [
      'Identify reactants and products',
      'Explain conservation of mass',
      'Balance simple equations with coefficients',
      'Recognize common reaction types',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'ReactionLayout',
        title: 'Reactants and products',
        body: 'Reactants (left) turn into products (right), separated by an arrow.',
        instructions: 'Click each label to highlight that side of the reaction.',
      },
      {
        type: 'explainer',
        component: 'ConservationAnimator',
        title: 'Conservation of mass',
        body: 'Atoms are never created or destroyed in a reaction - only rearranged.',
        instructions: 'Compare atoms before and after the reaction.',
      },
      {
        type: 'explainer',
        component: 'EquationBalancer',
        title: 'What balancing means',
        body: 'A balanced equation has the same number of each atom on both sides.',
        instructions: 'Compare atom counts for the unbalanced H2 + O2 -> H2O.',
      },
      {
        type: 'steppers',
        component: 'EquationBalancer',
        title: 'Using coefficients',
        body: 'Coefficients multiply whole molecules to balance atom counts.',
        instructions: 'Use the +/- steppers and watch atom counts update live.',
      },
      {
        type: 'steppers',
        component: 'EquationBalancer',
        title: 'Balancing a simple equation',
        body: 'Adjust coefficients until both sides match.',
        instructions: 'Balance 2H2 + O2 -> 2H2O with the steppers.',
      },
      {
        type: 'flashcards',
        component: 'ReactionTypeCards',
        title: 'Common reaction types',
        body: 'Synthesis, decomposition, single replacement, double replacement, and combustion.',
        instructions: 'Browse each card to see its pattern and an example.',
      },
      {
        type: 'classify',
        component: 'ReactionTypeClassifier',
        title: 'Recognize the reaction type',
        body: 'Each reaction type follows a recognizable pattern.',
        instructions: 'Sort the example equations into the right type.',
      },
      {
        type: 'steppers',
        component: 'EquationBalancer',
        title: 'Check: balance & classify',
        body: 'Balance a couple of simple equations and classify one reaction.',
        instructions: 'Set the coefficients to balance the equation.',
        isCheck: true,
        check: {
          validationMode: 'balance',
          equation: 'H2 + O2 -> H2O',
          answer: { H2: 2, O2: 1, H2O: 2 },
          hint: 'Balance oxygen first, then hydrogen.',
          feedbackCorrect: 'Balanced! Matter is conserved.',
          feedbackIncorrect: 'Count each atom on both sides and adjust.',
        },
      },
    ],
  },
  {
    title: 'The Mole, Molar Mass, and Stoichiometry',
    shortDescription:
      'Build intuition for counting particles without heavy arithmetic.',
    estimatedMinutes: 13,
    icon: 'mole',
    learningObjectives: [
      'Explain why chemists use the mole',
      'Find molar mass from a formula',
      'Convert grams, moles, and particles',
      'Use coefficients as mole ratios',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'CountingUnitScene',
        title: 'Why chemists need a counting unit',
        body: 'Just like a "dozen" means 12, chemists need a unit to count tiny particles.',
        instructions: 'Compare counting eggs by the dozen to counting particles.',
      },
      {
        type: 'explainer',
        component: 'MoleConceptScene',
        title: 'What is a mole?',
        body: 'A mole is a counting unit: 6.022 x 10^23 particles. Think "a chemist\u2019s dozen."',
        instructions: 'Explore the analogy visually.',
      },
      {
        type: 'clickableDiagram',
        component: 'MolarMassLookup',
        title: 'Molar mass',
        body: 'Molar mass is the mass of one mole, found by summing atomic masses.',
        instructions: 'Select H2O or CO2 to auto-sum its molar mass.',
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Convert grams to moles',
        body: 'moles = grams / molar mass.',
        instructions: 'Drag the mass slider and watch the moles update.',
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Convert moles to particles',
        body: 'Multiply moles by 6.022 x 10^23 to get particles.',
        instructions: 'Toggle between moles and particles on the scale.',
      },
      {
        type: 'clickableDiagram',
        component: 'MoleRatioScene',
        title: 'Use coefficients as mole ratios',
        body: 'Balanced coefficients tell you the mole ratio of a reaction.',
        instructions: 'See how 2 mol H2 react with 1 mol O2 to make 2 mol H2O.',
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Simple stoichiometry',
        body: 'Use a mole ratio to find how much product forms.',
        instructions: 'Follow the clickable steps to find moles of H2O.',
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Check: grams \u2194 moles & ratios',
        body: 'Answer one grams-to-moles question and one mole-ratio question.',
        instructions: 'Choose the correct values.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'g2m', prompt: 'How many moles is 36 g of water (molar mass 18 g/mol)?', options: ['1', '2', '0.5'], answer: '2' },
            { id: 'ratio', prompt: 'From 2H2 + O2 -> 2H2O, how many moles H2O from 2 mol H2?', options: ['1', '2', '4'], answer: '2' },
          ],
          hint: 'Divide grams by molar mass; use coefficients as the ratio.',
          feedbackCorrect: 'Great quantitative reasoning!',
          feedbackIncorrect: 'Use moles = grams / molar mass and the balanced ratio.',
        },
      },
    ],
  },
  {
    title: 'States of Matter, Solutions, and Acids/Bases',
    shortDescription:
      'Connect chemistry to everyday substances, solutions, and the pH scale.',
    estimatedMinutes: 12,
    icon: 'beaker',
    learningObjectives: [
      'Compare solids, liquids, and gases',
      'Describe phase changes and density',
      'Explain solutions and concentration',
      'Place substances on the pH scale',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'StateParticlesAnimator',
        title: 'States of matter',
        body: 'Particles are packed tight in solids, looser in liquids, and far apart in gases.',
        instructions: 'Toggle solid, liquid, and gas to see particle spacing and motion.',
      },
      {
        type: 'steppers',
        component: 'StateParticlesAnimator',
        title: 'Phase changes',
        body: 'Adding or removing heat drives melting, freezing, evaporation, condensation, and sublimation.',
        instructions: 'Slide the temperature to trigger phase changes.',
      },
      {
        type: 'clickableDiagram',
        component: 'DensityCompare',
        title: 'Density basics',
        body: 'Density is how much matter is packed into a space.',
        instructions: 'Compare two equal volumes and predict which is denser.',
      },
      {
        type: 'clickableDiagram',
        component: 'SolutionConcentrationMixer',
        title: 'What is a solution?',
        body: 'A solution forms when a solute dissolves in a solvent, like salt in water.',
        instructions: 'Watch salt dissolve into water.',
      },
      {
        type: 'steppers',
        component: 'SolutionConcentrationMixer',
        title: 'Concentration',
        body: 'More solute in the same volume means a more concentrated solution.',
        instructions: 'Adjust the amount of solute to see dilute vs. concentrated.',
      },
      {
        type: 'pHPlacement',
        component: 'PHScalePlacement',
        title: 'Acids and bases',
        body: 'The pH scale runs 0 (acidic) to 14 (basic), with 7 neutral.',
        instructions: 'Click each household item to place it on the pH scale.',
      },
      {
        type: 'classify',
        component: 'AcidBaseClassifier',
        title: 'Properties of acids and bases',
        body: 'Acids taste sour; bases feel slippery. (Never taste or touch lab chemicals!)',
        instructions: 'Drag each example into the acid or base category.',
      },
      {
        type: 'explainer',
        component: 'WaterRoleScene',
        title: 'Water\u2019s role',
        body: 'Water dissolves many substances and is central to chemistry and life.',
        instructions: 'A quick note on why water matters everywhere.',
      },
      {
        type: 'pHPlacement',
        component: 'PHScalePlacement',
        title: 'Check: states, solutions & pH',
        body: 'Identify states, compare concentration, and place items on the pH scale.',
        instructions: 'Place each item near acidic, neutral, or basic.',
        isCheck: true,
        check: {
          validationMode: 'pHPlacement',
          items: [
            { id: 'lemon', label: 'Lemon juice', answer: 'acidic' },
            { id: 'water', label: 'Pure water', answer: 'neutral' },
            { id: 'soap', label: 'Soap', answer: 'basic' },
          ],
          ranges: ['acidic', 'neutral', 'basic'],
          hint: 'Below 7 is acidic, 7 is neutral, above 7 is basic.',
          feedbackCorrect: 'You connected chemistry to everyday life!',
          feedbackIncorrect: 'Recall where 7 sits on the scale.',
        },
      },
    ],
  },
];

function buildContent() {
  const lessons = [];
  const slides = [];

  LESSON_DEFS.forEach((def, lessonIdx) => {
    const orderIndex = lessonIdx + 1;
    const lessonId = `lesson-${orderIndex}`;
    const slideOrder = [];
    let checkCount = 0;

    def.slides.forEach((slide, slideIdx) => {
      const slideOrderIndex = slideIdx + 1;
      const slideId = `${lessonId}-s${slideOrderIndex}`;
      slideOrder.push(slideId);
      if (slide.isCheck) checkCount += 1;

      slides.push({
        slideId,
        courseId: COURSE_ID,
        lessonId,
        orderIndex: slideOrderIndex,
        type: slide.type,
        title: def.title,
        subtitle: slide.title,
        bodyText: slide.body,
        instructions: slide.instructions || '',
        interactionComponentKey: slide.component || null,
        interactionConfig: slide.interactionConfig || {},
        isCheck: Boolean(slide.isCheck),
        checkConfig: slide.check || null,
        learningGoal: slide.title,
      });
    });

    lessons.push({
      lessonId,
      courseId: COURSE_ID,
      orderIndex,
      title: def.title,
      shortDescription: def.shortDescription,
      estimatedMinutes: def.estimatedMinutes,
      icon: def.icon,
      isPublished: true,
      slideOrder,
      slideCount: slideOrder.length,
      learningObjectives: def.learningObjectives,
      completionCriteria: {
        requiredSlideCount: slideOrder.length,
        requiredCheckCount: checkCount,
      },
    });
  });

  const course = {
    ...courseMeta,
    lessonOrder: lessons.map((l) => l.lessonId),
  };

  return { course, lessons, slides };
}

const content = buildContent();

export const course = content.course;
export const lessons = content.lessons;
export const slides = content.slides;

export function getSlidesForLesson(lessonId) {
  return slides
    .filter((s) => s.lessonId === lessonId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}
