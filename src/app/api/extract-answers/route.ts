import { NextRequest, NextResponse } from "next/server";
import { generateStructured, describeGeminiError } from "@/lib/gemini";
import { ANSWER_EXTRACTION_PROMPT } from "@/lib/prompts";
import type { ExtractedAnswer } from "@/lib/types";

interface RawAnswer {
  matchedNumber: string | null;
  matchedSubpart: string | null;
  confidence: "high" | "medium" | "low" | "none";
  text: string;
  bbox: { ymin: number; xmin: number; ymax: number; xmax: number };
  continuesOnPage?: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const { pages } = (await req.json()) as { pages: { page: number; base64: string }[] };

    // Same reasoning as extract-questions: one call per page, in parallel,
    // is what reliably extracted every answer. A single multi-image call
    // was faster and lighter on quota, but noticeably worse at actually
    // finding and transcribing answers — accuracy wins here.
    const results = await Promise.all(
      pages.map((p) =>
        generateStructured<{ answers: RawAnswer[] }>(
          `${ANSWER_EXTRACTION_PROMPT}\nThis is page ${p.page}.`,
          [{ mimeType: "image/png", data: p.base64 }]
        ).then((result) => ({ page: p.page, answers: result.answers ?? [] }))
      )
    );

    const allAnswers: ExtractedAnswer[] = [];
    let counter = 0;

    for (const { page, answers } of results.sort((a, b) => a.page - b.page)) {
      for (const a of answers) {
        counter += 1;
        allAnswers.push({
          id: `ans-${page}-${counter}`,
          matchedNumber: a.matchedNumber,
          matchedSubpart: a.matchedSubpart,
          confidence: a.confidence,
          text: a.text,
          page,
          bbox: a.bbox,
          continuesOnPage: a.continuesOnPage ?? null,
        });
      }
    }

    return NextResponse.json({ answers: allAnswers });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: describeGeminiError(err) || "Answer extraction failed" },
      { status: 500 }
    );
  }
}
