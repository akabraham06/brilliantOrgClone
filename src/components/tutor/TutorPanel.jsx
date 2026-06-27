import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { streamChat } from '../../firebase/ai.js';
import { useTutor } from '../../context/TutorContext.jsx';
import { usePreferences } from '../../context/PreferencesContext.jsx';
import { useLearnerProfile } from '../../ai/useLearnerProfile.js';
import {
  formatProfileForPrompt,
  formatWrongAnswerEvent,
} from '../../ai/learnerProfile.js';
import { buildTutorSystem, parseIllustration } from '../../ai/tutorPrompt.js';
import TutorIllustration from './TutorIllustration.jsx';
import TutorFeedback from './TutorFeedback.jsx';
import reading from './readingStyle.module.css';
import styles from './TutorPanel.module.css';

const FALLBACK_REPLY =
  "I'm having trouble reaching the tutor right now. Try again in a moment — meanwhile, re-read the slide and the on-screen hint, which usually points right at the idea.";

const BASE_CHIPS = [
  'Explain it differently',
  'Give me another example',
  'Why is this true?',
];

function toContent(m) {
  return { role: m.role, parts: [{ text: m.text }] };
}

export default function TutorPanel({ onClose, reduce }) {
  const {
    groundingSlide,
    wrongEvent,
    consumeSeedPrompt,
    hintLevel,
    hintMaxLevel,
    advanceHint,
  } = useTutor();
  const { prefs } = usePreferences();
  const profile = useLearnerProfile();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const busyRef = useRef(false);

  const profileText = useMemo(() => formatProfileForPrompt(profile), [profile]);

  const onCheckSlide = Boolean(groundingSlide?.isCheck) || Boolean(wrongEvent);
  const chips = useMemo(
    () =>
      onCheckSlide ? [...BASE_CHIPS, 'Help me understand my mistake'] : BASE_CHIPS,
    [onCheckSlide],
  );

  const send = useCallback(
    async (text, { hint = false, hintLevel: lvl = 1, prefsOverride } = {}) => {
      const trimmed = (text || '').trim();
      if (!trimmed || busyRef.current) return;

      const userMsg = { role: 'user', text: trimmed };
      const history = [...messages, userMsg].map(toContent);

      setMessages((prev) => [
        ...prev,
        userMsg,
        { role: 'model', text: '', illustration: null, pending: true },
      ]);
      setInput('');
      setBusy(true);
      busyRef.current = true;

      const system = buildTutorSystem({
        slide: groundingSlide,
        profileText,
        wrongText: wrongEvent ? formatWrongAnswerEvent(wrongEvent) : '',
        // A slight hint stays minimal: no illustration, ladder-controlled depth.
        withIllustration: !hint,
        hintMode: hint,
        hintLevel: lvl,
        prefs: prefsOverride || prefs,
      });

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

      const full = await streamChat(history, { system }, (_d, fullSoFar) => {
        const parsed = parseIllustration(fullSoFar);
        applyLast({ text: parsed.text, illustration: parsed.illustration });
      });

      if (full == null) {
        applyLast({ text: FALLBACK_REPLY, illustration: null, pending: false, error: true });
      } else {
        const parsed = parseIllustration(full);
        applyLast({ text: parsed.text || full, illustration: parsed.illustration, pending: false });
      }
      setBusy(false);
      busyRef.current = false;
    },
    [messages, groundingSlide, profileText, wrongEvent, prefs],
  );

  // The first auto-hint (from the struggle flow) and the "Show another hint"
  // button both escalate the per-slide hint ladder one level.
  const requestHint = useCallback(
    (seedText) => {
      const lvl = advanceHint();
      const ask =
        seedText ||
        (lvl >= hintMaxLevel
          ? 'I still need it — can you walk me through the full answer?'
          : 'Can I have another hint?');
      send(ask, { hint: true, hintLevel: lvl });
    },
    [advanceHint, hintMaxLevel, send],
  );

  // "Rephrase simpler": re-ask with the simpler-language instruction forced on
  // for this one reply, regardless of the saved preference.
  const rephraseSimpler = useCallback(() => {
    send('Can you rephrase that in simpler language?', {
      prefsOverride: { ...prefs, simpleLanguage: true },
    });
  }, [send, prefs]);

  // Focus the input on open; consume any seeded prompt (e.g. from a check).
  useEffect(() => {
    inputRef.current?.focus();
    const seeded = consumeSeedPrompt?.();
    if (seeded?.text) {
      if (seeded.hint) requestHint(seeded.text);
      else send(seeded.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoscroll to the newest message as it streams.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Esc closes; a lightweight focus trap keeps Tab within the panel.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll(
        'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    const node = panelRef.current;
    node?.addEventListener('keydown', onKey);
    return () => node?.removeEventListener('keydown', onKey);
  }, [onClose]);

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
    <div
      className={styles.panel}
      role="dialog"
      aria-modal="false"
      aria-label="Chemistry tutor chat"
      ref={panelRef}
    >
      <header className={styles.header}>
        <span className={`${styles.avatar} ${busy && !reduce ? styles.avatarBusy : ''}`} aria-hidden="true" />
        <div className={styles.headerText}>
          <span className={styles.title}>Chemistry Tutor</span>
          <span className={styles.status}>
            {busy ? 'Thinking…' : groundingSlide ? 'Here to help on this slide' : 'Ask me anything chemistry'}
          </span>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close tutor">
          &times;
        </button>
      </header>

      <div className={styles.messages} ref={listRef} aria-live="polite">
        {messages.length === 0 && (
          <div className={`${styles.bubble} ${styles.model}`}>
            <p className={styles.bubbleText}>
              Hi! I&rsquo;m your chemistry tutor. Ask me about{' '}
              {groundingSlide?.subtitle ? (
                <strong>{groundingSlide.subtitle}</strong>
              ) : (
                'anything in the course'
              )}{' '}
              — I&rsquo;ll guide you, not just hand over the answer.
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const isModel = m.role !== 'user';
          return (
            <div
              key={i}
              className={`${styles.bubble} ${isModel ? styles.model : styles.user} ${
                m.error ? styles.errorBubble : ''
              }`}
            >
              {m.text && (
                <p className={`${styles.bubbleText} ${isModel ? reading.readingText : ''}`}>
                  {m.text}
                </p>
              )}
              {m.pending && !m.text && (
                <span className={styles.typing} aria-label="Tutor is typing">
                  <span /><span /><span />
                </span>
              )}
              {m.illustration && (
                <TutorIllustration
                  componentKey={m.illustration.componentKey}
                  caption={m.illustration.caption}
                />
              )}
              {isModel && !m.pending && m.text && !m.error && (
                <TutorFeedback surface="panel" slideId={groundingSlide?.slideId} />
              )}
            </div>
          );
        })}
      </div>

      {groundingSlide && (
        <div className={styles.hintRow}>
          <button
            type="button"
            className={styles.hintBtn}
            onClick={() => requestHint()}
            disabled={busy || hintLevel >= hintMaxLevel}
          >
            {hintLevel === 0 ? 'Show a hint' : 'Show another hint'}
          </button>
          {hintLevel > 0 && (
            <span className={styles.hintMeter} aria-live="polite">
              {hintLevel >= hintMaxLevel
                ? 'Full explanation shown'
                : `Hint ${hintLevel} of ${hintMaxLevel}`}
            </span>
          )}
        </div>
      )}

      <div className={styles.chips} role="group" aria-label="Quick questions">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className={styles.chip}
            onClick={() => send(c)}
            disabled={busy}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          className={styles.chip}
          onClick={rephraseSimpler}
          disabled={busy}
        >
          Rephrase simpler
        </button>
      </div>

      <form className={styles.inputRow} onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Ask a chemistry question…"
          rows={1}
          aria-label="Message the chemistry tutor"
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
    </div>
  );
}
