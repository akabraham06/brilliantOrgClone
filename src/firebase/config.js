import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration is read from Vite environment variables so that no
 * secrets are committed to source control. Copy `.env.example` to `.env` and
 * fill in the values from your Firebase project's web app config.
 *
 * Required: Firebase Authentication (Google + Email/Password) and Cloud
 * Firestore must be enabled in the Firebase console for this project.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

if (!isConfigured) {
  console.warn(
    '[firebase] Missing config. Copy .env.example to .env and add your ' +
      'Firebase web app credentials. Auth and Firestore will not work until ' +
      'this is set.',
  );
}

export const firebaseEnabled = isConfigured;

export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
