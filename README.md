PRD: Introduction to Chemistry Learning App (Brilliant-inspired MVP)

Product summary: Build a responsive web app that replicates the high-level interaction model and visual feel of Brilliant.org’s portal for a single MVP course, “Introduction to Chemistry,” designed for high school freshmen/sophomores (ages 14–16) who are taking on-level or advanced chemistry and currently have little background knowledge or are struggling with conceptual understanding. The product is not intended to be a full chemistry curriculum; it is a tightly scoped, visually guided, interactive learning experience where the primary teaching mechanism is a sequence of slides containing concise explanations, interactive SVG-based graphics, and short knowledge checks. The UI should be minimal, dark-themed, modern, highly polished, and clearly inspired by the provided screenshots: a clean landing screen, a portal with a left/right or top/content layout, card-based course presentation, high-contrast typography, bright accent colors, compact progress widgets, and a clear “continue/start course” flow.

Primary user persona: High school student, grade 9–10, age 14–16, currently enrolled in chemistry or preparing for it, understands general school math/reading but has weak confidence with chemistry vocabulary, symbols, and processes. The user is visually oriented, benefits from low-friction explanations, and prefers seeing concepts “move” or respond through interaction instead of reading long textbook passages. The user may feel overwhelmed by large blocks of text and loses confidence when explanations jump too quickly from one concept to another.

User story: As a high school freshman with little to no knowledge on the topic of chemistry, I want to learn basic chemistry lessons on a Brilliant-style platform that teaches through interactive slides and visual UI tools, so I can build intuition from the graphics themselves and understand the concept on each slide without needing a heavy textbook explanation.

Product goal: Help a beginner student complete one foundational chemistry course made of 7 lessons, where each lesson is broken into small concept slides. Every slide teaches one idea only. Visual interaction is the center of the learning experience. A subset of slides ends with a “check” interaction that tests the concept just learned. By the end of the course, the student should have a basic but coherent introduction to chemistry and be able to recognize common structures, vocabulary, and simple problem-solving patterns.

Success criteria for MVP: user can create an account using Google or email/password; user can enter a dark-themed portal; user can browse Home and Courses tabs; user can open the single course “Introduction to Chemistry”; user can see all 7 lessons; user can complete slide-by-slide learning within each lesson; interactive SVG graphics load smoothly on desktop/tablet/mobile; checks can be answered and scored locally/in Firestore; lesson completion and overall course progress persist per user; responsive experience is usable and visually consistent across phone, tablet, and desktop.

Non-goals for MVP: no multi-course catalog beyond one chemistry course; no advanced recommendation engine; no multiplayer/classroom features; no long-form assessments or grading beyond lightweight checks; no teacher dashboard; no notes export; no video lessons; no advanced gamification beyond simple progress, streak-like display, and lesson completion states; no complete chemistry mastery or AP-level depth.

Core UX/UI direction: The product should borrow the structural patterns from the screenshots: (1) a clean landing page with a minimal header, clear product message, and sign-in CTA; (2) after login, a portal with strong emphasis on learning cards, progress/streak elements, and course continuation; (3) Home and Courses navigation only; (4) dark background, rounded cards, thin borders, bold section headers, large course card visuals, simple iconography, brightly colored accent buttons, and compact top-level navigation; (5) each course/lesson displayed as a card with icon + title + progress; (6) slides presented one at a time, centered, with a large visual area and a compact explanatory text area. The app should not copy branding or text from Brilliant, but should clearly mirror the feel of a modern, polished, interactive learning portal. Use React components to implement: navbar, sidebar/top tabs, lesson cards, progress badges, streak widget, course hero card, slide canvas, check card, and completion summary card.

