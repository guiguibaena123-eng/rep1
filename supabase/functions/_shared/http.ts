// Respostas padronizadas de todas as Edge Functions:
// { ok: true, data } ou { ok: false, error: { code, message } } — message em português amigável.

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_INPUT'
  | 'LIMIT_REACHED'
  | 'PREMIUM_REQUIRED'
  | 'LLM_FAILED'
  | 'PDF_UNREADABLE'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  INVALID_INPUT: 400,
  LIMIT_REACHED: 429,
  PREMIUM_REQUIRED: 403,
  LLM_FAILED: 502,
  PDF_UNREADABLE: 422,
  INTERNAL: 500,
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-lang',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function ok<T>(data: T): Response {
  return Response.json({ ok: true, data }, { headers: corsHeaders });
}

export function fail(code: ErrorCode, message: string, extra?: Record<string, unknown>): Response {
  return Response.json(
    { ok: false, error: { code, message, ...extra } },
    { status: STATUS[code], headers: corsHeaders },
  );
}

/** Erro que pode ser lançado em qualquer ponto e vira uma resposta { ok: false }. */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

/**
 * Envolve o handler: responde CORS, converte AppError em resposta e
 * registra só o código do erro (NUNCA textos do usuário).
 */
export function handler(name: string, fn: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    try {
      return await fn(req);
    } catch (err) {
      if (err instanceof AppError) {
        console.log(JSON.stringify({ fn: name, error: err.code }));
        return fail(err.code, err.message, err.extra);
      }
      console.error(JSON.stringify({ fn: name, error: 'INTERNAL', type: (err as Error)?.name }));
      return fail('INTERNAL', 'Algo deu errado do nosso lado. Tente de novo em alguns segundos.');
    }
  };
}
