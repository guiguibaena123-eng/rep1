-- Prompt 3: perfil completo (T18 Meu perfil / T19 Editar perfil).
-- Novas colunas em profiles + bucket privado "avatars" para a foto.
-- Continua valendo: cada pessoa só lê e altera o próprio perfil (políticas da Fase 2).

-- Nome: agora até 60 caracteres (antes 40).
alter table public.profiles drop constraint if exists profiles_name_check;
alter table public.profiles add constraint profiles_name_check check (char_length(name) between 2 and 60);

alter table public.profiles
  add column photo_path text check (char_length(photo_path) <= 200),
  add column headline text check (char_length(headline) <= 120),
  add column city text check (char_length(city) <= 80),
  add column bio text check (char_length(bio) <= 400),
  -- [{ "name": "...", "type": "comportamental" | "tecnica" }], no máximo 15.
  add column skills jsonb not null default '[]'::jsonb
    check (jsonb_typeof(skills) = 'array' and jsonb_array_length(skills) <= 15),
  add column availability text[] not null default '{}'
    check (availability <@ array['manha', 'tarde', 'noite', 'fim_de_semana']),
  add column work_format text check (work_format in ('presencial', 'hibrido', 'remoto')),
  -- [{ "title", "place", "start", "end" (texto ou null = atual), "description" }]
  add column experiences jsonb not null default '[]'::jsonb
    check (jsonb_typeof(experiences) = 'array' and jsonb_array_length(experiences) <= 20),
  -- [{ "course", "institution", "status": "cursando" | "concluido" | "trancado", "year" }]
  add column education jsonb not null default '[]'::jsonb
    check (jsonb_typeof(education) = 'array' and jsonb_array_length(education) <= 10),
  -- [{ "name", "institution", "year" }]
  add column courses jsonb not null default '[]'::jsonb
    check (jsonb_typeof(courses) = 'array' and jsonb_array_length(courses) <= 20),
  -- [{ "language", "level": "basico" | "intermediario" | "avancado" | "fluente" | "nativo" }]
  add column languages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(languages) = 'array' and jsonb_array_length(languages) <= 10),
  add column linkedin_url text check (char_length(linkedin_url) <= 200),
  add column portfolio_url text check (char_length(portfolio_url) <= 200);

-- O app pode alterar as colunas novas (plan e premium_until continuam de fora).
grant update (
  photo_path, headline, city, bio, skills, availability, work_format,
  experiences, education, courses, languages, linkedin_url, portfolio_url
) on public.profiles to authenticated;

-- ---------- Bucket privado das fotos ----------
-- Caminho: avatars/{user_id}/avatar-{data}.jpg. Até 1 MB (o app comprime para ~300 KB), só JPEG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

-- Só a própria pessoa envia, vê e apaga as fotos da própria pasta.
create policy "avatars: ler a própria pasta"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: enviar para a própria pasta"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: apagar da própria pasta"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
