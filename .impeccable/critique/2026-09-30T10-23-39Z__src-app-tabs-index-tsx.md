---
target: home
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\HP\\Downloads\\projeto entrevista\\src\\app\\(tabs)\\index.tsx"
target_fingerprint: "sha256:845b3a06ce87f286a52e4e63877fdcd8dc692ecd5c878def9dcd794258afe3f9"
target_path: "C:\\Users\\HP\\Downloads\\projeto entrevista\\src\\app\\(tabs)\\index.tsx"
timestamp: 2026-09-30T10-23-39Z
slug: src-app-tabs-index-tsx
closed: true
---
# Crítica: Home (src/app/(tabs)/index.tsx) — 2026-09-30

Método: dual-agent (A: revisão de design · B: detector)

## Nota: 25/40 (Aceitável)
| # | Heurística | Nota | Problema |
|---|---|---|---|
| 1 | Status | 3 | Carregando mostra "Oi!"/"Atendimento"; dica do dia pisca (now = epoch 0 até carregar, index.tsx:55) |
| 2 | Mundo real | 3 | Meta de 3 simulações ignora plano grátis (1/semana) |
| 3 | Controle | 3 | Não dá para descartar simulação pendente |
| 4 | Consistência | 3 | "Começar simulação" abre configuração; menta+âmbar na mesma tela |
| 5 | Prevenção de erro | 2 | Grátis sem cota só descobre o limite 2 telas depois |
| 6 | Reconhecimento | 3 | ok |
| 7 | Eficiência | 2 | Sem início rápido |
| 8 | Minimalismo | 2 | 6–7 cartões, 3 medidores, faixa LinkedIn "Novo" permanente |
| 9 | Recuperação de erro | 2 | Só o card de progresso tem erro; outros somem |
| 10 | Ajuda | 2 | Nada explica o que conta para sequência/meta |

## Especificidade
Estrutura genérica de app de hábito. Código menos específico que o design (T05Home.dc.html:146 "Próximo passo" trocado por todayHint genérico). profile.nervousness nunca usado; tipOfTheDay igual para todos.
Detector: 0 achados na Home e componentes; 2 falsos positivos de fonte em BrandSplash.tsx:57,71.

## Pontos fortes
1. Gentle Score: "+N pontos" só se positivo; gráfico escala.
2. Cartão de continuar com texto tranquilizador.
3. A11y base: gráfico com label, reduce-motion, CTA sem esperar dados.

## Problemas prioritários
- [P0] Meta semanal (WEEKLY_GOAL=3, logic.ts:4) e sequência diária incompatíveis com plano grátis (1/semana); Home não lê usage. Fix: meta por plano, texto do que conta, estado "simulação grátis volta segunda" com dica como ação principal. → clarify, harden
- [P1] Dois CTAs com simulação pendente; "Continuar" é secundário (index.tsx:103-136). Fix: pendente vira cartão destaque primário. → layout
- [P1] Excesso de blocos/medidores. Fix: juntar Sequência+Meta em "Sua semana", esconder gráfico até 2 notas, expirar "Novo", restaurar "Próximo passo". → distill, onboard
- [P2] Falhas silenciosas/flash: now epoch, saudação/área padrão, skeleton único, erro pendente oculto, empty state errado com feedback pendente. → harden
- [P2] A11y/130%: 7 paradas dos dias, títulos sem role header, goalHead sem wrap (index.tsx:275-280,345), LinkedIn sem label. → adapt

## Personas
Iniciante: 3 medidores zerados; setup repete onboarding. Pressa/3G: conteúdo troca e CTA pula. Leitor de tela: 7 paradas, sem headers, emoji lido. Lu (17, jovem aprendiz, Android simples, grátis): "Treine hoje"/"1 de 3" a semana toda; dica que mantém sequência fica abaixo da dobra.

## Menores
Espaçamentos soltos (14, 18); todayTitle 20 fora da escala; SkeletonCard sem fundo; pendente antiga sem descarte; h.lastScore não usado.

## Perguntas
1. Sequência diária faz sentido com 1 simulação/semana?
2. Home em torno da próxima entrevista real?
3. Para quem é muito nervoso, placar ou acolhimento + 1 botão?
