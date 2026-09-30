// Cliente da IA com provedor trocável pela variável LLM_PROVIDER ("groq" ou "gemini").
// O modelo vem de LLM_MODEL; sem ela, usamos o padrão de cada provedor.
// NUNCA registre em log o texto enviado nem a resposta: só o provedor e o tipo de falha.

import { AppError } from './http.ts';

export type LLMRequest = { system: string; user: string; temperature?: number };

export interface LLMClient {
  /** Pede um JSON e devolve o objeto já convertido (ou lança LLMError). */
  generateJSON(req: LLMRequest): Promise<unknown>;
}

/** Falha da IA (rede, limite do provedor, JSON quebrado). Quem chama decide se tenta de novo. */
export class LLMError extends Error {}

const TIMEOUT_MS = 45_000;

// Modelos com plano gratuito (conferidos na documentação oficial em 2026-09).
// Se o provedor trocar o nome, basta definir LLM_MODEL nos Secrets, sem mudar código.
const DEFAULT_MODEL = {
  groq: 'openai/gpt-oss-120b',
  gemini: 'gemini-3.5-flash',
} as const;

type Provider = keyof typeof DEFAULT_MODEL;

export function createLLMClient(): LLMClient {
  const provider = (Deno.env.get('LLM_PROVIDER') || 'groq').toLowerCase() as Provider;
  if (!(provider in DEFAULT_MODEL)) throw new AppError('INTERNAL', 'Servidor sem configuração.');
  const model = Deno.env.get('LLM_MODEL') || DEFAULT_MODEL[provider];

  if (provider === 'gemini') {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key) throw new AppError('INTERNAL', 'Servidor sem configuração.');
    return new GeminiClient(key, model);
  }
  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) throw new AppError('INTERNAL', 'Servidor sem configuração.');
  return new GroqClient(key, model);
}

async function post(url: string, headers: Record<string, string>, body: unknown, provider: string) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = (err as Error)?.name === 'TimeoutError' ? 'timeout' : 'network';
    console.log(JSON.stringify({ llm: provider, error: reason }));
    throw new LLMError(reason);
  }
  if (!res.ok) {
    console.log(JSON.stringify({ llm: provider, error: 'http', status: res.status }));
    await res.body?.cancel();
    throw new LLMError(`http ${res.status}`);
  }
  return res.json();
}

function parseJSON(text: unknown, provider: string): unknown {
  if (typeof text !== 'string' || !text.trim()) throw new LLMError('empty');
  // Alguns modelos embrulham o JSON em ```json ... ```: tiramos isso antes de converter.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    console.log(JSON.stringify({ llm: provider, error: 'bad_json' }));
    throw new LLMError('bad_json');
  }
}

/** Groq: API compatível com a da OpenAI, com modo JSON. */
class GroqClient implements LLMClient {
  constructor(
    private key: string,
    private model: string,
  ) {}

  async generateJSON({ system, user, temperature = 0.4 }: LLMRequest) {
    const body: Record<string, unknown> = {
      model: this.model,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    };
    // Modelos gpt-oss "pensam" antes de responder; pouco raciocínio basta e deixa mais rápido.
    if (this.model.startsWith('openai/gpt-oss')) body.reasoning_effort = 'low';

    const data = await post('https://api.groq.com/openai/v1/chat/completions', { Authorization: `Bearer ${this.key}` }, body, 'groq');
    return parseJSON(data?.choices?.[0]?.message?.content, 'groq');
  }
}

/** Google Gemini: generateContent com resposta em JSON. */
class GeminiClient implements LLMClient {
  constructor(
    private key: string,
    private model: string,
  ) {}

  async generateJSON({ system, user, temperature = 0.4 }: LLMRequest) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature, responseMimeType: 'application/json' },
    };
    const data = await post(url, { 'x-goog-api-key': this.key }, body, 'gemini');
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
    return parseJSON(text, 'gemini');
  }
}

/**
 * Chama a IA e valida o resultado. Se a resposta não servir, tenta mais 1 vez.
 * Depois disso, LLM_FAILED com a mensagem amigável recebida.
 */
export async function generateValidated<T>(
  llm: LLMClient,
  req: LLMRequest,
  validate: (raw: unknown) => T | null,
  failMessage: string,
): Promise<T> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = validate(await llm.generateJSON(req));
      if (result) return result;
      console.log(JSON.stringify({ llm: 'validate', error: 'invalid_shape', attempt }));
    } catch (err) {
      if (!(err instanceof LLMError)) throw err;
    }
  }
  throw new AppError('LLM_FAILED', failMessage);
}
