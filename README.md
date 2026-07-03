# PNLE Reviewer

A premium **Philippine Nurse Licensure Examination (PNLE)** reviewer web app —
lessons, flashcards, and a timed practice exam. This MVP covers **NP I —
Community Health Nursing** and is architected so NP II–V are added later as
**data files only**, with no code changes.

- **Stack:** React 18 + Vite, React Router, plain CSS (no backend, no database)
- **Persistence:** `localStorage` (flashcard mastery + exam scores)
- **Deploy target:** Netlify (free tier) — live at https://pnle-reviewer.netlify.app
- **Installable:** has a web app manifest + service worker, so it can be added
  to a phone's home screen and opens like a native app (offline app-shell
  caching after first visit)

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Build / preview a production bundle:

```bash
npm run build
npm run preview
```

---

## What's inside

| Feature | Status |
|---|---|
| **Practice exam** | 100 real, reviewed NP I items with answers + rationales. Timed, config-driven Part A/Part B split, per-question review. |
| **Flashcards** | 167 cards: 67 hand-curated cards tied to written lessons + 100 derived from the reviewed Q&A. Flip, "Got it / Need review", swipe on mobile, mastery saved to `localStorage`. |
| **Lessons** | 14 fully written NP I lessons across 3 content batches (health systems/COPAR/disaster + DOH national programs + vital statistics/school & occupational health) — objectives, core concepts, definitions, explanation, nursing management, board-exam focus, mnemonics — grouped by category, with search and a linked detail view. |
| **Home** | Quick stats (reviewed questions, mastery, best score, subjects) and recent attempts. |

### Content provenance & integrity

- Every lesson, flashcard, and exam question here is **`source: "reviewed"`**.
  Lessons and their derived flashcards ship as versioned batches
  (`np1-community-health-lessons-batch1.json` / `...-batch2.json`, and their
  matching `...-flashcards-*.json` files), each merged together in
  `src/data/subjects.js`. Batch 1 (health systems, epidemiology, COPAR, family
  nursing, disaster nursing) was cross-checked against RA 10121 and Philippine
  COPAR course materials — factual corrections (COPAR's 4 phases vs. the
  separate 5-stage Community Organizing Process, RA 10121's official paired
  terminology) are recorded in its `_meta.note`. Batch 2 (DOH national
  programs — immunization, TB/DOTS, RH Law, HIV policy, MNCHN/Unang Yakap) was
  written with active web search verification, flagging currency-sensitive
  facts (e.g. the Dec 2023 drug-resistant TB regimen shortening to ~6 months)
  explicitly in its `_meta.note`. Batch 3 (vital statistics/demography +
  school health/OK sa DepEd + occupational health/RA 11058 — closing two
  named TOS gaps) was also written with active web search verification
  (PSA, official RA text via lawphil.net, DepEd/DOLE sources), flagging
  snapshot-in-time figures (e.g. 2025 CBR, 2022 TFR) explicitly in its
  `_meta.note`. Exam questions come from a real 100-item NP I Community
  Health exam (Bukidnon State University College of Nursing, 2nd Sem SY
  2025–2026).
- The data model also supports **`source: "generated_draft"`**. Any future
  generated item is rendered with a visible **"Draft — pending review"** badge
  (see `src/components/SourceTag.jsx`) so unreviewed content is never presented
  as approved. There is **no generated content in this build.**
- Exam structure (5 subjects, 100 items, Part A 80% / Part B 20%) follows the
  **PRC Enhanced TOS, Board Resolution No. 10, s. 2025**. Part B for NP I is
  "Health Education & Research"; those items are tagged `part: "B"`.
- Lesson content still carries a handful of `[VERIFY]`-tagged references
  (e.g. exact RA 7160/RA 11223 provision numbers) that were flagged, not yet
  independently confirmed — visible in each lesson's `references` field.

---

## Project structure

```
scripts/parse_questions.py     # PDF-text -> src/data/np1-questions.json (idempotent)
scripts/np1_exam1_raw.txt      # extracted source text
src/
  config/examConfig.js         # item counts, timer, Part A/B target ratio
  data/
    np1-questions.json                            # 100 exam items + 9 scenarios
    np1-community-health-lessons-batch1.json       # 6 written lessons (systems/COPAR/disaster)
    np1-community-health-flashcards-batch1.json    # 29 lesson-derived flashcards
    np1-community-health-lessons-batch2.json       # 5 written lessons (DOH programs)
    np1-community-health-flashcards-batch2.json    # 20 lesson-derived flashcards
    np1-community-health-lessons-batch3.json       # 3 written lessons (vital stats, school/occupational health)
    np1-community-health-flashcards-batch3.json    # 18 lesson-derived flashcards
    subjects.js                # registry merging each subject's dataset batches + query helpers
  lib/
    exam.js                    # exam assembly (ratio-aware) + scoring
    flashcards.js              # merges curated lesson cards + question-derived cards
    storage.js                 # localStorage (mastery, exam history)
  components/                  # Home, Lessons, Flashcards, Exam, SourceTag
  App.jsx / main.jsx / index.css
```

### Adding NP II–V later (no refactor)

1. Produce `src/data/npX-questions.json` in the same shape as `np1-questions.json`
   (a `subject`, `source`, `situations`, and `questions[]`).
2. Optionally add one or more `npX-*-lessons-batchN.json` (a `lessons[]`
   array) and matching `npX-*-flashcards-batchN.json` (a `flashcards[]` array
   with `lesson_id` links) — lessons are optional per subject, and new
   content batches for an existing subject are additive: give each batch a
   unique lesson/flashcard `id` prefix and its own `_meta`, don't overwrite
   the previous batch's file.
3. In `src/data/subjects.js`, import them and add one `{ questions, lessons:
   [...batches], curatedFlashcards: [...batches] }` entry to `registry` — the
   registry merges all batches into one lesson list and one flashcard list
   per subject.
4. Remove that subject's entry from `comingSoonSubjects`.

Every screen, the exam engine, and the flashcard builder read subjects through
the registry, so no component code changes.

### Regenerating question data

```bash
npm run data      # runs scripts/parse_questions.py; requires Python 3 + pdftotext
```

The parser validates that exactly 100 questions parse, each with a valid answer
in its option set and a rationale, before writing the JSON.

---

## Deploy to GitHub + Netlify

### 1. Push to GitHub

The repo is already initialized locally. Create an empty GitHub repo, then:

```bash
git remote add origin https://github.com/<you>/pnle-reviewer.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Netlify

**Option A — dashboard (recommended):**
1. Netlify → **Add new site → Import an existing project** → pick the GitHub repo.
2. Netlify auto-detects the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. **Deploy.** No environment variables are needed.

**Option B — Netlify CLI:**

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

SPA routing (`/exam`, `/flashcards`, …) is handled by `netlify.toml` and
`public/_redirects` (both redirect to `/index.html` with a 200), so deep links
and page refreshes work.

---

## License / use

Educational review tool. Question content is attributed to Bukidnon State
University College of Nursing; verify all clinical content against current
PRC/BON and DOH references before relying on it for licensure preparation.
