import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { course, lessons, slides } from '../src/data/chemistryCourse.js';

/**
 * Seeds the Introduction to Chemistry course into Firestore.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json npm run seed
 *
 * The Admin SDK bypasses Firestore security rules, so content writes succeed
 * even though client writes to courses/lessons/slides are disallowed.
 */
const KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.SA_KEY;

if (!KEY_PATH) {
  console.error(
    'Missing service account. Set GOOGLE_APPLICATION_CREDENTIALS to the path ' +
      'of your Firebase Admin SDK JSON key, then re-run `npm run seed`.',
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  const now = new Date();

  // Purge stale lessons/slides for this course first. Slide and lesson doc IDs
  // are positional (lesson-N, lesson-N-sM), so when a lesson shrinks or is
  // reordered, set()-only seeding leaves orphan docs that the client still
  // reads (and appends out of order). Delete anything for this course that is
  // not in the freshly built set, then write the new content.
  const keepLessonIds = new Set(lessons.map((l) => l.lessonId));
  const keepSlideIds = new Set(slides.map((s) => s.slideId));

  const purge = db.batch();
  let staleLessons = 0;
  let staleSlides = 0;

  const existingLessons = await db
    .collection('lessons')
    .where('courseId', '==', course.courseId)
    .get();
  existingLessons.forEach((d) => {
    if (!keepLessonIds.has(d.id)) {
      purge.delete(d.ref);
      staleLessons += 1;
    }
  });

  const existingSlides = await db
    .collection('slides')
    .where('courseId', '==', course.courseId)
    .get();
  existingSlides.forEach((d) => {
    if (!keepSlideIds.has(d.id)) {
      purge.delete(d.ref);
      staleSlides += 1;
    }
  });

  if (staleLessons || staleSlides) await purge.commit();

  const batch = db.batch();

  batch.set(db.collection('courses').doc(course.courseId), {
    ...course,
    createdAt: now,
    updatedAt: now,
  });

  lessons.forEach((lesson) => {
    batch.set(db.collection('lessons').doc(lesson.lessonId), lesson);
  });

  slides.forEach((slide) => {
    batch.set(db.collection('slides').doc(slide.slideId), slide);
  });

  await batch.commit();
  console.log(
    `Seeded: 1 course, ${lessons.length} lessons, ${slides.length} slides ` +
      `into project ${serviceAccount.project_id}. ` +
      `Purged ${staleLessons} stale lessons, ${staleSlides} stale slides.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
