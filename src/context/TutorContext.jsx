import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { aiEnabled } from '../firebase/ai.js';
import { HINT_MAX_LEVEL } from '../ai/tutorPrompt.js';
import { useProgress } from './ProgressContext.jsx';

const TutorContext = createContext(null);

const DEFAULT_HELP_AFTER = 2;
// Consecutive failed attempts on the SAME interactive check before the tutor
// auto-opens with a single slight hint (the "struggling" threshold).
const STRUGGLE_AFTER = 2;
const DEFAULT_STRUGGLE_SEED =
  'I\u2019m stuck on this \u2014 can you give me one small hint for the next step?';

/**
 * Holds the tutor's live "grounding context" (the active slide when in a lesson,
 * otherwise course-level), the most recent wrong-answer event, the open/seed
 * state of the chat panel, and the proactive auto-help lifecycle (a gentle,
 * dismissible offer that escalates to an auto-open after repeated wrong answers).
 * The provider is always mounted in the authenticated shell; the tutor UI itself
 * self-gates on `aiEnabled`, so this has no visible effect when AI is disabled.
 */
export function TutorProvider({ children }) {
  // TutorProvider is mounted under ProgressProvider (see AppLayout), so it can
  // record genuine hint-ladder advances against the active slide's lesson —
  // which drives the no-hint "clean run" bonus.
  const { recordHintUsed } = useProgress();
  const [groundingSlide, setGroundingSlide] = useState(null);
  // Mirror of the active grounding slide so the stable `advanceHint` callback
  // can read its lessonId without being recreated on every slide change.
  const groundingSlideRef = useRef(null);
  groundingSlideRef.current = groundingSlide;
  const recordHintUsedRef = useRef(recordHintUsed);
  recordHintUsedRef.current = recordHintUsed;
  const [wrongEvent, setWrongEvent] = useState(null);
  const [open, setOpen] = useState(false);
  // Mirror of `open` so callbacks can read the live value without re-creating
  // (used to avoid auto-opening over an already-open chat).
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  // A one-shot prompt another component can hand to the panel when it opens
  // (e.g. a check's "Ask the tutor about my mistake"). `hint` marks it as a
  // "struggling" auto-open so the panel asks the model for a single slight hint.
  const [seedPrompt, setSeedPrompt] = useState(null);
  const consumedSeed = useRef(false);

  // Proactive auto-help: a pending, dismissible offer { slideId, prompt }.
  const [helpOffer, setHelpOffer] = useState(null);

  // Anchored deep-explanation: after a learner FULLY attempts an assessment, the
  // tutor glides over next to their chosen answer and opens a tailored, in-depth
  // explanation. Shape: { id, anchorEl, context } (anchorEl is the chosen-answer
  // DOM node the card flies to and stays beside). Fires at most once per unique
  // `key` (typically slideId + attempt #) so re-renders never re-trigger it.
  const [anchoredExplain, setAnchoredExplain] = useState(null);
  const explainedKeysRef = useRef(new Set());
  // Per-check wrong streak + escalation stage, tracked by slideId so it survives
  // the submit -> "Try again" -> submit loop without re-rendering on each attempt.
  const streakRef = useRef(new Map());
  const stageRef = useRef(new Map()); // slideId -> 'none' | 'offered' | 'done'
  const suppressedRef = useRef(new Set()); // slideIds the learner dismissed

  // "Struggling" detection for interactive (build/drag/placement) checks that
  // verify with a Check button: a per-slide consecutive failed-attempt streak,
  // plus the set of slides whose one-time slight-hint auto-open already fired.
  const struggleStreakRef = useRef(new Map());
  const struggleFiredRef = useRef(new Set());

  // Progressive hint ladder: the learner's current hint depth (0 = none yet,
  // 1..HINT_MAX_LEVEL) tracked PER slide so it survives re-renders and the
  // submit -> "Try again" loop. `hintLevel` mirrors the ACTIVE slide's value so
  // the panel can react (e.g. show "Hint 2 of 4" / a "Show another hint"
  // affordance). Resets to 0 on a correct answer or when the slide changes.
  const hintLevelRef = useRef(new Map());
  const [hintLevel, setHintLevel] = useState(0);
  const activeSlideIdRef = useRef(null);

  const reportWrongAnswer = useCallback((event) => {
    setWrongEvent(event || null);
  }, []);

  const openTutor = useCallback((prompt, { hint = false } = {}) => {
    if (prompt) {
      setSeedPrompt({ text: prompt, ts: Date.now(), hint });
      consumedSeed.current = false;
    }
    setHelpOffer(null);
    setOpen(true);
  }, []);

  const closeTutor = useCallback(() => setOpen(false), []);
  const toggleTutor = useCallback(() => setOpen((o) => !o), []);

  const consumeSeedPrompt = useCallback(() => {
    if (consumedSeed.current) return null;
    consumedSeed.current = true;
    if (!seedPrompt?.text) return null;
    return { text: seedPrompt.text, hint: !!seedPrompt.hint };
  }, [seedPrompt]);

  // Advances the active slide's hint ladder one level (capped at the max,
  // which is the full explanation) and returns the new level. Used by the
  // first auto-hint (0 -> 1) and the panel's "Show another hint" affordance.
  const advanceHint = useCallback(() => {
    const id = activeSlideIdRef.current;
    const cur = id ? hintLevelRef.current.get(id) || 0 : hintLevelRef.current.get('__none__') || 0;
    const next = Math.min(cur + 1, HINT_MAX_LEVEL);
    hintLevelRef.current.set(id || '__none__', next);
    setHintLevel(next);
    // Count this genuine hint use against the active slide's lesson (only when
    // the level actually advanced — capping at the max doesn't re-count).
    if (next > cur) {
      const lessonId = groundingSlideRef.current?.lessonId;
      if (lessonId) recordHintUsedRef.current?.(lessonId);
    }
    return next;
  }, []);

  // Resets a slide's hint ladder (on a correct answer / leaving the check).
  const resetHint = useCallback((slideId) => {
    if (slideId) hintLevelRef.current.delete(slideId);
    if (!slideId || slideId === activeSlideIdRef.current) setHintLevel(0);
  }, []);

  // Clears the proactive state for one check (on mount / regen / leaving it).
  const resetProactive = useCallback(
    (slideId) => {
      if (!slideId) return;
      streakRef.current.delete(slideId);
      stageRef.current.delete(slideId);
      suppressedRef.current.delete(slideId);
      struggleStreakRef.current.delete(slideId);
      struggleFiredRef.current.delete(slideId);
      resetHint(slideId);
      setHelpOffer((cur) => (cur?.slideId === slideId ? null : cur));
    },
    [resetHint],
  );

  /**
   * Called by a check on every graded submit. Drives the proactive offer:
   * at `threshold` consecutive wrong attempts it surfaces a gentle offer; one
   * wrong attempt past that it auto-opens the seeded panel. Fires at most once
   * per stage per wrong streak; a correct answer or dismissal resets it.
   */
  const reportCheckOutcome = useCallback(
    (slideId, correct, { event, threshold = DEFAULT_HELP_AFTER, seedPrompt: seed } = {}) => {
      if (!slideId) return;
      if (correct) {
        resetProactive(slideId);
        return;
      }
      const streak = (streakRef.current.get(slideId) || 0) + 1;
      streakRef.current.set(slideId, streak);
      if (event) setWrongEvent(event);

      if (suppressedRef.current.has(slideId)) return;

      const t = Math.max(1, threshold || DEFAULT_HELP_AFTER);
      const stage = stageRef.current.get(slideId) || 'none';
      if (streak >= t && stage === 'none') {
        stageRef.current.set(slideId, 'offered');
        setHelpOffer({ slideId, prompt: seed });
      } else if (streak > t && stage === 'offered') {
        stageRef.current.set(slideId, 'done');
        openTutor(seed);
      }
    },
    [resetProactive, openTutor],
  );

  /**
   * Called by a gated INTERACTIVE check (build/drag/placement) on every graded
   * verify attempt. Tracks a per-slide consecutive failed-attempt streak and,
   * once the learner is "struggling" (>= `threshold` failures in a row),
   * AUTOMATICALLY opens the tutor with a single slight hint — exactly once per
   * struggling episode. A correct attempt (or moving to another slide) resets
   * it. Self-gates on `aiEnabled`, respects a prior dismissal, and never
   * interrupts an already-open chat.
   */
  const reportStruggle = useCallback(
    (slideId, correct, { threshold = STRUGGLE_AFTER, hintSeed, event } = {}) => {
      if (!slideId) return;
      if (correct) {
        struggleStreakRef.current.delete(slideId);
        struggleFiredRef.current.delete(slideId);
        resetHint(slideId);
        return;
      }
      const streak = (struggleStreakRef.current.get(slideId) || 0) + 1;
      struggleStreakRef.current.set(slideId, streak);
      if (event) setWrongEvent(event);

      const t = Math.max(1, threshold || STRUGGLE_AFTER);
      if (streak < t) return;
      // Fire at most once per struggling episode, even if we end up not
      // surfacing (AI off / dismissed / chat already open) — so we never
      // reopen on the next failed press.
      if (struggleFiredRef.current.has(slideId)) return;
      struggleFiredRef.current.add(slideId);

      if (!aiEnabled) return;
      if (suppressedRef.current.has(slideId)) return;
      if (openRef.current) return;
      openTutor(hintSeed || DEFAULT_STRUGGLE_SEED, { hint: true });
    },
    [openTutor, resetHint],
  );

  /**
   * Triggered by an assessment the moment the learner has FULLY attempted it
   * (final submit / reveal — correct or not). Opens the anchored explanation
   * card next to `anchorEl`. No-ops when AI is off, and (unless `force`) only
   * once per `key` so the same attempt never re-opens on re-render.
   */
  const explainAtAnchor = useCallback(
    ({ key, anchorEl, context, force = false } = {}) => {
      if (!aiEnabled) return;
      if (key && !force) {
        if (explainedKeysRef.current.has(key)) return;
        explainedKeysRef.current.add(key);
      }
      // The anchored card supersedes the bottom-left nudge for this moment.
      setHelpOffer(null);
      setAnchoredExplain({ id: Date.now(), anchorEl: anchorEl || null, context: context || {} });
    },
    [],
  );

  const dismissAnchoredExplain = useCallback(() => setAnchoredExplain(null), []);

  // Lets a check release a key (e.g. on "Try again") so the next full attempt
  // can explain again, when callers prefer that to a per-attempt key.
  const clearExplainKey = useCallback((key) => {
    if (key) explainedKeysRef.current.delete(key);
  }, []);

  const dismissHelpOffer = useCallback(() => {
    setHelpOffer((cur) => {
      if (cur?.slideId) suppressedRef.current.add(cur.slideId);
      return null;
    });
  }, []);

  const acceptHelpOffer = useCallback(() => {
    setHelpOffer((cur) => {
      if (cur) openTutor(cur.prompt);
      return null;
    });
  }, [openTutor]);

  // Moving to another slide dismisses any lingering proactive offer and any
  // open anchored explanation (its anchor element no longer exists).
  const activeSlideId = groundingSlide?.slideId || null;
  useEffect(() => {
    activeSlideIdRef.current = activeSlideId;
    setHelpOffer((cur) => (cur && cur.slideId !== activeSlideId ? null : cur));
    setAnchoredExplain(null);
    // Moving on ends any struggling episode: only the active slide can be
    // struggled on, so clearing here lets a later return start fresh.
    struggleStreakRef.current.clear();
    struggleFiredRef.current.clear();
    // Surface the new slide's stored hint depth (0 for a fresh slide).
    setHintLevel(activeSlideId ? hintLevelRef.current.get(activeSlideId) || 0 : 0);
  }, [activeSlideId]);

  const value = useMemo(
    () => ({
      groundingSlide,
      setGroundingSlide,
      wrongEvent,
      reportWrongAnswer,
      open,
      openTutor,
      closeTutor,
      toggleTutor,
      consumeSeedPrompt,
      helpOffer,
      reportCheckOutcome,
      reportStruggle,
      dismissHelpOffer,
      acceptHelpOffer,
      resetProactive,
      anchoredExplain,
      explainAtAnchor,
      dismissAnchoredExplain,
      clearExplainKey,
      hintLevel,
      hintMaxLevel: HINT_MAX_LEVEL,
      advanceHint,
      resetHint,
    }),
    [
      groundingSlide,
      wrongEvent,
      reportWrongAnswer,
      open,
      openTutor,
      closeTutor,
      toggleTutor,
      consumeSeedPrompt,
      helpOffer,
      reportCheckOutcome,
      reportStruggle,
      dismissHelpOffer,
      acceptHelpOffer,
      resetProactive,
      anchoredExplain,
      explainAtAnchor,
      dismissAnchoredExplain,
      clearExplainKey,
      hintLevel,
      advanceHint,
      resetHint,
    ],
  );

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTutor() {
  const ctx = useContext(TutorContext);
  if (ctx === null) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return ctx;
}
