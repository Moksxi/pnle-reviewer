// Exam assembly + scoring. Config-driven: it honours the requested item count
// and the Part A/B target ratio when the pool allows, and degrades gracefully
// (taking whatever real items exist) when it doesn't — never padding with
// invented questions. It reports the composition it actually produced.

import { examConfig } from "../config/examConfig.js";

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build an exam from a pool of questions.
 * @param pool   array of question objects (each with a `part` of "A"|"B")
 * @param count  desired number of items (clamped to the pool size)
 * @param ratio  { A, B } target proportions
 */
export function buildExam(pool, count, ratio = examConfig.partRatio) {
  const size = Math.min(count, pool.length);
  const partA = shuffle(pool.filter((q) => q.part === "A"));
  const partB = shuffle(pool.filter((q) => q.part === "B"));

  let wantB = Math.round(size * (ratio.B ?? 0));
  wantB = Math.min(wantB, partB.length);
  let wantA = size - wantB;
  if (wantA > partA.length) {
    // not enough Part A — backfill from remaining Part B
    wantA = partA.length;
    wantB = Math.min(size - wantA, partB.length);
  }

  const items = shuffle([...partA.slice(0, wantA), ...partB.slice(0, wantB)]);

  return {
    items,
    requested: count,
    composition: {
      total: items.length,
      partA: items.filter((q) => q.part === "A").length,
      partB: items.filter((q) => q.part === "B").length,
    },
    durationSeconds: items.length * examConfig.secondsPerItem,
    // true when the pool couldn't satisfy the requested size or B-target
    adapted: items.length < count || wantB < Math.round(size * (ratio.B ?? 0)),
  };
}

export function scoreExam(items, answers) {
  let correct = 0;
  const partTotals = { A: 0, B: 0 };
  const partCorrect = { A: 0, B: 0 };
  const review = items.map((q) => {
    const chosen = answers[q.id] ?? null;
    const isCorrect = chosen === q.answer;
    partTotals[q.part] += 1;
    if (isCorrect) {
      correct += 1;
      partCorrect[q.part] += 1;
    }
    return { question: q, chosen, isCorrect };
  });
  const total = items.length;
  return {
    total,
    correct,
    incorrect: total - correct,
    percent: total ? Math.round((correct / total) * 100) : 0,
    byPart: {
      A: { total: partTotals.A, correct: partCorrect.A },
      B: { total: partTotals.B, correct: partCorrect.B },
    },
    review,
  };
}
