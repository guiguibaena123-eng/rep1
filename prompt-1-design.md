# PROMPT 1 — DESIGN DO APP

> Como usar: cole tudo abaixo (a partir de "PAPEL") em uma ferramenta de design com IA (Claude Design, Figma com IA, Google Stitch, v0, Lovable etc.). Onde aparecer `[NOME DO APP]`, troque pelo nome que você escolher. Se a ferramenta limitar o tamanho, envie por partes: primeiro as seções 1 a 6 (fundamentos) e depois as telas, 3 ou 4 por vez.

---

## PAPEL

Você é um designer de produto sênior, especialista em aplicativos mobile para o público jovem brasileiro. Vai desenhar o app **[NOME DO APP]**, do zero, em português do Brasil, pensando primeiro no celular (iPhone e Android). O resultado precisa ser **minimalista, simples, prático e jovial**: qualquer pessoa de 16 a 28 anos deve abrir o app pela primeira vez e saber, em 3 segundos, onde está cada coisa e o que fazer.

## 1. CONTEXTO DO PRODUTO

[NOME DO APP] ajuda jovens a **conseguir o primeiro emprego (ou o próximo)** com menos ansiedade. Tem 4 pilares:

1. **Simulador de entrevista com IA:** a pessoa escolhe a área e o nível, responde a perguntas de entrevista escrevendo, e recebe um feedback gentil e prático.
2. **Análise de perfil do LinkedIn:** a pessoa envia o PDF do próprio perfil (ou cola os textos) e recebe um relatório com nota, o que melhorar e sugestões prontas de texto.
3. **Dicas do mercado de trabalho:** biblioteca de dicas curtas e práticas (currículo, entrevista, primeiro emprego, direitos, negociação).
4. **Progresso:** sequência de dias, evolução das notas e metas semanais.

Modelo de negócio: plano **gratuito** (1 simulação por semana, resumo do LinkedIn, algumas dicas) e plano **Premium** (simulações ilimitadas, relatório completo do LinkedIn, todas as dicas e trilhas).

## 2. PÚBLICO

Jovens de 16 a 28 anos, buscando estágio, jovem aprendiz, primeiro emprego ou recolocação. Muitos sentem **ansiedade e insegurança** com entrevistas. Usam o celular o dia todo, têm pouca paciência com telas cheias e desistem rápido de apps confusos. Boa parte usa celulares simples e internet instável.

## 3. PRINCÍPIOS DE DESIGN (siga todos)

1. **Uma ação principal por tela.** Sempre deve estar claro qual é o botão mais importante.
2. **Minimalismo com calor humano:** muito espaço em branco, poucos elementos, cantos arredondados, textos curtos. Nada de poluição visual.
3. **Calmo, não estressante.** O app lida com ansiedade: evite vermelho forte, contadores agressivos e linguagem de cobrança. Feedback sempre encorajador.
4. **Jovial sem ser infantil:** cores vivas com moderação, microanimações suaves, tom de voz próximo e leve. Sem gírias forçadas.
5. **Tudo ao alcance do polegar:** ações principais na metade de baixo da tela; navegação por barra inferior.
6. **Previsível:** os mesmos padrões em todas as telas (mesmo botão principal, mesmo cabeçalho, mesmos espaçamentos).
7. **Leve e rápido:** evitar imagens pesadas; preferir formas simples, ícones e tipografia.

## 4. SISTEMA DE DESIGN

### 4.1 Cores (modo claro)

| Uso | Nome | Hex |
|---|---|---|
| Cor primária (botões, destaques, aba ativa) | Índigo | `#5B5BD6` |
| Primária pressionada | Índigo escuro | `#4747B8` |
| Primária suave (fundos de destaque, chips) | Índigo 10% | `#EEEEFC` |
| Sucesso / evolução | Menta | `#2FBF8F` |
| Sucesso suave | Menta 12% | `#E3F7F0` |
| Atenção / destaque positivo (sequência de dias) | Âmbar | `#FFB84D` |
| Atenção suave | Âmbar 15% | `#FFF3DE` |
| Erro | Coral | `#E5484D` |
| Erro suave | Coral 10% | `#FDECEC` |
| Fundo do app | Névoa | `#F7F7FB` |
| Superfície (cards) | Branco | `#FFFFFF` |
| Borda | Cinza claro | `#E8E8F0` |
| Texto principal | Grafite | `#1B1B1F` |
| Texto secundário | Cinza médio | `#6B6B76` |
| Texto desabilitado | Cinza claro | `#A3A3AD` |

