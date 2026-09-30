-- Dicas por idioma.
--
-- Cada trilha e cada dica passam a ter um idioma (language). O app mostra só as do idioma escolhido.
-- As dicas que já existem ficam em português (pt-BR).
-- - Dicas gerais (entrevista, currículo, LinkedIn) ganham uma versão em cada idioma, com o MESMO slug
--   e fontes do país daquele idioma.
-- - Dicas que só valem num país (ex.: Jovem Aprendiz, Lei do Estágio) ficam só no idioma dele.
--   Cada idioma também tem dicas próprias do seu país (ex.: Ausbildung em alemão).
-- O slug agora se repete entre idiomas: a regra de "único" passa a ser (idioma, slug).
-- Plano grátis: continua <= 35% das dicas, contado em CADA idioma.

alter table public.tracks
  add column language text not null default 'pt-BR'
    check (language in ('pt-BR', 'en', 'es', 'fr', 'de'));
alter table public.tracks drop constraint tracks_slug_key;
alter table public.tracks add constraint tracks_language_slug_key unique (language, slug);

alter table public.tips
  add column language text not null default 'pt-BR'
    check (language in ('pt-BR', 'en', 'es', 'fr', 'de'));
alter table public.tips drop constraint tips_slug_key;
alter table public.tips add constraint tips_language_slug_key unique (language, slug);

create index tips_language on public.tips (language);

grant select (language) on public.tips to authenticated;

-- Uma dica só pode estar numa trilha do mesmo idioma.
create function public.tips_check_track_language()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.track_id is not null and not exists (
    select 1 from public.tracks where id = new.track_id and language = new.language
  ) then
    raise exception 'A dica % (%) está numa trilha de outro idioma.', new.slug, new.language;
  end if;
  return new;
end;
$$;

create trigger tips_track_language
  before insert or update of track_id, language on public.tips
  for each row execute function public.tips_check_track_language();
