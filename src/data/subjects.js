// Subject registry. This is the ONLY place that knows which subjects have
// data. Adding NP II–V later is purely additive: drop a new `*-questions.json`
// (same shape as np1-questions.json), import it, and add one entry to
// `loadedSubjects`. No component or engine code changes — every screen reads
// subjects through the helpers below.

import np1 from "./np1-questions.json";

// Datasets that ship with real, reviewed content.
const loadedSubjects = [np1];

// Subjects on the roadmap but not yet written. Shown as "coming soon" so the
// full 5-paper structure is visible without faking content.
export const comingSoonSubjects = [
  { id: "np2", code: "NP II", title: "Maternal & Child Health Nursing" },
  { id: "np3", code: "NP III", title: "Medical-Surgical Nursing, Part 1" },
  { id: "np4", code: "NP IV", title: "Medical-Surgical Nursing, Part 2" },
  { id: "np5", code: "NP V", title: "Psychiatric + Critical Care Nursing" },
];

// Normalised subject objects the app consumes.
export const subjects = loadedSubjects.map((ds) => ({
  ...ds.subject,
  source: ds.source,
  situations: ds.situations,
  questions: ds.questions.map((q) => ({ ...q, subjectId: ds.subject.id })),
  hasQuestions: ds.questions.length > 0,
  hasLessons: Array.isArray(ds.lessons) && ds.lessons.length > 0,
  lessons: ds.lessons || [],
}));

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

export function totals() {
  const qs = allQuestions();
  return {
    subjectsWithContent: subjects.length,
    subjectsPlanned: subjects.length + comingSoonSubjects.length,
    questions: qs.length,
    reviewed: qs.filter((q) => q.source === "reviewed").length,
  };
}
