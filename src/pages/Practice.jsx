import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { aiEnabled } from '../firebase/ai.js';
import { useContent } from '../context/ContentContext.jsx';
import { useDailyQuests } from '../context/DailyQuestsContext.jsx';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { useRewardToast } from '../context/RewardToastContext.jsx';
import { streakReward, economyDayKey } from '../data/economy.js';
import { useLearnerProfile } from '../ai/useLearnerProfile.js';
import { useLearnerMemory } from '../ai/useLearnerMemory.js';
import { generatePracticeSet } from '../ai/practiceGenerator.js';
import { classifyMisconception } from '../ai/misconception.js';
import { dueCards } from '../ai/srs.js';
import ContentGate from '../components/ContentGate.jsx';
import Formula from '../components/interactions/Formula.jsx';
import FreeResponseCheck from '../components/lesson/checks/FreeResponseCheck.jsx';
import styles from './Practice.module.css';

const COUNT_OPTIONS = [5, 8, 10];

export default function Practice() {
  return (
    <ContentGate>
      <PracticeInner />
    </ContentGate>
  );
}

function PracticeInner() {
  const [params] = useSearchParams();
  const { lessons } = useContent();
  const { report: reportQuest } = useDailyQuests();
  const { grant, grantCosmetic } = useEconomy();
  const { markDailyActive } = useProgress();
  const { pushReward } = useRewardToast();
  const profile = useLearnerProfile();
  const { memory, recordReview, recordMisconception } = useLearnerMemory();

  const dueMode = params.get('due') === '1';
  const initialTopic = params.get('topic') || '';

  const dueTopics = useMemo(
    () => dueCards(memory?.srs).map((c) => c.topic),
    [memory],
  );

  const [topic, setTopic] = useState(initialTopic);
  const [count, setCount] = useState(8);
  const [phase, setPhase] = useState('setup'); // setup | loading | active | done | error
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({});

  const startedRef = useRef(false);

  const run = useCallback(
    async (focusTopic) => {
      if (!aiEnabled) {
        setPhase('error');
        return;
      }
      setPhase('loading');
      const generated = await generatePracticeSet({
        topic: focusTopic,
        count,
        profile,
        lessons,
      });
      if (!generated) {
        setPhase('error');
        return;
      }
      setItems(generated);
      setIndex(0);
      setResults({});
      setPhase('active');
    },
    [count, profile, lessons],
  );

  // Auto-start for "due for review" deep-links from the recommender.
  useEffect(() => {
    if (startedRef.current) return;
    if (dueMode && aiEnabled) {
      startedRef.current = true;
      const focus = dueTopics.length ? dueTopics.slice(0, 6).join(', ') : '';
      run(focus || 'a spaced review of recently missed topics');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueMode]);

  const recordOutcome = useCallback(
    (item, correct, attemptCount, selected) => {
      const t = item.topic || topic;
      if (t) {
        // Map the attempt into an SM-2 quality grade.
        const quality = correct ? (attemptCount <= 1 ? 5 : 3) : 1;
        recordReview(t, quality);
      }
      if (!correct && aiEnabled) {
        classifyMisconception({
          prompt: item.prompt,
          selected,
          correct: item.answer,
          topic: t,
        }).then((m) => {
          if (m) recordMisconception(m);
        });
      }
    },
    [recordReview, recordMisconception, topic],
  );

  function handleResult(item, correct, attemptCount, selected) {
    setResults((prev) => {
      if (prev[item.id]?.locked) return prev;
      return { ...prev, [item.id]: { correct, locked: true } };
    });
    recordOutcome(item, correct, attemptCount, selected);
    // Daily quest: "transfer" — a correct free-response is effortful, explain-it-
    // yourself recall (a desirable difficulty).
    if (correct && item.type === 'fr') reportQuest('transfer', 1);
  }

  const total = items.length;
  const current = items[index];
  const answered = current ? Object.prototype.hasOwnProperty.call(results, current.id) : false;
  const score = useMemo(() => Object.values(results).filter((r) => r.correct).length, [results]);

  // On completion, advance the retrieval / spaced / interleave daily quests once.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'done' || reportedRef.current) return;
    reportedRef.current = true;
    if (score > 0) reportQuest('retrieval', score);
    const topics = new Set(items.map((i) => i.topic).filter(Boolean));
    if (dueMode) reportQuest('spaced', Math.max(1, topics.size || items.length));
    if (topics.size >= 2) reportQuest('interleave', 1);
    // Streak / consistency reward: a completed practice session counts as daily
    // activity. Grant the tiny capped streak reward once per new active day.
    const { streakCount, isNewDay } = markDailyActive();
    if (isNewDay) {
      const sr = streakReward(streakCount);
      const streakRes = grant({ key: `streak:${economyDayKey()}`, xp: sr.xp, coins: sr.coins });
      if (streakRes.granted) {
        pushReward({
          amount: streakRes.xp,
          coins: streakRes.coins,
          behavior: `Day ${streakCount} streak`,
          icon: '\u{1F525}',
        });
      }
      // Mastery exclusive: "devoted" at a 14-day streak.
      if (streakCount >= 14) {
        const ex = grantCosmetic('devoted', 'cosmetic:devoted');
        if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
      // Mastery exclusive: "iron-will" at a 30-day streak.
      if (streakCount >= 30) {
        const ex = grantCosmetic('iron-will', 'cosmetic:iron-will');
        if (ex.granted) pushReward({ behavior: 'Mastery reward unlocked', icon: '\u{1F3C5}' });
      }
    }
  }, [phase, score, items, dueMode, reportQuest, grant, grantCosmetic, markDailyActive, pushReward]);

  function goNext() {
    if (index < total - 1) setIndex((i) => i + 1);
    else setPhase('done');
  }

  function reset() {
    startedRef.current = false;
    reportedRef.current = false;
    setPhase('setup');
    setItems([]);
    setResults({});
    setIndex(0);
  }

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <span className={styles.eyebrow}>Practice</span>
        <h1 className={styles.heading}>On-demand practice</h1>
        <p className={styles.subhead}>
          Ask for practice on any chemistry topic and get a fresh, mixed question set —
          graded with feedback. Great for shoring up weak spots before a review.
        </p>
      </header>

      {phase === 'setup' && (
        <SetupForm
          topic={topic}
          setTopic={setTopic}
          count={count}
          setCount={setCount}
          onStart={() => run(topic)}
          dueTopics={dueTopics}
          onStartDue={() => run(dueTopics.slice(0, 6).join(', '))}
        />
      )}

      {phase === 'loading' && (
        <div className={styles.statusCard} role="status" aria-live="polite">
          <span className={styles.dots}><span /><span /><span /></span>
          Building your practice set…
        </div>
      )}

      {phase === 'error' && (
        <div className={styles.statusCard} role="status">
          {aiEnabled ? (
            <>
              <p>Couldn&rsquo;t build a set right now. Please try again in a moment.</p>
              <button type="button" className={styles.primaryBtn} onClick={reset}>
                Back to setup
              </button>
            </>
          ) : (
            <>
              <p>
                Personalized practice generation is off in this deployment. You can still practice
                with the course&rsquo;s built-in review set.
              </p>
              {lessons[0]?.courseId && (
                <Link className={styles.primaryBtn} to={`/app/courses/${lessons[0].courseId}/review`}>
                  Go to course review
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {phase === 'active' && current && (
        <PracticeRunner
          key={current.id}
          item={current}
          index={index}
          total={total}
          answered={answered}
          wasCorrect={results[current.id]?.correct}
          onResult={handleResult}
          onNext={goNext}
        />
      )}

      {phase === 'done' && (
        <PracticeSummary score={score} total={total} onAgain={reset} />
      )}
    </div>
  );
}

function SetupForm({ topic, setTopic, count, setCount, onStart, dueTopics, onStartDue }) {
  return (
    <div className={styles.setup}>
      {!aiEnabled && (
        <p className={styles.aiOff} role="note">
          Generated practice isn&rsquo;t available right now — try the course review instead.
        </p>
      )}
      {dueTopics.length > 0 && (
        <div className={styles.dueBanner}>
          <span>
            {dueTopics.length} {dueTopics.length === 1 ? 'topic is' : 'topics are'} due for spaced review.
          </span>
          <button type="button" className={styles.secondaryBtn} onClick={onStartDue} disabled={!aiEnabled}>
            Review due topics
          </button>
        </div>
      )}
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onStart();
        }}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>What do you want to practice?</span>
          <input
            className={styles.input}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. moles, balancing equations, the pH scale"
            aria-label="Practice topic"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>How many questions?</span>
          <div className={styles.countRow}>
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.countBtn} ${count === n ? styles.countBtnOn : ''}`}
                aria-pressed={count === n}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </label>
        <button type="submit" className={styles.primaryBtn} disabled={!aiEnabled}>
          Generate practice
        </button>
      </form>
    </div>
  );
}

function PracticeRunner({ item, index, total, answered, wasCorrect, onResult, onNext }) {
  const progressPercent = Math.round(((index + 1) / total) * 100);
  return (
    <div className={styles.runner}>
      <div className={styles.runnerHead}>
        <span className={styles.counter} aria-live="polite">
          Question {index + 1} / {total}
        </span>
        {item.topic && <span className={styles.topicChip}>{item.topic}</span>}
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.stage}>
        {item.type === 'fr' ? (
          <FreeResponsePractice item={item} onResult={onResult} />
        ) : (
          <McqPractice item={item} onResult={onResult} />
        )}
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerHint}>
          {answered ? (wasCorrect ? 'Nice — recorded.' : 'Recorded. Keep going!') : 'Answer to continue.'}
        </span>
        <button type="button" className={styles.nextBtn} onClick={onNext} disabled={!answered}>
          {index === total - 1 ? 'Finish' : 'Next'}
        </button>
      </footer>
    </div>
  );
}

function McqPractice({ item, onResult }) {
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const correct = choice === item.answer;

  function submit() {
    if (choice == null) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSubmitted(true);
    onResult(item, correct, nextAttempts, choice);
  }

  function tryAgain() {
    setSubmitted(false);
    setChoice(null);
  }

  return (
    <div className={styles.mcq}>
      <p className={styles.prompt}>{item.prompt}</p>
      <div className={styles.options}>
        {item.options.map((option) => {
          const selected = choice === option;
          const isAnswer = option === item.answer;
          let cls = styles.option;
          if (submitted && isAnswer) cls += ` ${styles.optionCorrect}`;
          else if (submitted && selected && !isAnswer) cls += ` ${styles.optionWrong}`;
          else if (selected) cls += ` ${styles.optionSelected}`;
          return (
            <button
              key={option}
              type="button"
              className={cls}
              aria-pressed={selected}
              disabled={submitted}
              onClick={() => setChoice(option)}
            >
              <Formula value={option} />
            </button>
          );
        })}
      </div>
      {submitted ? (
        <div className={correct ? styles.feedbackOk : styles.feedbackBad} role="status">
          <p>{correct ? 'Correct!' : 'Not quite.'}</p>
          {!correct && item.hint && <p className={styles.hint}>Hint: {item.hint}</p>}
          {!correct && (
            <button type="button" className={styles.tryAgain} onClick={tryAgain}>
              Try again
            </button>
          )}
        </div>
      ) : (
        <button type="button" className={styles.checkBtn} onClick={submit} disabled={choice == null}>
          Check answer
        </button>
      )}
    </div>
  );
}

function FreeResponsePractice({ item, onResult }) {
  const attemptsRef = useRef(0);
  return (
    <FreeResponseCheck
      question={{ id: item.id, prompt: item.prompt, rubric: item.rubric }}
      slideContext={item.topic}
      onResult={() => {}}
      onGraded={({ correct }) => {
        attemptsRef.current += 1;
        onResult(item, correct, attemptsRef.current, null);
      }}
    />
  );
}

function PracticeSummary({ score, total, onAgain }) {
  const percent = total ? Math.round((score / total) * 100) : 0;
  let headline = 'Practice complete!';
  if (percent >= 90) headline = 'Outstanding work!';
  else if (percent >= 70) headline = 'Great job!';
  else if (percent >= 50) headline = 'Nice effort!';

  return (
    <div className={styles.summary}>
      <div className={styles.trophy} aria-hidden="true">&#127881;</div>
      <h2 className={styles.summaryTitle}>{headline}</h2>
      <p className={styles.scoreLine} role="status">
        You scored <strong>{score} / {total}</strong> ({percent}%)
      </p>
      <p className={styles.summaryBody}>
        Misses were logged to your learner memory and queued for spaced review, so the
        tutor and recommender will follow up automatically.
      </p>
      <div className={styles.summaryActions}>
        <button type="button" className={styles.primaryBtn} onClick={onAgain}>
          Practice again
        </button>
        <Link className={styles.secondaryBtn} to="/app/home">
          Back to home
        </Link>
      </div>
    </div>
  );
}
