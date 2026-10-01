# Auditoria e teste de carga — Siwki (30/09/2026)

Objetivo: avaliar se o app está pronto para um protótipo online com 5 a 10 avaliadores.
Escopo: código, build, banco (Supabase), Edge Functions e carga com várias contas. **Não** inclui teste visual em celular/emulador.

## 1. Verificações estáticas e de build

| Verificação | Resultado |
|---|---|
| Lint (`expo lint`) | sem erros |
| Tipos (`tsc --noEmit`) | sem erros |
| Testes automáticos (Jest) | 298 → 302 (4 novos para a validação do feedback) |
| `expo-doctor` | 21/21 |
| Bundle Android (Hermes) | gerou (9,2 MB) |
| Exportação web | falhava com `window is not defined` (ver item 4.1) |
| `npm audit` | 15 moderados, todos em ferramentas de build do Expo (`@expo/config-plugins`, `xcode`, `uuid`, `decode-uri-component` via `expo-router`/`query-string`). As correções sugeridas fazem downgrade do Expo: **não aplicar**. |

## 2. Segurança do banco

- `supabase/tests/rls_test.sql` (roda com rollback): **169 verificações OK**.
- Isolamento entre contas sob carga: uma conta lendo a sessão de outra vê 0 linhas.
- Tabela `notifications` é bloqueada de propósito; o app lê por RPC (`notifications_list`, `notifications_unread_count`, `notifications_mark_read`).

## 3. Teste de carga (contas `@teste.invalid`, criadas por SQL e apagadas no final)

Concorrência no banco e no login (10 contas ao mesmo tempo):
- 10 logins simultâneos: 10/10, ~1,3 s.
- 150 leituras das telas principais por rodada: sem falha real, ~140 ms depois do primeiro acesso.
- 50 edições de perfil em paralelo: 0 falhas.
- Limite do plano grátis (1 simulação/semana): bloqueou 100% das segundas tentativas.
- Corrida (1 conta grátis, 8 `start-interview` no mesmo instante): só 1 passa; as outras 7 recebem `LIMIT_REACHED` (`reserve_usage` é atômico).

Geração por IA (gargalo):
| Cenário | Antes das correções | Depois |
|---|---|---|
| 10 contas no mesmo instante (feedback) | 0/8 | 5/10 (com Gemini de reserva) |
| 10 contas, 1 a cada 5 s | 2/10 | 5/7 contas novas |
| 3 contas, 1 a cada 15 s | 1/3 | **3/3** |

## 4. Problemas encontrados e o que foi feito

### 4.1 Web não exportava (corrigido)
`app.json` tinha `web.output = "static"`; a renderização no servidor tocava em `window` (armazenamento da sessão do Supabase). Trocado para `"single"` (SPA). Exportação funciona (6,5 MB).

### 4.2 Feedback da IA rejeitado (corrigido, publicado e validado)
Causa real: o modelo devolvia `overall_score` **por extenso** (`"thirty"`) e a validação (`parseFeedback`) descartava o feedback inteiro. Parecia aleatório porque às vezes vinha `"45"`.
Correções em `supabase/functions/_shared/interview-logic.ts`:
- prompt pede a nota em dígitos, nunca por extenso;
- nota sem número vira a média das notas das respostas ×10;
- aceita notas como texto ("72/100", "7,5 de 10");
- aceita `question_id` em outro formato ("Q1", "1") e, se nada casar, usa a ordem;
- campos de apoio vazios/nulos (strengths, why, how, comment, suggested_answer) não derrubam mais o feedback.
Tela `src/app/simulacao/[id]/resultado.tsx` esconde as caixas "Pontos fortes" e "Resposta sugerida" quando vazias.

### 4.3 Limites do provedor de IA (mitigado, risco restante)
- Groq grátis (`openai/gpt-oss-120b`) responde `429` em rajada; Gemini (reserva) também tem cota baixa.
- `supabase/functions/_shared/llm.ts`: 3 tentativas com espera (respeita `retry-after`, teto 10 s, com variação aleatória); `FallbackClient` usa o Gemini quando o Groq recusa (429/5xx) se `GEMINI_API_KEY` existir (já configurada); `LLM_FAILED` agora traz `reason` (provedor, `retry-after`, formato do JSON, sem texto do usuário) para diagnóstico.
- Risco restante: a cota diária gratuita pode acabar no meio da avaliação. O plano pago do Groq elimina o risco. Meus testes consumiram bastante cota (>100 chamadas).
- O app deixa tentar de novo sem perder as respostas nem a simulação da semana (a vaga é devolvida quando a IA falha).

### 4.4 Pendências (não resolvidas)
1. **Brevo / SMTP**: confirmar no painel do Supabase. Sem ele, só membros da equipe criam conta (2 e-mails/hora). `config.toml` local tem o SMTP comentado; o estado remoto é desconhecido.
2. **Login por e-mail na web**: confirmação de e-mail está ligada (`mailer_autoconfirm=false`); os links de retorno cadastrados são só `pronto://**` e `exp://**`. Na web (`Linking.createURL('/')` aponta para a URL web) o link não funciona até o endereço público entrar nos redirects do Supabase. No APK Android funciona.
3. **Textos legais** (`src/i18n/legal/index.ts`) marcados "TEXTO PROVISÓRIO — revisar com advogado".
4. **Rota de desenvolvimento** `dev/componentes` ainda alcançável por deep link em produção.
5. **Stripe**: não se sabe se a chave é de teste ou real; não foi testado.
6. Não testados: telas/gestos/teclado/câmera, seletor de PDF, notificações, login com Google, análise do LinkedIn sob carga.
7. Detalhe: erro isolado `JWT issued at future` (relógio local adiantado) — só registro.

## 5. Como reproduzir o teste de carga
Criar contas por SQL (como `supabase/tests/e2e_ab_test.ps1`: insert em `auth.users` + `auth.identities`, e-mail `@teste.invalid`), rodar via `npx.cmd supabase db query --linked -f arquivo.sql </dev/null`, disparar chamadas HTTP em paralelo (login, `/rest/v1/*`, `/functions/v1/start-interview`, `/functions/v1/submit-interview`) e apagar com `delete from auth.users where email like '...@teste.invalid'`. Não repetir à toa: cada simulação gasta cota gratuita da IA.

## 6. Recomendação
Enviar o protótipo para Android (APK, `eas build --platform android --profile preview`) depois de resolver 4.4-1; a web só depois de 4.4-2. Decidir sobre o plano pago do Groq conforme a tolerância ao risco de cota.
