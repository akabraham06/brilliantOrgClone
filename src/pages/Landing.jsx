import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrilliantLogo from '../components/BrilliantLogo.jsx';
import styles from './Landing.module.css';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/app/home', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" aria-label="Brilliant home">
          <BrilliantLogo size={30} />
        </Link>
        <Link to="/login" className={styles.signIn}>
          Sign in
        </Link>
      </header>

      <main className={styles.heroPanel}>
        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              A world-class
              <br />
              chemistry tutor
              <br />
              for every home
            </h1>
            <p className={styles.subtitle}>
              Your personal guide to chemistry. Learn visually and
              interactively, building intuition one idea at a time.
            </p>
            <div className={styles.actions}>
              <Link to="/login" className={styles.primaryCta}>
                I&rsquo;m a learner
              </Link>
              <Link to="/login" className={styles.secondaryCta}>
                Sign up with email
              </Link>
            </div>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.visualCard}>
              <p className={styles.visualFormula}>H&#8322;O</p>
              <svg viewBox="0 0 240 200" className={styles.visualSvg}>
                {/* bonds */}
                <line x1="120" y1="110" x2="64" y2="150" className={styles.bond} />
                <line x1="120" y1="110" x2="176" y2="150" className={styles.bond} />
                {/* oxygen */}
                <circle cx="120" cy="110" r="34" className={styles.atomO} />
                <text x="120" y="118" className={styles.atomLabel}>
                  O
                </text>
                {/* hydrogens */}
                <circle cx="64" cy="150" r="22" className={styles.atomH} />
                <text x="64" y="156" className={styles.atomLabelSm}>
                  H
                </text>
                <circle cx="176" cy="150" r="22" className={styles.atomH} />
                <text x="176" y="156" className={styles.atomLabelSm}>
                  H
                </text>
              </svg>
              <span className={styles.cursor} aria-hidden="true">
                &#9650;
              </span>
            </div>
            <p className={styles.visualCaption}>Try interacting with it.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
