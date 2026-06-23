import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Placeholder.module.css';

export default function Home() {
  const { user } = useAuth();
  const name = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Home</p>
      <h1 className={styles.heading}>Welcome, {name}</h1>
      <p className={styles.note}>
        Your personalized progress, streak, and &ldquo;continue learning&rdquo;
        cards arrive in Phase 2. For now, head to your course.
      </p>
      <div className={styles.card}>
        <Link to="/app/courses" className={styles.link}>
          Browse courses &rarr;
        </Link>
      </div>
    </div>
  );
}
