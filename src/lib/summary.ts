import type { QuestionAnswerPair } from "./types";

export interface AssignmentSummary {
  totalQuestions: number;
  answered: number;
  unanswered: number;
  totalScore: number;
  totalMaxScore: number;
}

export function summarizePairs(pairs: QuestionAnswerPair[]): AssignmentSummary {
  const totalQuestions = pairs.length;
  const answered = pairs.filter((p) => p.answer).length;
  const totalScore = pairs.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const totalMaxScore = pairs.reduce((sum, p) => sum + (p.maxScore ?? 0), 0);
  return {
    totalQuestions,
    answered,
    unanswered: totalQuestions - answered,
    totalScore,
    totalMaxScore,
  };
}
