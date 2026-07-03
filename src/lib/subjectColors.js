// Subject identity color palette — one entry per NP subject.
// Keys match the `id` field in subjects.js / comingSoonSubjects.
// Only np1 (Community Health → Sage) has live content now; the rest
// are ready for when NP II–V content lands, no code change needed.
const SUBJECT_COLORS = {
  np1: { color: "#6FA86B", bg: "#EEF5ED" }, // Community Health → Sage
  np2: { color: "#E8875F", bg: "#FDF1EB" }, // Maternal & Child → Coral
  np3: { color: "#8B72D8", bg: "#EFEAFB" }, // Med-Surg Part 1 → Lavender
  np4: { color: "#8B72D8", bg: "#EFEAFB" }, // Med-Surg Part 2 → Lavender
  np5: { color: "#5E93BE", bg: "#EBF3F9" }, // Psychiatric → Sky
};

const FALLBACK = { color: "#8B72D8", bg: "#EFEAFB" };

export function getSubjectColor(subjectId) {
  return SUBJECT_COLORS[subjectId] ?? FALLBACK;
}
