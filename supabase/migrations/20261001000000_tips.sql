-- Fase 6: dicas.
-- Trilhas (tracks), dicas (tips) e o progresso de cada pessoa nas dicas (tip_progress).
-- As 12 dicas iniciais ficam na migration seguinte (…_tips_seed.sql).
--
-- Regras:
-- - Qualquer pessoa logada vê a LISTA de dicas (título, categoria, se é Premium…).
-- - O TEXTO (coluna body) de uma dica Premium só sai do banco para quem é Premium:
--   o app lê o texto pela função tip_body(), que confere o plano. Assim o bloqueio
--   não depende do app.
-- - O app não grava direto em tip_progress nem em daily_activity: usa as funções
--   mark_tip_read, set_tip_favorite e set_tip_helpful (conferem tudo no banco).

-- ---------- Trilhas ----------
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  description text not null,
  -- "order" é palavra reservada no SQL: por isso sort_order.
  sort_order int not null
);

alter table public.tracks enable row level security;

create policy "tracks: logados leem"
  on public.tracks for select
  to authenticated
  using (true);

revoke all on public.tracks from anon;
revoke insert, update, delete on public.tracks from authenticated;
grant select on public.tracks to authenticated;

-- ---------- Dicas ----------
create table public.tips (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('curriculo', 'entrevista', 'linkedin', 'primeiro_emprego', 'direitos', 'salario')),
  read_minutes int not null check (read_minutes between 1 and 30),
  is_premium bool not null default true,
  -- Lista de blocos: p, h, list (com "ordered" opcional), example, warning. Ver src/features/tips/types.ts.
  body jsonb not null check (jsonb_typeof(body) = 'array'),
  track_id uuid references public.tracks (id) on delete set null,
  track_order int,
  published bool not null default true
);

create index tips_track on public.tips (track_id, track_order);

alter table public.tips enable row level security;

create policy "tips: logados leem as publicadas"
  on public.tips for select
  to authenticated
  using (published);

revoke all on public.tips from anon;
revoke all on public.tips from authenticated;
-- Todas as colunas MENOS body. O texto sai só pela função tip_body().
grant select (id, created_at, slug, title, category, read_minutes, is_premium, track_id, track_order, published)
  on public.tips to authenticated;

-- ---------- Progresso nas dicas ----------
create table public.tip_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tip_id uuid not null references public.tips (id) on delete cascade,
  read_at timestamptz,
  favorited bool not null default false,
  helpful bool,
  unique (user_id, tip_id)
);

alter table public.tip_progress enable row level security;

create policy "tip_progress: ler o próprio"
  on public.tip_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.tip_progress from anon;
revoke insert, update, delete on public.tip_progress from authenticated;
grant select on public.tip_progress to authenticated;

-- ---------- Funções ----------

-- A pessoa logada é Premium agora? (mesma regra das Edge Functions)
create function public.is_premium_now()
returns bool
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select plan = 'premium' and (premium_until is null or premium_until > now())
    from public.profiles
    where id = (select auth.uid())
  ), false);
$$;

revoke all on function public.is_premium_now() from public, anon;
grant execute on function public.is_premium_now() to authenticated;

-- A pessoa logada pode ler esta dica? (publicada e gratuita, ou a pessoa é Premium)
create function public.can_read_tip(p_tip uuid)
returns bool
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tips
    where id = p_tip
      and published
      and (not is_premium or public.is_premium_now())
  );
$$;

revoke all on function public.can_read_tip(uuid) from public, anon;
grant execute on function public.can_read_tip(uuid) to authenticated;

-- Texto da dica (T14). Devolve null se a dica for Premium e a pessoa não for.
create function public.tip_body(p_tip uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select body from public.tips
  where id = p_tip and public.can_read_tip(p_tip);
$$;

revoke all on function public.tip_body(uuid) from public, anon;
grant execute on function public.tip_body(uuid) to authenticated;

-- "Marcar como lida": grava read_at (só na primeira vez) e marca o dia como ativo (sequência).
create function public.mark_tip_read(p_tip uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_read timestamptz;
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED' using errcode = '28000';
  end if;
  if not public.can_read_tip(p_tip) then
    raise exception 'PREMIUM_REQUIRED' using errcode = '42501';
  end if;

  insert into public.tip_progress (user_id, tip_id, read_at)
  values (v_user, p_tip, now())
  on conflict (user_id, tip_id)
  do update set read_at = coalesce(public.tip_progress.read_at, excluded.read_at)
  returning read_at into v_read;

  insert into public.daily_activity (user_id, activity_date)
  values (v_user, (now() at time zone 'America/Sao_Paulo')::date)
  on conflict (user_id, activity_date) do nothing;

  return v_read;
end;
$$;

revoke all on function public.mark_tip_read(uuid) from public, anon;
grant execute on function public.mark_tip_read(uuid) to authenticated;

-- Favoritar / desfavoritar (vale também para dicas Premium: dá para guardar e ler depois).
create function public.set_tip_favorite(p_tip uuid, p_on bool)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED' using errcode = '28000';
  end if;
  if not exists (select 1 from public.tips where id = p_tip and published) then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;

  insert into public.tip_progress (user_id, tip_id, favorited)
  values (v_user, p_tip, coalesce(p_on, false))
  on conflict (user_id, tip_id)
  do update set favorited = excluded.favorited;
end;
$$;

revoke all on function public.set_tip_favorite(uuid, bool) from public, anon;
grant execute on function public.set_tip_favorite(uuid, bool) to authenticated;

-- 👍 (true), 👎 (false) ou tirar o voto (null). Só para dicas que a pessoa pode ler.
create function public.set_tip_helpful(p_tip uuid, p_helpful bool)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED' using errcode = '28000';
  end if;
  if not public.can_read_tip(p_tip) then
    raise exception 'PREMIUM_REQUIRED' using errcode = '42501';
  end if;

  insert into public.tip_progress (user_id, tip_id, helpful)
  values (v_user, p_tip, p_helpful)
  on conflict (user_id, tip_id)
  do update set helpful = excluded.helpful;
end;
$$;

revoke all on function public.set_tip_helpful(uuid, bool) from public, anon;
grant execute on function public.set_tip_helpful(uuid, bool) to authenticated;