Regras: usar **no máximo 1 cor de destaque por tela** além da primária. Coral só para erros reais, nunca para "nota baixa" (nota baixa usa âmbar, com linguagem gentil).

### 4.2 Modo escuro

Fundo `#111116`, superfície `#1B1B22`, borda `#2A2A34`, texto principal `#F2F2F5`, texto secundário `#A0A0AD`. Primária clareia para `#7B7BEA`. Mantenha o contraste mínimo AA em todos os pares. Entregar as telas principais nos dois modos.

### 4.3 Tipografia

- **Títulos:** Plus Jakarta Sans (peso 700/800).
- **Corpo e interface:** Inter (peso 400/500/600).
- Escala (px/altura de linha): Título grande 28/34, Título de tela 24/30, Título de seção 18/24, Corpo 16/24, Corpo pequeno 14/20, Legenda 12/16.
- Nunca usar texto abaixo de 12px. Corpo padrão é 16px. Máximo de 2 pesos por tela.

### 4.4 Espaçamento, formas e sombras

- Grade de 4px. Escala: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Margem lateral das telas: 20px. Espaço entre seções: 24 a 32px.
- Raios: botões e campos 14px, cards 20px, chips 999px (pílula), bottom sheets 28px no topo.
- Sombras muito suaves (blur 16, opacidade 6%) só em cards elevados e bottom sheets. Preferir bordas finas a sombras.
- Área de toque mínima: 48x48px.

### 4.5 Ícones e ilustração

- Ícones de traço (stroke 1.75px), cantos arredondados, estilo Lucide ou Phosphor "regular". Um único estilo em todo o app.
- Ilustrações: formas geométricas simples e orgânicas (círculos, blobs) nas cores da marca. **Sem fotos de banco de imagem.** Sem mascote no MVP.
- Emojis: no máximo 1 por tela, em momentos de conquista (ex.: 🎉 ao concluir simulação).

### 4.6 Movimento

Microanimações de 150 a 250ms, com suavização (ease-out). Botão afunda levemente ao toque (escala 0.97). Barras de progresso animam ao carregar. Nada de animações longas ou que travem a leitura. Respeitar a configuração "reduzir movimento" do sistema.

## 5. COMPONENTES (desenhe cada um com todos os estados)

1. **Botão primário:** fundo índigo, texto branco, altura 52px, largura total, raio 14. Estados: normal, pressionado, desabilitado (cinza claro), carregando (spinner no lugar do texto).
2. **Botão secundário:** fundo índigo 10%, texto índigo.
3. **Botão de texto:** sem fundo, texto índigo, para ações leves ("Pular", "Agora não").
4. **Campo de texto:** altura 52px, borda cinza, rótulo acima, foco com borda índigo 2px, erro com borda coral e mensagem abaixo.
5. **Campo de resposta longo:** área multilinha de 6 a 10 linhas, contador de caracteres discreto no canto.
6. **Chip selecionável:** pílula; selecionado = fundo índigo e texto branco; não selecionado = borda cinza.
7. **Card:** fundo branco, raio 20, borda fina, padding 16 a 20. Versão "card de destaque" com fundo índigo 10%.
8. **Barra de progresso:** fina (8px), fundo cinza claro, preenchimento índigo (ou menta quando completo).
9. **Anel de nota:** círculo com nota de 0 a 100 no centro; cor muda com a faixa (menta acima de 75, âmbar de 50 a 74, índigo suave abaixo de 50, sempre com texto gentil).
10. **Barra de navegação inferior:** 5 itens com ícone + rótulo, item ativo em índigo com fundo suave.
11. **Cabeçalho de tela:** título à esquerda, ação opcional à direita, botão voltar quando aplicável.
12. **Bottom sheet:** para confirmações e seleções, com alça no topo.
13. **Toast:** aparece no topo por 3s (sucesso menta, erro coral).
14. **Estado vazio:** ícone simples + frase curta + um botão.
15. **Skeleton:** blocos cinza pulsando enquanto carrega (nunca tela em branco).
16. **Selo "Premium":** pílula âmbar pequena com cadeado, para funções bloqueadas.

## 6. NAVEGAÇÃO

Barra inferior com 5 abas, nesta ordem:

1. **Início** (ícone casa)
2. **Treinar** (ícone microfone/balão de conversa): simulador de entrevista
3. **LinkedIn** (ícone perfil/documento)
4. **Dicas** (ícone lâmpada)
5. **Perfil** (ícone pessoa): conta, plano e configurações

