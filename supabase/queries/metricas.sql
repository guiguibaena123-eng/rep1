-- Métricas do Pronto. Cole no Supabase → SQL Editor → Run (só lê, não altera nada).
-- "Voltou em 7 dias" = entre quem se cadastrou há 7 dias ou mais, quem teve atividade
-- (simulação, relatório ou dica lida) em algum dos 7 dias seguintes ao dia do cadastro.
with contas as (
  select id, (created_at at time zone 'America/Sao_Paulo')::date as dia_cadastro
  from auth.users
),
fizeram_simulacao as (
  select distinct user_id from public.interview_sessions where status = 'completed'
),
elegiveis_7d as (
  select * from contas where dia_cadastro <= (now() at time zone 'America/Sao_Paulo')::date - 7
),
voltaram as (
  select c.id from elegiveis_7d c
  where exists (
    select 1 from public.daily_activity d
    where d.user_id = c.id and d.activity_date between c.dia_cadastro + 1 and c.dia_cadastro + 7
  )
)
select
  (select count(*) from contas) as usuarios_cadastrados,
  (select count(*) from public.profiles where onboarding_done) as terminaram_o_cadastro,
  round(100.0 * (select count(*) from fizeram_simulacao) / nullif((select count(*) from contas), 0), 1) as pct_fez_1a_simulacao,
  round(100.0 * (select count(*) from voltaram) / nullif((select count(*) from elegiveis_7d), 0), 1) as pct_voltou_em_7_dias,
  (select count(*) from public.events where name = 'paywall_viewed') as vezes_viram_premium,
  (select count(*) from public.events where name = 'premium_cta_clicked') as cliques_quero_o_premium,
  (select count(distinct user_id) from public.events where name = 'premium_cta_clicked') as pessoas_que_clicaram,
  (select count(*) from public.events where name = 'subscription_started') as assinaturas_iniciadas,
  (select count(*) from public.subscriptions where status = 'authorized') as assinaturas_ativas,
  (select count(*) from public.events where name = 'subscription_cancelled') as cancelamentos,
  (select count(*) from public.payments where premium_granted) as cobrancas_aprovadas,
  (select coalesce(sum(amount), 0) from public.payments where premium_granted and status = 'approved') as receita_bruta_reais,
  (select count(*) from public.payments where status in ('refunded', 'charged_back')) as estornos,
  (select count(*) from public.profiles where plan = 'premium' and (premium_until is null or premium_until > now())) as premium_ativos;
