export interface ExtractedQuestion {
  id: string;                 // e.g. "11a"
  number: string;             // "11"
  subpart?: string | null;    // "a" | "b" | null
  text: string;
  page: number;
  orderIndex: number;
}

export interface BBox {
  ymin: number; // 0-1000 normalized
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ExtractedAnswer {
  id: string;
  matchedNumber: string | null;
  matchedSubpart: string | null;
  confidence: "high" | "medium" | "low" | "none";
  text: string;
  page: number;
  bbox: BBox;
  continuesOnPage?: number | null;
}

export interface QuestionAnswerPair {
  question: ExtractedQuestion;
  answer: ExtractedAnswer | null; // null => unanswered
  score?: number;
  maxScore?: number;
  correct?: boolean;
  feedback?: string;
}

export interface MappingResult {
  pairs: QuestionAnswerPair[];
  unmatchedAnswers: ExtractedAnswer[];
}

export type PipelineStage =
  | "idle"
  | "uploading"
  | "extracting-questions"
  | "extracting-answers"
  | "mapping"
  | "grading"
  | "ready"
  | "error";

export interface PageImage {
  page: number;
  dataUrl: string; // full data:image/png;base64,... for <img src>
  base64: string;  // raw base64, no prefix — for sending to Gemini
}

/**
 * A single teacher-uploaded question paper + answer sheet, and everything
 * produced from it. Kept in an in-memory list in the store (per the
 * assignment's "no database required, in-memory storage is sufficient")
 * so multiple uploads during a session show up under "Assignments" and can
 * be reopened without re-running extraction.
 */
export interface AssignmentSession {
  id: string;
  title: string;            // question paper filename
  answerSheetName: string;
  createdAt: number;
  stage: PipelineStage;
  errorMessage: string | null;
  questionPaperPages: PageImage[];
  answerSheetPages: PageImage[];
  questions: ExtractedQuestion[];
  answers: ExtractedAnswer[];
  pairs: QuestionAnswerPair[];
  unmatchedAnswers: ExtractedAnswer[];
}
