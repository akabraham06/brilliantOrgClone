# Learning Science → AI Features for *Introduction to Chemistry*

A research-backed design pass that turns durable-learning science into concrete, build-ready AI
features for this React + Vite interactive chemistry course. It is grounded in (a) the source
Brainlift on learning science and AI cognitive debt, (b) deep reads of each cited paper, and
(c) the app's existing AI + learning infrastructure (`src/ai/*`, `src/firebase/ai.js`,
`src/context/*`, `src/pages/*`, `src/data/*`).

> **Scope note.** This document is research + design only. It does **not** modify application
> code. A separate workstream is implementing an AI-driven **daily-quest** system; quests are
> referenced where relevant but are intentionally *not* designed here.

---

## (a) Executive summary

The strongest, most replicated findings in learning science all converge on one uncomfortable
truth: **what makes study *feel* productive (rereading, massing, smooth AI answers) is usually
the opposite of what builds durable memory.** Real learning comes from *effortful retrieval*,
*spacing with a well-chosen gap*, *interleaving confusable ideas*, and *managing working-memory
load for novices* — and it must be **measured after a delay**, not by in-the-moment performance.
Generative AI can accelerate all of this *or* quietly sabotage it: Bastani et al. (2025) showed
that an un-guardrailed GPT tutor **raised practice scores 48% but lowered later unaided exam
scores 17%**, while a hint-only "GPT Tutor" with guardrails erased the harm.

The good news: **this app already has most of the right machinery.** It has an SM-2 spaced
scheduler (`srs.js`), a misconception ledger and detector (`misconception.js`, `memoryModel.js`),
an adaptive end-of-lesson check (`adaptiveLessonCheck.js`), AI-graded free response
(`gradeFreeResponse.js`), a Socratic tutor with a **4-level progressive hint ladder that already
refuses to dump answers** (`tutorPrompt.js`, `TutorContext.jsx`), a recommender (`recommender.js`),
and a persistent cross-session learner memory (`memorySummary.js`). The tutor's hint ladder is, in
effect, a partial implementation of Bastani's "GPT Tutor" guardrail.

So the highest-leverage move is **not** to build new surfaces from scratch, but to **extend
existing infrastructure** toward the parts of the science it does not yet honor:

1. The app tests mostly **recognition** (multiple choice). Retrieval research says **free recall**
   is stronger — add AI-graded **free-recall / teach-back**.
2. The scheduler uses **fixed SM-2 intervals**; Cepeda's ridgeline says the gap should scale to
   the **time until the test/goal** — add **goal-aware optimal-gap spacing**.
3. Interleaving is *counted* (a quest fires when ≥2 topics mix) but not *engineered*; Kornell &
   Bjork say interleaving's payoff is **discrimination** between confusable categories — add
   **discrimination decks**.
4. Scaffolding is a hint *ladder* but not a **worked-example → completion → independent fade**;
   Sweller's CLT says novices need that fade — add **faded worked examples**.
5. Accuracy is measured **in-session** (= performance); Soderstrom & Bjork insist learning be
   measured **after a delay / on transfer** — add a **Durable Mastery** metric.
6. The tutor resists answer-dumping but does not **measure reliance**; Bastani's whole point is
   that over-reliance is the failure mode — add a **reliance/independence signal + effort gate**.

**Top 6 recommended features** (full detail in section d):

| # | Feature | One-line rationale | Core principle (citation) |
|---|---------|--------------------|---------------------------|
| 1 | **Free-Recall "Brain Dump" & Teach-Back** | Replace some recognition with effortful recall — the single biggest retention multiplier | Retrieval practice (Karpicke & Roediger, 2008) |
| 2 | **Goal-Aware Optimal-Gap Scheduler** | Make review gaps scale to time-until-goal instead of fixed SM-2 steps | Spacing ridgeline / optimal gap (Cepeda et al., 2006, 2008) |
| 3 | **Discrimination Decks (Interleaved Contrast Sets)** | Deliberately mix confusable chemistry categories so learners learn the *differences* | Interleaving for induction (Kornell & Bjork, 2008) |
| 4 | **Faded Worked Examples** | Carry novices from a fully worked example to independent solving as load allows | Cognitive load theory + worked-example effect (Sweller; Baddeley & Hitch, 1974) |
| 5 | **Durable Mastery vs. Practice Performance** | Show a delayed/transfer-based mastery metric, not just in-session accuracy | Learning ≠ performance (Soderstrom & Bjork, 2015) |
| 6 | **Reliance Meter & Effort-Gated Tutor** | Require an attempt before help and detect "crutch" over-use of the AI | AI guardrails / anti-cognitive-debt (Bastani et al., 2025; Sparrow et al., 2011) |

Two strong runners-up — **Confidence Calibration (predict-then-check)** and a **Diagnostic
Baseline + Evidence-Based Study Plan** — are detailed in section (d) as well; the latter is
directly motivated by Sein et al. (2025), where higher-scoring lower-SES examinees differed
precisely by *baseline assessment, practice testing, self-explanation, and cumulative review.*

---

## (b) Per-paper deep notes (finding → mechanism → caveats → chemistry-course generalization)

