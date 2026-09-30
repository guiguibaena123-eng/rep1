-- Fase 6 (ajuste 2): filtro "Para você" e plano grátis com 20% das dicas.
--
-- 1) Cada dica ganha marcações de perfil, comparadas com o que a pessoa respondeu no cadastro (T4):
--    goals       objetivos (jovem_aprendiz, estagio, primeiro_emprego, novo_emprego)
--    areas       áreas (atendimento, vendas, administrativo, tecnologia, marketing, logistica, saude)
--    for_nervous serve para quem marcou que fica muito nervoso(a) em entrevistas
--    Lista vazia = dica geral (não entra no "Para você" por esse critério).
-- 2) 9 dicas novas (7 por área e 2 por objetivo), com fontes.
-- 3) Plano grátis: 20% das dicas (4 de 21). As outras ficam Premium.
--    Ao criar dicas novas, mantenha a conta: gratuitas <= 20% do total (consulta no README).

alter table public.tips
  add column goals text[] not null default '{}'
    check (goals <@ array['jovem_aprendiz', 'estagio', 'primeiro_emprego', 'novo_emprego']),
  add column areas text[] not null default '{}'
    check (areas <@ array['atendimento', 'vendas', 'administrativo', 'tecnologia', 'marketing', 'logistica', 'saude', 'outra']),
  add column for_nervous bool not null default false;

grant select (goals, areas, for_nervous) on public.tips to authenticated;

-- ---------- Marcações das dicas que já existem ----------
update public.tips set for_nervous = true where slug in ('nervosismo-antes-da-entrevista', 'como-responder-fale-sobre-voce');
update public.tips set goals = '{jovem_aprendiz}' where slug = 'jovem-aprendiz-como-funciona';
update public.tips set goals = '{jovem_aprendiz,estagio,primeiro_emprego}' where slug in ('sem-experiencia-comece-por-aqui', 'curriculo-sem-experiencia');
update public.tips set goals = '{primeiro_emprego,novo_emprego}' where slug = 'falar-de-salario';
update public.tips set goals = '{primeiro_emprego}' where slug = 'conte-uma-historia';
update public.tips set goals = '{estagio,novo_emprego}' where slug = 'titulo-do-linkedin';
update public.tips set goals = '{novo_emprego}' where slug in ('pontos-fortes-e-fracos', 'perguntas-para-fazer-no-fim');

-- ---------- Dicas novas ----------
insert into public.tips (slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, body) values

