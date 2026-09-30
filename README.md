# Siwki

App para jovens treinarem entrevistas de emprego: simulador com IA, análise do LinkedIn, dicas e progresso.
Feito com Expo (React Native) + TypeScript. Backend no Supabase (a partir da Fase 2).

> **Nome:** o app se chamava "Pronto" (nome provisório) e passou a se chamar **Siwki** em 30/09/2026. O nome que as pessoas veem vem de `APP_NAME` (`src/i18n/pt-BR.ts`) e de `name` no `app.json`. Ficaram de propósito com "pronto" os identificadores internos, que ninguém vê e que, se mudassem, fariam o celular tratar como outro app: `com.guibaena.pronto`, o projeto do Expo `@guibaena/pronto`, os links `pronto://` e as chaves de armazenamento no celular. O restante deste README ainda diz "Pronto" em alguns lugares: é o mesmo app.

- **Design (fonte da verdade visual):** pasta [`design/`](design/README.md)
- **Regras de funcionamento:** [`prompt-2-claude-code.md`](prompt-2-claude-code.md)

## Status

| Fase | O que entra | Situação |
|---|---|---|
| 1. Base | Tokens, fontes, componentes, 5 abas | ✅ pronta |
| 2. Conta e perfil | Supabase, T1–T4, login, T15 parcial | ✅ pronta |
| 3. Simulador | IA, T5–T9, limites | ✅ pronta |
| 4. Início e progresso | Sequência, meta, gráfico, conquistas | ✅ pronta |
| 5. LinkedIn | PDF e texto, T10–T12 | ✅ pronta |
| 6. Dicas | T13–T14, seed | ✅ pronta |
| 7. Premium e polimento | T16–T17, lembretes, métricas, testes, build | ✅ pronta |
| Prompt 3. Meu perfil | T18 Meu perfil, T19 Editar perfil, item na T15, foto de capa | ✅ pronta |

## Como rodar no celular (passo a passo)

Você precisa de: Node.js LTS instalado no computador e o app **Expo Go** no celular.
Computador e celular devem estar **na mesma rede Wi-Fi**.

1. Abra esta pasta no VS Code (Arquivo → Abrir Pasta).
2. Abra o terminal (Terminal → Novo Terminal).
3. Só na primeira vez, instale as dependências:
   ```
   npm install
   ```
4. Inicie o app:
   ```
   npx expo start
   ```
5. Vai aparecer um QR code no terminal.
   - **Android:** abra o Expo Go e toque em "Scan QR code".
   - **iPhone:** abra a câmera e aponte para o QR code.
6. Para parar, clique no terminal e aperte `Ctrl + C`.

**Deu erro "execução de scripts foi desabilitada"?** Use `npm.cmd` e `npx.cmd` no lugar de `npm` e `npx`.

**O celular não conecta?** Rode `npx expo start --tunnel` (mais lento, mas funciona em redes diferentes).

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run check` | Roda lint + verificação de tipos + testes. Precisa passar antes de cada entrega. |
| `npm test` | Só os testes. |
| `npx.cmd supabase db query --linked -f supabase/tests/rls_test.sql` | Teste de segurança do banco (veja a Fase 7). |
| `npx expo install <pacote>` | Instala um pacote na versão compatível com o Expo. Sempre use este em vez de `npm install <pacote>`. |

## Estrutura

```
src/
  app/            rotas (cada arquivo é uma tela) — Expo Router
    _layout.tsx   T1 Abertura: decide para onde ir (login, T4 ou abas)
    (auth)/       T2 boas-vindas, T3 criar conta/entrar, confirmar e-mail
    onboarding    T4 Conhecendo você
    (tabs)/       as 5 abas: Início, Treinar, LinkedIn, Dicas, Perfil
    simulacao/    T7 respondendo, T8 gerando feedback, T9 resultado (sem a barra de abas)
    analise/      T11 enviar PDF/colar textos, T12 relatório do LinkedIn (sem a barra de abas)
    dica/         T14 leitura de uma dica (sem a barra de abas)
    premium/      T16 Premium, T17 Assinatura (Stripe) e acompanhamento da assinatura
    legal/        Termos e Privacidade (texto provisório)
    dev/          telas só de desenvolvimento (vitrine de componentes)
  components/     Button, Input, Card, Chip, ProgressBar, ScoreRing, Toast,
                  BottomSheet, EmptyState, Skeleton, NavBar, Screen, ScreenHeader,
                  OfflineBanner (aviso "sem conexão")…
  features/       lógica por área (auth, profile, interview, linkedin, tips, progress,
                  plan = Premium, reminders = lembrete diário, preferences)
  lib/            supabase, chamadas às Edge Functions, env, cache de dados, events (métricas)
  theme/          tokens (cores claro/escuro, tipografia, espaçamento) e tema
  i18n/           TODOS os textos visíveis do app (pt-BR.ts) e textos legais
supabase/
  migrations/     SQL do banco (com RLS em todas as tabelas)
  functions/      Edge Functions (Deno) — a chave da IA só existe aqui
  templates/      e-mails em português (confirmação e senha nova)
  tests/          teste de segurança do banco (RLS)
  queries/        consultas prontas (métricas)
