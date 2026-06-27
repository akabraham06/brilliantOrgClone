# Introduction to Chemistry — Interactive Learning App

> **Subject: Chemistry.** This is a chemistry learning app. Every lesson, slide, and interactive teaches a foundational chemistry concept.

A Brilliant-inspired, mobile-friendly web app that teaches **introductory chemistry** to beginners (roughly high-school grades 9–11) through short, visual, interactive slides instead of long textbook passages. Each slide focuses on a single idea, pairs a concise explanation with a hands-on graphic, and many slides end with a quick knowledge check.

**Live site:** https://brilliantclone-561cc.web.app

## What it does

- Guides learners through a single, cohesive course — **Introduction to Chemistry** — built from small, one-idea-at-a-time slides.
- Teaches primarily through **interactive SVG, canvas, and 3D graphics**: drag-and-drop sorting, electron-shell builders, equation balancers, periodic-table explorers, molecular/ionic viewers, pH dials, gas-law simulations, and more.
- Embeds lightweight **knowledge checks** (classification, multiple choice, matching, equation balancing, pH placement, name building) with instant feedback and hints.
- Offers a **randomized course review** that pulls questions from across all lessons.
- **Tracks progress** per user (completed slides/lessons, course percentage, skill-check accuracy, and a daily streak), persisted to Firestore so learners resume where they left off across devices.
- Ships a polished, **dark-themed, responsive UI** with a light-theme toggle, designed to work cleanly from phones to desktops.

## Course content

The course covers eight lessons, in order:

1. Matter, Atoms, and the Periodic Table
2. Measurement, Units, and Scientific Notation
3. Atomic Structure
4. Chemical Bonding
5. Chemical Formulas and Naming Compounds
6. Chemical Reactions and Balancing Equations
7. The Mole, Molar Mass, and Stoichiometry
8. States of Matter, Solutions, and Acids/Bases

A cumulative **Course Review** and key-takeaways summary round out the experience.

> **Every lesson, slide, and knowledge check in this course was personally reviewed, looked over, and approved by me.** The AI layer below personalizes how this hand-curated content is explained and practiced — it never replaces the authored curriculum.

## Tech stack

- **React + Vite** — UI and fast dev/build tooling
- **React Router** — routing for the authenticated portal, course overview, and lesson player
- **CSS Modules** — component-scoped styling and theming via CSS variables
- **Firebase** — Authentication (Google + email/password), Cloud Firestore (course content + user progress), and Hosting
- **react-three-fiber + drei** — 3D interactives (lattices, gas/pressure, bond-energy scenes)
- **@visx** and **Framer Motion** — data-driven charts and smooth animations
- Interactive graphics are **SVG / HTML canvas / CSS**-based for crisp, responsive scaling

Course content is **data-driven**: lessons and slides are defined in a schema (`src/data/chemistryCourse.js`) and seeded to Firestore, so slides render dynamically by type via a reusable interaction-component registry.

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Lint
npm run lint

# Production build
npm run build

# Preview the production build locally
npm run preview
```

You'll need a Firebase project configured (Authentication + Firestore + Hosting) and the appropriate client config wired into the app. Course content is seeded with `scripts/seed.js` using a service-account key (set `GOOGLE_APPLICATION_CREDENTIALS`).

## Deployment

The app is a static SPA deployed to **Firebase Hosting**:

```bash
npm run build
npx -y firebase-tools@latest deploy --only hosting
```

Hosting serves from `dist/` with SPA rewrites configured in `firebase.json`.

## AI features (optional, OpenAI via a secure proxy)

The app includes an optional AI layer powered by **OpenAI**. The complete set of AI features:

- **AI Chemistry Tutor** — a context-aware tutor (the animated dot in the bottom-left) that streams responses grounded in the current slide.
- **Proactive help** — the tutor automatically offers help after a wrong answer or when it detects the learner is struggling.
- **Anchored deep explanation** — after a full attempt, an explanation card glides to the learner's chosen answer with a tailored "why."
- **Adaptive per-mistake feedback** — feedback written for the *specific* wrong option a learner selected.
- **AI-graded free-response skill checks** — open-ended answers scored for comprehension, feeding the learner's personalization profile and the tutor surfaces.
- **AI-graded free-recall ("brain dump")** — retrieval-practice prompts graded against the lesson's key ideas.
- **Adaptive end-of-lesson skill checks** — checks generated and calibrated to the learner's earlier in-lesson performance.
- **Personalized review** — an AI "Practice what you missed" generator, plus an on-demand practice generator.
- **Personalized lesson recaps** — tailored end-of-lesson summaries.
- **Misconception detection** — recurring conceptual errors are identified and logged.
- **Spaced-repetition scheduler** — surfaces learned concepts for timed review.
- **Adaptive recommender** — the "recommended next step" tuned to the learner.
- **Persistent learner memory** — a single profile that powers every feature above.
- **AI challenge questions** — fresh, generated items mixed into Heat Check.
- **AI Lab** — an exploratory sandbox with a conversational AI guide and open-ended challenges, scoped to the course.
- **AI-personalized daily quests** — performance-aware quests grounded in learning-science principles, with calibrated XP/coin rewards.
- **Accessibility rephrasing & feedback capture** — on-demand simpler rephrasing of tutor responses, plus thumbs feedback.
- **Persistent avatar companion** — an animated, cosmetic-aware companion (also used in loading states).

These features are **off by default** and the app behaves exactly as before when
they are disabled — every AI call degrades gracefully to the existing static
content. Personalization is done purely **in-context (prompting)**, never model
training: each call is grounded in the current slide plus a compact summary of the
learner's progress (weak lessons, missed checks, the specific wrong option just
chosen).

### Security model

The OpenAI secret key **never reaches the browser.** The client calls a
**Netlify Edge Function proxy** (`netlify/edge-functions/ai.ts`, route `/api/ai`)
with the signed-in user's Firebase ID token. The proxy verifies the token,
enforces per-user rate limits, a monthly token budget, and content moderation,
then injects the OpenAI key (read only from a Netlify env var) and forwards the
request to OpenAI. See `netlify/README.md` for the full deploy + env reference.

To turn the AI features on:

1. **Deploy the proxy.** Connect this repo to Netlify (it builds the SPA *and*
   the edge function). In the Netlify dashboard set, at minimum:
   - `OPENAI_API_KEY` — your OpenAI secret key (server-side only).
   - `FIREBASE_PROJECT_ID` — for ID-token verification.
   - `ALLOWED_ORIGIN` — the origin(s) the app is served from (e.g. your Firebase
     Hosting domain), comma-separated.
2. **Point the app at the proxy** in your `.env`, then rebuild:
   ```bash
   VITE_AI_ENABLED=true
   VITE_AI_PROXY_URL=https://YOUR-SITE.netlify.app/api/ai
   ```
   `VITE_AI_PROXY_URL` is baked into the build, so the Firebase-hosted app calls
   the Netlify-hosted endpoint. Optionally pin a model with `VITE_OPENAI_MODEL`.

Without `VITE_AI_ENABLED=true` and a reachable `VITE_AI_PROXY_URL` (and a
signed-in user), the AI calls no-op and the app falls back to static content.

## Project structure

```
src/
  components/      Shared UI + interactive components
    interactions/  Per-concept interactive graphics (SVG / canvas / 3D)
    lesson/        Slide shell, renderers, and the interaction/check registry
  context/         Auth, content, and progress React contexts
  data/            Course schema (chemistryCourse.js) + review questions
  pages/           Landing, Login, Home, Courses, Course overview, Lesson player, Review
  styles/          Global theme and tokens
scripts/seed.js    Seeds course content into Firestore
```
