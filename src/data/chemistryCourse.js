/**
 * Data-driven content for the "Introduction to Chemistry" course.
 *
 * This single module is the source of truth for both:
 *  - the Firestore seed (scripts/seed.js writes courses/lessons/slides), and
 *  - a local fallback / reference for the client.
 *
 * Slide `type` is one of the PRD's slide types and `component` names the
 * interactive React component that renders it. Each lesson interleaves
 * explainer slides, "predict before reveal" cards, misconception checks, and
 * graded comprehension checks, and ends with a recap for the completion screen.
 */

export const COURSE_ID = 'intro-to-chemistry';

export const SLIDE_TYPES = [
  'intro',
  'explainer',
  'predict',
  'classify',
  'dragSort',
  'clickableDiagram',
  'formulaBuilder',
  'nameBuilder',
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
  estimatedMinutes: 130,
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
    estimatedMinutes: 20,
    icon: 'atom',
    learningObjectives: [
      'Describe what chemistry studies',
      'Tell matter apart from non-matter',
      'Recognize elements, compounds, and mixtures',
      'Name the parts of an atom and read a simple periodic table',
    ],
    recap: [
      'Chemistry is the study of matter and how it changes',
      'Matter has mass and takes up space; light, sound, and heat do not',
      'Elements are one kind of atom, compounds are atoms bonded together, mixtures are physically combined',
      'Atoms have a nucleus of protons and neutrons surrounded by electrons',
      'The periodic table organizes elements into groups (columns) and periods (rows)',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'ClickableScene',
        title: 'What is chemistry?',
        body: 'Chemistry is the study of matter and how it changes. Matter is anything that has mass and takes up space - the screen you are reading, the air you breathe, and the water you drink are all matter. When you cook food, charge a battery, or watch metal rust, you are watching chemistry: atoms rearranging into brand-new substances.',
        instructions: 'Click each everyday object to confirm it is a form of matter.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: is light matter?',
        body: 'Before we define matter, make a prediction. Active guessing helps the idea stick.',
        instructions: 'Choose your prediction, then reveal the answer.',
        interactionConfig: {
          prompt: 'A flashlight beam shines across a room. Is the light itself matter?',
          options: [
            { id: 'a', label: 'Yes - you can see it, so it must be matter', correct: false },
            { id: 'b', label: 'No - light is a form of energy, not matter', correct: true },
            { id: 'c', label: 'Only in the dark', correct: false },
          ],
          reveal:
            'Light is energy, not matter. Matter must have mass and take up space. Light (and sound and heat) carry energy but have no mass, so they are not matter.',
        },
      },
      {
        type: 'classify',
        component: 'MatterSortBoard',
        title: 'Matter vs. non-matter',
        body: 'Matter is anything that has mass and takes up space. That includes solids, liquids, and gases - even invisible ones like air and steam. Light, sound, and heat are forms of energy, so they are not matter even though they are very real.',
        instructions: 'Drag each item into the Matter or Not Matter bin, then check your answer.',
        isCheck: true,
        check: {
          validationMode: 'classify',
          prompt: 'Sort each into Matter or Not matter.',
          items: [
            { id: 'water', label: 'Water', answer: 'Matter' },
            { id: 'rock', label: 'Rock', answer: 'Matter' },
            { id: 'air', label: 'Air', answer: 'Matter' },
            { id: 'light', label: 'Light', answer: 'Not matter' },
            { id: 'sound', label: 'Sound', answer: 'Not matter' },
            { id: 'heat', label: 'Heat', answer: 'Not matter' },
          ],
          categories: ['Matter', 'Not matter'],
          hint: 'If it has mass and takes up space, it is matter. Light, sound, and heat are energy.',
          feedbackCorrect: 'Exactly - matter has mass and takes up space; energy does not.',
          feedbackIncorrect: 'Not quite - remember light, sound, and heat are energy, not matter.',
        },
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: spot the matter',
        body: 'Quick comprehension check before we zoom in.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'air', prompt: 'Is air matter?', options: ['Yes', 'No'], answer: 'Yes' },
            { id: 'sound', prompt: 'Is sound matter?', options: ['Yes', 'No'], answer: 'No' },
            { id: 'steam', prompt: 'Is steam matter?', options: ['Yes', 'No'], answer: 'Yes' },
          ],
          hint: 'If it has mass and takes up space, it is matter.',
          feedbackCorrect: 'Exactly - mass and volume are the test for matter.',
          feedbackIncorrect: 'Remember: energy (light, sound, heat) is not matter.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'ParticleModelViewer',
        title: 'Elements, compounds, and mixtures',
        body: 'All matter can be sorted by how its particles are arranged. An element is made of just one kind of atom. A compound is two or more kinds of atoms chemically bonded in a fixed ratio. A mixture is substances physically combined but not bonded, so they can be separated again.',
        instructions: 'Toggle between oxygen, water, saltwater, and trail mix to see the particles change.',
      },
      {
        type: 'explainer',
        component: 'PureVsMixtureViewer',
        title: 'Pure substances vs. mixtures',
        body: 'Elements and compounds are "pure substances" - every particle is identical, like distilled water (all H2O). Mixtures contain more than one substance, like saltwater or air. A key clue: a compound has a fixed recipe and new properties, while a mixture keeps the properties of its parts and can vary in amount.',
        instructions: 'Tap the beaker to switch between a pure substance and a mixture.',
      },
      {
        type: 'explainer',
        component: 'ChangeExplainer',
        title: 'How matter changes: physical vs. chemical',
        body: 'Matter changes in two fundamentally different ways. In a physical change (like melting or dissolving), the molecules stay the same and only their arrangement shifts - it is usually easy to reverse. In a chemical change (like burning or rusting), bonds break and reform into brand-new substances that are hard to turn back. Chemistry focuses on these chemical changes.',
        instructions: 'Toggle between physical and chemical change and watch the molecules respond.',
      },
      {
        type: 'classify',
        component: 'ClassifyCheck',
        title: 'Check: element, compound, or mixture?',
        body: 'Use what you learned to classify a few examples.',
        instructions: 'Sort each example into the right category.',
        isCheck: true,
        check: {
          validationMode: 'classify',
          prompt: 'Classify each example.',
          items: [
            { id: 'oxygen', label: 'Oxygen (O2)', answer: 'element' },
            { id: 'water', label: 'Water (H2O)', answer: 'compound' },
            { id: 'saltwater', label: 'Saltwater', answer: 'mixture' },
            { id: 'iron', label: 'Iron (Fe)', answer: 'element' },
            { id: 'air', label: 'Air', answer: 'mixture' },
            { id: 'co2', label: 'Carbon dioxide (CO2)', answer: 'compound' },
          ],
          categories: ['element', 'compound', 'mixture'],
          hint: 'One type of atom = element. Different atoms bonded = compound. Physically mixed = mixture.',
          feedbackCorrect: 'Nice - you can tell these apart now!',
          feedbackIncorrect: 'Close! Remember what bonds vs. just mixes.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'ZoomScaleViewer',
        title: 'Atoms are the building blocks',
        body: 'Zoom in on any object far enough and you reach molecules, then single atoms - the building blocks of all matter. Atoms are astonishingly small: a single drop of water holds more atoms than there are stars in the observable universe.',
        instructions: 'Drag the slider to zoom from an everyday object down to a single atom.',
      },
      {
        type: 'clickableDiagram',
        component: 'AtomDiagram',
        title: 'Parts of an atom',
        body: 'Atoms have a tiny, dense nucleus containing protons (charge +1) and neutrons (no charge), surrounded by fast-moving electrons (charge -1). The nucleus holds almost all the mass, while electrons take up almost all the space.',
        instructions: 'Click the proton, neutron, electron, and nucleus to reveal each part\u2019s role.',
      },
      {
        type: 'clickableDiagram',
        component: 'MultipleChoiceCheck',
        title: 'Check: parts of the atom',
        body: 'Make sure the three subatomic particles are clear.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'pos', prompt: 'Which particle is positively charged?', options: ['Proton', 'Neutron', 'Electron'], answer: 'Proton' },
            { id: 'nuc', prompt: 'Which particle is NOT found in the nucleus?', options: ['Proton', 'Neutron', 'Electron'], answer: 'Electron' },
            { id: 'mass', prompt: 'Where is almost all of an atom\u2019s mass?', options: ['In the electrons', 'In the nucleus', 'Spread evenly'], answer: 'In the nucleus' },
          ],
          hint: 'Protons (+) and neutrons sit in the nucleus; electrons (-) orbit it.',
          feedbackCorrect: 'You know your subatomic particles!',
          feedbackIncorrect: 'Recall: nucleus = protons + neutrons; electrons orbit outside.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'MiniPeriodicTable',
        title: 'The periodic table',
        body: '',
        instructions: 'Tap any element to explore it - press Next and the description advances to groups and periods.',
        interactionConfig: {
          descriptions: [
            'The periodic table organizes every known element. Each tile shows the symbol, full name, atomic number (the proton count), and atomic mass. Elements are colored as metals, nonmetals, or metalloids - a first clue to how they behave.',
            'Columns are called groups: elements in the same group share similar properties and the same number of valence electrons. Rows are called periods. An element\u2019s position even predicts how it reacts - which is what makes the table so powerful.',
          ],
        },
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: reading the table',
        body: 'Use the table to answer a few quick questions.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'an', prompt: 'What does the atomic number tell you?', options: ['Number of protons', 'Number of neutrons', 'The mass'], answer: 'Number of protons' },
            { id: 'metal', prompt: 'Sodium (Na) is a...', options: ['Metal', 'Nonmetal', 'Metalloid'], answer: 'Metal' },
            { id: 'group', prompt: 'Elements in the same column (group) have similar...', options: ['Mass', 'Properties', 'Color'], answer: 'Properties' },
          ],
          hint: 'Atomic number = protons. Most elements on the left are metals.',
          feedbackCorrect: 'You can read the periodic table now!',
          feedbackIncorrect: 'Revisit the table - tap elements to compare them.',
        },
      },
    ],
  },
  {
    title: 'Atomic Structure and Ions',
    shortDescription:
      'Discover what makes each element unique and how atoms become ions.',
    estimatedMinutes: 26,
    icon: 'shells',
    learningObjectives: [
      'Relate protons and neutrons to atomic and mass number',
      'Explain how protons define an element',
      'Describe isotopes and valence electrons',
      'Predict simple ion charges',
      'Recognize that unequal electron sharing makes a bond polar',
    ],
    recap: [
      'Atomic number = number of protons; mass number = protons + neutrons',
      'The number of protons decides which element an atom is',
      'Isotopes are the same element with different numbers of neutrons',
      'Valence (outer-shell) electrons drive chemical behavior',
      'Losing electrons makes a positive cation; gaining electrons makes a negative anion',
      'When atoms share electrons unequally the bond is polar - one end slightly +, the other slightly -',
    ],
    slides: [
      {
        type: 'steppers',
        component: 'AtomDiagram',
        title: 'Atomic number vs. mass number',
        body: 'The atomic number is the number of protons - it never changes for a given element. The mass number is protons plus neutrons. Electrons are so light they are not counted in the mass number.',
        instructions: 'Use the steppers, or drag the proton/neutron tokens onto the atom. Atomic number = protons; mass number = protons + neutrons.',
        interactionConfig: {
          protons: 1,
          neutrons: 0,
          electrons: 1,
          challenge: {
            prompt: 'Build lithium-7 - raise the protons to 3, then add neutrons until the mass number reads 7.',
            conditions: [
              { field: 'protons', value: 3 },
              { field: 'mass', value: 7 },
            ],
            success: 'That is lithium-7: 3 protons make it lithium, and 3 protons + 4 neutrons give mass number 7.',
          },
        },
      },
      {
        type: 'steppers',
        component: 'AtomDiagram',
        title: 'Protons define the element',
        body: 'Here is the big idea: the proton count alone decides which element you have. One proton is always hydrogen; six protons is always carbon. Your goal below: change the proton count until the element becomes carbon.',
        instructions: 'Add protons one at a time and watch the element name and symbol change. Stop when you reach carbon, then press Check.',
        interactionConfig: {
          protons: 1,
          neutrons: 0,
          electrons: 1,
          challenge: {
            prompt: 'Change the proton count until the element becomes carbon.',
            conditions: [{ field: 'symbol', value: 'C' }],
            success: '6 protons is always carbon. Add or remove even one proton and you would be looking at a different element entirely.',
          },
        },
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: what defines an element?',
        body: 'A quick check on identity vs. mass.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'id', prompt: 'Which count decides which element an atom is?', options: ['Protons', 'Neutrons', 'Electrons'], answer: 'Protons' },
            { id: 'mass', prompt: 'Mass number equals protons plus...', options: ['Electrons', 'Neutrons', 'Charge'], answer: 'Neutrons' },
          ],
          hint: 'Identity = protons. Mass number = protons + neutrons.',
          feedbackCorrect: 'Right - protons are the element\u2019s fingerprint.',
          feedbackIncorrect: 'Protons define identity; neutrons add to mass.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'AtomDiagram',
        title: 'Isotopes',
        body: 'Isotopes are atoms of the same element with different numbers of neutrons. Carbon-12 and carbon-14 are both carbon (6 protons), but carbon-14 has two extra neutrons. Your goal: turn this carbon-12 atom into carbon-14.',
        instructions: 'Keep the 6 protons fixed and add neutrons until you have built carbon-14, then press Check.',
        interactionConfig: {
          protons: 6,
          neutrons: 6,
          electrons: 6,
          challenge: {
            prompt: 'Keep carbon\u2019s 6 protons and add neutrons until you have made carbon-14.',
            conditions: [
              { field: 'protons', value: 6 },
              { field: 'mass', value: 14 },
            ],
            success: 'Carbon-14! Same 6 protons (still carbon), just 2 extra neutrons - a heavier isotope of the very same element.',
          },
        },
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Misconception check: do neutrons change the element?',
        body: 'A very common beginner mistake. Predict first.',
        instructions: 'Make your prediction, then reveal.',
        interactionConfig: {
          prompt: 'You add two neutrons to a carbon atom. Is it still carbon?',
          options: [
            { id: 'a', label: 'No - changing neutrons changes the element', correct: false },
            { id: 'b', label: 'Yes - it is a heavier isotope, but still carbon', correct: true },
          ],
          reveal:
            'It stays carbon. Only the proton count decides the element. Changing neutrons only changes the isotope (its mass), not the element\u2019s identity.',
        },
      },
      {
        type: 'explainer',
        component: 'ExplainerGraphic',
        title: 'What are energy shells?',
        body: 'Electrons do not pile up randomly - they fill distinct layers called energy shells. The shell closest to the nucleus is the lowest energy and fills first (up to 2 electrons), then the next layer fills (up to 8). Atoms fill from the inside out because the lowest-energy spots are the most stable - just like water settling into the lowest level of a container first.',
        interactionConfig: { graphic: 'shells', caption: 'Inner, low-energy shells fill before outer ones.' },
      },
      {
        type: 'clickableDiagram',
        component: 'ElectronShellBuilder',
        title: 'Electrons and energy shells',
        body: 'Now place the electrons yourself. The first shell holds up to 2 electrons, the next up to 8. Watch the shell map below: the inner shell fills completely before any electron goes into the next one.',
        instructions: 'Add electrons one at a time and watch the shell map show which shell is filling.',
      },
      {
        type: 'clickableDiagram',
        component: 'ElectronShellBuilder',
        title: 'Valence electrons',
        body: 'Valence electrons are the electrons in the outermost shell - the ones that drive bonding. Your goal here: build the atom, then identify how many valence electrons it has.',
        instructions: 'Build the chosen element, then answer how many electrons are in its outer (highlighted) shell and press Check.',
        interactionConfig: { element: 17, challenge: { type: 'valence' } },
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: gain or lose?',
        body: 'Sodium has 1 valence electron. Think about the easiest path to a full outer shell.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'To reach a stable outer shell, will sodium more likely lose 1 electron or gain 7?',
          options: [
            { id: 'a', label: 'Lose 1 electron', correct: true },
            { id: 'b', label: 'Gain 7 electrons', correct: false },
          ],
          reveal:
            'Sodium loses its single valence electron - far easier than gaining 7. Losing one electron leaves it with a full shell beneath and a +1 charge, forming Na+.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'IonFormationScene',
        title: 'Why atoms form ions',
        body: 'Atoms gain or lose electrons to reach a stable, full outer shell. When the number of electrons no longer matches the protons, the atom carries a net charge - it becomes an ion.',
        instructions: 'Add or remove electrons until the outer shell is full, and watch the net charge (the ion) appear.',
      },
      {
        type: 'explainer',
        component: 'ExplainerGraphic',
        title: 'Why ions stack into lattices',
        body: 'A single Na+ and Cl- attract each other - but that pull reaches out in every direction, so each ion grabs more oppositely charged neighbors. They keep stacking into a vast, repeating 3D grid called a crystal lattice. That orderly packing is exactly why table salt forms little cube-shaped crystals.',
        interactionConfig: { graphic: 'lattice', caption: 'Opposite charges attract in all directions, building a repeating grid.' },
      },
      {
        type: 'dragSort',
        component: 'IonTransferCanvas',
        title: 'Cations vs. anions',
        body: 'Losing electrons makes a positive ion called a cation (e.g., Na+). Gaining electrons makes a negative ion called an anion (e.g., Cl-). Metals tend to form cations; nonmetals tend to form anions - and together they stack into the lattice you just met.',
        instructions: 'Transfer the electron, then view the NaCl crystal to see the lattice form.',
      },
      {
        type: 'clickableDiagram',
        component: 'PolarBondViewer',
        title: 'Sharing is not always equal',
        body: 'Ions form when an electron is transferred completely. But atoms often share electrons instead - and the sharing is rarely perfectly even. The atom that pulls harder (the more electronegative one) hogs the shared electrons and turns slightly negative, while its partner turns slightly positive. This unequal sharing is called polarity.',
        instructions: 'Drag the slider to change how unequally the two atoms pull, from equal sharing to a full transfer.',
      },
      {
        type: 'explainer',
        component: 'ExplainerGraphic',
        title: 'Polar molecules, like water',
        body: 'Water is the most famous polar molecule. Oxygen pulls the shared electrons harder than the two hydrogens, so the oxygen end is slightly negative and the hydrogen ends are slightly positive. Those tiny + and - ends are why water sticks to itself and dissolves so many things - a preview of why polarity matters everywhere in chemistry.',
        interactionConfig: { graphic: 'water', caption: 'Oxygen end slightly negative; hydrogen ends slightly positive.' },
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: which end is slightly negative?',
        body: 'Use what you just learned about unequal sharing.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'In a water molecule, which atom pulls the shared electrons harder and ends up slightly negative?',
          options: [
            { id: 'a', label: 'Oxygen', correct: true },
            { id: 'b', label: 'Hydrogen', correct: false },
          ],
          reveal:
            'Oxygen. It is more electronegative than hydrogen, so it pulls the shared electrons closer and carries the slight negative (delta-) charge - leaving the two hydrogens slightly positive (delta+).',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'IonChargePredictor',
        title: 'Calculating an ion\u2019s charge',
        body: 'Here is a fast way to predict an ion\u2019s charge without memorizing tables: count an atom\u2019s outer (valence) electrons, then pick whichever is fewer - losing them or gaining a few to fill the shell. The mismatch that is left between protons and electrons is the charge.',
        instructions: 'Tap any element to walk through the three-step shortcut.',
      },
      {
        type: 'matching',
        component: 'MultipleChoiceCheck',
        title: 'Check: ion charges & isotopes',
        body: 'Predict charges and tell isotopes apart.',
        instructions: 'Pick the answer for each.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'na', prompt: 'Charge of a sodium (Na) ion?', options: ['+1', '-1', '+2'], answer: '+1' },
            { id: 'mg', prompt: 'Charge of a magnesium (Mg) ion?', options: ['+1', '+2', '-2'], answer: '+2' },
            { id: 'cl', prompt: 'Charge of a chlorine (Cl) ion?', options: ['+1', '-1', '-2'], answer: '-1' },
            { id: 'o', prompt: 'Charge of an oxygen (O) ion?', options: ['-1', '-2', '+2'], answer: '-2' },
            { id: 'iso', prompt: 'Two atoms have 6 protons but different neutrons. They are...', options: ['Different elements', 'Isotopes of carbon', 'Ions'], answer: 'Isotopes of carbon' },
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
    estimatedMinutes: 25,
    icon: 'bond',
    learningObjectives: [
      'Explain why atoms bond',
      'Distinguish ionic, covalent, and metallic bonds',
      'Read simple Lewis dot structures',
      'Predict molecular shapes with VSEPR',
    ],
    recap: [
      'Atoms bond to reach a stable, full outer shell (lower energy)',
      'Ionic bonds transfer electrons from a metal to a nonmetal',
      'Covalent bonds share electron pairs between nonmetals',
      'Metallic bonds share a "sea" of mobile electrons',
      'Lewis dots show an atom\u2019s valence electrons',
      'VSEPR: electron pairs repel, setting a molecule\u2019s 3D shape',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'BondStabilityScene',
        title: 'Why atoms bond',
        body: 'Atoms bond to reach a more stable, lower-energy arrangement - usually a full outer shell. An atom with an incomplete outer shell is reactive; by sharing or transferring electrons it can fill that shell and settle down. Nearly every chemical bond comes back to this drive for stability.',
        instructions: 'Compare an incomplete shell to a complete one.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: how do metals and nonmetals bond?',
        body: 'Metals have few valence electrons; nonmetals have many. Predict what happens when they meet.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'A metal (few valence electrons) meets a nonmetal (nearly full shell). What happens?',
          options: [
            { id: 'a', label: 'The metal transfers electrons to the nonmetal', correct: true },
            { id: 'b', label: 'They share electrons equally', correct: false },
            { id: 'c', label: 'Nothing - they cannot bond', correct: false },
          ],
          reveal:
            'The metal gives up its few valence electrons to the nonmetal. Both reach full shells, become oppositely charged ions, and attract - that is an ionic bond.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'IonicBondScene',
        title: 'Ionic bonding',
        body: 'In an ionic bond, a metal donates one or more electrons to a nonmetal. The resulting + and - ions attract strongly and stack into a repeating lattice, like the cubic crystal of table salt (NaCl).',
        instructions: 'Pick a metal and a nonmetal, then transfer electrons to see how many of each ion are needed for a neutral formula.',
      },
      {
        type: 'explainer',
        component: 'ExplainerGraphic',
        title: 'Ways to draw an atom',
        body: 'Chemists draw atoms in a few different ways depending on what they want to show. The shell model shows electrons orbiting in rings. A Lewis dot diagram shows just the outer (valence) electrons as dots around the symbol. A line (structural) diagram shows each shared pair as a single line between atoms. Knowing all three makes the next diagrams much easier to read.',
        interactionConfig: { graphic: 'diagrams', caption: 'Shell model, Lewis dots, and line structures all describe the same atoms.' },
      },
      {
        type: 'clickableDiagram',
        component: 'LewisDotBuilder',
        title: 'Lewis dot basics',
        body: 'A Lewis dot diagram places an atom\u2019s valence electrons as dots around its symbol. It is a quick visual bookkeeping tool that makes it easy to see how many electrons an atom needs to fill its outer shell.',
        instructions: 'Tap the symbol to add one dot per valence electron until you match the element.',
      },
      {
        type: 'clickableDiagram',
        component: 'LewisDotBuilder',
        title: 'Lewis dots: more practice',
        body: 'The pattern is the same for every main-group element: place one dot per valence electron, going around the symbol. Once you can read these dots, the shared pairs (lines) in the next slide will make sense.',
        instructions: 'Switch elements and place the right number of dots for each one.',
      },
      {
        type: 'clickableDiagram',
        component: 'CovalentShareCanvas',
        title: 'Covalent bonding',
        body: 'When two nonmetals bond, neither wants to give up electrons, so they share. A shared pair of electrons is a single covalent bond; two shared pairs make a double bond. Sharing lets both atoms count the shared electrons toward a full shell.',
        instructions: 'Tap between atoms to add shared pairs (shown as lines or Lewis dots) and build H2, H2O, and CO2.',
        interactionConfig: { molecule: 'H2O' },
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: sharing vs. transferring',
        body: 'Make sure ionic and covalent are clearly different in your mind.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'cov', prompt: 'A covalent bond involves atoms that...', options: ['Transfer electrons', 'Share electrons', 'Lose all electrons'], answer: 'Share electrons' },
            { id: 'co2', prompt: 'In carbon dioxide (O=C=O), each carbon-oxygen bond shares how many electron pairs?', options: ['1', '2', '3'], answer: '2' },
            { id: 'ion', prompt: 'An ionic bond forms between a...', options: ['Metal and nonmetal', 'Two nonmetals', 'Two metals'], answer: 'Metal and nonmetal' },
          ],
          hint: 'Share = covalent (nonmetals). Transfer = ionic (metal + nonmetal).',
          feedbackCorrect: 'You\u2019ve got the difference down.',
          feedbackIncorrect: 'Covalent shares; ionic transfers.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'VseprViewer',
        title: 'Molecules are 3D: VSEPR',
        body: 'A Lewis diagram is flat, but real molecules are three-dimensional. VSEPR (valence-shell electron-pair repulsion) gives the rule: electron pairs around the central atom push as far apart as possible. Two pairs go linear, three spread into a triangle, and four point to the corners of a tetrahedron. The shape you see is just the pairs avoiding each other.',
        instructions: 'Drag the model to rotate it in 3D, and switch between shapes to see how the bond angle changes.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: what do lone pairs do?',
        body: 'Methane (CH4) and water (H2O) both have four electron pairs around the central atom, but water has two lone pairs. Predict what those lone pairs do to the shape.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'Water has two lone pairs where methane has bonds. How does that change the angle?',
          options: [
            { id: 'a', label: 'Lone pairs push harder, so the H-O-H angle is smaller than 109.5\u00b0', correct: true },
            { id: 'b', label: 'Lone pairs do nothing - it stays 109.5\u00b0', correct: false },
            { id: 'c', label: 'The angle gets bigger than 109.5\u00b0', correct: false },
          ],
          reveal:
            'Lone pairs are held close to the central atom and take up more room than bonding pairs, so they squeeze the bonds together. That is why water is "bent" at about 104.5\u00b0 instead of the ideal 109.5\u00b0.',
        },
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: name that shape',
        body: 'Use the VSEPR rule: count the bonding atoms and lone pairs around the central atom.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'co2', prompt: 'CO2 has two bonded atoms and no lone pairs on carbon. Its shape is...', options: ['Bent', 'Linear', 'Tetrahedral'], answer: 'Linear' },
            { id: 'ch4', prompt: 'CH4 has four bonded atoms and no lone pairs. Its shape is...', options: ['Tetrahedral', 'Trigonal planar', 'Linear'], answer: 'Tetrahedral' },
            { id: 'nh3', prompt: 'NH3 has three bonded atoms and one lone pair. Its shape is...', options: ['Trigonal planar', 'Trigonal pyramidal', 'Bent'], answer: 'Trigonal pyramidal' },
            { id: 'why', prompt: 'According to VSEPR, electron pairs arrange themselves to...', options: ['Get as close as possible', 'Get as far apart as possible', 'Line up in a row'], answer: 'Get as far apart as possible' },
          ],
          hint: 'Count bonding atoms + lone pairs, then recall the shape for that arrangement.',
          feedbackCorrect: 'You can predict molecular shapes with VSEPR!',
          feedbackIncorrect: 'Count the bonds and lone pairs, then match the geometry.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'MetallicBondScene',
        title: 'Metallic bonding',
        body: 'In a metal, atoms release their valence electrons into a shared "sea" that flows around fixed positive ions. This mobile sea explains why metals conduct electricity and heat, and why they bend instead of shatter - the layers can slide without breaking bonds.',
        instructions: 'Apply a voltage to make the electron sea flow, or push the metal to slide a layer.',
      },
      {
        type: 'explainer',
        component: 'ParticleModelViewer',
        title: 'Molecules vs. ionic compounds',
        body: 'Covalent bonding makes discrete molecules - separate units like H2O. Ionic bonding makes giant repeating lattices, not molecules. That difference explains why molecular substances often have low melting points while ionic crystals are hard and high-melting.',
        instructions: 'Compare the two particle diagrams side by side.',
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
            { id: 'co2', label: 'CO2', answer: 'covalent' },
            { id: 'fe', label: 'Iron metal', answer: 'metallic' },
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
    estimatedMinutes: 19,
    icon: 'formula',
    learningObjectives: [
      'Interpret subscripts and coefficients',
      'Build neutral ionic formulas from charges',
      'Name ionic and simple covalent compounds',
    ],
    recap: [
      'A subscript counts atoms in one molecule; a coefficient counts whole molecules',
      'Ionic formulas balance charges so the compound is neutral overall',
      'Ionic names: metal first, then nonmetal root + "-ide"',
      'Covalent names use prefixes: mono-, di-, tri-, tetra-',
      'Polyatomic ions (like nitrate, sulfate) act as a single unit',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'FormulaBreakdown',
        title: 'What formulas mean',
        body: 'A chemical formula is a compact recipe: it lists which atoms are present and how many of each, using element symbols and small subscript numbers. H2O means two hydrogen atoms bonded to one oxygen atom.',
        instructions: 'Explore H2O with color-coded atoms.',
        interactionConfig: { formula: 'H2O' },
      },
      {
        type: 'clickableDiagram',
        component: 'CoefficientSubscriptID',
        title: 'Subscripts vs. coefficients',
        body: 'A subscript (the small number after a symbol) counts atoms within one molecule. A coefficient (the big number in front) multiplies whole molecules. So 2H2O means two separate water molecules - four H atoms and two O atoms in total.',
        instructions: 'Tap the coefficient, then a subscript, to tell them apart.',
        interactionConfig: { coefficient: 2, units: [{ el: 'H', sub: 2 }, { el: 'O', sub: 1 }] },
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Misconception check: H2O vs. 2H2O',
        body: 'Subscripts and coefficients are easy to confuse. Predict first.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'Do "H2O" and "2H2O" describe the same number of atoms?',
          options: [
            { id: 'a', label: 'Yes - they look almost the same', correct: false },
            { id: 'b', label: 'No - 2H2O has twice as many of every atom', correct: true },
          ],
          reveal:
            'They are different. H2O is one molecule (2 H + 1 O). The coefficient in 2H2O doubles everything: 4 H + 2 O across two molecules. The subscript stays inside one molecule; the coefficient multiplies molecules.',
        },
      },
      {
        type: 'formulaBuilder',
        component: 'IonicFormulaBuilder',
        title: 'Reading ionic formulas',
        body: 'Ionic compounds must be neutral overall, so positive and negative charges have to cancel. Your goal: pick a metal and a nonmetal, then adjust the counts until the net charge is exactly 0 and press Check. If Mg is +2 and Cl is -1, you need two chlorides per magnesium, giving MgCl2.',
        instructions: 'Balance the charges to 0, then press Check to confirm your neutral formula.',
      },
      {
        type: 'nameBuilder',
        component: 'CompoundNameBuilder',
        title: 'Build an ionic name',
        body: 'Ionic names follow a simple pattern: the metal keeps its name, and the nonmetal takes an "-ide" ending. NaCl is "sodium chloride" - not "sodium chlorine".',
        instructions: 'Tap word blocks to assemble the name of NaCl.',
        interactionConfig: {
          formula: 'NaCl',
          answer: ['sodium', 'chloride'],
          blocks: ['sodium', 'chlorine', 'chloride', 'monoxide', 'nitrate'],
        },
      },
      {
        type: 'nameBuilder',
        component: 'CompoundNameBuilder',
        title: 'Check: name the covalent compound',
        body: 'Covalent compounds use prefixes to show how many of each atom.',
        instructions: 'Assemble the correct name from the blocks.',
        isCheck: true,
        check: {
          validationMode: 'nameBuilder',
          formula: 'CO2',
          answer: ['carbon', 'dioxide'],
          blocks: ['carbon', 'oxygen', 'monoxide', 'dioxide', 'sodium'],
          hint: 'Two oxygens -> "di" + oxide = dioxide.',
          feedbackCorrect: 'Correct - CO2 is carbon dioxide.',
          feedbackIncorrect: 'Use the prefix for two oxygens: di-.',
        },
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Naming covalent compounds',
        body: 'Prefixes encode the counts: mono- (1), di- (2), tri- (3), tetra- (4). CO is carbon monoxide; CO2 is carbon dioxide; N2O4 is dinitrogen tetroxide.',
        instructions: 'Match formulas like CO, CO2, and N2O4 to their names.',
      },
      {
        type: 'flashcards',
        component: 'PolyatomicFlashcards',
        title: 'Polyatomic ions',
        body: 'Some ions are made of several atoms that travel together as one charged unit. A few essential ones: ammonium (NH4+), hydroxide (OH-), nitrate (NO3-), sulfate (SO4 2-), and carbonate (CO3 2-).',
        instructions: 'Flip each tile to learn its name and formula.',
      },
      {
        type: 'matching',
        component: 'FormulaNameMatcher',
        title: 'Check: naming with polyatomic ions',
        body: 'When a polyatomic ion is involved, treat it as a single unit and keep its name. NaNO3 is sodium nitrate; CaCO3 is calcium carbonate; the metal still comes first.',
        instructions: 'Match each polyatomic compound to its name, then check your work.',
        isCheck: true,
        check: {
          validationMode: 'matching',
          pairs: [
            { left: 'NaNO3', right: 'sodium nitrate' },
            { left: 'CaCO3', right: 'calcium carbonate' },
            { left: 'KOH', right: 'potassium hydroxide' },
            { left: 'NH4Cl', right: 'ammonium chloride' },
          ],
          hint: 'Keep the polyatomic ion\u2019s name; metal (or ammonium) comes first.',
          feedbackCorrect: 'You handled polyatomic names perfectly.',
          feedbackIncorrect: 'Treat the polyatomic ion as one named unit.',
        },
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
    estimatedMinutes: 18,
    icon: 'reaction',
    learningObjectives: [
      'Identify reactants and products',
      'Explain conservation of mass',
      'Balance simple equations with coefficients',
      'Recognize common reaction types',
    ],
    recap: [
      'Reactants turn into products, separated by an arrow',
      'Atoms are never created or destroyed - only rearranged (conservation of mass)',
      'A balanced equation has equal atoms of each element on both sides',
      'Coefficients (not subscripts) are used to balance equations',
      'Common types: synthesis, decomposition, single/double replacement, combustion',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'ReactionLayout',
        title: 'Reactants and products',
        body: 'A chemical equation reads left to right. The starting materials (reactants) are written on the left, an arrow means "becomes", and the new substances (products) are on the right. The arrow is like an equals sign that only points forward.',
        instructions: 'Click each label to highlight that side of the reaction.',
      },
      {
        type: 'explainer',
        component: 'ConservationAnimator',
        title: 'Conservation of mass',
        body: 'In any chemical reaction, atoms are only rearranged - never created or destroyed. Every atom that goes in must come out. That is why the total mass before a reaction equals the total mass after, a rule called the conservation of mass.',
        instructions: 'Compare the atoms before and after the reaction - count them.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Misconception check: do atoms disappear?',
        body: 'When a log burns away to a little ash, it can feel like matter vanished. Predict the truth.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'When wood burns and seems to "disappear," what happened to its atoms?',
          options: [
            { id: 'a', label: 'They were destroyed', correct: false },
            { id: 'b', label: 'They left as gases (CO2 and water vapor) plus ash', correct: true },
            { id: 'c', label: 'They turned into energy and vanished', correct: false },
          ],
          reveal:
            'The atoms did not vanish - most left as invisible gases (carbon dioxide and water vapor) while some stayed as ash. Count atoms before and after and they always match.',
        },
      },
      {
        type: 'explainer',
        component: 'EquationBalancer',
        title: 'What balancing means',
        body: 'Because atoms are conserved, a correct equation must have the same number of each kind of atom on both sides. When the counts do not match, the equation is "unbalanced" and we fix it by adjusting coefficients.',
        instructions: 'Compare atom counts for the unbalanced H2 + O2 -> H2O.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Misconception check: how do we balance?',
        body: 'There is a right way and a wrong way to fix atom counts. Predict.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'To balance an equation, you should change the...',
          options: [
            { id: 'a', label: 'Subscripts (the small numbers in formulas)', correct: false },
            { id: 'b', label: 'Coefficients (the big numbers in front)', correct: true },
          ],
          reveal:
            'Only change coefficients. Changing a subscript would change the substance itself (H2O vs H2O2). Coefficients add whole molecules, which is the only legal way to balance.',
        },
      },
      {
        type: 'steppers',
        component: 'EquationBalancer',
        title: 'Using coefficients',
        body: 'A coefficient multiplies an entire formula, scaling every atom in it. Place coefficients in front of formulas and watch the atom tallies change until both sides match.',
        instructions: 'Use the +/- steppers and watch atom counts update live.',
      },
      {
        type: 'explainer',
        component: 'ReactionTypeDiagram',
        title: 'Reactions follow patterns',
        body: 'Most reactions fall into a handful of recognizable patterns. Learning the patterns lets you predict products instead of memorizing every reaction. The first pattern is synthesis - watch two simple substances combine into one.',
        instructions: 'Watch the atoms combine, then read the pattern.',
        interactionConfig: { reactionType: 'synthesis' },
      },
      {
        type: 'explainer',
        component: 'ReactionTypeDiagram',
        title: 'Decomposition: breaking down',
        body: 'Decomposition is the reverse of synthesis: a single compound breaks into simpler pieces, usually when you add energy like heat, light, or electricity. Splitting water into hydrogen and oxygen gases is a classic example.',
        instructions: 'Watch the compound break apart into two products.',
        interactionConfig: { reactionType: 'decomposition' },
      },
      {
        type: 'explainer',
        component: 'ReactionTypeDiagram',
        title: 'Single replacement',
        body: 'In a single replacement, a lone element pushes another element out of a compound and takes its place. A more reactive metal, for instance, can displace a less reactive one from its compound.',
        instructions: 'Watch element A replace B inside the compound.',
        interactionConfig: { reactionType: 'single' },
      },
      {
        type: 'explainer',
        component: 'ReactionTypeDiagram',
        title: 'Double replacement',
        body: 'In a double replacement, two compounds swap partners. The positive and negative ions trade places, often forming a solid (a precipitate), a gas, or water.',
        instructions: 'Watch both compounds exchange partners.',
        interactionConfig: { reactionType: 'double' },
      },
      {
        type: 'explainer',
        component: 'ReactionTypeDiagram',
        title: 'Combustion',
        body: 'Combustion is the rapid reaction of a fuel with oxygen, releasing energy as heat and light. Burning a hydrocarbon fuel produces carbon dioxide and water. It powers engines, stoves, and campfires alike.',
        instructions: 'Watch the fuel react with oxygen to form CO2 and water.',
        interactionConfig: { reactionType: 'combustion' },
      },
      {
        type: 'classify',
        component: 'ClassifyCheck',
        title: 'Check: recognize the reaction type',
        body: 'Each reaction type follows a recognizable pattern. With practice you can spot the type just from the shape of the equation.',
        instructions: 'Sort each equation into its reaction type, then check.',
        isCheck: true,
        check: {
          validationMode: 'classify',
          categories: ['synthesis', 'decomposition', 'combustion'],
          items: [
            { id: 'syn', label: '2H2 + O2 -> 2H2O', answer: 'synthesis' },
            { id: 'dec', label: '2H2O -> 2H2 + O2', answer: 'decomposition' },
            { id: 'com', label: 'CH4 + 2O2 -> CO2 + 2H2O', answer: 'combustion' },
            { id: 'syn2', label: 'N2 + 3H2 -> 2NH3', answer: 'synthesis' },
          ],
          hint: 'Things combine = synthesis; one breaks apart = decomposition; a fuel + O2 = combustion.',
          feedbackCorrect: 'You can name reaction types on sight!',
          feedbackIncorrect: 'Look at whether things combine, break apart, or burn in oxygen.',
        },
      },
      {
        type: 'steppers',
        component: 'EquationBalancer',
        title: 'Check: balance the equation',
        body: 'Balance a classic equation using only coefficients.',
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
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: reaction types',
        body: 'Match each pattern to its name.',
        instructions: 'Answer each question.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'syn', prompt: 'A + B -> AB is which type?', options: ['Synthesis', 'Decomposition', 'Combustion'], answer: 'Synthesis' },
            { id: 'dec', prompt: 'AB -> A + B is which type?', options: ['Synthesis', 'Decomposition', 'Single replacement'], answer: 'Decomposition' },
            { id: 'comb', prompt: 'A fuel reacting with O2 to make CO2 + H2O is...', options: ['Combustion', 'Double replacement', 'Synthesis'], answer: 'Combustion' },
          ],
          hint: 'Build up = synthesis; break down = decomposition.',
          feedbackCorrect: 'You can name reaction types on sight!',
          feedbackIncorrect: 'Look at whether things combine, break apart, or swap.',
        },
      },
    ],
  },
  {
    title: 'The Mole, Molar Mass, and Stoichiometry',
    shortDescription:
      'Build intuition for counting particles without heavy arithmetic.',
    estimatedMinutes: 18,
    icon: 'mole',
    learningObjectives: [
      'Explain why chemists use the mole',
      'Find molar mass from a formula',
      'Convert grams, moles, and particles',
      'Use coefficients as mole ratios',
    ],
    recap: [
      'The mole is a counting unit: 6.022 x 10^23 particles',
      'Molar mass is the mass of one mole, summed from atomic masses',
      'moles = grams / molar mass',
      'Multiply moles by 6.022 x 10^23 to get particles',
      'Balanced coefficients give the mole ratio of a reaction',
    ],
    slides: [
      {
        type: 'explainer',
        component: 'CountingUnitScene',
        title: 'Why chemists need a counting unit',
        body: 'We already count tricky things in bundles: a dozen eggs (12), a ream of paper (500). Atoms are so tiny that even a pinch contains trillions of trillions, so chemists need a giant counting unit to make the numbers manageable.',
        instructions: 'Compare counting eggs by the dozen to counting particles.',
      },
      {
        type: 'explainer',
        component: 'MoleConceptScene',
        title: 'What is a mole?',
        body: 'A mole is simply a number: 6.022 x 10^23 particles, known as Avogadro\u2019s number. It is "a chemist\u2019s dozen." Saying "two moles of water" is just a precise way to say a specific, enormous count of water molecules.',
        instructions: 'Slide the moles up and watch symbolic groups of particles grow.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: why such a strange number?',
        body: 'Why 6.022 x 10^23 instead of a round number? Predict.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'Why do chemists use such a huge, specific number for one mole?',
          options: [
            { id: 'a', label: 'It links the mass of atoms to grams we can weigh', correct: true },
            { id: 'b', label: 'It was chosen at random', correct: false },
            { id: 'c', label: 'It is the number of elements', correct: false },
          ],
          reveal:
            'Avogadro\u2019s number is defined so that one mole of an element has a mass in grams equal to its atomic mass. That bridge between invisible atoms and gram-scale masses is what makes the mole so useful.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'MolarMassLookup',
        title: 'Molar mass',
        body: 'Molar mass is the mass of one mole of a substance, in grams. You find it by adding up the atomic masses of every atom in the formula. Water (H2O) is about 1 + 1 + 16 = 18 g/mol.',
        instructions: 'Select H2O or CO2 to auto-sum its molar mass.',
        interactionConfig: { formula: 'H2O' },
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Convert grams to moles',
        body: 'To go from a mass you can weigh to a count of particles, divide by molar mass: moles = grams / molar mass. The guided steps below walk through it one decision at a time.',
        instructions: 'Work through each step to convert grams of water to moles.',
        interactionConfig: { grams: 36, molarMass: 18, substance: 'H\u2082O' },
      },
      {
        type: 'explainer',
        component: 'MoleConceptScene',
        title: 'From moles to particles',
        body: 'Once you have moles, multiply by 6.022 x 10^23 to get the actual number of particles. Going the other way, divide particles by Avogadro\u2019s number to get moles. The mole sits in the middle of every count.',
        instructions: 'Adjust the moles and read the particle count.',
      },
      {
        type: 'clickableDiagram',
        component: 'MoleRatioScene',
        title: 'Use coefficients as mole ratios',
        body: 'A balanced equation\u2019s coefficients are a recipe in moles. In 2H2 + O2 -> 2H2O, two moles of hydrogen react with one mole of oxygen to make two moles of water. That 2:1:2 ratio lets you predict amounts.',
        instructions: 'See how 2 mol H2 react with 1 mol O2 to make 2 mol H2O.',
      },
      {
        type: 'steppers',
        component: 'MoleConversionStepper',
        title: 'Simple stoichiometry',
        body: 'Putting it together: convert to moles, apply the mole ratio from the balanced equation, then convert back if needed. Each step is small - the guided path keeps it from feeling abstract.',
        instructions: 'Follow the guided steps to find moles of product.',
        interactionConfig: { grams: 18, molarMass: 18, substance: 'H\u2082O' },
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
            { id: 'part', prompt: 'How many particles are in 1 mole?', options: ['6.022 x 10^23', '1,000', '100'], answer: '6.022 x 10^23' },
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
    estimatedMinutes: 18,
    icon: 'beaker',
    learningObjectives: [
      'Compare solids, liquids, and gases',
      'Describe phase changes and density',
      'Explain solutions and concentration',
      'Place substances on the pH scale',
    ],
    recap: [
      'Particles are packed in solids, looser in liquids, and far apart in gases',
      'Adding heat speeds particles up and drives phase changes',
      'A solution forms when a solute dissolves in a solvent',
      'More solute in the same volume = more concentrated',
      'pH runs 0 (acidic) to 14 (basic), with 7 neutral',
    ],
    slides: [
      {
        type: 'clickableDiagram',
        component: 'StateParticlesAnimator',
        title: 'States of matter',
        body: 'The three everyday states differ in how their particles are arranged and how much they move. In a solid, particles are packed and only vibrate in place. In a liquid, they touch but slide past each other. In a gas, they are far apart and zoom freely.',
        instructions: 'Toggle solid, liquid, and gas to see particle spacing and motion.',
      },
      {
        type: 'clickableDiagram',
        component: 'TemperatureSlider',
        title: 'Phase changes',
        body: 'Temperature is really a measure of particle motion. Add energy and particles move faster; remove it and they slow down. Enough heating melts a solid to a liquid, then boils it into a gas - and cooling reverses each step.',
        instructions: 'Drag the temperature slider to melt and boil the substance.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: heating ice',
        body: 'Think about what energy does to particle motion.',
        instructions: 'Predict, then reveal.',
        interactionConfig: {
          prompt: 'As you heat ice, what happens to its water particles first?',
          options: [
            { id: 'a', label: 'They vibrate faster until the solid melts into liquid', correct: true },
            { id: 'b', label: 'They instantly become gas', correct: false },
            { id: 'c', label: 'They stop moving', correct: false },
          ],
          reveal:
            'Heating adds energy, so the particles vibrate faster. Once they have enough energy to break free of their fixed positions, the solid melts into a liquid. More heat later boils it into a gas.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'DensityCompare',
        title: 'Density basics',
        body: 'Density is how much matter is packed into a given space (mass per volume). The same-size box of lead has far more mass than one of feathers because lead\u2019s particles are heavier and more tightly packed. Density is why some things float and others sink.',
        instructions: 'Compare two equal volumes and predict which is denser.',
      },
      {
        type: 'predict',
        component: 'PredictRevealCard',
        title: 'Predict: salt in water',
        body: 'You stir salt into water and it seems to vanish. Predict what really happens to it.',
        instructions: 'Predict, then reveal the process.',
        interactionConfig: {
          prompt: 'What happens when salt dissolves in water?',
          options: [
            { id: 'a', label: 'It disappears forever', correct: false },
            { id: 'b', label: 'It breaks into tiny ions spread evenly through the water', correct: true },
            { id: 'c', label: 'It turns into a gas', correct: false },
          ],
          reveal:
            'The salt does not disappear - it separates into sodium and chloride ions that spread evenly through the water. It is still there (you could taste it or boil the water away to get it back); it is just broken into invisible particles.',
        },
      },
      {
        type: 'clickableDiagram',
        component: 'SolutionConcentrationMixer',
        title: 'What is a solution?',
        body: 'A solution is a uniform mixture where a solute dissolves into a solvent. In saltwater, salt is the solute and water is the solvent. The particles spread out so evenly that the mixture looks like a single clear substance.',
        instructions: 'Watch salt dissolve into water.',
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Concentration',
        body: 'Concentration describes how much solute is dissolved in a given amount of solvent. More solute in the same volume = more concentrated; more water = more dilute. Use that idea to answer.',
        instructions: 'Answer each question, then check.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'c1', prompt: 'Adding more solute to the same volume of water makes it...', options: ['more dilute', 'more concentrated', 'unchanged'], answer: 'more concentrated' },
            { id: 'c2', prompt: 'You add more water to a solution. It becomes...', options: ['more dilute', 'more concentrated', 'a solid'], answer: 'more dilute' },
            { id: 'c3', prompt: 'Which is most concentrated?', options: ['1 spoon of sugar in a cup', '1 spoon of sugar in a jug', '1 spoon of sugar in a bucket'], answer: '1 spoon of sugar in a cup' },
          ],
          hint: 'Think about solute amount compared to the volume it is spread through.',
          feedbackCorrect: 'You have the dilute vs. concentrated idea down!',
          feedbackIncorrect: 'More solute (or less water) in the same space = more concentrated.',
        },
      },
      {
        type: 'pHPlacement',
        component: 'PHScalePlacement',
        title: 'Acids, bases, and the pH scale',
        body: 'The pH scale measures how acidic or basic a solution is, from 0 (strongly acidic) to 14 (strongly basic), with 7 neutral. Each step is a tenfold change. Lemon juice is acidic, pure water is neutral, and soap is basic.',
        instructions: 'Drag each real household item to acidic, neutral, or basic.',
      },
      {
        type: 'classify',
        component: 'AcidBaseClassifier',
        title: 'Properties of acids and bases',
        body: 'Acids tend to taste sour and react with metals; bases tend to feel slippery and taste bitter. (Never taste or touch lab chemicals!) Indicators like litmus change color to reveal which is which.',
        instructions: 'Drag each example into the acid or base category.',
      },
      {
        type: 'explainer',
        component: 'WaterRoleScene',
        title: 'Water\u2019s role',
        body: 'Water is called the universal solvent because it dissolves so many substances, thanks to its slightly charged (polar) molecules. That ability makes water central to chemistry, biology, and everyday life - from your blood to the oceans.',
        instructions: 'See why water pulls ionic compounds apart so well.',
      },
      {
        type: 'classify',
        component: 'MultipleChoiceCheck',
        title: 'Check: reading the pH scale',
        body: 'Put the pH scale to work - reading it and comparing acidity with powers of ten.',
        instructions: 'Answer each question, then check.',
        isCheck: true,
        check: {
          validationMode: 'multipleChoice',
          questions: [
            { id: 'p1', prompt: 'A solution with pH 12 is best described as...', options: ['strongly acidic', 'neutral', 'strongly basic'], answer: 'strongly basic' },
            { id: 'p2', prompt: 'How much more acidic is pH 2 than pH 4?', options: ['2 times', '20 times', '100 times'], answer: '100 times' },
            { id: 'p3', prompt: 'Which has the most free H\u207A ions?', options: ['pH 3', 'pH 7', 'pH 10'], answer: 'pH 3' },
            { id: 'p4', prompt: 'Pure water sits at pH...', options: ['0', '7', '14'], answer: '7' },
          ],
          hint: 'Each whole pH step is a 10x change; lower pH = more H\u207A = more acidic.',
          feedbackCorrect: 'You can read and reason with the pH scale!',
          feedbackIncorrect: 'Count the steps between pH values and use powers of ten.',
        },
      },
    ],
  },
];

