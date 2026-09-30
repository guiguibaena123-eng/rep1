import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

import { AppError } from './http.ts';

/** Cliente com a chave de serviço: ignora RLS. Use só no servidor e com cuidado. */
export function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new AppError('INTERNAL', 'Servidor sem configuração.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Lê o token do cabeçalho Authorization e devolve o usuário logado (ou UNAUTHENTICATED). */
export async function requireUser(req: Request, admin: SupabaseClient): Promise<User> {
  const header = req.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new AppError('UNAUTHENTICATED', 'Entre na sua conta para continuar.');

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHENTICATED', 'Sua sessão expirou. Entre de novo.');
  return data.user;
}
