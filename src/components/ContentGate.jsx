import { useContent } from '../context/ContentContext.jsx';
import AvatarLoader from './avatar/AvatarLoader.jsx';
import styles from './ContentGate.module.css';

/**
 * Renders children only when course content has loaded. Otherwise shows a
 * loader, a graceful retry card on error, or an empty state when unseeded.
 */
export default function ContentGate({ children }) {
  const { course, lessons, loading, error, reload } = useContent();

  if (loading) {
    return <AvatarLoader variant="block" label="Loading your course" />;
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>We couldn&rsquo;t load your course</h2>
        <p className={styles.text}>
          Something went wrong reaching the server. Check your connection and
          try again.
        </p>
        <button type="button" className={styles.retry} onClick={reload}>
          Try again
        </button>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>No course content yet</h2>
        <p className={styles.text}>
          The course hasn&rsquo;t been published. Run the content seed to
          populate it, then refresh.
        </p>
        <button type="button" className={styles.retry} onClick={reload}>
          Refresh
        </button>
      </div>
    );
  }

  return children;
}
