import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';

import { getLanguage, t } from '@/i18n';

import { supabase } from './supabase';

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_INPUT'
  | 'LIMIT_REACHED'
  | 'PREMIUM_REQUIRED'
  | 'LLM_FAILED'
  | 'PDF_UNREADABLE'
  | 'INTERNAL'
  | 'NETWORK';

/** Erro tipado das Edge Functions. `message` já é amigável e pode ir direto para a tela. */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

type Envelope<T> = { ok: true; data: T } | { ok: false; error: { code: ApiErrorCode; message?: string } & Record<string, unknown> };

/**
 * Chama uma Edge Function e devolve só `data`.
 * Converte { ok: false } e falhas de rede em ApiError com mensagem do arquivo de textos.
 * NÃO repete automaticamente: ações que consomem limite nunca podem ser repetidas sozinhas.
 */
export async function callFunction<T>(name: string, body?: unknown): Promise<T> {
  // O idioma vai no cabeçalho: a IA e a página de pagamento respondem nele.
  const { data, error } = await supabase.functions.invoke<Envelope<T>>(name, {
    body: body ?? {},
    headers: { 'x-app-lang': getLanguage() },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as Envelope<T> | null;
      if (payload && payload.ok === false) throw toApiError(payload.error);
    }
    if (error instanceof FunctionsFetchError) throw new ApiError('NETWORK', t.errors.NETWORK);
    throw new ApiError('INTERNAL', t.errors.INTERNAL);
  }
  if (!data) throw new ApiError('INTERNAL', t.errors.INTERNAL);
  if (data.ok === false) throw toApiError(data.error);
  return data.data;
}

function toApiError(err: { code: ApiErrorCode; message?: string } & Record<string, unknown>) {
  const { code, message, ...extra } = err;
  const known = code in t.errors ? code : 'INTERNAL';
  // A mensagem do servidor é amigável, mas está em português: nos outros idiomas (ou se faltar), usamos a do app.
  const useServer = !!message && getLanguage() === 'pt-BR';
  return new ApiError(known, useServer ? message : t.errors[known], extra);
}
