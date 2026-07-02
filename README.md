# PNLE Reviewer

A premium **Philippine Nurse Licensure Examination (PNLE)** reviewer web app —
lessons, flashcards, and a timed practice exam. This MVP covers **NP I —
Community Health Nursing** and is architected so NP II–V are added later as
**data files only**, with no code changes.

- **Stack:** React 18 + Vite, React Router, plain CSS (no backend, no database)
- **Persistence:** `localStorage` (flashcard mastery + exam scores)
- **Deploy target:** Netlify (free tier)

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
| **Flashcards** | 127 cards: 27 hand-curated cards tied to written lessons + 100 derived from the reviewed Q&A. Flip, "Got it / Need review", swipe on mobile, mastery saved to `localStorage`. |
| **Lessons** | 6 fully written NP I lessons (objectives, core concepts, definitions, explanation, nursing management, board-exam focus, mnemonics) grouped by category, with search and a linked detail view. |
| **Home** | Quick stats (reviewed questions, mastery, best score, subjects) and recent attempts. |

### Content provenance & integrity

- Every lesson, flashcard, and exam question here is **`source: "reviewed"`**.
  Lessons and their derived flashcards come from a verified NP I content batch
  (`np1-community-health-lessons-batch1.json` / `...-flashcards-batch1.json`),
  cross-checked against RA 10121 and Philippine COPAR course materials — two
  factual corrections from an earlier draft (COPAR's 4 phases, RA 10121's
  official paired terminology) are recorded in each file's `_meta.note`. Exam
  questions come from a real 100-item NP I Community Health exam (Bukidnon
  State University College of Nursing, 2nd Sem SY 2025–2026).
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
    np1-community-health-lessons-batch1.json       # 6 written lessons
    np1-community-health-flashcards-batch1.json    # 27 lesson-derived flashcards
    subjects.js                # registry pairing each subject's datasets + query helpers
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
2. Optionally add `npX-*-lessons-*.json` (a `lessons[]` array) and
   `npX-*-flashcards-*.json` (a `flashcards[]` array with `lesson_id` links) —
   lessons are optional per subject.
3. In `src/data/subjects.js`, import them and add one `{ questions, lessons,
   curatedFlashcards }` entry to `registry`.
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
