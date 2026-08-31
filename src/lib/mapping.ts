import { ExtractedQuestion, ExtractedAnswer, MappingResult } from "./types";

/**
 * Exact match pass: pair questions to answers on (number, subpart).
 * Anything left over becomes an unmatched answer, and any question
 * with no match is simply unanswered (answer: null).
 */
export function mapQuestionsToAnswers(
  questions: ExtractedQuestion[],
  answers: ExtractedAnswer[]
): MappingResult {
  const used = new Set<string>();

  const sortedQuestions = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);

  const pairs = sortedQuestions.map((q) => {
    const match = answers.find(
      (a) =>
        !used.has(a.id) &&
        a.matchedNumber === q.number &&
        (a.matchedSubpart ?? null) === (q.subpart ?? null)
    );
    if (match) used.add(match.id);
    return { question: q, answer: match ?? null };
  });

  const unmatchedAnswers = answers.filter((a) => !used.has(a.id));

  return { pairs, unmatchedAnswers };
}
