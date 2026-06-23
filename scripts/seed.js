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
      `into project ${serviceAccount.project_id}.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
