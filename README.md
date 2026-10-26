# Quell

**One short logic win. Then put the phone down.**

A free-with-ads web MVP for anti-doomscroll logic / brain-training puzzles.

## Features

- **Daily habit** — four mini puzzles + one rotating brain challenge, seeded by calendar date (same for everyone that day)
- **Mini Sudoku** (6×6, 2×3 blocks)
- **Pattern Set** (SET-lite triples)
- **Nonogram** (5×5 daily / practice; optional 10×10)
- **Number Match** (pairs that sum to 10)
- **Brain challenges** (1–3 min each):
  - **Schulte table** — find 1–25 in order on a 5×5 grid
  - **Stroop-lite** — tap the ink color, not the word
  - **N-back lite** — 1-back or 2-back letter match
  - **Digit span** — remember and enter growing digit sequences
- Local streak + best times / scores (LocalStorage, no signup)
- Ad placeholders: side/bottom banners + post-win interstitial only (never mid-round)
- PWA-ready (`manifest.webmanifest`)

## UI notes

- Calm dark/light palette (soft sage accent — not neon)
- Responsive shell: phone (~375px), tablet (~768px), desktop (≥1024px)
- Side ad chrome from ~900px up; bottom banner always
- Boards fluid to viewport; touch targets ≥44px
- Progress stays in the browser (`localStorage`)

## Live site

[https://vaishnavwalke.github.io/Ai-agent-projects-/](https://vaishnavwalke.github.io/Ai-agent-projects-/)

Pushes to `main` build the app and deploy `dist/` with GitHub Actions (`.github/workflows/pages.yml`). Vite `base` is `/Ai-agent-projects-/`.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173/Ai-agent-projects-/).

## Build static site

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

(If preview is already serving `dist/`, rebuild so it picks up UI changes.)

## Stack

Vite + React + TypeScript. No backend. CSS-only micro-interactions (no animation libraries).
