-- Fase 6: conteúdo inicial das dicas (12 dicas, 8 gratuitas, 3 trilhas).
--
-- Fica numa migration (e não em supabase/seed.sql) porque o `supabase db push`
-- só aplica migrations no projeto online. Para mudar um texto depois, edite no
-- Table Editor do Supabase (tabela tips, coluna body) ou crie uma migration nova.
--
-- ATENÇÃO: as dicas "jovem-aprendiz-como-funciona", "falar-de-salario" e
-- "sem-experiencia-comece-por-aqui" falam de direitos, salário e contratação.
-- Estão escritas de forma geral de propósito. Revisar com um profissional de RH
-- antes de publicar (lista no README).
--
-- Blocos do body: {"type":"p"}, {"type":"h"}, {"type":"list","ordered":true|false},
-- {"type":"example","title"}, {"type":"warning"}. **texto** vira negrito no app.

insert into public.tracks (slug, title, description, sort_order) values
  ('entrevista-sem-medo', 'Entrevista sem medo', 'Do nervosismo à última pergunta, passo a passo.', 1),
  ('curriculo-do-zero', 'Currículo do zero', 'Monte seu currículo e seu LinkedIn mesmo sem experiência.', 2),
  ('primeiro-emprego', 'Primeiro emprego', 'O que saber antes de começar a trabalhar.', 3);

insert into public.tips (slug, title, category, read_minutes, is_premium, track_id, track_order, body) values

-- ===== Trilha: Entrevista sem medo =====
(
  'nervosismo-antes-da-entrevista',
  'Nervoso(a)? Como se preparar no dia',
  'entrevista', 3, false,
  (select id from public.tracks where slug = 'entrevista-sem-medo'), 1,
  $j$[
    {"type":"p","text":"Ficar nervoso(a) antes de uma entrevista é normal. Quase todo mundo sente. O segredo não é fazer o nervosismo sumir, e sim chegar preparado(a)."},
    {"type":"h","text":"Na véspera"},
    {"type":"list","items":["Leia a vaga de novo e anote 2 coisas que combinam com você.","Separe a roupa e confira o endereço ou o link da entrevista.","Durma cedo. Cansaço aumenta a ansiedade."]},
    {"type":"h","text":"Na hora"},
    {"type":"list","items":["Chegue 10 minutos antes (ou entre na chamada 5 minutos antes).","Respire devagar: puxe o ar em 4 segundos e solte em 6.","Se der branco, diga “deixa eu pensar um pouco”. Está tudo bem pedir um tempo."]},
    {"type":"example","title":"Exemplo","text":"“Desculpa, fiquei um pouco nervoso(a). Posso começar de novo?” Quem entrevista entende. Ser sincero(a) passa confiança."},
    {"type":"p","text":"Treinar antes ajuda muito. Cada simulação deixa a próxima conversa mais leve."}
  ]$j$::jsonb
),
(
  'como-responder-fale-sobre-voce',
  'Como responder “fale sobre você”',
  'entrevista', 2, false,
  (select id from public.tracks where slug = 'entrevista-sem-medo'), 2,
  $j$[
    {"type":"p","text":"É quase sempre a primeira pergunta. Quem entrevista quer saber quem você é e por que combina com a vaga."},
    {"type":"p","text":"Não é hora de contar a vida toda. Uma resposta de 1 minuto já basta."},
    {"type":"h","text":"Use esta ordem"},
    {"type":"list","ordered":true,"items":["**Quem você é:** nome, idade e o que estuda ou faz.","**Um exemplo:** algo que você fez e que tem a ver com a vaga.","**O que você busca:** por que quer essa oportunidade."]},
    {"type":"example","title":"Exemplo","text":"“Sou a Ana, tenho 19 anos e faço técnico em Administração. Na feira da escola, cuidei do atendimento aos visitantes e gostei muito. Por isso quero começar em atendimento.”"},
    {"type":"warning","text":"Evite repetir o currículo item por item. A pessoa já leu. Conte o que não está no papel."},
    {"type":"p","text":"Treine em voz alta duas ou três vezes. Na hora, vai sair mais natural."}
  ]$j$::jsonb
),
(
  'conte-uma-historia',
  'Conte uma história: situação, ação e resultado',
  'entrevista', 3, false,
  (select id from public.tracks where slug = 'entrevista-sem-medo'), 3,
  $j$[
    {"type":"p","text":"Perguntas como “conte uma vez em que você resolveu um problema” pedem uma história real. Um jeito simples de organizar a resposta é em 3 partes."},
    {"type":"list","ordered":true,"items":["**Situação:** onde você estava e o que estava acontecendo.","**Ação:** o que VOCÊ fez (não o grupo).","**Resultado:** o que mudou depois. Se puder, diga um número."]},
    {"type":"example","title":"Exemplo","text":"“No trabalho em grupo da escola, duas pessoas pararam de responder (situação). Dividi as tarefas de novo e criei um grupo no WhatsApp com prazos (ação). Entregamos no dia e tiramos 9 (resultado).”"},
    {"type":"p","text":"Não tem experiência de trabalho? Use escola, curso, projeto, igreja, esporte, voluntariado ou ajuda em casa. Tudo isso conta."},
    {"type":"warning","text":"Não invente histórias. Quem entrevista costuma fazer perguntas sobre os detalhes, e fica fácil perceber."}
  ]$j$::jsonb
),
(
  'pontos-fortes-e-fracos',
  'Pontos fortes e fracos sem clichê',
  'entrevista', 3, true,
  (select id from public.tracks where slug = 'entrevista-sem-medo'), 4,
  $j$[
    {"type":"p","text":"“Qual é seu maior defeito?” assusta, mas é uma chance de mostrar que você se conhece e está evoluindo."},
    {"type":"h","text":"Ponto forte"},
    {"type":"p","text":"Escolha um que tenha a ver com a vaga e prove com um exemplo curto. “Sou organizado(a)” vale mais com “eu fazia a escala de limpeza da minha turma”."},
    {"type":"h","text":"Ponto fraco"},
    {"type":"list","ordered":true,"items":["Diga um ponto real, que não seja essencial para a vaga.","Conte o que você já está fazendo para melhorar.","Termine mostrando o avanço."]},
    {"type":"example","title":"Exemplo","text":"“Eu tinha vergonha de falar em público. Comecei a me oferecer para apresentar os trabalhos da escola e hoje já fico bem mais à vontade.”"},
    {"type":"warning","text":"Evite “sou perfeccionista” ou “trabalho demais”. Quem entrevista já ouviu muitas vezes e pode achar que você está fugindo da pergunta."}
  ]$j$::jsonb
),
(
  'perguntas-para-fazer-no-fim',
  'Perguntas para fazer no fim da entrevista',
  'entrevista', 2, true,
  (select id from public.tracks where slug = 'entrevista-sem-medo'), 5,
  $j$[
    {"type":"p","text":"No final, quase sempre perguntam: “Você tem alguma dúvida?”. Responder “não” perde uma boa chance de mostrar interesse."},
    {"type":"h","text":"Boas perguntas"},
    {"type":"list","items":["Como é um dia normal nessa função?","O que a pessoa nessa vaga precisa aprender primeiro?","Como vocês acompanham quem está começando?","Quais são os próximos passos do processo?"]},
    {"type":"example","title":"Dica","text":"Leve 2 perguntas anotadas. Se uma delas já foi respondida durante a conversa, use a outra."},
    {"type":"warning","text":"Deixe perguntas sobre salário e benefícios para quando a empresa tocar no assunto ou para a etapa final, se ninguém tiver falado."}
  ]$j$::jsonb
),

