import { APP_NAME } from '../app';

import type { LegalDocs } from './types';

export const ptBR: LegalDocs = {
  privacy: [
    {
      title: 'Quais dados coletamos',
      body: `E-mail e senha (para sua conta), nome ou apelido, idade, objetivo, área de interesse e como você se sente com entrevistas. Se você quiser completar o Meu perfil, também guardamos o que você preencher lá: foto e capa, título, cidade, bio, competências, experiências, formação, cursos, idiomas, disponibilidade e links (LinkedIn, portfólio, Instagram). Também guardamos suas respostas das simulações, os textos ou o PDF do LinkedIn que você enviar, os relatórios gerados, as dicas que você leu ou salvou, os dias em que treinou e o idioma escolhido. Se você usar o Explorar, guardamos quem você segue, quem você bloqueou e as denúncias que fizer. Não pedimos CPF, telefone ou endereço.`,
    },
    {
      title: 'Para que usamos',
      body: `Só para o ${APP_NAME} funcionar: montar perguntas, dar feedback, gerar relatórios, mostrar seu progresso e escolher dicas para você. Seu perfil fica visível só para você, a não ser que você ligue "Aparecer no Explorar" (veja abaixo). Não vendemos seus dados e não usamos anúncios.`,
    },
    {
      title: 'Métricas de uso',
      body: `Para melhorar o app, registramos ações simples, como "concluiu uma simulação" ou "abriu a tela do Premium", com data e hora. Essas métricas nunca incluem o que você escreveu. Não usamos ferramentas de análise ou de anúncios de outras empresas.`,
    },
    {
      title: 'Uso de inteligência artificial',
      body: `Para gerar perguntas, feedback, relatórios e sugestões de bio, os textos necessários para cada pedido são enviados a um serviço de inteligência artificial de terceiros. Nunca enviamos seu e-mail ou sua senha. Seu nome só vai junto quando você pede uma sugestão de bio (ou se ele estiver no texto ou PDF que você mesmo enviar).`,
    },
    {
      title: 'Lembretes',
      body: `Se você ligar o lembrete diário, o aviso é agendado no seu próprio celular. Você pode desligar quando quiser, em Configurações ou nas configurações do celular.`,
    },
    {
      title: 'Explorar: o que outras pessoas veem',
      body: `A opção "Aparecer no Explorar" (Meu perfil › Editar › Privacidade) vem desligada. Se você ligar, quem tem conta no ${APP_NAME} pode encontrar seu perfil e ver: foto e capa, nome, título, cidade, bio, competências, objetivo, área, disponibilidade, formato de trabalho, experiências, formação e cursos, quantos seguidores você tem, quantas pessoas você segue e suas conquistas (primeira simulação, sequência de dias, LinkedIn analisado). Nunca mostramos seu e-mail, sua idade, seu plano, suas notas ou respostas das simulações, seus idiomas nem seus links. Ao desligar, seu perfil sai do Explorar na hora. Se você bloquear alguém, vocês deixam de ver o perfil um do outro, e a pessoa não é avisada. As denúncias são anônimas para quem foi denunciado: guardamos quem denunciou, o motivo, o texto e uma cópia do perfil denunciado, só para a moderação.`,
    },
    {
      title: 'Pagamento do Premium',
      body: `A assinatura é feita na página de pagamento da Stripe (empresa de pagamentos), que cobra o seu cartão todo mês. Para isso, a Stripe recebe o seu e-mail e os dados do cartão, e pode tratá-los fora do Brasil. Os dados do cartão ficam só com a Stripe: o ${APP_NAME} não vê nem guarda dados de cartão ou bancários. Guardamos apenas o valor, a data, a forma (ex.: "cartão de crédito") e a situação de cada cobrança e da assinatura, para liberar e comprovar o seu Premium.`,
    },
    {
      title: 'Por quanto tempo guardamos',
      body: `Seus dados ficam guardados enquanto sua conta existir. O PDF do LinkedIn é apagado logo depois de gerar o relatório. Ao apagar sua conta, tudo é apagado, inclusive as fotos e as métricas de uso.`,
    },
    {
      title: 'Seus direitos',
      body: `Você pode ver e corrigir seus dados, baixar uma cópia (Configurações › Exportar meus dados) e apagar sua conta (Configurações › Apagar minha conta) a qualquer momento, como garante a Lei Geral de Proteção de Dados (LGPD). Se precisar de ajuda, fale com a gente pelo contato abaixo.`,
    },
    {
      title: 'Contato',
      body: `Use "Ajuda e contato" em Configurações.`,
    },
  ],
  terms: [
    {
      title: 'O que é o app',
      body: `O ${APP_NAME} é uma ferramenta de treino e orientação para entrevistas e perfil profissional. Ele não garante contratação e não substitui apoio profissional.`,
    },
    {
      title: 'Quem pode usar',
      body: `Pessoas com 16 anos ou mais.`,
    },
    {
      title: 'Sua conta',
      body: `Você é responsável por manter sua senha em segredo. Use informações verdadeiras sobre você nos treinos.`,
    },
    {
      title: 'Conteúdo gerado por IA',
      body: `Feedbacks e sugestões são gerados automaticamente e podem ter erros. Use seu próprio julgamento antes de aplicar qualquer sugestão.`,
    },
    {
      title: 'Planos',
      body: `O plano gratuito tem limites de uso. O Premium é uma assinatura mensal pela Stripe, com renovação automática: o valor é cobrado no seu cartão todo mês, até você cancelar. O preço é em reais; se o seu cartão for de outro país, a página da Stripe pode mostrar o valor na sua moeda, com uma taxa de conversão de cerca de 2% a 4% já incluída. O Premium é liberado assim que a cobrança é aprovada. Você pode cancelar quando quiser, na tela Perfil ("Cancelar assinatura"): não haverá novas cobranças, e o Premium continua ativo até o fim do mês já pago.`,
    },
    {
      title: 'Desistência e reembolso',
      body: `Pelo Código de Defesa do Consumidor, você pode desistir da assinatura do Premium em até 7 dias depois da primeira cobrança e receber o valor de volta. Para isso, cancele a assinatura no Perfil e fale com a gente em "Ajuda e contato". O reembolso é feito pela Stripe, no mesmo cartão. Mesmo se você desistir, cancelar ou pedir o reembolso, o seu Premium continua ativo até o fim do mês daquela cobrança.`,
    },
    {
      title: 'Uso justo',
      body: `Para manter o app funcionando para todos, existem limites técnicos de uso, mesmo no Premium. Não é permitido tentar burlar esses limites ou usar o app para enviar conteúdo ofensivo ou ilegal. No Explorar, respeite as outras pessoas: perfil falso, assédio, ofensa, golpe e vaga falsa não são permitidos. Perfis denunciados são analisados e podem ser removidos.`,
    },
    {
      title: 'Mudanças',
      body: `Estes termos podem mudar. Quando isso acontecer, avisaremos no app.`,
    },
  ],
};
