import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseEnabled } from '../firebase/config.js';
import { upsertUserProfile } from '../firebase/users.js';

const AuthContext = createContext(null);

/**
 * Provides the authenticated Firebase user and an initial loading flag to the
 * app. On sign-in it mirrors the user into Firestore (users/{uid}).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        try {
          await upsertUserProfile(nextUser);
        } catch (error) {
          console.error('[auth] Failed to upsert user profile:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = { user, loading, firebaseEnabled };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
