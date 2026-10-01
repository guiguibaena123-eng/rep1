-- Contas bloqueadas: ver a lista (Configurações) e desbloquear.
--
-- - Só quem bloqueou enxerga a própria lista (a tabela blocks já é lida só pelo blocker; a lista precisa do
--   nome e da foto da outra pessoa, que a tabela profiles fechada não entrega, então vai por função).
-- - Desbloquear apaga o bloqueio. O "seguir" que o bloqueio desfez não volta: é preciso seguir de novo.

create function public.blocked_list(p_limit int default 20, p_offset int default 0)
returns table (
  id uuid,
  name text,
  username text,
  photo_path text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  return query
  select p.id, p.name, p.username, p.photo_path
  from public.blocks b
  join public.profiles p on p.id = b.blocked_id
  where b.blocker_id = auth.uid()
  order by b.created_at desc, p.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
end;
$$;

create function public.unblock_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  delete from public.blocks b where b.blocker_id = auth.uid() and b.blocked_id = p_target;
end;
$$;

revoke all on function public.blocked_list(int, int) from public, anon;
revoke all on function public.unblock_user(uuid) from public, anon;
grant execute on function public.blocked_list(int, int) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
