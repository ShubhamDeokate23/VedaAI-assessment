export const QUESTION_EXTRACTION_PROMPT = `
You are analyzing a printed exam question paper page.
Extract every question in the exact order printed. Treat labelled sub-parts (e.g. "11 (a)", "11 (b)")
as SEPARATE entries that share the same parent number but have a different subpart letter.
Preserve original numbering exactly as printed — do not renumber or reorder.

Return strict JSON matching this shape, and nothing else:
{
  "questions": [
    { "number": "11", "subpart": "a", "text": "...", "orderIndex": 1 }
  ]
}
If a question has no subpart, set "subpart" to null. "orderIndex" is the 1-based printed order
across the whole page (continue incrementing across pages if told the current running count).
`;

export const ANSWER_EXTRACTION_PROMPT = `
You are analyzing ONE PAGE of a student's handwritten answer sheet.
Find every distinct answer block on this page. For each block:
- Read the question number the student wrote (e.g. "Q2", "11 a)"). If none is visible or legible,
  set matchedNumber to null.
- Transcribe the handwritten text as accurately as you can.
- Return a bounding box in 0-1000 normalized coordinates [ymin, xmin, ymax, xmax] tightly around
  ONLY that answer's handwritten region (exclude surrounding blank space, margins, and the printed
  question number if it's boxed separately).
- If the answer visibly continues from the previous page or onto the next, say so.
- Set confidence: "high" if the question number is clearly written, "medium" if inferred from
  layout/order, "low" if guessed, "none" if you truly cannot tell — still extract the text and bbox.

Return strict JSON matching this shape, and nothing else:
{
  "answers": [
    {
      "matchedNumber": "2",
      "matchedSubpart": null,
      "confidence": "high",
      "text": "...",
      "bbox": { "ymin": 0, "xmin": 0, "ymax": 0, "xmax": 0 },
      "continuesOnPage": null
    }
  ]
}
`;

export const AMBIGUOUS_MATCH_PROMPT = (
  unansweredQuestions: { id: string; number: string; subpart: string | null; text: string }[],
  looseAnswers: { id: string; text: string }[]
) => `
Some handwritten answers could not be confidently matched to a question by number.
Given the still-unanswered questions and the leftover answer texts below, decide the single best
question match for each leftover answer, if any. Only match when the content plausibly answers
that question. Otherwise return null for that answer.

Unanswered questions:
${JSON.stringify(unansweredQuestions, null, 2)}

Leftover answers:
${JSON.stringify(looseAnswers, null, 2)}

Return strict JSON matching this shape, and nothing else:
{
  "matches": [ { "answerId": "...", "questionId": "..." | null } ]
}
`;

/**
 * Grades a BATCH of question/answer pairs in a single call instead of one
 * call per question — cuts Gemini call count significantly for grading
 * without the accuracy cost that batching had on extraction (grading text
 * is much shorter/simpler input than multiple full-page images).
 */
export function batchGradingPrompt(
  items: { id: string; questionText: string; answerText: string }[]
) {
  return `
For each item below, assign a max score appropriate to the question's complexity — 2 for short
factual recall, up to 5 for explanation/diagram/multi-step questions. Use your judgement, but be
consistent across similar questions in this batch. Grade the student's answer against that max
score, and write one short, specific, encouraging feedback sentence: name what's correct, and name
what's missing if anything is.

Items:
${JSON.stringify(items, null, 2)}

Return strict JSON matching this shape, and nothing else:
{
  "grades": [
    { "id": "...", "score": 0, "maxScore": 0, "correct": false, "feedback": "..." }
  ]
}
Include exactly one entry per item id, in any order.
`;
}