-- ===== Trilha: Currículo do zero =====
(
  'curriculo-sem-experiencia',
  'Currículo sem experiência: o que colocar',
  'curriculo', 3, false,
  (select id from public.tracks where slug = 'curriculo-do-zero'), 1,
  $j$[
    {"type":"p","text":"Todo mundo começa sem experiência. O currículo do primeiro emprego mostra o que você já sabe fazer e a vontade de aprender."},
    {"type":"h","text":"O que entra"},
    {"type":"list","items":["**Formação:** escola, série ou ano de conclusão e cursos técnicos.","**Cursos livres:** online e gratuitos também valem. Coloque o nome e a carga horária.","**Atividades:** voluntariado, projetos da escola, grêmio, esporte, trabalhos informais.","**Habilidades:** informática, idiomas (com o nível real), atendimento, organização."]},
    {"type":"example","title":"Exemplo","text":"“Voluntária na arrecadação de alimentos da escola (2025): organizei as doações e atendi as famílias.”"},
    {"type":"warning","text":"Não aumente o nível de inglês ou de informática. Algumas empresas testam na hora."}
  ]$j$::jsonb
),
(
  'curriculo-de-uma-pagina',
  'Currículo de uma página: o que colocar',
  'curriculo', 3, false,
  (select id from public.tracks where slug = 'curriculo-do-zero'), 2,
  $j$[
    {"type":"p","text":"Quem recruta costuma olhar um currículo por poucos segundos. Uma página bem organizada ajuda a pessoa a achar o que importa."},
    {"type":"h","text":"Nesta ordem"},
    {"type":"list","ordered":true,"items":["**Nome e contato:** telefone, e-mail e cidade. Não precisa de endereço completo nem documentos.","**Objetivo:** uma linha com a vaga que você quer.","**Formação e cursos.**","**Experiências e atividades:** do mais recente para o mais antigo.","**Habilidades.**"]},
    {"type":"warning","text":"Use um e-mail simples, com seu nome. Apelidos e piadas no e-mail passam má impressão."},
    {"type":"p","text":"Salve em PDF antes de enviar. Assim a formatação não muda no computador de quem recebe."}
  ]$j$::jsonb
),
(
  'titulo-do-linkedin',
  'Um título de LinkedIn que te ajuda a ser encontrado(a)',
  'linkedin', 2, false,
  (select id from public.tracks where slug = 'curriculo-do-zero'), 3,
  $j$[
    {"type":"p","text":"O título é a frase que aparece embaixo do seu nome. Recrutadores pesquisam por palavras, e o título é um dos lugares onde elas mais pesam."},
    {"type":"h","text":"Uma fórmula simples"},
    {"type":"p","text":"**O que você busca + o que você estuda ou sabe fazer.**"},
    {"type":"example","title":"Exemplos","text":"“Em busca do primeiro emprego em Atendimento | Técnico em Administração”\n“Estudante de Logística | Excel e organização de estoque”"},
    {"type":"warning","text":"Evite só “Estudante” ou “Desempregado(a)”. Diga o que você quer fazer."}
  ]$j$::jsonb
),
(
  'foto-de-perfil-no-linkedin',
  'Foto de perfil no LinkedIn: o básico',
  'linkedin', 2, false,
  (select id from public.tracks where slug = 'curriculo-do-zero'), 4,
  $j$[
    {"type":"p","text":"Perfis com foto costumam receber mais visitas. Não precisa de fotógrafo: o celular resolve."},
    {"type":"list","items":["Rosto aparecendo bem, olhando para a câmera.","Luz de frente (perto de uma janela funciona).","Fundo simples, sem bagunça.","Roupa parecida com a que você usaria na vaga."]},
    {"type":"warning","text":"Evite fotos de festa, com outras pessoas cortadas, de óculos escuros ou com filtro."}
  ]$j$::jsonb
),

