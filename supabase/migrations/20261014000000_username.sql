-- Nome de usuário (@): identifica a pessoa no Explorar e aparece abaixo do nome.
--
-- Regras:
-- - 3 a 20 caracteres: letras minúsculas, números, ponto e sublinhado; começa e termina com letra ou número;
--   sem ".." seguidos. Único no app (o app já envia em minúsculas).
-- - Todo perfil com nome ganha um @ gerado a partir do nome ("Ana Souza" → ana.souza, ou ana.souza4821 se já existir).
--   Quem ainda não tem nome (cadastro no começo) ganha quando o nome for salvo. A pessoa pode trocar na T19.
-- - Outros usuários só veem o @ pelas funções do Explorar (a tabela profiles continua fechada).

-- ---------- 1. Coluna ----------
alter table public.profiles add column username text;
alter table public.profiles add constraint profiles_username_format check (
  username ~ '^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$' and username !~ '\.\.'
);
alter table public.profiles add constraint profiles_username_unique unique (username);
grant update (username) on public.profiles to authenticated;

-- Nomes que parecem oficiais do app ficam reservados.
create function public.username_reserved(p text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select p in (
    'admin', 'administrador', 'siwki', 'pronto', 'suporte', 'support', 'ajuda', 'help',
    'moderacao', 'moderador', 'oficial', 'official', 'equipe', 'team', 'root', 'sistema'
  );
$$;

alter table public.profiles add constraint profiles_username_not_reserved check (not public.username_reserved(username));

-- ---------- 2. Gerar a partir do nome ----------
create function public.generate_username(p_name text, p_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_try text;
  i int := 0;
begin
  -- "Ana  Souza!" → "ana.souza"
  v_base := public.search_key(coalesce(p_name, ''));
  v_base := regexp_replace(v_base, '\s+', '.', 'g');
  v_base := regexp_replace(v_base, '[^a-z0-9._]', '', 'g');
  v_base := regexp_replace(v_base, '\.{2,}', '.', 'g');
  v_base := trim(both '._' from left(v_base, 15));
  if char_length(v_base) < 3 then
    v_base := 'usuario';
  end if;

  v_try := v_base;
  while public.username_reserved(v_try)
     or exists (select 1 from public.profiles p where p.username = v_try and p.id <> p_id) loop
    i := i + 1;
    v_try := v_base || (1000 + floor(random() * 9000))::int::text;
    if i > 20 then
      v_try := v_base || substr(md5(p_id::text || clock_timestamp()::text), 1, 5);
      v_try := regexp_replace(v_try, '[^a-z0-9]$', '0');
    end if;
  end loop;
  return v_try;
end;
$$;

-- Preenche o @ quando o perfil ganha nome e ainda não tem @ (inclusive se a pessoa apagar o próprio @).
create function public.profiles_fill_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is null and nullif(trim(new.name), '') is not null then
    new.username := public.generate_username(new.name, new.id);
  end if;
  return new;
end;
$$;

create trigger profiles_fill_username
  before insert or update of name, username on public.profiles
  for each row execute function public.profiles_fill_username();

-- Perfis que já existem: um por vez, para cada @ enxergar os anteriores.
do $$
declare
  r record;
begin
  for r in select id, name from public.profiles where username is null and nullif(trim(name), '') is not null order by created_at loop
    update public.profiles set username = public.generate_username(r.name, r.id) where id = r.id;
  end loop;
end $$;

-- ---------- 3. "Esse @ está livre?" (T19, enquanto a pessoa digita) ----------
create function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_username ~ '^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$'
     and p_username !~ '\.\.'
     and not public.username_reserved(p_username)
     and not exists (select 1 from public.profiles p where p.username = p_username and p.id <> (select auth.uid()));
$$;

-- ---------- 4. Explorar e perfil público passam a devolver o @ ----------
-- (Mudar as colunas de retorno exige recriar as funções.)
drop function public.explore_profiles(text, text[], text[], text[], boolean, int, int);
drop function public.similar_profiles(int);
drop function public.public_profile(uuid);

-- Busca: "@ana" procura só pelo @ (começo); sem @, procura em nome, @, título, competências e área.
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
  is_following boolean
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
  select p.id, p.name, p.username, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows f where f.follower_id = v_me and f.followed_id = p.id)
  from public.profiles p
  where public.can_view_profile(p.id)
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
            public.search_key(concat_ws(' ', p.name, p.username, p.headline,
              (select string_agg(s ->> 'name', ' ') from jsonb_array_elements(p.skills) s))),
            v_q
          ) > 0
          or p.area = any (coalesce(p_query_areas, '{}'))
        )
      )
    )
  -- Buscando por @: o @ exato vem primeiro.
  order by (v_at and p.username = v_q) desc, p.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

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
  is_following boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.username, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.followed_id = p.id)
  from public.profiles p
  join public.profiles me on me.id = (select auth.uid())
  where public.can_view_profile(p.id)
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
  linkedin_done boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id, p.name, p.username, p.headline, p.city, p.bio, p.area, p.goal, p.availability, p.work_format,
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

-- ---------- 5. Permissões ----------
revoke all on function public.username_reserved(text) from public, anon;
revoke all on function public.generate_username(text, uuid) from public, anon, authenticated;
revoke all on function public.profiles_fill_username() from public, anon, authenticated;
revoke all on function public.username_available(text) from public, anon;
revoke all on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) from public, anon;
revoke all on function public.similar_profiles(int) from public, anon;
revoke all on function public.public_profile(uuid) from public, anon;

grant execute on function public.username_reserved(text) to authenticated;
grant execute on function public.username_available(text) to authenticated;
grant execute on function public.explore_profiles(text, text[], text[], text[], boolean, int, int) to authenticated;
grant execute on function public.similar_profiles(int) to authenticated;
grant execute on function public.public_profile(uuid) to authenticated;
