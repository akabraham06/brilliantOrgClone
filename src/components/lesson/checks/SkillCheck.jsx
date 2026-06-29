import { useMemo, useState } from 'react';
import { getFreeResponseBank } from '../../../data/chemistryCourse.js';
import { useEconomy } from '../../../context/EconomyContext.jsx';
import { useDailyQuests } from '../../../context/DailyQuestsContext.jsx';
import { useProgress } from '../../../context/ProgressContext.jsx';
import { useRewardToast } from '../../../context/RewardToastContext.jsx';
import { useLearnerMemory } from '../../../ai/useLearnerMemory.js';
import { classifyMisconception } from '../../../ai/misconception.js';
import { aiEnabled } from '../../../firebase/ai.js';
import { REWARDS } from '../../../data/economy.js';
import FreeResponseCheck from './FreeResponseCheck.jsx';
import AdaptiveLessonCheck from './AdaptiveLessonCheck.jsx';
import checkStyles from './Check.module.css';
import styles from './SkillCheck.module.css';

const MAX_FR = 3;

/**
 * Two-section end-of-lesson skill check (only mounted when AI is on and the
 * lesson has a free-response bank):
 *   Section 1 — Free response: 2–3 AI-graded short-answer questions with feedback.
 *   Section 2 — Multiple choice: the existing adaptive MCQ (AdaptiveLessonCheck).
 *
 * Only the MCQ section is wired to the player's onResult, so Next gating + the
 * lesson's recorded check accuracy behave exactly like before (the final check is
 * the MCQ). Free-response questions award idempotent XP/coins on first-attempt as
 * they're graded.
 */
export default function SkillCheck({ slide, onResult, savedState, onSaveState, lessonSlides }) {
  const { grant } = useEconomy();
  const { report: reportQuest } = useDailyQuests();
  const { recordCheckResult } = useProgress();
  const { pushReward } = useRewardToast();
  const { recordReview, recordMisconception } = useLearnerMemory();
  const bank = useMemo(
    () => getFreeResponseBank(slide.lessonId).slice(0, MAX_FR),
    [slide.lessonId],
  );

  const slideContext = useMemo(() => {
    const concepts = (lessonSlides || [])
      .filter((s) => !s?.isCheck && (s.bodyText || s.subtitle))
      .map((s) => `${s.subtitle || ''}: ${String(s.bodyText || '').slice(0, 160)}`);
    return concepts.join('\n').slice(0, 900);
  }, [lessonSlides]);

  const [step, setStep] = useState(savedState?.step || 'fr');
  const [frDone, setFrDone] = useState(savedState?.frDone || {});
  const [frState, setFrState] = useState(savedState?.frState || {});

  function persist(next) {
    onSaveState?.({ step, frDone, frState, mcq: savedState?.mcq, ...next });
  }

  function handleGraded({ questionId, correct, score, firstAttempt, selfCheck, missedConcepts, answer }) {
    setFrDone((prev) => {
      const next = { ...prev, [questionId]: true };
      persist({ frDone: next });
      return next;
    });
    // Everything below is scored on the FIRST attempt only (resubmits never
    // re-grant XP or re-record into the profile / memory).
    if (!firstAttempt || !questionId) return;

    // Idempotent XP/coins for free-response.
    const tier = correct
      ? REWARDS.freeResponse.correct
      : (score ?? 0) >= 0.4
        ? REWARDS.freeResponse.partial
        : REWARDS.freeResponse.attempt;
    const res = grant({ key: `fr:${questionId}`, xp: tier.xp, coins: tier.coins });
    // Frame a correct free-response by the behavior (self-explanation), not coins.
    if (res.granted && correct) {
      pushReward({
        amount: res.xp,
        coins: res.coins,
        behavior: 'Explained it yourself',
        icon: '\u{1F4A1}',
      });
    }
    // Daily quest: "transfer" — effortful, explain-it-yourself recall.
    reportQuest('transfer', 1);

    // Personalize on a REAL graded verdict only. The AI-off / grade-failure
    // self-check reports a placeholder correct:true to keep the learner moving;
    // recording that would falsely inflate first-attempt accuracy + memory.
    if (selfCheck) return;

    // PROFILE: record under a composite key so it never collides with the slide's
    // MCQ result (the MCQ section owns the bare slideId). learnerProfile.js just
    // iterates the keys, so a composite string is fine.
    recordCheckResult(slide.lessonId, `${slide.slideId}:fr:${questionId}`, correct);

    // SRS + misconception, mirroring Practice.jsx. Prefer the grader's pinpointed
    // missed concept(s) as the topic; fall back to the lesson title / slide.
    const missed = Array.isArray(missedConcepts) ? missedConcepts.filter(Boolean) : [];
    const topic = missed[0] || slide.title || slide.subtitle || '';
    if (topic) recordReview(topic, correct ? 5 : 1);
    if (!correct && aiEnabled) {
      const q = bank.find((b) => b.id === questionId);
      classifyMisconception({
        prompt: q?.prompt,
        selected: answer,
        correct: q?.rubric,
        topic: topic || undefined,
        slideContext,
      }).then((m) => m && recordMisconception(m));
    }
  }

  function saveFrState(qid, st) {
    setFrState((prev) => {
      const next = { ...prev, [qid]: st };
      persist({ frState: next });
      return next;
    });
  }

  function saveMcqState(st) {
    persist({ mcq: st });
  }

  const allFrDone = bank.length === 0 || bank.every((q) => frDone[q.id]);

  if (step === 'mcq' || bank.length === 0) {
    return (
      <div className={styles.wrap}>
        <SectionHeader index={2} total={2} label="Multiple choice" />
        <AdaptiveLessonCheck
          slide={slide}
          onResult={onResult}
          savedState={savedState?.mcq}
          onSaveState={saveMcqState}
          lessonSlides={lessonSlides}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <SectionHeader index={1} total={2} label="Free response" />
      <p className={styles.intro}>
        Answer in your own words — your tutor will read each response and give you
        specific feedback.
      </p>

      <ol className={styles.frList}>
        {bank.map((q, i) => (
          <li key={q.id} className={styles.frItem}>
            <span className={styles.frNum}>Question {i + 1}</span>
            <FreeResponseCheck
              slide={slide}
              question={q}
              slideContext={slideContext}
              tutorAssist
              lessonSlides={lessonSlides}
              onResult={() => {}}
              onGraded={handleGraded}
              savedState={frState[q.id]}
              onSaveState={(st) => saveFrState(q.id, st)}
            />
          </li>
        ))}
      </ol>

      <div className={styles.advanceRow}>
        <button
          type="button"
          className={checkStyles.submit}
          disabled={!allFrDone}
          onClick={() => {
            setStep('mcq');
            persist({ step: 'mcq' });
          }}
        >
          {allFrDone ? 'Continue to multiple choice →' : 'Answer each question to continue'}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ index, total, label }) {
  return (
    <div className={styles.sectionHead}>
      <span className={styles.sectionBadge}>
        Section {index} of {total}
      </span>
      <span className={styles.sectionLabel}>{label}</span>
      <span className={styles.dots} aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={i < index ? styles.dotOn : styles.dot} />
        ))}
      </span>
    </div>
  );
}
