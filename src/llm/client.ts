// =============================================================================
// DIVINE DOMINION — LLM Client
// Gemini Flash integration. Non-blocking. Always has template fallback.
// =============================================================================

import { LLM } from '../config/constants.js';

export interface LLMSchema {
  type: 'object' | 'string';
  properties?: Record<string, { type: string; description?: string }>;
  required?: string[];
}

export interface LLMCallOptions {
  prompt: string;
  schema?: LLMSchema;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LLMResult<T = string> {
  success: boolean;
  data: T | null;
  error?: string;
  usedFallback: boolean;
}

// ---------------------------------------------------------------------------
// API key storage (set externally before first call)
// ---------------------------------------------------------------------------

let _apiKey: string | null = null;

export function setLLMApiKey(key: string): void {
  _apiKey = key;
}

export function isLLMConfigured(): boolean {
  return _apiKey !== null && _apiKey.length > 0;
}

// ---------------------------------------------------------------------------
// Core LLM call
// ---------------------------------------------------------------------------

/**
 * Call Gemini Flash with a prompt and optional JSON schema.
 * Returns success=false (not a throw) on timeout, network error, or invalid response.
 * Never blocks game flow — caller must supply a fallback.
 */
export async function callLLM<T = string>(
  options: LLMCallOptions,
): Promise<LLMResult<T>> {
  if (!isLLMConfigured()) {
    return { success: false, data: null, error: 'no_api_key', usedFallback: true };
  }

  const timeoutMs = options.timeoutMs ?? LLM.TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${_apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 250,
      temperature: 0.8,
    },
  };

  if (options.schema?.type === 'object') {
    body.generationConfig = {
      ...body.generationConfig as object,
      responseMimeType: 'application/json',
    };
  }

  for (let attempt = 0; attempt <= LLM.MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt < LLM.MAX_RETRIES) continue;
        return {
          success: false,
          data: null,
          error: `http_${response.status}`,
          usedFallback: true,
        };
      }

      const json = await response.json();
      const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!text) {
        if (attempt < LLM.MAX_RETRIES) continue;
        return { success: false, data: null, error: 'empty_response', usedFallback: true };
      }

      if (options.schema?.type === 'object') {
        try {
          const parsed = JSON.parse(text) as T;
          return { success: true, data: parsed, usedFallback: false };
        } catch {
          if (attempt < LLM.MAX_RETRIES) continue;
          return { success: false, data: null, error: 'json_parse_failed', usedFallback: true };
        }
      }

      return { success: true, data: text as T, usedFallback: false };
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (attempt < LLM.MAX_RETRIES && !isAbort) continue;
      return {
        success: false,
        data: null,
        error: isAbort ? 'timeout' : 'network_error',
        usedFallback: true,
      };
    }
  }

  return { success: false, data: null, error: 'max_retries', usedFallback: true };
}
