import { NextRequest, NextResponse } from "next/server";
import { generateStructured, describeGeminiError } from "@/lib/gemini";
import { AMBIGUOUS_MATCH_PROMPT } from "@/lib/prompts";
import { mapQuestionsToAnswers } from "@/lib/mapping";
import type { ExtractedQuestion, ExtractedAnswer } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { questions, answers } = (await req.json()) as {
      questions: ExtractedQuestion[];
      answers: ExtractedAnswer[];
    };

    // Pass 1: exact number + subpart match.
    let { pairs, unmatchedAnswers } = mapQuestionsToAnswers(questions, answers);

    // Pass 2: AI fallback for anything still unresolved — covers answers
    // with no legible question number, and unanswered questions the
    // student may have labelled ambiguously.
    const stillUnanswered = pairs.filter((p) => !p.answer);
    const looseAnswers = unmatchedAnswers.filter((a) => a.confidence !== "high");

    if (stillUnanswered.length && looseAnswers.length) {
      const prompt = AMBIGUOUS_MATCH_PROMPT(
        stillUnanswered.map((p) => ({
          id: p.question.id,
          number: p.question.number,
          subpart: p.question.subpart ?? null,
          text: p.question.text,
        })),
        looseAnswers.map((a) => ({ id: a.id, text: a.text }))
      );

      const result = await generateStructured<{
        matches: { answerId: string; questionId: string | null }[];
      }>(prompt);

      const answerById = new Map(looseAnswers.map((a) => [a.id, a]));
      const usedAnswerIds = new Set<string>();

      pairs = pairs.map((p) => {
        if (p.answer) return p;
        const m = result.matches?.find((m) => m.questionId === p.question.id);
        const matchedAnswer = m ? answerById.get(m.answerId) : undefined;
        if (matchedAnswer) {
          usedAnswerIds.add(matchedAnswer.id);
          return { ...p, answer: matchedAnswer };
        }
        return p;
      });

      unmatchedAnswers = unmatchedAnswers.filter((a) => !usedAnswerIds.has(a.id));
    }

    return NextResponse.json({ pairs, unmatchedAnswers });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: describeGeminiError(err) || "Mapping failed" },
      { status: 500 }
    );
  }
}