### Baddeley & Hitch (1974) — Multicomponent Working Memory Model
*(Reviewed via Chai, Abd Hamid & Abdullah, 2018, "Working Memory From the Psychological and
Neurosciences Perspectives," PMC5881171.)*

- **Core finding.** Working memory is not a single short-term "box" but a limited-capacity,
  **multicomponent** system: a *central executive* (attention/control) coordinating a
  *phonological loop* (verbal), a *visuospatial sketchpad* (visual-spatial), and (later) an
  *episodic buffer* that binds information and links to long-term memory.
- **Mechanism.** Genuinely new material must be held and manipulated in this small workspace
  before it can be encoded into long-term memory. Capacity is tight (a few elements) and is
  shared across control + verbal + visual subsystems.
- **Caveats / conditions.** Capacity limits apply to *novel, un-chunked* material; experts chunk
  and offload to long-term memory, effectively expanding usable capacity. Competing models exist
  (Cowan's embedded-processes/attention-focus account), but all agree on the **limited-capacity**
  premise that grounds cognitive load theory.
- **Chemistry-course generalization.** A 14–16-year-old meeting moles, molar mass, and
  stoichiometry for the first time can hold only a few new elements at once. Slides and AI
  explanations must **chunk** (one idea per step), avoid splitting attention across text + diagram
  the learner must mentally integrate, and use both verbal *and* visual channels deliberately
  (the app's interactives + tutor text already exploit dual channels). This is the *why* under
  every scaffolding/fading proposal below.

### Sein et al. (2025) — Preparation strategies & lower-SES MCAT examinees
*(Swan Sein, McClure, Chanatry, et al., *Teaching and Learning in Medicine*; AAMC Post-MCAT
Questionnaire 2021–2023; N = 3,240 lower-SES first-time examinees.)*

- **Core finding.** Among lower-SES examinees, **higher scorers used evidence-based study
  behaviors far more than lower scorers** — not merely "studied more." The largest gaps:
  assessing progress with practice exams (87% vs 58%, ~29 pts), assessing readiness with a final
  practice test (86% vs 47%, ~39 pts), making/using flashcards (78% vs 52%), **explaining *why*
  each answer choice is right or wrong** (79% vs 52%), cumulative review of prior content
  (~21 pts), and **mixing/interleaving topics** while studying (~21 pts).
- **Mechanism.** These behaviors are exactly the durable-learning levers from the other papers:
  retrieval, self-testing, self-explanation, spacing, interleaving. The study frames disparities
  through Ecological Systems Theory — score gaps partly reflect **differential awareness and
  access** to good strategies and free resources, not ability.
- **Caveats.** Descriptive/correlational (self-report survey); cannot prove causation, and
  sampling bias is possible. Behaviors co-occur with other advantages.
- **Chemistry-course generalization.** Two students can spend equal time and learn unequally
  depending on *how* they study. The product should not just *host* content; it should
  **actively steer learners into the high-value behaviors** (baseline diagnostics, practice
  testing, self-explanation of distractors, cumulative/interleaved review) and **lower the
  "how do I start?" barrier** — the single biggest reported obstacle for lower scorers. Because
  this app already **degrades gracefully when AI is off / offline**, it is well-positioned on the
  access/equity dimension; features should preserve that.

### Karpicke & Roediger (2008) — The Critical Importance of Retrieval for Learning
*(Science, 319, 966–968.)*

- **Core finding.** After items were learned once, **repeated *testing* produced large gains in
  one-week delayed recall, while repeated *studying* produced essentially none.** Dropping items
  from testing (but keeping studying) crushed retention; dropping them from studying (but keeping
  testing) barely hurt.
- **Mechanism (the "testing effect").** The *act of retrieval* — effortfully reconstructing
  information — is itself a memory-modifying event that strengthens and reorganizes the trace far
  more than re-exposure does.
- **Caveats.** Retrieval must be **successful enough** (with feedback) to avoid entrenching
  errors; the benefit is largest at a delay (it can look equal or worse immediately — see
  Soderstrom & Bjork). Crucially, **students' predicted performance was uncorrelated with actual
  recall** — learners do not feel retrieval's benefit and under-use it.
- **Chemistry-course generalization.** Lessons should **end in retrieval, not rereading**: free
  recall of the recap, self-testing, flashcard-style recall, "explain it back." The app's checks
  and Practice page already do retrieval, but mostly as **recognition (MCQ)**; free **recall**
  (blank page) is stronger and currently missing. The "predictions ≠ performance" result is a
  direct mandate for a calibration feature.

### Cepeda et al. (2006) — Distributed Practice: A Review and Quantitative Synthesis
*(Psychological Bulletin, 132, 354–380; 839 assessments across 317 experiments.)*

- **Core finding.** **Spaced practice beats massed practice for long-term retention**, robustly,
  across hundreds of studies. Critically, **interstudy interval (ISI) and retention interval
  interact**: the ISI that maximizes final-test retention *increases as the retention interval
  increases*.
- **Mechanism.** Spacing forces some forgetting between encounters; the harder, partly-failed
  retrieval that follows produces stronger re-encoding (study-phase retrieval / encoding
  variability accounts).
- **Caveats.** Most lab studies used short intervals; benefits depend on the gap being matched to
  how long retention is needed. Too short ≈ massing; very long risks total forgetting.
- **Chemistry-course generalization.** Concepts should recur **across days/weeks**, not just
  within the lesson. The app's SRS already does this — but with **fixed SM-2 steps** that ignore
  *when the learner actually needs to know it* (a unit test, an exam, end of course). That's what
  the 2008 paper sharpens.

### Cepeda et al. (2008) — Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention
*(Psychological Science, 19, 1095–1102; >1,350 participants, gaps up to 3.5 months, final test up
to 1 year.)*

- **Core finding.** For any given test delay, increasing the study gap **first raises, then
  lowers** final-test performance — an inverted-U "ridgeline." The **optimal gap grows with test
  delay**, but as a *proportion* of the delay it **shrinks**: ~20–40% of a 1-week delay, but only
  ~5–10% of a 1-year delay.
- **Mechanism.** There's a "sweet spot" of forgetting — review when retrieval is **effortful but
  still possible.** The Brainlift's own insight echoes this: *harder material can tolerate a
  shorter gap before retrieval.*
- **Caveats.** The exact optimum is broad/flat (good news — you don't need to be perfect), and it
  depends on knowing the target retention horizon. "Many common educational practices are highly
  inefficient" precisely because they ignore this.
- **Chemistry-course generalization.** Scheduling should be **horizon-aware**: if a learner sets a
  goal/"test" date, gaps should be set as a fraction of time-to-goal (start short, expand). This
  is a clean, mostly-pure extension of `srs.js`.

### Kornell & Bjork (2008) — "Is Spacing the Enemy of Induction?" (Interleaving)
*(Psychological Science, 19, 585–592.)*

- **Core finding.** Learners studied paintings by different artists either **massed** (all of one
  artist together) or **interleaved**. Counter to intuition, **interleaving produced markedly
  better ability to identify the artist of *new* paintings** (inductive category learning) — yet
  ~80% of participants *believed massing helped more*, even after their own test disproved it.
- **Mechanism.** Interleaving **juxtaposes** categories, making their **distinguishing features**
  salient; it supports *discrimination*, not just familiarity. Massing creates fluency that feels
  like learning (a metacognitive illusion).
- **Caveats.** When the goal is finding a *commonality* (not discriminating), or categories are
  already easy to tell apart, massing can win; learners need enough baseline familiarity first.
  Interleaving is a *desirable difficulty* — it feels worse while working better.
- **Chemistry-course generalization.** Chemistry is **full of confusable category pairs**: ionic
  vs covalent bonds, mass vs weight, element vs compound vs mixture, physical vs chemical change,
  acids vs bases, atom vs ion vs isotope. Interleaving these (not blocking them) is the textbook
  use case. Also a direct warning: do **not** let the UI optimize for the *feeling* of fluency.

### Soderstrom & Bjork (2015) — Learning Versus Performance: An Integrative Review
*(Perspectives on Psychological Science, 10, 176–199.)*

- **Core finding.** **Performance (what you can do now) is an unreliable index of learning (durable
  capability).** Manipulations can *diverge*: easy/blocked/massed conditions boost performance now
  but hurt later retention/transfer, while **desirable difficulties** (spacing, interleaving,
  retrieval, varied practice, reduced feedback) depress performance now but **improve** durable
  learning.
- **Mechanism.** Conditions that increase encoding effort and retrieval difficulty build more
  flexible, durable representations even though they slow visible progress.
- **Caveats.** "Desirable" has limits — difficulties must be *surmountable* for the learner
  (novices can be overwhelmed; this is where CLT bounds it). Learning must be assessed by
  **delayed and transfer** tests, not acquisition-phase performance.
- **Chemistry-course generalization.** First-attempt accuracy *within a session* is a
  **performance** signal, not proof of learning. The product should measure mastery with
  **delayed retrieval and transfer items** and clearly distinguish "you can do this right now"
  from "this has stuck." It also legitimizes UX that feels a bit harder.

### Bastani et al. (2025) — Generative AI Can Harm Learning Without Guardrails
*(PNAS, 122; RCT, ~1,000 high-school math students, Turkey.)*

- **Core finding.** Three arms: control, **GPT Base** (ChatGPT-like), **GPT Tutor** (hint-only,
  teacher-authored solutions + common-mistake guidance in the system prompt, never reveals the
  answer). On *assisted practice*, GPT Base +48% and GPT Tutor +127% vs control. On the
  **unassisted exam**, **GPT Base scored 17% *below* control** (net harm), while **GPT Tutor was
  statistically indistinguishable from control** — guardrails erased the harm.
- **Mechanism.** With no guardrails, students used the AI as a **crutch** — copying answers
  (often the *wrong* answers; GPT-4 was correct only ~51% of the time) instead of engaging. With
  GPT Tutor, conversations were more substantive (attempts, asking for help) and grew more so over
  time. Students **mis-perceived** their learning in both arms (felt they learned more than they
  did).
- **Caveats.** Single subject (math), single school, short-term outcomes, 2023 models. The
  authors note even GPT Tutor was *passive* (only responded when asked) and suggest combining
  pedagogy-aware orchestration (identify misconception → targeted hint) with generative
  flexibility, and "co-pilot" designs that assist rather than replace effort.
- **Chemistry-course generalization.** This is the central design constraint for *every* AI
  feature here. The app's **4-level hint ladder** (`tutorPrompt.js`) — gentle nudge → concept →
  worked next step → full answer only at the end — is essentially the GPT-Tutor guardrail and
  should be the template. What's still missing: **measuring reliance** (detecting crutch behavior)
  and **gating help behind a genuine attempt** so the AI scaffolds reasoning and **fades**, rather
  than answering.

### Experts (one-line characterizations)
- **Robert A. Bjork** — *Desirable difficulties* and the learning-vs-performance distinction;
  spacing, interleaving, retrieval as productive struggles.
- **Henry L. Roediger III** — The *testing effect*: tests don't just measure learning, they
  *cause* it (test-enhanced learning).
- **Jeffrey D. Karpicke** — *Retrieval practice* as a primary driver of meaningful, durable
  learning; documents how badly learners misjudge it.
- **John Sweller** — *Cognitive Load Theory*: design instruction around working-memory limits;
  worked examples and reducing extraneous load for novices.
- **Alan Baddeley** — *Working memory* architecture (multicomponent model); the capacity limit
  that CLT is built on.
- **Nicholas Cepeda** — *Spacing/distributed practice* and the optimal-gap ridgeline (gap should
  scale with retention interval).
- **Sparrow, Liu & Wegner (2011)** — *Google effects on memory* / **cognitive offloading**: when
  people expect to be able to look something up, they remember *where* to find it rather than the
  thing itself — the conceptual ancestor of "AI cognitive debt."
- **Hamsa Bastani** — *AI & learning*: generative AI can boost immediate performance yet erode
  independent skill unless deployed with learning-preserving guardrails.

---

## (c) Cross-paper synthesis & insights

**Unifying theme: durable learning is built by effortful, well-timed retrieval — and almost every
"feels good" shortcut works against it.**

1. **Learning ≠ performance is the master frame.** (Soderstrom & Bjork) Retrieval (Karpicke),
   spacing (Cepeda), and interleaving (Kornell & Bjork) all *depress* in-the-moment performance
   while *raising* delayed retention. Therefore: (a) build in desirable difficulties on purpose,
   and (b) **measure success after a delay / on transfer**, never by acquisition-phase accuracy.

2. **Retrieval > rereading.** (Karpicke & Roediger; Roediger; Sein) Reconstructing knowledge beats
   re-exposure. Recognition (MCQ) helps, but **free recall** is the stronger dose. Self-explanation
   ("why is this option wrong?") is a retrieval+elaboration hybrid and was a top discriminator in
   Sein's data.

3. **Spacing + the optimal gap.** (Cepeda 2006/2008) Distribute practice; choose the gap as a
   function of how long retention must last (~10–20% of the horizon as a usable heuristic), and
   **expand** intervals as items strengthen. Harder material tolerates shorter gaps.

4. **Interleaving for discrimination.** (Kornell & Bjork) Mixing confusable categories teaches the
   *boundaries* between them. The win is biggest exactly where novices conflate things.

5. **Cognitive load bounds the difficulties.** (Baddeley; Sweller) Novices have tiny working-memory
   budgets, so difficulties must be *surmountable*. Worked examples and step-by-step fading prevent
   overload; this is the safety rail that keeps "desirable difficulty" from becoming "destructive
   difficulty."

6. **AI guardrails prevent cognitive debt.** (Bastani; Sparrow et al.) AI that hands over answers
   triggers offloading and net harm; AI that **prompts retrieval, scaffolds reasoning, and fades**
   preserves (Bastani) or could enhance learning. The reliability problem (AI is often wrong)
   doubles the stakes for novices who can't catch errors.

7. **Metacognition is systematically broken.** (Karpicke; Kornell & Bjork; Soderstrom & Bjork;
   Bastani) Across *four* of these papers, learners confidently mis-judge their own learning —
   preferring massing, under-valuing retrieval, feeling they learned from the AI when they didn't.
   Any product relying on learner choice must **correct calibration**, not defer to felt fluency.

**Where principles interact or trade off:**

- **Desirable difficulty ⟷ cognitive load.** Spacing/interleaving/reduced hints help — *until*
  they overwhelm a novice. Resolution: **scaffold first, fade toward difficulty.** Give worked
  examples and blocked practice for a brand-new concept, then interleave and space once a baseline
  exists. (Kornell & Bjork explicitly note learners need enough familiarity before interleaving
  pays.)
- **Immediate engagement ⟷ durable learning.** Smooth AI answers and massed review feel great and
  spike short-term metrics; that's the trap (Bastani; Kornell & Bjork's massing illusion). The app
  must resist optimizing for the *feeling* of fluency or for in-session accuracy alone.
- **Spacing gap: too short vs too long.** Short gaps feel fluent but under-train; long gaps risk
  irrecoverable forgetting. The optimal-gap ridgeline is the trade-off curve to ride.
- **Personalization ⟷ over-reliance.** A maximally helpful AI tutor can become a crutch. The
  resolution is *effort-gated* help and reliance monitoring (feature #6).
- **Access/equity ⟷ AI richness.** (Sein) The biggest gaps are *awareness and access*. Rich AI
  features must not become the only path; graceful, offline-friendly degradation (already a design
  principle here) keeps the floor high while AI raises the ceiling.

---

## (d) Prioritized, research-backed AI feature proposals

Ranking heuristic: **impact on *durable* learning × feasibility** (feasibility is high when the
feature extends infrastructure that already exists). All proposals inherit the app's existing
guardrails: graceful no-op when `aiEnabled` is false, schema-validated JSON via `generateJSON`,
strict course grounding, and "never fabricate."

| Rank | Feature | Principle(s) & citation | Builds on (existing infra) | Effort | Impact×Feasibility |
|------|---------|-------------------------|----------------------------|--------|--------------------|
| 1 | Free-Recall "Brain Dump" & Teach-Back | Retrieval practice (Karpicke & Roediger 2008; Roediger; Sein 2025) | `gradeFreeResponse.js`, `adaptiveLessonCheck.js`, `memoryModel.js`/`srs.js`, `LessonComplete.jsx` | M | ★★★★★ |
| 2 | Goal-Aware Optimal-Gap Scheduler | Spacing + optimal gap (Cepeda 2006, 2008) | `srs.js`, `recommender.js`, `memoryModel.js`, Practice due-mode | M | ★★★★★ |
| 3 | Discrimination Decks (interleaved contrast sets) | Interleaving for induction (Kornell & Bjork 2008) | `practiceGenerator.js`/`reviewGenerator.js`, `misconception.js`, `data/chemistryCourse.js` | M | ★★★★☆ |
| 4 | Faded Worked Examples | Cognitive load theory + worked-example effect (Sweller; Baddeley & Hitch 1974); fading (Bastani) | `tutorPrompt.js` hint ladder, `TutorContext.jsx`, check renderers | M/L | ★★★★☆ |
| 5 | Durable Mastery vs. Practice Performance | Learning ≠ performance; delayed/transfer testing (Soderstrom & Bjork 2015) | `ProgressContext.jsx`, `srs.js`, `learnerProfile.js`, `LessonComplete`/profile UI | M | ★★★★☆ |
| 6 | Reliance Meter & Effort-Gated Tutor | AI guardrails / cognitive debt (Bastani 2025; Sparrow et al. 2011) | `TutorContext.jsx`, `tutorPrompt.js` hint ladder, `memoryModel.js` | M | ★★★★★ |
| 7 | Confidence Calibration (predict-then-check) | Metacognitive illusions (Karpicke 2008; Kornell & Bjork 2008; Soderstrom & Bjork 2015) | check components, `PredictRevealCard.jsx`, `memoryModel.js` | S/M | ★★★★☆ |
| 8 | Diagnostic Baseline + Evidence-Based Study Plan | Baseline assessment & high-value behaviors (Sein 2025; Soderstrom & Bjork 2015) | `recommender.js`, `srs.js` seeding, `memorySummary.js` | M | ★★★☆☆ |
| 9 | Self-Explanation of Distractors | Self-explanation / elaborative retrieval (Sein 2025; Karpicke) | `anchoredExplain.js`, check components | S | ★★★★☆ |

### 1. Free-Recall "Brain Dump" & Teach-Back  *(Retrieval practice)*
- **Principle / citation.** Free recall is a stronger retrieval dose than recognition (Karpicke &
  Roediger, 2008); self-explanation/"explain it back" was a top discriminator of high scorers
  (Sein et al., 2025).
- **What it does (UX).** At the end of a lesson (and as a Practice mode), show a blank box:
  *"Without looking back, write everything you remember about [lesson]."* or *"Explain [concept]
  as if teaching a friend."* The learner types from memory; AI grades the recall against the
  lesson's `recap` + `learningObjectives`, returns **what they nailed, what they missed, and one
  corrective nudge** — then offers a one-tap "review the gaps." Missed concepts seed SRS cards and,
  if a clear error appears, the misconception ledger.
- **Builds on.** `gradeFreeResponse.js` (rubric grading already returns `missedConcepts`);
  `adaptiveLessonCheck.js` pattern for lesson grounding; `recordReview`/`recordMisconception` and
  `seedCards` in `srs.js`/`memoryModel.js`; lives naturally on `LessonComplete.jsx` and the
  Practice page. The course data already ships `recap[]` per lesson — an ideal grading rubric.
- **Guardrails (anti-cognitive-debt).** **Recall happens before any tutor help is available** for
  that screen — retrieval first. AI **grades and points at gaps**; it does not pre-write the
  answer or let the learner peek. Feedback names the gap and routes to retrieval, not to a handed
  answer.
- **Effort.** **M.** New free-recall surface + a recap-grounded grading prompt; reuses grading,
  memory, and SRS plumbing.

### 2. Goal-Aware Optimal-Gap Scheduler  *(Spacing / optimal gap)*
- **Principle / citation.** Optimal review gap scales with the retention horizon and expands over
  time (Cepeda et al., 2006, 2008); review when retrieval is *effortful but possible*.
- **What it does (UX).** Learner optionally sets a **goal/"test" date** (or a default rolling
  horizon). The scheduler sizes the first gap as a fraction of time-to-goal (start near the
  ~10–20% heuristic, expand on success), so a learner two weeks from a goal reviews on a tighter
  cadence than one three months out. Difficulty-aware: harder items (more lapses / lower ease /
  flagged misconceptions) get **shorter** gaps. The recommender's "spaced review is due" copy can
  explain *why now* ("you're 9 days out and this is at the forgetting sweet spot").
- **Builds on.** `srs.js` is already a pure, isolated engine — extend `reviewCard`/scheduling with
  a horizon parameter and an expanding-gap policy; add a `goalDate` to learner memory; the
  recommender and Practice due-mode already consume `dueCards`/`dueCount`.
- **Guardrails.** Scheduling math is deterministic/pure (no AI needed for the core); any AI use is
  limited to a one-line rationale (already the `generateRecommendationRationale` pattern). Honest
  framing: review is timed to be *hard on purpose*.
- **Effort.** **M.** Mostly pure scheduling math + a goal-date field + recommender copy.

### 3. Discrimination Decks (Interleaved Contrast Sets)  *(Interleaving)*
- **Principle / citation.** Interleaving confusable categories improves discrimination and transfer
  far more than blocking, despite feeling harder (Kornell & Bjork, 2008).
- **What it does (UX).** A practice mode that deliberately **juxtaposes confusable chemistry
  pairs/sets** — ionic vs covalent, element/compound/mixture, mass vs weight, physical vs chemical
  change, atom/ion/isotope, acid vs base. Items mix categories question-to-question and ask
  *"which is it, and what's the tell?"* Seeds can come from a small curated list of known
  confusables (authorable in `chemistryCourse.js`) **and** from the learner's own misconception
  ledger (their personal confusions). A short note manages the **massing illusion**: "Mixing topics
  feels harder — that's why it works."
- **Builds on.** `practiceGenerator.js`/`reviewGenerator.js` (generation + normalization + the
  existing `slide`/`checkConfig` contract); `misconception.js`/`topMisconceptions` for
  personalized confusable pairs; Practice already fires an `interleave` quest when ≥2 topics mix.
- **Guardrails.** Strictly course-grounded generation (existing constraint); requires baseline
  familiarity first (offer interleaving *after* a concept's intro/blocked practice — respecting the
  CLT trade-off). No answer-dumping; explanations route through the hint ladder.
- **Effort.** **M.** New generator prompt + a small confusable-pairs catalog; reuses rendering.

### 4. Faded Worked Examples  *(Cognitive-load-aware scaffolding)*
- **Principle / citation.** Working memory is limited (Baddeley & Hitch, 1974); novices learn
  multi-step procedures better from **worked examples** that **fade** to completion problems and
  then independent solving (Sweller's CLT / worked-example & completion effects); fading is also
  Bastani's prescription for AI support.
- **What it does (UX).** For multi-step procedures (balancing equations, mole/molar-mass
  conversions, naming compounds), the first encounter shows a **fully worked example with the
  reasoning**, then a **completion problem** (most steps shown, learner fills the last/most
  diagnostic step), then a **near-independent** problem (only a scaffold prompt), then fully
  independent. The fade advances as the learner succeeds and **retreats** if they struggle — using
  the same per-slide attempt/struggle signals the tutor already tracks.
- **Builds on.** The **4-level hint ladder** in `tutorPrompt.js` is already a fading mechanism;
  generalize it from "hints on one problem" to "scaffolding across a short problem sequence."
  `TutorContext.jsx` already tracks per-slide attempts, struggle streaks, and hint level;
  `adaptiveLessonCheck.js` shows the difficulty-by-comprehension pattern.
- **Guardrails.** The worked example is a *teaching* artifact, not an answer to the learner's
  graded item; the graded step is always *theirs*. Support **fades** automatically — the opposite
  of an always-on crutch (directly answers Bastani).
- **Effort.** **M/L.** Needs a worked-example generator + a small sequence state machine; renderers
  for completion-style steps. Highest build cost of the top tier, but high novice impact.

### 5. Durable Mastery vs. Practice Performance  *(Learning-vs-performance measurement)*
- **Principle / citation.** Acquisition performance is an unreliable index of learning; measure
  with **delayed and transfer** assessments (Soderstrom & Bjork, 2015; Karpicke's delayed-recall
  design).
- **What it does (UX).** Introduce two distinct signals in the profile/home: **Practice
  Performance** (in-session first-try accuracy — already computed) and **Durable Mastery**
  (performance on **delayed** reviews ≥1 day later and on **transfer** items — same concept, new
  scenario). A concept only earns "mastered" after it survives a spaced delay and/or a transfer
  item, not after one good in-lesson check. Surface honestly: *"You can do this now — let's see if
  it sticks in a few days."*
- **Builds on.** `ProgressContext` already separates `firstAttemptCorrect` from later attempts;
  `srs.js` already creates delayed reviews; `adaptiveLessonCheck.js`/generators can mint a
  **transfer-flavored** item (flagged `transfer: true`). `learnerProfile.js`/`memoryModel.js` can
  carry a per-concept durable-mastery state used by the recommender.
- **Guardrails.** Pure metric/scheduling logic (no fabrication risk). Counters the massing/fluency
  illusion by **refusing to call performance "mastery."**
- **Effort.** **M.** New metric + a `transfer` item flag + delayed-check accounting; reuses SRS.

### 6. Reliance Meter & Effort-Gated Tutor  *(AI guardrail / anti-cognitive-debt)*
- **Principle / citation.** Un-guardrailed AI becomes a crutch and *lowers* unaided performance;
  hint-only, attempt-first tutoring removes the harm (Bastani et al., 2025); expecting easy lookup
  reduces what we encode (Sparrow et al., 2011).
- **What it does (UX).** (a) **Effort gate:** on a graded item, substantive help requires a genuine
  attempt first (or an explicit "I'm stuck" after trying) — retrieval before rescue. (b) **Reliance
  signal:** track how often the learner jumps straight to the **full-answer hint level (4)** vs
  solving after a nudge, per topic; when reliance is high, the tutor **fades** (starts at gentler
  hints, asks the learner to attempt the next step) and the system flags the topic for un-aided
  retrieval. (c) Gentle, honest nudge when crutch behavior is detected ("Try a first step yourself
  — that's the part that makes it stick").
- **Builds on.** The hint ladder (`tutorPrompt.js`) and `TutorContext.jsx` already track hint level,
  attempts, and struggle per slide and already **refuse to dump answers until level 4** — this
  feature *measures* and *acts on* that telemetry. Reliance state stored in `memoryModel.js`.
- **Guardrails.** This *is* the guardrail layer; it operationalizes Bastani directly. It also
  protects against AI error harming novices by keeping the learner doing the reasoning.
- **Effort.** **M.** Mostly telemetry + policy on top of existing tutor state; a small reliance
  meter UI.

### 7. Confidence Calibration (Predict-Then-Check)  *(Metacognition)*
- **Principle / citation.** Learners' predictions are uncorrelated with actual recall and they
  prefer illusory fluency (Karpicke & Roediger, 2008; Kornell & Bjork, 2008; Soderstrom & Bjork,
  2015; perception mismatch in Bastani, 2025).
- **What it does (UX).** Before a check/review item (or a Heat Check round), ask a quick *"How sure
  are you?"*; afterward, show **predicted vs actual** and a running **calibration** stat
  ("You feel surest on naming, but it's actually your weakest — let's retrieve it more"). Feeds the
  recommender toward over-confident/under-practiced topics.
- **Builds on.** `PredictRevealCard` already embodies predict-before-reveal; check components and
  `memoryModel.js` for storing calibration.
- **Guardrails.** Pure measurement; nudges toward retrieval, not answers.
- **Effort.** **S/M.**

### 8. Diagnostic Baseline + Evidence-Based Study Plan  *(Onboarding; equity)*
- **Principle / citation.** Higher-scoring (lower-SES) examinees disproportionately did **baseline
  assessment, practice testing, self-explanation, and cumulative review**, and the biggest barrier
  for lower scorers was *not knowing how to start* (Sein et al., 2025); establishing a baseline is
  a learning-vs-performance best practice (Soderstrom & Bjork, 2015).
- **What it does (UX).** A short opt-in **baseline diagnostic** (a few interleaved items spanning
  the course) that seeds SRS cards + `weakConcepts`, then produces a concrete, **behavior-named**
  study plan ("retrieve daily, space these 3 topics, interleave bonding types, re-test Friday").
  Lowers the "how do I start?" barrier and explicitly teaches the high-value behaviors.
- **Builds on.** `recommender.js`, `srs.js` `seedCards`, `memorySummary.js` (goals already a
  first-class field in learner memory).
- **Guardrails.** Plan steers learners into effortful behaviors; remains useful with AI off
  (static plan template), preserving the access floor.
- **Effort.** **M.**

### 9. Self-Explanation of Distractors  *(Elaborative retrieval)*
- **Principle / citation.** Explaining *why* each option is right/wrong was a top discriminator of
  high scorers (Sein et al., 2025) and is an elaborative form of retrieval (Karpicke).
- **What it does (UX).** After a multiple-choice attempt, optionally prompt: *"In one line, why is
  your choice right — and why is [distractor] wrong?"* The AI gives brief feedback on the
  *explanation* (not just correctness), reinforcing the discrimination.
- **Builds on.** `anchoredExplain.js` (already fires a tailored explanation after a full attempt —
  invert it so the **learner explains first**); `gradeFreeResponse.js` for grading the rationale.
- **Guardrails.** Learner explains before the AI does — retrieval/elaboration before exposition.
- **Effort.** **S.**

---

## (e) Guardrails & anti-cognitive-debt principles (apply to *every* feature)

Drawn from Bastani et al. (2025) and Sparrow et al. (2011), and consistent with how the app's
existing tutor already behaves:

1. **Attempt before assistance (retrieval-first).** The learner must try before the AI gives
   substantive help. No help surface should let a learner skip the reconstruction step.
2. **Scaffold, never hand over.** Default to the **hint ladder** — nudge → concept → worked next
   step → full answer only as a last resort. The app's `HINT_LADDER` is the reference
   implementation; reuse it everywhere, don't bypass it.
3. **Fade support over time.** Help should *decrease* as competence grows (faded worked examples,
   reliance-aware tutoring). Always-on help is the crutch failure mode.
4. **Measure and discourage over-reliance.** Track crutch behavior (jumping to full answers,
   not attempting) and respond by fading + routing to independent retrieval (feature #6).
5. **Measure durable learning, not just performance.** Prefer delayed/transfer checks; never label
   in-session accuracy as "mastery" (feature #5). Resist UX that optimizes for the *feeling* of
   fluency (the massing illusion).
6. **Correct metacognition.** Because learners reliably mis-judge their learning, surface
   predicted-vs-actual and reliance honestly rather than deferring to felt confidence (feature #7).
7. **Ground strictly; never fabricate.** Keep every AI call grounded in course content with
   schema-validated output and explicit "don't invent facts" instructions (already standard via
   `firebase/ai.js` + `GROUNDING_GUARDRAIL`). This matters doubly because novices can't catch AI
   errors (GPT-4 was wrong ~49% of the time in Bastani's math task).
8. **Preserve the access floor (equity).** Every feature must degrade gracefully when AI is off or
   offline (already an app principle), so the highest-value behaviors remain available to all
   learners (Sein et al.).
9. **AI assists the learner's thinking; it does not replace it.** The throughline of the entire
   literature: durable learning is the learner's effortful work — AI's job is to make that effort
   well-timed, well-scaffolded, and well-measured.

---

## (f) References

- Baddeley, A. D., & Hitch, G. (1974). Working memory. *The Psychology of Learning and Motivation*,
  8, 47–89. — reviewed via Chai, W. J., Abd Hamid, A. I., & Abdullah, J. M. (2018). Working memory
  from the psychological and neurosciences perspectives. *Frontiers in Psychology*, 9, 401.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC5881171/
- Swan Sein, A., McClure, S. C., Chanatry, J. A., et al. (2025). Examining differences in the
  preparation and performance of U.S. MCAT examinees from lower-SES backgrounds. *Teaching and
  Learning in Medicine*, 1–14. https://doi.org/10.1080/10401334.2025.2492620 — with AAMC Post-MCAT
  Questionnaire data, https://www.aamc.org/data-reports/students-residents/report/post-mcat-questionnaire-pmq
- Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning.
  *Science*, 319(5865), 966–968. https://pubmed.ncbi.nlm.nih.gov/18276894/
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in
  verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3),
  354–380. https://pubmed.ncbi.nlm.nih.gov/16719566/
- Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in
  learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095–1102.
  https://pubmed.ncbi.nlm.nih.gov/19076480/
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of
  induction"? *Psychological Science*, 19(6), 585–592.
  https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.Bjork.2008a.pdf
- Soderstrom, N. C., & Bjork, R. A. (2015). Learning versus performance: An integrative review.
  *Perspectives on Psychological Science*, 10(2), 176–199.
  https://pubmed.ncbi.nlm.nih.gov/25910388/
- Bastani, H., Bastani, O., Sungu, A., Ge, H., Kabakcı, Ö., & Mariman, R. (2025). Generative AI
  without guardrails can harm learning: Evidence from high school mathematics. *PNAS*, 122.
  https://www.pnas.org/doi/10.1073/pnas.2422633122
- Sparrow, B., Liu, J., & Wegner, D. M. (2011). Google effects on memory: Cognitive consequences of
  having information at our fingertips. *Science*, 333(6043), 776–778.
- Sweller, J. (1988/2011). Cognitive load theory. (Cognitive Load Theory and the worked-example
  effect.) — foundational instructional-design framework referenced throughout.

*Expert homepages: Robert Bjork (https://bjorklab.psych.ucla.edu/), Henry L. Roediger III
(https://psych.wustl.edu/people/henry-l-roediger-iii), Jeffrey Karpicke
(https://www.purdue.edu/hhs/psy/directory/faculty/karpicke_jeffrey.html).*

---

### Appendix: existing app infrastructure these proposals reuse

- **AI gateway** — `src/firebase/ai.js`: `generateText`, `streamText`, `streamChat`,
  `generateJSON`, `Schema`, `SYSTEM_INSTRUCTION`, `aiEnabled` (graceful no-op fallbacks).
- **Spaced repetition** — `src/ai/srs.js`: pure SM-2 engine (`createCard`, `reviewCard`, `isDue`,
  `dueCards`, `seedCards`).
- **Recommender** — `src/ai/recommender.js`: rule-based "what next" + AI rationale.
- **Generators** — `practiceGenerator.js`, `reviewGenerator.js`, `challengeQuestions.js`,
  `adaptiveLessonCheck.js`.
- **Tutor** — `tutorPrompt.js` (4-level `HINT_LADDER`, illustration protocol, grounding guardrail,
  preferences) + `TutorContext.jsx` (attempt/struggle/hint-level telemetry, anchored explain,
  proactive help).
- **Grading & misconceptions** — `gradeFreeResponse.js`, `misconception.js`.
- **Learner model** — `learnerProfile.js`, `memoryModel.js`, `memorySummary.js`, `memoryStore.js`
  (persistent cross-session memory; misconception ledger; SRS map).
- **Progress** — `ProgressContext.jsx` (first-attempt vs later-attempt accounting; streaks).
- **Surfaces** — `pages/Practice.jsx` (on-demand + due-mode), `ReviewPage.jsx`, `HeatCheck.jsx`
  (timed mastery), `Playground.jsx` (AI Lab), `CourseOverview.jsx`, `LessonComplete.jsx`.
- **Course data** — `data/chemistryCourse.js` (lessons carry `learningObjectives[]` and `recap[]`
  — ideal grounding/rubrics for free-recall and discrimination decks).
- *(Concurrent, out of scope here: an AI-driven **daily-quest** system already references
  `retrieval`, `spaced`, `interleave`, and `transfer` quest types.)*
