-- Teste de segurança (usuário A × usuário B): nenhuma conta acessa os dados de outra.
-- Roda tudo dentro de uma transação e DESFAZ no final (rollback): nada fica gravado no banco.
--
-- Como rodar (terminal do VS Code, dentro da pasta do projeto):
--   npx.cmd supabase db query --linked -f supabase/tests/rls_test.sql
-- Resultado esperado: uma linha "RLS OK (N verificações)". Qualquer falha aparece como erro "FALHOU: ...".

begin;

-- Contador de verificações (para o resultado mostrar quantas passaram).
create temporary table _checks (total int);
insert into _checks values (0);
grant all on _checks to authenticated, anon;

-- Duas contas de teste (e-mails .invalid nunca recebem e-mail). O gatilho cria os perfis.
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-a000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls-a@teste.invalid', '{}', '{}', now(), now()),
  ('00000000-0000-4000-a000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls-b@teste.invalid', '{}', '{}', now(), now());

-- ---------- Dados da pessoa A (gravados como administrador, como fariam as Edge Functions) ----------
update public.profiles
set name = 'Pessoa A', bio = 'Bio secreta de A', headline = 'Título de A',
    photo_path = '00000000-0000-4000-a000-00000000000a/avatar-1.jpg',
    cover_path = '00000000-0000-4000-a000-00000000000a/cover-1.jpg',
    skills = '[{"name":"Empatia","type":"comportamental"}]'
where id = '00000000-0000-4000-a000-00000000000a';
insert into public.interview_sessions (id, user_id, area, level, num_questions, questions)
values ('00000000-0000-4000-a000-0000000000c1', '00000000-0000-4000-a000-00000000000a', 'vendas', 'junior', 3, '[]');
insert into public.interview_answers (session_id, user_id, question_id, answer_text)
values ('00000000-0000-4000-a000-0000000000c1', '00000000-0000-4000-a000-00000000000a', 'q1', 'resposta de teste');
insert into public.interview_feedback (session_id, user_id, report, overall_score)
values ('00000000-0000-4000-a000-0000000000c1', '00000000-0000-4000-a000-00000000000a', '{}', 70);
insert into public.linkedin_reports (user_id, source, is_full, report, overall_score)
values ('00000000-0000-4000-a000-00000000000a', 'paste', false, '{}', 50);
insert into public.daily_activity (user_id, activity_date)
values ('00000000-0000-4000-a000-00000000000a', current_date);
insert into public.usage_counters (user_id, kind, period_start, count)
values ('00000000-0000-4000-a000-00000000000a', 'interview', current_date, 1);
insert into public.tip_progress (user_id, tip_id, favorited)
select '00000000-0000-4000-a000-00000000000a', id, true from public.tips limit 1;
insert into public.subscriptions (id, user_id, amount, status, provider_subscription_id)
values ('00000000-0000-4000-a000-0000000000d1', '00000000-0000-4000-a000-00000000000a', 14.90, 'authorized', 'sub_teste_a');
insert into public.payments (user_id, subscription_id, amount, premium_days, provider_payment_id, status)
values ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-0000000000d1', 14.90, 30, 'in_teste_a', 'approved');
-- Arquivos de A: foto, capa e um PDF do LinkedIn esperando análise.
insert into storage.objects (bucket_id, name, owner)
values
  ('avatars', '00000000-0000-4000-a000-00000000000a/avatar-1.jpg', '00000000-0000-4000-a000-00000000000a'),
  ('avatars', '00000000-0000-4000-a000-00000000000a/cover-1.jpg', '00000000-0000-4000-a000-00000000000a'),
  ('linkedin-uploads', '00000000-0000-4000-a000-00000000000a/11111111-1111-4111-8111-111111111111.pdf', '00000000-0000-4000-a000-00000000000a');

-- ========== Como a pessoa B (usuário logado comum) ==========
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000b","role":"authenticated"}', true);

