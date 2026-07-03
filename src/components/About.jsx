import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="screen">
      <Link className="btn btn-ghost btn-sm back-btn" to="/">
        ← Home
      </Link>

      <div className="screen-head">
        <h1>About this reviewer</h1>
      </div>

      <section className="lesson-section">
        <p className="lesson-prose">
          This reviewer is built differently from most PNLE review apps.
          Every lesson is written from real sources — Republic Acts, DOH
          Administrative Orders, PRC issuances, PSA data — not paraphrased
          from other review materials. Where a fact comes from an official
          source, it's cited. Where something is uncertain, review-center
          convention rather than official policy, or couldn't be verified,
          it's labeled that way instead of presented as fact.
        </p>
      </section>

      <div className="notice">
        Content gets corrected when errors are found. For example: an
        earlier version of the COPAR lesson listed 3 phases; research
        confirmed the correct structure is 4 phases (Pre-Entry, Entry,
        Organization-Building, Sustenance and Strengthening), and the lesson
        was updated. The disaster nursing lesson originally used a generic
        international phase model before being corrected to match RA
        10121's actual official terminology. These corrections are part of
        the process, not something we hide.
      </div>

      <section className="lesson-section">
        <p className="lesson-prose">
          New content is tagged as reviewed only after its facts are
          checked against primary sources. Anything still being drafted is
          labeled as a draft, never presented as finished, verified
          material.
        </p>
        <p className="lesson-prose">
          This is a work in progress, currently covering NP I (Community
          Health Nursing) in depth, with the other four subject areas
          planned next.
        </p>
      </section>
    </div>
  );
}
