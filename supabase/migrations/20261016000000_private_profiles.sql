-- Perfil privado com solicitações de seguir, e o selo de verificado visível para os outros.
--
-- Regras:
-- - Todo perfil com cadastro concluído aparece no Explorar e pode ser aberto (sem bloqueio, nos dois sentidos).
-- - Privado (is_public desligado): quem não o segue vê só foto, capa, nome, @, selo, seguidores/seguindo e o botão
--   Seguir. Título, cidade, bio, área, objetivo, disponibilidade, formato, competências, experiências, formação,
--   cursos e conquistas vêm vazios. Quem segue (solicitação aceita) vê tudo.
-- - Seguir um privado cria uma SOLICITAÇÃO; o dono aceita ou recusa na aba "Solicitações".
--   Deixar de seguir também cancela a solicitação. Bloquear apaga as solicitações nos dois sentidos.
-- - Privado não é achado pelo que esconde: a busca usa só nome e @, e os filtros (área, objetivo,
--   "Perto de mim") e "objetivos parecidos" mostram apenas perfis públicos.
-- - Selo (verified): 'gold' para a conta do criador do Siwki, 'blue' para Premium ativo, null para os demais.
--   O plano em si continua fechado; só o selo sai.

-- ---------- 1. Solicitações ----------
create table public.follow_requests (
  requester_id uuid not null references auth.users (id) on delete cascade,
  target_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (requester_id, target_id),
  constraint follow_requests_not_self check (requester_id <> target_id)
);
create index follow_requests_target_idx on public.follow_requests (target_id, created_at desc);

alter table public.follow_requests enable row level security;
revoke all on public.follow_requests from anon, authenticated;
-- A pessoa lê as solicitações que fez (usado no "Exportar meus dados"); o resto só pelas funções.
grant select on public.follow_requests to authenticated;
create policy "follow_requests: ler as que eu fiz"
  on public.follow_requests for select
  to authenticated
  using ((select auth.uid()) = requester_id);

-- ---------- 2. Quem pode ver (agora sem exigir is_public) ----------
create or replace function public.can_view_profile(p_target uuid)
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
      and p.onboarding_done
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = (select auth.uid()) and b.blocked_id = p.id)
           or (b.blocker_id = p.id and b.blocked_id = (select auth.uid()))
      )
  );
$$;

-- A pessoa logada vê o perfil COMPLETO? (público, ela mesma ou ela já segue)
create function public.profile_open(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_id
      and (
        p.is_public
        or p.id = (select auth.uid())
        or exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id)
      )
  );
$$;

-- ---------- 3. Selo de verificado (mesma regra de src/features/profile/verified.ts) ----------
create function public.verified_kind(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.id = '07e4af07-702b-4405-a4f3-506797c3c14c' then 'gold'
    when p.plan = 'premium' and (p.premium_until is null or p.premium_until > now()) then 'blue'
  end
  from public.profiles p
  where p.id = p_id;
$$;

-- ---------- 4. Listas e perfil devolvem is_public, requested e verified (recriar: mudam as colunas) ----------
drop function public.explore_profiles(text, text[], text[], text[], boolean, int, int);
drop function public.similar_profiles(int);
drop function public.public_profile(uuid);
drop function public.follow_list(uuid, text, int, int);
drop function public.follow_user(uuid);

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
  username text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean,
  requested boolean,
  is_public boolean,
  verified text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_raw text := trim(coalesce(left(p_query, 60), ''));
  v_at boolean := v_raw like '@%';
  v_q text := nullif(trim(public.search_key(ltrim(v_raw, '@'))), '');
  v_city text;
  v_filtered boolean := coalesce(cardinality(p_areas), 0) > 0 or coalesce(cardinality(p_goals), 0) > 0 or coalesce(p_near, false);
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
  select p.id, p.name, p.username,
         case when o.open then p.headline end,
         case when o.open then p.city end,
         case when o.open then p.area end,
         case when o.open then p.goal end,
         case when o.open then p.skills else '[]'::jsonb end,
         p.photo_path,
         o.following,
         exists (select 1 from public.follow_requests r where r.requester_id = v_me and r.target_id = p.id),
         p.is_public,
         public.verified_kind(p.id)
  from public.profiles p
  cross join lateral (
    select exists (select 1 from public.follows f where f.follower_id = v_me and f.followed_id = p.id) as following
  ) fw
  cross join lateral (select fw.following, p.is_public or fw.following as open) o
  where public.can_view_profile(p.id)
    -- Filtros e busca por área olham campos que o privado esconde: só perfis públicos.
    and (not v_filtered or p.is_public)
    and (coalesce(cardinality(p_areas), 0) = 0 or p.area = any (p_areas))
    and (coalesce(cardinality(p_goals), 0) = 0 or p.goal = any (p_goals))
    and (v_city is null or public.city_key(p.city) = v_city)
    and (
      v_q is null
      or (v_at and starts_with(coalesce(p.username, ''), v_q))
      or (
        not v_at
        and (
          strpos(
            public.search_key(concat_ws(' ', p.name, p.username,
              case when p.is_public then p.headline end,
              case when p.is_public then (select string_agg(s ->> 'name', ' ') from jsonb_array_elements(p.skills) s) end)),
            v_q
          ) > 0
          or (p.is_public and p.area = any (coalesce(p_query_areas, '{}')))
        )
      )
    )
  -- Buscando por @: o @ exato vem primeiro.
  order by (v_at and p.username = v_q) desc, p.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

-- "Com objetivos parecidos" compara área e objetivo: só perfis públicos.
create function public.similar_profiles(p_limit int default 10)
returns table (
  id uuid,
  name text,
  username text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean,
  requested boolean,
  is_public boolean,
  verified text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.username, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id),
         false,
         p.is_public,
         public.verified_kind(p.id)
  from public.profiles p
  join public.profiles me on me.id = (select auth.uid())
  where public.can_view_profile(p.id)
    and p.is_public
    and me.area is not null and me.goal is not null
    and p.area = me.area and p.goal = me.goal
  order by p.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 10), 1), 10);
