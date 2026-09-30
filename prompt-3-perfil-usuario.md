Implemente a página de perfil do usuário do app, seguindo o design em `design/`.

## Contexto
- Leia primeiro `design/README.md`, `design/design-tokens.json` e as telas:
  - `design/telas/T18MeuPerfil.dc.html` (ver perfil)
  - `design/telas/T19EditarPerfil.dc.html` (editar perfil)
  - `design/telas/T15Perfil.dc.html` (aba Perfil: o item "Meu perfil" abre a T18)
- Esses arquivos são a referência visual (layout, textos, cores, espaçamentos, estados). Não copie o runtime `support.js` nem a sintaxe `{{ }}`, `<sc-if>`, `<sc-for>`: traduza para a stack do projeto.
- Antes de codar, veja como o projeto já está organizado (framework, rotas, componentes, tema, armazenamento de dados, autenticação) e reaproveite o que existir. Se algo necessário não existir, me diga o que pretende criar antes de criar.

## Modelo de dados do perfil
Crie (ou estenda) o perfil do usuário com estes campos:
- `fotoUrl` (opcional)
- `nome` (obrigatório, até 60 caracteres)
- `titulo` (até 120 caracteres)
- `cidade` (texto livre)
- `bio` (até 400 caracteres)
- `competencias`: lista de `{ nome, tipo: "comportamental" | "tecnica", destacada: boolean }` (máx. 15; sem duplicadas, comparando sem diferenciar maiúsculas)
- `objetivo`: "Jovem aprendiz" | "Estágio" | "Primeiro emprego" | "Novo emprego" (já vem do onboarding T4)
- `area`: a área escolhida no onboarding
- `disponibilidade`: lista entre "Manhã", "Tarde", "Noite", "Fim de semana"
- `formato`: "Presencial" | "Híbrido" | "Remoto"
- `experiencias`: lista de `{ titulo, local, inicio, fim ou "atual", descricao }`
- `formacoes`: lista de `{ curso, instituicao, status, ano }`
- `cursos`: lista de `{ nome, instituicao, ano }`
- `idiomas`: lista de `{ idioma, nivel: "Básico" | "Intermediário" | "Avançado" | "Fluente" | "Nativo" }`
- `links`: `{ linkedin, portfolio }`

## Tela T18 · Meu perfil
- Mostrar tudo como no design: capa, foto (ou iniciais quando não houver foto), nome, título, cidade, disponibilidade, "Perfil X% completo", Sobre mim, Competências (separadas por tipo), O que eu busco, Experiências, Formação, Idiomas, Links, Conquistas.
- Competências com `destacada = true` aparecem em menta com ícone de check e a legenda "Destacadas: bem avaliadas nas suas simulações". Por enquanto, marque como destacada a competência que aparecer nos pontos fortes ("O que foi bem") das simulações do usuário; se não houver simulações, nenhuma fica destacada.
- Seções vazias não somem: mostram uma frase curta e um botão de texto para adicionar (ex.: "Adicione seus idiomas").
- Cálculo de perfil completo (soma até 100): foto 10, título 10, cidade 5, bio com 80+ caracteres 15, 3+ competências 15, objetivo e disponibilidade 10, 1+ experiência 15, 1+ formação 10, 1+ idioma 5, LinkedIn 5. Abaixo da barra, mostrar o primeiro item que falta, em linguagem simples.
- "Editar" no topo e o botão "Editar perfil" no fim abrem a T19.
- Conquistas vêm das conquistas reais do app (primeira simulação, sequências, LinkedIn analisado).

## Tela T19 · Editar perfil
- Formulário com os campos acima, na ordem do design. Botão principal "Salvar alterações" fixo no rodapé; o X no topo sai sem salvar.
- Se houver mudanças não salvas e a pessoa tocar no X: bottom sheet "Sair sem salvar?" com "Continuar editando" (primário) e "Sair sem salvar" (texto).
- Foto: escolher da galeria ou câmera, recorte quadrado, comprimir para no máximo ~300 KB e 512×512 antes de enviar; opção "Remover foto". Mostrar skeleton enquanto envia e toast de erro se falhar.
- Título e bio com contador de caracteres, como no design.
- Botão "Me ajude a escrever" na bio: chama a IA do app com nome, idade, objetivo, área, experiências e formação, e pede uma bio de 3 frases em primeira pessoa, tom simples e sem exageros ("proativo", "dinâmico" etc. são proibidos), até 400 caracteres. A sugestão substitui o texto só depois que a pessoa confirmar ("Usar esta sugestão" / "Manter o meu"). Durante a geração, botão em estado carregando.
- Competências: chips removíveis (X com `aria-label="Remover <nome>"`), campo para adicionar, e até 4 sugestões conforme a área (use uma lista fixa por área, em um arquivo de dados separado). Ao adicionar, perguntar o tipo só se não for óbvio; padrão "comportamental".
- Objetivo: escolha única. Disponibilidade: múltipla.
- Experiências, formações, cursos e idiomas: tocar num item abre um bottom sheet de edição com "Salvar" e "Excluir"; "+ Adicionar" abre o mesmo sheet vazio.
- Validação com mensagens gentis abaixo do campo: nome vazio ("Como podemos te chamar?"), link inválido ("Esse link não parece certo"), limite de caracteres.
- Ao salvar: toast menta "Perfil atualizado" e volta para a T18.
- Aviso de privacidade no fim, igual ao design: o perfil é privado e serve só para personalizar treinos e dicas.

## Integração com o resto do app
- T15: o item "Meu perfil" mostra "Foto, bio, competências e mais · X% completo" e abre a T18. O avatar do topo da T15 usa a mesma foto/iniciais.
- Use o perfil para personalizar: a área e o objetivo pré-selecionam a T6 (Nova simulação), e a análise do LinkedIn (T11) pode usar título, bio e competências como contexto.
- Sem internet: a edição é salva localmente e sincroniza quando a conexão voltar, com a faixa "Você está sem conexão".

## Qualidade
- Seguir tokens, componentes e regras do design (uma ação principal por tela, toque mínimo 48px, contraste AA, fonte do sistema a 130% sem quebrar layout, rótulos para leitor de tela, respeitar "reduzir movimento").
- Modo escuro funcionando nas duas telas usando os tokens `dark`.
- Escrever testes para: cálculo de perfil completo, validação dos campos, adicionar/remover competência sem duplicar, e descartar alterações.
- Não guardar dados sensíveis além do necessário. A foto e o perfil só podem ser lidos pelo próprio usuário.

## Como trabalhar
1. Me mostre um plano curto (arquivos que vai criar ou mudar) antes de começar.
2. Implemente primeiro o modelo de dados e a T18 com dados de exemplo; depois a T19; por último as integrações.
3. Ao terminar, rode os testes e me diga como abrir as telas para eu conferir.