MVP user flow: Landing page -> sign in/up using Google or email/password -> portal opens on Home tab -> Home shows welcome, progress summary, continue learning card, single featured course card, and a short “today’s goal” or “continue where you left off” CTA -> user can switch to Courses tab -> Courses tab shows “Introduction to Chemistry” course overview and 7 lesson cards -> clicking the course opens a course overview page with lesson list -> clicking a lesson opens the slide sequence -> user navigates slide to slide with Next/Back -> interactive slides allow drag, click, hover, toggle, reveal, sort, and fill responses -> “check” slides record success/completion -> on last slide user sees lesson completion summary and next recommended lesson -> progress persists and Home page updates accordingly.

Navigation spec: Top nav on portal contains app logo/name on left, tab switcher for Home and Courses in primary view, and user account/profile/logout control on right. On mobile, top nav collapses into compact bar with a hamburger or segmented tabs. No deep nested menus. Home and Courses must always remain accessible. Lesson view includes a breadcrumb or “Back to Course” action, lesson title, lesson progress (e.g., Slide 3 of 8), and a persistent Next button that only activates when slide requirements are satisfied if the slide contains an interaction.

Landing page requirements: simple hero section with product value proposition like “Learn chemistry visually, one idea at a time”; one primary CTA for “Continue with Google” and one secondary CTA for “Sign up with Email”; minimal supporting copy; one static preview image or simple SVG illustration evoking interactive chemistry learning; footer can be minimal or omitted in MVP. The design should use the same dark aesthetic as the portal so the visual transition feels seamless.

Portal Home requirements: Welcome card (“Welcome, Alan” style personalization), simple streak/progress widget visually inspired by the first screenshot (e.g., current learning streak or completed lessons this week), “Continue learning” large featured card showing the next lesson to resume, a mini course progress bar for Introduction to Chemistry (e.g., 2/7 lessons complete), and a smaller course summary card or recommended lesson card. Since the MVP only has one course, the Home view should still feel alive by using structured cards rather than a nearly empty list. Home should surface the next incomplete lesson and the last visited slide. The left/right organization in the screenshots can be adapted into a desktop two-column layout, stacking vertically on smaller screens.

Courses tab requirements: Display a course overview section inspired by the provided course browsing screenshot. The page title should clearly indicate there is one learning path: Introduction to Chemistry. The course card should show course icon, short description, level (“Beginner”), lesson count (“7 lessons”), and progress. Beneath the course overview, show the seven lesson cards in order. Each lesson card should show title, 1–2 sentence description, completion status, and estimated duration. Clicking a lesson opens its slide deck.

Course structure: Course title: Introduction to Chemistry. Audience: beginner high school chemistry student. Estimated total duration for MVP content: 70–120 minutes depending on user pace. Format: 7 lessons, each lesson made of small atomic slides focused on a single concept, typically 5–9 slides per lesson. Slides should always prioritize visual explanation first, supporting text second. Each lesson should end with either a summary slide or a short checkpoint slide.

Detailed lesson architecture:

Lesson 1: Matter, Atoms, and the Periodic Table. Learning objective: give the student a first mental model of what chemistry studies and what atoms/elements are. Slide 1: “What is chemistry?” Simple intro slide with SVG scene showing solid/liquid/gas objects and a caption that chemistry studies matter and how it changes. Interaction: click everyday items to see they are all forms of matter. Slide 2: “Matter vs non-matter.” Drag items into two bins, one labeled matter, one labeled not matter (e.g., air, water, rock vs light, sound, heat). This visually establishes matter as anything with mass and volume. Slide 3: “Elements, compounds, and mixtures.” Interactive sort using colored particle models. Student toggles between examples like oxygen, water, saltwater, and trail mix, while particle diagrams change accordingly. Slide 4: “Atoms are the building blocks.” Zoom-in SVG from macroscopic object to molecules to atoms. Interaction: scrubber/slider lets user zoom scale. Slide 5: “Parts of an atom.” Student clicks proton, neutron, electron in a stylized atom diagram to reveal charge, location, and relative role. Slide 6: “Meet the periodic table.” Interactive mini periodic table with hover states for element symbol, name, and atomic number. Only a subset of common elements needs to be highlighted in MVP. Slide 7: “Groups and periods.” Student highlights a column and row to see how table organization works. Slide 8 (check): identify whether 4–6 examples are element/compound/mixture and locate a simple element on the periodic table. Completion condition: correct selections. This lesson should build intuitive vocabulary and reduce fear of the periodic table.

