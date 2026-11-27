import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export interface GeminiModelAttempt {
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  thinkingLevel: ThinkingLevel;
  timeoutMs: number;
}

export const VAYU_MODEL_FALLBACK_CHAIN: readonly GeminiModelAttempt[] = [
  { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, timeoutMs: 12000 },
  { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 15000 },
  { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 18000 },
];

export function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown Gemini API error';
  }
}

export function isTransientGeminiError(err: unknown): boolean {
  const msg = extractErrorMessage(err).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('504') ||
    msg.includes('internal') ||
    msg.includes('econnreset') ||
    msg.includes('fetch failed')
  );
}

export function formatFriendlyGeminiError(err: unknown): { status: number; message: string } {
  const raw = extractErrorMessage(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('403') ||
    lower.includes('api key not valid') ||
    lower.includes('insufficient authentication')
  ) {
    return {
      status: 403,
      message:
        'Vayu AI cannot authenticate with the Gemini API right now. Please verify GEMINI_API_KEY in Settings > Secrets (or your deployment environment variables).',
    };
  }

  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message:
        'Vayu AI has temporarily reached its Gemini API rate limit. Please wait a few seconds and try again.',
    };
  }

  if (lower.includes('404') || lower.includes('not_found')) {
    return {
      status: 502,
      message:
        'The configured AI model is temporarily unavailable on this endpoint. Please try again shortly.',
    };
  }

  if (isTransientGeminiError(err)) {
    return {
      status: 503,
      message:
        'Gemini AI servers are experiencing a brief spike in demand. Please tap Retry in a moment — your deterministic safety rules above remain active.',
    };
  }

  return {
    status: 502,
    message:
      'Vayu AI could not complete that request right now. Please tap Retry in a moment.',
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms waiting for ${label}`));
    }, timeoutMs);
    promise.then(
      (val) => {
        if (timer) clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        if (timer) clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GenerateChatReplyResult {
  text: string;
  modelUsed: string;
}

export async function generateChatReplyWithFailover(
  ai: GoogleGenAI,
  params: {
    prompt: string;
    systemInstruction: string;
  },
  attempts: readonly GeminiModelAttempt[] = VAYU_MODEL_FALLBACK_CHAIN
): Promise<GenerateChatReplyResult> {
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (i > 0) {
      // Short exponential backoff between failover/retry attempts
      await delay(i === 1 ? 350 : 900);
    }

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents: params.prompt,
          config: {
            systemInstruction: params.systemInstruction,
            thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
          },
        }),
        attempt.timeoutMs,
        attempt.model
      );

      const text = response.text?.trim();
      if (text) {
        return { text, modelUsed: attempt.model };
      }
      lastError = new Error(`Empty response returned by ${attempt.model}`);
    } catch (err) {
      lastError = err;
      console.warn(
        `[Vayu Pulse AI] Attempt ${i + 1}/${attempts.length} (${attempt.model}) failed:`,
        extractErrorMessage(err)
      );
      // Do not retry non-transient auth/invalid-request errors across models
      if (!isTransientGeminiError(err)) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error('All Gemini model attempts failed');
}
