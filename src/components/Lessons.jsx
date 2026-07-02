import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allLessons, getLesson } from "../data/subjects.js";
import SourceTag from "./SourceTag.jsx";

const LESSONS = allLessons();

export default function Lessons() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const openId = params.get("lesson");
  const open = openId ? getLesson(openId) : null;

  if (open) {
    return (
      <LessonDetail
        lesson={open}
        onBack={() => setParams({})}
        onOpen={(id) => setParams({ lesson: id })}
      />
    );
  }

  return (
    <LessonList
      query={query}
      onQuery={setQuery}
      onOpen={(id) => setParams({ lesson: id })}
    />
  );
}

function LessonList({ query, onQuery, onOpen }) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LESSONS;
    return LESSONS.filter((l) => {
      const haystack = [
        l.title,
        l.category,
        l.subcategory,
        ...(l.core_concepts || []),
        ...(l.quick_review || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map();
    results.forEach((l) => {
      const key = l.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(l);
    });
    return [...map.entries()];
  }, [results]);

  return (
    <div className="screen">
      <div className="screen-head">
        <h1>Lessons</h1>
        <p className="screen-sub">NP I · Community Health Nursing</p>
      </div>

      <div className="search-wrap">
        <input
          className="search"
          type="search"
          placeholder="Search lessons, topics, concepts…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Search lessons"
        />
      </div>

      <div className="outline">
        {grouped.map(([category, lessons]) => (
          <section key={category} className="outline-module">
            <h2 className="outline-module-title">{category}</h2>
            <ul className="lesson-list">
              {lessons.map((l) => (
                <li key={l.id}>
                  <button className="lesson-card" onClick={() => onOpen(l.id)}>
                    <div className="lesson-card-top">
                      <span className="lesson-card-title">{l.title}</span>
                      <span className="lesson-stars">{l.high_yield}</span>
                    </div>
                    <div className="lesson-card-meta">
                      <span>{l.subcategory}</span>
                      <span>·</span>
                      <span>{l.estimated_study_time_min} min</span>
                      <span>·</span>
                      <span>{l.difficulty}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {grouped.length === 0 && (
          <p className="empty">No lessons match “{query}”.</p>
        )}
      </div>
    </div>
  );
}

function LessonDetail({ lesson: l, onBack, onOpen }) {
  return (
    <div className="screen lesson-detail">
      <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
        ← All lessons
      </button>

      <div className="lesson-head">
        <div className="lesson-head-top">
          <span className="lesson-stars lg">{l.high_yield}</span>
          <SourceTag source={l.source} />
        </div>
        <h1 className="lesson-title">{l.title}</h1>
        <p className="lesson-sub">
          {l.category} · {l.subcategory}
        </p>
        <div className="lesson-chips">
          <span className="chip">{l.difficulty}</span>
          <span className="chip">{l.estimated_study_time_min} min read</span>
        </div>
      </div>

      <Section title="Learning objectives">
        <ul className="bullet-list">
          {l.learning_objectives?.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Section>

      <Section title="Core concepts">
        <ul className="bullet-list">
          {l.core_concepts?.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>

      {l.definitions?.length > 0 && (
        <Section title="Key definitions">
          <dl className="def-list">
            {l.definitions.map((d) => (
              <div className="def-row" key={d.term}>
                <dt>{d.term}</dt>
                <dd>{d.definition}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {l.detailed_explanation && (
        <Section title="Explanation">
          <p className="lesson-prose">{l.detailed_explanation}</p>
        </Section>
      )}

      {l.clinical_significance && (
        <Section title="Clinical significance">
          <p className="lesson-prose">{l.clinical_significance}</p>
        </Section>
      )}

      {hasNursingManagement(l.nursing_management) && (
        <Section title="Nursing management">
          {l.nursing_management.nursing_process && (
            <dl className="def-list">
              {Object.entries(l.nursing_management.nursing_process)
                .filter(([, v]) => v)
                .map(([step, text]) => (
                  <div className="def-row" key={step}>
                    <dt style={{ textTransform: "capitalize" }}>{step}</dt>
                    <dd>{text}</dd>
                  </div>
                ))}
            </dl>
          )}
          {l.nursing_management.patient_education?.length > 0 && (
            <>
              <h3 className="sub-heading">Patient education</h3>
              <ul className="bullet-list">
                {l.nursing_management.patient_education.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {l.priority_nursing_actions?.length > 0 && (
        <Section title="Priority nursing actions">
          <ul className="bullet-list">
            {l.priority_nursing_actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      )}

      {toArray(l.complications).length > 0 && (
        <Section title="Complications">
          <ul className="bullet-list">
            {toArray(l.complications).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {toArray(l.safety_considerations).length > 0 && (
        <Section title="Safety considerations">
          <ul className="bullet-list">
            {toArray(l.safety_considerations).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      )}

      {l.board_exam_focus && (
        <Section title="Board exam focus">
          {l.board_exam_focus.common_exam_angles?.length > 0 && (
            <>
              <h3 className="sub-heading">Common exam angles</h3>
              <ul className="bullet-list">
                {l.board_exam_focus.common_exam_angles.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
          {l.board_exam_focus.clinical_pearls?.length > 0 && (
            <>
              <h3 className="sub-heading">Clinical pearls</h3>
              <ul className="bullet-list pearl">
                {l.board_exam_focus.clinical_pearls.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
          {l.board_exam_focus.common_mistakes?.length > 0 && (
            <>
              <h3 className="sub-heading">Common mistakes</h3>
              <ul className="bullet-list warn">
                {l.board_exam_focus.common_mistakes.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {l.mnemonics?.length > 0 && (
        <Section title="Mnemonics">
          <div className="mnemonic-list">
            {l.mnemonics.map((m) => (
              <div className="mnemonic" key={m.mnemonic}>
                <div className="mnemonic-key">{m.mnemonic}</div>
                <div className="mnemonic-expansion">{m.expansion}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {l.quick_review?.length > 0 && (
        <Section title="Quick review">
          <ul className="bullet-list">
            {l.quick_review.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Section>
      )}

      {l.key_takeaways?.length > 0 && (
        <Section title="Key takeaways">
          <ul className="bullet-list highlight">
            {l.key_takeaways.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </Section>
      )}

      {l.references?.length > 0 && (
        <Section title="References">
          <ul className="ref-list">
            {l.references.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      )}

      {l.related_lessons?.length > 0 && (
        <Section title="Related lessons">
          <div className="related-chips">
            {l.related_lessons.map((id) => {
              const rel = getLesson(id);
              if (!rel) return null;
              return (
                <button
                  key={id}
                  className="chip chip-link"
                  onClick={() => onOpen(id)}
                >
                  {rel.title}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="lesson-section">
      <h2 className="lesson-section-title">{title}</h2>
      {children}
    </section>
  );
}

function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function hasNursingManagement(nm) {
  if (!nm) return false;
  const hasProcess =
    nm.nursing_process &&
    Object.values(nm.nursing_process).some((v) => v);
  const hasEducation = nm.patient_education?.length > 0;
  return hasProcess || hasEducation;
}
