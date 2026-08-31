# VedaAI Assessment Mapper
Use This resources https://drive.google.com/drive/folders/1I-9uBRtlKk8j6hX4AJkdQvuUmiq6-1BG?usp=sharing.
Upload a question paper and a student's handwritten answer sheet; the app extracts every question
(printed order, sub-parts like 11(a)/11(b) as separate entries), extracts and transcribes the
student's answers, maps each answer to its question, highlights the exact answer region on the
sheet, and grades each answered question with AI feedback.

## Stack
Next.js 15 (App Router, TS) · Tailwind CSS · Zustand · pdfjs-dist (client-side PDF rasterization) ·
Google Gemini 3.6 Flash (`@google/genai`) for extraction, mapping fallback, and grading.

## Setup
```bash
npm install
cp .env.local.example .env.local   # then paste your Gemini key from https://aistudio.google.com/apikey
npm run dev
```
Open http://localhost:3000.

## How it works
1. **Upload** (`/`) — both files are rasterized to PNG pages entirely in the browser (`lib/pdfToImages.ts`),
   so there's no server-side PDF binary dependency (deploys cleanly on Vercel).
2. **Extraction** — each page image is sent to Gemini with a structured-JSON prompt (`lib/prompts.ts`):
   `extract-questions` returns ordered questions (with sub-parts), `extract-answers` returns transcribed
   answer blocks with a normalized 0-1000 bounding box per block.
3. **Mapping** (`lib/mapping.ts` + `api/map-answers`) — exact match on (number, subpart) first; anything
   left over (no legible number, ambiguous) goes through a second Gemini call that picks the best
   remaining match or leaves it unmatched.
4. **Grading** (`api/grade`) — one Gemini call per answered question, returns `{score, maxScore, correct,
   feedback}`; unanswered questions are simply skipped and shown with a "—" badge.
5. **Mapping screen** (`/mapping`) — clicking a question jumps the answer-sheet viewer to the right page
   and highlights its bounding box; a mobile tab-switch replaces the two-pane layout on small screens.

## Known assumptions / limitations
- Matching relies on the student having written *some* legible question number; fully unlabeled answers
  with no positional cues can be mismatched or left in "Unmatched answers."
- Max marks per question are AI-estimated when the paper doesn't print them explicitly.
- Bounding-box accuracy depends on handwriting legibility and scan/photo quality.
