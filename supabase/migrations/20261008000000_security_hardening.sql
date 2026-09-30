-- Reforço de segurança (revisão de 29/09/2026). Nada aqui muda o funcionamento do app:
-- só fecha portas que o app não usa e põe limites em dados que a própria pessoa grava.

-- ---------- 1. Permissões que o app não usa ----------
-- O Supabase dá TRUNCATE, TRIGGER e REFERENCES para "authenticated" em toda tabela nova.
-- O app nunca usa, e TRUNCATE ignora o RLS: tiramos de todas as tabelas do schema public.
do $$
declare
  r record;
begin
  for r in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p', 'v')
  loop
    execute format('revoke truncate, trigger, references on public.%I from anon, authenticated', r.relname);
  end loop;
end $$;

-- A view de estatísticas é só leitura.
revoke insert, update, delete on public.user_stats from anon, authenticated;

-- Função de gatilho: não precisa ser chamável por ninguém (o gatilho roda sem essa permissão).
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------- 2. Perfil: limites no que a pessoa grava ----------
-- Foto e capa só podem apontar para a PRÓPRIA pasta ({id}/avatar-….jpg ou {id}/cover-….jpg).
alter table public.profiles
  add constraint profiles_photo_path_own
    check (photo_path is null or photo_path ~ ('^' || id::text || '/avatar-[0-9]+\.jpg$')),
  add constraint profiles_cover_path_own
    check (cover_path is null or cover_path ~ ('^' || id::text || '/cover-[0-9]+\.jpg$')),
  -- Tamanho máximo das listas (bem acima do que o app deixa escrever): evita guardar megabytes num perfil.
  add constraint profiles_skills_size check (pg_column_size(skills) <= 4096),
  add constraint profiles_experiences_size check (pg_column_size(experiences) <= 32768),
  add constraint profiles_education_size check (pg_column_size(education) <= 8192),
  add constraint profiles_courses_size check (pg_column_size(courses) <= 16384),
  add constraint profiles_languages_size check (pg_column_size(languages) <= 4096),
  -- Links: só endereço web (nada de "javascript:" etc.), sem espaços.
  add constraint profiles_linkedin_url_web
    check (linkedin_url is null or linkedin_url ~* '^(https?://)?[a-z0-9.-]+\.[a-z]{2,}(:[0-9]+)?(/\S*)?$'),
  add constraint profiles_portfolio_url_web
    check (portfolio_url is null or portfolio_url ~* '^(https?://)?[a-z0-9.-]+\.[a-z]{2,}(:[0-9]+)?(/\S*)?$'),
  add constraint profiles_age_max check (age <= 100);

-- ---------- 3. Arquivos: nome controlado e quantidade limitada por pessoa ----------
-- Quantos arquivos a pessoa logada tem num bucket (usado pelas regras abaixo).
create function public.my_file_count(p_bucket text)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from storage.objects
  where bucket_id = p_bucket and (storage.foldername(name))[1] = (select auth.uid())::text;
$$;

revoke all on function public.my_file_count(text) from public, anon;
grant execute on function public.my_file_count(text) to authenticated;

-- Fotos: só {id}/avatar-….jpg ou {id}/cover-….jpg, e no máximo 10 arquivos na pasta
-- (o app apaga as antigas depois de salvar; 10 dá folga para trocas seguidas).
drop policy "avatars: enviar para a própria pasta" on storage.objects;
create policy "avatars: enviar para a própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ ('^' || (select auth.uid())::text || '/(avatar|cover)-[0-9]+\.jpg$')
    and public.my_file_count('avatars') < 10
  );

-- PDFs do LinkedIn: só {id}/{uuid}.pdf e no máximo 3 esperando análise (o servidor apaga depois de ler).
drop policy "linkedin-uploads: enviar para a própria pasta" on storage.objects;
create policy "linkedin-uploads: enviar para a própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'linkedin-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~* ('^' || (select auth.uid())::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$')
    and public.my_file_count('linkedin-uploads') < 3
  );

-- ---------- 4. Métricas: limite de cliques gravados pelo app ----------
-- O app só grava alguns cliques (paywall, suporte…). Mais de 60 por hora é abuso: recusa.
create function public.events_client_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Só os cliques que o app grava (os eventos do próprio banco não entram na conta).
  if new.name in ('paywall_viewed', 'premium_cta_clicked', 'reminder_enabled', 'support_opened') and (
    select count(*) from public.events
    where user_id = new.user_id
      and name in ('paywall_viewed', 'premium_cta_clicked', 'reminder_enabled', 'support_opened')
      and created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'LIMIT_REACHED' using errcode = '54000';
  end if;
  return new;
end;
$$;

revoke all on function public.events_client_limit() from public, anon, authenticated;

create trigger events_client_limit
  before insert on public.events
  for each row execute function public.events_client_limit();
