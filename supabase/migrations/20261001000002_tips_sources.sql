-- Fase 6 (ajuste): fontes no fim de cada dica + textos revisados com base nelas.
--
-- Novo bloco no body: {"type":"sources","items":[{"title":"…","url":"https://…"}]}.
-- O app mostra como "Fontes" no fim da leitura (links abrem no navegador).
-- Pesquisa feita em 28/09/2026. Se um link sair do ar, troque aqui ou no Table Editor.

-- ===== Textos reescritos (ficaram mais precisos com as fontes) =====

update public.tips set body = $j$[
  {"type":"p","text":"Ficar nervoso(a) antes de uma entrevista é normal: a ansiedade costuma aparecer antes de qualquer evento importante. O segredo não é fazer o nervosismo sumir, e sim chegar preparado(a)."},
  {"type":"h","text":"Na véspera"},
  {"type":"list","items":["Leia a vaga de novo e pesquise um pouco sobre a empresa.","Faça uma entrevista-treino com um amigo ou alguém da família (ou aqui no app).","Separe a roupa, confira o endereço ou o link e durma bem."]},
  {"type":"h","text":"Na hora"},
  {"type":"list","items":["Chegue com antecedência: pontualidade conta, na entrevista presencial e na online.","Preste atenção na respiração e fale sem pressa, com pequenas pausas entre as frases.","Se der branco, diga “deixa eu pensar um pouco”. Está tudo bem pedir um tempo."]},
  {"type":"example","title":"Exemplo","text":"“Desculpa, fiquei um pouco nervoso(a). Posso começar de novo?” Quem entrevista entende. Ser sincero(a) passa confiança."},
  {"type":"p","text":"Se a ansiedade estiver atrapalhando muito o seu dia a dia, vale procurar ajuda de um profissional de saúde."},
  {"type":"sources","items":[
    {"title":"Senac Maranhão: Entrevista de emprego, como controlar a ansiedade?","url":"https://ma.senac.br/entrevista-de-emprego-como-controlar-a-ansiedade/"},
    {"title":"CIEE: Dicas para se destacar em uma entrevista de estágio","url":"https://portal.ciee.org.br/universo-ciee/dicas-para-entrevista-de-estagio/"}
  ]}
]$j$::jsonb
where slug = 'nervosismo-antes-da-entrevista';

update public.tips set body = $j$[
  {"type":"p","text":"Jovem aprendiz é um programa do governo (Aprendizagem Profissional) em que a pessoa trabalha em uma empresa e, ao mesmo tempo, faz um curso de formação profissional."},
  {"type":"h","text":"Como funciona, segundo o governo"},
  {"type":"list","items":["**Idade:** de 14 a 24 anos. Para pessoas com deficiência, não há limite de idade.","**Contrato:** com registro na carteira de trabalho, de no máximo 2 anos.","**Jornada:** até 6 horas por dia. Quem já terminou o ensino fundamental pode ter até 8 horas.","**Curso:** feito em uma instituição qualificada, como as do Sistema S (Senai, Senac e outras), escolas técnicas ou entidades sem fins lucrativos registradas.","**Direitos:** salário, vale-transporte, 13º salário, férias e FGTS."]},
  {"type":"h","text":"Onde procurar vagas"},
  {"type":"p","text":"Muitas empresas grandes têm programas próprios. Instituições como o CIEE também fazem a ponte entre jovens e empresas."},
  {"type":"warning","text":"As regras são definidas por lei e podem mudar. Confira as informações atuais no site do Ministério do Trabalho (gov.br) ou com o RH da empresa antes de decidir."},
  {"type":"sources","items":[
    {"title":"Ministério do Trabalho e Emprego: Aprendizagem Profissional","url":"https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/aprendizagem-profissional"},
    {"title":"Agência Brasil: como funciona o programa Jovem Aprendiz","url":"https://agenciabrasil.ebc.com.br/educacao/noticia/2021-10/agencia-brasil-explica-como-funciona-o-programa-jovem-aprendiz"}
  ]}
]$j$::jsonb
where slug = 'jovem-aprendiz-como-funciona';

