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

select 'RLS OK (' || total || ' verificações)' as resultado from pg_temp._checks;

rollback;
