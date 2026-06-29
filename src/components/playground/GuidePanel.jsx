import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { aiEnabled, streamChat } from '../../firebase/ai.js';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import { formatProfileForPrompt } from '../../ai/learnerProfile.js';
import {
  buildGuideSystem,
  buildInteractionContext,
  parseLoadDirective,
  generateSuggestions,
  FALLBACK_SUGGESTIONS,
  generateLabChallenge,
  gradeChallengeReasoning,
  pickFallbackChallenge,
} from '../../ai/playgroundPrompt.js';
import SuggestionChips from './SuggestionChips.jsx';
import ChallengePanel from './ChallengePanel.jsx';
import styles from './GuidePanel.module.css';

const CHALLENGE_FALLBACK_GRADE = {
  correct: true,
  score: null,
  feedback:
    "I couldn't grade that automatically right now — but compare your reasoning to what the interactive shows and see if it holds up!",
  strengths: [],
  gaps: [],
};

const CHAT_KEY = 'lab.chat';

// Rate-limit proactive (guide-initiated) reactions so the guide doesn't spam
// the learner while they keep tinkering.
const MIN_PROACTIVE_GAP_MS = 10000;

const FALLBACK_REPLY =
  "I'm having trouble reaching the lab guide right now. Try again in a moment — meanwhile, keep tinkering with the interactive on the stage.";

function toContent(m) {
  return { role: m.role, parts: [{ text: m.text }] };
}

