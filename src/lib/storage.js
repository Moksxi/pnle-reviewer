// Thin, safe localStorage layer. All progress lives client-side (no backend).
// Every read is defensive so a corrupt/absent value never crashes the app.

const KEYS = {
  mastery: "pnle.mastery.v1", // { [cardId]: "known" | "review" }
  examHistory: "pnle.examHistory.v1", // ExamResult[]
  practiceHistory: "pnle.practiceHistory.v1", // { [questionId]: "correct" | "incorrect" }
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — ignore, app still works in-memory */
  }
}

/* ---- Flashcard mastery -------------------------------------------------- */

export function getMasteryMap() {
  return read(KEYS.mastery, {});
}

export function setMastery(cardId, state) {
  const map = getMasteryMap();
  if (state == null) delete map[cardId];
  else map[cardId] = state;
  write(KEYS.mastery, map);
  return map;
}

export function masteryStats(cardIds) {
  const map = getMasteryMap();
  let known = 0;
  let review = 0;
  cardIds.forEach((id) => {
    if (map[id] === "known") known += 1;
    else if (map[id] === "review") review += 1;
  });
  return { known, review, untouched: cardIds.length - known - review };
}

/* ---- Exam history ------------------------------------------------------- */

export function getExamHistory() {
  return read(KEYS.examHistory, []);
}

export function addExamResult(result) {
  const history = getExamHistory();
  history.unshift(result); // newest first
  write(KEYS.examHistory, history.slice(0, 50));
  return history;
}

export function bestScore() {
  const history = getExamHistory();
  if (!history.length) return null;
  return history.reduce(
    (best, r) => (r.percent > best ? r.percent : best),
    0
  );
}

/* ---- Practice Mode history ----------------------------------------------
   Last-result-only, same shape as flashcard mastery: one entry per question,
   overwritten on each new attempt rather than logged as a history list. */

export function getPracticeHistory() {
  return read(KEYS.practiceHistory, {});
}

export function setPracticeResult(questionId, isCorrect) {
  const map = getPracticeHistory();
  map[questionId] = isCorrect ? "correct" : "incorrect";
  write(KEYS.practiceHistory, map);
  return map;
}
