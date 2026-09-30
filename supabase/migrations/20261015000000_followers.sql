-- Seguidores: listas "Seguidores" e "Seguindo" e os números no próprio perfil.
--
-- Regras:
-- - A pessoa vê as próprias listas e as de quem ela pode ver (perfil público, sem bloqueio: can_view_profile).
-- - Nas listas só aparecem perfis que a pessoa logada pode ver (e ela mesma): privados e bloqueados
--   (nos dois sentidos) ficam de fora.
--   Por isso a lista pode ter menos gente que o número (o número conta todo mundo, sem mostrar quem).
-- - Depende de 20261014000000_username.sql (devolve o @).

-- Números de um perfil (o próprio ou um que a pessoa pode ver). Nenhuma linha = não pode ver.
create function public.follow_counts(p_id uuid)
returns table (followers int, following int)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::int from public.follows f where f.followed_id = p_id),
    (select count(*)::int from public.follows f where f.follower_id = p_id)
  where p_id = (select auth.uid()) or public.can_view_profile(p_id);
$$;

-- Lista "followers" (quem segue p_id) ou "following" (quem p_id segue), mais recentes primeiro.
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
  is_following boolean
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
  select p.id, p.name, p.username, p.headline, p.city, p.area, p.goal, p.skills, p.photo_path,
         exists (select 1 from public.follows mf where mf.follower_id = v_me and mf.followed_id = p.id)
  from public.follows f
  join public.profiles p
    on p.id = case when p_kind = 'followers' then f.follower_id else f.followed_id end
  where (case when p_kind = 'followers' then f.followed_id else f.follower_id end) = p_id
    -- A própria pessoa aparece nas listas dos outros (ex.: nos seguidores de quem ela segue).
    and (p.id = v_me or public.can_view_profile(p.id))
  order by f.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

revoke all on function public.follow_counts(uuid) from public, anon;
revoke all on function public.follow_list(uuid, text, int, int) from public, anon;
grant execute on function public.follow_counts(uuid) to authenticated;
grant execute on function public.follow_list(uuid, text, int, int) to authenticated;
