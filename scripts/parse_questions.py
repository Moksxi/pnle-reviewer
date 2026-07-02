#!/usr/bin/env python3
"""
Parse the NP1 Community Health Nursing question bank (extracted from
"Mistybaby Review.pdf") into structured JSON.

Design notes:
- New questions are detected ONLY when a line's leading number equals the
  next expected question number. This prevents embedded numbered sub-items
  (e.g. "1. Strong political support" inside a question stem) from being
  misread as new questions, since those restart at 1.
- Options are keyed strictly on a single leading letter A-D followed by ".".
- SITUATION scenarios are attached to explicit, hand-verified question ranges
  (the source has no machine-readable marker for where a scenario stops
  applying), so general questions are never mislabelled with a scenario.

Source: NP1 Community Health Nursing, Exam 1, Bukidnon State University
        College of Nursing, 2nd Sem SY 2025-2026. All items are real,
        answered, and explained -> tagged source: "reviewed".
"""
import json
import re
from pathlib import Path

RAW = Path(__file__).parent / "np1_exam1_raw.txt"
OUT = Path(__file__).parent.parent / "src" / "data" / "np1-questions.json"

# --- Scenario definitions (SITUATION text -> inclusive question range) -------
# Ranges verified by hand against the source. Scenario text is normalised
# (the PDF wraps lines); question numbers not covered here have no scenario.
SITUATIONS = [
    {
        "id": "sit-awareness-months",
        "range": (17, 20),
        "text": ("The DOH has planned a program for the entire year to "
                 "celebrate as part of awareness of the people regarding "
                 "different public health problems."),
    },
    {
        "id": "sit-tb-general",
        "range": (21, 22),
        "text": ("Tuberculosis is considered the world's deadliest disease "
                 "and remains a major public health problem in the "
                 "Philippines."),
    },
    {
        "id": "sit-andrew-ptb",
        "range": (23, 25),
        "text": ("Andrew is 36 kg and 40 years old, diagnosed with PTB and "
                 "under treatment on FDC Regimen III."),
    },
    {
        "id": "sit-reuben-immunization",
        "range": (36, 40),
        "text": "Reuben is 6 months old. No immunization was given.",
    },
    {
        "id": "sit-gilda-dengue",
        "range": (42, 45),
        "text": ("Gilda has had fever for 3 days, with no cough but with "
                 "nausea, vomiting, and abdominal pain."),
    },
    {
        "id": "sit-sophia-malnutrition",
        "range": (46, 50),
        "text": ("Sophia is 3 years old, weighs 8 kg, and presents with "
                 "wasting and severe pallor."),
    },
    {
        "id": "sit-dlr-prenatal",
        "range": (72, 73),
        "text": ("Mrs. DLR, a prenatal patient, was referred to you. Her "
                 "husband has moderately advanced PTB. Their children "
                 "(3 years old and 1 year old) are underweight and not "
                 "immunized."),
    },
    {
        "id": "sit-municipality-sanitation",
        "range": (81, 85),
        "text": ("In the municipality assigned to you, people have poor "
                 "hygiene, poor environmental sanitation, poor nutrition, "
                 "and a low education level."),
    },
    {
        "id": "sit-aling-tasia-diarrhea",
        "range": (96, 100),
        "text": ("Aling Tasia's family lives in a squatter area. Her children "
                 "(3 and 7 years old) frequently suffer from diarrhea. You "
                 "made a home visit."),
    },
]

# --- NP I Part B = "Health Education & Research" (per PRC Enhanced TOS, NP I).
# Everything else is Part A (direct community/clinical content). These item
# numbers are the clear Health-Education / Research-&-Epidemiology-methodology
# items; the classification follows the source's own NP I Part A/B definition.
PART_B = {13, 15, 70, 71, 74, 75, 82, 85, 95}

OPTION_RE = re.compile(r"^([A-D])\.\s+(.*)$")
QNUM_RE = re.compile(r"^(\d+)\.\s+(.*)$")
ANSWER_RE = re.compile(r"^Correct Answer:\s*([A-D])\.?\s*(.*)$")


