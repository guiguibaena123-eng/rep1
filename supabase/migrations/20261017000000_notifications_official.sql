-- Notificações dentro do app e a conta oficial do Siwki (selo diamante).
--
-- Regras:
-- - Notificação é criada só pelo banco, quando algo acontece com a pessoa: pediram para seguir o perfil privado,
--   aceitaram a solicitação dela, ou passaram a seguir o perfil público dela. O app não grava direto na tabela.
-- - Uma notificação por (pessoa, tipo, quem fez): repetir só a renova e volta a "não lida".
-- - Quando o motivo some (pedido cancelado, recusado, aceito, deixou de seguir, bloqueio), a notificação some junto.
-- - A lista só mostra quem a pessoa logada ainda pode ver (bloqueados ficam de fora).
-- - Selo diamante: conta oficial do Siwki (pelo ID, que nunca muda). Ganha também o perfil público e a bio especial.

-- ---------- 1. Tabela ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('follow_request', 'follow_accepted', 'new_follower')),
  actor_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notifications_not_self check (user_id <> actor_id),
  constraint notifications_unique unique (user_id, type, actor_id)
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
-- Sem nenhuma política e sem permissão: só as funções abaixo leem e gravam.
revoke all on public.notifications from anon, authenticated;

-- ---------- 2. Selo diamante ----------
create or replace function public.verified_kind(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.id = '9e47b10c-b8bd-404f-a16f-4599af5dedb5' then 'diamond'
    when p.id = '07e4af07-702b-4405-a4f3-506797c3c14c' then 'gold'
    when p.plan = 'premium' and (p.premium_until is null or p.premium_until > now()) then 'blue'
  end
  from public.profiles p
  where p.id = p_id;
$$;

-- ---------- 3. Conta oficial: perfil público e bio especial ----------
update public.profiles
set is_public = true,
    headline = 'Conta oficial do Siwki',
    bio = 'Oi! Aqui é o Siwki, o app que te ajuda a treinar para entrevistas de emprego antes da conversa de verdade. '
       || 'Esta é a conta oficial: você vê novidades e avisos por aqui. '
       || 'Nunca pedimos senha, dados pessoais ou pagamento por mensagem. '
       || 'Dúvidas ou sugestões? Fale com o suporte em Configurações.'
where id = '9e47b10c-b8bd-404f-a16f-4599af5dedb5';

-- ---------- 4. Criar e apagar notificações junto com o seguir ----------
create function public.notify(p_user uuid, p_type text, p_actor uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, type, actor_id) values (p_user, p_type, p_actor)
  on conflict (user_id, type, actor_id) do update set created_at = now(), read_at = null;
$$;

create or replace function public.follow_user(p_target uuid)
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
    perform public.notify(p_target, 'new_follower', v_me);
    return 'following';
  end if;
  insert into public.follow_requests (requester_id, target_id) values (v_me, p_target) on conflict do nothing;
  perform public.notify(p_target, 'follow_request', v_me);
  return 'requested';
end;
$$;

-- Deixar de seguir também cancela a solicitação pendente (e some a notificação de quem a recebeu).
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
  delete from public.notifications n
  where n.user_id = p_target and n.actor_id = auth.uid() and n.type in ('follow_request', 'new_follower');
end;
$$;

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
  delete from public.notifications n
  where (n.user_id = v_me and n.actor_id = p_target)
     or (n.user_id = p_target and n.actor_id = v_me);
end;
$$;

-- Aceitar ou recusar: a notificação do pedido some; quem pediu é avisado só se foi aceito.
create or replace function public.respond_follow_request(p_requester uuid, p_accept boolean)
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
  if found then
    delete from public.notifications n where n.user_id = v_me and n.actor_id = p_requester and n.type = 'follow_request';
    if coalesce(p_accept, false) and public.can_view_profile(p_requester) then
      insert into public.follows (follower_id, followed_id) values (p_requester, v_me) on conflict do nothing;
      perform public.notify(p_requester, 'follow_accepted', v_me);
    end if;
  end if;
end;
$$;

-- ---------- 5. Ler e marcar como lidas (só a própria pessoa) ----------
create function public.notifications_list(p_limit int default 20, p_offset int default 0)
returns table (
  id uuid,
  type text,
  created_at timestamptz,
  is_read boolean,
  actor_id uuid,
  actor_name text,
  actor_username text,
  actor_photo_path text,
  actor_verified text
)
language sql
stable
security definer
set search_path = ''
as $$
  select n.id, n.type, n.created_at, n.read_at is not null,
         p.id, p.name, p.username, p.photo_path, public.verified_kind(p.id)
  from public.notifications n
  join public.profiles p on p.id = n.actor_id
  where n.user_id = (select auth.uid()) and public.can_view_profile(p.id)
  order by n.created_at desc, n.id
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
$$;

create function public.notifications_unread_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.notifications n
  where n.user_id = (select auth.uid()) and n.read_at is null and public.can_view_profile(n.actor_id);
$$;

create function public.notifications_mark_read()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications set read_at = now()
  where user_id = (select auth.uid()) and read_at is null;
$$;

-- ---------- 6. Permissões ----------
revoke all on function public.notify(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.notifications_list(int, int) from public, anon;
revoke all on function public.notifications_unread_count() from public, anon;
revoke all on function public.notifications_mark_read() from public, anon;
grant execute on function public.notifications_list(int, int) to authenticated;
grant execute on function public.notifications_unread_count() to authenticated;
grant execute on function public.notifications_mark_read() to authenticated;
