// Teste de ponta a ponta "usuário A × usuário B", pela internet, igual ao app:
// login real, banco (REST), arquivos (Storage) e funções do servidor (Edge Functions).
// Quem roda: e2e_ab_test.ps1 (cria as contas de teste antes e apaga depois).
// Entrada (variáveis de ambiente): SUPABASE_URL, ANON_KEY, A_EMAIL, B_EMAIL, TEST_PASSWORD, A_SESSION, A_SUBSCRIPTION.

const { SUPABASE_URL: URL_, ANON_KEY, A_EMAIL, B_EMAIL, TEST_PASSWORD, A_SESSION, A_SUBSCRIPTION } = process.env;
if (!URL_ || !ANON_KEY || !A_EMAIL || !B_EMAIL || !TEST_PASSWORD) {
  console.error('Faltam variáveis de ambiente.');
  process.exit(2);
}

const results = [];
const check = (name, passed, detail = '') => {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'OK   ' : 'FALHA'} ${name}${detail && !passed ? ` (${detail})` : ''}`);
};

async function call(path, { token, method = 'GET', body, headers = {}, raw } = {}) {
  const res = await fetch(`${URL_}${path}`, {
    method,
    headers: {
      apikey: ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !raw ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // resposta que não é JSON (ex.: arquivo)
  }
  return { status: res.status, json, text };
}

async function login(email) {
  const r = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password: TEST_PASSWORD } });
  if (!r.json?.access_token) throw new Error(`Login de ${email} falhou: ${r.status} ${r.text.slice(0, 200)}`);
  return { token: r.json.access_token, id: r.json.user.id };
}

// Um JPEG mínimo válido (1×1 pixel) para a foto de teste.
const JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  ),
  (c) => c.charCodeAt(0),
);

const A = await login(A_EMAIL);
const B = await login(B_EMAIL);
check('A e B entram nas próprias contas', !!A.token && !!B.token && A.id !== B.id);

// ---------- A prepara os próprios dados ----------
const photo = `${A.id}/avatar-${Date.now()}.jpg`;
let r = await call(`/storage/v1/object/avatars/${photo}`, {
  token: A.token,
  method: 'POST',
  raw: JPEG,
  headers: { 'Content-Type': 'image/jpeg' },
});
check('A envia a própria foto', r.status === 200, `${r.status} ${r.text.slice(0, 120)}`);
r = await call(`/rest/v1/profiles?id=eq.${A.id}`, {
  token: A.token,
  method: 'PATCH',
  body: { name: 'Pessoa A', bio: 'Bio secreta de A', photo_path: photo },
  headers: { Prefer: 'return=representation' },
});
check('A salva o próprio perfil', r.status === 200 && r.json?.length === 1, `${r.status} ${r.text.slice(0, 120)}`);

// ---------- B tenta LER os dados de A ----------
for (const [table, filter] of [
  ['profiles', `id=eq.${A.id}`],
  ['interview_sessions', `user_id=eq.${A.id}`],
  ['interview_sessions', `id=eq.${A_SESSION}`],
  ['interview_answers', `user_id=eq.${A.id}`],
  ['linkedin_reports', `user_id=eq.${A.id}`],
  ['subscriptions', `id=eq.${A_SUBSCRIPTION}`],
  ['payments', `user_id=eq.${A.id}`],
  ['usage_counters', `user_id=eq.${A.id}`],
  ['user_stats', `user_id=eq.${A.id}`],
]) {
  r = await call(`/rest/v1/${table}?${filter}&select=*`, { token: B.token });
  check(`B não lê ${table} de A (${filter.split('=')[0]})`, r.status === 200 && Array.isArray(r.json) && r.json.length === 0, `${r.status} ${r.text.slice(0, 120)}`);
}
r = await call('/rest/v1/events?select=*', { token: B.token });
check('B não lê as métricas (events)', r.status === 401 || r.status === 403 || (Array.isArray(r.json) && r.json.length === 0), `${r.status}`);

// ---------- B tenta ALTERAR / APAGAR os dados de A ----------
r = await call(`/rest/v1/profiles?id=eq.${A.id}`, {
  token: B.token,
  method: 'PATCH',
  body: { bio: 'hackeado' },
  headers: { Prefer: 'return=representation' },
});
check('B não altera o perfil de A', Array.isArray(r.json) ? r.json.length === 0 : r.status >= 400, `${r.status} ${r.text.slice(0, 120)}`);
r = await call(`/rest/v1/interview_sessions?id=eq.${A_SESSION}`, {
  token: B.token,
  method: 'PATCH',
  body: { status: 'abandoned' },
  headers: { Prefer: 'return=representation' },
});
check('B não abandona a simulação de A', Array.isArray(r.json) ? r.json.length === 0 : r.status >= 400, `${r.status}`);
r = await call(`/rest/v1/profiles?id=eq.${A.id}`, { token: B.token, method: 'DELETE' });
check('B não apaga o perfil de A', r.status >= 400, `${r.status}`);
r = await call(`/rest/v1/profiles?id=eq.${B.id}`, { token: B.token, method: 'PATCH', body: { plan: 'premium' } });
check('B não vira Premium sozinho', r.status >= 400, `${r.status}`);
r = await call(`/rest/v1/profiles?id=eq.${B.id}`, { token: B.token, method: 'PATCH', body: { photo_path: photo } });
check('B não aponta a própria foto para o arquivo de A', r.status >= 400, `${r.status}`);
r = await call('/rest/v1/rpc/increment_usage', {
  token: B.token,
  method: 'POST',
  body: { p_user: B.id, p_kind: 'interview', p_period: '2026-01-01' },
});
check('B não chama função interna (increment_usage)', r.status >= 400, `${r.status}`);
r = await call('/rest/v1/rpc/release_usage', {
  token: B.token,
  method: 'POST',
  body: { p_user: B.id, p_kind: 'interview', p_period: '2026-01-01' },
});
check('B não devolve vaga do limite sozinho (release_usage)', r.status >= 400, `${r.status}`);

// ---------- B tenta os ARQUIVOS de A ----------
r = await call(`/storage/v1/object/authenticated/avatars/${photo}`, { token: B.token });
check('B não baixa a foto de A', r.status >= 400, `${r.status}`);
r = await call(`/storage/v1/object/sign/avatars/${photo}`, { token: B.token, method: 'POST', body: { expiresIn: 60 } });
check('B não gera link da foto de A', r.status >= 400 || !r.json?.signedURL, `${r.status}`);
r = await call('/storage/v1/object/list/avatars', { token: B.token, method: 'POST', body: { prefix: `${A.id}/`, limit: 100 } });
check('B não lista a pasta de A', Array.isArray(r.json) ? r.json.length === 0 : r.status >= 400, `${r.status} ${r.text.slice(0, 120)}`);
r = await call(`/storage/v1/object/avatars/${A.id}/avatar-1.jpg`, {
  token: B.token,
  method: 'POST',
  raw: JPEG,
  headers: { 'Content-Type': 'image/jpeg' },
});
check('B não envia arquivo para a pasta de A', r.status >= 400, `${r.status}`);
r = await call(`/storage/v1/object/avatars/${photo}`, {
  token: B.token,
  method: 'PUT',
  raw: JPEG,
  headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
});
check('B não substitui a foto de A', r.status >= 400, `${r.status}`);
r = await call('/storage/v1/object/avatars', { token: B.token, method: 'DELETE', body: { prefixes: [photo] } });
r = await call(`/storage/v1/object/authenticated/avatars/${photo}`, { token: A.token });
check('B não apaga a foto de A (A ainda baixa a própria foto)', r.status === 200, `${r.status}`);

// ---------- B tenta as FUNÇÕES DO SERVIDOR com os ids de A ----------
r = await call('/functions/v1/submit-interview', {
  token: B.token,
  method: 'POST',
  body: { session_id: A_SESSION, answers: [{ question_id: 'q1', answer_text: 'resposta do invasor com mais de vinte letras' }] },
});
check('B não envia respostas na simulação de A', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT', `${r.status} ${r.text.slice(0, 160)}`);
r = await call('/functions/v1/check-subscription', { token: B.token, method: 'POST', body: { subscription_id: A_SUBSCRIPTION } });
check('B não consulta a assinatura de A', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT', `${r.status} ${r.text.slice(0, 160)}`);
r = await call('/functions/v1/cancel-subscription', { token: B.token, method: 'POST', body: {} });
check('B não cancela a assinatura de A', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT', `${r.status} ${r.text.slice(0, 160)}`);
r = await call('/functions/v1/analyze-linkedin', {
  token: B.token,
  method: 'POST',
  body: { source: 'pdf', storage_path: `${A.id}/11111111-1111-4111-8111-111111111111.pdf` },
});
check('B não manda analisar um PDF da pasta de A', r.status === 400 && r.json?.error?.code === 'INVALID_INPUT', `${r.status} ${r.text.slice(0, 160)}`);

// ---------- Sem login ----------
r = await call(`/rest/v1/profiles?select=*`);
check('Sem login não lê perfis', r.status >= 400 || (Array.isArray(r.json) && r.json.length === 0), `${r.status}`);
r = await call('/functions/v1/start-interview', { method: 'POST', body: { area: 'vendas', level: 'junior', num_questions: 3 } });
check('Sem login não usa as funções do servidor', r.status === 401, `${r.status}`);
r = await call('/functions/v1/start-interview', {
  method: 'POST',
  body: { area: 'vendas', level: 'junior', num_questions: 3 },
  headers: { Authorization: `Bearer ${ANON_KEY}` },
});
check('Chave pública sozinha não usa as funções', r.status === 401, `${r.status} ${r.text.slice(0, 120)}`);
r = await call('/functions/v1/stripe-webhook', { method: 'POST', body: { type: 'invoice.paid', data: { object: { id: 'in_falso' } } } });
check('Aviso de pagamento falso é recusado', r.status === 400, `${r.status}`);

// ---------- A continua vendo os próprios dados intactos ----------
r = await call(`/rest/v1/profiles?id=eq.${A.id}&select=name,bio`, { token: A.token });
check('Perfil de A continua intacto', r.json?.[0]?.bio === 'Bio secreta de A', `${r.text.slice(0, 120)}`);

// Limpeza do arquivo (o banco não deixa apagar arquivo por SQL).
await call('/storage/v1/object/avatars', { token: A.token, method: 'DELETE', body: { prefixes: [photo] } });

const failed = results.filter((x) => !x.passed);
console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} verificações OK`);
process.exit(failed.length ? 1 : 0);
