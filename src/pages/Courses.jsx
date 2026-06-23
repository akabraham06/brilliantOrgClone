import { Link } from 'react-router-dom';
import styles from './Placeholder.module.css';

export default function Courses() {
  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Courses</p>
      <h1 className={styles.heading}>Learning path</h1>
      <p className={styles.note}>
        The &ldquo;Introduction to Chemistry&rdquo; course card and its seven
        lesson cards arrive in Phases 2&ndash;3.
      </p>
      <div className={styles.card}>
        <Link to="/app/courses/intro-to-chemistry" className={styles.link}>
          Introduction to Chemistry &rarr;
        </Link>
      </div>
    </div>
  );
}
