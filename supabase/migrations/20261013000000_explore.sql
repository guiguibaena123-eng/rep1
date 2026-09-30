-- Explorar (T20) e perfil de outra pessoa (T21): perfil público, seguir, bloquear e denunciar.
--
-- Regras (design/README.md › "Explorar e segurança"):
-- - Um perfil só aparece para os outros se a pessoa ligar "Aparecer no Explorar" (is_public, padrão desligado).
-- - A tabela profiles continua fechada: cada pessoa só lê o PRÓPRIO perfil. Os outros perfis só
--   chegam pelas funções abaixo, que devolvem apenas campos públicos (nunca e-mail, idade, plano,
--   notas ou respostas das simulações).
-- - Bloqueio vale nos dois sentidos: quem bloqueou e quem foi bloqueado deixam de se ver.
-- - Seguir, bloquear e denunciar só acontecem pelas funções (o app não grava direto nas tabelas).

create extension if not exists unaccent with schema extensions;

-- ---------- 1. Perfil público ----------
alter table public.profiles add column is_public boolean not null default false;
grant update (is_public) on public.profiles to authenticated;

-- ---------- 2. Tabelas ----------
create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followed_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_not_self check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

-- Denúncias para moderação (lidas só no painel do Supabase).
-- Conta apagada: a denúncia fica (o id vira null) para a moderação não perder o histórico.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporter_id uuid references auth.users (id) on delete set null,
  reported_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('perfil_falso', 'assedio', 'golpe', 'conteudo_improprio', 'outro')),
  detail text check (char_length(detail) <= 500),
  -- Como o perfil estava na hora da denúncia (a pessoa pode mudar depois).
  snapshot jsonb,
  status text not null default 'aberta' check (status in ('aberta', 'em_analise', 'resolvida', 'descartada'))
);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_reporter_idx on public.reports (reporter_id, created_at desc);

alter table public.follows enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

revoke all on public.follows, public.blocks, public.reports from anon, authenticated;
-- A pessoa lê só as próprias linhas (quem ela segue e quem ela bloqueou): usado no "Exportar meus dados".
grant select on public.follows, public.blocks to authenticated;

create policy "follows: ler quem eu sigo"
  on public.follows for select
  to authenticated
  using ((select auth.uid()) = follower_id);

create policy "blocks: ler quem eu bloqueei"
  on public.blocks for select
  to authenticated
  using ((select auth.uid()) = blocker_id);
-- reports: sem nenhuma política = ninguém lê pelo app.

-- ---------- 3. Funções de apoio ----------
-- Texto para busca: minúsculas e sem acento ("Júlia" → "julia").
create function public.search_key(p text)
returns text
language sql
stable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(p, '')));
$$;

-- Cidade para o "Perto de mim": só o nome, sem estado ("Guarulhos, SP" e "guarulhos - sp" → "guarulhos").
create function public.city_key(p text)
returns text
language sql
stable
parallel safe
set search_path = ''
as $$
  select trim(regexp_replace(public.search_key(p), '\s*(,|/|\(|\s-\s).*$', ''));
$$;

-- A pessoa logada pode ver este perfil? (público, com cadastro concluído, não é ela e sem bloqueio nos dois sentidos)
create function public.can_view_profile(p_target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_target
      and p.id <> (select auth.uid())
      and p.is_public
      and p.onboarding_done
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = (select auth.uid()) and b.blocked_id = p.id)
           or (b.blocker_id = p.id and b.blocked_id = (select auth.uid()))
      )
  );
$$;

-- Foto ou capa ATUAL de um perfil que a pessoa logada pode ver (fotos antigas continuam fechadas).
create function public.can_view_photo(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where (p.photo_path = p_name or p.cover_path = p_name)
      and public.can_view_profile(p.id)
  );
$$;

create policy "avatars: ver foto e capa de perfis públicos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and public.can_view_photo(name));

