import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrilliantLogo from '../components/BrilliantLogo.jsx';
import {
  signInWithGoogle,
  signUpWithEmail,
  logInWithEmail,
  authErrorMessage,
} from '../firebase/auth.js';
import styles from './Login.module.css';

export default function Login() {
  const { user, loading, firebaseEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/app/home';

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail({ email, password, displayName });
      } else {
        await logInWithEmail({ email, password });
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <BrilliantLogo size={28} wordmarkColor="var(--color-text)" />
        </Link>

        <h1 className={styles.title}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className={styles.subtitle}>
          {mode === 'signup'
            ? 'Start your visual chemistry journey.'
            : 'Log in to continue learning.'}
        </p>

        {!firebaseEnabled && (
          <p className={styles.warning} role="alert">
            Firebase is not configured. Add credentials to .env to enable sign-in.
          </p>
        )}

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogle}
          disabled={busy || !firebaseEnabled}
        >
          Continue with Google
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <form className={styles.form} onSubmit={handleEmailSubmit}>
          {mode === 'signup' && (
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alan"
                autoComplete="name"
              />
            </label>
          )}
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={busy || !firebaseEnabled}
          >
            {busy
              ? 'Please wait\u2026'
              : mode === 'signup'
                ? 'Sign up with Email'
                : 'Log in'}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className={styles.switchButton}
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
          >
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}