def situation_for(num):
    for s in SITUATIONS:
        lo, hi = s["range"]
        if lo <= num <= hi:
            return s["id"]
    return None


def clean(text):
    # drop zero-width / BOM chars the PDF sprinkles in, then collapse space
    text = re.sub(r"[​‌‍﻿]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def main():
    lines = RAW.read_text(encoding="utf-8", errors="replace").splitlines()

    questions = []
    expected = 1
    cur = None
    mode = None  # 'stem' | 'options' | 'answer' | 'expl'

    def flush():
        nonlocal cur
        if cur is None:
            return
        cur["question"] = clean(cur["_stem"])
        cur["rationale"] = clean(cur["_expl"])
        for o in cur["options"]:
            o["text"] = clean(o["text"])
        del cur["_stem"]
        del cur["_expl"]
        questions.append(cur)
        cur = None

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()

        qm = QNUM_RE.match(stripped)
        if qm and int(qm.group(1)) == expected:
            flush()
            num = expected
            cur = {
                "id": f"np1-e1-q{num}",
                "number": num,
                "subjectId": "np1",
                "situationId": situation_for(num),
                "_stem": qm.group(2),
                "options": [],
                "answer": None,
                "_expl": "",
                "part": "B" if num in PART_B else "A",
                "source": "reviewed",
            }
            mode = "stem"
            expected += 1
            continue

        if cur is None:
            continue

        if stripped.startswith("SITUATION"):
            # Scenario text is sourced from SITUATIONS map; skip raw lines.
            mode = "situation-skip"
            continue

        am = ANSWER_RE.match(stripped)
        if am:
            cur["answer"] = am.group(1)
            mode = "answer"
            continue

        if stripped.startswith("Explanation:"):
            mode = "expl"
            rest = stripped[len("Explanation:"):].strip()
            if rest:
                cur["_expl"] += " " + rest
            continue

        om = OPTION_RE.match(stripped)
        if om and mode in ("stem", "options"):
            cur["options"].append({"letter": om.group(1), "text": om.group(2)})
            mode = "options"
            continue

        # continuation / body lines
        if mode == "stem":
            if stripped:
                cur["_stem"] += " " + stripped
        elif mode == "options" and stripped:
            cur["options"][-1]["text"] += " " + stripped
        elif mode == "expl" and stripped:
            cur["_expl"] += " " + stripped
        elif mode == "answer" and stripped:
            # wrapped correct-answer text; letter already captured, ignore body
            pass
        # 'situation-skip' and blank lines fall through

    flush()

    # --- validation -----------------------------------------------------
    assert len(questions) == 100, f"expected 100 questions, got {len(questions)}"
    for q in questions:
        assert q["answer"] in {"A", "B", "C", "D"}, f"Q{q['number']} bad answer"
        letters = {o["letter"] for o in q["options"]}
        assert q["answer"] in letters, (
            f"Q{q['number']} answer {q['answer']} not in options {letters}")
        assert len(q["options"]) >= 2, f"Q{q['number']} too few options"
        assert q["rationale"], f"Q{q['number']} missing rationale"

    payload = {
        "subject": {
            "id": "np1",
            "code": "NP I",
            "title": "Community Health Nursing",
            "officialTitle": ("Care of Individuals, Families, Population "
                              "Groups and Community"),
        },
        "source": {
            "label": "Mistybaby Review — NP1 Community Health Nursing, Exam 1",
            "attribution": ("Bukidnon State University, College of Nursing, "
                            "2nd Semester SY 2025-2026"),
            "status": "reviewed",
        },
        "situations": SITUATIONS,
        "questions": questions,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False),
                   encoding="utf-8")
    partb = sum(1 for q in questions if q["part"] == "B")
    print(f"OK: wrote {len(questions)} questions to {OUT}")
    print(f"    Part A: {len(questions) - partb}  Part B: {partb}  "
          f"Situations: {len(SITUATIONS)}")


if __name__ == "__main__":
    main()
