import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrilliantLogo from '../components/BrilliantLogo.jsx';
import LandingMolecule from '../components/LandingMolecule.jsx';
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

          <div className={styles.visual}>
            <div className={styles.visualCard}>
              <LandingMolecule />
            </div>
            <p className={styles.visualCaption}>
              Drag the hydrogens or use the sliders to reshape the molecule.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
