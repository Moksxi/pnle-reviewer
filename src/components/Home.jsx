import { useMemo } from "react";
import { Link } from "react-router-dom";
import { subjects, comingSoonSubjects, totals, allQuestions } from "../data/subjects.js";
import { buildFlashcards } from "../lib/flashcards.js";
import {
  masteryStats,
  getExamHistory,
  bestScore,
  categoryBreakdown,
} from "../lib/storage.js";
import { getSubjectColor } from "../lib/subjectColors.js";
import { getCategoryColor } from "../lib/categoryColors.js";

const MIN_ATTEMPTS_FOR_CONFIDENCE = 5;

export default function Home() {
  const t = totals();
  const cards = buildFlashcards();
  const mastery = masteryStats(cards.map((c) => c.id));
  const history = getExamHistory();
  const best = bestScore();
  const weakAreas = useWeakAreas();

  return (
    <div className="screen">
      <section className="hero">
        <div className="hero-avatar-row">
          <img
            src="/misty-photo.jpg"
            alt=""
            className="hero-avatar"
            width="44"
            height="44"
          />
          <span className="hero-avatar-caption">Built for Misty's PNLE review</span>
        </div>
        <p className="eyebrow">Philippine Nurse Licensure Exam</p>
        <h1>Review with real, reviewed items.</h1>
        <p className="hero-sub">
          Built on the PRC Enhanced Table of Specifications (Board Resolution
          No. 10, s. 2025). Currently covering <strong>NP I — Community
          Health Nursing</strong> with {t.reviewed} verified questions.
        </p>
        <div className="hero-cta">
          <Link className="btn btn-primary" to="/exam">
            Start a practice exam
          </Link>
          <Link className="btn btn-ghost" to="/flashcards">
            Review flashcards
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Reviewed questions" value={t.reviewed} />
        <StatCard
          label="Flashcards mastered"
          value={`${mastery.known}/${cards.length}`}
        />
        <StatCard
          label="Best exam score"
          value={best == null ? "—" : `${best}%`}
        />
        <StatCard
          label="Subjects covered"
          value={`${t.subjectsWithContent}/${t.subjectsPlanned}`}
        />
      </section>

      <section className="panel">
        <h2 className="panel-title">Subjects</h2>
        <ul className="subject-list">
          {subjects.map((s) => {
            const { color } = getSubjectColor(s.id);
            return (
              <li
                key={s.id}
                className="subject-row"
                style={{ "--subject-color": color }}
              >
                <span className="subject-code">{s.code}</span>
                <span className="subject-name">
                  {s.title}
                  <span className="subject-meta">
                    {s.lessons.length} lessons · {s.questions.length} questions ·
                    reviewed
                  </span>
                </span>
                <span className="chip chip-live">Live</span>
              </li>
            );
          })}
          {comingSoonSubjects.map((s) => {
            const { color } = getSubjectColor(s.id);
            return (
              <li
                key={s.id}
                className="subject-row muted"
                style={{ "--subject-color": color }}
              >
                <span className="subject-code">{s.code}</span>
                <span className="subject-name">{s.title}</span>
                <span className="chip">Coming soon</span>
              </li>
            );
          })}
        </ul>
      </section>

      {weakAreas.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Weak areas</h2>
          <p className="screen-sub" style={{ margin: "-0.6rem 0 0.9rem" }}>
            From Practice and Exam attempts — weakest first
          </p>
          <ul className="weak-area-list">
            {weakAreas.map((w) => {
              const { color } = getCategoryColor(w.category);
              return (
                <li key={w.category} className="weak-area-row">
                  <div className="weak-area-head">
                    <span
                      className="weak-area-dot"
                      style={{ background: color }}
                    />
                    <span className="weak-area-name">{w.category}</span>
                    <span className="weak-area-pct">
                      {w.hasEnoughData ? `${w.pct}%` : "—"}
                    </span>
                  </div>
                  {w.hasEnoughData ? (
                    <div className="weak-area-track">
                      <div
                        className="weak-area-fill"
                        style={{ width: `${w.pct}%`, background: color }}
                      />
                    </div>
                  ) : (
                    <p className="weak-area-note">
                      {w.total === 0
                        ? "Not attempted yet"
                        : `Not enough data yet (${w.total}/${MIN_ATTEMPTS_FOR_CONFIDENCE} answered)`}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Recent attempts</h2>
          <ul className="history-list">
            {history.slice(0, 5).map((h) => (
              <li key={h.at} className="history-row">
                <span className={"score-pill " + scoreClass(h.percent)}>
                  {h.percent}%
                </span>
                <span className="history-meta">
                  {h.correct}/{h.total} correct · {h.presetLabel}
                </span>
                <span className="history-date">
                  {new Date(h.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="home-footer-link">
        <Link to="/about">About this reviewer — sources &amp; corrections</Link>
      </p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function scoreClass(p) {
  if (p >= 75) return "good";
  if (p >= 60) return "ok";
  return "low";
}

// Builds the weakest-first category list Home renders. Only shown at all
// once at least one category has some attempted data — a brand-new install
// has nothing to report yet, so there's no section to render prematurely.
function useWeakAreas() {
  return useMemo(() => {
    const questions = allQuestions();
    const categories = [...new Set(questions.map((q) => q.category).filter(Boolean))];
    const tally = categoryBreakdown(questions);

    const rows = categories.map((category) => {
      const stats = tally[category] || { correct: 0, total: 0 };
      const hasEnoughData = stats.total >= MIN_ATTEMPTS_FOR_CONFIDENCE;
      const pct = hasEnoughData
        ? Math.round((stats.correct / stats.total) * 100)
        : null;
      return { category, ...stats, pct, hasEnoughData };
    });

    if (!rows.some((r) => r.total > 0)) return [];

    // Weakest-with-enough-data first, then partially-attempted (closest to
    // unlocking a real percentage first), then never-attempted last.
    function tier(r) {
      if (r.hasEnoughData) return 0;
      if (r.total > 0) return 1;
      return 2;
    }
    rows.sort((a, b) => {
      const ta = tier(a);
      const tb = tier(b);
      if (ta !== tb) return ta - tb;
      if (ta === 0) return a.pct - b.pct;
      if (ta === 1) return b.total - a.total;
      return 0;
    });

    return rows;
  }, []);
}
