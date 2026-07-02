// Small badge distinguishing reviewed content from generated drafts.
// All current data is "reviewed"; the "generated_draft" branch exists so any
// future draft item is unmistakably labelled per the content-integrity rule.
export default function SourceTag({ source }) {
  if (source === "generated_draft") {
    return <span className="tag tag-draft">Draft — pending review</span>;
  }
  return <span className="tag tag-reviewed">Reviewed</span>;
}

export function PartTag({ part }) {
  return (
    <span className={"tag tag-part part-" + part}>
      Part {part}
      <span className="tag-part-hint">
        {part === "A" ? " · clinical" : " · competency"}
      </span>
    </span>
  );
}