/**
 * Extra slides layered onto each lesson:
 *  - `explainers`: short, text-forward analogy slides (with an animated SVG)
 *    inserted right after a named slide to deepen a concept just introduced.
 *  - `quiz`: an end-of-lesson mini skill-check appended last.
 */
function explainer(title, body, graphic, caption) {
  return {
    type: 'explainer',
    component: 'ExplainerGraphic',
    title,
    body,
    interactionConfig: { graphic: graphic ?? null, caption: caption ?? null },
  };
}

function quiz(title, questions, hint, feedbackCorrect, feedbackIncorrect) {
  return {
    type: 'classify',
    component: 'MultipleChoiceCheck',
    title,
    body: 'A quick mini-quiz pulling together the whole lesson.',
    instructions: 'Answer each question, then check your work.',
    isCheck: true,
    check: { validationMode: 'multipleChoice', questions, hint, feedbackCorrect, feedbackIncorrect },
  };
}

const LESSON_EXTRAS = [
  {
    prepend: [
      explainer(
        'Chemistry is everywhere',
        'Chemistry is the science of matter - what everything is made of - and the changes it goes through. Cooking an egg, a nail rusting, a phone battery charging, even the air you breathe: all of it is chemistry. Once you know its rules, the everyday world starts to make sense.',
        'flask',
        'From cooking to batteries to breathing - chemistry is everywhere.',
      ),
      explainer(
        'What exactly is matter?',
        'Before anything else, chemistry needs a clear idea of matter. Matter is anything that has mass (you could weigh it) and takes up space (it has volume). Solids, liquids, and gases all count - even invisible ones like the air inside a balloon. Energy such as light and sound is real, but it has no mass, so it is not matter.',
        'matter',
        'Matter has mass and takes up space - even invisible gases like air.',
      ),
    ],
    explainers: [
      {
        insertAfter: 'Atoms are the building blocks',
        slide: {
          type: 'explainer',
          component: 'BuildingBlocksExercise',
          title: 'Just a few kinds of building blocks',
          body: 'Here is a wonderful idea: everything around you is built from only about 100 kinds of atoms. It works like LEGO - a handful of brick types snap together into endless creations. Try it below: the same three bricks build several completely different things.',
          instructions: 'Tap bricks to match each build, then build the next one from the same few types.',
        },
      },
      { insertAfter: 'Elements, compounds, and mixtures', slide: explainer('Compounds vs. mixtures: cake vs. salad', 'An easy way to feel the difference: a salad is a mixture - the lettuce, tomato, and cheese keep their own identities and you could pick them back apart. A baked cake is like a compound - the eggs, flour, and sugar have reacted into something brand-new you cannot separate by hand.', 'jars', 'Mixture = salad (separable); compound = cake (transformed).') },
      { insertAfter: 'The periodic table', slide: explainer('Why the table is organized this way', 'The periodic table is not a random list - it is arranged like a well-organized library. Books on the same shelf share a topic; elements in the same column (group) share similar behavior. That organization lets you predict how an element acts just from where it sits.', 'grid', 'Like a library shelves similar books, the table groups similar elements.') },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'Which one has mass and takes up space (is matter)?', options: ['A beam of light', 'A cup of air', 'A musical note'], answer: 'A cup of air' },
      { id: 'q2', prompt: 'A compound is...', options: ['one kind of atom', 'different atoms chemically bonded', 'substances just physically mixed'], answer: 'different atoms chemically bonded' },
      { id: 'q3', prompt: 'Which particle sits in the nucleus and has no charge?', options: ['Proton', 'Neutron', 'Electron'], answer: 'Neutron' },
      { id: 'q4', prompt: 'Elements in the same group (column) have similar...', options: ['mass', 'properties', 'color'], answer: 'properties' },
    ], 'Recall the test for matter, the three categories, the atom parts, and the table layout.', 'Lesson mastered - you have the foundations down!', 'Review the recap points and give it another go.'),
  },
  {
    prepend: [
      explainer(
        'A quick tour inside the atom',
        'Every atom has two regions. The nucleus is a tiny, dense core packed with positively charged protons and neutral neutrons - it holds almost all the mass. Far lighter electrons zip around it in layers called shells. Three particles, two regions: that simple picture explains nearly everything in this lesson.',
        'insideAtom',
        'Protons and neutrons in the nucleus; electrons orbit in shells.',
      ),
    ],
    explainers: [
      { insertAfter: 'Protons define the element', slide: explainer('The proton count is an atom\u2019s ID', 'Think of the proton count as an atom\u2019s ID number, like a student ID or a passport number. No two elements share it: 1 proton is always hydrogen, 8 is always oxygen. Change the ID and you are literally looking at a different element.', 'badge', 'The atomic number is a unique ID - it never lies about identity.') },
      {
        insertAfter: 'Isotopes',
        slide: {
          type: 'clickableDiagram',
          component: 'IsotopeAnalogy',
          title: 'Isotopes: same backpacker, different load',
          body: 'Picture one backpacker who can carry different numbers of identical weights. They are still the very same person - just heavier or lighter. Isotopes work exactly the same way: add or remove neutrons (the weights) and the atom\u2019s mass changes, but its identity (the proton count) never does.',
          instructions: 'Add and remove weights (neutrons) and watch the mass number change while the identity stays Carbon.',
        },
      },
      { insertAfter: 'Valence electrons', slide: explainer('How an atom becomes an ion', 'Atoms are happiest with a full outer shell, so they trade electrons to get there. Giving an electron away is like handing off a token: lose one and you are left with extra positive charge (a cation); grab an extra and you gain negative charge (an anion).', 'transfer', 'Lose an electron -> positive; gain one -> negative.') },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'What decides which element an atom is?', options: ['Protons', 'Neutrons', 'Electrons'], answer: 'Protons' },
      { id: 'q2', prompt: 'Carbon-12 and carbon-14 are...', options: ['different elements', 'isotopes', 'ions'], answer: 'isotopes' },
      { id: 'q3', prompt: 'An atom that LOSES an electron becomes a...', options: ['cation (+)', 'anion (-)', 'neutron'], answer: 'cation (+)' },
      { id: 'q4', prompt: 'Magnesium (Mg) tends to form an ion with charge...', options: ['+1', '+2', '-2'], answer: '+2' },
      { id: 'q5', prompt: 'In water, electrons are shared unequally, so the bond is...', options: ['polar', 'nonpolar', 'metallic'], answer: 'polar' },
    ], 'Protons = identity; neutrons = isotope; losing electrons makes a + ion; unequal sharing = polar.', 'You have atoms, ions, and polarity down cold!', 'Revisit identity vs. mass, how ions form, and what makes a bond polar.'),
  },
  {
    explainers: [
      {
        insertAfter: 'Why atoms bond',
        slide: {
          type: 'clickableDiagram',
          component: 'StabilityCardsScene',
          title: 'Stability is a full hand of cards',
          body: 'Why do atoms bond at all? For the same reason a card player wants a complete hand. An atom with a full outer shell (often eight electrons - an "octet") is stable and content; an incomplete shell is restless. Deal electrons into the shell and cards into the hand together - both complete the set at the same time.',
          instructions: 'Deal electrons and cards together until both sets are full and turn green.',
        },
      },
      {
        insertAfter: 'Covalent bonding',
        slide: {
          type: 'clickableDiagram',
          component: 'GiveVsShareScene',
          title: 'Giving vs. sharing',
          body: 'Two everyday ways to settle a dispute over a toy: give it away, or share it. Ionic bonding is the give-away - a metal hands electrons to a nonmetal, so charges appear. Covalent bonding is sharing - two nonmetals each hold the same electron pair, so both feel complete with no full charges.',
          instructions: 'Toggle between Give (ionic) and Share (covalent) and watch where the electron pair settles.',
        },
      },
      { insertAfter: 'Metallic bonding', slide: explainer('A sea of shared electrons', 'Imagine marbles (the positive metal ions) sitting in a shallow tray of water (the electrons) that can slosh freely around them. That mobile "sea" of electrons is why metals conduct electricity and bend instead of shattering - the layers slide while the sea keeps holding them together.', 'sea', 'Fixed metal ions bathed in a free-flowing electron sea.') },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'Atoms bond mainly to become...', options: ['more reactive', 'more stable', 'heavier'], answer: 'more stable' },
      { id: 'q2', prompt: 'Sharing electron pairs is a ... bond', options: ['ionic', 'covalent', 'metallic'], answer: 'covalent' },
      { id: 'q3', prompt: 'NaCl is held together by a ... bond', options: ['ionic', 'covalent', 'metallic'], answer: 'ionic' },
      { id: 'q4', prompt: 'The "sea of electrons" explains why metals...', options: ['shatter', 'conduct electricity', 'float'], answer: 'conduct electricity' },
      { id: 'q5', prompt: 'By VSEPR, a central atom with 4 bonds and no lone pairs is...', options: ['linear', 'tetrahedral', 'bent'], answer: 'tetrahedral' },
    ], 'Stability drives bonding; share = covalent, transfer = ionic, sea = metallic; pairs repel to set shape.', 'You can tell the bond types apart and predict shapes!', 'Review why atoms bond, how each bond type works, and the VSEPR shapes.'),
  },
  {
    explainers: [
      { insertAfter: 'What formulas mean', slide: explainer('A formula is a recipe', 'A chemical formula is just a recipe card. It tells you the ingredients (which elements) and the amounts (the small subscript numbers). H2O is the recipe "two hydrogens plus one oxygen", every single time.', 'recipe', 'Elements are ingredients; subscripts are the amounts.') },
      {
        insertAfter: 'Subscripts vs. coefficients',
        slide: {
          type: 'clickableDiagram',
          component: 'ServingsScene',
          title: 'Servings vs. ingredients',
          body: 'Keep two numbers straight: a subscript is an ingredient amount inside one serving, while a coefficient is the number of servings. 2H2O is two whole servings of water - the recipe inside each serving never changes, you just make more of them.',
          instructions: 'Add servings and watch the totals scale while each plate keeps the same recipe.',
        },
      },
      { insertAfter: 'Reading ionic formulas', slide: explainer('Names are a translation', 'A chemical name is simply the formula written in words. Learning the rules is like learning to translate between two languages: "NaCl" and "sodium chloride" say exactly the same thing - metal first, nonmetal ending in -ide.', 'label', 'Formula and name are the same idea in two languages.') },
      { insertAfter: 'Build an ionic name', slide: explainer('Naming building blocks', 'Two small toolkits cover most beginner naming. Count prefixes tell you how many atoms: mono- (1), di- (2), tri- (3), tetra- (4). Endings tell you the type: a simple two-element compound ends in -ide (chloride, oxide). Learn these few pieces and most names click into place.', 'affixes', 'Prefixes count atoms; -ide ends a simple compound.') },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'In 2H2O, the 2 in front is a...', options: ['subscript', 'coefficient', 'charge'], answer: 'coefficient' },
      { id: 'q2', prompt: 'How many oxygen atoms total are in 2H2O?', options: ['1', '2', '4'], answer: '2' },
      { id: 'q3', prompt: 'NaCl is named...', options: ['sodium chlorine', 'sodium chloride', 'chlorine sodium'], answer: 'sodium chloride' },
      { id: 'q4', prompt: 'The covalent prefix for two atoms is...', options: ['mono-', 'di-', 'tri-'], answer: 'di-' },
      { id: 'q5', prompt: 'Aluminum is +3 and oxygen is -2. The neutral formula is...', options: ['AlO', 'Al2O3', 'Al3O2'], answer: 'Al2O3' },
      { id: 'q6', prompt: 'What is the name of N2O4?', options: ['nitrogen oxide', 'dinitrogen tetroxide', 'nitrogen dioxide'], answer: 'dinitrogen tetroxide' },
      { id: 'q7', prompt: 'How many total atoms are in one formula unit of Ca(NO3)2?', options: ['6', '9', '5'], answer: '9' },
    ], 'Coefficient multiplies molecules; ionic names end in -ide; covalent names use prefixes; cross the charges for ionic formulas.', 'You can read and name compounds now!', 'Re-check subscripts vs. coefficients and the naming rules.'),
  },
  {
    explainers: [
      {
        insertAfter: 'Conservation of mass',
        slide: {
          type: 'clickableDiagram',
          component: 'RearrangeBlocksScene',
          title: 'Rearranging, never losing',
          body: 'In a reaction, atoms are only rearranged - like taking apart a LEGO castle and rebuilding it into a ship. Every brick is reused; none vanish or appear from nowhere. That is exactly why the mass before a reaction equals the mass after.',
          instructions: 'Rebuild the same eight bricks and watch the count stay the same.',
        },
      },
      { insertAfter: 'What balancing means', slide: explainer('Balancing is a seesaw', 'Think of a reaction as a seesaw that must sit level. Each kind of atom has to weigh the same on both sides. If one side is heavier (more atoms), you add whole molecules - never change a formula - until the seesaw balances.', 'seesaw', 'Equal atoms on each side keeps the equation level.') },
      { insertAfter: 'Reactions follow patterns', slide: explainer('Reactions come in patterns', 'Most reactions are like familiar dance moves - once you know the pattern you can predict the next step. Two partners join (synthesis), one splits into two (decomposition), or pairs swap partners (replacement). Spotting the pattern beats memorizing every reaction.', 'patterns', 'Learn the handful of patterns, predict the products.') },
      { insertAfter: 'Combustion', slide: explainer('Five patterns, side by side', 'You have now seen all five: synthesis (parts combine), decomposition (one splits apart), single replacement (a lone element swaps in), double replacement (two compounds trade partners), and combustion (a fuel burns in oxygen to make CO\u2082 and water). Look at the shape of an equation and the pattern usually gives the type away.', 'patterns', 'Synthesis, decomposition, single & double replacement, combustion.') },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'During a reaction, atoms are...', options: ['destroyed', 'created', 'rearranged'], answer: 'rearranged' },
      { id: 'q2', prompt: 'To balance an equation you change...', options: ['subscripts', 'coefficients', 'elements'], answer: 'coefficients' },
      { id: 'q3', prompt: 'AB -> A + B is which reaction type?', options: ['Synthesis', 'Decomposition', 'Combustion'], answer: 'Decomposition' },
      { id: 'q4', prompt: 'Balancing H2 + O2 -> H2O, the H2 and H2O coefficients become...', options: ['1 and 1', '2 and 2', '2 and 1'], answer: '2 and 2' },
      { id: 'q5', prompt: 'Balanced: N2 + H2 -> NH3 needs coefficients...', options: ['1, 3, 2', '1, 1, 2', '2, 3, 1'], answer: '1, 3, 2' },
      { id: 'q6', prompt: 'Zn + 2HCl -> ZnCl2 + H2 is which type?', options: ['Single replacement', 'Double replacement', 'Synthesis'], answer: 'Single replacement' },
      { id: 'q7', prompt: 'If 10 g of reactants fully react, the products weigh...', options: ['less than 10 g', 'exactly 10 g', 'more than 10 g'], answer: 'exactly 10 g' },
    ], 'Mass is conserved; balance with coefficients; learn the reaction patterns.', 'You can balance and classify reactions!', 'Recount atoms on each side and review the patterns.'),
  },
  {
    explainers: [
      { insertAfter: 'Why chemists need a counting unit', slide: explainer('The mole is a chemist\u2019s dozen', 'We bundle hard-to-count things all the time: a dozen eggs, a pair of shoes, a ream of paper. Atoms are so tiny we need a giant bundle - the mole. Saying "one mole" is just saying "6.022 x 10^23 of them", the way "a dozen" means twelve.', null) },
      {
        insertAfter: 'Molar mass',
        slide: {
          type: 'clickableDiagram',
          component: 'WeighMoleScene',
          title: 'Weighing a known count',
          body: 'You cannot count atoms one by one, but you can weigh them. Molar mass is the clever bridge: weigh out a substance\u2019s molar mass in grams and you have exactly one mole. It is like knowing 100 identical paperclips weigh a set amount, so you weigh instead of count.',
          instructions: 'Pour one mole of each substance and watch the balance read its molar mass.',
        },
      },
      {
        insertAfter: 'Use coefficients as mole ratios',
        slide: {
          type: 'classify',
          component: 'MultipleChoiceCheck',
          title: 'Check: read the mole ratio',
          body: 'A balanced equation is a recipe in moles. Use the 2 : 1 : 2 ratio from 2H2 + O2 -> 2H2O to answer.',
          instructions: 'Answer each question using the balanced ratio, then check.',
          isCheck: true,
          check: {
            validationMode: 'multipleChoice',
            questions: [
              { id: 'r1', prompt: 'How many mol O2 react with 6 mol H2?', options: ['2', '3', '6'], answer: '3' },
              { id: 'r2', prompt: 'How many mol H2O form from 1 mol O2?', options: ['1', '2', '4'], answer: '2' },
              { id: 'r3', prompt: 'Triple the batch: how many mol H2 react?', options: ['2', '4', '6'], answer: '6' },
            ],
            hint: 'The coefficients 2 : 1 : 2 are the ratio of H2 : O2 : H2O.',
            feedbackCorrect: 'Coefficients are mole ratios - nicely done!',
            feedbackIncorrect: 'Scale every species by the same factor, keeping 2 : 1 : 2.',
          },
        },
      },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'One mole is how many particles?', options: ['6.022 x 10^23', '1,000,000', '100'], answer: '6.022 x 10^23' },
      { id: 'q2', prompt: 'Moles equals grams divided by...', options: ['molar mass', 'volume', 'charge'], answer: 'molar mass' },
      { id: 'q3', prompt: 'The molar mass of water (H2O) is about...', options: ['18 g/mol', '2 g/mol', '44 g/mol'], answer: '18 g/mol' },
      { id: 'q4', prompt: 'From 2H2 + O2 -> 2H2O, 4 mol H2 makes how many mol H2O?', options: ['2', '4', '8'], answer: '4' },
      { id: 'q5', prompt: 'How many grams is 0.5 mol of water (18 g/mol)?', options: ['9 g', '18 g', '36 g'], answer: '9 g' },
      { id: 'q6', prompt: 'The molar mass of CO2 (C=12, O=16) is...', options: ['28 g/mol', '44 g/mol', '32 g/mol'], answer: '44 g/mol' },
      { id: 'q7', prompt: 'How many molecules are in 2 mol of water?', options: ['6.022 x 10^23', '1.2 x 10^24', '3.0 x 10^23'], answer: '1.2 x 10^24' },
    ], 'A mole is a count; moles = grams / molar mass; coefficients give the ratio.', 'Great quantitative reasoning!', 'Use moles = grams / molar mass and the balanced ratio.'),
  },
  {
    explainers: [
      { insertAfter: 'States of matter', slide: explainer('Particles in a crowd', 'Picture people in a room. In a solid they are packed shoulder-to-shoulder, only swaying in place. In a liquid they mingle and slide past each other. In a gas they sprint around an empty gym. Same people (particles) - very different spacing and energy.', 'states', 'Solid: packed. Liquid: mingling. Gas: free to roam.') },
      {
        insertAfter: 'What is a solution?',
        slide: {
          type: 'clickableDiagram',
          component: 'DissolveSim',
          title: 'Dissolving spreads it out',
          body: 'When sugar disappears into tea, it has not vanished - it has broken into particles too small to see, spread evenly through the liquid. Dissolving is mixing at the particle level, which is why the sweetness is in every sip.',
          instructions: 'Stir and watch the cubes vanish while the particles spread evenly.',
        },
      },
      { insertAfter: 'Concentration', slide: explainer('What acids and bases really are', 'Before the scale, the idea: an acid releases hydrogen ions (H\u207A) when dissolved in water, while a base does the opposite (it mops H\u207A up or releases OH\u207B). More free H\u207A means more acidic. Lemon juice is loaded with H\u207A; soapy water has very little.', null) },
      { insertAfter: 'What acids and bases really are', slide: explainer('The pH scale is a dial', 'pH is just a tidy way to report how much H\u207A is present. Think of a dial from 0 to 14: turn it low for strongly acidic (lemon juice), centered at 7 for neutral (pure water), and high for strongly basic (soap). It packs a huge range of H\u207A concentrations into one friendly number.', 'dial', 'Low = acidic, 7 = neutral, high = basic.') },
      { insertAfter: 'Water\u2019s role', slide: explainer('pH counts powers of ten', 'Here is the key to pH math: each whole step is a tenfold change in acidity. Going from pH 5 to pH 4 means 10\u00D7 more acidic; pH 5 to pH 3 means 100\u00D7 (two steps = 10 \u00D7 10). The smaller the pH, the more H\u207A ions are crowded in.', null) },
      { insertAfter: 'pH counts powers of ten', slide: explainer('A quick pH calculation', 'So to compare two solutions, just count the steps between them and raise 10 to that power. pH 6 vs pH 2 is 4 steps apart, so the pH 2 solution is 10\u2074 = 10,000 times more acidic. No heavy arithmetic - just powers of ten.', null) },
    ],
    quiz: quiz('Lesson skill check', [
      { id: 'q1', prompt: 'In which state are particles packed and only vibrating?', options: ['Solid', 'Liquid', 'Gas'], answer: 'Solid' },
      { id: 'q2', prompt: 'Adding heat makes particles...', options: ['slow down', 'move faster', 'disappear'], answer: 'move faster' },
      { id: 'q3', prompt: 'When salt dissolves in water it...', options: ['vanishes', 'splits into ions spread through the water', 'becomes a gas'], answer: 'splits into ions spread through the water' },
      { id: 'q4', prompt: 'A solution with pH 2 is...', options: ['acidic', 'neutral', 'basic'], answer: 'acidic' },
      { id: 'q5', prompt: 'How much more acidic is pH 3 than pH 5?', options: ['2 times', '10 times', '100 times'], answer: '100 times' },
      { id: 'q6', prompt: 'An acid is a substance that releases...', options: ['H\u207A ions', 'OH\u207B ions', 'electrons'], answer: 'H\u207A ions' },
      { id: 'q7', prompt: 'Going from gas to liquid to solid, particle spacing...', options: ['increases', 'decreases', 'stays the same'], answer: 'decreases' },
    ], 'States differ by particle spacing; heat adds motion; each pH step is a 10x change.', 'You connected chemistry to everyday life!', 'Review particle spacing, dissolving, and the pH scale.'),
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

    // Layer in analogy explainers and an end-of-lesson quiz.
    const extras = LESSON_EXTRAS[lessonIdx] || { explainers: [], quiz: null };
    const assembledSlides = [...def.slides];
    // Lead-in explainers shown before the lesson's first authored slide.
    if (extras.prepend?.length) assembledSlides.unshift(...extras.prepend);
    extras.explainers.forEach(({ insertAfter, slide }) => {
      const at = assembledSlides.findIndex((s) => s.title === insertAfter);
      if (at >= 0) assembledSlides.splice(at + 1, 0, slide);
      else assembledSlides.push(slide);
    });
    if (extras.quiz) assembledSlides.push(extras.quiz);

    assembledSlides.forEach((slide, slideIdx) => {
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
      recap: def.recap || [],
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
