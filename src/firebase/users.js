import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config.js';

/** Normalizes the Firebase provider id into the PRD's "google" | "password" value. */
export function providerFromUser(user) {
  const providerId = user?.providerData?.[0]?.providerId;
  if (providerId === 'google.com') return 'google';
  if (providerId === 'password') return 'password';
  return providerId || 'unknown';
}

/**
 * Creates or updates the users/{uid} document. On first sign-in the full
 * profile (with progress pointers) is created; on subsequent sign-ins only
 * lastLoginAt and basic profile fields are refreshed.
 */
export async function upsertUserProfile(user) {
  if (!db || !user) return null;

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  const baseProfile = {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    provider: providerFromUser(user),
    lastLoginAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      ...baseProfile,
      createdAt: serverTimestamp(),
      currentCourseId: null,
      currentLessonId: null,
      currentSlideId: null,
      totalCompletedLessons: 0,
      totalCompletedSlides: 0,
      streakCount: 0,
      preferences: { reducedMotion: false, theme: 'dark' },
    });
  } else {
    await setDoc(ref, baseProfile, { merge: true });
  }

  return ref;
}
