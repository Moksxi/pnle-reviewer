import { PartTag } from "./SourceTag.jsx";

// Shared answer-review rendering — used by Exam's results/review list and by
// Practice Mode's per-question reveal, so the two screens never drift into
// two different rationale layouts.
export default function QuestionReview({ item, index }) {
  const { question: q, chosen, isCorrect } = item;
  return (
    <div className={"review-item " + (isCorrect ? "correct" : "wrong")}>
      <div className="review-head">
        {index != null && <span className="review-num">Q{index + 1}</span>}
        <span className={"review-badge " + (isCorrect ? "ok" : "no")}>
          {isCorrect ? "Correct" : chosen ? "Incorrect" : "Skipped"}
        </span>
        <PartTag part={q.part} />
      </div>
      {q.situation && <p className="q-scenario sm">{q.situation.text}</p>}
      <p className="review-stem">{q.question}</p>
      <ul className="review-options">
        {q.options.map((o) => {
          const isAnswer = o.letter === q.answer;
          const isChosen = o.letter === chosen;
          let cls = "";
          if (isAnswer) cls = "answer";
          else if (isChosen) cls = "chosen-wrong";
          return (
            <li key={o.letter} className={"review-option " + cls}>
              <span className="option-letter">{o.letter}</span>
              <span>{o.text}</span>
              {isAnswer && <span className="mark">✓ correct</span>}
              {isChosen && !isAnswer && <span className="mark">your answer</span>}
            </li>
          );
        })}
      </ul>
      <p className="review-rationale">
        <strong>Rationale.</strong> {q.rationale}
      </p>
    </div>
  );
}
