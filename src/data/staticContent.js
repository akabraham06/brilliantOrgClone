/**
 * Static course content used to build the portal UI in Phase 2.
 *
 * In Phase 3 this is replaced/expanded by a Firestore-backed schema and seed;
 * in Phase 7 the mock progress object is replaced by real per-user progress
 * from Firestore. Components read from these shapes so the swap is seamless.
 */

export const course = {
  courseId: 'intro-to-chemistry',
  slug: 'intro-to-chemistry',
  title: 'Introduction to Chemistry',
  description:
    'A visual, interactive starter path. Build intuition for atoms, bonding, reactions, and everyday chemistry, one idea at a time.',
  audience: 'Beginner high school chemistry',
  level: 'Beginner',
  estimatedMinutes: 95,
  coverIcon: 'beaker',
};

export const lessons = [
  {
    lessonId: 'lesson-1',
    orderIndex: 1,
    title: 'Matter, Atoms, and the Periodic Table',
    shortDescription:
      'See what chemistry studies and meet atoms, elements, and the periodic table.',
    estimatedMinutes: 14,
    icon: 'atom',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-2',
    orderIndex: 2,
    title: 'Atomic Structure and Ions',
    shortDescription:
      'Discover what makes each element unique and how atoms become ions.',
    estimatedMinutes: 14,
    icon: 'shells',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-3',
    orderIndex: 3,
    title: 'Chemical Bonding',
    shortDescription:
      'Explore why atoms bond and how ionic, covalent, and metallic bonds differ.',
    estimatedMinutes: 14,
    icon: 'bond',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-4',
    orderIndex: 4,
    title: 'Chemical Formulas and Naming Compounds',
    shortDescription: 'Learn to read formulas and decode basic chemical names.',
    estimatedMinutes: 14,
    icon: 'formula',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-5',
    orderIndex: 5,
    title: 'Chemical Reactions and Balancing Equations',
    shortDescription:
      'Watch reactions rearrange atoms and balance simple equations.',
    estimatedMinutes: 14,
    icon: 'reaction',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-6',
    orderIndex: 6,
    title: 'The Mole, Molar Mass, and Stoichiometry',
    shortDescription:
      'Build intuition for counting particles without heavy arithmetic.',
    estimatedMinutes: 13,
    icon: 'mole',
    slideCount: 8,
  },
  {
    lessonId: 'lesson-7',
    orderIndex: 7,
    title: 'States of Matter, Solutions, and Acids/Bases',
    shortDescription:
      'Connect chemistry to everyday substances, solutions, and the pH scale.',
    estimatedMinutes: 12,
    icon: 'beaker',
    slideCount: 9,
  },
];

/**
 * Mock progress for showcasing the portal widgets in Phase 2.
 * Replaced by Firestore userCourseProgress/userLessonProgress in Phase 7.
 */
export const mockProgress = {
  completedLessonIds: ['lesson-1'],
  currentLessonId: 'lesson-2',
  currentSlideIndex: 3,
  streakCount: 3,
};

export function getLessonStatus(lessonId, progress = mockProgress) {
  if (progress.completedLessonIds.includes(lessonId)) return 'completed';
  if (progress.currentLessonId === lessonId) return 'in-progress';
  return 'not-started';
}

export function getCoursePercent(progress = mockProgress) {
  return Math.round((progress.completedLessonIds.length / lessons.length) * 100);
}

export function getNextLesson(progress = mockProgress) {
  return (
    lessons.find((l) => l.lessonId === progress.currentLessonId) ||
    lessons.find((l) => !progress.completedLessonIds.includes(l.lessonId)) ||
    lessons[0]
  );
}
