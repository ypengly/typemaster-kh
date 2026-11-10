# TypeMaster KH

A bilingual typing academy for **English** and **Khmer (ភាសាខ្មែរ)**: 200 lessons (100 per language), a real-time typing engine that treats Khmer subscripts and vowels as single characters, XP, levels, badges, streaks, five games, a speed test, and a PWA that installs on mobile and desktop.

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style components · Lucide icons · LocalStorage · PWA.

## Setup

Requires Node.js 20 or newer.

```bash
npm install
npm run check:lessons   # validates the 200-lesson dataset
npm run dev             # http://localhost:3000
```

Production build: `npm run build && npm start`. Type check: `npm run typecheck`.

Fonts (Bricolage Grotesque, Figtree, Noto Sans Khmer) are loaded with `next/font/google`, so the first build needs internet access. Khmer text falls back to Khmer OS / Leelawadee UI / Khmer UI if a font is missing.

## Deploy

**Vercel (simplest):** push to GitHub, import the repository at vercel.com, keep the defaults, deploy. No environment variables are needed for this version.

**Other hosts:** any Node host works with `npm run build && npm start`. For static hosting add `output: "export"` to `next.config.mjs` (remove the `headers()` block first) and publish the `out/` folder.

The service worker (`public/sw.js`) is registered only in production builds. Install the app from the browser's "Install" or "Add to Home Screen" menu.

## Project structure

```
src/
  app/                  pages: / (home), dashboard, academy/[lang], lessons, practice/[id],
                        speed-test, games, achievements, leaderboard, profile, settings
  components/           TypingEngine, ResultCard, Games (5 games), AppShell, charts, ui/ (Button, Card, Progress)
  data/
    english.ts          100 English lessons (Basic 1-30, Intermediate 31-70, Advanced 71-100)
    khmer.ts            100 Khmer lessons (same structure)
    index.ts            lookups: ALL_LESSONS, lessonsFor, getLesson, nextLesson
  lib/
    text.ts             Khmer-aware character clustering and comparison
    stats.ts            WPM / CPM / accuracy / completion
    progress.ts         XP, levels, stars, unlocking, applyResult()
    achievements.ts     25 badges
    pools.ts, daily.ts  word/sentence/passage pools and the deterministic daily challenge
    store.tsx           React context + persistence
    storage.ts          StorageAdapter interface (LocalStorage today)
    leaderboard.ts      leaderboard-ready score rows
scripts/check-lessons.ts
public/                 manifest, service worker, icons
```

## How the lessons work

Each lesson has: unique `id` (`en-001` … `km-100`), `language`, `difficulty`, `category`, `title`, `instructions`, target `text`, `estimatedMinutes`, `recommendedAccuracy`, and a default `completed: false`. The live completion status comes from saved progress (`getLessonStatus`: locked, available or completed).

- Lessons unlock in order inside each academy; Settings has an "Unlock all lessons" switch.
- A lesson is completed with at least one star. Stars need 100% completion: 1 star at (recommended − 10)% accuracy, 2 stars at the recommended accuracy, 3 stars at recommended + 5% (capped at 100%).
- To edit or add content, change the `groups` arrays in `src/data/*.ts` and run `npm run check:lessons`.

## Khmer typing

- `splitClusters()` in `src/lib/text.ts` groups a base letter with its coeng (្) subscripts, dependent vowels and signs, so one visible Khmer character counts as one character in progress, accuracy and CPM.
- While a cluster is still being composed (you typed ក, the target is កា) it is shown as pending, not as an error, and it is only judged once you move on.
- Vowels and signs typed after the subscripts in a different order are accepted. Zero-width spaces that some keyboards insert are ignored.
- Khmer reports CPM and accuracy first; WPM is shown for English only.
- Users need a Khmer keyboard layout (Windows `Win+Space`, macOS `Ctrl+Space`, or the Khmer keyboard on Android and iOS). The practice screen reminds them.
- Please have a native Khmer speaker proofread `src/data/khmer.ts` before public release. The text was written for typing practice and checked for valid Unicode structure, not reviewed by a Khmer editor.

## Statistics

- CPM = correct characters ÷ minutes. WPM (English) = correct characters ÷ 5 ÷ minutes.
- Accuracy = first-attempt hits ÷ characters judged. Fixing a mistake with Backspace does not remove it from "Total errors".
- Personal bests need at least 20 correct characters and 85% accuracy so tiny or careless runs cannot set records.

## Data and persistence

Everything is saved in LocalStorage under `typemaster-kh:v1` and restored on load: completed lessons and stars, XP, history (last 500 runs), achievements, streak, daily goal data, preferences and personal bests. Profile → Backup exports and restores it as JSON.

## Adding Supabase later

The app already isolates storage and identity:

1. `src/lib/storage.ts` defines `StorageAdapter` (`load`, `save`, `clear`). Write a Supabase adapter that stores the `AppState` JSON (or normalised tables) per auth user, and pass it to `<StoreProvider adapter={...} />` in `src/app/layout.tsx`.
2. `state.profile.userId` is a stable local id; replace it with the Supabase user id after sign-in and merge local progress into the cloud row on first login.
3. `src/lib/leaderboard.ts` defines `LeaderboardEntry` and `LeaderboardProvider`. Implement `top()` and `submit()` against a Supabase table and swap it in on the Leaderboard page. `scoreOf()` is the score formula (CPM × accuracy²).
4. Because `applyResult()` is a pure function, it can also run inside a Supabase Edge Function to validate scores server-side.

## Known limits

- The leaderboard is local to the device until a backend is added.
- Progress is per browser until cloud sync exists; use the backup file to move between devices.
- Android Khmer keyboards that rewrite text while composing can show a cluster as pending a little longer than desktop keyboards.