Lesson 2: Atomic Structure and Ions. Learning objective: help the student understand what determines atomic identity and how atoms gain/lose electrons to form ions. Slide 1: “Atomic number vs mass number.” Interactive card where changing proton/neutron count updates atomic number and mass number labels. Slide 2: “Identity of an element.” Student changes proton count and sees the element name change, reinforcing that protons define the element. Slide 3: “Isotopes.” Two or three atom models of the same element with different neutron counts; student toggles neutron number and sees same element, different isotope. Slide 4: “Electrons and energy shells.” SVG shell model where electrons populate rings. Student clicks to place electrons for first few elements. Slide 5: “Valence electrons.” Outer shell glows; student identifies how many valence electrons selected atoms have. Slide 6: “Why atoms form ions.” Show stable shell completion concept visually: sodium losing one electron, chlorine gaining one electron. Slide 7: “Cations vs anions.” Student drags atoms to either “lose electron” or “gain electron” sides and sees resulting ion charge. Slide 8 (check): quick interactive tasks: determine charge for Na, Mg, Cl, O, and identify isotope vs different element in simple examples. This lesson should make electron behavior the main visual story.

Lesson 3: Chemical Bonding. Learning objective: show why atoms bond and distinguish ionic, covalent, and metallic bonding at a beginner level. Slide 1: “Why atoms bond.” Animated stability concept using incomplete vs complete valence shells. Slide 2: “Ionic bonding.” Sodium transfers electron to chlorine; student drags the electron from one atom to another, then sees opposite charges attract into NaCl. Slide 3: “Covalent bonding.” Two nonmetals share electrons; student drags shared electron pairs between atoms in H2, O2, or H2O examples. Slide 4: “Metallic bonding.” Simplified visual of metal ions in a sea of mobile electrons; user toggles “push” to see layers slide and understand malleability/conductivity. Slide 5: “Molecules vs ionic compounds.” Side-by-side comparison card with examples and particle diagrams. Slide 6: “Lewis dot basics.” Student places dots around an element symbol to show valence electrons. Slide 7: “Simple Lewis structures.” Guided assembly of H2O, CO2, or NH3 using shared pairs. Slide 8 (check): classify bond type from examples, identify molecule vs ionic compound, and complete one very simple Lewis structure. The check should focus on recognition, not advanced rule exceptions.

Lesson 4: Chemical Formulas and Naming Compounds. Learning objective: teach students to read formulas and decode basic chemical naming. Slide 1: “What formulas mean.” Visual breakdown of H2O, CO2, NaCl using color-coded atoms and subscript labels. Slide 2: “Subscripts vs coefficients.” Student toggles between 2H2O and H2O to see molecule count versus atoms per molecule. Slide 3: “Reading ionic formulas.” Use ion charges to visually build neutral compounds (e.g., Mg2+ and Cl- combine into MgCl2). Drag-and-balance interaction. Slide 4: “Naming ionic compounds.” Reveal structure: metal name + nonmetal root + -ide. Student assembles names from blocks. Slide 5: “Naming covalent compounds.” Introduce prefixes mono-, di-, tri-, tetra- with a compact reference tool. Student matches formula to name for basic examples like CO, CO2, N2O4. Slide 6: “Polyatomic ions.” Introduce a small, essential set only: ammonium, hydroxide, nitrate, sulfate, carbonate. Interactive flashcard-style SVG tiles. Slide 7: “Naming compounds with polyatomic ions.” Student matches formulas like NaNO3 or CaCO3 to names. Slide 8 (check): mixed matching exercise: given 5–7 formulas, select or build the correct name; given simple names, choose formula. This lesson should emphasize chemistry as a readable language.

