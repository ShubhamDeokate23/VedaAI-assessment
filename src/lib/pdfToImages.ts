"use client";

import * as pdfjsLib from "pdfjs-dist";
import type { PageImage } from "./types";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Renders every page of a PDF file to a PNG, client-side, and returns both
 * a full data URL (for <img src>) and the raw base64 (for sending to Gemini).
 * Kept in the browser so the app has no server-side PDF-rasterization
 * dependency (no poppler binary needed) and stays deployable on Vercel.
 */
export async function pdfToImages(file: File, scale = 1.8): Promise<PageImage[]> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new Error("This file couldn't be read from disk — try re-selecting it.");
  }

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch (err) {
    throw new Error(
      "This doesn't look like a valid PDF — it may be corrupted, password-protected, or not actually a PDF."
    );
  }

  if (pdf.numPages === 0) {
    throw new Error("This PDF has no pages.");
  }

  const images: PageImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't render this PDF (canvas unavailable).");
    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    images.push({ page: i, dataUrl, base64: dataUrl.split(",")[1] });
  }

  return images;
}

/** For plain image uploads (jpg/png instead of a PDF) — normalizes to the same shape. */
export async function imageFileToPageImage(file: File): Promise<PageImage> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read this image file."));
    reader.readAsDataURL(file);
  });
  return { page: 1, dataUrl, base64: dataUrl.split(",")[1] };
}

export async function fileToPageImages(file: File): Promise<PageImage[]> {
  if (file.type === "application/pdf") return pdfToImages(file);
  return [await imageFileToPageImage(file)];
}