-- ===== Trilha: Primeiro emprego =====
(
  'sem-experiencia-comece-por-aqui',
  'Sem experiência? Comece por aqui',
  'primeiro_emprego', 4, false,
  (select id from public.tracks where slug = 'primeiro-emprego'), 1,
  $j$[
    {"type":"p","text":"Procurar o primeiro emprego pode parecer difícil, mas dá para organizar a busca em passos pequenos."},
    {"type":"list","ordered":true,"items":["**Escolha 1 ou 2 áreas** para focar (ex.: atendimento e vendas).","**Monte o currículo** e o perfil no LinkedIn.","**Procure vagas** em sites de emprego, no LinkedIn, em programas de estágio e jovem aprendiz, e em lojas e empresas do seu bairro.","**Treine a entrevista** antes de ser chamado(a).","**Anote** onde você se candidatou, para acompanhar."]},
    {"type":"example","title":"Dica","text":"Candidatar-se a poucas vagas com cuidado costuma dar mais resultado do que mandar o mesmo currículo para centenas."},
    {"type":"warning","text":"Nenhuma empresa séria cobra para você participar de um processo seletivo. Se pedirem dinheiro, desconfie."}
  ]$j$::jsonb
),
(
  'jovem-aprendiz-como-funciona',
  'Jovem aprendiz: o que é e como funciona',
  'direitos', 3, true,
  (select id from public.tracks where slug = 'primeiro-emprego'), 2,
  $j$[
    {"type":"p","text":"Jovem aprendiz é um programa em que a pessoa trabalha em uma empresa e, ao mesmo tempo, faz um curso de formação profissional. A ideia é aprender uma profissão na prática."},
    {"type":"h","text":"Em geral"},
    {"type":"list","items":["É um contrato de trabalho com carteira assinada e prazo definido.","A jornada é reduzida, para caber junto com os estudos e o curso.","O curso costuma ser dado por uma instituição parceira da empresa.","Há regras de idade e de escolaridade para participar."]},
    {"type":"warning","text":"As regras (idade, jornada, salário e benefícios) são definidas por lei e podem mudar. Confira as informações atuais no site oficial do governo (gov.br) ou com o RH da empresa antes de decidir."},
    {"type":"p","text":"Para encontrar vagas, procure instituições de aprendizagem da sua cidade e sites de emprego com o filtro “jovem aprendiz”."}
  ]$j$::jsonb
),
(
  'falar-de-salario',
  'Como falar de salário sem medo',
  'salario', 3, true,
  (select id from public.tracks where slug = 'primeiro-emprego'), 3,
  $j$[
    {"type":"p","text":"Falar de dinheiro dá vergonha em muita gente, mas é uma parte normal do processo. Com preparo, fica mais fácil."},
    {"type":"h","text":"Antes da entrevista"},
    {"type":"list","items":["Veja se a vaga já informa o salário.","Pesquise quanto costumam pagar para a mesma função na sua cidade (sites de vagas e de salários ajudam).","Some os custos que o trabalho vai gerar, como transporte e alimentação."]},
    {"type":"h","text":"Se perguntarem quanto você quer ganhar"},
    {"type":"example","title":"Exemplo","text":"“Pesquisei e vi que para essa função costuma ser entre [valor] e [valor]. Estou aberto(a) a conversar, principalmente por ser meu primeiro emprego.”"},
    {"type":"p","text":"Pergunte também sobre os benefícios, como vale-transporte e vale-refeição. Eles fazem diferença no fim do mês."},
    {"type":"warning","text":"Os valores mudam por região, empresa e época. Use a sua pesquisa como referência, não como regra."}
  ]$j$::jsonb
);