Lesson 5: Chemical Reactions and Balancing Equations. Learning objective: show that reactions rearrange atoms and that equations represent conserved matter. Slide 1: “Reactants and products.” Basic reaction layout; student clicks labels to see left/right sides. Slide 2: “Conservation of mass.” Animated particle view before and after a reaction to show same atoms are present in new arrangements. Slide 3: “What balancing means.” Show unbalanced H2 + O2 -> H2O and atom counts on each side. Slide 4: “Using coefficients.” Student increments coefficients with plus/minus controls and sees atom counts update live. Slide 5: “Balancing a simple equation.” Guided practice on 2H2 + O2 -> 2H2O. Slide 6: “Common reaction types.” Card carousel for synthesis, decomposition, single replacement, double replacement, combustion; each card shows a simplified pattern plus one example. Slide 7: “Recognize the reaction type.” Student sorts example equations into type categories. Slide 8 (check): balance 2–3 very simple equations with UI assistance and classify one reaction type. The interaction should avoid tedious text input and instead use coefficient steppers or drag tokens.

Lesson 6: The Mole, Molar Mass, and Stoichiometry. Learning objective: introduce chemistry quantities without overwhelming the student; keep this lesson intuitive and visual. Slide 1: “Why chemists need a counting unit.” Compare counting eggs by dozen to particles by mole. Slide 2: “What is a mole?” Visual analogy slide explaining 6.022 x 10^23 conceptually, not mathematically deeply. Show “a mole is a counting unit, like a dozen.” Slide 3: “Molar mass.” Interactive periodic-table lookup where selecting H2O or CO2 sums atomic masses automatically. Slide 4: “Convert grams to moles.” Student enters or drags a mass slider and sees the formula moles = grams / molar mass applied live for one simple example. Slide 5: “Convert moles to particles.” Toggle between moles and particles using a visual scale. Slide 6: “Use coefficients as mole ratios.” Show balanced equation and animate relationship (e.g., 2 moles H2 react with 1 mole O2 to produce 2 moles H2O). Slide 7: “Simple stoichiometry.” Guided example: if you have X moles of H2, how many moles of H2O can form? The user follows 2–3 clickable steps. Slide 8 (check): one grams-to-moles question and one simple mole-ratio question with structured choices. This lesson should prioritize intuitive quantitative reasoning, not hard arithmetic.

Lesson 7: States of Matter, Solutions, and Acids/Bases. Learning objective: connect chemistry to visible physical behavior and common real-world substances. Slide 1: “States of matter.” Particle-motion animation for solid, liquid, gas; student toggles state and observes spacing/movement. Slide 2: “Phase changes.” Interactive temperature slider showing melting, freezing, evaporation, condensation, sublimation as transitions. Slide 3: “Density basics.” Student compares particles packed into equal volumes and predicts which is denser. Slide 4: “What is a solution?” Solute + solvent animation using salt dissolving in water. Slide 5: “Concentration.” Student adjusts amount of solute in same volume to see dilute vs concentrated visually. Slide 6: “Acids and bases.” Simple pH scale from 0–14 with household examples. Clicking an item places it on the scale. Slide 7: “Properties of acids and bases.” Drag examples into acid/base categories with simple cues (sour, slippery, etc.) while avoiding unsafe experimentation language. Slide 8: “Water’s role.” Very brief note that water dissolves many substances and matters throughout chemistry. Slide 9 (check): identify state/phase change, determine whether a solution is more or less concentrated, and place common examples near acidic/neutral/basic ranges on a pH scale. This lesson should end the course by making chemistry feel connected to everyday life.

Slide design system requirements: Each slide should include a lesson title, concept title, concise explanatory copy (preferably 40–100 words), primary SVG interactive area, optional helper hint, and navigation controls. A slide should never introduce more than one conceptual leap. Text should be in plain language, written at a student-friendly reading level. All graphics should be vector/SVG-based or CSS/HTML-based for responsiveness and crisp scaling. Microinteractions should include hover, click, drag, animate-on-change, and state feedback such as green highlight for correct actions and soft red/orange correction for incorrect choices. Check slides should provide instant feedback, a brief explanation, and either “Try again” or “Continue.” Completion of a check is based on reaching the correct final state, not just one click.

