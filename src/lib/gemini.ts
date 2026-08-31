import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("MISSING_KEY");
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

type ErrorKind =
  | "missing-key"
  | "invalid-key"
  | "daily-quota"
  | "rate-limit"
  | "server-overloaded"
  | "bad-response"
  | "unknown";

interface ClassifiedError {
  kind: ErrorKind;
  retryable: boolean;
  /** Short, human-readable message — never the raw stack trace. */
  userMessage: string;
}

/**
 * Turns whatever @google/genai (or our own code) throws into a short,
 * specific, user-facing message instead of the raw SDK error — which
 * otherwise dumps its entire message + a nested `.cause` stack trace, and
 * ends up looking like a full page crash even though it's just a wall of
 * text inside our own error UI.
 */
function classify(err: unknown): ClassifiedError {
  const anyErr = err as { status?: number; code?: number; name?: string; constructor?: { name?: string } };
  const status = anyErr?.status ?? anyErr?.code;
  const errorName = anyErr?.name ?? anyErr?.constructor?.name ?? "";
  const message = err instanceof Error ? err.message : String(err);
  const cause = err instanceof Error ? (err as { cause?: unknown }).cause : undefined;
  const causeMessage = cause instanceof Error ? cause.message : cause ? String(cause) : "";
  const fullText = `${message} ${causeMessage} ${errorName}`;

  if (message === "MISSING_KEY") {
    return {
      kind: "missing-key",
      retryable: false,
      userMessage: "No Gemini API key is set. Add GEMINI_API_KEY to .env.local and restart the server.",
    };
  }

  if (status === 401 || status === 403 || /API[_ ]?KEY.*(invalid|expired)|invalid.*API[_ ]?key/i.test(fullText)) {
    return {
      kind: "invalid-key",
      retryable: false,
      userMessage:
        "Your Gemini API key looks invalid or expired. Get a new one at https://aistudio.google.com/apikey and update GEMINI_API_KEY in .env.local.",
    };
  }

  const isResourceExhausted = status === 429 || /429|RESOURCE_EXHAUSTED|Too Many Requests/i.test(fullText);
  if (isResourceExhausted) {
    const isDaily = /PerDay|per[- ]?day|daily/i.test(fullText);
    if (isDaily) {
      return {
        kind: "daily-quota",
        retryable: false, // retrying won't help — this resets on Google's clock, not in seconds
        userMessage:
          "You've hit today's free-tier request limit for this Gemini API key. It resets in about 24 hours, or you can switch to a different API key in .env.local to continue now.",
      };
    }
    return {
      kind: "rate-limit",
      retryable: true,
      userMessage: "Gemini is rate-limiting requests right now. This usually recovers in under a minute — try again shortly.",
    };
  }

  if (status === 500 || status === 503 || /ServerError/i.test(errorName) || /UNAVAILABLE|overloaded|internal error/i.test(fullText)) {
    return {
      kind: "server-overloaded",
      retryable: true,
      userMessage: "Gemini's servers are temporarily overloaded. Retrying automatically — if this keeps happening, try again in a minute.",
    };
  }

  if (/non-JSON output/i.test(message)) {
    return {
      kind: "bad-response",
      retryable: false,
      userMessage: "Gemini returned an unexpected response for this page. Try re-uploading, or try again.",
    };
  }

  return {
    kind: "unknown",
    retryable: false,
    userMessage: message.length > 200 ? `${message.slice(0, 200)}…` : message || "Something went wrong calling Gemini.",
  };
}

async function withRateLimitRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const classified = classify(err);
      attempt += 1;

      if (!classified.retryable || attempt > maxRetries) {
        // Attach the clean, short message so callers never have to re-derive it.
        throw new Error(classified.userMessage, { cause: err });
      }

      const message = err instanceof Error ? err.message : String(err);
      const secondsMatch =
        message.match(/retry in ([\d.]+)s/i) ?? message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
      const waitSeconds = secondsMatch
        ? parseFloat(secondsMatch[1])
        : Math.min(20, 2 ** attempt) + Math.random() * 2;

      console.warn(
        `Gemini call failed (${classified.kind}), retrying in ${waitSeconds.toFixed(1)}s (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, (waitSeconds + 1) * 1000));
    }
  }
}

/**
 * Calls Gemini with a text prompt + optional inline images and parses the
 * response as JSON. Server-only (uses the API key) — call from API routes.
 */
export async function generateStructured<T>(
  prompt: string,
  images: { mimeType: string; data: string }[] = []
): Promise<T> {
  const ai = getClient();

  const response = await withRateLimitRetry(() =>
    ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...images.map((img) => ({
              inlineData: { mimeType: img.mimeType, data: img.data },
            })),
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    })
  );

  const text = response.text ?? "{}";
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    throw new Error(classify(new Error("non-JSON output")).userMessage);
  }
}

/**
 * Pulls a short, clean, user-facing message out of any error this module
 * throws (or a raw Gemini SDK error, if one somehow escapes unclassified) —
 * never the raw stack trace / nested cause dump. Safe to call on an error
 * that's already been through classify() once (e.g. re-thrown by
 * withRateLimitRetry) — the friendly messages don't match any of the
 * technical regexes below, so they pass through unchanged.
 */
export function describeGeminiError(err: unknown): string {
  return classify(err).userMessage;
}
