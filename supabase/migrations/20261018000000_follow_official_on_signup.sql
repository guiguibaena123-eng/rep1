-- Toda conta nova já nasce seguindo o perfil oficial (@siwki.app).
-- Sem notificação para a conta oficial (seriam centenas de "novo seguidor").
-- Quem não quiser pode deixar de seguir normalmente (unfollow_user).

create or replace function public.follow_official_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_official uuid;
begin
  select p.id into v_official from public.profiles p where p.username = 'siwki.app';
  if v_official is not null and v_official <> new.id then
    insert into public.follows (follower_id, followed_id) values (new.id, v_official) on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.follow_official_on_signup() from public, anon, authenticated;

create trigger follow_official_on_signup
after insert on public.profiles
for each row execute function public.follow_official_on_signup();

-- Contas que já existem passam a seguir também.
insert into public.follows (follower_id, followed_id)
select p.id, o.id
from public.profiles p
join public.profiles o on o.username = 'siwki.app'
where p.id <> o.id
on conflict do nothing;