do $$
declare
  a constant uuid := '00000000-0000-4000-a000-00000000000a';
  b constant uuid := '00000000-0000-4000-a000-00000000000b';
  n int;
  t text;
  ok int := 0;
begin
  -- ---------- 1. B NÃO LÊ nada de A ----------
  foreach t in array array[
    'interview_sessions', 'interview_answers', 'interview_feedback', 'linkedin_reports', 'daily_activity',
    'usage_counters', 'tip_progress', 'subscriptions', 'payments', 'user_stats'
  ] loop
    execute format('select count(*) from public.%I where user_id = %L', t, a) into n;
    if n <> 0 then raise exception 'FALHOU: B leu % de A', t; end if;
    ok := ok + 1;
  end loop;
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FALHOU: B leu o perfil de A (nome, bio, foto…)'; end if;
  ok := ok + 1;
  -- Nem sabendo o id da sessão/assinatura de A.
  select count(*) into n from public.interview_sessions where id = '00000000-0000-4000-a000-0000000000c1';
  if n <> 0 then raise exception 'FALHOU: B leu a simulação de A pelo id'; end if;
  select count(*) into n from public.subscriptions where id = '00000000-0000-4000-a000-0000000000d1';
  if n <> 0 then raise exception 'FALHOU: B leu a assinatura de A pelo id'; end if;
  ok := ok + 2;

  -- ---------- 2. B NÃO VÊ os arquivos de A (foto, capa, PDF) ----------
  select count(*) into n from storage.objects where name like a::text || '/%';
  if n <> 0 then raise exception 'FALHOU: B viu arquivos de A no Storage'; end if;
  ok := ok + 1;

  -- ---------- 3. B NÃO ALTERA nada de A ----------
  update public.profiles set name = 'Invasor', bio = 'hackeado' where id = a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: B alterou o perfil de A'; end if;
  update public.linkedin_reports set checklist_state = '{"c1": true}' where user_id = a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: B alterou o checklist de A'; end if;
  update public.interview_sessions set status = 'abandoned' where user_id = a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: B abandonou a simulação de A'; end if;
  update storage.objects set name = b::text || '/avatar-9.jpg' where name like a::text || '/%';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: B moveu/renomeou arquivo de A'; end if;
  ok := ok + 4;

  -- ---------- 4. B NÃO APAGA nada de A ----------
  begin
    delete from storage.objects where name like a::text || '/%';
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'FALHOU: B apagou arquivos de A'; end if;
  exception
    when raise_exception then raise;
    when others then null; -- bloqueado antes (também é o esperado)
  end;
  foreach t in array array['profiles', 'interview_sessions', 'linkedin_reports', 'subscriptions', 'payments'] loop
    begin
      execute format('delete from public.%I', t);
      raise exception 'FALHOU: B conseguiu usar DELETE em %', t;
    exception when insufficient_privilege then null;
    end;
    begin
      execute format('truncate public.%I cascade', t);
      raise exception 'FALHOU: B conseguiu usar TRUNCATE em %', t;
    exception when insufficient_privilege then null;
    end;
    ok := ok + 2;
  end loop;

  -- ---------- 5. B NÃO GRAVA em nome de A nem direto nas tabelas do servidor ----------
  begin
    insert into public.interview_sessions (user_id, area, level, num_questions, questions) values (a, 'vendas', 'junior', 3, '[]');
    raise exception 'FALHOU: B criou simulação';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.linkedin_reports (user_id, source, report, overall_score) values (b, 'paste', '{}', 100);
    raise exception 'FALHOU: B criou relatório do LinkedIn sem a IA';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.daily_activity (user_id, activity_date) values (b, current_date + 1);
    raise exception 'FALHOU: B inventou dia de atividade';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.tip_progress (user_id, tip_id, favorited) select a, id, true from public.tips limit 1;
    raise exception 'FALHOU: B gravou progresso de dica em nome de A';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.usage_counters set count = 0 where user_id = b;
    raise exception 'FALHOU: B zerou o próprio limite de uso';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 5;

  -- Arquivos: B não envia para a pasta de A, nem arquivo com nome estranho na própria pasta.
  begin
    insert into storage.objects (bucket_id, name, owner) values ('avatars', a::text || '/avatar-2.jpg', b);
    raise exception 'FALHOU: B enviou foto para a pasta de A';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('linkedin-uploads', a::text || '/22222222-2222-4222-8222-222222222222.pdf', b);
    raise exception 'FALHOU: B enviou PDF para a pasta de A';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name, owner) values ('avatars', b::text || '/virus.exe', b);
    raise exception 'FALHOU: B enviou arquivo com nome livre';
  exception when insufficient_privilege then null;
  end;
  -- Mas B envia a PRÓPRIA foto normalmente (a regra não atrapalha o uso certo).
  insert into storage.objects (bucket_id, name, owner) values ('avatars', b::text || '/avatar-1.jpg', b);
  select count(*) into n from storage.objects where name like b::text || '/%';
  if n <> 1 then raise exception 'FALHOU: B deveria ver a própria foto (viu %)', n; end if;
  ok := ok + 4;

  -- Perfil: B não aponta a própria foto para o arquivo de A.
  begin
    update public.profiles set photo_path = a::text || '/avatar-1.jpg' where id = b;
    raise exception 'FALHOU: B apontou a foto para o arquivo de A';
  exception when check_violation then null;
  end;
  begin
    update public.profiles set linkedin_url = 'javascript:alert(1)' where id = b;
    raise exception 'FALHOU: B salvou link perigoso';
  exception when check_violation then null;
  end;
  ok := ok + 2;

  -- ---------- 6. Ninguém vira Premium sozinho ----------
  begin
    update public.profiles set plan = 'premium' where id = b;
    raise exception 'FALHOU: B conseguiu virar Premium sozinho';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set premium_until = now() + interval '10 years' where id = b;
    raise exception 'FALHOU: B aumentou a validade do Premium';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.payments (user_id, amount, premium_days) values (b, 0.01, 30);
    raise exception 'FALHOU: B criou um pagamento pelo app';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.subscriptions (user_id, amount, status) values (b, 0.01, 'authorized');
    raise exception 'FALHOU: B criou uma assinatura pelo app';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 4;

  -- Funções internas do servidor: B não chama.
  foreach t in array array[
    'select public.increment_usage(%L::uuid, ''interview'', current_date)',
    'select public.reserve_usage(%L::uuid, ''interview'', current_date, 1000)',
    'select public.release_usage(%L::uuid, ''interview'', current_date)',
    'select public.take_rate_slot(%L::uuid, ''start-interview'', 1000)',
    'select public.apply_subscription_charge(''00000000-0000-4000-a000-0000000000d1''::uuid, ''in_x'', ''approved'', 14.90, ''BRL'', ''card'') where %L is not null',
    'select public.grant_premium_for_payment(gen_random_uuid(), ''1'', ''approved'', 14.90, ''BRL'', ''pix'') where %L is not null',
    'select public.log_event(%L::uuid, ''payment_approved'')',
    'select public.handle_new_user() where %L is not null'
  ] loop
    begin
      execute format(t, b);
      raise exception 'FALHOU: B chamou função interna: %', t;
    exception when insufficient_privilege then null;
    end;
    ok := ok + 1;
  end loop;

  -- Funções do app só enxergam a própria conta.
  if public.my_file_count('avatars') <> 1 then raise exception 'FALHOU: my_file_count contou arquivos de outra pessoa'; end if;
  if (public.interview_usage() ->> 'used')::int <> 0 then raise exception 'FALHOU: interview_usage mostrou o uso de A'; end if;
  if public.is_premium_now() then raise exception 'FALHOU: B aparece como Premium'; end if;
  ok := ok + 3;

  -- ---------- 7. Métricas ----------
  begin
    execute 'select count(*) from public.events';
    raise exception 'FALHOU: B conseguiu ler a tabela events';
  exception when insufficient_privilege then null;
  end;
  begin
    execute format('insert into public.events (user_id, name) values (%L, %L)', a, 'paywall_viewed');
    raise exception 'FALHOU: B gravou evento em nome de A';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.events (name) values ('payment_approved');
    raise exception 'FALHOU: B gravou evento de pagamento falso';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 3;

  update pg_temp._checks set total = total + ok;
