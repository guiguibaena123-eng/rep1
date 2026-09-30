-- Fase 4: progresso.
-- A tabela daily_activity já existe (Fase 3). Aqui entra a view user_stats:
-- total de simulações concluídas, nota média, melhor nota, sequência atual e maior sequência.
--
-- security_invoker = true: a view roda com as permissões de quem consulta,
-- então a RLS das tabelas vale e cada pessoa só vê a própria linha.
--
-- A mesma regra de sequência existe no app (src/features/progress/logic.ts, com testes).
-- Se mudar uma, mude a outra.

create view public.user_stats
with (security_invoker = true)
as
with days as (
  -- Dias seguidos têm a mesma "data - posição": isso agrupa cada sequência.
  select
    user_id,
    activity_date,
    activity_date - (row_number() over (partition by user_id order by activity_date))::int as grp
  from public.daily_activity
),
runs as (
  select user_id, max(activity_date) as end_date, count(*)::int as len
  from days
  group by user_id, grp
),
today as (
  select (now() at time zone 'America/Sao_Paulo')::date as d
),
streaks as (
  -- A sequência atual continua valendo se terminou hoje ou ontem (dá tempo de treinar hoje).
  select
    user_id,
    max(len) as longest_streak,
    coalesce(max(len) filter (where end_date >= (select d from today) - 1), 0) as current_streak
  from runs
  group by user_id
),
sessions as (
  select
    user_id,
    count(*)::int as total_completed,
    round(avg(overall_score))::int as average_score,
    max(overall_score) as best_score
  from public.interview_sessions
  where status = 'completed'
  group by user_id
),
users as (
  select user_id from sessions
  union
  select user_id from streaks
)
select
  u.user_id,
  coalesce(s.total_completed, 0) as total_completed,
  s.average_score,
  s.best_score,
  coalesce(st.current_streak, 0) as current_streak,
  coalesce(st.longest_streak, 0) as longest_streak
from users u
left join sessions s using (user_id)
left join streaks st using (user_id);

revoke all on public.user_stats from anon;
grant select on public.user_stats to authenticated;
