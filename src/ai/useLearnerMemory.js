import { useSyncExternalStore, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  subscribe,
  getMemoryState,
  ensureLoaded,
  recordMisconception,
  recordReview,
  seedReviewTopics,
  maybeRefreshSummary,
} from './memoryStore.js';
import { EMPTY_MEMORY } from './memoryModel.js';

/**
 * Subscribes a component to the singleton learner-memory store and ensures it is
 * loaded for the current user. Returns the live memory blob plus the store's
 * mutation helpers. Provider-free by design so the value is shared identically
 * across every consumer (tutor profile, recommender, practice, misconception UI).
 */
export function useLearnerMemory() {
  const { user } = useAuth();
  const uid = user?.uid || null;

  useEffect(() => {
    ensureLoaded(uid);
  }, [uid]);

  const snapshot = useSyncExternalStore(subscribe, getMemoryState, getMemoryState);
  const memory = uid ? snapshot.memory : EMPTY_MEMORY;
  const loaded = uid ? snapshot.loaded && snapshot.uid === uid : true;

  return useMemo(
    () => ({
      memory,
      loaded,
      recordMisconception,
      recordReview,
      seedReviewTopics,
      maybeRefreshSummary,
    }),
    [memory, loaded],
  );
}