end $$;

-- ========== Sem login (chave pública "anon") ==========
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

do $$
declare
  n int;
  t text;
  ok int := 0;
begin
  foreach t in array array[
    'profiles', 'interview_sessions', 'interview_answers', 'interview_feedback', 'linkedin_reports',
    'daily_activity', 'usage_counters', 'tip_progress', 'subscriptions', 'payments', 'tips', 'tracks', 'user_stats'
  ] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n <> 0 then raise exception 'FALHOU: sem login leu % (% linhas)', t, n; end if;
    exception when insufficient_privilege then null;
    end;
    ok := ok + 1;
  end loop;
  select count(*) into n from storage.objects;
  if n <> 0 then raise exception 'FALHOU: sem login viu arquivos'; end if;
  begin
    perform public.tip_body(gen_random_uuid());
    raise exception 'FALHOU: sem login chamou tip_body';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 2;
  update pg_temp._checks set total = total + ok;
end $$;

-- ========== Como a pessoa A: enxerga os próprios dados (e só eles) ==========
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

do $$
declare
  n int;
  ok int := 0;
begin
  select count(*) into n from public.interview_answers;
  if n <> 1 then raise exception 'FALHOU: A deveria ver a própria resposta (viu %)', n; end if;
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FALHOU: A deveria ver só o próprio perfil (viu %)', n; end if;
  select count(*) into n from public.profiles where bio = 'Bio secreta de A' and name = 'Pessoa A';
  if n <> 1 then raise exception 'FALHOU: o perfil de A foi alterado por B'; end if;
  -- (Fotos de perfis públicos do Explorar também aparecem; aqui conta só a pasta de A.)
  select count(*) into n from storage.objects
  where bucket_id = 'avatars' and name like '00000000-0000-4000-a000-00000000000a/%';
  if n <> 2 then raise exception 'FALHOU: A deveria ver só a própria foto e capa (viu %)', n; end if;
  select count(*) into n from public.subscriptions;
  if n <> 1 then raise exception 'FALHOU: A deveria ver a própria assinatura (viu %)', n; end if;
  ok := ok + 5;
  update pg_temp._checks set total = total + ok;
