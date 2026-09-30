-- Fase 3: simulador de entrevista.
-- Sessões, respostas, feedback, contadores de uso, atividade diária e controle de chamadas.
-- RLS: cada pessoa só LÊ as próprias linhas. Quem grava são as Edge Functions (service role).
-- Única escrita do app: marcar a própria sessão em andamento como abandonada ("Sair sem salvar").

-- ---------- Sessões ----------
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  area text not null check (area in ('atendimento', 'vendas', 'administrativo', 'tecnologia', 'marketing', 'logistica', 'saude', 'outra')),
  level text not null check (level in ('jovem_aprendiz', 'estagio', 'primeiro_emprego', 'junior')),
  num_questions int not null check (num_questions in (3, 5, 8)),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  questions jsonb not null,
  overall_score int check (overall_score between 0 and 100),
  completed_at timestamptz
);

create index interview_sessions_user_created on public.interview_sessions (user_id, created_at desc);

alter table public.interview_sessions enable row level security;

create policy "interview_sessions: ler as próprias"
  on public.interview_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Só permite: sessão própria em andamento → abandonada.
create policy "interview_sessions: abandonar a própria"
  on public.interview_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id and status = 'in_progress')
  with check ((select auth.uid()) = user_id and status = 'abandoned');

revoke all on public.interview_sessions from anon;
revoke insert, update, delete on public.interview_sessions from authenticated;
grant select on public.interview_sessions to authenticated;
grant update (status) on public.interview_sessions to authenticated;

-- ---------- Respostas ----------
create table public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  answer_text text not null check (char_length(answer_text) between 1 and 2000),
  unique (session_id, question_id)
);

create index interview_answers_user on public.interview_answers (user_id);

alter table public.interview_answers enable row level security;

create policy "interview_answers: ler as próprias"
  on public.interview_answers for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.interview_answers from anon;
revoke insert, update, delete on public.interview_answers from authenticated;
grant select on public.interview_answers to authenticated;

-- ---------- Feedback (1 por sessão) ----------
create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null unique references public.interview_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  report jsonb not null,
  overall_score int not null check (overall_score between 0 and 100)
);

create index interview_feedback_user on public.interview_feedback (user_id);

alter table public.interview_feedback enable row level security;

create policy "interview_feedback: ler os próprios"
  on public.interview_feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.interview_feedback from anon;
revoke insert, update, delete on public.interview_feedback from authenticated;
grant select on public.interview_feedback to authenticated;

-- ---------- Contadores de uso (escrita só pelas Edge Functions) ----------
create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('interview', 'linkedin_full', 'linkedin_summary')),
  period_start date not null,
  count int not null default 0,
  unique (user_id, kind, period_start)
);

alter table public.usage_counters enable row level security;

create policy "usage_counters: ler os próprios"
  on public.usage_counters for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.usage_counters from anon;
revoke insert, update, delete on public.usage_counters from authenticated;
grant select on public.usage_counters to authenticated;

-- ---------- Atividade diária (para a sequência de dias, Fase 4) ----------
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  unique (user_id, activity_date)
);

alter table public.daily_activity enable row level security;

create policy "daily_activity: ler a própria"
  on public.daily_activity for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.daily_activity from anon;
revoke insert, update, delete on public.daily_activity from authenticated;
grant select on public.daily_activity to authenticated;

-- ---------- Controle de chamadas (limite de 20 por hora nas Edge Functions) ----------
-- Sem políticas: só o service role lê e grava.
create table public.api_calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fn text not null
);

create index api_calls_user_created on public.api_calls (user_id, created_at desc);

alter table public.api_calls enable row level security;
revoke all on public.api_calls from anon, authenticated;

-- ---------- Funções ----------

-- Contador de simulações da semana atual, para a tela T6.
-- A semana começa na segunda-feira 00:00, fuso America/Sao_Paulo.
create function public.interview_usage()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  with week as (
    select date_trunc('week', now() at time zone 'America/Sao_Paulo') as start_local
  ),
  prof as (
    select plan = 'premium' and (premium_until is null or premium_until > now()) as premium
    from public.profiles
    where id = (select auth.uid())
  )
  select json_build_object(
    'premium', coalesce((select premium from prof), false),
    'used', coalesce((
      select count from public.usage_counters
      where user_id = (select auth.uid())
        and kind = 'interview'
        and period_start = (select start_local::date from week)
    ), 0),
    'limit', 1,
    'resets_at', (select (start_local + interval '7 days') at time zone 'America/Sao_Paulo' from week)
  );
$$;

revoke all on function public.interview_usage() from public, anon;
grant execute on function public.interview_usage() to authenticated;

-- Soma 1 no contador (cria a linha se não existir). Só as Edge Functions chamam.
create function public.increment_usage(p_user uuid, p_kind text, p_period date)
returns int
language sql
security definer
set search_path = ''
as $$
  insert into public.usage_counters (user_id, kind, period_start, count)
  values (p_user, p_kind, p_period, 1)
  on conflict (user_id, kind, period_start)
  do update set count = public.usage_counters.count + 1
  returning count;
$$;

revoke all on function public.increment_usage(uuid, text, date) from public, anon, authenticated;
grant execute on function public.increment_usage(uuid, text, date) to service_role;
