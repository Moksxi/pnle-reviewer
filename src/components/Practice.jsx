import { useMemo, useState } from "react";
import { allQuestions } from "../data/subjects.js";
import { shuffle } from "../lib/exam.js";
import { setPracticeResult } from "../lib/storage.js";
import SourceTag, { PartTag } from "./SourceTag.jsx";
import QuestionReview from "./QuestionReview.jsx";

const POOL = allQuestions();

export default function Practice() {
  const [phase, setPhase] = useState("setup"); // setup | running | done
  const [session, setSession] = useState(null);

  if (phase === "setup")
    return (
      <Setup
        onStart={(pool) => {
          setSession({ pool, index: 0, tally: { correct: 0, incorrect: 0 } });
          setPhase("running");
        }}
      />
    );

  if (phase === "running")
    return (
      <Runner
        session={session}
        onAdvance={(next) => setSession(next)}
        onFinish={(final) => {
          setSession(final);
          setPhase("done");
        }}
        onQuit={(final) => {
          setSession(final);
          setPhase("done");
        }}
      />
    );

  return (
    <Done
      session={session}
      onRestart={() => {
        setSession(null);
        setPhase("setup");
      }}
    />
  );
}

/* ------------------------------------------------------------------ Setup */
function Setup({ onStart }) {
  const categories = useMemo(() => {
    const counts = new Map();
    POOL.forEach((q) => {
      if (!q.category) return;
      counts.set(q.category, (counts.get(q.category) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const [selected, setSelected] = useState("all");

  const filteredCount =
    selected === "all"
      ? POOL.length
      : POOL.filter((q) => q.category === selected).length;

  function start() {
    const pool =
      selected === "all" ? POOL : POOL.filter((q) => q.category === selected);
    onStart(shuffle(pool));
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Practice</h1>
        <p className="screen-sub">
          One question at a time, no timer — answer, see the rationale, move on
        </p>
      </div>

      <div className="notice">
        Drawn from the same pool of <strong>{POOL.length} reviewed
        questions</strong> as the practice exam. No score is recorded here —
        this is drilling, not testing.
      </div>

      <div className="practice-filters">
        <button
          className={"seg" + (selected === "all" ? " active" : "")}
          onClick={() => setSelected("all")}
        >
          All ({POOL.length})
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            className={"seg" + (selected === cat ? " active" : "")}
            onClick={() => setSelected(cat)}
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary full"
        onClick={start}
        disabled={filteredCount === 0}
      >
        Start practice ({filteredCount} question{filteredCount === 1 ? "" : "s"})
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- Runner */
function Runner({ session, onAdvance, onFinish, onQuit }) {
  const { pool, index } = session;
  const q = pool[index];
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState(session.tally);

  function choose(letter) {
    if (revealed) return;
    setChosen(letter);
    setRevealed(true);
    const isCorrect = letter === q.answer;
    setPracticeResult(q.id, isCorrect);
    setTally((t) => ({
      correct: t.correct + (isCorrect ? 1 : 0),
      incorrect: t.incorrect + (isCorrect ? 0 : 1),
    }));
  }

  function next() {
    const nextIndex = index + 1;
    if (nextIndex >= pool.length) {
      onFinish({ pool, index: nextIndex, tally });
      return;
    }
    setChosen(null);
    setRevealed(false);
    onAdvance({ pool, index: nextIndex, tally });
  }

  return (
    <div className="screen">
      <div className="practice-bar">
        <span className="exam-progress">
          Question {index + 1} of {pool.length}
        </span>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => onQuit({ pool, index, tally })}
        >
          End session
        </button>
      </div>

      <div className="q-meta">
        <div className="q-tags">
          <PartTag part={q.part} />
          <SourceTag source={q.source} />
          {q.category && <span className="chip chip-sm">{q.category}</span>}
        </div>
      </div>

      {q.situation && <p className="q-scenario">{q.situation.text}</p>}
      <p className="q-stem">{q.question}</p>

      <div className="options">
        {q.options.map((o) => {
          const picked = chosen === o.letter;
          const isAnswer = revealed && o.letter === q.answer;
          const cls =
            "option" +
            (picked && !revealed ? " picked" : "") +
            (revealed && isAnswer ? " picked" : "");
          return (
            <button
              key={o.letter}
              className={cls}
              onClick={() => choose(o.letter)}
              disabled={revealed}
            >
              <span className="option-letter">{o.letter}</span>
              <span className="option-text">{o.text}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <>
          <QuestionReview
            item={{ question: q, chosen, isCorrect: chosen === q.answer }}
            index={null}
          />
          <button className="btn btn-primary full" onClick={next}>
            {index + 1 >= pool.length ? "Finish session" : "Next question →"}
          </button>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Done */
function Done({ session, onRestart }) {
  const { tally } = session;
  const total = tally.correct + tally.incorrect;
  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Practice session done</h1>
        <p className="screen-sub">
          {total} question{total === 1 ? "" : "s"} drilled — no score saved,
          just a quick recap
        </p>
      </div>

      <div className="panel practice-recap">
        <div className="practice-recap-row">
          <span className="fc-stat known">✓ {tally.correct} got it</span>
          <span className="fc-stat review">↻ {tally.incorrect} to review</span>
        </div>
        <p className="screen-sub">
          Missed ones are worth another look in Flashcards or a future
          Practice round.
        </p>
      </div>

      <button className="btn btn-primary full" onClick={onRestart}>
        Practice again
      </button>
    </div>
  );
}