end $$;

-- ========== Explorar (T20–T21): perfil público, seguir, bloquear e denunciar ==========
-- Os dois terminam o cadastro, com a mesma área e objetivo. Ninguém está público ainda.
reset role;
update public.profiles set onboarding_done = true, area = 'vendas', goal = 'estagio'
where id in ('00000000-0000-4000-a000-00000000000a', '00000000-0000-4000-a000-00000000000b');
-- Foto antiga de A (não é mais a atual): deve continuar fechada mesmo com o perfil público.
insert into storage.objects (bucket_id, name, owner)
values ('avatars', '00000000-0000-4000-a000-00000000000a/avatar-0.jpg', '00000000-0000-4000-a000-00000000000a');

-- ---------- Como B, com A ainda privado ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000b","role":"authenticated"}', true);

do $$
declare
  a constant uuid := '00000000-0000-4000-a000-00000000000a';
  b constant uuid := '00000000-0000-4000-a000-00000000000b';
  n int;
  ok int := 0;
begin
  -- Privado aparece só com o básico: nome e @ sim; título, área e competências não.
  select count(*) into n from public.explore_profiles() e
  where e.id = a and not e.is_public and e.headline is null and e.area is null and e.skills = '[]'::jsonb;
  if n <> 1 then raise exception 'FALHOU: perfil privado de A deveria aparecer só com o básico'; end if;
  select count(*) into n from public.explore_profiles(p_query => 'EMPATIA') where id = a;
  if n <> 0 then raise exception 'FALHOU: busca por competência achou o perfil privado de A'; end if;
  select count(*) into n from public.explore_profiles(p_areas => array['vendas']) where id = a;
  if n <> 0 then raise exception 'FALHOU: filtro de área achou o perfil privado de A'; end if;
  select count(*) into n from public.similar_profiles() where id = a;
  if n <> 0 then raise exception 'FALHOU: perfil privado de A apareceu em "objetivos parecidos"'; end if;
  select count(*) into n from public.public_profile(a) pp
  where pp.name = 'Pessoa A' and pp.bio is null and pp.experiences = '[]'::jsonb and not pp.linkedin_done and not pp.is_public;
  if n <> 1 then raise exception 'FALHOU: perfil privado de A abriu além do básico'; end if;
  select count(*) into n from storage.objects where name in (a::text || '/avatar-1.jpg', a::text || '/cover-1.jpg');
  if n <> 2 then raise exception 'FALHOU: B deveria ver foto e capa atuais de A privado (viu %)', n; end if;
  ok := ok + 6;

  -- Seguir um privado vira solicitação (não segue ainda).
  if public.follow_user(a) is distinct from 'requested' then raise exception 'FALHOU: seguir privado deveria virar solicitação'; end if;
  select count(*) into n from public.follows;
  if n <> 0 then raise exception 'FALHOU: B passou a seguir A sem aceite'; end if;
  select count(*) into n from public.follow_requests where requester_id = b and target_id = a;
  if n <> 1 then raise exception 'FALHOU: solicitação de B para A não foi criada'; end if;
  select count(*) into n from public.public_profile(a) pp where pp.requested;
  if n <> 1 then raise exception 'FALHOU: perfil de A deveria mostrar "Solicitado"'; end if;
  if public.follow_request_count() <> 0 then raise exception 'FALHOU: B viu solicitações que não são dele'; end if;
  -- Responder por outra pessoa não faz nada.
  perform public.respond_follow_request(a, true);
  select count(*) into n from public.follows;
  if n <> 0 then raise exception 'FALHOU: B aceitou a própria solicitação'; end if;
  begin
    insert into public.follow_requests (requester_id, target_id) values (a, b);
    raise exception 'FALHOU: B gravou direto em follow_requests';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 7;

  -- B liga o próprio "Aparecer no Explorar", mas não o de A.
  update public.profiles set is_public = true where id = b;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALHOU: B não conseguiu ficar público'; end if;
  update public.profiles set is_public = true where id = a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: B tornou o perfil de A público'; end if;
  ok := ok + 2;

  -- Tabelas novas: nada de gravar direto (só pelas funções) e denúncias fechadas.
  begin
    insert into public.follows (follower_id, followed_id) values (a, b);
    raise exception 'FALHOU: B gravou direto em follows';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.blocks (blocker_id, blocked_id) values (a, b);
    raise exception 'FALHOU: B gravou direto em blocks';
  exception when insufficient_privilege then null;
  end;
  begin
    execute 'select count(*) from public.reports';
    raise exception 'FALHOU: B leu a tabela de denúncias';
  exception when insufficient_privilege then null;
  end;
  ok := ok + 3;

  update pg_temp._checks set total = total + ok;