-- ---------- 4. Explorar ----------
-- Busca (nome, título, competências e área), filtros e páginas.
-- p_query_areas: áreas cujo NOME no idioma do app combina com a busca (o app calcula).
-- p_goals em OU (ex.: Estágio ou Jovem aprendiz); área, objetivos e cidade em E.
create function public.explore_profiles(
  p_query text default null,
  p_query_areas text[] default null,
  p_areas text[] default null,
  p_goals text[] default null,
  p_near boolean default false,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  name text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_q text := nullif(trim(public.search_key(left(p_query, 60))), '');
  v_city text;
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if p_near then
    select nullif(public.city_key(me.city), '') into v_city from public.profiles me where me.id = v_me;
    -- Sem cidade no próprio perfil não dá para saber o que é "perto": lista vazia.
    if v_city is null then
      return;
    end if;
  end if;

  return query
  select p.id, p.name, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows f where f.follower_id = v_me and f.followed_id = p.id)
  from public.profiles p
  where public.can_view_profile(p.id)
    and (coalesce(cardinality(p_areas), 0) = 0 or p.area = any (p_areas))
    and (coalesce(cardinality(p_goals), 0) = 0 or p.goal = any (p_goals))
    and (v_city is null or public.city_key(p.city) = v_city)
    and (
      v_q is null
      or strpos(
        public.search_key(concat_ws(' ', p.name, p.headline,
          (select string_agg(s ->> 'name', ' ') from jsonb_array_elements(p.skills) s))),
        v_q
      ) > 0
      or p.area = any (coalesce(p_query_areas, '{}'))
    )
  order by p.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

-- "Com objetivos parecidos": mesma área e mesmo objetivo da pessoa logada (até 10).
create function public.similar_profiles(p_limit int default 10)
returns table (
  id uuid,
  name text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id)
  from public.profiles p
  join public.profiles me on me.id = (select auth.uid())
  where public.can_view_profile(p.id)
    and me.area is not null and me.goal is not null
    and p.area = me.area and p.goal = me.goal
  order by p.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 10), 1), 10);
$$;

-- Perfil de outra pessoa (T21). Nenhuma linha = "Este perfil não está disponível".
-- Sem links (LinkedIn, Instagram, portfólio) e sem idiomas: só o que a T21 mostra.
-- Conquistas: primeira simulação, maior sequência (3 ou 7 dias) e LinkedIn analisado. Nunca notas.
create function public.public_profile(p_id uuid)
returns table (
  id uuid,
  name text,
  headline text,
  city text,
  bio text,
  area text,
  goal text,
  availability text[],
  work_format text,
  skills jsonb,
  experiences jsonb,
  education jsonb,
  courses jsonb,
  photo_path text,
  cover_path text,
  cover_x int,
  cover_y int,
  followers int,
  following int,
  is_following boolean,
  first_simulation boolean,
  streak_badge int,
  linkedin_done boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, p.name, p.headline, p.city, p.bio, p.area, p.goal, p.availability, p.work_format,
    p.skills, p.experiences, p.education, p.courses, p.photo_path, p.cover_path,
    p.cover_x::int, p.cover_y::int,
    (select count(*)::int from public.follows f where f.followed_id = p.id),
    (select count(*)::int from public.follows f where f.follower_id = p.id),
    exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id),
    exists (select 1 from public.interview_sessions s where s.user_id = p.id and s.status = 'completed'),
    (
      select case when coalesce(max(r.len), 0) >= 7 then 7 when coalesce(max(r.len), 0) >= 3 then 3 else 0 end
      from (
        select count(*) as len
        from (
          select d.activity_date - (row_number() over (order by d.activity_date))::int as grp
          from public.daily_activity d
          where d.user_id = p.id
        ) g
        group by g.grp
      ) r
    ),
    exists (select 1 from public.linkedin_reports l where l.user_id = p.id)
  from public.profiles p
  where p.id = p_id and public.can_view_profile(p.id);
$$;

