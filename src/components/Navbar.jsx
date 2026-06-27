import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useEconomy } from '../context/EconomyContext.jsx';
import { logOut } from '../firebase/auth.js';
import BrilliantLogo from './BrilliantLogo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Avatar from './avatar/Avatar.jsx';
import WalletChip from './economy/WalletChip.jsx';
import PreferencesMenu from './preferences/PreferencesMenu.jsx';
import styles from './Navbar.module.css';

const TABS = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/courses', label: 'Courses' },
  { to: '/app/heat-check', label: 'Heat Check' },
  { to: '/app/store', label: 'Store' },
  { to: '/app/lab', label: 'Lab' },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { economy } = useEconomy();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navMenuRef = useRef(null);
  const drawerId = useId();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  useEffect(() => {
    if (!navOpen) return undefined;
    function onDocPointer(e) {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target)) {
        setNavOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

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

        <div className={styles.navMenu} ref={navMenuRef}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setNavOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={navOpen}
            aria-controls={drawerId}
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className={styles.menuToggleGlyph} aria-hidden="true">
              {navOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </span>
          </button>

          {navOpen && (
            <>
              <div
                className={styles.navBackdrop}
                onClick={() => setNavOpen(false)}
                aria-hidden="true"
              />
              <nav id={drawerId} className={styles.navDrawer} aria-label="Primary">
                {TABS.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    onClick={() => setNavOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.drawerLink} ${styles.drawerLinkActive}`
                        : styles.drawerLink
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}

                {/* Settings live on the top bar at desktop widths; on phones they
                    move here so the top bar stays uncluttered. */}
                <div className={styles.drawerSettings}>
                  <p className={styles.drawerSectionLabel}>Settings</p>
                  <div className={styles.drawerSettingRow}>
                    <span className={styles.drawerSettingLabel}>Theme</span>
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                  </div>
                  <div className={styles.drawerSettingRow}>
                    <span className={styles.drawerSettingLabel}>Reading &amp; tutor</span>
                    <PreferencesMenu />
                  </div>
                </div>
              </nav>
            </>
          )}
        </div>

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
          <WalletChip variant="compact" />
          {/* Hidden on phones (<=760px) where these move into the drawer. */}
          <div className={styles.desktopControls}>
            <PreferencesMenu />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <div className={styles.account}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            <span className={styles.avatar}>
              <Avatar equipped={economy.equipped} size={38} crop="bust" />
            </span>
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