end $$;

-- ---------- Como A: vê a solicitação de B e aceita ----------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

do $$
declare
  b constant uuid := '00000000-0000-4000-a000-00000000000b';
  n int;
  ok int := 0;
begin
  if public.follow_request_count() <> 1 then raise exception 'FALHOU: A deveria ter 1 solicitação'; end if;
  select count(*) into n from public.follow_requests_list() r where r.id = b;
  if n <> 1 then raise exception 'FALHOU: B deveria aparecer nas solicitações de A'; end if;
  perform public.respond_follow_request(b, true);
  if public.follow_request_count() <> 0 then raise exception 'FALHOU: solicitação aceita continuou pendente'; end if;
  select count(*) into n from public.follow_list(auth.uid(), 'followers') l where l.id = b;
  if n <> 1 then raise exception 'FALHOU: B deveria virar seguidor de A ao aceitar'; end if;
  ok := ok + 4;
  update pg_temp._checks set total = total + ok;
end $$;

-- Como B: seguindo A (aceito), vê o perfil completo mesmo com A privado.
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000b","role":"authenticated"}', true);

do $$
declare
  n int;
begin
  select count(*) into n from public.public_profile('00000000-0000-4000-a000-00000000000a') pp
  where pp.bio = 'Bio secreta de A' and pp.is_following and not pp.requested;
  if n <> 1 then raise exception 'FALHOU: seguidor aceito deveria ver o perfil completo de A'; end if;
  update pg_temp._checks set total = total + 1;
