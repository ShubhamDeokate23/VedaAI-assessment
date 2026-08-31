import { NextRequest, NextResponse } from "next/server";
import { generateStructured, describeGeminiError } from "@/lib/gemini";
import { batchGradingPrompt } from "@/lib/prompts";
import type { QuestionAnswerPair } from "@/lib/types";

interface GradeResult {
  id: string;
  score: number;
  maxScore: number;
  correct: boolean;
  feedback: string;
}

// Larger batches = fewer Gemini calls = less likely to hit the free tier's
// requests-per-minute quota. 8 questions per call keeps the response small
// enough to stay reliable while cutting call count roughly 8x vs one-per-question.
const BATCH_SIZE = 8;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { pairs?: QuestionAnswerPair[] };
    const pairs = body.pairs;

    if (!Array.isArray(pairs)) {
      return NextResponse.json(
        { error: "No pairs array was sent to /api/grade — the mapping step may have failed upstream." },
        { status: 400 }
      );
    }

    const gradable = pairs.filter((p) => p.answer);
    const graded: Record<string, Omit<GradeResult, "id">> = {};

    for (let i = 0; i < gradable.length; i += BATCH_SIZE) {
      const batch = gradable.slice(i, i + BATCH_SIZE);
      const items = batch.map((p) => ({
        id: p.question.id,
        questionText: p.question.text,
        answerText: p.answer!.text,
      }));

      const result = await generateStructured<{ grades: GradeResult[] }>(batchGradingPrompt(items));

      for (const g of result.grades ?? []) {
        graded[g.id] = { score: g.score, maxScore: g.maxScore, correct: g.correct, feedback: g.feedback };
      }
    }

    return NextResponse.json({ graded });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: describeGeminiError(err) || "Grading failed" },
      { status: 500 }
    );
  }
}