Assessment/check design: Checks are embedded, low-stakes, and formative, not exam-like. They should verify immediate understanding of the slide or lesson, not broad cumulative mastery. Supported check types for MVP: classification drag-and-drop, multiple choice card selection, coefficient stepper balance task, matching formula-to-name, shell electron placement, pH scale placement, and short guided numeric choice. Each completed check can record attemptedAt, correct/incorrect, attemptsCount, and final result. If the student fails multiple times, show a hint rather than locking them out.

Progression logic: The course is linear in MVP; students can revisit completed lessons, but lesson 2 unlocks after lesson 1 is completed or optionally all lessons remain visible but recommended order is enforced with messaging. Simpler MVP option: all lessons visible, but Home and Course overview strongly recommend the next lesson. Within a lesson, slides are linear. Next button on content slides is always available after minimal interaction; on check slides, Next activates after a correct submission or after the user chooses to continue after feedback if business rules are relaxed.

Responsiveness requirements: Mobile-first responsive behavior is critical. On mobile, the Home page cards stack vertically; the large featured course card shrinks into a full-width card; lesson cards become a vertical list; slide content becomes a top text block followed by the interactive SVG region; all interactive elements must support tap targets at least ~44px high. On tablet/desktop, lesson slides can use a split layout with visual interaction on top/left and supporting explanation on bottom/right depending on the concept. SVG graphics must scale proportionally. Navigation must remain obvious without causing clutter. No fixed-width layouts.

Accessibility requirements: High-contrast dark theme with readable typography; scalable text; keyboard accessibility for buttons/tabs/stepper interactions; ARIA labels for interactive elements; focus states visible; non-color cues for correctness; alt text or descriptive labels for meaningful diagrams; animations should be subtle and non-essential when reduced motion is enabled.

Functional requirements by module:
Authentication: support Google sign-in and email/password sign-up/login; basic logout; persistent session; error handling for invalid credentials and existing account conflicts.
User profile/progress: store display name, email, sign-in provider, createdAt, lastLoginAt, currentCourseId, currentLessonId, currentSlideId, lesson completion states, course completion percentage, and optionally a simple streak metric.
Home: personalized greeting, progress summary, continue-learning CTA, featured course card, latest lesson/next lesson recommendation.
Courses: list the single course and 7 lesson cards with progress and status indicators.
Course overview: show chemistry course details, 7 lessons, estimated duration, and start/resume button.
Lesson player: render slide content from data, support next/back, support interactive component rendering by slide type, persist slide completion.
Checks: support multiple interaction patterns with local validation rules and persistence.
Completion: show lesson complete state and a next recommended lesson CTA.
Responsive layout: all views support desktop/tablet/mobile.

Content model strategy: Content should be data-driven. Rather than hardcoding every slide in JSX, define a course/lesson/slide schema in Firestore (or a local JSON seed initially mirrored to Firestore) so React can render slides dynamically based on slide type. Slide types may include: intro, explainer, classify, dragSort, clickableDiagram, formulaBuilder, steppers, flashcards, matching, pHPlacement, summary. Each slide record contains title, copy, instructions, interactionConfig, checkConfig if applicable, asset references, and ordering metadata. This makes the MVP extensible if more courses are added later.

Proposed data schema:

users

uid
displayName
email
provider (“google” | “password”)
createdAt
lastLoginAt
photoURL (optional)
currentCourseId
currentLessonId
currentSlideId
totalCompletedLessons
totalCompletedSlides
streakCount (optional/simple MVP)
preferences { reducedMotion, theme }

courses

