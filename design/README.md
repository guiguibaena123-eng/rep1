# Pronto — pacote de design para implementação

Este pacote leva o design do app (treino de entrevista para jovens) para o Claude Code.
Use junto com o **Prompt 2 (funcionamento interno)**.

## Como usar no Claude Code (VS Code)

1. Descompacte esta pasta dentro do projeto, por exemplo em `design/`.
2. Na primeira mensagem ao Claude Code, cole algo como:

> Leia `design/README.md`, `design/design-tokens.json` e os arquivos em `design/telas/`.
> Eles são a fonte da verdade visual do app. Implemente as telas com fidelidade a esse
> design (cores, tipografia, espaçamentos, raios, textos e estados), seguindo o Prompt 2
> para a parte funcional. Comece pelos tokens e componentes base, depois o fluxo
> T1 → T9.

## O que tem aqui

| Arquivo | Conteúdo |
|---|---|
| `design-tokens.json` | Cores (claro e escuro), tipografia, espaçamentos, raios, tamanhos, sombra, movimento |
| `telas/*.dc.html` | O código-fonte de cada tela do canvas: HTML com estilos inline + um bloco de lógica (`class Component`) com estados e dados de exemplo |
| `telas/canvas.json` | Índice do canvas (nome e tamanho de cada tela) |

**Como ler um `.dc.html`:** o layout está dentro de `<x-dc>…</x-dc>`. `{{nome}}` é um valor
calculado em `renderVals()` no fim do arquivo. `<sc-if>` é renderização condicional,
`<sc-for>` é uma lista, `<dc-import name="NavBar">` usa o componente `NavBar.dc.html`.
Links `href="T06NovaSimulacao.dc.html"` indicam a navegação entre telas. O `support.js`
citado no topo é o runtime do editor de design e **não** deve ir para o app.

## Mapa de telas

| Arquivo | Tela | Observações |
|---|---|---|
| `Main.dc.html` | Guia de estilo | referência visual |
| `Componentes.dc.html` | Biblioteca de componentes | todos os estados, nomes `Grupo/Variante/Estado` |
| `NavBar.dc.html` | Barra inferior (Início, Treinar, Explorar, LinkedIn, Perfil) | props `active`, `dark` |
| `T01Abertura` | Splash | fundo índigo, logo |
| `T02BoasVindas` | 3 slides | “Pular” no topo, último botão vira “Começar” |
| `T03Conta` | Criar conta / Entrar | abas, mostrar senha, validação e erros por campo |
| `T04Perfil` | Conhecendo você (3 passos) | nome, idade, objetivo, área, como se sente |
| `T05Home` | Início | seção “Dicas para você” (trilha em andamento + carrossel de dicas + “Ver todas”); props `dark`, `novo` |
| `T06NovaSimulacao` | Nova simulação | chips, contador grátis, prop `gratisUsada` |
| `T07aRespire` | Antes de começar | animação de respiração, link CVV 188 |
| `T07Respondendo` | Simulação em andamento | sem barra inferior, dica, sheet “Sair da simulação?”, prop `dark` |
| `T08Gerando` | Gerando feedback | frases rotativas, sem barra de progresso falsa |
| `T09Resultado` | Resultado | anel de nota, o que foi bem / melhorar, resposta por resposta, prop `dark` |
| `T10LinkedIn` | LinkedIn: início | sheet “Como baixar meu perfil em PDF?” |
| `T11Enviar` | Enviar PDF / colar textos | |
| `T12Relatorio` | Relatório do LinkedIn | props `dark`, `plano` (`gratis` desfoca o conteúdo pago) |
| `T13Dicas` | Lista de dicas | busca, categorias, trilhas, favoritos, selo Premium |
| `T14Leitura` | Leitura de dica | caixas Exemplo e Cuidado, útil?, marcar como lida |
| `T15Perfil` | Perfil (conta) | plano, progresso, “Meu perfil” → T18, lembrete, aparência, privacidade |
| `T18MeuPerfil` | Meu perfil (visualização) | foto, bio, competências, o que busca, experiências, formação, idiomas, links, conquistas; prop `completo` (%) |
| `T19EditarPerfil` | Editar perfil | trocar/remover foto, título com contador, bio com “Me ajude a escrever”, adicionar/remover competências, disponibilidade (múltipla), idiomas, links |
| `T16Premium` | Paywall | prop `preco` (padrão R$ 14,90) |
| `T17Pagamento` | Pagamento de teste (Pix + WhatsApp) | preencher `[SUA CHAVE PIX]` e o link do WhatsApp |
| `T20Explorar` | Explorar (aba) | busca, filtros, “com objetivos parecidos”, seguir; aviso quando o próprio perfil não está público |
| `T21PerfilPessoa` | Perfil de outra pessoa | seguir, menu com denunciar (motivos) e bloquear; notas das simulações nunca aparecem |
| `D05…D12` | Versões escuras de T5, T7, T9, T12 | mesmos arquivos com `dark=true` |
| `E01…E09` | Estados | carregando (skeleton), sem internet, erro, limite grátis, PDF inválido, vazios, conquistas, home de usuário novo, relatório grátis |

## Regras de design que o código precisa manter

- Uma ação principal por tela; botão primário 52px, largura total, raio 14.
- Margem lateral 20px; grade de 4px; toque mínimo 48×48.
- No máximo 1 cor de destaque por tela além do índigo. Coral **só** para erro real; nota baixa usa âmbar ou índigo suave, sempre com texto gentil.
- Modo escuro: texto do botão primário é `#111116` (branco não passa no contraste AA sobre `#7B7BEA`).
- Texto sobre menta/âmbar usa os tons `*Ink` dos tokens.
- Animações de 150–250ms ease-out; botão afunda para 0.97 ao toque; respeitar “reduzir movimento”.
- Ícones Lucide, traço 1.75. Emoji no máximo 1 por tela (só em conquistas e na saudação).
- Telas de fluxo (simulação, resultado, paywall, pagamento) abrem sem a barra inferior.
- Aviso fixo em T9 e T15: “O Pronto é uma ferramenta de treino e orientação. Ele não garante contratação e não substitui apoio profissional.”
- Suportar fonte do sistema a 130% sem quebrar o layout.

## Pendências

- **Nome do app:** “Pronto” é provisório. Buscar por “Pronto” nas telas para trocar.
- **Pix e WhatsApp** em T17.
- Os textos de exemplo (Ana, notas, perguntas, dicas) são conteúdo de demonstração.

## Explorar e segurança (T20–T21)

- A aba Dicas saiu da barra; as dicas ganharam uma seção de destaque na Início (“Dicas para você”), logo abaixo do Treino de hoje.
- Perfil só aparece no Explorar se a pessoa ligar “Aparecer no Explorar” (T19 › Privacidade).
- E-mail, idade e notas das simulações nunca ficam visíveis para outros usuários.
- Todo perfil tem denunciar e bloquear. Bloquear é silencioso.
- **Chat entre usuários ainda não existe nesta versão** (fica para depois). Não implementar mensagens diretas.
