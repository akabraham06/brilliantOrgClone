import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config.js';
import { COURSE_ID } from '../data/chemistryCourse.js';

/**
 * Client-side reads for course content from Firestore. Lessons/slides are
 * fetched with a simple equality filter and sorted client-side to avoid
 * needing composite indexes.
 */

export async function fetchCourse(courseId = COURSE_ID) {
  if (!db) throw new Error('Firestore is not configured.');
  const snap = await getDoc(doc(db, 'courses', courseId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchLessons(courseId = COURSE_ID) {
  if (!db) throw new Error('Firestore is not configured.');
  const q = query(collection(db, 'lessons'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function fetchLessonSlides(lessonId) {
  if (!db) throw new Error('Firestore is not configured.');
  const q = query(collection(db, 'slides'), where('lessonId', '==', lessonId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function fetchCourseWithLessons(courseId = COURSE_ID) {
  const [course, lessons] = await Promise.all([
    fetchCourse(courseId),
    fetchLessons(courseId),
  ]);
  return { course, lessons };
}