courseId
slug
title (“Introduction to Chemistry”)
description
audience
level (“Beginner”)
estimatedMinutes
lessonOrder [lessonId]
coverIcon
isPublished
createdAt
updatedAt

lessons

lessonId
courseId
orderIndex
title
shortDescription
estimatedMinutes
icon
isPublished
slideOrder [slideId]
learningObjectives [string]
completionCriteria { requiredSlideCount, requiredCheckCount }

slides

slideId
courseId
lessonId
orderIndex
type
title
subtitle
bodyText
instructions
svgAssetKey / interactionComponentKey
interactionConfig { object specific to slide type }
isCheck
checkConfig { correctAnswer, acceptedAnswers, validationMode, hint, feedbackCorrect, feedbackIncorrect }
learningGoal
nextSlideId
previousSlideId

userCourseProgress

id (uid_courseId)
uid
courseId
percentComplete
completedLessonIds [lessonId]
lastVisitedLessonId
lastVisitedSlideId
startedAt
updatedAt
completedAt (optional)

userLessonProgress

id (uid_lessonId)
uid
courseId
lessonId
percentComplete
completedSlideIds [slideId]
completedCheckIds [slideId]
isCompleted
startedAt
updatedAt
completedAt

userSlideProgress

id (uid_slideId)
uid
courseId
lessonId
slideId
isVisited
isCompleted
attemptsCount
lastAnswer (optional, small)
isCorrect (for checks)
startedAt
updatedAt
completedAt

Optional static assets collection or storage references:
assets

assetKey
type (“svg”, “icon”)
path
description

Interaction component strategy: Because each concept slide must use an interactive graphic/UI component, build a library of reusable React components that map to slide types. Example components: MatterSortBoard, ParticleModelViewer, AtomDiagram, MiniPeriodicTable, ElectronShellBuilder, IonTransferCanvas, BondTypeClassifier, LewisDotBuilder, FormulaNameMatcher, EquationBalancer, MoleConversionStepper, StateParticlesAnimator, SolutionConcentrationMixer, PHScalePlacement. These components should accept JSON-configured props from the slide record, making it possible to reuse them across lessons without hardcoding every lesson separately.

Tech stack: React for UI, Vite for fast bootstrapping and dev experience, React Router for routing, Firebase for backend services, modular CSS or Tailwind/CSS Modules depending implementation preference (if staying very minimalistic, Tailwind is fine, but the PRD requirement only demands React components, so styling can remain component-based), and SVG for interactive visuals. Firebase services to explicitly use: Firebase Authentication for Google sign-in and email/password auth; Cloud Firestore for structured storage of courses, lessons, slides, and user progress; Firebase Hosting (or Firebase App Hosting if preferred) for deployment; Firebase Storage for hosting reusable SVG/icon assets if they are not bundled directly; Firebase Analytics for basic engagement tracking such as lesson starts/completions, though this is optional but recommended even in MVP. Cloud Functions are not required for MVP but may be introduced later for derived metrics, content publishing workflows, or analytics aggregation if needed. If the team wants the leanest possible MVP, use Auth + Firestore + Hosting first, and add Storage only if SVG assets are not bundled.

Routing structure:
/

landing page
/login
email login/signup and Google auth
/app
authenticated shell
/app/home
portal home
/app/courses
courses list
/app/courses/:courseId
course overview
/app/courses/:courseId/lessons/:lessonId
lesson player
Optional: /app/profile minimal placeholder if needed later, but not required in MVP.

State management: Lightweight app state can be handled with React Context + hooks for auth state and progress state. Avoid heavy global state libraries for MVP unless needed. Firestore listeners or fetch-on-load patterns can hydrate the authenticated user’s progress. Lesson slide state (temporary interaction state before submit) should remain local to the slide component.

Course content authoring approach: Seed the chemistry course content as structured JSON or Firestore seed docs. Every lesson should explicitly contain the concept slides outlined above. The textual explanation per slide should be kept concise, likely 1–2 short paragraphs max. The value of the app is not the volume of text but the clarity of the interaction. Content tone should be supportive, beginner-friendly, and confidence-building. Jargon should be introduced only when immediately visualized.