jest/             ajustes para os testes (Reanimated e ícones)
eas.json          perfis do build na nuvem (EAS)
.easignore        o que NÃO vai para o build na nuvem
design/           pacote de design (não vai para o app)
```

> As rotas ficam em `src/app/` (padrão atual do Expo), e não em `app/` como no Prompt 2. O resto da estrutura é igual.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. O `.env` **nunca** vai para o Git.
Depois de mudar o `.env`, **reinicie** o `npx expo start` (o valor só é lido na partida).

## Configurar o Supabase (Fase 2)

Plano gratuito. Faça uma vez, na ordem.

### 1. Criar o projeto
1. Entre em https://supabase.com e crie uma conta (pode ser com o GitHub ou e-mail).
2. Clique em **New project**. Nome: `pronto`. Região: **South America (São Paulo)**.
3. Crie uma **senha do banco** forte e **guarde** (vai precisar no passo 3).
4. Espere uns 2 minutos até o projeto ficar pronto.

### 2. Preencher o `.env`
1. No VS Code, copie o arquivo `.env.example` e renomeie a cópia para `.env`.
2. No Supabase, clique em **Connect** (topo da página) ou vá em **Project Settings → API Keys**.
3. Cole a **Project URL** em `EXPO_PUBLIC_SUPABASE_URL`.
4. Cole a **Publishable key** (`sb_publishable_…`) em `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   ⚠️ Nunca use a chave **secret**/**service_role** no `.env`.

### 3. Enviar o banco e as funções (terminal do VS Code, dentro da pasta do projeto)
1. Entrar na sua conta Supabase (abre o navegador para autorizar):
   ```
   npx.cmd supabase login
   ```
2. Ligar esta pasta ao seu projeto. O **Reference ID** está em Project Settings → General. Vai pedir a senha do banco do passo 1:
   ```
   npx.cmd supabase link --project-ref SEU_REFERENCE_ID
   ```
3. Criar as tabelas (lê a pasta `supabase/migrations`):
   ```
   npx.cmd supabase db push
   ```
4. Publicar a função que apaga contas:
   ```
   npx.cmd supabase functions deploy delete-account
   ```

### 4. Ajustes de login (já feitos pelo terminal)
Não precisa mexer no painel. As regras ficam em `supabase/config.toml` e são enviadas com:
```
npx.cmd supabase config push
```
O que está configurado: confirmação de e-mail ligada, senha mínima de 8 caracteres, Site URL `pronto://` e links de retorno `pronto://**` e `exp://**`.

Links dos e-mails usam **PKCE** (`flowType: 'pkce'` em `src/lib/supabase.ts`): o link traz só um código de uso único que funciona **no mesmo celular que pediu o e-mail**. Um link montado por outra pessoa não entra em conta nenhuma. Links de e-mails antigos (enviados antes desta mudança) não funcionam mais: basta pedir um novo.

Os e-mails de **confirmação** e de **senha nova** trazem um **link**. Tocando nele **no celular**, o app abre sozinho (já logado, ou na tela de criar a senha nova).

Os e-mails chegam no texto padrão do Supabase, em inglês, até você ligar um serviço de e-mail (SMTP). Os textos em português estão em `supabase/templates/`. Passo a passo em **Fase 7 → E-mails de verdade (Brevo)**.

> **Limite de e-mails:** o envio gratuito do Supabase só manda **2 e-mails por hora** e **só para membros da sua equipe no Supabase**. Para outras pessoas criarem conta, é obrigatório ligar o Brevo (Fase 7).

### 5. Testar a Fase 2 no celular
1. Reinicie o app (`npx.cmd expo start`).
2. Abertura índigo → boas-vindas (3 slides) → **Criar conta** com seu e-mail.
3. Abra o link de confirmação **no celular** → o app abre já logado. (Se abrir no computador, volte ao app e toque em **Já confirmei**.)
4. Preencha **Conhecendo você** (3 passos) → abas.
5. **Perfil:** troque a aparência, abra a Política, toque em **Sair** e entre de novo pela aba **Entrar**.
6. Teste **Esqueci minha senha**: chega um link no e-mail; abra **no celular** e crie a senha nova.
7. Por último, **Apagar minha conta** (digite APAGAR). Depois disso, o mesmo e-mail pode criar uma conta nova.

## Configurar a IA e o simulador (Fase 3)

A IA roda **só no servidor** (Edge Functions). A chave nunca vai para o app nem para o `.env`.
Provedor padrão: **Groq** (gratuito). Dá para trocar para o Gemini sem mudar código (veja o fim desta seção).

### 1. Criar a chave grátis da Groq
1. Entre em https://console.groq.com e crie uma conta (pode ser com o Google).
2. No menu, abra **API Keys** → **Create API Key**. Nome: `pronto`.
3. Copie a chave (começa com `gsk_`). Ela só aparece uma vez. **Não cole no chat nem em nenhum arquivo.**

### 2. Guardar a chave no Supabase (terminal do VS Code, dentro da pasta do projeto)
Troque `SUA-CHAVE` pela chave copiada:
```
npx.cmd supabase secrets set GROQ_API_KEY=SUA-CHAVE
```

### 3. Enviar as tabelas novas e publicar as funções
```
npx.cmd supabase db push
npx.cmd supabase functions deploy start-interview submit-interview
```
O `db push` pergunta se pode aplicar a migration `…_interview.sql`: responda `Y`.

### 4. Testar a Fase 3 no celular
1. Recarregue o app (sacuda o celular → **Reload**).
2. **Início** → "Começar simulação" (ou a aba **Treinar**).
3. Escolha área, nível e **3 perguntas** → **Começar**. A IA leva alguns segundos para montar as perguntas.
4. Tela "Respire fundo" → **Estou pronto(a)** (libera em 3 segundos).
5. Responda cada pergunta (mínimo de 20 caracteres). Teste o botão **Dica**.
6. Na última, **Enviar e finalizar** → tela "Gerando feedback" → **Seu resultado**.
7. Na primeira vez aparece a conquista "Primeira simulação feita". Teste **Copiar** numa resposta sugerida.
8. Volte à aba **Treinar**: deve aparecer "Simulação grátis da semana já usada". Toque em **Começar**: abre o aviso de limite.
9. Rascunho: comece outra simulação (depois de zerar o limite, abaixo), escreva um pouco, feche o Expo Go e abra de novo. O **Início** mostra "Continuar simulação", com o texto guardado.
10. Sair no meio: toque no **X** → **Sair sem salvar**.

### Zerar o limite semanal para testar de novo
No Supabase: **Table Editor** → tabela `usage_counters` → apague a linha da sua conta (`kind = interview`).

### Trocar para o Gemini (opcional)
1. Crie uma chave grátis em https://aistudio.google.com/apikey.
2. No terminal:
   ```
   npx.cmd supabase secrets set LLM_PROVIDER=gemini GEMINI_API_KEY=SUA-CHAVE
   ```
Para escolher outro modelo, defina `LLM_MODEL` do mesmo jeito. Os padrões ficam em `supabase/functions/_shared/llm.ts`.

## Início e progresso (Fase 4)

### 1. Enviar a view nova (terminal do VS Code, dentro da pasta do projeto)
```
npx.cmd supabase db push
```
Ele pergunta se pode aplicar a migration `…_progress.sql`: responda `Y`. Não precisa publicar funções.

### 2. Testar a Fase 4 no celular
1. Recarregue o app (sacuda o celular → **Reload**).
2. **Início**: o card da sequência mostra os dias da semana. Hoje tem borda tracejada; os dias em que você concluiu uma simulação ficam amarelos com ✓.
3. **Meta da semana**: "N de 3 simulações", contando só a partir de segunda-feira.
4. **Sua evolução**: com 1 simulação aparece um ponto só; com 2 ou mais aparece a linha. Toque no card: abre o **Perfil**.
5. **Perfil → Meu progresso**: número de simulações, nota média e dias seguidos.
6. **Treinar**: numa conta sem simulações concluídas, "Simulações recentes" mostra "Nenhuma simulação ainda" com o botão "Fazer a primeira".
7. Puxe a tela Início para baixo: tudo recarrega.

### Testar a conquista de 3 dias sem esperar 3 dias
No Supabase: **Table Editor** → tabela `daily_activity` → **Insert row**. Crie 2 linhas com o seu `user_id` (copie de uma linha que já existe) e as datas de **ontem** e **anteontem** (formato `AAAA-MM-DD`). Volte ao app, puxe a Início para baixo: aparece "3 dias seguidos". Depois apague essas linhas.

## Análise do LinkedIn (Fase 5)

Como funciona: o app envia o PDF para uma pasta **privada** do Supabase (`linkedin-uploads/{seu id}/`), a função `analyze-linkedin` lê o texto, **apaga o arquivo** e pede o relatório à IA.
Plano grátis: **1 resumo por mês** (nota + 3 prioridades). Premium: relatório completo, até 10 por mês. O corte do resumo é feito no servidor.

### 1. Enviar o banco novo e publicar a função (terminal do VS Code, dentro da pasta do projeto)
```
npx.cmd supabase db push
npx.cmd supabase functions deploy analyze-linkedin
```
O `db push` pergunta se pode aplicar a migration `…_linkedin.sql`: responda `Y`. Ela cria a tabela `linkedin_reports`, o bucket privado `linkedin-uploads` e o contador do mês.

### 2. Baixar seu perfil em PDF
Só dá pelo **site** do LinkedIn (o app do LinkedIn não tem essa opção). O próprio Pronto mostra este passo a passo em **Como baixar meu perfil em PDF?**, com um botão que abre o site:
1. Abra `https://www.linkedin.com/in/me/` no navegador e entre na conta. Se abrir o app do LinkedIn, use **Copiar link** e cole no Safari/Chrome.
2. Peça a versão para computador: Safari → **aA** → **Solicitar Site para Computador**; Chrome → **⋮** → **Site para computador**.
3. No perfil: **Mais** → **Salvar como PDF**.
4. O PDF fica em **Arquivos → Downloads** (iPhone) ou em **Downloads** (Android).

Pelo computador também funciona: faça os passos 1 e 3 e mande o PDF para o celular.

### 3. Testar a Fase 5 no celular
1. Recarregue o app (sacuda o celular → **Reload**).
2. Aba **LinkedIn** → **Como baixar meu perfil em PDF?**: abre os 5 passos. Teste **Abrir o LinkedIn no navegador** e **Copiar link**. O mesmo link aparece na tela **Enviar PDF**.
3. **Enviar PDF do perfil** → toque na área pontilhada → escolha o PDF. Aparecem o nome e o tamanho; teste **Trocar arquivo**.
4. Escreva uma vaga (opcional) → **Analisar meu perfil** → tela de espera → **Relatório do LinkedIn**.
5. Conta grátis: aparecem a nota, "Faça primeiro" com 3 itens e o bloco **Premium** por cima das seções.
6. Volte: o relatório aparece em **Relatórios anteriores** como "Resumo". Toque nele: abre de novo.
7. Tente outra análise: abre o aviso "Você já usou sua análise grátis deste mês".
8. **Texto colado:** zere o limite (abaixo) → **Colar os textos** → cole o seu "Sobre" → **Analisar meu perfil**.
9. **Relatório completo:** deixe sua conta Premium (abaixo), zere o limite e analise de novo. Abra as seções, copie uma sugestão e um título, e marque itens do checklist. Saia e entre de novo no relatório: as marcações continuam lá.
10. No Supabase: **Storage** → `linkedin-uploads` deve estar **vazio** (o PDF é apagado depois da análise).

### Zerar o limite do mês para testar de novo
No Supabase: **Table Editor** → tabela `usage_counters` → apague a linha da sua conta com `kind = linkedin_summary` (grátis) ou `linkedin_full` (Premium).

### Deixar sua conta Premium para testar
Veja **Fase 7 → Liberar o Premium de um usuário**.

## Dicas (Fase 6)

Como funciona: a lista de dicas (título, categoria, se é Premium) é igual para todo mundo. O **texto** de uma dica Premium só sai do banco para quem é Premium (função `tip_body`), então o cadeado não depende do app. "Marcar como lida" grava a leitura e conta o dia na sequência.

### 1. Enviar o banco novo (terminal do VS Code, dentro da pasta do projeto)
```
cd "C:\Users\HP\Downloads\projeto entrevista"
npx.cmd supabase db push
```
O `db push` pergunta se pode aplicar as migrations: `…_tips.sql` (tabelas e regras), `…_tips_seed.sql` (as 12 dicas e 3 trilhas), `…_tips_sources.sql` (fontes e textos revisados) e `…_tips_for_you.sql` (9 dicas novas, "Para você" e grátis com 20%). Responda `Y`.

### 2. Testar a Fase 6 no celular
1. Recarregue o app (sacuda o celular → **Reload**).
2. **Início**: aparece o card **Dica do dia**. Toque: abre a dica.
3. Aba **Dicas**: busca, chips de categoria, 3 **trilhas** e a lista com 12 dicas.
4. Digite "curriculo" (sem acento) na busca: aparecem as dicas de currículo. Toque no **X** para limpar.
5. Toque no **marcador** de uma dica. Escolha o chip **Salvas**: ela aparece lá. Tire dos salvos: aparece "Nenhuma dica salva".
6. Abra uma dica: título, texto com lista, **EXEMPLO** e **CUIDADO**. Vote 👍 (toque de novo tira o voto).
7. **Marcar como lida** → o botão vira **Lida** (verde). Volte: a dica mostra "· Lida" e a trilha mostra o progresso. Na Início, o dia de hoje fica marcado na sequência.
8. **Próxima dica** (no fim da leitura): abre a seguinte da trilha.
9. **Premium:** sua conta está Premium agora, então tudo abre. Para ver o cadeado, mude `plan` para `free` (abaixo) e recarregue: 4 dicas ganham o selo **Premium** e, ao tocar, abre o aviso do Premium.
10. **Grátis**: a Dica do dia nunca é uma dica Premium.

### Trocar o plano da sua conta para testar
No Supabase: **Table Editor** → tabela `profiles` → na sua linha, mude `plan` para `free` ou `premium`. Recarregue o app.

### Conteúdos que preciso revisar com um profissional de RH antes de publicar
Cada dica tem **fontes** no fim (gov.br, Agência Brasil, Senac, CIEE, Fipe, LinkedIn, MIT, Harvard), pesquisadas em 28/09/2026. Mesmo assim, estas precisam de revisão:
- **Jovem aprendiz: o que é e como funciona** (`jovem-aprendiz-como-funciona`): cita idade (14 a 24), contrato (até 2 anos), jornada (6h, ou 8h com fundamental completo) e direitos, com base no gov.br e na Agência Brasil (matéria de 2021). Confirmar se as regras continuam as mesmas.
- **Como falar de salário sem medo** (`falar-de-salario`): pesquisa de salário e benefícios.
- **Sem experiência? Comece por aqui** (`sem-experiencia-comece-por-aqui`): o aviso sobre empresas que cobram para participar de processo seletivo.

Para corrigir um texto: **Table Editor** → tabela `tips` → coluna `body`.

### Melhorar as dicas com o feedback dos usuários
A ideia é ir aumentando a quantidade e a qualidade das dicas conforme o que os usuários acham. O 👍/👎 de cada dica fica salvo. Para ver o resultado: Supabase → **SQL Editor** → cole e rode:
```sql
select t.title,
       count(*) filter (where p.helpful)       as uteis,
       count(*) filter (where p.helpful = false) as nao_uteis,
       count(*) filter (where p.read_at is not null) as lidas,
       count(*) filter (where p.favorited)     as salvas
from public.tips t
left join public.tip_progress p on p.tip_id = t.id
group by t.title
order by nao_uteis desc, lidas desc;
```
- Dica com muitos 👎: reescreva o texto (coluna `body`).
- Dica muito lida ou salva: o tema interessa. Vale criar mais dicas parecidas.

### Plano grátis: 35% das dicas
Decisão sua: o plano grátis lê até **35%** das dicas **de cada idioma** (hoje 7 de 21 em cada um), e o Premium lê todas. Quem decide é a coluna `is_premium` da tabela `tips`, e o banco confere o plano antes de mandar o texto. Ao criar dicas, mantenha a conta. Para conferir: **SQL Editor** →
```sql
select language,
       count(*) filter (where not is_premium) as gratis,
       count(*) as total,
       round(100.0 * count(*) filter (where not is_premium) / count(*)) as porcentagem
from public.tips where published
group by language order by language;
```

### Dicas por idioma
Cada trilha e cada dica têm um idioma (coluna `language`: `pt-BR`, `en`, `es`, `fr` ou `de`), e o app mostra só as do idioma escolhido.
- **Dicas gerais** (entrevista, currículo, LinkedIn, áreas) existem nos 5 idiomas, com o **mesmo slug** e fontes do país de cada idioma.
- **Dicas de um país só** ficam só no idioma dele: Jovem Aprendiz e Lei do Estágio (português); apprenticeships e internships nos EUA/Reino Unido (inglês); contrato de formación en alternancia e práctica profesional (espanhol); apprentissage e gratification de stage (francês); Ausbildung e Praktikum/Mindestlohn (alemão).
- Uma dica só pode ficar numa trilha do mesmo idioma: o banco recusa se não for.

### IA e pagamento no idioma escolhido
O app manda o idioma no cabeçalho `x-app-lang` de todas as funções. As **perguntas e o feedback** da simulação, a **análise do LinkedIn** e a **sugestão de bio** saem nesse idioma (e pensando no mercado de trabalho do país). A **página de pagamento** da Stripe abre no mesmo idioma. As mensagens de erro das funções são em português: nos outros idiomas o app mostra a mensagem dele. Para publicar:
```powershell
npx.cmd supabase db push
npx.cmd supabase functions deploy start-interview submit-interview analyze-linkedin suggest-bio create-subscription
```
O `db push` aplica `…_tips_language.sql` (coluna de idioma) e `…_tips_en/es/fr/de.sql` (21 dicas em cada idioma). Responda `Y`.

### O resto do app no idioma escolhido
- **Termos e Privacidade**: um arquivo por idioma em `src/i18n/legal/` (o português é a referência; texto provisório, revisar com advogado, inclusive as traduções).
- **Sugestões de competências** do Meu perfil: listas por idioma em `src/features/profile/skillSuggestions.ts`.
- **Preço do Premium**: vem de `EXPO_PUBLIC_PREMIUM_PRICE` (número) e é escrito no formato de cada idioma, sempre em reais (a Stripe cobra em R$).
- **Linha de apoio emocional** (link na simulação): CVV 188 em português; nos outros idiomas, a linha do país (3114 na França, Línea 024 na Espanha, TelefonSeelsorge na Alemanha, e o diretório findahelpline.com em inglês).
- **Avisos de permissão** (câmera e fotos) no iPhone: `locales/*.json`, ligados no `app.json`. Só mudam num build novo (EAS), não no Expo Go.
- **E-mails da conta**: veja o passo 6 de "E-mails" mais abaixo.

### Filtro "Para você"
Mostra as dicas que combinam com o que a pessoa respondeu no cadastro. Cada dica tem 3 marcações na tabela `tips`:
- `areas`: áreas da vaga (ex.: `{vendas}`). Vale **3 pontos** se for a área da pessoa.
- `goals`: objetivos (ex.: `{estagio,primeiro_emprego}`). Vale **2 pontos**.
- `for_nervous`: `true` para quem marcou 1 ou 2 no nervosismo. Vale **1 ponto**.

A lista vem da maior pontuação para a menor. Dica sem nenhuma marcação é "geral" e não aparece no "Para você". Hoje existe uma dica por área (menos "Outra") e dicas para os 4 objetivos.

**Para criar uma dica nova**, peça ao Claude Code: ele escreve a dica com fontes numa migration nova, e você roda `npx.cmd supabase db push`. Pelo Table Editor também dá: **Insert row** na tabela `tips`, copiando o formato do `body` de outra dica.

## Premium, lembretes e polimento (Fase 7)

O que entrou: telas **Premium** (T16) e **Assinatura** (T17, pela **Stripe**, com **renovação automática**), **liberação e renovação automáticas** do Premium, **cancelar assinatura** no Perfil, **lembrete diário**, **exportar meus dados**, **ajuda e contato**, **métricas** (tabela `events`), aviso de **sem conexão**, Termos e Privacidade atualizados, testes novos e o **build Android**.

### Como funciona a assinatura
- **Mensal, com renovação automática, no cartão de crédito** (decisão sua). Em 28/09/2026 trocamos o Mercado Pago pela **Stripe**: a assinatura do Mercado Pago só deixava pagar quem estivesse logado no Mercado Pago com o **mesmo e-mail** da conta do Pronto. Na Stripe, a pessoa paga com qualquer cartão, sem ter conta lá.
- "Quero o Premium" → T17 → **Assinar com cartão** abre a página segura da Stripe dentro do app. Depois de pagar, a página diz "pode voltar para o app"; ao fechar, o app mostra "Confirmando sua assinatura" e depois **"Assinatura ativa!"**.
- A cada cobrança paga, a Stripe avisa o servidor (função `stripe-webhook`). O servidor confere a assinatura do aviso, **consulta a assinatura e as faturas direto na Stripe** e renova o Premium por **1 mês + 3 dias de folga** (a folga cobre as novas tentativas de cobrança quando o cartão falha num dia). Um aviso falso não renova nada.
- Plano B: se o aviso atrasar, o app pergunta ao servidor (função `check-subscription`), que consulta a assinatura e as faturas na Stripe.
- **Cancelar:** Perfil → **Cancelar assinatura** (função `cancel-subscription`). Não há novas cobranças, e o **Premium continua até o fim do mês já pago** (regra sua). Apagar a conta também cancela a assinatura antes.
- **Reativar:** quem cancelou (e ainda tem Premium) vê **Ativar renovação automática** no Perfil e na T16. Nada é cobrado na hora: a 1ª cobrança fica para o dia em que o Premium atual acaba (na Stripe aparece como "teste grátis" até essa data; se faltar menos de 49 horas, cobra na hora).
- O **valor cobrado** vem do servidor (segredo `PREMIUM_PRICE`). O `.env` só tem o preço **mostrado** na tela: mantenha os dois iguais.
- Taxas: confira a tabela atual em https://stripe.com/br/pricing antes de cobrar de verdade. Sem mensalidade.
- Conta Stripe: **pessoa física com CPF** pode abrir (o CNPJ é opcional, [ajuda da Stripe](https://support.stripe.com/questions/brazil-specific-information-to-open-a-stripe-account)). Para **testar** não precisa enviar nenhum documento.

### 1. Enviar o banco novo (terminal do VS Code, dentro da pasta do projeto)
```
cd "C:\Users\HP\Downloads\projeto entrevista"
npx.cmd supabase db push
```
Ele pergunta se pode aplicar as migrations novas (`…_stripe.sql`, `…_app_settings.sql`, `…_support_email.sql`): responda `Y`. (As anteriores você já enviou.)

### 2. Preencher o e-mail de ajuda e o preço no `.env`
Abra o `.env` e troque os valores de exemplo:
- `EXPO_PUBLIC_SUPPORT_EMAIL`: o e-mail que recebe os pedidos de ajuda (usado em "Ajuda e contato" e nas telas da assinatura; é também o canal de reembolso dos Termos e dos pedidos da LGPD). O app **não tem WhatsApp** (decisão sua, 28/09/2026): o botão abre o app de e-mail do celular com o assunto e o e-mail da conta da pessoa já preenchidos.
- `EXPO_PUBLIC_PREMIUM_PRICE`: o preço mostrado, em reais, só o número (ex.: `14.90`). O app escreve no formato de cada idioma: `R$ 14,90 por mês`, `R$14.90 per month`, `14,90 R$ pro Monat`… (O antigo `EXPO_PUBLIC_PREMIUM_PRICE_LABEL=R$ 14,90 por mês` ainda funciona.)
- **Salve o `.env` como UTF-8** (no VS Code, canto inferior direito mostra "UTF-8"). Em outra codificação, os acentos aparecem quebrados no app (ex.: "mÃªs").

Depois, **pare e inicie de novo** o `npx.cmd expo start` (o `.env` só é lido na partida).

### 3. Configurar a Stripe (grátis para testar, sem mensalidade)
**Nunca cole chaves no chat.** No teste, a Stripe usa o **modo de teste** (área de testes): nada de dinheiro de verdade, sem contas de comprador/vendedor e sem enviar documentos.

**3.1. Criar a conta e pegar a chave de teste**
1. Crie a conta em https://dashboard.stripe.com/register (e-mail e senha; país **Brasil**). Ela já abre no **modo de teste** (aparece "Área de testes" ou "Modo de teste" no topo). Se pedir para "ativar a conta", pode pular por enquanto.
2. Menu **Desenvolvedores** → **Chaves de API** → na linha **Chave secreta**, clique em **Revelar** e copie (começa com `sk_test_`).

**3.2. Guardar no Supabase e publicar** (terminal do VS Code, dentro da pasta do projeto; troque o valor):
```
cd "C:\Users\HP\Downloads\projeto entrevista"
npx.cmd supabase secrets set STRIPE_SECRET_KEY=COLE-A-CHAVE-SK-TEST PREMIUM_PRICE=14.90
npx.cmd supabase functions deploy create-subscription check-subscription cancel-subscription delete-account
npx.cmd supabase functions deploy stripe-webhook --no-verify-jwt
npx.cmd supabase functions delete mercadopago-webhook
npx.cmd supabase secrets unset MP_ACCESS_TOKEN MP_TEST_PAYER_EMAIL
```
(As duas últimas linhas apagam o que era do Mercado Pago. Se ainda existirem `create-checkout` e `check-payment`, apague também com `npx.cmd supabase functions delete NOME`.)

**3.3. Avisos automáticos (webhook): não precisa fazer nada.** Na 1ª vez que alguém toca em **Assinar com cartão**, o servidor cria sozinho, na Stripe, o destino dos avisos (`…/functions/v1/stripe-webhook`, eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` e `invoice.paid`) e guarda o segredo dele na tabela `app_settings` (que o app não consegue ler). Para conferir: Stripe → **Developers** → **Webhooks** mostra o destino "Pronto: renovação do Premium (criado automaticamente)". Não apague esse destino. (Se um dia preferir configurar à mão, crie o destino e guarde o segredo com `npx.cmd supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`: ele passa a valer no lugar do automático.)

**3.4. Para cobrar de verdade** (depois de tudo testado): na Stripe, **ative a conta** (CPF, endereço, conta bancária no seu CPF e o link do app ou de uma rede social). Saia do modo de teste, copie a **chave secreta de produção** (`sk_live_`) e rode:
```
npx.cmd supabase secrets set STRIPE_SECRET_KEY=COLE-A-CHAVE-SK-LIVE
```
Não precisa publicar as funções de novo: na 1ª assinatura de verdade, o servidor cria sozinho o webhook de produção.

**Se der erro ao assinar:** Supabase → **Edge Functions** → `create-subscription` → **Logs**. A linha `STRIPE_CHECKOUT` traz o motivo que a Stripe deu (sem dados pessoais). Se o Premium não entrar depois de pagar: Stripe → **Desenvolvedores** → **Webhooks** → seu destino mostra se os avisos chegaram (e o erro, se houver); e em Supabase → `stripe-webhook` → **Logs**.

### 4. Testar a Fase 7 no celular
1. Recarregue o app. Deixe sua conta **grátis** (abaixo, "Voltar para o grátis").
2. **Perfil → Conhecer o Premium**: abre a T16 com os 5 benefícios e o preço. **Agora não** fecha.
3. **Quero o Premium** → T17 ("Assinatura": valor por mês e como funciona) → **Assinar com cartão**: abre a página da Stripe.
4. Use o **cartão de teste** `4242 4242 4242 4242`, validade qualquer data futura (ex.: `12/34`), CVC qualquer (ex.: `123`), qualquer nome. Confirme a assinatura. Para testar cartão **recusado**: `4000 0000 0000 0002`.
5. A página diz "pode voltar para o app". Feche: aparece "Confirmando sua assinatura" e, em poucos segundos, **"Assinatura ativa!"**. **Começar a usar**.
6. O Perfil mostra **Premium** e "Renova sozinho em DD/MM". No Supabase, **Table Editor**: `subscriptions` com `status = authorized` e `payments` com a cobrança `approved` e `premium_granted = true`.
7. **Perfil → Cancelar assinatura** → **Cancelar assinatura**: aparece "Assinatura cancelada. Seu Premium continua até DD/MM". O Perfil passa a mostrar "Premium até DD/MM · não renova".
8. Feche a página da Stripe sem assinar → "Confirmando sua assinatura" com **Voltar para o pagamento** e **Fechar e ver depois**.
9. Os outros atalhos também abrem a T16: limite da simulação (Treinar), limite do LinkedIn, relatório resumido e dica Premium.
10. **Reativar:** com o Premium ainda valendo e a assinatura cancelada, **Perfil → Ativar renovação automática** → a T17 mostra "Nada é cobrado agora…" → assine: a 1ª cobrança fica para o fim do Premium atual.
11. **Perfil → ⚙ Configurações → Lembrete diário**: ligue. O celular pede permissão: **Permitir**. Aparece "Lembrete ligado para 19:00" e a linha **Horário**.
12. Toque no horário → use − e + para colocar o **próximo horário "redondo"** (os minutos andam de 15 em 15). **Salvar horário**. Feche o app e espere: chega o lembrete.
13. Desligue o lembrete: "Lembrete desligado". (Se você tiver negado a permissão, aparece a explicação com **Abrir configurações**.)
14. **Perfil → ⚙ Configurações → Exportar meus dados**: abre o compartilhamento do celular com o arquivo `pronto-meus-dados.json`. Salve em Arquivos e abra para conferir.
15. **Perfil → ⚙ Configurações → Ajuda e contato**: abre o app de e-mail com o destinatário, o assunto "Ajuda com o Pronto" e o e-mail da sua conta já preenchidos. (Sem app de e-mail configurado no celular: aparece o endereço para escrever.)
16. **Sem conexão**: ligue o modo avião. Aparece a faixa amarela "Você está sem conexão" em cima da barra de abas. Desligue o modo avião: some.
17. **Perfil → ⚙ Configurações → Política de Privacidade** e **Termos de Uso**: textos novos (métricas, lembretes, pagamento pela Stripe).

### Liberar o Premium à mão (cortesia, teste ou problema no pagamento)
Normalmente é automático. Para dar Premium sem assinatura (ex.: a um amigo testador) ou resolver um caso em que a pessoa pagou e não liberou:
1. Se for problema de pagamento, confira no painel da Stripe (**Pagamentos**) se o pagamento foi aprovado.
2. Supabase → **SQL Editor** → **New query** → cole, troque o e-mail e clique em **Run**:
   ```sql
   update public.profiles
   set plan = 'premium',
       premium_until = greatest(coalesce(premium_until, now()), now()) + interval '1 month'
   where id = (select id from auth.users where email = 'EMAIL-DA-PESSOA@exemplo.com');
   ```
   Deve aparecer "1 row affected" (se aparecer 0, o e-mail está diferente do cadastro). Rodar de novo no mês seguinte **soma** mais 1 mês.
3. A pessoa vê "Seu Premium está ativo" ao abrir o app.

**Cancelamento, estorno ou contestação (regra sua):** se a pessoa pagou e depois desistiu, o Premium **continua até o fim do mês já pago**. A assinatura fica `cancelled` e a cobrança pode ficar `refunded`/`charged_back`, só para registro; a data `premium_until` não muda. Testado em 28/09/2026. Não use o comando abaixo nesses casos.

**Pedido de reembolso (até 7 dias, está nos Termos):** a pessoa cancela no Perfil e pede em "Ajuda e contato" (chega no seu e-mail de ajuda). Você devolve pelo painel da Stripe: **Pagamentos** → abra a cobrança → **Reembolsar**. Se ela não conseguir cancelar pelo app, cancele no painel da Stripe (**Clientes** → a pessoa → assinatura → **Cancelar assinatura**, "imediatamente"). O app registra tudo sozinho e o Premium segue até o fim do mês pago.

**Voltar para o grátis** (só para testes ou cortesias que você mesmo deu, nunca para quem pagou):
```sql
update public.profiles set plan = 'free', premium_until = null
where id = (select id from auth.users where email = 'EMAIL-DA-PESSOA@exemplo.com');
```
Quando `premium_until` passa, o Premium acaba sozinho (o servidor confere a data). Para ver quem é Premium: **Table Editor** → `profiles`, filtre `plan = premium`.

### Ver as métricas
Supabase → **SQL Editor** → cole o conteúdo de [`supabase/queries/metricas.sql`](supabase/queries/metricas.sql) → **Run**. Mostra: usuários cadastrados, quantos terminaram o cadastro, **% que fez a 1ª simulação**, **% que voltou em 7 dias**, quantas vezes viram o Premium, **cliques em "Quero o Premium"**, pagamentos iniciados e aprovados, **receita bruta** (antes das taxas da Stripe), estornos e Premium ativos.

Os eventos ficam na tabela `events` (sem nenhum texto escrito pelo usuário). Quase todos são gravados pelo **próprio banco** (cadastro, onboarding, simulação iniciada/concluída/abandonada, LinkedIn, dica lida, pagamento iniciado/aprovado); o app só grava os cliques do Premium, o contato de ajuda aberto (`support_opened`) e o lembrete ligado. O app não consegue ler essa tabela.

### Testes de segurança: usuário A × usuário B
Rode os dois depois de qualquer mudança no banco, no Storage ou nas funções.

**1. No banco (74 verificações, não grava nada):** tabelas, arquivos, funções, Premium, métricas, acesso sem login. Tudo é desfeito no fim.
```
npx.cmd supabase db query --linked -f supabase/tests/rls_test.sql
```
Resultado esperado: `"resultado": "RLS OK (74 verificações)"`.

**2. De ponta a ponta, pela internet, igual ao app (34 verificações):** cria 2 contas de teste reais, A envia foto e preenche o perfil, B tenta ler/alterar/apagar/baixar tudo de A e usar a simulação e a assinatura de A nas funções do servidor. **Apaga as contas no final**, mesmo se der erro.
```
powershell -ExecutionPolicy Bypass -File supabase\tests\e2e_ab_test.ps1
```
Resultado esperado: `RESULTADO: 34/34 verificações OK`.

Revisão de segurança completa de 29/09/2026 (o que foi visto, corrigido e o que falta): veja a seção **Segurança** abaixo.

### E-mails de verdade (Brevo) — obrigatório antes de chamar outras pessoas
Sem isso, só você consegue criar conta (o e-mail padrão do Supabase só vai para a sua equipe, 2 por hora). O **Brevo** é grátis: **300 e-mails por dia**.
1. Crie uma conta em https://www.brevo.com (plano **Free**).
2. Menu **Senders, Domains & Dedicated IPs → Senders → Add a sender**: nome `Pronto`, e o seu e-mail. Confirme pelo link que chega no e-mail.
3. Menu **SMTP & API → SMTP** → **Generate a new SMTP key**. Copie a chave (**não cole no chat**). Anote também o **Login** e o servidor (`smtp-relay.brevo.com`, porta `587`).
4. Supabase → **Authentication → Emails → SMTP Settings** → ligue **Enable custom SMTP** e preencha:
   - Sender email: o e-mail do passo 2 · Sender name: `Pronto`
   - Host: `smtp-relay.brevo.com` · Port: `587`
   - Username: o **Login** do Brevo · Password: a **SMTP key**
   - **Save**.
5. Supabase → **Authentication → Rate Limits** → "Rate limit for sending emails": coloque `60` por hora → **Save**.
6. E-mails no idioma do app: **Authentication → Emails → Templates**. Os modelos escolhem o idioma pelo campo `language` da conta (o app grava ao criar a conta, ao entrar e ao trocar de idioma; sem o campo, vai em português):
   - **Confirm signup**: no assunto, cole a linha `subject` de `[auth.email.template.confirmation]` do `supabase/config.toml` (o texto entre as aspas externas, trocando `\"` por `"`); no corpo, apague tudo e cole o conteúdo de `supabase/templates/confirmation.html`. **Save**.
   - **Reset password**: mesmo jeito, com o `subject` de `[auth.email.template.recovery]` e o `supabase/templates/recovery.html`. **Save**.
7. Teste: crie uma conta com outro e-mail seu. O e-mail chega no idioma do app (se não chegar, olhe o spam). Se o **assunto** aparecer com `{{ if …` escrito, troque o assunto por um texto fixo, como `Siwki`.

> ⚠️ Depois disso, **não rode** `npx.cmd supabase config push` sem pedir ao Claude Code para atualizar o `supabase/config.toml` antes: esse comando sobrescreve as configurações de e-mail do painel.
> Os e-mails saem de um endereço Gmail/Outlook, então alguns podem cair no spam. Com um domínio próprio (ex.: `pronto.app.br`) isso melhora; fica para depois.

### Build de teste para Android (EAS) — gratuito
O **EAS Build** monta o app instalável (APK) na nuvem da Expo. Plano **Free** (conferido em 28/09/2026 em https://expo.dev/pricing): **15 builds Android e 15 iOS por mês**, fila de **baixa prioridade** (em horário de pico, pode esperar **90 minutos ou mais**) e até 45 minutos por build. Para testar, 1 ou 2 builds bastam: **custo zero**.

Antes: preencha o e-mail de ajuda e o preço no `.env` (passo 2 acima), configure a Stripe (passo 3) e ligue o Brevo. Os valores do `.env` ficam **dentro** do APK; mudou o `.env`, precisa de um build novo.

No terminal do VS Code (PowerShell):
1. Entre na pasta e entre na sua conta Expo (a mesma do Expo Go, `guibaena`):
   ```
   cd "C:\Users\HP\Downloads\projeto entrevista"
   npx.cmd eas-cli@latest login
   ```
2. Avise o EAS que o projeto não usa Git (repita **em todo terminal novo** antes dos comandos do EAS):
   ```
   $env:EAS_NO_VCS = "1"
   ```
3. Só na primeira vez, crie o projeto na Expo (responda `Y`; ele grava um `projectId` no `app.json`):
   ```
   npx.cmd eas-cli@latest init
   ```
4. Gere o APK:
   ```
   npx.cmd eas-cli@latest build --platform android --profile preview
   ```
   Na primeira vez ele pergunta **"Generate a new Android Keystore?"**: responda `Y` (a Expo guarda a chave de assinatura para você).
5. Espere. O terminal mostra um link para acompanhar em expo.dev. No fim aparece um **link e um QR code**.
6. No celular **Android**: abra o link (ou leia o QR code) → **Install** → baixe o APK → permita "instalar apps desconhecidos" para o navegador → instalar.
7. Para os testadores Android: mande o mesmo link.

Observações:
- **iPhone**: instalar fora da App Store exige conta de desenvolvedor Apple (US$ 99/ano). Por enquanto, no iPhone continue usando o Expo Go.
- O que vai para a nuvem é decidido pelo `.easignore`. O `.env` vai junto porque só tem valores **públicos**; segredos (chave da IA) ficam só no Supabase.
- Nome do pacote Android: `com.guibaena.pronto` (no `app.json`). Não mude depois de publicar.

### Checklist final (15 passos, conta nova, no celular)
Critério de aceite do MVP: um usuário novo faz tudo isto **sem erros**.
1. Abrir o app → "Vamos começar!" → boas-vindas (3 slides).
2. **Criar conta** com um e-mail novo (aceitando os Termos).
3. Confirmar pelo link do e-mail (em português) → o app abre logado.
4. **Conhecendo você** (nome, idade, objetivo, área, nervosismo) → Início.
5. **Começar simulação** (3 perguntas) → "Respire fundo" → responder usando **Dica** em uma.
6. **Resultado**: nota, pontos fortes, melhorias, **Copiar** uma resposta sugerida. Conquista "Primeira simulação".
7. Tentar outra simulação na mesma semana → aviso de limite → **Conhecer o Premium** abre a T16.
8. **LinkedIn → Colar os textos** (ou PDF) → relatório **resumo** com o bloco Premium.
9. **Dicas → Para você** → abrir uma dica → **Marcar como lida** → 👍.
10. Início: sequência com hoje marcado, meta da semana 1 de 3 e **Dica do dia**.
11. **Perfil → ⚙ Configurações → Lembrete diário** ligado (permitir notificação) e horário trocado.
12. **Perfil → ⚙ Configurações → Exportar meus dados** → arquivo JSON abre no compartilhamento.
13. **Premium**: T16 → T17 → **Assinar com cartão** → assinar (cartão de teste `4242 4242 4242 4242`) → "Assinatura ativa!" → Perfil mostra "Renova sozinho em…" → **Cancelar assinatura** → Premium segue até o fim do mês.
14. Modo avião → faixa "sem conexão"; conteúdo já carregado continua visível.
15. **Sair** → entrar de novo → **Apagar minha conta** (digite APAGAR) → volta para o login.

### Conteúdos que preciso revisar com um advogado antes do lançamento
- **Termos de Uso** e **Política de Privacidade** (`src/i18n/legal.ts`): texto provisório, marcado no app. Pontos: LGPD (base legal, encarregado/DPO, canal de contato formal), uso de IA de terceiros (Groq/Gemini, dados fora do Brasil), pagamento pela Stripe (empresa estrangeira: e-mail e cartão podem ser tratados fora do Brasil), e a seção **"Desistência e reembolso"** dos Termos (7 dias do Código de Defesa do Consumidor, reembolso pela Stripe, e a sua regra de manter o Premium até o fim dos 30 dias mesmo com reembolso).
- **Lojas de apps:** para os testes com o APK não há regra a seguir. Antes de publicar na **App Store**, reveja o pagamento: pelo acordo da Apple com o CADE (em vigor desde 18/06/2026), apps no Brasil podem usar pagamento externo, mas a Apple ainda cobra taxa (ex.: 15% com link para pagamento fora do app) ([Tecnoblog](https://tecnoblog.net/noticias/apple-ainda-podera-cobrar-taxas-no-brasil-veja-aliquotas/)). Na **Google Play**, confira a política de pagamentos da época.

## Meu perfil (Prompt 3)

Regras em [`prompt-3-perfil-usuario.md`](prompt-3-perfil-usuario.md). Telas: `src/app/meu-perfil/index.tsx` (T18) e `editar.tsx` (T19). Regras sem tela (% completo, validação, competências): `src/features/profile/details.ts`. Sugestões de competência por área: `src/features/profile/skillSuggestions.ts` (edite só essa lista).

### 1. Enviar o banco novo e publicar as funções (terminal do VS Code, dentro da pasta do projeto)
```powershell
cd "C:\Users\HP\Downloads\projeto entrevista"
npx.cmd supabase db push
npx.cmd supabase functions deploy suggest-bio delete-account analyze-linkedin
```
O `db push` cria as colunas novas do perfil e o bucket privado `avatars` (fotos). As funções: `suggest-bio` é o "Me ajude a escrever"; `delete-account` agora também apaga a foto; `analyze-linkedin` passa a usar título, bio e competências do perfil como contexto.

### 2. Testar no celular
Reinicie o Metro (`npx expo start --clear`): os pacotes de foto (`expo-image-picker` e `expo-image-manipulator`) já vêm no Expo Go.
1. **Perfil** → o item **Meu perfil** mostra "Foto, bio, competências e mais · X% completo" → toque → abre a T18.
2. T18: seções vazias mostram uma frase e um botão para adicionar; embaixo da barra aparece o primeiro item que falta.
3. **Editar** (no topo, na capa) → T19.
4. Foto: toque na câmera → galeria ou tirar foto → recorte quadrado → aparece o carregando e depois a foto. **Remover foto** volta para as iniciais.
   Capa: toque na câmera da capa (no topo) → escolha uma imagem → abre **Ajustar capa** → arraste a imagem → **Usar esta posição** → salve → aparece no topo da T18 com a parte escolhida. **Ajustar posição** muda o enquadramento depois, sem escolher a imagem de novo. **Remover capa** volta para as formas coloridas.
5. Apague o nome e toque **Salvar alterações** → "Como podemos te chamar?". Coloque `instagram.com/x` no LinkedIn → "Esse link não parece certo".
6. **Me ajude a escrever** → botão carregando → sheet com a sugestão → **Manter o meu** (não muda nada) ou **Usar esta sugestão** (troca o texto).
7. Competências: adicione "Xadrez" → pergunta o tipo. Adicione "Excel" → entra direto (técnica). Adicione "excel" de novo → "Essa competência já está na lista." Toque numa sugestão tracejada → entra na lista.
8. Experiência, formação, curso e idioma: **+ Adicionar** abre o sheet vazio; tocar num item abre com **Salvar** e **Excluir**.
9. Mude algo e toque no **X** → "Sair sem salvar?" → **Continuar editando** / **Sair sem salvar**. No Android, o botão "voltar" faz o mesmo.
10. **Salvar alterações** → toast "Perfil atualizado" → volta para a T18 já atualizada; a foto aparece também no topo da aba Perfil.
11. Modo avião → edite e salve → "Salvo no celular. Enviamos quando a internet voltar." → tire do modo avião → a mudança vai para o servidor sozinha. (Trocar a foto precisa de internet.)
12. Modo escuro (Perfil → ⚙ Configurações → Aparência) nas duas telas.

## Segurança (revisão de 29/09/2026)

**Como o app se protege:** toda tabela com dado pessoal tem RLS (cada pessoa só lê a própria linha); o app só altera colunas liberadas (nunca `plan`/`premium_until`); o que custa dinheiro ou IA passa pelas Edge Functions, que conferem login, dono do dado, limites do plano e limite de 20 chamadas/hora; o Premium só é liberado com dados lidos direto da API da Stripe (aviso sem assinatura válida é recusado); fotos e PDFs ficam em pastas privadas por pessoa; a sessão fica criptografada no celular.

**Reforços feitos** (migration `20261008000000_security_hardening.sql` + app):
- Tiradas permissões que o app não usa (TRUNCATE, TRIGGER, REFERENCES; escrita na view `user_stats`; chamar `handle_new_user`).
- Perfil: foto/capa só podem apontar para a própria pasta; tamanho máximo das listas (competências, experiências…); links só `http(s)`; idade até 100.
- Arquivos: nome controlado (`{id}/avatar-….jpg`, `{id}/cover-….jpg`, `{id}/{uuid}.pdf`) e limite por pessoa (10 fotos, 3 PDFs esperando).
- Métricas: no máximo 60 cliques gravados pelo app por hora.
- App: ao sair da conta apaga a edição de perfil pendente e as fotos em cache; link de e-mail com login de OUTRA conta é ignorado se já houver alguém logado; a página de pagamento só abre se for `https://checkout.stripe.com`.

**Auditoria (mesmo dia)** — migration `20261009000000_atomic_limits.sql` + app:
- Limites do plano e de 20 chamadas/hora **reservados numa operação só do banco, antes da IA** (antes, vários pedidos ao mesmo tempo furavam o limite). Se a IA falha, a vaga volta.
- No máximo 1 página de pagamento aberta por pessoa (evita cobrança dobrada com dois toques).
- Links de e-mail com **PKCE**: o link só entra na conta no celular que pediu o e-mail.
- Link malformado não derruba o app; senha nova exige letras e números.

**Feito:** reforço enviado, funções antigas do Mercado Pago apagadas, testes A×B OK (RLS 77/77, e2e 35/35).

**Feito no painel:** senha com **letras e números** (mínimo 8), conferida em 30/09/2026 (senha só de letras é recusada com `weak_password`).

**Falta fazer (você), antes de lançar** (painel do Supabase):
1. Authentication → URL Configuration: tirar `exp://**` das URLs de redirecionamento (só serve para o Expo Go; deixa um link de e-mail abrir outro projeto do Expo Go). Depois disso, links de e-mail e o login com Google só voltam para o app instalado.

## Login com Google

O botão **"Continuar com Google"** (T3) serve para criar conta e para entrar. Abre o login do Google num navegador seguro dentro do app e volta com um código de uso único (PKCE). Conta nova pelo Google passa pelo cadastro inicial normalmente (e aceita os Termos pelo aviso abaixo do botão). Se a pessoa já tinha conta com o mesmo e-mail, o Supabase junta as duas.

### Configurar (uma vez)
1. **Google Cloud** (https://console.cloud.google.com, grátis): crie um projeto "Pronto".
2. **Tela de consentimento OAuth** (Google Auth Platform → Branding): nome do app **Pronto**, e-mail de suporte `siwki.ajuda@gmail.com`. Em **Audience**, tipo **Externo** e clique em **Publicar app** (em "Teste" só entram os e-mails que você cadastrar). Só usamos e-mail e nome: o Google não pede verificação para isso.
3. **Clients → Create client**: tipo **Aplicativo da Web**. Em **URIs de redirecionamento autorizados**, cole: `https://kgqtaaqegibddjuhqbaz.supabase.co/auth/v1/callback`. Copie o **Client ID** e o **Client secret** (não cole no chat).
4. **Supabase** → Authentication → Sign In / Providers → **Google**: ligue, cole o Client ID e o Client secret, **Save**.

### Links de e-mail e Google no Expo Go (importante)
O Supabase **recusa endereços de volta com IP** (`exp://192.168.x.x:8081/--/`), mesmo com `exp://**` na lista: ele troca por `pronto://`, que o Expo Go não abre, e o navegador fica carregando para sempre. No app instalado (APK/lojas) isso não acontece.

Para testar no Expo Go, abra o Expo com um **nome** no lugar do IP (serviço grátis `nip.io`, que aponta para o seu computador):
1. Descubra o IP do computador: `ipconfig` → "Endereço IPv4" do Wi-Fi (ex.: `192.168.15.186`).
2. No terminal do VS Code:
   ```powershell
   cd "C:\Users\HP\Downloads\projeto entrevista"
   $env:REACT_NATIVE_PACKAGER_HOSTNAME = "192-168-15-186.nip.io"   # troque pelos números do SEU IP, com traços
   npx.cmd expo start
   ```
3. No iPhone, abra no Safari `exp://192-168-15-186.nip.io:8081` (com o seu IP) → **Abrir** no Expo Go. Não use o "Pronto" antigo da lista de recentes (ele usa o IP).

### Testar no celular
1. Na tela de conta, toque em **Continuar com Google** → escolha a conta → o app abre já logado (conta nova vai para o cadastro inicial).
2. Saia e entre de novo pelo Google: entra direto.
3. Toque em "Continuar com Google" e feche o navegador: volta para a tela sem mensagem de erro.
4. Com uma conta de e-mail já existente, entre pelo Google com o mesmo e-mail: deve abrir a MESMA conta (com seu histórico).

**Apple:** o "Entrar com Apple" precisa do Apple Developer Program (US$ 99/ano), que também é exigido para publicar na App Store. Fica para quando você se inscrever.

## Decisões tomadas quando o design e o Prompt 2 discordam

Regra: **visual do design, comportamento do Prompt 2.**

| Ponto | Fica assim |
|---|---|
| Tamanho da resposta (T7) | 2000 caracteres, contador a partir de 1500 |
| "Enviar resposta" (T7) | liberado com 20+ caracteres |
| "Dica" (T7) | abre em bottom sheet |
| "Estou pronto(a)" (T7a) | liberado após 3s |
| Fim do feedback (T8) | vai sozinho para T9 |
| Idade (T4) | 16 a 60 |
| Sheet "Sair da simulação?" | sem a frase "continuar de onde parou" (contradizia o resto) |
| Idade no seletor (T4) | vai de 13 a 60; abaixo de 16 mostra o aviso e não deixa continuar |
| Botão "Criar conta" (T3) | desabilitado até aceitar os Termos (Prompt 2) |
| Esqueci minha senha | envia um **link** que abre o app na tela de senha nova (código exigiria SMTP no plano gratuito) |
| Abertura (T1) | mostra o botão "Vamos começar!" e só segue depois do toque (pedido seu; o design não tinha texto) |
| "+N desde a última" (T9) | só aparece quando a nota subiu (comparar para baixo desanima) |
| "Conhecer o Premium" | abre a T16 de qualquer lugar (Perfil, limite de simulação, limite do LinkedIn, relatório resumido, dica Premium) |
| Pagamento (T17) | **Assinatura mensal na Stripe (cartão), com renovação automática** e liberação automática (pedido seu; trocada do Mercado Pago em 28/09/2026 por causa da exigência de e-mail igual). Substitui o Pix manual + WhatsApp do Prompt 2 e do design. A tela mostra o valor por mês, "como funciona" e "Assinar com cartão" |
| Depois de assinar | tela nova de acompanhamento (`premium/retorno`): confirmando → ativa / não concluída |
| Cancelar assinatura (T15) | botão no cartão "Seu plano" do Perfil, com confirmação. O Premium continua até o fim do mês pago (regra sua) |
| Tela Premium (T16) | abre como tela comum, não modal: no iOS os avisos ficavam escondidos atrás da tela modal |
| Login com Google (T3) | a seção 17 do Prompt 2 deixava "login com Google/Apple" fora do escopo; adicionado a seu pedido em 29/09/2026. Botão acima do formulário, com divisória "ou com e-mail"; o aceite dos Termos é pelo aviso abaixo do botão |
| Pagamento no Prompt 2 | a seção 17 deixava "pagamento dentro do app" fora do escopo. Aqui a pessoa paga na página da Stripe (fora do app), aberta pelo navegador interno |
| Aviso de Premium liberado | aviso (toast) "Seu Premium está ativo" na primeira vez que o app percebe a mudança (ao abrir ou voltar para o app), também para liberação manual |
| Horário do lembrete (T15) | seletor próprio com − e + (minutos de 15 em 15), sem pacote extra; o design mostrava um campo de hora do navegador |
| Lembrete (T15) | 7 lembretes semanais, um por dia, cada um com uma mensagem diferente (o Prompt 2 pede textos variados) |
| "Ajuda e contato" e "Exportar meus dados" (T15) | como no design; "Termos de Uso" continua em Privacidade (o design não tinha) |
| Faixa "sem conexão" (E02) | aviso flutuante acima da barra de abas, que não bloqueia a tela; as ações de rede mostram o erro "Sem conexão" se tocadas |
| "Tentar de novo" (T8) | usa as respostas já salvas no servidor, mesmo se o app tiver sido fechado |
| Voltar no passo 1 da T4 | escondido (a conta já foi criada; não há para onde voltar) |
| Dica do dia (T5) | card entre "Sua evolução" e o LinkedIn, como no design; escolhida pelo dia do ano (Prompt 2) |
| Favoritar (T13/T14) | ícone de **marcador**, como no design (o Prompt 2 dizia coração); chip extra **Salvas** para ver as favoritas (tela vazia do E06) |
| Texto das dicas (T14) | além dos blocos do Prompt 2, tem subtítulo (`h`), lista numerada (`ordered`) e **negrito**, que aparecem no design |
| Dicas iniciais | ficam numa migration (`…_tips_seed.sql`), e não em `seed.sql`, porque o `db push` só envia migrations |
| Coluna `order` das trilhas | chama `sort_order` (`order` é palavra reservada do SQL) |
| "Marcar como lida" (T14) | não desmarca depois (a leitura já contou na sequência do dia) |
| Dicas grátis | até **35%** das dicas (decisão sua). O Prompt 2 pedia no mínimo 8 grátis |
| Filtro "Para você" (T13) | **filtro principal**: primeiro chip, com ✨ e fundo índigo; a aba abre nele (ou em "Todas" se o perfil não tiver dicas); card "Escolhidas para você" no topo e trilhas no fim (pedido seu) |
| Fontes das dicas (T14) | bloco **Fontes** no fim de cada dica, com links (pedido seu; não estava no design nem no Prompt 2) |
| Cards das trilhas (T13) | mostram também a descrição da trilha, embaixo do título (pedido seu) |
| Metas das trilhas (T13) | "5 dicas · 2 lidas" em vez de "7 dias · dia 3" (o Prompt 2 mede por dicas lidas) |
| Texto da sequência (T5) | "Uma simulação ou uma dica hoje e você chega a N" (2026-09-30, crítica da Home: diz o que conta — simulação, dica lida ou análise do LinkedIn —, já que o grátis só tem 1 simulação por semana) |
| Meta da semana (T5) | **por plano** (2026-09-30, crítica da Home): Premium = 3 simulações; grátis = 1 simulação + 2 dicas lidas (o grátis só tem 1 simulação por semana, então "3 simulações" nunca fechava). Constantes em `src/features/progress/logic.ts` |
| Simulação grátis usada (T5) | o cartão "Treino de hoje" vira "Sua simulação grátis volta na segunda" (ou "amanhã", no domingo) com "Ler a dica do dia" + link discreto do Premium; a sequência sugere só a dica |
| Ordem da Início (T5) | 2026-09-30, crítica da Home: saudação → **uma** ação principal (simulação pela metade em destaque com botão primário, OU treino de hoje, OU "simulação grátis volta…") → **Sua semana** (sequência + meta num cartão só) → evolução (só com 2+ notas) → dica do dia → LinkedIn ("Novo" só até a primeira análise). Treino de hoje mostra o "Próximo passo" do último feedback, como no design |
| Identidade visual (2026-09-30) | pedidos seus: abertura com o logo novo (maleta + "siwki") branco se desenhando, interativo (toque e arrastar) e voando até o canto da Início, onde fica **só a maleta, esticada** (azul no claro, branca no escuro). Títulos das abas em **Quicksand** (arredondada). Arquivos da marca em `design/identidade/` |
| Selo de verificado (Perfil e Meu perfil) | pedido seu (2026-09-30): azul = Premium; dourado = conta do criador (ID em `src/features/profile/verified.ts`). Só a própria pessoa vê o próprio perfil |
| "+N pontos desde a primeira" (T5) | só aparece quando a nota subiu, como na T9 |
| Área bloqueada (T12, grátis) | prévia apagada com os nomes das seções, sem desfoque (o servidor nem manda o conteúdo, e desfoque exigiria outro pacote) |
| Foto e banner (T12) | sem nota (Prompt 2: a IA não vê a foto); o design mostrava nota |
| Título do relatório (T12) | frase pela faixa da nota ("Seu perfil já chama atenção." etc.); o texto abaixo é o resumo da IA |
| "Sugestão de Sobre" (T12) | cartão extra com o texto pronto da IA (campo `about_suggestion` do Prompt 2; o design não tinha lugar para ele) |
| Falha da IA na análise (T11) | tela "Tentar de novo" que reenvia o mesmo arquivo/texto, sem gastar a análise do mês |
| Conquistas de 3 e 7 dias (E07) | aparecem na Início, uma vez por sequência |
| Competência "destacada" (T18, Prompt 3) | não é salva: é calculada na hora a partir dos pontos fortes ("O que foi bem") das simulações |
| Foto de perfil (T19) | guardada num bucket **privado**; o app mostra com um link temporário (1 hora). Só a própria pessoa lê |
| Idiomas (T19) | lista com sheet de edição, igual às experiências (o design mostrava um seletor de nível em cada linha; o Prompt 3 pede sheet) |
| Área e formato (T19) | ficam em "O que você busca", junto com objetivo e disponibilidade (o design não mostrava; o Prompt 3 pede os campos) |
| Formato (T19) | tocar de novo no escolhido desmarca (campo opcional) |
| Foto de capa (T18/T19) | **pedido seu**, não estava no design nem no Prompt 3. Opcional; sem foto, fica a capa com formas do design. Guardada **inteira** (reduzida para cobrir 1200×542, lado maior até 2400, ~300 KB) no mesmo bucket privado da foto, com a **posição** escolhida em `cover_x`/`cover_y` (0–100): assim dá para reajustar o enquadramento depois (tela "Ajustar capa", arrastando; no leitor de tela, deslizar para cima/baixo). Não entra no "% completo". Sobre a foto, "voltar" e "Editar" ganham fundo claro para continuar legíveis |
| Sem internet (T19) | a edição fica salva no celular e sobe sozinha quando a conexão volta; só **trocar a foto** exige internet |
