import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import styles from './AppLayout.module.css';

/** Authenticated portal shell: persistent navbar + routed page content. */
export default function AppLayout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