(
  'estagio-como-funciona',
  'Estágio: o que é e como funciona',
  'direitos', 3, true,
  (select id from public.tracks where slug = 'primeiro-emprego'), 4,
  '{estagio}', '{}',
  $j$[
    {"type":"p","text":"O estágio é um ato educativo: você aprende a profissão na prática enquanto estuda. Ele é regido pela Lei do Estágio (Lei nº 11.788/2008) e não é um emprego com carteira assinada."},
    {"type":"h","text":"O básico da lei"},
    {"type":"list","items":["**Quem pode:** estudante matriculado(a) e frequentando a escola, o curso técnico ou a faculdade.","**Contrato:** um Termo de Compromisso assinado por você, pela escola e pela empresa.","**Jornada:** em geral, até 6 horas por dia e 30 por semana (ensino médio, técnico e superior).","**Bolsa:** no estágio não obrigatório, a empresa paga uma bolsa-auxílio.","**Recesso:** 30 dias a cada 12 meses de estágio (ou proporcional).","**Duração:** até 2 anos na mesma empresa."]},
    {"type":"example","title":"Dica","text":"Agentes de integração como o CIEE divulgam vagas de estágio e ajudam com o Termo de Compromisso."},
    {"type":"warning","text":"Há exceções (estágio obrigatório, educação especial, períodos de prova). Confira o texto da lei ou pergunte ao setor de estágio da sua escola."},
    {"type":"sources","items":[
      {"title":"Planalto: Lei nº 11.788/2008 (Lei do Estágio)","url":"https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm"},
      {"title":"CIEE: Lei do Estágio, tudo o que você precisa saber","url":"https://portal.ciee.org.br/universo-ciee/lei-do-estagio/"}
    ]}
  ]$j$::jsonb
),
(
  'por-que-quer-mudar-de-emprego',
  'Como explicar por que você quer mudar de emprego',
  'entrevista', 2, true, null, null,
  '{novo_emprego}', '{}',
  $j$[
    {"type":"p","text":"Quem já trabalha quase sempre ouve: “por que você quer sair do seu emprego atual?”. A pessoa quer entender se você está buscando algo ou só fugindo de algo."},
    {"type":"list","ordered":true,"items":["**Fale do futuro:** o que você quer aprender ou fazer a mais.","**Ligue com a vaga:** mostre o que essa oportunidade tem que combina com isso.","**Seja honesto(a)**, sem entrar em detalhes pessoais."]},
    {"type":"example","title":"Exemplo","text":"“Aprendi muito no atendimento da loja, mas quero crescer para a área administrativa. Essa vaga junta as duas coisas.”"},
    {"type":"warning","text":"Não fale mal do chefe ou da empresa atual, mesmo que tenha motivo. Isso costuma pesar contra você."},
    {"type":"sources","items":[
      {"title":"Robert Half: how to answer “what are your reasons for leaving a job?” (em inglês)","url":"https://www.roberthalf.com/us/en/insights/landing-job/how-to-answer-what-is-your-reason-for-leaving-a-job"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-atendimento',
  'Vaga de atendimento: mostre que você sabe ouvir',
  'entrevista', 2, true, null, null,
  '{}', '{atendimento}',
  $j$[
    {"type":"p","text":"No atendimento, a empresa quer alguém que trate bem as pessoas, até nos momentos difíceis. Na entrevista, a forma como você conversa já é uma prova."},
    {"type":"h","text":"O que costuma contar"},
    {"type":"list","items":["**Ouvir antes de responder:** deixar a pessoa explicar tudo, sem interromper.","**Cordialidade:** cumprimentar, chamar pelo nome, usar “por favor”.","**Sinceridade:** se não sabe, dizer que vai verificar, em vez de inventar.","**Calma com cliente irritado.**"]},
    {"type":"example","title":"Pergunta comum","text":"“Como você lidaria com um cliente nervoso?” Responda com um passo a passo: ouvir, pedir desculpas pelo transtorno, entender o problema e dizer o que você vai fazer."},
    {"type":"sources","items":[
      {"title":"Sebrae: atendimento de qualidade, dicas para atender bem","url":"https://sebrae.com.br/sites/PortalSebrae/artigos/15-dicas-para-atender-bem,e565438af1c92410VgnVCM100000b272010aRCRD"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-vendas',
  'Vaga de vendas: ouvir vende mais do que falar',
  'entrevista', 2, true, null, null,
  '{}', '{vendas}',
  $j$[
    {"type":"p","text":"Muita gente acha que vendedor bom é quem fala muito. Na verdade, o que mais ajuda é entender o que o cliente precisa."},
    {"type":"h","text":"Mostre na entrevista"},
    {"type":"list","items":["**Escuta:** faça perguntas antes de oferecer algo.","**Empatia:** se colocar no lugar do cliente.","**Conhecer o produto:** pesquise o que a loja ou empresa vende antes da entrevista.","**Um exemplo real:** rifa da escola, venda de doces, bazar, loja da família."]},
    {"type":"example","title":"Pergunta comum","text":"“Me venda esta caneta.” Em vez de sair falando das qualidades, pergunte primeiro: “Para que você usa caneta no dia a dia?”. Depois ofereça a caneta como solução."},
    {"type":"sources","items":[
      {"title":"Sebrae: características do bom vendedor","url":"https://sebrae.com.br/sites/PortalSebrae/valorizeopequenonegocio/conteudos/confira-as-caracteristicas-do-bom-vendedor-e-saiba-como-vender-melhor,faa8d53342603410VgnVCM100000b272010aRCRD"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-administrativo',
  'Vaga administrativa: organização é o seu cartão de visita',
  'entrevista', 2, true, null, null,
  '{}', '{administrativo}',
  $j$[
    {"type":"p","text":"Quem trabalha no administrativo apoia vários setores da empresa: pessoas, finanças, compras, atendimento. Por isso, organização e comunicação clara pesam muito."},
    {"type":"h","text":"O que você pode mostrar"},
    {"type":"list","items":["**Organização:** como você controla prazos, tarefas ou documentos (agenda, lista, planilha).","**Ferramentas:** diga o que você realmente sabe de Excel, Word e e-mail.","**Atenção aos detalhes:** um exemplo em que você conferiu algo e evitou um erro.","**Postura no atendimento** a colegas e clientes."]},
    {"type":"example","title":"Exemplo","text":"“No grêmio da escola, eu controlava numa planilha o dinheiro da festa junina e fazia o relatório no fim.”"},
    {"type":"warning","text":"Se pedirem um teste de Excel, tudo bem dizer o que você ainda não sabe. Inventar aparece na hora."},
    {"type":"sources","items":[
      {"title":"Senac DF: Assistente Administrativo","url":"https://www.df.senac.br/curso/assistente-administrativo/"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-tecnologia',
  'Primeira vaga em tecnologia: mostre seus projetos',
  'entrevista', 3, true, null, null,
  '{}', '{tecnologia}',
  $j$[
    {"type":"p","text":"Em tecnologia, projetos falam mais alto que diploma. Mesmo projetos pequenos, de curso ou pessoais, mostram o que você sabe fazer."},
    {"type":"h","text":"Monte sua vitrine no GitHub"},
    {"type":"list","ordered":true,"items":["**Escreva um README de perfil:** quem você é, o que estuda e as tecnologias que conhece.","**Fixe de 3 a 5 projetos** no perfil, os que mais combinam com a vaga.","**Explique cada projeto:** o que ele faz, como rodar e, se tiver, um link para testar."]},
    {"type":"example","title":"Na entrevista","text":"Escolha um projeto e treine contar: o problema, o que você construiu, uma dificuldade e como resolveu."},
    {"type":"warning","text":"Se copiou parte de um tutorial, diga. Vão perguntar como o código funciona."},
    {"type":"sources","items":[
      {"title":"GitHub Docs: using your GitHub profile to enhance your resume (em inglês)","url":"https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-marketing',
  'Marketing: um portfólio mesmo sem experiência',
  'entrevista', 3, true, null, null,
  '{}', '{marketing}',
  $j$[
    {"type":"p","text":"No marketing, quem recruta quer ver o que você já criou. Dá para montar um portfólio antes do primeiro emprego."},
    {"type":"h","text":"O que colocar"},
    {"type":"list","items":["Trabalhos da escola ou de cursos.","Redes sociais que você cuidou (de um projeto, igreja, loja de alguém da família).","Trabalho voluntário.","**Resultados em números**, quando tiver: seguidores, curtidas, vendas."]},
    {"type":"h","text":"Como organizar"},
    {"type":"list","items":["Comece com os 2 melhores trabalhos.","Tenha uma parte “Sobre mim” curta.","Deixe seu contato fácil de achar."]},
    {"type":"warning","text":"Use só números que você consegue comprovar. Se não tiver números, conte o que fez e o que aprendeu."},
    {"type":"sources","items":[
      {"title":"Instituto Infnet: como fazer um portfólio de marketing digital","url":"https://blog.infnet.com.br/marketing-digital/como-fazer-um-portfolio-de-marketing-digital/"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-logistica',
  'Vaga de logística: atenção, rotina e segurança',
  'entrevista', 2, true, null, null,
  '{}', '{logistica}',
  $j$[
    {"type":"p","text":"Quem começa em logística costuma ajudar a receber, guardar, separar e enviar materiais e produtos. É um trabalho de rotina, em que um erro pequeno pode virar um problema grande."},
    {"type":"h","text":"O que mostrar"},
    {"type":"list","items":["**Atenção aos detalhes:** conferir quantidade, código e endereço.","**Organização:** saber onde cada coisa está.","**Segurança:** seguir as regras e usar os equipamentos de proteção.","**Disposição para aprender sistemas** e aplicativos de controle de estoque."]},
    {"type":"example","title":"Exemplo","text":"“Ajudei na arrecadação de alimentos da escola: separei por tipo, anotei as quantidades e montei as cestas.”"},
    {"type":"sources","items":[
      {"title":"SENAI-SP: Auxiliar Operacional de Logística","url":"https://www.sp.senai.br/curso/auxiliar-operacional-de-logistica/103238"}
    ]}
  ]$j$::jsonb
),
(
  'entrevista-para-saude',
  'Área da saúde: cuidado, ética e sigilo',
  'entrevista', 3, true, null, null,
  '{}', '{saude}',
  $j$[
    {"type":"p","text":"Na saúde, além do conhecimento técnico, conta muito a forma como você trata o paciente e as informações dele."},
    {"type":"h","text":"O que costuma contar"},
    {"type":"list","items":["**Respeito e dignidade:** tratar cada paciente com cuidado, sem julgamento.","**Sigilo:** o que você fica sabendo no trabalho não sai de lá.","**Honestidade:** dizer com sinceridade o que você já sabe fazer e o que ainda está aprendendo.","**Conhecer o lugar:** pesquise a história e os valores do hospital ou da clínica."]},
    {"type":"example","title":"Dica","text":"Se a vaga é de enfermagem, leia o Código de Ética dos Profissionais de Enfermagem. Ele pode aparecer em perguntas sobre situações difíceis."},
    {"type":"sources","items":[
      {"title":"Cofen: Resolução nº 564/2017 (Código de Ética dos Profissionais de Enfermagem)","url":"https://www.cofen.gov.br/resolucao-cofen-no-5642017/"}
    ]}
  ]$j$::jsonb
);

-- ---------- Plano grátis: 20% das dicas ----------
-- 4 de 21 (19%): a primeira dica de cada trilha + a mais clássica de entrevista.
update public.tips set is_premium = slug not in (
  'como-responder-fale-sobre-voce',
  'nervosismo-antes-da-entrevista',
  'curriculo-sem-experiencia',
  'sem-experiencia-comece-por-aqui'
)
where true;
