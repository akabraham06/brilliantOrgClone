import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';

/**
 * Persistent learner-memory IO.
 *
 * Like the economy map, the tutor's long-term memory lives on the existing
 * `users/{uid}` document under a `learnerMemory` map. We read/write it with
 * merge:true so it never clobbers the economy map (or anything else) on the same
 * doc — the two writers touch disjoint top-level keys. Owner-only access plus
 * light shape validation is enforced by firestore.rules.
 *
 * Mirrors the read/write shape of src/firebase/economy.js.
 */
export async function fetchMemory(uid) {
  if (!db) throw new Error('Firestore is not configured.');
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data()?.learnerMemory || null : null;
}

export async function saveMemory(uid, memory) {
  if (!db || !uid) return;
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    { learnerMemory: { ...memory, updatedAt: serverTimestamp() } },
    { merge: true },
  );
}
