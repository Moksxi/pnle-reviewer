// Two flashcard sources, merged into one deck:
//  - "lesson" cards: hand-curated cards tied to a written lesson (front/back
//    authored directly in the flashcard batch file).
//  - "qa" cards: derived from the reviewed exam Q&A bank (no duplicated
//    content — one source of truth per question).
// Every card carries `source`, so a future "generated_draft" item — from
// either origin — surfaces its draft label automatically.

import { allQuestions, allLessons, allCuratedFlashcards } from "../data/subjects.js";

function fromLessons() {
  const lessonById = new Map(allLessons().map((l) => [l.id, l]));
  return allCuratedFlashcards().map((c) => {
    const lesson = lessonById.get(c.lesson_id);
    return {
      id: c.id,
      kind: "lesson",
      subjectCode: c.subjectCode,
      source: c.source,
      lessonId: c.lesson_id,
      lessonTitle: lesson ? lesson.title : null,
      front: c.front,
      back: c.back,
    };
  });
}

function fromQuestions() {
  return allQuestions().map((q) => {
    const answer = q.options.find((o) => o.letter === q.answer);
    return {
      id: q.id,
      kind: "qa",
      subjectCode: q.subjectCode,
      part: q.part,
      source: q.source,
      scenario: q.situation ? q.situation.text : null,
      front: q.question,
      answerLetter: q.answer,
      answerText: answer ? answer.text : "",
      back: q.rationale,
    };
  });
}

export function buildFlashcards() {
  return [...fromLessons(), ...fromQuestions()];
}
