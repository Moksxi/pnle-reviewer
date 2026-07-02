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
| **Flashcards** | Derived from the same reviewed Q&A. Flip, "Got it / Need review", swipe on mobile, mastery saved to `localStorage`. |
| **Lessons** | Honest empty state + the approved NP I module outline with working search. No written lesson prose exists yet, so none is faked. |
| **Home** | Quick stats (reviewed questions, mastery, best score, subjects) and recent attempts. |

### Content provenance & integrity

- Every question and flashcard here is **`source: "reviewed"`** — sourced from a
  real 100-item NP I Community Health exam (Bukidnon State University College of
  Nursing, 2nd Sem SY 2025–2026), each with a correct answer and explanation.
- The data model also supports **`source: "generated_draft"`**. Any future
  generated item is rendered with a visible **"Draft — pending review"** badge
  (see `src/components/SourceTag.jsx`) so unreviewed content is never presented
  as approved. There is **no generated content in this build.**
- Exam structure (5 subjects, 100 items, Part A 80% / Part B 20%) follows the
  **PRC Enhanced TOS, Board Resolution No. 10, s. 2025**. Part B for NP I is
  "Health Education & Research"; those items are tagged `part: "B"`.

> **Note on source files.** The build brief referenced a
> `PNLE-2026-Review-Knowledge-Base.md` with fully written lessons + flashcards.
> That file was not present; the only written NP I content available was the
> 100-item question bank (`Mistybaby Review.pdf`). The exam and flashcards are
> built from it; lessons show an empty state until reviewed lesson text exists.

---

## Project structure

```
scripts/parse_questions.py     # PDF-text -> src/data/np1-questions.json (idempotent)
scripts/np1_exam1_raw.txt      # extracted source text
src/
  config/examConfig.js         # item counts, timer, Part A/B target ratio
  data/
    np1-questions.json         # the ONLY NP I content source (100 items + 9 scenarios)
    subjects.js                # subject registry + query helpers
  lib/
    exam.js                    # exam assembly (ratio-aware) + scoring
    flashcards.js              # derives cards from questions
    storage.js                 # localStorage (mastery, exam history)
  components/                  # Home, Lessons, Flashcards, Exam, SourceTag
  App.jsx / main.jsx / index.css
```

### Adding NP II–V later (no refactor)

1. Produce `src/data/npX-questions.json` in the same shape as `np1-questions.json`
   (a `subject`, `source`, `situations`, and `questions[]`).
2. In `src/data/subjects.js`, import it and add it to `loadedSubjects`.
3. Remove that subject's entry from `comingSoonSubjects`.

Every screen and the exam engine read subjects through the registry, so no
component code changes.

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