Telas de fluxo (simulação em andamento, relatório, paywall) abrem **por cima**, sem a barra inferior, com botão de fechar/voltar claro.

## 7. TELAS (desenhe todas, em 390x844)

### T1. Abertura (splash)
Fundo índigo, logo centralizado (símbolo simples + nome), 1 segundo. Sem textos extras.

### T2. Boas-vindas (3 slides)
Cada slide: ilustração geométrica no topo (40% da tela), título 28px, uma frase de apoio, indicador de 3 pontos, botão "Continuar" no rodapé, botão de texto "Pular" no topo direito.
- Slide 1: "Entrevista não precisa dar medo" / "Treine com calma, no seu ritmo, quantas vezes quiser."
- Slide 2: "Feedback que ajuda de verdade" / "Saiba o que está bom e o que melhorar, com exemplos prontos."
- Slide 3: "Seu perfil pronto para ser notado" / "Receba um relatório do seu LinkedIn e dicas para o mercado de trabalho."
No último slide o botão vira "Começar".

### T3. Criar conta / Entrar
Alternância por abas "Criar conta" e "Entrar". Campos: e-mail, senha (com botão mostrar/ocultar). Em "Criar conta", checkbox "Li e aceito os Termos e a Política de Privacidade" (links). Botão primário "Criar conta" / "Entrar". Abaixo, botão de texto "Esqueci minha senha". Erros de campo aparecem abaixo de cada campo, em linguagem simples ("Esse e-mail não parece certo").

### T4. Conhecendo você (perfil inicial, 3 passos com barra de progresso)
- Passo 1: "Como podemos te chamar?" (campo de nome) + "Qual sua idade?" (seletor numérico).
- Passo 2: "O que você busca agora?" (chips de escolha única: Jovem aprendiz, Estágio, Primeiro emprego, Novo emprego).
- Passo 3: "Qual área te interessa?" (chips de escolha única: Atendimento, Vendas, Administrativo, Tecnologia, Marketing, Logística, Saúde, Outra) e "Como você se sente com entrevistas?" (5 opções de carinha, de "Muito nervoso(a)" a "Tranquilo(a)").
Botão "Continuar" fixo no rodapé; "Voltar" no topo. Último passo: "Vamos lá".

### T5. Início (home)
De cima para baixo:
1. Saudação: "Oi, [nome]! 👋" e uma frase do dia curta e acolhedora.
2. **Card de sequência:** "🔥 3 dias seguidos" com 7 bolinhas da semana (preenchidas nos dias treinados).
3. **Card principal de destaque (índigo 10%):** "Treino de hoje", com a próxima ação sugerida e um botão primário "Começar simulação".
4. **Meta da semana:** barra de progresso "1 de 3 simulações".
5. **Sua evolução:** mini gráfico de linha com as últimas 5 notas + texto "+8 pontos desde a primeira".
6. **Dica do dia:** card com título da dica, tempo de leitura ("2 min") e seta.
7. **Atalho LinkedIn:** card pequeno "Analise seu perfil" com selo se ainda não fez.
Estado vazio (usuário novo): esconder gráfico e mostrar "Faça sua primeira simulação para ver sua evolução aqui".

### T6. Treinar: nova simulação
Título "Nova simulação". Seções, cada uma com chips:
1. "Qual vaga você quer treinar?" (área, já pré-selecionada com a do perfil).
2. "Nível" (Jovem aprendiz, Estágio, Primeiro emprego, Júnior).
3. "Quantas perguntas?" (3, 5 ou 8; padrão 5).
Card informativo: "Leva cerca de 10 minutos. Não tem nota que reprova, é só treino." Contador do plano gratuito: "Você tem 1 simulação grátis esta semana" (ou selo Premium quando esgotada). Botão primário "Começar".
Abaixo, lista "Simulações recentes" (data, área, nota), tocável.

### T7. Treinar: respondendo (simulação em andamento)
Sem barra inferior. Topo: botão fechar (X) e "Pergunta 2 de 5" com barra de progresso fina. Centro: **card da pergunta** grande e legível. Abaixo: campo de resposta multilinha grande. Rodapé fixo: botão secundário "Dica" (mostra uma dica curta sobre como responder, sem dar a resposta pronta) e botão primário "Enviar resposta". Antes da primeira pergunta, uma tela de 5 segundos: "Respire fundo. Você está só treinando." com animação suave de respiração (círculo que expande e contrai) e botão "Estou pronto(a)".
Ao tocar em fechar: bottom sheet "Sair da simulação?" com "Continuar" (primário) e "Sair sem salvar" (texto).