end $$;

-- A liga "Perfil público".
reset role;
update public.profiles set is_public = true where id = '00000000-0000-4000-a000-00000000000a';

-- ---------- Como B, com A público ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000b","role":"authenticated"}', true);

do $$
declare
  a constant uuid := '00000000-0000-4000-a000-00000000000a';
  b constant uuid := '00000000-0000-4000-a000-00000000000b';
  n int;
  pp record;
  ok int := 0;
begin
  select count(*) into n from public.explore_profiles(p_query => 'EMPATIA') where id = a;
  if n <> 1 then raise exception 'FALHOU: busca por competência não achou A'; end if;
  select count(*) into n from public.explore_profiles() where id = b;
  if n <> 0 then raise exception 'FALHOU: B apareceu no próprio Explorar'; end if;
  select count(*) into n from public.similar_profiles() where id = a;
  if n <> 1 then raise exception 'FALHOU: A deveria aparecer em "objetivos parecidos"'; end if;
  -- Sem cidade no próprio perfil, "Perto de mim" não mostra ninguém.
  select count(*) into n from public.explore_profiles(p_near => true);
  if n <> 0 then raise exception 'FALHOU: "Perto de mim" sem cidade mostrou perfis'; end if;
  ok := ok + 4;

  -- Público só pelas funções: a tabela profiles continua fechada.
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FALHOU: B leu a linha de A direto em profiles'; end if;
  select * into pp from public.public_profile(a);
  if pp.name is distinct from 'Pessoa A' or not pp.linkedin_done then
    raise exception 'FALHOU: perfil público de A veio errado';
  end if;
  ok := ok + 2;

  -- Fotos: a atual e a capa abrem; a antiga e o PDF do LinkedIn não.
  select count(*) into n from storage.objects where name in (a::text || '/avatar-1.jpg', a::text || '/cover-1.jpg');
  if n <> 2 then raise exception 'FALHOU: B deveria ver foto e capa atuais de A (viu %)', n; end if;
  select count(*) into n from storage.objects where name = a::text || '/avatar-0.jpg';
  if n <> 0 then raise exception 'FALHOU: B viu uma foto antiga de A'; end if;
  select count(*) into n from storage.objects where bucket_id = 'linkedin-uploads' and name like a::text || '/%';
  if n <> 0 then raise exception 'FALHOU: B viu o PDF do LinkedIn de A'; end if;
  ok := ok + 3;

  -- Seguir.
  perform public.follow_user(a);
  perform public.follow_user(a); -- repetir não duplica
  select count(*) into n from public.follows;
  if n <> 1 then raise exception 'FALHOU: B deveria ter 1 linha em follows (tem %)', n; end if;
  select * into pp from public.public_profile(a);
  if pp.followers <> 1 or not pp.is_following then raise exception 'FALHOU: contagem de seguidores errada'; end if;
  begin
    perform public.follow_user(b);
    raise exception 'FALHOU: B seguiu a si mesmo';
  exception when sqlstate 'P0002' then null;
  end;
  ok := ok + 3;

  -- Seguidores: números e listas.
  select count(*) into n from public.follow_counts(a) c where c.followers = 1 and c.following = 0;
  if n <> 1 then raise exception 'FALHOU: follow_counts de A errado'; end if;
  select count(*) into n from public.follow_counts(b) c where c.following = 1;
  if n <> 1 then raise exception 'FALHOU: B deveria ver que segue 1 perfil'; end if;
  select count(*) into n from public.follow_list(a, 'followers') l where l.id = b;
  if n <> 1 then raise exception 'FALHOU: B deveria aparecer nos seguidores de A'; end if;
  select count(*) into n from public.follow_list(b, 'following') l where l.id = a and l.is_following;
  if n <> 1 then raise exception 'FALHOU: A deveria aparecer em "seguindo" de B'; end if;
  begin
    perform * from public.follow_list(a, 'amigos');
    raise exception 'FALHOU: follow_list aceitou tipo inválido';
  exception when sqlstate '22023' then null;
  end;
  ok := ok + 5;

  -- Denunciar.
  perform public.report_user(a, 'golpe', '  detalhe  ');
  perform public.report_user(a, 'assedio'); -- mesma pessoa em 24h não duplica
  begin
    perform public.report_user(a, 'motivo_inventado');
    raise exception 'FALHOU: denúncia com motivo inválido';
  exception when sqlstate '22023' then null;
  end;
  begin
    perform public.report_user(b, 'golpe');
    raise exception 'FALHOU: B denunciou a si mesmo';
  exception when sqlstate 'P0002' then null;
  end;
  ok := ok + 2;

  -- @ (nome de usuário): A ganhou "pessoa.a" pelo nome; B acha A pelo @.
  select * into pp from public.public_profile(a);
  if pp.username is distinct from 'pessoa.a' then raise exception 'FALHOU: @ de A deveria ser pessoa.a (veio %)', pp.username; end if;
  select count(*) into n from public.explore_profiles(p_query => '@Pessoa.A') where id = a;
  if n <> 1 then raise exception 'FALHOU: busca por @ exato não achou A'; end if;
  select count(*) into n from public.explore_profiles(p_query => '@pess') where id = a;
  if n <> 1 then raise exception 'FALHOU: busca pelo começo do @ não achou A'; end if;
  select count(*) into n from public.explore_profiles(p_query => '@a') where id = a;
  if n <> 0 then raise exception 'FALHOU: "@a" achou A (@ deve bater pelo começo)'; end if;
  if public.username_available('pessoa.a') then raise exception 'FALHOU: @ de A apareceu como livre'; end if;
  if not public.username_available('livre.b') then raise exception 'FALHOU: @ livre apareceu como usado'; end if;
  if public.username_available('admin') then raise exception 'FALHOU: @ reservado apareceu como livre'; end if;
  begin
    update public.profiles set username = 'pessoa.a' where id = b;
    raise exception 'FALHOU: B pegou o @ de A';
  exception when unique_violation then null;
  end;
  begin
    update public.profiles set username = 'admin' where id = b;
    raise exception 'FALHOU: B usou um @ reservado';
  exception when check_violation then null;
  end;
  begin
    update public.profiles set username = 'Com Espaço' where id = b;
    raise exception 'FALHOU: B salvou @ fora do formato';
  exception when check_violation then null;
  end;
  update public.profiles set username = 'livre.b' where id = b;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALHOU: B não conseguiu trocar o próprio @'; end if;
  ok := ok + 11;

  -- Bloquear: A some para B e o seguir é desfeito.
  perform public.block_user(a);
  select count(*) into n from public.explore_profiles() where id = a;
  if n <> 0 then raise exception 'FALHOU: A bloqueado continuou no Explorar'; end if;
  select count(*) into n from public.public_profile(a);
  if n <> 0 then raise exception 'FALHOU: B abriu o perfil de quem bloqueou'; end if;
  select count(*) into n from public.follows;
  if n <> 0 then raise exception 'FALHOU: bloquear não desfez o seguir'; end if;
  select count(*) into n from storage.objects where name like a::text || '/%';
  if n <> 0 then raise exception 'FALHOU: B viu fotos de A depois de bloquear'; end if;
  select count(*) into n from public.follow_requests;
  if n <> 0 then raise exception 'FALHOU: bloquear não apagou as solicitações'; end if;
  ok := ok + 5;

  update pg_temp._checks set total = total + ok;
