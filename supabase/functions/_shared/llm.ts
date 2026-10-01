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
export class LLMError extends Error {
  constructor(
    message: string,
    /** Quando o provedor recusou por excesso de uso (429) ou ficou fora do ar (5xx): vale esperar e tentar de novo. */
    public retryable = false,
    /** Espera pedida pelo provedor (cabeçalho retry-after), em milissegundos. */
    public retryAfterMs?: number,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;
const MAX_WAIT_MS = 10_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const groq = new GroqClient(key, model);
  // Reserva opcional: se a chave do Gemini existir, ele atende quando o Groq recusar por excesso de uso.
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  return geminiKey ? new FallbackClient(groq, new GeminiClient(geminiKey, DEFAULT_MODEL.gemini)) : groq;
}

/** Usa o provedor principal; se ele estiver sobrecarregado (429/5xx), tenta o reserva na hora. */
class FallbackClient implements LLMClient {
  constructor(
    private primary: LLMClient,
    private backup: LLMClient,
  ) {}

  async generateJSON(req: LLMRequest) {
    try {
      return await this.primary.generateJSON(req);
    } catch (err) {
      if (!(err instanceof LLMError) || !err.retryable) throw err;
      console.log(JSON.stringify({ llm: 'fallback', from: 'primary' }));
      return this.backup.generateJSON(req);
    }
  }
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
    const seconds = Number(res.headers.get('retry-after'));
    throw new LLMError(
      `http ${res.status} ${provider} retry-after=${res.headers.get('retry-after') ?? 'n/a'}`,
      res.status === 429 || res.status >= 500,
      Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined,
    );
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
  let reason = 'desconhecido';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await llm.generateJSON(req);
      const result = validate(raw);
      if (result) return result;
      reason = `formato_invalido {${describeShape(raw)}}`;
      console.log(JSON.stringify({ llm: 'validate', error: 'invalid_shape', attempt, shape: describeShape(raw) }));
    } catch (err) {
      if (!(err instanceof LLMError)) throw err;
      reason = err.message;
      // Provedor sobrecarregado (várias pessoas ao mesmo tempo): espera um pouco, com variação
      // aleatória para os pedidos não voltarem todos no mesmo instante.
      if (err.retryable && attempt < MAX_ATTEMPTS) {
        const wait = Math.min(err.retryAfterMs ?? 1500 * 2 ** (attempt - 1), MAX_WAIT_MS) + Math.random() * 500;
        console.log(JSON.stringify({ llm: 'retry', attempt, wait_ms: Math.round(wait) }));
        await sleep(wait);
      }
    }
  }
  // O motivo não tem texto do usuário nem da IA: só o tipo da falha (ajuda a achar o problema).
  throw new AppError('LLM_FAILED', failMessage, { reason });
}

/** Resume o formato do JSON recebido (chaves, tamanhos de lista), sem copiar nenhum texto. Só para diagnóstico. */
function describeShape(raw: unknown, depth = 0): string {
  if (Array.isArray(raw)) {
    // Para listas de objetos, mostra as chaves do primeiro item (é onde costuma estar a diferença).
    const first = raw[0];
    return `[${raw.length}${first && typeof first === 'object' && depth < 2 ? ` de {${describeShape(first, depth + 1)}}` : ''}]`;
  }
  if (!raw || typeof raw !== 'object') return typeof raw;
  return Object.entries(raw as Record<string, unknown>)
    .slice(0, 15)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:${describeShape(v, depth)}`;
      if (v === '' || v === null) return `${k}:vazio`;
      // Textos curtos (como notas "45/100") aparecem inteiros; os longos viram só "string".
      return `${k}:${typeof v === 'string' && v.length <= 12 ? JSON.stringify(v) : typeof v}`;
    })
    .join(',');
}
