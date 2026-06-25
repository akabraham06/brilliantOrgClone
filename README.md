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
