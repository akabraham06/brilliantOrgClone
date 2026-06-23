import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './ProtectedRoute.module.css';

/**
 * Guards authenticated routes. While auth state is resolving it shows a
 * lightweight loader; unauthenticated users are redirected to /login while
 * preserving the intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loader} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