$$;

create function public.public_profile(p_id uuid)
returns table (
  id uuid,
  name text,
  username text,
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
  linkedin_done boolean,
  requested boolean,
  is_public boolean,
  verified text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, p.name, p.username,
    case when o.open then p.headline end,
    case when o.open then p.city end,
    case when o.open then p.bio end,
    case when o.open then p.area end,
    case when o.open then p.goal end,
    case when o.open then p.availability else '{}'::text[] end,
    case when o.open then p.work_format end,
    case when o.open then p.skills else '[]'::jsonb end,
    case when o.open then p.experiences else '[]'::jsonb end,
    case when o.open then p.education else '[]'::jsonb end,
    case when o.open then p.courses else '[]'::jsonb end,
    p.photo_path, p.cover_path,
    p.cover_x::int, p.cover_y::int,
    (select count(*)::int from public.follows f where f.followed_id = p.id),
    (select count(*)::int from public.follows f where f.follower_id = p.id),
    exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id),
    o.open and exists (select 1 from public.interview_sessions s where s.user_id = p.id and s.status = 'completed'),
    case when not o.open then 0 else (
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
    ) end,
    o.open and exists (select 1 from public.linkedin_reports l where l.user_id = p.id),
    exists (select 1 from public.follow_requests r where r.requester_id = (select auth.uid()) and r.target_id = p.id),
    p.is_public,
    public.verified_kind(p.id)
  from public.profiles p
  cross join lateral (select public.profile_open(p.id) as open) o
  where p.id = p_id and public.can_view_profile(p.id);
$$;