end $$;

-- ---------- Como A: o bloqueio vale nos dois sentidos e é silencioso ----------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);

do $$
declare
  b constant uuid := '00000000-0000-4000-a000-00000000000b';
  n int;
  ok int := 0;
begin
  select count(*) into n from public.explore_profiles() where id = b;
  if n <> 0 then raise exception 'FALHOU: A viu no Explorar quem o bloqueou'; end if;
  select count(*) into n from public.public_profile(b);
  if n <> 0 then raise exception 'FALHOU: A abriu o perfil de quem o bloqueou'; end if;
  begin
    perform public.follow_user(b);
    raise exception 'FALHOU: A seguiu quem o bloqueou';
  exception when sqlstate 'P0002' then null;
  end;
  select count(*) into n from public.blocks;
  if n <> 0 then raise exception 'FALHOU: A viu o bloqueio feito por B'; end if;
  select count(*) into n from public.follow_counts(b);
  if n <> 0 then raise exception 'FALHOU: A viu os números de quem o bloqueou'; end if;
  begin
    perform * from public.follow_list(b, 'followers');
    raise exception 'FALHOU: A abriu a lista de seguidores de quem o bloqueou';
  exception when sqlstate 'P0002' then null;
  end;
  ok := ok + 6;
  update pg_temp._checks set total = total + ok;
