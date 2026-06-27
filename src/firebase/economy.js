import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';

/**
 * The account-level economy lives on the existing `users/{uid}` document under an
 * `economy` map (cross-course, NOT the per-course progress doc). We read/write it
 * with merge:true so we never clobber the rest of the user profile.
 *
 * Mirrors the read/write shape of src/firebase/progress.js. Owner-only access is
 * enforced by firestore.rules (with light field validation on the economy map).
 */
export async function fetchEconomy(uid) {
  if (!db) throw new Error('Firestore is not configured.');
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data()?.economy || null : null;
}

export async function saveEconomy(uid, economy) {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    { economy: { ...economy, updatedAt: serverTimestamp() } },
    { merge: true },
  );
}
