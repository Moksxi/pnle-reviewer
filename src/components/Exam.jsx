import { useEffect, useMemo, useRef, useState } from "react";
import { allQuestions } from "../data/subjects.js";
import { examConfig, minutesForItems } from "../config/examConfig.js";
import { buildExam, scoreExam } from "../lib/exam.js";
import { addExamResult } from "../lib/storage.js";
import SourceTag, { PartTag } from "./SourceTag.jsx";
import QuestionReview from "./QuestionReview.jsx";

const POOL = allQuestions();

export default function Exam() {
  const [phase, setPhase] = useState("setup"); // setup | running | result
  const [session, setSession] = useState(null);

  if (phase === "setup")
    return (
      <Setup
        onStart={(exam, preset) => {
          setSession({ exam, preset });
          setPhase("running");
        }}
      />
    );

  if (phase === "running")
    return (
      <Runner
        session={session}
        onSubmit={(answers, timeUp) => {
          setSession((s) => ({ ...s, answers, timeUp }));
          setPhase("result");
        }}
        onQuit={() => {
          setSession(null);
          setPhase("setup");
        }}
      />
    );

  return (
    <Result
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
  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Practice Exam</h1>
        <p className="screen-sub">
          NP I · Community Health — timed, PRC Enhanced TOS structure
        </p>
      </div>

      <div className="notice">
        Items are drawn from a pool of <strong>{POOL.length} reviewed
        questions</strong>. The engine targets the official Part A 80% / Part B
        20% split and scales the timer at {examConfig.secondsPerItem}s per item
        (the real 3-hour, 100-item pace).
      </div>

      <div className="preset-grid">
        {examConfig.presets.map((p) => {
          const items = Math.min(p.items, POOL.length);
          return (
            <button
              key={p.id}
              className="preset-card"
              onClick={() => onStart(buildExam(POOL, p.items), p)}
            >
              <div className="preset-count">{items}</div>
              <div className="preset-label">{p.label}</div>
              <div className="preset-time">{minutesForItems(items)} min</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Runner */
function Runner({ session, onSubmit }) {
  const { exam } = session;
  const items = exam.items;
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [pos, setPos] = useState(0);
  const [remaining, setRemaining] = useState(exam.durationSeconds);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          submitRef.current(answersRef.current, true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const q = items[pos];
  const answeredCount = Object.keys(answers).length;

  function choose(letter) {
    setAnswers((a) => ({ ...a, [q.id]: letter }));
  }

  return (
    <div className="screen exam-run">
      <div className="exam-bar">
        <span className={"timer" + (remaining <= 60 ? " urgent" : "")}>
          {fmtTime(remaining)}
        </span>
        <span className="exam-progress">
          {answeredCount}/{items.length} answered
        </span>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => onSubmit(answers, false)}
        >
          Submit
        </button>
      </div>

      {exam.adapted && (
        <p className="adapt-note">
          Pool limited: this set has {exam.composition.partA} Part A and{" "}
          {exam.composition.partB} Part B items (fewer Part B items exist than
          the 20% target).
        </p>
      )}

      <div className="q-meta">
        <span className="q-index">
          Question {pos + 1} of {items.length}
        </span>
        <div className="q-tags">
          <PartTag part={q.part} />
          <SourceTag source={q.source} />
        </div>
      </div>

      {q.situation && <p className="q-scenario">{q.situation.text}</p>}
      <p className="q-stem">{q.question}</p>

      <div className="options">
        {q.options.map((o) => {
          const picked = answers[q.id] === o.letter;
          return (
            <button
              key={o.letter}
              className={"option" + (picked ? " picked" : "")}
              onClick={() => choose(o.letter)}
            >
              <span className="option-letter">{o.letter}</span>
              <span className="option-text">{o.text}</span>
            </button>
          );
        })}
      </div>

      <div className="q-controls">
        <button
          className="btn btn-ghost"
          onClick={() => setPos((p) => Math.max(0, p - 1))}
          disabled={pos === 0}
        >
          ← Prev
        </button>
        <button
          className={"btn btn-flag" + (flags[q.id] ? " on" : "")}
          onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}
        >
          {flags[q.id] ? "★ Flagged" : "☆ Flag"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setPos((p) => Math.min(items.length - 1, p + 1))}
          disabled={pos === items.length - 1}
        >
          Next →
        </button>
      </div>

      <div className="palette">
        {items.map((it, i) => {
          const state = answers[it.id]
            ? "done"
            : flags[it.id]
            ? "flag"
            : "";
          return (
            <button
              key={it.id}
              className={
                "palette-cell " + state + (i === pos ? " current" : "")
              }
              onClick={() => setPos(i)}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Result */
function Result({ session, onRestart }) {
  const { exam, answers, preset, timeUp } = session;
  const result = useMemo(
    () => scoreExam(exam.items, answers || {}),
    [exam, answers]
  );

  // Save once on mount.
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    addExamResult({
      at: Date.now(),
      percent: result.percent,
      correct: result.correct,
      total: result.total,
      presetLabel: preset?.label || "Custom",
    });
  }, [result, preset]);

  const passed = result.percent >= 75;

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Results</h1>
        <p className="screen-sub">
          {preset?.label} · {result.total} items
          {timeUp ? " · time expired" : ""}
        </p>
      </div>

      <div className={"result-hero " + (passed ? "pass" : "fail")}>
        <div className="result-percent">{result.percent}%</div>
        <div className="result-detail">
          {result.correct} correct · {result.incorrect} wrong
        </div>
        <div className="result-verdict">
          {passed ? "At or above the 75% passing mark" : "Below the 75% mark"}
        </div>
      </div>

      <div className="part-breakdown">
        <PartStat label="Part A · clinical" data={result.byPart.A} />
        <PartStat label="Part B · competency" data={result.byPart.B} />
      </div>

      <button className="btn btn-primary full" onClick={onRestart}>
        New exam
      </button>

      <h2 className="panel-title" style={{ marginTop: "1.5rem" }}>
        Review &amp; rationales
      </h2>
      <div className="review-list">
        {result.review.map((r, i) => (
          <QuestionReview key={r.question.id} item={r} index={i} />
        ))}
      </div>
    </div>
  );
}

function PartStat({ label, data }) {
  const pct = data.total ? Math.round((data.correct / data.total) * 100) : null;
  return (
    <div className="part-stat">
      <div className="part-stat-label">{label}</div>
      <div className="part-stat-value">
        {data.total === 0 ? "—" : `${data.correct}/${data.total}`}
      </div>
      <div className="part-stat-pct">{pct == null ? "no items" : `${pct}%`}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ util */
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
