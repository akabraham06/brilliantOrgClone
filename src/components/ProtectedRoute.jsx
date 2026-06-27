import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AvatarLoader from './avatar/AvatarLoader.jsx';

/**
 * Guards authenticated routes. While auth state is resolving it shows a
 * lightweight loader; unauthenticated users are redirected to /login while
 * preserving the intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AvatarLoader variant="screen" label="Signing you in" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
