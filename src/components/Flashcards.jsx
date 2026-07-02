import { useMemo, useState, useRef } from "react";
import { buildFlashcards } from "../lib/flashcards.js";
import {
  getMasteryMap,
  setMastery,
  masteryStats,
} from "../lib/storage.js";
import SourceTag, { PartTag } from "./SourceTag.jsx";

const ALL = buildFlashcards();

export default function Flashcards() {
  const [mastery, setMasteryState] = useState(() => getMasteryMap());
  const [filter, setFilter] = useState("all"); // all | review | untouched
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(() => {
    if (filter === "review")
      return ALL.filter((c) => mastery[c.id] === "review");
    if (filter === "untouched")
      return ALL.filter((c) => !mastery[c.id]);
    return ALL;
    // deck recomputes when filter changes; mastery changes don't reshuffle
    // mid-session so the card under you doesn't vanish on marking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const stats = masteryStats(ALL.map((c) => c.id));
  const card = deck[index] || null;

  function go(delta) {
    setFlipped(false);
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next > deck.length - 1) return deck.length - 1;
      return next;
    });
  }

  function mark(state) {
    if (!card) return;
    const next = setMastery(card.id, state);
    setMasteryState({ ...next });
    // advance if there's a next card
    if (index < deck.length - 1) go(1);
    else setFlipped(false);
  }

  function changeFilter(f) {
    setFilter(f);
    setIndex(0);
    setFlipped(false);
  }

  /* --- touch swipe (mobile) --------------------------------------------- */
  const touch = useRef({ x: 0, y: 0, active: false });
  function onTouchStart(e) {
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY, active: true };
  }
  function onTouchEnd(e) {
    if (!touch.current.active) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current.active = false;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return; // tap/scroll
    if (dx < 0) go(1); // swipe left → next
    else go(-1); // swipe right → prev
  }

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Flashcards</h1>
        <p className="screen-sub">
          From reviewed NP I lessons and the exam question bank
        </p>
      </div>

      <div className="fc-progress">
        <span className="fc-stat known">✓ {stats.known} mastered</span>
        <span className="fc-stat review">↻ {stats.review} to review</span>
        <span className="fc-stat">{stats.untouched} new</span>
      </div>

      <div className="fc-filters">
        {[
          ["all", `All (${ALL.length})`],
          ["review", `To review (${stats.review})`],
          ["untouched", `New (${stats.untouched})`],
        ].map(([id, label]) => (
          <button
            key={id}
            className={"seg" + (filter === id ? " active" : "")}
            onClick={() => changeFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {!card ? (
        <div className="empty-card">
          <p>Nothing here.</p>
          <p className="muted">
            {filter === "review"
              ? "No cards marked for review — nice."
              : "No cards in this filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="fc-counter">
            Card {index + 1} of {deck.length}
          </div>

          <div
            className={"flashcard" + (flipped ? " flipped" : "")}
            onClick={() => setFlipped((f) => !f)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
          >
            <div className="flashcard-inner">
              <div className="flashcard-face front">
                <div className="fc-tags">
                  {card.kind === "qa" ? (
                    <PartTag part={card.part} />
                  ) : (
                    <span className="tag tag-part">Lesson</span>
                  )}
                  <SourceTag source={card.source} />
                </div>
                {card.kind === "qa" && card.scenario && (
                  <p className="fc-scenario">{card.scenario}</p>
                )}
                {card.kind === "lesson" && card.lessonTitle && (
                  <p className="fc-scenario">{card.lessonTitle}</p>
                )}
                <p className="fc-question">{card.front}</p>
                <span className="fc-hint">Tap to reveal answer</span>
              </div>
              <div className="flashcard-face back">
                <div className="fc-answer-label">Answer</div>
                {card.kind === "qa" && (
                  <p className="fc-answer">
                    <span className="fc-answer-letter">{card.answerLetter}.</span>{" "}
                    {card.answerText}
                  </p>
                )}
                <p className="fc-rationale">{card.back}</p>
                <span className="fc-hint">Tap to flip back</span>
              </div>
            </div>
          </div>

          <div className="fc-actions">
            <button className="btn btn-review" onClick={() => mark("review")}>
              ↻ Need review
            </button>
            <button className="btn btn-known" onClick={() => mark("known")}>
              ✓ Got it
            </button>
          </div>

          <div className="fc-nav">
            <button className="btn btn-ghost" onClick={() => go(-1)} disabled={index === 0}>
              ← Prev
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => go(1)}
              disabled={index >= deck.length - 1}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
