import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { ContentProvider } from '../context/ContentContext.jsx';
import { ProgressProvider } from '../context/ProgressContext.jsx';
import { EconomyProvider } from '../context/EconomyContext.jsx';
import { DailyQuestsProvider } from '../context/DailyQuestsContext.jsx';
import { TutorProvider } from '../context/TutorContext.jsx';
import { PreferencesProvider } from '../context/PreferencesContext.jsx';
import TutorDot from '../components/tutor/TutorDot.jsx';
import TutorAnchoredExplain from '../components/tutor/TutorAnchoredExplain.jsx';
import AvatarCompanion from '../components/avatar/AvatarCompanion.jsx';
import styles from './AppLayout.module.css';

/** Authenticated portal shell: persistent navbar + routed page content. */
export default function AppLayout() {
  return (
    <ContentProvider>
      <ProgressProvider>
        <EconomyProvider>
          <DailyQuestsProvider>
            <TutorProvider>
              <PreferencesProvider>
                <div className={styles.shell}>
                  <Navbar />
                  <main className={styles.content}>
                    <Outlet />
                  </main>
                </div>
                {/* Global AI tutor (bottom-left) — self-gates on aiEnabled. */}
                <TutorDot />
                {/* Anchored deep-explanation that flies to the chosen answer after a
                    fully-completed assessment — self-gates on aiEnabled. */}
                <TutorAnchoredExplain />
                {/* Persistent avatar companion (bottom-right) — never overlaps the tutor. */}
                <AvatarCompanion />
              </PreferencesProvider>
            </TutorProvider>
          </DailyQuestsProvider>
        </EconomyProvider>
      </ProgressProvider>
    </ContentProvider>
  );
}
