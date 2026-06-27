import { useState } from 'react';
import { recordFeedback } from './feedbackStore.js';
import styles from './TutorFeedback.module.css';

/**
 * Compact "Was this helpful?" control shown under a completed tutor explanation
 * or feedback. Thumbs up records immediately; thumbs down reveals an optional
 * note field. Votes persist client-side (see feedbackStore). Self-contained:
 * tracks its own voted state so it shows a brief thank-you once used.
 *
 * @param {object} props
 * @param {string} [props.surface]  Origin tag (panel/anchored/feedback).
 * @param {string} [props.slideId]  Slide the tutor was grounded on.
 */
export default function TutorFeedback({ surface = 'tutor', slideId = null }) {
  const [vote, setVote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  function cast(next) {
    if (vote) return;
    setVote(next);
    recordFeedback({ vote: next, surface, slideId });
    if (next === 'down') setNoteOpen(true);
    else setDone(true);
  }

  function submitNote() {
    if (note.trim()) {
      recordFeedback({ vote: 'down', surface, slideId, note: note.trim() });
    }
    setNoteOpen(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className={styles.thanks} role="status">
        Thanks for the feedback!
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      {!vote ? (
        <div className={styles.row}>
          <span className={styles.label}>Was this helpful?</span>
          <button
            type="button"
            className={styles.voteBtn}
            onClick={() => cast('up')}
            aria-label="Yes, this was helpful"
          >
            <span aria-hidden="true">👍</span>
          </button>
          <button
            type="button"
            className={styles.voteBtn}
            onClick={() => cast('down')}
            aria-label="No, this was not helpful"
          >
            <span aria-hidden="true">👎</span>
          </button>
        </div>
      ) : (
        noteOpen && (
          <div className={styles.note}>
            <label className={styles.noteLabel} htmlFor={`fb-note-${surface}`}>
              What was off? (optional)
            </label>
            <textarea
              id={`fb-note-${surface}`}
              className={styles.noteInput}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. too advanced, didn't answer my question…"
            />
            <div className={styles.noteActions}>
              <button type="button" className={styles.noteSkip} onClick={submitNote}>
                Skip
              </button>
              <button type="button" className={styles.noteSend} onClick={submitNote}>
                Send
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