create function public.follow_list(
  p_id uuid,
  p_kind text,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  name text,
  username text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean,
  requested boolean,
  is_public boolean,
  verified text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('followers', 'following') then
    raise exception 'INVALID_KIND' using errcode = '22023';
  end if;
  if p_id <> v_me and not public.can_view_profile(p_id) then
    raise exception 'PROFILE_UNAVAILABLE' using errcode = 'P0002';
  end if;

  return query
  select p.id, p.name, p.username,
         case when o.open then p.headline end,
         case when o.open then p.city end,
         case when o.open then p.area end,
         case when o.open then p.goal end,
         case when o.open then p.skills else '[]'::jsonb end,
         p.photo_path,
         exists (select 1 from public.follows mf where mf.follower_id = v_me and mf.followed_id = p.id),
         exists (select 1 from public.follow_requests r where r.requester_id = v_me and r.target_id = p.id),
         p.is_public,
         public.verified_kind(p.id)
  from public.follows f
  join public.profiles p
    on p.id = case when p_kind = 'followers' then f.follower_id else f.followed_id end
  cross join lateral (select public.profile_open(p.id) as open) o
  where (case when p_kind = 'followers' then f.followed_id else f.follower_id end) = p_id
    -- A própria pessoa aparece nas listas dos outros (ex.: nos seguidores de quem ela segue).
    and (p.id = v_me or public.can_view_profile(p.id))
  order by f.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

-- ---------- 5. Seguir: público segue na hora, privado vira solicitação ----------
-- Devolve 'following' ou 'requested'.
create function public.follow_user(p_target uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_public boolean;
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  if not public.can_view_profile(p_target) then
    raise exception 'PROFILE_UNAVAILABLE' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.follows f where f.follower_id = v_me and f.followed_id = p_target) then
    return 'following';
  end if;
  -- Limite contra robôs: 300 perfis seguidos ou solicitados por dia.
  if (select count(*) from public.follows f where f.follower_id = v_me and f.created_at > now() - interval '1 day')
     + (select count(*) from public.follow_requests r where r.requester_id = v_me and r.created_at > now() - interval '1 day') >= 300 then
    raise exception 'LIMIT_REACHED' using errcode = '54000';
  end if;
  select p.is_public into v_public from public.profiles p where p.id = p_target;
  if v_public then
    insert into public.follows (follower_id, followed_id) values (v_me, p_target) on conflict do nothing;
    return 'following';
  end if;
  insert into public.follow_requests (requester_id, target_id) values (v_me, p_target) on conflict do nothing;
  return 'requested';
end;
$$;

-- Deixar de seguir também cancela a solicitação pendente. Funciona sempre.
create or replace function public.unfollow_user(p_target uuid)
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
  delete from public.follow_requests r where r.requester_id = auth.uid() and r.target_id = p_target;
end;
$$;

-- Bloqueio silencioso: desfaz o seguir e as solicitações nos dois sentidos.
create or replace function public.block_user(p_target uuid)
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
  delete from public.follow_requests r
  where (r.requester_id = v_me and r.target_id = p_target)
     or (r.requester_id = p_target and r.target_id = v_me);
end;
$$;

-- ---------- 6. Aba "Solicitações" (só a própria pessoa) ----------
create function public.follow_request_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.follow_requests r
  where r.target_id = (select auth.uid()) and public.can_view_profile(r.requester_id);
$$;

-- Quem pediu para seguir a pessoa logada, mais recentes primeiro (bloqueados ficam de fora).
create function public.follow_requests_list(p_limit int default 20, p_offset int default 0)
returns table (
  id uuid,
  name text,
  username text,
  headline text,
  city text,
  area text,
  goal text,
  skills jsonb,
  photo_path text,
  is_following boolean,
  requested boolean,
  is_public boolean,
  verified text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  return query
  select p.id, p.name, p.username,
         case when o.open then p.headline end,
         case when o.open then p.city end,
         case when o.open then p.area end,
         case when o.open then p.goal end,
         case when o.open then p.skills else '[]'::jsonb end,
         p.photo_path,
         exists (select 1 from public.follows mf where mf.follower_id = v_me and mf.followed_id = p.id),
         exists (select 1 from public.follow_requests mr where mr.requester_id = v_me and mr.target_id = p.id),
         p.is_public,
         public.verified_kind(p.id)
  from public.follow_requests r
  join public.profiles p on p.id = r.requester_id
  cross join lateral (select public.profile_open(p.id) as open) o
  where r.target_id = v_me and public.can_view_profile(p.id)
  order by r.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

-- Aceitar (vira seguidor) ou recusar (a pessoa não é avisada). Sem solicitação: não faz nada.
create function public.respond_follow_request(p_requester uuid, p_accept boolean)
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
  delete from public.follow_requests r where r.requester_id = p_requester and r.target_id = v_me;
  if found and coalesce(p_accept, false) and public.can_view_profile(p_requester) then
    insert into public.follows (follower_id, followed_id) values (p_requester, v_me) on conflict do nothing;
  end if;
end;
$$;

-- ---------- 7. Permissões ----------
revoke all on function public.profile_open(uuid) from public, anon, authenticated;
revoke all on function public.verified_kind(uuid) from public, anon, authenticated;
revoke all on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) from public, anon;
revoke all on function public.similar_profiles(int) from public, anon;
revoke all on function public.public_profile(uuid) from public, anon;
revoke all on function public.follow_list(uuid, text, int, int) from public, anon;
revoke all on function public.follow_user(uuid) from public, anon;
revoke all on function public.follow_request_count() from public, anon;
revoke all on function public.follow_requests_list(int, int) from public, anon;
revoke all on function public.respond_follow_request(uuid, boolean) from public, anon;

grant execute on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) to authenticated;
grant execute on function public.similar_profiles(int) to authenticated;
grant execute on function public.public_profile(uuid) to authenticated;
grant execute on function public.follow_list(uuid, text, int, int) to authenticated;
grant execute on function public.follow_user(uuid) to authenticated;
grant execute on function public.follow_request_count() to authenticated;
grant execute on function public.follow_requests_list(int, int) to authenticated;
grant execute on function public.respond_follow_request(uuid, boolean) to authenticated;
