import { Link } from "react-router-dom";
import { subjects, comingSoonSubjects, totals } from "../data/subjects.js";
import { buildFlashcards } from "../lib/flashcards.js";
import { masteryStats, getExamHistory, bestScore } from "../lib/storage.js";

export default function Home() {
  const t = totals();
  const cards = buildFlashcards();
  const mastery = masteryStats(cards.map((c) => c.id));
  const history = getExamHistory();
  const best = bestScore();

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
          {subjects.map((s) => (
            <li key={s.id} className="subject-row">
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
          ))}
          {comingSoonSubjects.map((s) => (
            <li key={s.id} className="subject-row muted">
              <span className="subject-code">{s.code}</span>
              <span className="subject-name">{s.title}</span>
              <span className="chip">Coming soon</span>
            </li>
          ))}
        </ul>
      </section>

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
