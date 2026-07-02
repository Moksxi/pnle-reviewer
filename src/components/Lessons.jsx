import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { subjects } from "../data/subjects.js";

// NP I module outline, taken from the approved KB architecture (PNLE-KB-Outline
// -Audit-v2 / Enhanced TOS). This is the *syllabus*, not lesson prose — shown so
// the roadmap is visible. No lesson bodies exist yet, so nothing is invented.
const NP1_OUTLINE = [
  {
    module: "Health & the Care Delivery System",
    topics: [
      "Determinants of health; wellness–illness continuum",
      "Philippine Health Care Delivery System & DOH",
      "Local Government Code (RA 7160) & devolution",
      "Inter-Local Health Zones; levels of care & referral",
      "Universal Health Care Act; Primary Health Care (Alma-Ata)",
    ],
  },
  {
    module: "The Public Health Nurse",
    topics: [
      "Roles & functions of the PHN (clinician, educator, generalist)",
      "Community health nursing concepts & levels of clientele",
      "Home visits & the family nursing process",
      "Health deficits, threats & foreseeable crises",
    ],
  },
  {
    module: "DOH Programs & Population Groups",
    topics: [
      "Expanded Program on Immunization (EPI)",
      "Maternal care, family planning & reproductive health",
      "IMCI; nutrition & micronutrient supplementation",
      "National TB Control Program (DOTS, FDC regimens)",
      "Dengue & communicable disease control",
    ],
  },
  {
    module: "Community Practice & Part B Competencies",
    topics: [
      "Community organizing (COPAR)",
      "Epidemiology, surveillance & vital statistics",
      "Health education & promotion (health-education competency)",
      "Care planning: problems → objectives → intervention → evaluation",
      "Occupational & school health nursing",
    ],
  },
];

export default function Lessons() {
  const [query, setQuery] = useState("");
  const subject = subjects[0];

  // Search operates over the outline so the field is functional today and will
  // transparently cover real lessons once they're added to the data file.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NP1_OUTLINE;
    return NP1_OUTLINE.map((m) => ({
      ...m,
      topics: m.topics.filter(
        (t) =>
          t.toLowerCase().includes(q) || m.module.toLowerCase().includes(q)
      ),
    })).filter((m) => m.topics.length > 0);
  }, [query]);

  const hasLessons = subject.hasLessons;

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Lessons</h1>
        <p className="screen-sub">
          {subject.code} · {subject.title}
        </p>
      </div>

      {!hasLessons && (
        <div className="notice">
          <strong>Written lessons are in progress.</strong> The reviewed lesson
          text for this subject hasn't been authored yet, so nothing is shown as
          a lesson to avoid presenting unverified content. The approved{" "}
          <em>outline</em> below shows what's planned — and the{" "}
          <Link to="/exam">100 reviewed exam items</Link> and{" "}
          <Link to="/flashcards">flashcards</Link> are ready to study now.
        </div>
      )}

      <div className="search-wrap">
        <input
          className="search"
          type="search"
          placeholder="Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search lesson topics"
        />
      </div>

      <div className="outline">
        {results.map((m) => (
          <section key={m.module} className="outline-module">
            <h2 className="outline-module-title">{m.module}</h2>
            <ul className="outline-topics">
              {m.topics.map((t) => (
                <li key={t} className="outline-topic">
                  <span className="outline-topic-text">{t}</span>
                  <span className="chip chip-sm">Outline</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {results.length === 0 && (
          <p className="empty">No topics match “{query}”.</p>
        )}
      </div>
    </div>
  );
}