end $$;

-- ---------- Sem login: nenhuma função do Explorar ----------
select set_config('request.jwt.claims', '{"role":"anon"}', true);
reset role;
set local role anon;

do $$
declare
  t text;
  ok int := 0;
begin
  foreach t in array array[
    'select * from public.explore_profiles()',
    'select * from public.similar_profiles()',
    'select * from public.public_profile(gen_random_uuid())',
    'select public.follow_user(gen_random_uuid())',
    'select public.report_user(gen_random_uuid(), ''golpe'')',
    'select public.username_available(''ana'')',
    'select * from public.follow_counts(gen_random_uuid())',
    'select * from public.follow_list(gen_random_uuid(), ''followers'')',
    'select public.follow_request_count()',
    'select * from public.follow_requests_list()',
    'select public.respond_follow_request(gen_random_uuid(), true)',
    'select count(*) from public.follow_requests',
    'select count(*) from public.follows',
    'select count(*) from public.reports'
  ] loop
    begin
      execute t;
      raise exception 'FALHOU: sem login rodou: %', t;
    exception when insufficient_privilege then null;
    end;
    ok := ok + 1;
  end loop;
  update pg_temp._checks set total = total + ok;
end $$;

-- ---------- Conferência como administrador: uma denúncia só, com foto do perfil e sem e-mail ----------
reset role;
do $$
declare
  n int;
begin
  select count(*) into n from public.reports
  where reporter_id = '00000000-0000-4000-a000-00000000000b'
    and reported_id = '00000000-0000-4000-a000-00000000000a'
    and reason = 'golpe' and detail = 'detalhe'
    and snapshot ->> 'name' = 'Pessoa A' and not snapshot ? 'email';
  if n <> 1 then raise exception 'FALHOU: denúncia deveria ser 1, com detalhe limpo e sem e-mail (achou %)', n; end if;
  update pg_temp._checks set total = total + 1;
end $$;

select 'RLS OK (' || total || ' verificações)' as resultado from pg_temp._checks;

rollback;
