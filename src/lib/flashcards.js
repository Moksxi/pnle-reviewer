// Flashcards are derived from the reviewed Q&A bank — one source of truth, no
// duplicated content. Front = the scenario (if any) + the question. Back = the
// correct answer text + its rationale. The card inherits the question's
// `source` tag, so a future "generated_draft" question would surface a draft
// label on its card automatically.

import { allQuestions } from "../data/subjects.js";

export function buildFlashcards() {
  return allQuestions().map((q) => {
    const answer = q.options.find((o) => o.letter === q.answer);
    return {
      id: q.id,
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
