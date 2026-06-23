import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from './config.js';

function assertAuth() {
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Add credentials to .env to enable authentication.',
    );
  }
}

export async function signInWithGoogle() {
  assertAuth();
  const { user } = await signInWithPopup(auth, googleProvider);
  return user;
}

export async function signUpWithEmail({ email, password, displayName }) {
  assertAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  return user;
}

export async function logInWithEmail({ email, password }) {
  assertAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logOut() {
  assertAuth();
  await signOut(auth);
}

/**
 * Maps Firebase Auth error codes to beginner-friendly, human-readable copy.
 * The persona is a first-time learner, so messages avoid jargon.
 */
export function authErrorMessage(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn\u2019t look right. Please check and try again.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/weak-password':
      return 'Your password is too short. Use at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try logging in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The sign-in window was closed before finishing. Please try again.';
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
