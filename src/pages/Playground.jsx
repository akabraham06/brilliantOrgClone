import { useCallback, useEffect, useState } from 'react';
import { aiEnabled } from '../firebase/ai.js';
import { isAllowedPlaygroundKey, PLAYGROUND_KEYS } from '../ai/playgroundAllowlist.js';
import ContentGate from '../components/ContentGate.jsx';
import StagePanel from '../components/playground/StagePanel.jsx';
import GuidePanel from '../components/playground/GuidePanel.jsx';
import styles from './Playground.module.css';

const STAGE_KEY = 'lab.stageKey';

function loadStoredKey() {
  try {
    const stored = window.sessionStorage.getItem(STAGE_KEY);
    if (stored && isAllowedPlaygroundKey(stored)) return stored;
  } catch {
    /* sessionStorage unavailable — fall through to default. */
  }
  return PLAYGROUND_KEYS[0];
}

/**
 * The AI Lab: a course-scoped, two-pane exploratory playground. The stage hosts
 * one manipulable interactive the student plays with freely; the AI guide
 * suggests experiments, answers questions, and can swap the stage. When AI is
 * off the page degrades to a fully usable manual interactive sandbox.
 */
export default function Playground() {
  return (
    <ContentGate>
      <PlaygroundContent />
    </ContentGate>
  );
}

function PlaygroundContent() {
  const [currentKey, setCurrentKey] = useState(loadStoredKey);
  // Latest debounced interaction signal from the stage, handed to the guide so
  // it can proactively react to what the learner just did.
  const [interactionEvent, setInteractionEvent] = useState(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STAGE_KEY, currentKey);
    } catch {
      /* non-fatal */
    }
  }, [currentKey]);

  const handlePick = useCallback((key) => {
    if (isAllowedPlaygroundKey(key)) setCurrentKey(key);
  }, []);

  const handleInteract = useCallback((event) => {
    setInteractionEvent(event);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>AI Lab</span>
        <h1 className={styles.heading}>Exploratory Playground</h1>
        <p className={styles.subhead}>
          A hands-on sandbox for introductory chemistry. Tinker with a real interactive
          {aiEnabled ? ' while your AI guide suggests experiments and answers questions.' : '.'}
        </p>
      </header>

      <div className={aiEnabled ? styles.layout : styles.layoutSolo}>
        <StagePanel
          currentKey={currentKey}
          onPick={handlePick}
          onInteract={aiEnabled ? handleInteract : undefined}
        />
        {aiEnabled ? (
          <aside className={styles.guide}>
            <GuidePanel
              currentKey={currentKey}
              onLoadInteractive={handlePick}
              interactionEvent={interactionEvent}
            />
          </aside>
        ) : (
          <p className={styles.aiOff} role="note">
            The AI guide is off. You can still freely explore any interactive using the picker above.
          </p>
        )}
      </div>
    </div>
  );
}
