-- Configurações internas do servidor (ex.: segredo do webhook da Stripe, criado automaticamente).
-- Ninguém do app lê nem grava: só as Edge Functions, com a chave de serviço (que ignora o RLS).

create table public.app_settings (
  key text primary key,
  -- null = alguém está criando agora (evita criar dois webhooks ao mesmo tempo).
  value text,
  created_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
-- Sem nenhuma policy: com RLS ligado, anon e authenticated não veem nada.
revoke all on public.app_settings from anon, authenticated;
