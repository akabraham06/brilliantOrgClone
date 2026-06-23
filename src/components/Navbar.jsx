import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logOut } from '../firebase/auth.js';
import styles from './Navbar.module.css';

const TABS = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/courses', label: 'Courses' },
];

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Learner';
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[navbar] logout failed:', error);
    }
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/app/home" className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true">
            Ch
          </span>
          <span className={styles.brandName}>Chemistry</span>
        </NavLink>

        <nav className={styles.tabs} aria-label="Primary">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.account}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            <span className={styles.avatar}>{initial}</span>
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu">
              <div className={styles.menuName}>{displayName}</div>
              {user?.email && <div className={styles.menuEmail}>{user.email}</div>}
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleLogout}
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
