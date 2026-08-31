import { NextRequest, NextResponse } from "next/server";
import { generateStructured, describeGeminiError } from "@/lib/gemini";
import { QUESTION_EXTRACTION_PROMPT } from "@/lib/prompts";
import type { ExtractedQuestion } from "@/lib/types";

interface RawQuestion {
  number: string;
  subpart?: string | null;
  text: string;
  orderIndex: number;
}

export async function POST(req: NextRequest) {
  try {
    const { pages } = (await req.json()) as { pages: { page: number; base64: string }[] };

    // One Gemini call PER PAGE, run in parallel. This is the version that
    // was actually extracting reliably — bundling every page into a single
    // multi-image call (tried briefly to cut down request count) caused the
    // model to miss/garble answers on multi-page documents.
    const results = await Promise.all(
      pages.map((p) =>
        generateStructured<{ questions: RawQuestion[] }>(
          `${QUESTION_EXTRACTION_PROMPT}\nThis is page ${p.page}.`,
          [{ mimeType: "image/png", data: p.base64 }]
        ).then((result) => ({ page: p.page, questions: result.questions ?? [] }))
      )
    );

    const allQuestions: ExtractedQuestion[] = [];
    let runningOrder = 0;

    for (const { page, questions } of results.sort((a, b) => a.page - b.page)) {
      for (const q of questions) {
        runningOrder += 1;
        allQuestions.push({
          id: `${q.number}${q.subpart ?? ""}`,
          number: q.number,
          subpart: q.subpart ?? null,
          text: q.text,
          page,
          orderIndex: runningOrder,
        });
      }
    }

    return NextResponse.json({ questions: allQuestions });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: describeGeminiError(err) || "Question extraction failed" },
      { status: 500 }
    );
  }
}