-- ---------- 5. Seguir, bloquear e denunciar ----------
create function public.follow_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if not public.can_view_profile(p_target) then
    raise exception 'PROFILE_UNAVAILABLE' using errcode = 'P0002';
  end if;
  -- Limite contra robôs: 300 perfis seguidos por dia.
  if (select count(*) from public.follows f where f.follower_id = v_me and f.created_at > now() - interval '1 day') >= 300 then
    raise exception 'LIMIT_REACHED' using errcode = '54000';
  end if;
  insert into public.follows (follower_id, followed_id) values (v_me, p_target)
  on conflict do nothing;
end;
$$;

-- Deixar de seguir funciona sempre (mesmo que o perfil tenha ficado privado).
create function public.unfollow_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  delete from public.follows f where f.follower_id = auth.uid() and f.followed_id = p_target;
end;
$$;

-- Bloqueio silencioso: a outra pessoa não é avisada. Desfaz o seguir nos dois sentidos.
create function public.block_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if p_target = v_me or not exists (select 1 from public.profiles p where p.id = p_target) then
    raise exception 'PROFILE_UNAVAILABLE' using errcode = 'P0002';
  end if;
  insert into public.blocks (blocker_id, blocked_id) values (v_me, p_target)
  on conflict do nothing;
  delete from public.follows f
  where (f.follower_id = v_me and f.followed_id = p_target)
     or (f.follower_id = p_target and f.followed_id = v_me);
end;
$$;

-- Denúncia anônima para a outra pessoa (quem denunciou fica guardado só para a moderação).
create function public.report_user(p_target uuid, p_reason text, p_detail text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_detail text := nullif(trim(left(p_detail, 500)), '');
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if p_target = v_me or not exists (select 1 from public.profiles p where p.id = p_target) then
    raise exception 'PROFILE_UNAVAILABLE' using errcode = 'P0002';
  end if;
  if p_reason is null or p_reason not in ('perfil_falso', 'assedio', 'golpe', 'conteudo_improprio', 'outro') then
    raise exception 'INVALID_REASON' using errcode = '22023';
  end if;
  -- Limite: 10 denúncias por dia. A mesma pessoa denunciada de novo em 24h não duplica.
  if (select count(*) from public.reports r where r.reporter_id = v_me and r.created_at > now() - interval '1 day') >= 10 then
    raise exception 'LIMIT_REACHED' using errcode = '54000';
  end if;
  if exists (
    select 1 from public.reports r
    where r.reporter_id = v_me and r.reported_id = p_target and r.created_at > now() - interval '1 day'
  ) then
    return;
  end if;
  insert into public.reports (reporter_id, reported_id, reason, detail, snapshot)
  select v_me, p.id, p_reason, v_detail,
         jsonb_build_object(
           'name', p.name, 'headline', p.headline, 'city', p.city, 'bio', p.bio,
           'skills', p.skills, 'experiences', p.experiences, 'photo_path', p.photo_path, 'cover_path', p.cover_path
         )
  from public.profiles p
  where p.id = p_target;
end;
$$;

-- ---------- 6. Permissões das funções ----------
revoke all on function public.search_key(text) from public, anon;
revoke all on function public.city_key(text) from public, anon;
revoke all on function public.can_view_profile(uuid) from public, anon;
revoke all on function public.can_view_photo(text) from public, anon;
revoke all on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) from public, anon;
revoke all on function public.similar_profiles(int) from public, anon;
revoke all on function public.public_profile(uuid) from public, anon;
revoke all on function public.follow_user(uuid) from public, anon;
revoke all on function public.unfollow_user(uuid) from public, anon;
revoke all on function public.block_user(uuid) from public, anon;
revoke all on function public.report_user(uuid, text, text) from public, anon;

grant execute on function public.search_key(text) to authenticated;
grant execute on function public.city_key(text) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;
grant execute on function public.can_view_photo(text) to authenticated;
grant execute on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) to authenticated;
grant execute on function public.similar_profiles(int) to authenticated;
grant execute on function public.public_profile(uuid) to authenticated;
grant execute on function public.follow_user(uuid) to authenticated;
grant execute on function public.unfollow_user(uuid) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.report_user(uuid, text, text) to authenticated;