update public.tips set body = $j$[
  {"type":"p","text":"Falar de dinheiro dá vergonha em muita gente, mas é uma parte normal do processo. Com preparo, fica mais fácil."},
  {"type":"h","text":"Antes da entrevista"},
  {"type":"list","items":["Veja se a vaga já informa o salário.","Pesquise quanto costumam pagar para a mesma função no seu estado. O **Salariômetro da Fipe** é gratuito e mostra o salário médio de admissão por cargo.","Some os custos que o trabalho vai gerar, como transporte e alimentação."]},
  {"type":"h","text":"Se perguntarem quanto você quer ganhar"},
  {"type":"p","text":"Responda com uma faixa baseada na sua pesquisa, e não com um número só. Se ainda for cedo no processo, tudo bem dizer que quer entender melhor a vaga primeiro."},
  {"type":"example","title":"Exemplo","text":"“Pesquisei e vi que para essa função costuma ser entre [valor] e [valor]. Estou aberto(a) a conversar, principalmente por ser meu primeiro emprego.”"},
  {"type":"p","text":"Pergunte também sobre os benefícios, como vale-transporte e vale-refeição. Eles fazem diferença no fim do mês."},
  {"type":"warning","text":"Os valores mudam por região, empresa e época. Use a sua pesquisa como referência, não como regra."},
  {"type":"sources","items":[
    {"title":"Fipe: Salariômetro (pesquisa salarial por cargo)","url":"https://salariometro.fipe.org.br/pesquisa-salarial"},
    {"title":"George Mason University Career Services: Salary Negotiation (em inglês)","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
  ]}
]$j$::jsonb
where slug = 'falar-de-salario';

update public.tips set body = $j$[
  {"type":"p","text":"Procurar o primeiro emprego pode parecer difícil, mas dá para organizar a busca em passos pequenos."},
  {"type":"list","ordered":true,"items":["**Escolha 1 ou 2 áreas** para focar (ex.: atendimento e vendas).","**Monte o currículo** e o perfil no LinkedIn.","**Procure vagas** em sites de emprego, no LinkedIn, em programas de estágio e jovem aprendiz, e em lojas e empresas do seu bairro.","**Treine a entrevista** antes de ser chamado(a).","**Anote** onde você se candidatou, para acompanhar."]},
  {"type":"example","title":"Dica","text":"Candidatar-se a poucas vagas com cuidado costuma dar mais resultado do que mandar o mesmo currículo para centenas."},
  {"type":"warning","text":"Não pague taxa de inscrição, exame ou curso para participar de um processo seletivo, e não mande documentos ou dados do banco sem ter certeza de que a empresa existe. Pedido de dinheiro é sinal de golpe (alerta da Febraban)."},
  {"type":"sources","items":[
    {"title":"Agência Brasil: Febraban alerta para golpe do falso emprego (maio de 2026)","url":"https://agenciabrasil.ebc.com.br/geral/noticia/2026-05/febraban-alerta-para-golpe-do-falso-emprego"},
    {"title":"Ministério do Trabalho e Emprego: Aprendizagem Profissional","url":"https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/aprendizagem-profissional"}
  ]}
]$j$::jsonb
where slug = 'sem-experiencia-comece-por-aqui';

update public.tips set body = $j$[
  {"type":"p","text":"Perguntas como “conte uma vez em que você resolveu um problema” pedem uma história real. Um jeito simples de organizar a resposta é o método STAR, usado por centros de carreira de universidades."},
  {"type":"list","ordered":true,"items":["**Situação:** onde você estava e o que estava acontecendo. Sem detalhes demais.","**Tarefa:** qual era o seu papel ou objetivo.","**Ação:** o que VOCÊ fez. Essa é a maior parte da resposta: fale “eu”, não “nós”.","**Resultado:** o que mudou depois e o que você aprendeu. Se puder, diga um número."]},
  {"type":"example","title":"Exemplo","text":"“No trabalho em grupo da escola, duas pessoas pararam de responder (situação) e eu era responsável pela entrega (tarefa). Dividi as tarefas de novo e criei um grupo com prazos (ação). Entregamos no dia e tiramos 9 (resultado).”"},
  {"type":"p","text":"Não tem experiência de trabalho? Exemplos da escola, de projetos e de voluntariado valem do mesmo jeito."},
  {"type":"warning","text":"Não invente histórias. Quem entrevista costuma fazer perguntas sobre os detalhes, e a resposta pode não bater com o seu currículo."},
  {"type":"sources","items":[
    {"title":"MIT Career Advising: Using the STAR method (em inglês)","url":"https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"}
  ]}
]$j$::jsonb
where slug = 'conte-uma-historia';

-- ===== Só a fonte no fim (o texto já batia com as fontes) =====

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"CIEE: Dicas para se destacar em uma entrevista de estágio","url":"https://portal.ciee.org.br/universo-ciee/dicas-para-entrevista-de-estagio/"}
]}]$j$::jsonb
where slug = 'como-responder-fale-sobre-voce';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"Na Prática: pontos fortes e fracos na entrevista","url":"https://napratica.org.br/noticias/pontos-fortes-e-fracos-entrevista"}
]}]$j$::jsonb
where slug = 'pontos-fortes-e-fracos';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"MIT Career Advising: Questions to ask an interviewer (em inglês)","url":"https://capd.mit.edu/resources/questions-to-ask-interviewer/"},
  {"title":"George Mason University Career Services: Salary Negotiation (em inglês)","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
]}]$j$::jsonb
where slug = 'perguntas-para-fazer-no-fim';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"Exame: como fazer um currículo para primeiro emprego","url":"https://exame.com/carreira/guia-de-carreira/como-fazer-um-curriculo-para-primeiro-emprego/"}
]}]$j$::jsonb
where slug = 'curriculo-sem-experiencia';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"Harvard Career Services: Create a strong resume (em inglês)","url":"https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/"},
  {"title":"Exame: como fazer um currículo para primeiro emprego","url":"https://exame.com/carreira/guia-de-carreira/como-fazer-um-curriculo-para-primeiro-emprego/"}
]}]$j$::jsonb
where slug = 'curriculo-de-uma-pagina';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"Ajuda do LinkedIn: editar seu título profissional","url":"https://www.linkedin.com/help/linkedin/answer/a542926?lang=pt"}
]}]$j$::jsonb
where slug = 'titulo-do-linkedin';

update public.tips set body = body || $j$[{"type":"sources","items":[
  {"title":"LinkedIn Talent Blog: 10 tips for a professional profile photo (em inglês)","url":"https://www.linkedin.com/business/talent/blog/product-tips/tips-for-taking-professional-linkedin-profile-pictures"}
]}]$j$::jsonb
where slug = 'foto-de-perfil-no-linkedin';
