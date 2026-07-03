// Subject registry. This is the ONLY place that knows which subjects have
// data. Adding NP II–V later is purely additive: drop in new
// `npX-questions.json` / `npX-*-lessons-*.json` / `npX-*-flashcards-*.json`
// files (same shapes as the NP I ones below) and add one entry to
// `registry`. No component or engine code changes — every screen reads
// subjects through the helpers below.

import np1Questions from "./np1-questions.json";
import np1LessonsBatch1 from "./np1-community-health-lessons-batch1.json";
import np1FlashcardsBatch1 from "./np1-community-health-flashcards-batch1.json";
import np1LessonsBatch2 from "./np1-community-health-lessons-batch2.json";
import np1FlashcardsBatch2 from "./np1-community-health-flashcards-batch2.json";
import np1LessonsBatch3 from "./np1-community-health-lessons-batch3.json";
import np1FlashcardsBatch3 from "./np1-community-health-flashcards-batch3.json";
import np1VisualAidsPatch1 from "./np1-visual-aids-patch1.json";
import np1VisualAidsPatch2 from "./np1-visual-aids-patch2.json";

// Visual-aid SVGs are keyed by lesson id and applied as patches on top of
// whichever batch defines that lesson, rather than living inside a lesson
// batch file — this lets a single patch touch lessons across batches 1-3
// without editing those already-published batch files. A lesson can carry
// several visuals (e.g. a Tier 1 structural diagram plus a Tier 3 mnemonic),
// so aids accumulate into an array per lesson, in patch order.
const visualAidPatches = [np1VisualAidsPatch1, np1VisualAidsPatch2];
const visualAidsByLessonId = new Map();
visualAidPatches.forEach((patch) =>
  (patch?.visual_aids || []).forEach((v) => {
    const list = visualAidsByLessonId.get(v.lesson_id) || [];
    list.push({ title: v.title, svg: v.svg, tier: v.tier || null });
    visualAidsByLessonId.set(v.lesson_id, list);
  })
);

// Each entry pairs a subject's question bank with its lesson set(s) and
// lesson-derived flashcard set(s). `lessons`/`curatedFlashcards` are arrays
// so a subject's content can ship as multiple batches over time (each batch
// keeps its own `_meta`/provenance) — they're merged into one lesson list
// and one flashcard list per subject below. A subject can also ship with
// just a question bank and no lesson batches at all.
const registry = [
  {
    questions: np1Questions,
    lessons: [np1LessonsBatch1, np1LessonsBatch2, np1LessonsBatch3],
    curatedFlashcards: [np1FlashcardsBatch1, np1FlashcardsBatch2, np1FlashcardsBatch3],
  },
];

// Subjects on the roadmap but not yet written. Shown as "coming soon" so the
// full 5-paper structure is visible without faking content.
export const comingSoonSubjects = [
  { id: "np2", code: "NP II", title: "Maternal & Child Health Nursing" },
  { id: "np3", code: "NP III", title: "Medical-Surgical Nursing, Part 1" },
  { id: "np4", code: "NP IV", title: "Medical-Surgical Nursing, Part 2" },
  { id: "np5", code: "NP V", title: "Psychiatric + Critical Care Nursing" },
];

// Normalised subject objects the app consumes.
export const subjects = registry.map(({ questions: ds, lessons, curatedFlashcards }) => {
  const subjectId = ds.subject.id;
  const lessonList = (lessons || []).flatMap((batch) =>
    (batch?.lessons || []).map((l) => ({
      ...l,
      subjectId,
      source: batch?._meta?.source || "reviewed",
      visualAids: visualAidsByLessonId.get(l.id) || [],
    }))
  );
  const flashcardList = (curatedFlashcards || []).flatMap((batch) =>
    (batch?.flashcards || []).map((c) => ({
      ...c,
      subjectId,
      source: batch?._meta?.source || "reviewed",
    }))
  );
  return {
    ...ds.subject,
    source: ds.source,
    situations: ds.situations,
    questions: ds.questions.map((q) => ({ ...q, subjectId })),
    hasQuestions: ds.questions.length > 0,
    lessons: lessonList,
    hasLessons: lessonList.length > 0,
    curatedFlashcards: flashcardList,
  };
});

const situationIndex = new Map();
subjects.forEach((s) =>
  (s.situations || []).forEach((sit) => situationIndex.set(sit.id, sit))
);

export function getSubject(id) {
  return subjects.find((s) => s.id === id) || null;
}

export function getSituation(id) {
  return id ? situationIndex.get(id) || null : null;
}

// Every question across every loaded subject, tagged with its subject.
export function allQuestions() {
  return subjects.flatMap((s) =>
    s.questions.map((q) => ({
      ...q,
      subjectCode: s.code,
      subjectTitle: s.title,
      situation: getSituation(q.situationId),
    }))
  );
}

// Every written lesson across every loaded subject, tagged with its subject.
export function allLessons() {
  return subjects.flatMap((s) =>
    s.lessons.map((l) => ({ ...l, subjectCode: s.code, subjectTitle: s.title }))
  );
}

export function getLesson(id) {
  return allLessons().find((l) => l.id === id) || null;
}

// Every curated (lesson-derived) flashcard across every loaded subject.
export function allCuratedFlashcards() {
  return subjects.flatMap((s) =>
    (s.curatedFlashcards || []).map((c) => ({ ...c, subjectCode: s.code }))
  );
}

export function totals() {
  const qs = allQuestions();
  const lessons = allLessons();
  return {
    subjectsWithContent: subjects.length,
    subjectsPlanned: subjects.length + comingSoonSubjects.length,
    questions: qs.length,
    reviewed: qs.filter((q) => q.source === "reviewed").length,
    lessons: lessons.length,
  };
}