UI implementation specifics from screenshots: Use a dark charcoal/near-black background; rounded rectangular cards with subtle borders; large bold white headings; medium-gray body text; bright accent colors (yellow, green, purple, blue, orange) tied to icons and actions; prominent “Start”/“Continue” CTA buttons at the bottom of course cards; featured course panel with large icon and short status text; compact icon row for learning categories or lessons if useful; progress widgets reminiscent of streak or XP cards, but simplified for chemistry MVP. The Home portal can mimic the screenshot’s composition: one side showing greeting/progress widgets and another side showing the current or recommended course card. The Courses tab should borrow from the third screenshot’s “Learning Paths” layout, with a main course description and a row/list of lesson cards beneath. All UI should be implemented as original components, not direct copies of Brilliant assets or branding.

Content-to-UI mapping for course overview: The “Introduction to Chemistry” course page should list the 7 lesson titles in order: 1) Matter, Atoms, and the Periodic Table, 2) Atomic Structure and Ions, 3) Chemical Bonding, 4) Chemical Formulas and Naming Compounds, 5) Chemical Reactions and Balancing Equations, 6) The Mole, Molar Mass, and Stoichiometry, 7) States of Matter, Solutions, and Acids/Bases. Each lesson card should show a short one-sentence outcome and a visual icon. Example: atom icon for Lesson 1, shell/electron icon for Lesson 2, bond icon for Lesson 3, formula tile icon for Lesson 4, reaction arrows icon for Lesson 5, scale/counting icon for Lesson 6, beaker/pH icon for Lesson 7.

Persistence requirements: when a user enters a lesson, save startedAt if first visit; after the user completes a slide or check, persist slide progress; update lesson percentage and course percentage incrementally; Home page should show resume state from Firestore; if user refreshes or switches device, the app should reopen to the latest lesson/slide state. Progress writes should be efficient and debounced where possible.

Analytics/telemetry for MVP: Track sign-up method, lesson started, lesson completed, slide completed, check completed, most retried slide, and course completion. These metrics are useful to see where students get stuck, especially in the more abstract lessons such as stoichiometry or bonding.

Error/empty states: If no user progress exists, Home should present “Start your first chemistry lesson.” If Firestore content fails to load, show a graceful retry card. If a lesson or slide is missing, redirect back to the course overview. Login errors should be human-readable and beginner-friendly.

Testing requirements: verify auth flow for both Google and email/password; verify course loads correctly from seeded data; verify every slide type renders on desktop/tablet/mobile; verify checks validate correctly; verify progress persists accurately; verify dark UI remains readable and accessible; verify interactions are touch-friendly on smaller screens. The core quality bar is not just correctness, but that the interactions feel smooth and understandable to a 14–16-year-old first-time chemistry learner.

MVP deliverables: responsive landing page; working authentication; authenticated portal with Home and Courses tabs; one course, “Introduction to Chemistry”; all 7 lessons available; each lesson containing the concept slides described above; interactive SVG-driven visuals on each slide; check interactions on appropriate slides; persistent progress; polished Brilliant-inspired dark UI; deployment via Firebase Hosting/App Hosting. If time allows, add a light streak/progress widget and a lesson completion celebration state to increase motivation, but these are secondary to the learning flow.

Implementation priority order: (1) auth shell and routing, (2) static portal UI, (3) course/lesson data model, (4) lesson player framework, (5) foundational reusable interaction components, (6) content population for all 7 lessons, (7) Firestore progress persistence, (8) mobile responsiveness and polish, (9) analytics/events. This order ensures the team gets the full end-to-end learning experience working before over-optimizing styling or edge features.

This MVP should feel like a focused “visual chemistry starter path” inside a Brilliant-inspired environment: polished, simple, highly interactive, and pedagogically cohesive rather than encyclopedic.