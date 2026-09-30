-- Teste do Explorar (T20/T21): perfil público, busca, filtros, seguir, bloquear, denunciar e fotos.
-- Roda tudo dentro de uma transação e DESFAZ no final (rollback): nada fica gravado no banco.
--
-- Como rodar (terminal do VS Code, dentro da pasta do projeto), DEPOIS do `supabase db push`:
--   npx.cmd supabase db query --linked -f supabase/tests/explore_test.sql
-- Resultado esperado: uma linha "EXPLORAR OK (N verificações)". Qualquer falha aparece como erro "FALHOU: ...".

begin;

create temporary table _checks (total int);
insert into _checks values (0);
grant all on _checks to authenticated, anon;

-- Três contas de teste: A (pública), B (quem explora) e C (privada).
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-b000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'explore-a@teste.invalid', '{}', '{}', now(), now()),
  ('00000000-0000-4000-b000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'explore-b@teste.invalid', '{}', '{}', now(), now()),
  ('00000000-0000-4000-b000-00000000000c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'explore-c@teste.invalid', '{}', '{}', now(), now());

update public.profiles set
  name = 'Júlia Teste A', age = 17, headline = 'Primeiro emprego em atendimento', city = 'Guarulhos, SP',
  bio = 'Bio pública de A', area = 'atendimento', goal = 'primeiro_emprego', onboarding_done = true, is_public = true,
  skills = '[{"name":"Comunicação","type":"comportamental"}]',
  photo_path = '00000000-0000-4000-b000-00000000000a/avatar-2.jpg'
where id = '00000000-0000-4000-b000-00000000000a';
update public.profiles set
  name = 'Pessoa B', age = 20, city = 'guarulhos - sp', area = 'atendimento', goal = 'primeiro_emprego',
  onboarding_done = true, is_public = true
where id = '00000000-0000-4000-b000-00000000000b';
update public.profiles set
  name = 'Pessoa C privada', city = 'Guarulhos', area = 'atendimento', goal = 'primeiro_emprego',
  onboarding_done = true, is_public = false,
  photo_path = '00000000-0000-4000-b000-00000000000c/avatar-1.jpg'
where id = '00000000-0000-4000-b000-00000000000c';
insert into storage.objects (bucket_id, name, owner)
values
  ('avatars', '00000000-0000-4000-b000-00000000000a/avatar-1.jpg', '00000000-0000-4000-b000-00000000000a'), -- antiga
  ('avatars', '00000000-0000-4000-b000-00000000000a/avatar-2.jpg', '00000000-0000-4000-b000-00000000000a'), -- atual
  ('avatars', '00000000-0000-4000-b000-00000000000c/avatar-1.jpg', '00000000-0000-4000-b000-00000000000c');

-- ========== Como B ==========
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-b000-00000000000b","role":"authenticated"}', true);

do $$
declare
  a constant uuid := '00000000-0000-4000-b000-00000000000a';
  b constant uuid := '00000000-0000-4000-b000-00000000000b';
  c constant uuid := '00000000-0000-4000-b000-00000000000c';
  n int;
  r text;
  ok int := 0;
begin
  -- ---------- 1. Só perfis públicos, nunca o próprio ----------
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: A (pública) não apareceu no Explorar'; end if;
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = c;
  if n <> 0 then raise exception 'FALHOU: C (privada) apareceu no Explorar'; end if;
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = b;
  if n <> 0 then raise exception 'FALHOU: B viu o próprio perfil no Explorar'; end if;
  select count(*) into n from public.public_profile(c);
  if n <> 0 then raise exception 'FALHOU: B abriu o perfil privado de C'; end if;
  select count(*) into n from public.public_profile(a);
  if n <> 1 then raise exception 'FALHOU: B não abriu o perfil público de A'; end if;
  -- A tabela profiles continua fechada (só pelas funções).
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FALHOU: B leu a linha de A direto na tabela profiles'; end if;
  ok := ok + 6;

  -- ---------- 2. Campos privados nunca saem das funções ----------
  foreach r in array array[
    pg_get_function_result('public.explore_profiles(text, text[], text[], text[], boolean, int, int)'::regprocedure),
    pg_get_function_result('public.similar_profiles(int)'::regprocedure),
    pg_get_function_result('public.public_profile(uuid)'::regprocedure)
  ] loop
    if r ~* '\m(age|email|plan|premium_until|nervousness|score|average_score|reminder|linkedin_url|instagram|portfolio_url)\M' then
      raise exception 'FALHOU: função devolve campo privado: %', r;
    end if;
    ok := ok + 1;
  end loop;

  -- ---------- 3. Busca sem acento e sem maiúsculas ----------
  select count(*) into n from public.explore_profiles(p_query => 'COMUNICACAO') e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: busca por competência sem acento'; end if;
  select count(*) into n from public.explore_profiles(p_query => 'julia') e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: busca por nome sem acento'; end if;
  select count(*) into n from public.explore_profiles(p_query => 'atendimento') e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: busca pelo título'; end if;
  select count(*) into n from public.explore_profiles(p_query => 'zzzz-nada', p_query_areas => array['atendimento']) e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: busca pelo nome da área'; end if;
  select count(*) into n from public.explore_profiles(p_query => 'zzzz-nada') e where e.id = a;
  if n <> 0 then raise exception 'FALHOU: busca sem resultado trouxe A'; end if;
  ok := ok + 5;

  -- ---------- 4. Filtros ----------
  select count(*) into n from public.explore_profiles(p_areas => array['vendas']) e where e.id = a;
  if n <> 0 then raise exception 'FALHOU: filtro de área'; end if;
  select count(*) into n from public.explore_profiles(p_goals => array['estagio', 'primeiro_emprego']) e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: filtro de objetivos (OU)'; end if;
  select count(*) into n from public.explore_profiles(p_goals => array['jovem_aprendiz']) e where e.id = a;
  if n <> 0 then raise exception 'FALHOU: filtro Jovem aprendiz trouxe A'; end if;
  select count(*) into n from public.explore_profiles(p_near => true) e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: "Perto de mim" (Guarulhos, SP = guarulhos - sp)'; end if;
  select count(*) into n from public.similar_profiles() e where e.id = a;
  if n <> 1 then raise exception 'FALHOU: "Com objetivos parecidos" não trouxe A'; end if;
  select count(*) into n from public.explore_profiles(p_limit => 1);
  if n > 1 then raise exception 'FALHOU: página maior que o limite'; end if;
  ok := ok + 6;

  -- ---------- 5. Seguir / deixar de seguir ----------
  perform public.follow_user(a);
  perform public.follow_user(a); -- de novo: não duplica
  select count(*) into n from public.follows where follower_id = b and followed_id = a;
  if n <> 1 then raise exception 'FALHOU: seguir duplicou ou não gravou (%)', n; end if;
  select p.followers into n from public.public_profile(a) p;
  if n <> 1 then raise exception 'FALHOU: contagem de seguidores (%)', n; end if;
  if not (select e.is_following from public.explore_profiles(p_limit => 50) e where e.id = a) then
    raise exception 'FALHOU: Explorar não mostra "Seguindo"';
  end if;
  begin
    perform public.follow_user(c);
    raise exception 'FALHOU: B seguiu perfil privado';
  exception when no_data_found then null;
  end;
  begin
    perform public.follow_user(b);
    raise exception 'FALHOU: B seguiu a si mesmo';
  exception when no_data_found then null;
  end;
  begin
    insert into public.follows (follower_id, followed_id) values (a, b);
    raise exception 'FALHOU: B gravou direto na tabela follows (em nome de A)';
  exception when insufficient_privilege then null;
  end;
  perform public.unfollow_user(a);
  select count(*) into n from public.follows where follower_id = b;
  if n <> 0 then raise exception 'FALHOU: deixar de seguir'; end if;
  perform public.follow_user(a);
  ok := ok + 7;

  -- ---------- 6. Fotos: só a ATUAL de perfis públicos ----------
  select count(*) into n from storage.objects where name = a::text || '/avatar-2.jpg';
  if n <> 1 then raise exception 'FALHOU: B não vê a foto atual de A (pública)'; end if;
  select count(*) into n from storage.objects where name = a::text || '/avatar-1.jpg';
  if n <> 0 then raise exception 'FALHOU: B viu uma foto antiga de A'; end if;
  select count(*) into n from storage.objects where name like c::text || '/%';
  if n <> 0 then raise exception 'FALHOU: B viu a foto de C (privada)'; end if;
  ok := ok + 3;

  -- ---------- 7. Denúncia ----------
  perform public.report_user(c, 'perfil_falso', 'teste');
  perform public.report_user(c, 'perfil_falso', 'teste'); -- repetida em 24h: não duplica
  begin
    perform public.report_user(a, 'motivo_inventado');
    raise exception 'FALHOU: aceitou motivo inválido';
  exception when invalid_parameter_value then null;
  end;
  begin
    execute 'select count(*) from public.reports';
    raise exception 'FALHOU: B leu a tabela de denúncias';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 2;

  update pg_temp._checks set total = total + ok;
end $$;

-- Denúncia gravada uma vez só, com o motivo e a data (conferido como administrador).
reset role;
do $$
declare n int;
begin
  select count(*) into n from public.reports
  where reporter_id = '00000000-0000-4000-b000-00000000000b' and reported_id = '00000000-0000-4000-b000-00000000000c'
    and reason = 'perfil_falso' and status = 'aberta' and snapshot ->> 'name' = 'Pessoa C privada';
  if n <> 1 then raise exception 'FALHOU: denúncia não gravada certo (%)', n; end if;
  update pg_temp._checks set total = total + 1;
end $$;

-- ========== A bloqueia B ==========
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-b000-00000000000a","role":"authenticated"}', true);

do $$
declare
  b constant uuid := '00000000-0000-4000-b000-00000000000b';
  n int;
begin
  perform public.block_user(b);
  -- A também não vê mais B (bloqueio nos dois sentidos).
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = b;
  if n <> 0 then raise exception 'FALHOU: A ainda vê B depois de bloquear'; end if;
  select count(*) into n from public.public_profile(b);
  if n <> 0 then raise exception 'FALHOU: A abriu o perfil de B depois de bloquear'; end if;
  update pg_temp._checks set total = total + 2;
end $$;

-- ========== B depois do bloqueio ==========
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-b000-00000000000b","role":"authenticated"}', true);

do $$
declare
  a constant uuid := '00000000-0000-4000-b000-00000000000a';
  b constant uuid := '00000000-0000-4000-b000-00000000000b';
  n int;
begin
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = a;
  if n <> 0 then raise exception 'FALHOU: B ainda vê A no Explorar depois do bloqueio'; end if;
  select count(*) into n from public.similar_profiles() e where e.id = a;
  if n <> 0 then raise exception 'FALHOU: B ainda vê A em "objetivos parecidos"'; end if;
  select count(*) into n from public.public_profile(a);
  if n <> 0 then raise exception 'FALHOU: B abriu o perfil de A depois do bloqueio'; end if;
  select count(*) into n from storage.objects where name like a::text || '/%';
  if n <> 0 then raise exception 'FALHOU: B ainda vê a foto de A depois do bloqueio'; end if;
  select count(*) into n from public.follows where follower_id = b;
  if n <> 0 then raise exception 'FALHOU: o bloqueio não desfez o seguir'; end if;
  begin
    perform public.follow_user(a);
    raise exception 'FALHOU: B voltou a seguir A depois do bloqueio';
  exception when no_data_found then null;
  end;
  -- B não sabe que foi bloqueado: a tabela de bloqueios dele está vazia.
  select count(*) into n from public.blocks;
  if n <> 0 then raise exception 'FALHOU: B viu o bloqueio feito por A'; end if;
  update pg_temp._checks set total = total + 7;
end $$;

-- ========== Perfil que deixa de ser público some ==========
reset role;
update public.profiles set is_public = false where id = '00000000-0000-4000-b000-00000000000b';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-b000-00000000000c","role":"authenticated"}', true);

do $$
declare n int;
begin
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = '00000000-0000-4000-b000-00000000000b';
  if n <> 0 then raise exception 'FALHOU: perfil que ficou privado continua no Explorar'; end if;
  -- C (privada) ainda consegue ver os outros.
  select count(*) into n from public.explore_profiles(p_limit => 50) e where e.id = '00000000-0000-4000-b000-00000000000a';
  if n <> 1 then raise exception 'FALHOU: perfil privado não consegue ver os públicos'; end if;
  update pg_temp._checks set total = total + 2;
end $$;

-- ========== Sem login ==========
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

do $$
declare n int := 0;
begin
  begin
    perform public.explore_profiles();
    raise exception 'FALHOU: sem login chamou explore_profiles';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform public.public_profile('00000000-0000-4000-b000-00000000000a');
    raise exception 'FALHOU: sem login chamou public_profile';
  exception when insufficient_privilege then n := n + 1;
  end;
  begin
    perform count(*) from public.follows;
    raise exception 'FALHOU: sem login leu follows';
  exception when insufficient_privilege then n := n + 1;
  end;
  update pg_temp._checks set total = total + n;
end $$;

select 'EXPLORAR OK (' || total || ' verificações)' as resultado from pg_temp._checks;

rollback;
