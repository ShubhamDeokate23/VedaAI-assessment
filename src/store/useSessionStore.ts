"use client";

import { create } from "zustand";
import type {
  ExtractedQuestion,
  ExtractedAnswer,
  QuestionAnswerPair,
  PipelineStage,
  PageImage,
  AssignmentSession,
} from "@/lib/types";

interface UploadedFile {
  file: File;
  pages: PageImage[];
}

interface SessionState {
  // Staging area for the two files being uploaded, before "Start Mapping"
  // turns them into a saved AssignmentSession.
  questionPaper: UploadedFile | null;
  answerSheet: UploadedFile | null;

  // All assignments processed this session (in-memory — per the
  // assignment's "no database required" constraint, this resets on reload,
  // which is intentional: it's a session-scoped list, not persisted storage).
  assignments: AssignmentSession[];
  activeAssignmentId: string | null;

  selectedQuestionId: string | null;
  activeAnswerPage: number;
  mobileTab: "questions" | "answerSheet";
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  setQuestionPaper: (f: UploadedFile | null) => void;
  setAnswerSheet: (f: UploadedFile | null) => void;

  createAssignment: (input: {
    title: string;
    answerSheetName: string;
    questionPaperPages: PageImage[];
    answerSheetPages: PageImage[];
  }) => string;
  updateAssignment: (id: string, patch: Partial<AssignmentSession>) => void;
  setActiveAssignmentId: (id: string | null) => void;
  setStage: (s: PipelineStage, error?: string | null) => void;
  setResults: (r: {
    questions: ExtractedQuestion[];
    answers: ExtractedAnswer[];
    pairs: QuestionAnswerPair[];
    unmatchedAnswers: ExtractedAnswer[];
  }) => void;

  selectQuestion: (id: string | null) => void;
  setActiveAnswerPage: (page: number) => void;
  setMobileTab: (tab: "questions" | "answerSheet") => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  questionPaper: null,
  answerSheet: null,

  assignments: [],
  activeAssignmentId: null,

  selectedQuestionId: null,
  activeAnswerPage: 1,
  mobileTab: "questions",
  sidebarCollapsed: false,
  mobileSidebarOpen: false,

  setQuestionPaper: (f) => set({ questionPaper: f }),
  setAnswerSheet: (f) => set({ answerSheet: f }),

  createAssignment: ({ title, answerSheetName, questionPaperPages, answerSheetPages }) => {
    const id = `assn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const assignment: AssignmentSession = {
      id,
      title,
      answerSheetName,
      createdAt: Date.now(),
      stage: "extracting-questions",
      errorMessage: null,
      questionPaperPages,
      answerSheetPages,
      questions: [],
      answers: [],
      pairs: [],
      unmatchedAnswers: [],
    };
    set((state) => ({
      assignments: [assignment, ...state.assignments],
      activeAssignmentId: id,
      selectedQuestionId: null,
      activeAnswerPage: 1,
      mobileTab: "questions",
    }));
    return id;
  },

  updateAssignment: (id, patch) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  setActiveAssignmentId: (id) =>
    set({ activeAssignmentId: id, selectedQuestionId: null, activeAnswerPage: 1, mobileTab: "questions" }),

  // Convenience wrappers that patch the *currently active* assignment —
  // used by the extraction pipeline in the upload page.
  setStage: (s, error = null) => {
    const id = get().activeAssignmentId;
    if (!id) return;
    get().updateAssignment(id, { stage: s, errorMessage: error });
  },
  setResults: ({ questions, answers, pairs, unmatchedAnswers }) => {
    const id = get().activeAssignmentId;
    if (!id) return;
    get().updateAssignment(id, { questions, answers, pairs, unmatchedAnswers });
  },

  selectQuestion: (id) => set({ selectedQuestionId: id }),
  setActiveAnswerPage: (page) => set({ activeAnswerPage: page }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));

/** The assignment currently being viewed/processed on /mapping. */
export function useActiveAssignment(): AssignmentSession | null {
  return useSessionStore((state) =>
    state.assignments.find((a) => a.id === state.activeAssignmentId) ?? null
  );
}
