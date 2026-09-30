-- Fase 2: perfis de usuário.
-- Um perfil por usuário (id = auth.users.id), criado automaticamente no cadastro.
-- RLS: cada pessoa só lê e altera o próprio perfil.
-- O usuário NÃO pode alterar plan nem premium_until (só o painel/service role).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  name text check (char_length(name) between 2 and 40),
  age int check (age >= 16),
  goal text check (goal in ('jovem_aprendiz', 'estagio', 'primeiro_emprego', 'novo_emprego')),
  area text check (area in ('atendimento', 'vendas', 'administrativo', 'tecnologia', 'marketing', 'logistica', 'saude', 'outra')),
  nervousness int check (nervousness between 1 and 5),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  premium_until timestamptz,
  reminder_enabled boolean not null default false,
  reminder_time time,
  theme text not null default 'auto' check (theme in ('auto', 'light', 'dark')),
  onboarding_done boolean not null default false,
  accepted_terms_at timestamptz
);

alter table public.profiles enable row level security;

create policy "profiles: ler o próprio"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: alterar o próprio"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sem políticas de INSERT/DELETE: a linha nasce pelo gatilho abaixo
-- e some em cascata quando a conta é apagada.

-- Privilégios por coluna: o app só pode alterar estas colunas.
-- plan e premium_until ficam de fora de propósito.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (
  name, age, goal, area, nervousness,
  reminder_enabled, reminder_time, theme,
  onboarding_done, accepted_terms_at
) on public.profiles to authenticated;

-- Cria o perfil vazio assim que a conta é criada.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
