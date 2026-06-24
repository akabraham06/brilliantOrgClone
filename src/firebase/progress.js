import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';

/**
 * Per-user progress is stored in a single `userCourseProgress/{uid}_{courseId}`
 * document with a nested `lessons` map. One doc keeps reads/writes atomic and
 * index-free for the MVP while still satisfying the owner-only security rules.
 */
export function progressDocId(uid, courseId) {
  return `${uid}_${courseId}`;
}

export async function fetchProgress(uid, courseId) {
  if (!db) throw new Error('Firestore is not configured.');
  const snap = await getDoc(doc(db, 'userCourseProgress', progressDocId(uid, courseId)));
  return snap.exists() ? snap.data() : null;
}

export async function saveProgress(uid, courseId, data) {
  if (!db) return;
  const ref = doc(db, 'userCourseProgress', progressDocId(uid, courseId));
  await setDoc(
    ref,
    { ...data, uid, courseId, lastVisitedAt: serverTimestamp() },
    { merge: true },
  );
}
