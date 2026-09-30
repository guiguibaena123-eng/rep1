-- Fase 7: métricas próprias (tabela events), sem serviços de terceiros.
-- Nunca guarda texto do usuário: só o nome do evento e alguns dados simples (props).
-- RLS: o app só INSERE eventos da própria conta e não lê nada. Quem lê é você, no painel (SQL Editor).
--
-- A maioria dos eventos é gravada pelo próprio banco (gatilhos abaixo), porque é mais confiável
-- do que depender do app. O app grava só os cliques que o banco não enxerga (lista em "client_events").

create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name in (
    'signup_completed', 'onboarding_completed',
    'interview_started', 'interview_completed', 'interview_abandoned',
    'linkedin_analyzed', 'tip_read',
    'paywall_viewed', 'premium_cta_clicked', 'pix_copied', 'whatsapp_opened', 'reminder_enabled'
  )),
  -- Só um objeto pequeno (ex.: {"from": "treinar"}). Limite de tamanho evita abuso.
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 1024)
);

create index events_name_created on public.events (name, created_at);
create index events_user_created on public.events (user_id, created_at);

alter table public.events enable row level security;

-- O app só pode inserir, na própria conta, os eventos de clique.
create policy "events: inserir os próprios cliques"
  on public.events for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and name in ('paywall_viewed', 'premium_cta_clicked', 'pix_copied', 'whatsapp_opened', 'reminder_enabled')
  );

-- Sem política de SELECT: ninguém lê pelo app. user_id vem do padrão auth.uid() (não dá para forjar).
revoke all on public.events from anon, authenticated;
grant insert (name, props) on public.events to authenticated;

-- ---------- Gatilhos: eventos gravados pelo banco ----------
-- Se gravar a métrica falhar por qualquer motivo, a ação principal continua normalmente.
create function public.log_event(p_user uuid, p_name text, p_props jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.events (user_id, name, props) values (p_user, p_name, coalesce(p_props, '{}'::jsonb));
exception when others then
  null;
end;
$$;

revoke all on function public.log_event(uuid, text, jsonb) from public, anon, authenticated;

-- Conta criada (a linha do perfil nasce no cadastro) e onboarding concluído.
create function public.events_from_profiles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_event(new.id, 'signup_completed');
  elsif new.onboarding_done and not old.onboarding_done then
    perform public.log_event(new.id, 'onboarding_completed', jsonb_build_object('goal', new.goal, 'area', new.area));
  end if;
  return new;
end;
$$;

create trigger events_profiles
  after insert or update of onboarding_done on public.profiles
  for each row execute function public.events_from_profiles();

-- Simulação começou, terminou ou foi abandonada.
create function public.events_from_interviews()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_event(new.user_id, 'interview_started',
      jsonb_build_object('area', new.area, 'level', new.level, 'num_questions', new.num_questions));
  elsif new.status is distinct from old.status then
    if new.status = 'completed' then
      perform public.log_event(new.user_id, 'interview_completed', jsonb_build_object('score', new.overall_score));
    elsif new.status = 'abandoned' then
      perform public.log_event(new.user_id, 'interview_abandoned');
    end if;
  end if;
  return new;
end;
$$;

create trigger events_interviews
  after insert or update of status on public.interview_sessions
  for each row execute function public.events_from_interviews();

-- Relatório do LinkedIn gerado.
create function public.events_from_linkedin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.log_event(new.user_id, 'linkedin_analyzed',
    jsonb_build_object('source', new.source, 'is_full', new.is_full, 'score', new.overall_score));
  return new;
end;
$$;

create trigger events_linkedin
  after insert on public.linkedin_reports
  for each row execute function public.events_from_linkedin();

-- Dica marcada como lida (só na primeira vez).
create function public.events_from_tip_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.read_at is not null and (tg_op = 'INSERT' or old.read_at is null) then
    perform public.log_event(new.user_id, 'tip_read', jsonb_build_object('tip_id', new.tip_id));
  end if;
  return new;
end;
$$;

create trigger events_tip_progress
  after insert or update of read_at on public.tip_progress
  for each row execute function public.events_from_tip_progress();

revoke all on function public.events_from_profiles() from public, anon, authenticated;
revoke all on function public.events_from_interviews() from public, anon, authenticated;
revoke all on function public.events_from_linkedin() from public, anon, authenticated;
revoke all on function public.events_from_tip_progress() from public, anon, authenticated;