### T8. Treinar: gerando feedback
Tela de carregamento com animação leve e frases rotativas: "Lendo suas respostas…", "Separando o que ficou bom…", "Preparando dicas para você…". Sem barra de progresso falsa.

### T9. Treinar: resultado e feedback
1. Topo: **anel de nota** grande + frase gentil ("Bom começo! Você já tem uma base sólida.") e, se houver, "+6 desde a última".
2. Resumo em 2 a 3 linhas.
3. **"O que foi bem"** (card menta suave, 2 a 4 itens com ícone de check).
4. **"O que melhorar"** (card índigo suave, 2 a 4 itens; cada item expansível com "Por quê" e "Como fazer").
5. **"Resposta por resposta":** lista de cards recolhíveis; cada um mostra a pergunta, sua resposta (resumida), uma nota de 0 a 10, o comentário e **"Uma resposta sugerida"** (bloco destacado, com botão "Copiar").
6. **"Seu próximo passo":** 1 ação simples.
7. Rodapé fixo: botão primário "Treinar de novo" e botão de texto "Voltar ao início".

### T10. LinkedIn: início
Título "Seu LinkedIn". Card explicativo curto: "Envie o PDF do seu perfil e receba um relatório com o que melhorar." Duas opções grandes, em cards:
- **"Enviar PDF do perfil"** (ícone de arquivo)
- **"Colar os textos"** (ícone de texto)
Link "Como baixar meu perfil em PDF?" abre um bottom sheet com 4 passos ilustrados por ícones. Nota de privacidade discreta: "Seu arquivo é usado só para gerar o relatório." Se já há relatórios: lista "Relatórios anteriores" com data e nota.

### T11. LinkedIn: enviar / colar
- **Enviar PDF:** área tracejada "Toque para escolher o arquivo" que, após escolher, mostra o nome do arquivo, tamanho e "Trocar arquivo".
- **Colar textos:** 4 campos recolhíveis (Título, Sobre, Experiências, Formação e habilidades), cada um com texto de ajuda.
Campo opcional "Que vaga você quer? (opcional)" para personalizar. Botão primário "Analisar meu perfil".

### T12. LinkedIn: relatório
1. **Anel de nota geral** + frase gentil.
2. **Prioridades:** lista "Faça primeiro" (3 itens) com selo de prioridade (alta/média/baixa).
3. **Seções do perfil** (cards com nota de 0 a 10 cada): Título, Sobre, Experiências, Formação, Habilidades, Foto e banner (dicas gerais). Tocar abre o detalhe: diagnóstico, sugestões e **bloco "Antes e depois"** (trecho atual ao lado da sugestão) com botão "Copiar sugestão".
4. **"Opções de título"** (3 opções, cada uma com "Copiar").
5. **Palavras-chave** em chips.
6. **Checklist final** com caixinhas marcáveis (o app guarda o que a pessoa já fez).
No plano gratuito: mostrar a nota geral e as 3 prioridades; o resto aparece **desfocado** com selo Premium e botão "Ver relatório completo".

### T13. Dicas: lista
Título "Dicas". Barra de busca. Chips de categoria roláveis na horizontal: Todas, Currículo, Entrevista, LinkedIn, Primeiro emprego, Direitos, Salário. Lista de cards: título, categoria, tempo de leitura, selo Premium quando bloqueada, ícone de favorito. Seção no topo "Trilhas" (carrossel): "Entrevista sem medo (7 dias)", "Currículo do zero", "Primeiro emprego: guia completo", com barra de progresso.

### T14. Dicas: leitura
Cabeçalho com voltar e favoritar. Título, categoria, tempo de leitura. Corpo em blocos curtos: parágrafos de no máximo 3 linhas, listas, **caixas "Exemplo"** (fundo índigo suave) e **caixas "Cuidado"** (fundo âmbar suave). No fim: "Isso foi útil?" (👍/👎) e botão primário "Marcar como lida". Mostrar "Próxima dica" como card.

