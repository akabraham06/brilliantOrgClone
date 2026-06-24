import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { logOut } from '../firebase/auth.js';
import BrilliantLogo from './BrilliantLogo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import styles from './Navbar.module.css';

const TABS = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/courses', label: 'Courses' },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        <NavLink to="/app/home" className={styles.brand} aria-label="Brilliant home">
          <BrilliantLogo size={28} wordmarkColor="var(--color-text)" />
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

        <div className={styles.right}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
      </div>
    </header>
  );
}