function loadStoredChat() {
  try {
    const raw = window.sessionStorage.getItem(CHAT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * The AI Lab's conversational guide. Generates personalized exploration starts
 * on load, answers free-chat questions via streamChat (with learner-profile +
 * current-stage grounding), and can swap the stage by emitting a [[LOAD: Key]]
 * directive — surfaced to the page through `onLoadInteractive`.
 */
export default function GuidePanel({ currentKey, onLoadInteractive, interactionEvent }) {
  const profile = useLearnerProfile();
  const profileText = useMemo(() => formatProfileForPrompt(profile), [profile]);

  const [messages, setMessages] = useState(loadStoredChat);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  // Open-ended lab challenge state.
  const [challenge, setChallenge] = useState(null);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [challengeGrade, setChallengeGrade] = useState(null);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const busyRef = useRef(false);
  const currentKeyRef = useRef(currentKey);
  // Always-fresh mirror of messages so timer/effect-driven turns build history
  // from the latest conversation without re-subscribing.
  const messagesRef = useRef(messages);
  // Proactive-reaction guards: when we last chimed in, and the last event we
  // already handled (so an effect re-run never double-fires the same signal).
  const lastProactiveRef = useRef(0);
  const handledEventRef = useRef(0);

  useEffect(() => {
    currentKeyRef.current = currentKey;
  }, [currentKey]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Persist the conversation across navigations within the session.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    } catch {
      /* sessionStorage unavailable — non-fatal. */
    }
  }, [messages]);

  // Shared streaming routine for both learner-sent and guide-initiated turns.
  // `history` is the full content array sent to the model; `visibleAppend` are
  // any bubbles to show before the streaming reply (a user bubble for manual
  // sends, nothing for proactive reactions). Proactive turns fail silently and
  // never swap the stage out from under the learner.
  const runTurn = useCallback(
    async ({ history, visibleAppend = [], allowLoad = true, silentOnFail = false }) => {
      if (busyRef.current) return;

      setMessages((prev) => [...prev, ...visibleAppend, { role: 'model', text: '', pending: true }]);
      setBusy(true);
      busyRef.current = true;

      const system = buildGuideSystem({ profileText, currentKey: currentKeyRef.current });

      const applyLast = (patch) =>
        setMessages((prev) => {
          const next = prev.slice();
          for (let i = next.length - 1; i >= 0; i -= 1) {
            if (next[i].role === 'model') {
              next[i] = { ...next[i], ...patch };
              break;
            }
          }
          return next;
        });

      const dropLastPending = () =>
        setMessages((prev) => {
          const next = prev.slice();
          for (let i = next.length - 1; i >= 0; i -= 1) {
            if (next[i].role === 'model') {
              if (next[i].pending && !next[i].text) next.splice(i, 1);
              break;
            }
          }
          return next;
        });

      let pendingLoad = null;
      const full = await streamChat(history, { system }, (_d, fullSoFar) => {
        const parsed = parseLoadDirective(fullSoFar);
        pendingLoad = parsed.load;
        applyLast({ text: parsed.text });
      });

      if (full == null) {
        if (silentOnFail) dropLastPending();
        else applyLast({ text: FALLBACK_REPLY, pending: false, error: true });
      } else {
        const parsed = parseLoadDirective(full);
        pendingLoad = parsed.load;
        applyLast({ text: parsed.text || full, pending: false });
      }
      setBusy(false);
      busyRef.current = false;

      if (allowLoad && pendingLoad?.componentKey) onLoadInteractive?.(pendingLoad.componentKey);
    },
    [profileText, onLoadInteractive],
  );

  const send = useCallback(
    (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || busyRef.current) return;

      const userMsg = { role: 'user', text: trimmed };
      const history = [...messagesRef.current, userMsg].map(toContent);
      setInput('');
      runTurn({ history, visibleAppend: [userMsg] });
    },
    [runTurn],
  );

  // Guide-initiated reaction: when the learner manipulates the stage interactive
  // (a debounced/coalesced signal arrives via `interactionEvent`), the guide
  // chimes in on its own. Self-gates on AI being on, an idle (not streaming)
  // guide, the learner not mid-typing, and a rate limit — degrading silently.
  useEffect(() => {
    if (!interactionEvent || !interactionEvent.at) return;
    if (handledEventRef.current === interactionEvent.at) return;
    handledEventRef.current = interactionEvent.at;

    if (!aiEnabled || busyRef.current) return;
    if ((inputRef.current?.value || input).trim()) return; // learner mid-typing
    const now = Date.now();
    if (now - lastProactiveRef.current < MIN_PROACTIVE_GAP_MS) return;
    lastProactiveRef.current = now;

    const contextText = buildInteractionContext({
      summary: interactionEvent.summary,
      name: interactionEvent.name,
      currentKey: currentKeyRef.current,
    });
    const history = [
      ...messagesRef.current.map(toContent),
      { role: 'user', parts: [{ text: contextText }] },
    ];
    runTurn({ history, allowLoad: false, silentOnFail: true });
  }, [interactionEvent, input, runTurn]);

  // Fetch personalized suggestions once (falls back to a static set).
  useEffect(() => {
    let alive = true;
    (async () => {
      const generated = await generateSuggestions(profileText);
      if (alive) setSuggestions(generated || FALLBACK_SUGGESTIONS);
    })();
    return () => {
      alive = false;
    };
  }, [profileText]);

  // Autoscroll to the newest message as it streams.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function pickSuggestion(s) {
    if (busyRef.current) return;
    onLoadInteractive?.(s.componentKey);
    currentKeyRef.current = s.componentKey;
    send(s.seedPrompt || `Let's explore ${s.label}.`);
  }

  // Pose a new open-ended challenge: ask the model for one (falling back to a
  // static set), load the matching interactive, and reveal the challenge card.
  async function startChallenge() {
    if (busyRef.current || challengeBusy) return;
    setChallengeBusy(true);
    let next = null;
    try {
      next = await generateLabChallenge({ profileText, currentKey: currentKeyRef.current });
    } catch {
      next = null;
    }
    next = next || pickFallbackChallenge(currentKeyRef.current);
    if (next) {
      onLoadInteractive?.(next.componentKey);
      currentKeyRef.current = next.componentKey;
      setChallengeGrade(null);
      setChallenge(next);
    }
    setChallengeBusy(false);
  }

  // Grade the learner's free-text reasoning for the active challenge.
  async function submitChallenge(answer) {
    if (!challenge || challengeBusy) return;
    setChallengeBusy(true);
    let grade = null;
    try {
      grade = await gradeChallengeReasoning({ challenge, answer });
    } catch {
      grade = null;
    }
    setChallengeGrade(grade || CHALLENGE_FALLBACK_GRADE);
    setChallengeBusy(false);
  }

  function dismissChallenge() {
    setChallenge(null);
    setChallengeGrade(null);
  }

  function onSubmit(e) {
    e.preventDefault();
    send(input);
  }

  function onInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <section className={styles.panel} aria-label="Lab guide">
      <header className={styles.header}>
        <span className={`${styles.avatar} ${busy ? styles.avatarBusy : ''}`} aria-hidden="true" />
        <div className={styles.headerText}>
          <span className={styles.title}>Lab Guide</span>
          <span className={styles.status}>{busy ? 'Thinking…' : 'Your intro-chemistry guide'}</span>
        </div>
      </header>

      <div className={styles.messages} ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className={`${styles.bubble} ${styles.model}`}>
            <p className={styles.bubbleText}>
              Welcome to the Lab! Play with the interactive on the stage, or tap a suggestion
              below to start exploring. Ask me anything about what you see.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.bubble} ${m.role === 'user' ? styles.user : styles.model} ${
              m.error ? styles.errorBubble : ''
            }`}
          >
            {m.text && <p className={styles.bubbleText}>{m.text}</p>}
            {m.pending && !m.text && (
              <span className={styles.typing} aria-label="Guide is typing">
                <span /><span /><span />
              </span>
            )}
          </div>
        ))}
      </div>

      {challenge && (
        <ChallengePanel
          challenge={challenge}
          busy={challengeBusy}
          grade={challengeGrade}
          onSubmit={submitChallenge}
          onNew={startChallenge}
          onDismiss={dismissChallenge}
        />
      )}

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <div className={styles.suggestionsTop}>
            <span className={styles.suggestionsLabel}>Try exploring</span>
            {!challenge && (
              <button
                type="button"
                className={styles.challengeBtn}
                onClick={startChallenge}
                disabled={busy || challengeBusy}
              >
                {challengeBusy ? 'Loading…' : '\u{1F3AF} Challenge me'}
              </button>
            )}
          </div>
          <SuggestionChips suggestions={suggestions} onPick={pickSuggestion} disabled={busy} />
        </div>
      )}

      <form className={styles.inputRow} onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Ask the lab guide…"
          rows={1}
          aria-label="Message the lab guide"
        />
        <button
          type="submit"
          className={styles.send}
          disabled={busy || !input.trim()}
          aria-label="Send message"
        >
          &#8593;
        </button>
      </form>
    </section>
  );
}