### T15. Perfil
Topo: avatar com iniciais, nome, e-mail, selo do plano. Cards de lista:
- **Seu plano** (Grátis/Premium) com botão "Conhecer o Premium"
- **Meu progresso** (resumo de simulações, nota média, dias seguidos)
- **Meus dados** (nome, área, objetivo)
- **Lembretes** (ligar/desligar aviso diário e escolher horário)
- **Aparência** (claro, escuro, automático)
- **Privacidade** (Política, exportar meus dados, **apagar minha conta**)
- **Ajuda e contato**
- **Sair**
Rodapé com a versão do app.

### T16. Plano Premium (paywall)
Abre por cima. Topo: botão fechar. Título "Treine sem limites". Lista de 5 benefícios com ícones (simulações ilimitadas, relatório completo do LinkedIn, todas as dicas e trilhas, histórico e evolução completos, novidades primeiro). **Um único cartão de preço** claro: "R$ 14,90 por mês" (deixar o valor como variável editável). Botão primário "Quero o Premium". Abaixo, texto de apoio: "Sem fidelidade. Cancele quando quiser." Botão de texto "Agora não". Tom honesto, sem urgência falsa, sem contagem regressiva.

### T17. Instruções de pagamento (versão de teste)
Após tocar em "Quero o Premium": tela simples com passo a passo ("1. Faça o Pix… 2. Envie o comprovante pelo WhatsApp… 3. Liberamos em até 24h"), botão "Abrir WhatsApp" e botão "Copiar chave Pix".

## 8. ESTADOS QUE TAMBÉM PRECISAM SER DESENHADOS

- **Carregando:** skeletons na home, na lista de dicas e nos relatórios.
- **Sem internet:** faixa no topo "Você está sem conexão" + botão "Tentar de novo". Simulações em andamento guardam as respostas localmente.
- **Erro geral:** ícone simples, "Algo deu errado do nosso lado", botão "Tentar de novo".
- **Limite do plano gratuito atingido:** bottom sheet "Você usou sua simulação grátis desta semana. Ela volta na segunda-feira." com botões "Conhecer o Premium" e "Voltar".
- **Arquivo inválido (PDF):** mensagem clara com dica de como resolver.
- **Vazio:** simulações, relatórios, favoritos (cada um com frase e botão).
- **Conquistas:** tela/modal curto ao concluir a primeira simulação, 3 dias seguidos e 7 dias seguidos (animação leve, sem confete exagerado).

## 9. TOM DE VOZ E MICROTEXTOS

- Português do Brasil, "você", frases curtas, verbos no imperativo gentil ("Comece", "Tente de novo").
- Acolhedor e direto. Nunca julgar. Trocar "você errou" por "dá para melhorar aqui".
- Botões com verbos claros: "Começar simulação", "Enviar resposta", "Analisar meu perfil".
- Sem jargão técnico. Sem exclamações em excesso (no máximo 1 por tela).
- Mensagens de erro dizem o que aconteceu e o que fazer.
- Aviso fixo na tela de resultado e no perfil: "O [NOME DO APP] é uma ferramenta de treino e orientação. Ele não garante contratação e não substitui apoio profissional."
- Em telas sobre nervosismo/ansiedade, incluir um link discreto "Está muito difícil? Conversar com alguém" que leva ao CVV (188).

## 10. ACESSIBILIDADE

Contraste mínimo AA. Área de toque de 48px. Suporte a fonte maior do sistema (o layout não pode quebrar com texto 130%). Não depender só de cor para passar informação (sempre ícone ou texto junto). Rótulos descritivos para leitores de tela. Foco visível nos campos.

## 11. O QUE ENTREGAR

1. Um **guia de estilo** de uma página (cores, tipografia, espaçamento, raios, ícones).
2. **Biblioteca de componentes** com todos os estados da seção 5.
3. As telas T1 a T17 em 390x844, **modo claro**, e as telas T5, T7, T9 e T12 também em **modo escuro**.
4. Os estados da seção 8.
5. Um **protótipo navegável** com o fluxo principal: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9.
6. Nomeie camadas e componentes de forma organizada (ex.: `Button/Primary/Default`, `Card/Feedback`), para facilitar a implementação.

## 12. O QUE EVITAR

- Telas lotadas, mais de uma ação principal por tela, textos longos.
- Gradientes fortes, neon, sombras pesadas, muitas cores ao mesmo tempo.
- Vermelho para notas baixas; linguagem que envergonhe o usuário.
- Fotos de banco de imagem, mascotes infantis, memes.
- Pop-ups agressivos, urgência falsa, contadores regressivos.
- Menus escondidos (hambúrguer) para funções principais.
