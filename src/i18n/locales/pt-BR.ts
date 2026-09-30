/**
 * Todos os textos visíveis do app ficam aqui, para facilitar mudanças.
 * Tom: "você", frases curtas, acolhedor, no máximo 1 exclamação por tela.
 */

import { APP_NAME } from "../app";

export const ptBR = {
  common: {
    loading: "Carregando",
    tryAgain: "Tentar de novo",
    back: "Voltar",
    close: "Fechar",
    continue: "Continuar",
    notNow: "Agora não",
    copy: "Copiar",
    copied: "Copiado",
    premium: "Premium",
  },

  tabs: {
    home: "Início",
    train: "Treinar",
    explore: "Explorar",
    linkedin: "LinkedIn",
    tips: "Dicas",
    profile: "Perfil",
  },

  states: {
    offline: "Você está sem conexão",
    errorTitle: "Algo deu errado do nosso lado",
    errorText: "Não foi nada que você fez. Tente de novo em alguns segundos.",
    inputErrorPrefix: "Erro:",
  },

  /** Mensagens por código de erro das Edge Functions (src/lib/api.ts). */
  errors: {
    UNAUTHENTICATED: "Sua sessão expirou. Entre de novo.",
    INVALID_INPUT: "Confira os dados e tente de novo.",
    LIMIT_REACHED: "Você chegou ao limite do seu plano por enquanto.",
    PREMIUM_REQUIRED: "Essa parte é do plano Premium.",
    LLM_FAILED: "Não conseguimos gerar agora. Tente de novo.",
    PDF_UNREADABLE: "Não conseguimos ler esse PDF.",
    INTERNAL:
      "Algo deu errado do nosso lado. Tente de novo em alguns segundos.",
    NETWORK: "Sem conexão com a internet. Confira e tente de novo.",
  },

  /** Tela mostrada quando o .env ainda não foi preenchido. */
  config: {
    title: "Falta configurar o Supabase",
    text: "Copie o arquivo .env.example para .env, preencha a URL e a chave do seu projeto Supabase e reinicie o app. O passo a passo está no README.",
  },

  brand: {
    open: `Abrindo o ${APP_NAME}`,
    letsGo: "Vamos começar!",
  },

  welcome: {
    skip: "Pular",
    next: "Continuar",
    start: "Começar",
    step: (n: number) => `Passo ${n} de 3`,
    slides: [
      {
        title: "Entrevista não precisa dar medo",
        text: "Treine com calma, no seu ritmo, quantas vezes quiser.",
      },
      {
        title: "Feedback que ajuda de verdade",
        text: "Saiba o que está bom e o que melhorar, com exemplos prontos.",
      },
      {
        title: "Seu perfil pronto para ser notado",
        text: "Receba um relatório do seu LinkedIn e dicas para o mercado de trabalho.",
      },
    ],
  },

  auth: {
    headingSignUp: "Que bom ter você aqui",
    headingSignIn: "Bem-vindo(a) de volta",
    tabSignUp: "Criar conta",
    tabSignIn: "Entrar",
    email: "E-mail",
    emailPlaceholder: "voce@email.com",
    password: "Senha",
    emailInvalid: "Esse e-mail não parece certo",
    passwordShort: "Use pelo menos 8 caracteres",
    passwordWeak: "Use letras e números na senha",
    passwordEmpty: "Digite sua senha",
    termsPrefix: "Li e aceito os ",
    terms: "Termos",
    termsAnd: " e a ",
    privacy: "Política de Privacidade",
    termsRequired: "Para continuar, aceite os Termos.",
    submitSignUp: "Criar conta",
    submitSignIn: "Entrar",
    forgot: "Esqueci minha senha",
    wrongCredentials: "E-mail ou senha incorretos",
    alreadyRegistered: 'Esse e-mail já tem conta. Toque em "Entrar".',
    goToSignIn: "Ir para Entrar",
    tooManyAttempts: "Muitas tentativas. Aguarde 1 minuto e tente de novo.",
    emailLimit:
      "Muitos e-mails enviados na última hora. Espere cerca de 1 hora e tente de novo.",
    waitSeconds: (s: number) => `Aguarde ${s}s para tentar de novo.`,
    emailNotConfirmed: "Falta confirmar seu e-mail.",
    generic: "Não deu certo agora. Tente de novo em alguns segundos.",
    google: "Continuar com Google",
    googleFailed:
      "Não deu para entrar com o Google agora. Tente de novo ou use seu e-mail.",
    orEmail: "ou com e-mail",
    googleTermsPrefix: "Ao continuar com o Google, você aceita os ",
  },

  confirmEmail: {
    title: "Confirme seu e-mail",
    text: (email: string) =>
      `Enviamos um link para ${email}. Abra o e-mail neste celular e toque no link: o app abre e você já entra.`,
    hint: 'Não chegou? Olhe a caixa de spam ou promoções. Abriu o link no computador? Volte aqui e toque em "Já confirmei".',
    confirmed: "Já confirmei",
    resend: "Reenviar e-mail",
    resendIn: (s: number) => `Reenviar em ${s}s`,
    resent: "E-mail reenviado",
    notYet:
      "Ainda não recebemos a confirmação. Toque no link do e-mail e tente de novo.",
    changeEmail: "Usar outro e-mail",
  },

  forgot: {
    title: "Esqueci minha senha",
    text: "Digite seu e-mail. Vamos enviar um link para você criar uma senha nova.",
    send: "Enviar link",
    sent: "Se esse e-mail existir, enviamos um link. Abra o e-mail neste celular e toque no link.",
    ok: "Entendi",
  },

  newPassword: {
    title: "Crie uma senha nova",
    text: "Use pelo menos 8 caracteres, com letras e números. Depois é só continuar de onde parou.",
    label: "Senha nova",
    save: "Salvar senha nova",
    done: "Senha alterada",
    samePassword: "Essa já é a sua senha atual. Escolha outra.",
  },

  authLink: {
    expired: "Esse link venceu ou já foi usado. Peça um novo.",
    // PKCE: o link só entra na conta no celular que pediu o e-mail.
    otherDevice:
      "Abra o link no mesmo celular em que você pediu o e-mail. Se era a confirmação do cadastro, seu e-mail já está confirmado: é só entrar.",
  },

  onboarding: {
    progress: (n: number) => `Passo ${n} de 3`,
    nameTitle: "Como podemos te chamar?",
    namePlaceholder: "Seu nome ou apelido",
    nameInvalid: "Use de 2 a 40 letras",
    ageTitle: "Qual sua idade?",
    ageUnit: "anos",
    ageDecrease: "Diminuir idade",
    ageIncrease: "Aumentar idade",
    ageTooYoung: "O app é para maiores de 16 anos por enquanto",
    goalTitle: "O que você busca agora?",
    areaTitle: "Qual área te interessa?",
    feelTitle: "Como você se sente com entrevistas?",
    feelMin: "Muito nervoso(a)",
    feelMax: "Tranquilo(a)",
    next: "Continuar",
    finish: "Vamos lá",
    saveError: "Não deu para salvar. Tente de novo.",
  },

  options: {
    goal: {
      jovem_aprendiz: "Jovem aprendiz",
      estagio: "Estágio",
      primeiro_emprego: "Primeiro emprego",
      novo_emprego: "Novo emprego",
    },
    area: {
      atendimento: "Atendimento",
      vendas: "Vendas",
      administrativo: "Administrativo",
      tecnologia: "Tecnologia",
      marketing: "Marketing",
      logistica: "Logística",
      saude: "Saúde",
      outra: "Outra",
    },
    feel: [
      "Muito nervoso(a)",
      "Nervoso(a)",
      "Mais ou menos",
      "Calmo(a)",
      "Tranquilo(a)",
    ],
    availability: {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
      fim_de_semana: "Fim de semana",
    },
    workFormat: {
      presencial: "Presencial",
      hibrido: "Híbrido",
      remoto: "Remoto",
    },
    skillType: {
      comportamental: "Comportamental",
      tecnica: "Técnica",
    },
    educationStatus: {
      cursando: "Cursando",
      concluido: "Concluído",
      trancado: "Trancado",
    },
    languageLevel: {
      basico: "Básico",
      intermediario: "Intermediário",
      avancado: "Avançado",
      fluente: "Fluente",
      nativo: "Nativo",
    },
  },

  /** T18 Meu perfil. */
  myProfile: {
    title: "Meu perfil",
    edit: "Editar",
    editProfile: "Editar perfil",
    photoA11y: (name: string) => `Foto de perfil de ${name}`,
    noPhotoA11y: (name: string) => `Sem foto. Iniciais de ${name}`,
    complete: (pct: number) => `Perfil ${pct}% completo`,
    completeCta: "Completar",
    completeDone: "Tudo pronto. Seu perfil está completo.",
    missing: {
      photo: "Falta: adicionar uma foto.",
      headline: "Falta: escrever um título.",
      city: "Falta: dizer sua cidade.",
      bio: "Falta: contar um pouco sobre você (pelo menos 80 letras).",
      skills: "Falta: adicionar pelo menos 3 competências.",
      goal: "Falta: dizer o que você busca e quando pode trabalhar.",
      experience: "Falta: adicionar uma experiência.",
      education: "Falta: adicionar sua formação.",
      language: "Falta: adicionar um idioma.",
      linkedin: "Falta: colocar o link do seu LinkedIn.",
    },
    about: "Sobre mim",
    aboutEmpty: "Conte em poucas frases quem você é e o que busca.",
    aboutAdd: "Escrever sobre mim",
    skills: "Competências",
    skillsBehavioral: "COMPORTAMENTAIS",
    skillsTechnical: "TÉCNICAS",
    skillsHighlight: "Destacadas: bem avaliadas nas suas simulações",
    skillHighlightedA11y: (name: string) => `${name}, destacada`,
    skillsEmpty: "Mostre o que você sabe fazer.",
    skillsAdd: "Adicione suas competências",
    seeking: "O que eu busco",
    seekingGoal: "Objetivo",
    seekingArea: "Área",
    seekingAvailability: "Disponibilidade",
    seekingFormat: "Formato",
    notInformed: "A definir",
    experiences: "Experiências",
    experiencesEmpty:
      "Vale voluntariado, bico, projeto da escola e ajuda em negócio da família.",
    experiencesAdd: "Adicione uma experiência",
    education: "Formação",
    educationEmpty: "Coloque sua escola, curso técnico ou faculdade.",
    educationAdd: "Adicione sua formação",
    courses: "Cursos e certificados",
    languages: "Idiomas",
    languagesEmpty: "Português conta! Diga também se sabe outro idioma.",
    languagesAdd: "Adicione seus idiomas",
    links: "Links",
    linksEmpty: "Tem um portfólio ou site? Coloque o link aqui.",
    linksAdd: "Adicionar portfólio",
    socialLinkedIn: "LinkedIn",
    socialAdd: "Adicionar LinkedIn e Instagram",
    socialLinkedInA11y: "Abrir meu LinkedIn",
    socialInstagramA11y: (handle: string) => `Abrir meu Instagram, @${handle}`,
    analyzeLinkedIn: "Analisar meu LinkedIn",
    openLinkA11y: (url: string) => `Abrir ${url}`,
    openLinkError: "Não deu para abrir esse link.",
    achievements: `Conquistas no ${APP_NAME}`,
    achievementsEmpty:
      "Faça sua primeira simulação para ganhar a primeira conquista.",
    achievementFirst: "Primeira simulação",
    achievementStreak: (n: number) => `${n} dias seguidos`,
    achievementLinkedIn: "LinkedIn analisado",
    average: "Nota média nas simulações",
    averageHint: (n: number) =>
      n === 1
        ? "Com base em 1 simulação concluída."
        : `Com base em ${n} simulações concluídas.`,
    averageEmpty: "Conclua uma simulação para ver sua média aqui.",
    averageHidden: "Sua média está oculta. Só você pode mostrá-la de novo.",
    averageHide: "Ocultar",
    averageShow: "Mostrar",
    averageHideA11y: "Ocultar a nota média do perfil",
    averageShowA11y: "Mostrar a nota média no perfil",
    averageSaveError:
      "Não deu para salvar. Confira a internet e tente de novo.",
    /** "2024 até hoje", "ago 2026" (começo e fim iguais) ou "mar 2025 a dez 2025". */
    period: (start: string, end: string | null) => {
      if (end === null) return start ? `${start} até hoje` : "Até hoje";
      if (!start || !end || start === end) return start || end;
      return `${start} a ${end}`;
    },
    educationLine: (institution: string, status: string, year: string) => {
      if (status === "cursando")
        return [institution, year && `conclusão em ${year}`]
          .filter(Boolean)
          .join(" · ");
      if (status === "concluido")
        return [institution, year ? `Concluído em ${year}` : "Concluído"]
          .filter(Boolean)
          .join(" · ");
      return [institution, "Trancado"].filter(Boolean).join(" · ");
    },
    and: " e ",
    loadError:
      "Não deu para carregar seu perfil. Confira a internet e tente de novo.",
  },

  /** T19 Editar perfil. */
  editProfile: {
    title: "Editar perfil",
    closeA11y: "Voltar sem salvar",
    photoTitle: "Foto de perfil",
    photoHint: "Rosto visível e fundo simples. Pode ser do celular.",
    photoChange: "Trocar foto",
    photoRemove: "Remover foto",
    photoSheetTitle: "Foto de perfil",
    photoGallery: "Escolher da galeria",
    photoCamera: "Tirar uma foto",
    photoUploading: "Enviando foto",
    photoError:
      "Não deu para enviar a foto. Confira a internet e tente de novo.",
    photoDenied: "Sem permissão. Libere o acesso nas configurações do celular.",
    photoOffline: "Para trocar a foto, conecte-se à internet.",
    coverTitle: "Foto de capa",
    coverHint:
      "Uma imagem deitada: uma paisagem, sua cidade ou algo de que você gosta. Opcional.",
    coverChange: "Trocar capa",
    coverRemove: "Remover capa",
    coverUploading: "Enviando capa",
    coverError:
      "Não deu para enviar a capa. Confira a internet e tente de novo.",
    coverAdjust: "Ajustar posição",
    coverAdjustTitle: "Ajustar capa",
    coverAdjustHint:
      "Arraste a imagem para escolher a parte que aparece na capa.",
    coverAdjustCenter: "Centralizar",
    coverLoadError: "Não deu para abrir a imagem. Feche e tente de novo.",
    coverAdjustSave: "Usar esta posição",
    coverAdjustA11y:
      "Posição da capa. Deslize para cima ou para baixo para mover.",
    coverPlace: {
      x: {
        start: "mostrando o lado esquerdo",
        middle: "mostrando o meio",
        end: "mostrando o lado direito",
      },
      y: {
        start: "mostrando a parte de cima",
        middle: "mostrando o meio",
        end: "mostrando a parte de baixo",
      },
    },
    name: "Nome",
    headline: "Título",
    headlineHint: "O que você é e o que busca, em uma linha.",
    city: "Cidade",
    cityPlaceholder: "Ex.: São Paulo, SP",
    about: "Sobre mim",
    aboutHint: "Três frases: quem você é, o que já fez e o que busca.",
    aboutA11y: "Sobre mim",
    helpWrite: "Me ajude a escrever",
    helpTitle: "Uma sugestão para você",
    helpText: "Confira se está tudo certo. Você pode mudar depois.",
    helpUse: "Usar esta sugestão",
    helpKeep: "Manter o meu",
    helpApplied: "Sugestão aplicada. Edite à vontade.",
    helpError: "Não deu para criar a sugestão agora. Tente de novo.",
    skills: "Competências",
    skillInput: "Nova competência",
    skillPlaceholder: "Adicionar competência",
    skillAdd: "Adicionar",
    skillRemove: (name: string) => `Remover ${name}`,
    skillSuggestions: (area: string) => `SUGESTÕES PARA ${area.toUpperCase()}`,
    skillSuggestionA11y: (name: string) => `Adicionar ${name}`,
    skillDuplicate: "Essa competência já está na lista.",
    skillFull: "Você chegou ao limite de 15 competências.",
    skillTypeTitle: (name: string) => `"${name}" é de que tipo?`,
    skillTypeText:
      "Comportamental é jeito de agir (ex.: empatia). Técnica é algo que se aprende a fazer (ex.: Excel).",
    seeking: "O que você busca",
    goalA11y: "Objetivo",
    area: "Área",
    availability: "Disponibilidade",
    availabilityMulti: "(pode escolher várias)",
    format: "Formato",
    experiences: "Experiências",
    experiencesHint:
      "Vale voluntariado, bico, projeto da escola e ajuda em negócio da família.",
    addExperience: "+ Adicionar experiência",
    educationTitle: "Formação e cursos",
    addEducation: "+ Formação",
    addCourse: "+ Curso ou certificado",
    languages: "Idiomas",
    addLanguage: "+ Adicionar idioma",
    editItemA11y: (what: string) => `Editar ${what}`,
    links: "Links",
    linkedin: "LinkedIn",
    linkedinPlaceholder: "linkedin.com/in/seu-nome",
    instagram: "Instagram",
    instagramPlaceholder: "@seu.usuario",
    portfolio: "Portfólio ou outro link",
    optional: "(opcional)",
    privacyTitle: "Privacidade",
    publicTitle: "Perfil público",
    publicText:
      "Desligado: quem não te segue vê só foto, nome e @, e precisa pedir para te seguir.",
    privacy:
      "E-mail, idade e notas das simulações nunca aparecem para outras pessoas.",
    save: "Salvar alterações",
    saved: "Perfil atualizado",
    savedOffline: "Salvo no celular. Enviamos quando a internet voltar.",
    saveError: "Não deu para salvar. Tente de novo.",
    fixErrors: "Confira os campos marcados.",
    discardTitle: "Sair sem salvar?",
    discardText: "As mudanças que você fez vão se perder.",
    discardKeep: "Continuar editando",
    discardLeave: "Sair sem salvar",
    // Validação (mensagens gentis)
    nameEmpty: "Como podemos te chamar?",
    nameShort: "Use pelo menos 2 letras.",
    tooLong: (max: number) => `Use no máximo ${max} caracteres.`,
    linkInvalid: "Esse link não parece certo",
    instagramInvalid: "Digite só o seu usuário, ex.: @ana.souza",
    username: "Nome de usuário (@)",
    usernameHint:
      "É assim que as pessoas te acham no Explorar. Letras, números, ponto e _.",
    usernameEmpty: "Escolha um nome de usuário",
    usernameShort: (min: number) => `Use pelo menos ${min} caracteres`,
    usernameChars: "Use só letras sem acento, números, ponto e _",
    usernameEdges: "Comece e termine com uma letra ou número",
    usernameDots: "Não use dois pontos seguidos",
    usernameTaken: "Esse @ já está em uso. Tente outro",
    usernameChecking: "Conferindo se está livre…",
    usernameFree: (u: string) => `@${u} está disponível`,
    required: "Preencha este campo.",
    // Sheets de item
    sheetSave: "Salvar",
    sheetDelete: "Excluir",
    experienceSheet: "Experiência",
    expTitle: "O que você fazia",
    expTitlePlaceholder: "Ex.: Voluntária, Ajudante, Vendedor",
    expPlace: "Onde",
    expPlacePlaceholder: "Ex.: Feira de profissões, Loja da família",
    expStart: "Início",
    expStartPlaceholder: "Ex.: ago 2026",
    expEnd: "Fim",
    expEndPlaceholder: "Ex.: dez 2026",
    expCurrent: "Ainda faço isso",
    expDescription: "O que você fez (opcional)",
    expDescriptionPlaceholder: "Ex.: Atendi os visitantes e organizei a fila.",
    educationSheet: "Formação",
    eduCourse: "Curso",
    eduCoursePlaceholder: "Ex.: Ensino médio, Técnico em Administração",
    eduInstitution: "Escola ou faculdade",
    eduStatus: "Situação",
    eduYear: "Ano de conclusão",
    eduYearPlaceholder: "Ex.: 2027",
    courseSheet: "Curso ou certificado",
    courseName: "Nome do curso",
    courseNamePlaceholder: "Ex.: Excel básico",
    courseInstitution: "Onde fez (opcional)",
    courseYear: "Ano (opcional)",
    languageSheet: "Idioma",
    langName: "Idioma",
    langNamePlaceholder: "Ex.: Inglês",
    langLevel: "Nível",
  },

  profile: {
    planFree: "Grátis",
    planPremium: "Premium",
    planEyebrow: "SEU PLANO",
    planFreeTitle: "Grátis · 1 simulação por semana",
    planPremiumTitle: (until: string | null) =>
      until ? `Premium até ${until}` : "Premium",
    knowPremium: "Conhecer o Premium",
    progressTitle: "Meu progresso",
    statSimulations: "simulações",
    statAverage: "nota média",
    averageTitle: "Sua nota média",
    averageHint: "Considera todas as simulações que você concluiu.",
    averageEmpty: "Sem nota ainda",
    averageEmptyHint: "Conclua uma simulação para ver sua média aqui.",
    statStreak: "dias seguidos",
    myProfile: "Meu perfil",
    myProfileText: (pct: number) =>
      `Foto, bio, competências e mais · ${pct}% completo`,
    reminders: "Lembrete diário",
    remindersText: "Um aviso leve para treinar",
    privacy: "Privacidade",
    privacyPolicy: "Política de Privacidade",
    terms: "Termos de Uso",
    exportData: "Exportar meus dados",
    deleteAccount: "Apagar minha conta",
    help: "Ajuda e contato",
    signOut: "Sair",
    version: (v: string) => `Versão ${v}`,
    reminderSwitch: "Lembrete diário",
    reminderTime: "Horário",
    reminderTimeA11y: (time: string) => `Horário do lembrete: ${time}. Alterar`,
    reminderOn: (time: string) => `Lembrete ligado para ${time}.`,
    reminderOff: "Lembrete desligado.",
    reminderError: "Não deu para mudar o lembrete. Tente de novo.",
    reminderDeniedTitle: "As notificações estão desligadas",
    reminderDeniedText:
      "Para receber o lembrete, permita as notificações do app nas configurações do celular. Depois, volte aqui e ligue de novo.",
    reminderOpenSettings: "Abrir configurações",
    timeTitle: "Horário do lembrete",
    timeHour: "Hora",
    timeMinute: "Minuto",
    timeMore: (what: string) => `Aumentar ${what}`,
    timeLess: (what: string) => `Diminuir ${what}`,
    timeSave: "Salvar horário",
    exporting: "Preparando seus dados…",
    exportDone: "Arquivo pronto.",
    exportError:
      "Não deu para exportar agora. Confira a internet e tente de novo.",
    exportShareTitle: `Seus dados do ${APP_NAME}`,
    helpSubject: `Ajuda com o ${APP_NAME}`,
    helpBody: (email: string) =>
      `Oi! Preciso de ajuda com o ${APP_NAME}.\n\nE-mail da minha conta: ${email}\n\nMinha dúvida:\n`,
    contactMissing:
      "O contato ainda não foi configurado nesta versão de testes.",
    openError: (to: string) =>
      `Não deu para abrir o app de e-mail. Escreva para ${to}.`,
    deleteTitle: "Apagar sua conta?",
    deleteText:
      "Isso apaga seu perfil, simulações e relatórios para sempre. Para confirmar, digite APAGAR.",
    deleteWord: "APAGAR",
    deleteLabel: "Digite APAGAR",
    deleteConfirm: "Apagar para sempre",
    deleteDone: "Sua conta foi apagada.",
    signOutError: "Não deu para sair agora. Tente de novo.",
  },

  /** Configurações (aberta pelo Perfil). */
  settings: {
    title: "Configurações",
    language: "Idioma",
    notifications: "Notificações",
    account: "Conta e ajuda",
    showAverage: "Mostrar nota média",
    showAverageText: "Aparece no seu Meu perfil",
  },

  levels: {
    jovem_aprendiz: "Jovem aprendiz",
    estagio: "Estágio",
    primeiro_emprego: "Primeiro emprego",
    junior: "Júnior",
  },

  /** Selo de verificado ao lado do nome (leitor de tela). */
  verified: {
    blue: "Verificado: Premium",
    gold: "Verificado: criador do Siwki",
  },

  /** T5 Início. */
  home: {
    greeting: (name: string | null | undefined) =>
      name ? `Oi, ${name}! 👋` : "Oi! 👋",
    subtitle: "Cada treino deixa a próxima entrevista mais leve.",
    // Conta como dia praticado: simulação concluída, dica lida ou análise do LinkedIn (daily_activity).
    streakA11y: "Sequência de dias praticando",
    streakNewTitle: "Comece sua sequência",
    streakNewText:
      "Faça uma simulação ou leia uma dica para marcar o primeiro dia.",
    streakTitle: (n: number) =>
      n === 1 ? "1 dia praticando" : `${n} dias seguidos`,
    streakKeep: (next: number) =>
      `Uma simulação ou uma dica hoje e você chega a ${next}.`,
    streakDoneToday: "Você já praticou hoje. Até amanhã!",
    // Grátis que já usou a simulação da semana: só a dica está ao alcance hoje.
    streakNewTextTip: "Leia uma dica para marcar o primeiro dia.",
    streakKeepTip: (next: number) =>
      `Leia uma dica hoje e você chega a ${next}.`,
    weekLetters: ["S", "T", "Q", "Q", "S", "S", "D"],
    weekNames: [
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sábado",
      "domingo",
    ],
    weekA11y: "Esta semana",
    dayA11y: (name: string, done: boolean, today: boolean) =>
      `${name}${today ? " (hoje)" : ""}: ${done ? "praticou" : "não praticou"}`,
    goalTitle: "Meta da semana",
    goalText: (done: number, goal: number) =>
      `${Math.min(done, goal)} de ${goal} simulações`,
    goalCount: (done: number, total: number) => `${done} de ${total}`,
    goalFreeDetail: (sims: number, tips: number) =>
      `${sims} de 1 simulação · ${tips} de 2 dicas lidas`,
    goalFreeA11y: (sims: number, tips: number) =>
      `Meta da semana: ${sims} de 1 simulação e ${tips} de 2 dicas lidas`,
    goalDone: "Meta da semana completa",
    evolutionTitle: "Sua evolução",
    evolutionA11y: (scores: string) =>
      `Sua evolução. Notas das últimas simulações: ${scores}. Abrir meu progresso`,
    sinceFirst: (n: number) => `+${n} pontos desde a primeira`,
    and: "e",
    progressError:
      "Não deu para carregar seu progresso. Confira sua internet e tente de novo.",
    todayEyebrow: "TREINO DE HOJE",
    todayFirst: (n: number, min: number) =>
      `Sua primeira simulação: ${n} perguntas, cerca de ${min} min.`,
    todayNext: (step: string) =>
      `Próximo passo: ${step.charAt(0).toLowerCase()}${step.slice(1)}`,
    todayHint: (n: number, min: number) =>
      `${n} perguntas, cerca de ${min} min.`,
    newBadge: "Novo",
    start: "Começar simulação",
    // Grátis que já usou a simulação da semana (resets_at vem do servidor: sempre segunda 00:00).
    usedTitle: (tomorrow: boolean) =>
      tomorrow
        ? "Sua simulação grátis volta amanhã"
        : "Sua simulação grátis volta na segunda",
    usedTextTip: (title: string, min: number) =>
      `Enquanto isso, leia a dica do dia: “${title}” (${min} min). Ela também conta para sua sequência e sua meta.`,
    usedText:
      "Enquanto isso, leia uma dica. Ela também conta para sua sequência e sua meta.",
    readTip: "Ler a dica do dia",
    seeTips: "Ver dicas",
    usedPremium: "Treinar sem limite no Premium",
    pendingEyebrow: "SIMULAÇÃO PELA METADE",
    continueSim: "Continuar simulação",
    finishFeedback: "Concluir feedback",
    pendingAnswers: "Suas respostas estão salvas. Falta só gerar o feedback.",
    pendingDraft: "Continue de onde parou.",
    discard: "Descartar",
    discardTitle: "Descartar esta simulação?",
    discardText: "Ela sai da Início e não dá para continuar depois.",
    discardTextFree:
      "Ela sai da Início e não dá para continuar depois. A simulação grátis desta semana continua usada.",
    discardKeep: "Continuar com ela",
    discardConfirm: "Descartar simulação",
    discarded: "Simulação descartada.",
    discardError:
      "Não deu para descartar agora. Confira a internet e tente de novo.",
    actionError:
      "Não deu para carregar seu treino de hoje. Confira sua internet e tente de novo.",
    lastScore: (score: number) => `Última nota: ${score}`,
    linkedin: "Analise seu perfil do LinkedIn",
    // "Dicas para você" (T5): trilha em andamento + carrossel.
    tipsTitle: "Dicas para você",
    tipsSeeAll: "Ver todas",
    tipsSeeAllA11y: "Ver todas as dicas",
    trackEyebrow: (day: number, total: number) =>
      `SUA TRILHA · DIA ${day} DE ${total}`,
    trackStartEyebrow: (total: number) => `COMECE UMA TRILHA · ${total} DIAS`,
    trackToday: (title: string, min: number) => `Hoje: ${title} · ${min} min`,
    trackFirst: (title: string, min: number) =>
      `Primeira leitura: ${title} · ${min} min`,
    trackA11y: (track: string, day: number, total: number, title: string) =>
      `Sua trilha ${track}, dia ${day} de ${total}. Leitura de hoje: ${title}`,
    trackStartA11y: (track: string, title: string) =>
      `Começar a trilha ${track}. Primeira leitura: ${title}`,
    tipMinutes: (min: number) => `${min} min de leitura`,
    tipCardA11y: (
      title: string,
      category: string,
      min: number,
      locked: boolean,
    ) =>
      `${title}. ${category}, ${min} min de leitura${locked ? ". Premium" : ""}`,
  },

  /** T20 Explorar e T21 Perfil de outra pessoa. */
  follows: {
    title: "Conexões",
    followers: "Seguidores",
    following: "Seguindo",
    loadError: "Não foi possível carregar a lista agora.",
    emptyFollowersTitle: "Nenhum seguidor por aqui",
    emptyFollowingTitle: "Ninguém seguido por aqui",
    emptyFollowers: "Quando alguém seguir este perfil, aparece aqui.",
    emptyMyFollowers: "Quando alguém seguir você, aparece aqui.",
    emptyFollowing: "Este perfil ainda não segue ninguém.",
    emptyMyFollowing:
      "Siga pessoas com objetivos parecidos para trocar experiências.",
    findPeople: "Encontrar pessoas",
    hiddenNote: "Alguns perfis não aparecem na lista, mas contam no número.",
    openA11y: (label: string) => `Ver ${label}`,
    requests: "Solicitações",
    emptyRequestsTitle: "Nenhuma solicitação",
    emptyRequests:
      "Quando alguém pedir para seguir seu perfil privado, aparece aqui.",
    accept: "Aceitar",
    decline: "Recusar",
    accepted: "Solicitação aceita.",
    declined: "Solicitação recusada.",
    respondError: "Não deu para responder agora. Tente de novo.",
    requestsLabel: (n: number) => (n === 1 ? "solicitação" : "solicitações"),
  },
  explore: {
    title: "Explorar",
    search: "Buscar por nome, @, área ou competência",
    searchA11y: "Buscar pessoas",
    clearSearch: "Limpar busca",
    filtersA11y: "Filtros",
    near: "Perto de mim",
    nearNeedsCity:
      'Coloque sua cidade no Meu perfil para usar o "Perto de mim".',
    privateTitle: "Seu perfil está privado",
    privateText:
      "As pessoas veem só sua foto, nome e @, e precisam pedir para te seguir.",
    privateLink: "Deixar público",
    similarTitle: "Com objetivos parecidos",
    similarText: (goal: string, area: string) =>
      `Também buscam ${goal.toLowerCase()} em ${area.toLowerCase()}`,
    results: "Resultados",
    peopleTitle: "Pessoas para conhecer",
    offlineTitle: "Sem internet",
    offlineText: "Confira sua conexão e tente de novo.",
    loadError: "Não deu para carregar as pessoas agora.",
    emptyTitle: "Ninguém encontrado",
    emptyText: "Tente outro nome ou tire um filtro.",
    emptyNobody: "Ainda não tem ninguém por aqui. Volte daqui a pouco.",
    clearAll: "Limpar busca e filtros",
    follow: "Seguir",
    following: "Seguindo",
    followA11y: (label: string, name: string) => `${label} ${name}`,
    followError: "Não deu para seguir agora. Tente de novo.",
    unfollowError: "Não deu para deixar de seguir agora. Tente de novo.",
    unavailableToast: "Este perfil não está mais disponível.",
    requested: "Solicitado",
    requestSent: "Solicitação enviada.",
    privateProfileTitle: "Este perfil é privado",
    privateProfileText:
      "Siga para ver o perfil completo. A pessoa precisa aceitar.",
    privateProfileRequested:
      "Solicitação enviada. Você verá o perfil completo quando ela aceitar.",
    personA11y: (name: string, detail: string) =>
      detail ? `${name}. ${detail}. Abrir perfil` : `${name}. Abrir perfil`,
    moreA11y: "Mais opções",
    unavailableTitle: "Este perfil não está disponível",
    unavailableText: "Ele pode ter sido bloqueado ou não existir mais.",
    followersLabel: (n: number) => (n === 1 ? "seguidor" : "seguidores"),
    followingLabel: "seguindo",
    experienceTitle: "Experiência e formação",
    achievementsEmpty: "Ainda sem conquistas.",
    scoresHidden: "Notas das simulações não são mostradas para outras pessoas.",
    report: "Denunciar perfil",
    block: (name: string) => (name ? `Bloquear ${name}` : "Bloquear"),
    blockNote:
      "A pessoa não vai saber. Vocês param de ver o perfil um do outro.",
    blocked: "Perfil bloqueado.",
    blockError: "Não deu para bloquear agora. Tente de novo.",
    cancel: "Cancelar",
    reportTitle: "Por que você quer denunciar?",
    reportText: "Sua denúncia é anônima. Vamos analisar com cuidado.",
    reportReasonA11y: "Motivo",
    reasons: {
      perfil_falso: "Perfil falso",
      assedio: "Assédio ou ofensa",
      golpe: "Golpe ou vaga falsa",
      conteudo_improprio: "Conteúdo impróprio",
      outro: "Outro motivo",
    },
    reportDetail: "Quer contar mais? (opcional)",
    reportSend: "Enviar denúncia",
    reportSent: "Denúncia enviada. Obrigado por avisar.",
    reportLimit: "Você já enviou muitas denúncias hoje. Tente amanhã.",
    reportError: "Não deu para enviar agora. Tente de novo.",
  },

  /** T6 Nova simulação. */
  train: {
    title: "Nova simulação",
    areaTitle: "Qual vaga você quer treinar?",
    levelTitle: "Nível",
    countTitle: "Quantas perguntas?",
    duration: (min: number) =>
      `Leva cerca de ${min} minutos. Não tem nota que reprova, é só treino.`,
    freeLeftPrefix: "Você tem ",
    freeLeftBold: "1 simulação grátis",
    freeLeftSuffix: " esta semana",
    freeUsed: "Simulação grátis da semana já usada",
    start: "Começar",
    recent: "Simulações recentes",
    recentEmptyTitle: "Nenhuma simulação ainda",
    recentEmptyText: (min: number) => `Sua primeira leva uns ${min} minutos.`,
    recentEmptyAction: "Fazer a primeira",
    recentA11y: (area: string, date: string, score: number) =>
      `${area}, ${date}, nota ${score}. Abrir resultado`,
    startError: "Não conseguimos montar as perguntas agora. Tente de novo.",
    limitTitle: "Você usou sua simulação grátis desta semana",
    limitText:
      "Ela volta na segunda-feira. Enquanto isso, que tal ler uma dica?",
    limitPremium: "Conhecer o Premium",
    limitBack: "Voltar",
    loadError: "Não deu para carregar. Puxe para atualizar.",
  },

  /** T7a e T7 Respondendo. */
  simulation: {
    breatheTitle: "Respire fundo.\nVocê está só treinando.",
    breatheText:
      "Inspire enquanto o círculo cresce, solte o ar devagar quando ele diminui.",
    ready: "Estou pronto(a)",
    cvv: "Está muito difícil? Conversar com alguém (CVV 188)",
    progress: (n: number, total: number) => `Pergunta ${n} de ${total}`,
    answerLabel: "Sua resposta",
    answerPlaceholder:
      "Escreva sua resposta com calma. Não precisa ser perfeita.",
    tooShort: "Escreva um pouco mais para eu poder ajudar",
    hint: "Dica",
    hintTitle: "Dica para esta pergunta",
    hintOk: "Entendi",
    send: "Enviar resposta",
    finish: "Enviar e finalizar",
    exitTitle: "Sair da simulação?",
    exitText: "Se sair agora, suas respostas não serão salvas.",
    exitStay: "Continuar",
    exitLeave: "Sair sem salvar",
    exitError: "Não deu para sair agora. Tente de novo.",
    closed: "Essa simulação já foi encerrada.",
  },

  /** T8 Gerando feedback. */
  generating: {
    phrases: [
      "Lendo suas respostas…",
      "Separando o que ficou bom…",
      "Preparando dicas para você…",
    ],
    wait: "Isso leva uns segundinhos.",
    errorTitle: "Não conseguimos gerar seu feedback agora",
    errorText:
      "Suas respostas estão salvas. Tente de novo, sem precisar escrever nada.",
    later: "Ver depois",
  },

  /** T9 Resultado. */
  result: {
    title: "Seu resultado",
    delta: (n: number) => `+${n} desde a última`,
    good: "O que foi bem",
    improve: "O que melhorar",
    why: "Por quê · ",
    how: "Como fazer · ",
    perAnswer: "Resposta por resposta",
    yourAnswer: "SUA RESPOSTA",
    suggested: "UMA RESPOSTA SUGERIDA",
    fillers: "Palavras repetidas que apareceram",
    nextStep: "Seu próximo passo",
    again: "Treinar de novo",
    home: "Voltar ao início",
    cvv: "Precisa conversar com alguém? CVV 188",
    answerA11y: (n: number, score: number) =>
      `Pergunta ${n}, nota ${score} de 10`,
  },

  /** T10 LinkedIn início. */
  linkedin: {
    title: "Seu LinkedIn",
    subtitle:
      "Envie o PDF do seu perfil e receba um relatório com o que melhorar.",
    pdfTitle: "Enviar PDF do perfil",
    pdfText: "O jeito mais rápido",
    pasteTitle: "Colar os textos",
    pasteText: "Se não conseguir baixar o PDF",
    howTo: "Como baixar meu perfil em PDF?",
    privacy:
      "Seu arquivo é usado só para gerar o relatório e depois é apagado.",
    history: "Relatórios anteriores",
    historyFull: "Relatório completo",
    historySummary: "Resumo",
    historyA11y: (kind: string, date: string, score: number) =>
      `${kind}, ${date}, nota ${score}. Abrir relatório`,
    historyEmpty: "Seus relatórios aparecem aqui.",
    loadError: "Não deu para carregar. Puxe para atualizar.",
    freeLeft: "Você tem 1 análise grátis (resumo) por mês.",
    freeUsed: (date: string) =>
      `Análise grátis do mês já usada. Volta em ${date}.`,
    premiumLeft: (left: number) =>
      left === 1
        ? "Resta 1 análise completa neste mês."
        : `Restam ${left} análises completas neste mês.`,
    helpTitle: "Como baixar seu perfil em PDF",
    helpIntro:
      "O PDF só pode ser baixado pelo site do LinkedIn, no navegador. O aplicativo do LinkedIn não tem essa opção.",
    helpOpen: "Abrir o LinkedIn no navegador",
    helpCopy: "Copiar link",
    helpCopied: "Link copiado",
    helpOpenError:
      "Não deu para abrir o navegador. Copie o link e cole no Safari ou no Chrome.",
    helpSteps: {
      open: {
        title: "Abra o LinkedIn no navegador",
        text: "Toque no botão abaixo e entre na sua conta. Se abrir o aplicativo do LinkedIn, volte, toque em “Copiar link” e cole na barra de endereço do Safari ou do Chrome.",
      },
      desktop: {
        title: "Peça a versão para computador",
        ios: "No Safari, toque em “aA” (na barra de endereço) e depois em “Solicitar Site para Computador”.",
        android:
          "No Chrome, toque nos 3 pontinhos (⋮) e marque “Site para computador”.",
      },
      save: {
        title: "Salve o perfil em PDF",
        text: "No seu perfil, toque em “Mais” (abaixo da sua foto) e depois em “Salvar como PDF”.",
      },
      find: {
        title: "Encontre o arquivo",
        ios: "O PDF vai para o app Arquivos, na pasta Downloads.",
        android: "O PDF vai para a pasta Downloads do celular.",
      },
      send: {
        title: "Volte aqui e envie",
        text: "Toque em “Enviar PDF do perfil” e escolha o arquivo baixado.",
      },
    },
    helpComputer:
      "Prefere o computador? Faça os passos 1 e 3 no navegador do computador e mande o PDF para o celular (e-mail, WhatsApp ou Google Drive).",
    helpOk: "Entendi",
    limitTitle: "Você já usou sua análise grátis deste mês",
    limitTitlePremium: "Você chegou ao limite de análises do mês",
    limitText: (date: string) =>
      `Ela volta em ${date}. No Premium, o relatório vem completo, com notas por seção e textos prontos.`,
    limitTextPremium: (date: string) => `As análises voltam em ${date}.`,
    limitPremium: "Conhecer o Premium",
    limitBack: "Voltar",
  },

  /** T11 Enviar / colar. */
  analyze: {
    title: "Analisar perfil",
    tabPdf: "Enviar PDF",
    tabPaste: "Colar textos",
    pick: "Toque para escolher o arquivo",
    pickHint: "PDF de até 5 MB",
    change: "Trocar arquivo",
    notPdfTitle: "Esse arquivo não é um PDF",
    tooBigTitle: "O arquivo passou de 5 MB",
    fileHelp:
      "Para funcionar, precisamos do PDF que o próprio LinkedIn gera. No seu perfil, toque em Mais › Salvar como PDF e envie o arquivo baixado.",
    unreadableTitle: "Não conseguimos ler esse PDF",
    preferPaste: "Prefiro colar os textos",
    pickOther: "Escolher outro arquivo",
    pickError: "Não deu para abrir o arquivo. Tente de novo.",
    fields: {
      headline: {
        label: "Título",
        help: "A frase que aparece embaixo do seu nome.",
      },
      about: { label: "Sobre", help: "O resumo que você escreveu sobre você." },
      experience: {
        label: "Experiências",
        help: "Empregos, estágios, voluntariado ou projetos.",
      },
      education_skills: {
        label: "Formação e habilidades",
        help: "Escola, cursos e o que você sabe fazer.",
      },
    },
    pasteMin:
      "Preencha o “Sobre” ou as “Experiências” com pelo menos 50 caracteres.",
    filled: "Preenchido",
    roleLabel: "Que vaga você quer?",
    roleOptional: " (opcional)",
    rolePlaceholder: "Ex.: Atendimento ao cliente",
    roleHint: "Assim as sugestões ficam mais certeiras.",
    submit: "Analisar meu perfil",
    phrases: [
      "Lendo seu perfil…",
      "Separando o que já está bom…",
      "Montando sugestões para você…",
    ],
    wait: "Isso leva uns segundinhos.",
    errorTitle: "Não conseguimos analisar agora",
    errorText: "Não foi nada que você fez. Tente de novo em alguns segundos.",
    uploadError:
      "Não deu para enviar o arquivo. Confira a internet e tente de novo.",
  },

  /** T12 Relatório do LinkedIn. */
  linkedinReport: {
    title: "Relatório do LinkedIn",
    headline: {
      high: "Seu perfil já chama atenção.",
      mid: "Seu perfil está no caminho certo.",
      low: "Seu perfil tem muito espaço para crescer.",
    },
    role: (role: string) => `Vaga desejada: ${role}`,
    priorities: "Faça primeiro",
    priority: {
      alta: "Prioridade alta",
      media: "Prioridade média",
      baixa: "Prioridade baixa",
    },
    sections: "Seções do perfil",
    sectionName: {
      headline: "Título",
      about: "Sobre",
      experience: "Experiências",
      education: "Formação",
      skills: "Habilidades",
      photo_banner: "Foto e banner",
    },
    sectionA11y: (name: string, score: number | null) =>
      score === null ? name : `${name}, nota ${score} de 10`,
    diagnosis: "Diagnóstico · ",
    suggestion: "Sugestão · ",
    beforeAfter: "ANTES E DEPOIS",
    before: "Antes · ",
    after: "Depois · ",
    copySuggestion: "Copiar sugestão",
    titles: "Opções de título",
    copyTitle: "Copiar título",
    about: "Sugestão de “Sobre”",
    keywords: "Palavras-chave para incluir",
    checklist: "Checklist final",
    checklistCount: (done: number, total: number) => `${done} de ${total}`,
    checklistError: "Não deu para salvar o checklist. Tente de novo.",
    lockedTitle: "Tem mais no seu relatório",
    lockedText: "Notas por seção, antes e depois, títulos prontos e checklist.",
    lockedCta: "Ver relatório completo",
  },

  /** T13 Dicas. */
  tips: {
    title: "Dicas",
    search: "Buscar dicas",
    filtersA11y: "Categorias",
    all: "Todas",
    saved: "Salvas",
    forYou: "Para você",
    forYouTitle: "Escolhidas para você",
    forYouBasis: (bits: string) => `Com base no seu cadastro: ${bits}.`,
    forYouBasisGeneric: "Com base no que você contou no cadastro.",
    forYouEmptyTitle: "Ainda não temos dicas só para o seu perfil",
    forYouEmptyText:
      "Estamos criando mais dicas. Enquanto isso, veja todas as dicas.",
    category: {
      curriculo: "Currículo",
      entrevista: "Entrevista",
      linkedin: "LinkedIn",
      primeiro_emprego: "Primeiro emprego",
      direitos: "Direitos",
      salario: "Salário",
    },
    tracks: "Trilhas",
    trackMeta: (read: number, total: number) =>
      read === 0
        ? `${total} dicas · não iniciada`
        : read >= total
          ? `${total} dicas · concluída`
          : `${total} dicas · ${read} lidas`,
    trackA11y: (title: string, read: number, total: number) =>
      `Trilha ${title}: ${read} de ${total} dicas lidas. Abrir a próxima`,
    meta: (category: string, min: number) => `${category} · ${min} min`,
    read: "Lida",
    tipA11y: (title: string, meta: string, locked: boolean, read: boolean) =>
      `${title}. ${meta}${locked ? ". Premium" : ""}${read ? ". Lida" : ""}`,
    save: "Salvar dica",
    unsave: "Tirar dos salvos",
    saveError: "Não deu para salvar. Tente de novo.",
    loadError: "Não deu para carregar as dicas.",
    noResultsTitle: "Nenhuma dica encontrada",
    noResultsText: "Tente outra palavra ou outra categoria.",
    clearSearch: "Limpar busca",
    savedEmptyTitle: "Nenhuma dica salva",
    savedEmptyText: "Toque no marcador de uma dica para guardar aqui.",
    savedEmptyAction: "Ver dicas",
    premiumTitle: "Essa dica é do Premium",
    premiumText:
      "No Premium você lê todas as dicas e trilhas, faz simulações sem limite e recebe o relatório completo do LinkedIn.",
    premiumCta: "Conhecer o Premium",
  },

  /** T14 Leitura de dica. */
  tipRead: {
    meta: (category: string, min: number) =>
      `${category} · ${min} min de leitura`,
    example: "EXEMPLO",
    warning: "CUIDADO",
    source: "FONTE",
    sources: "FONTES",
    sourceA11y: (title: string) => `Fonte: ${title}. Abre no navegador`,
    sourceError: "Não deu para abrir o link agora.",
    helpful: "Isso foi útil?",
    helpfulYes: "Sim, foi útil",
    helpfulNo: "Não foi útil",
    markRead: "Marcar como lida",
    done: "Lida",
    next: (min: number) => `Próxima dica · ${min} min`,
    nextA11y: (title: string) => `Próxima dica: ${title}`,
    readError: "Não deu para marcar agora. Tente de novo.",
    voteError: "Não deu para salvar seu voto. Tente de novo.",
    notFound: "Essa dica não está mais disponível.",
    lockedTitle: "Essa dica é do Premium",
    lockedText: "Assine o Premium para ler esta e todas as outras dicas.",
  },

  /** T16 Premium. */
  premium: {
    title: "Treine sem limites",
    subtitle:
      "Tudo o que você precisa para chegar mais seguro(a) na entrevista.",
    benefits: [
      "Simulações ilimitadas",
      "Relatório completo do LinkedIn",
      "Todas as dicas e trilhas",
      "Histórico e evolução completos",
      "Novidades primeiro",
    ],
    planEyebrow: "PREMIUM MENSAL",
    priceA11y: (price: string, period: string) =>
      `Premium mensal: ${price} ${period}`,
    perMonth: "por mês",
    cta: "Quero o Premium",
    noLockIn:
      "Renova sozinho todo mês. Cancele quando quiser: o Premium continua até o fim do mês pago.",
    alreadyRenews: (date: string) =>
      `Sua assinatura renova sozinha em ${date}.`,
    alreadyNoRenew:
      "Não há renovação automática ativa: não haverá novas cobranças.",
    notNow: "Agora não",
    alreadyTitle: "Você já é Premium",
    alreadyUntil: (date: string) => `Seu Premium vale até ${date}.`,
    alreadyNoDate: "Seu Premium está ativo.",
    alreadyText:
      "Aproveite as simulações, o relatório completo do LinkedIn e todas as dicas.",
    alreadyBack: "Voltar",
    reactivate: "Ativar renovação automática",
    activated: "Seu Premium está ativo. Aproveite!",
  },

  /** T17 Assinatura (Stripe, renovação automática). */
  payment: {
    title: "Assinatura",
    subtitle:
      "Você vai para a página segura de pagamento da Stripe, cadastra o cartão e volta para cá.",
    amount: (price: string) => `${price} por mês`,
    otherCurrency:
      "Cartão de outro país? A página de pagamento pode mostrar o valor na sua moeda.",
    howTitle: "Como funciona",
    how: [
      "A cobrança é feita no seu cartão, todo mês, no mesmo dia.",
      "O Premium renova sozinho enquanto a assinatura estiver ativa.",
      "Cancele quando quiser, no Perfil. O Premium continua até o fim do mês já pago.",
    ],
    noRenewal: `Os dados do cartão ficam só com a Stripe, empresa de pagamentos. O ${APP_NAME} não vê nem guarda o seu cartão.`,
    deferred: (date: string) =>
      `Nada é cobrado agora: você já tem Premium pago até ${date}. A primeira cobrança é nesse dia, e depois todo mês.`,
    pay: "Assinar com cartão",
    help: "Precisa de ajuda? Fale com a gente",
    helpSubject: "Ajuda com a assinatura do Premium",
    helpBody: (email: string) =>
      `Oi! Preciso de ajuda com a assinatura do Premium do ${APP_NAME}.\n\nE-mail da minha conta: ${email}\n\nO que aconteceu:\n`,
    startError:
      "Não conseguimos abrir a assinatura agora. Tente de novo em alguns segundos.",
    browserError: "Não deu para abrir a página de pagamento. Tente de novo.",
    // Tela de acompanhamento (depois de voltar da página de pagamento).
    checkingTitle: "Confirmando sua assinatura",
    checkingText:
      "Assim que a primeira cobrança for aprovada, o Premium entra sozinho. Costuma levar poucos segundos.",
    checkNow: "Já assinei, verificar agora",
    backToPay: "Voltar para o pagamento",
    closeLater: "Fechar e ver depois",
    laterHint:
      "Pode fechar: quando a cobrança for aprovada, o Premium é liberado sozinho.",
    approvedTitle: "Assinatura ativa!",
    approvedText: (date: string | null) =>
      date
        ? `Seu Premium está ativo e renova sozinho. Próxima renovação por volta de ${date}.`
        : "Seu Premium está ativo e renova sozinho.",
    approvedCta: "Começar a usar",
    failedTitle: "A assinatura não foi concluída",
    failedText: "Nada foi cobrado. Confira os dados do cartão e tente de novo.",
    tryAgain: "Tentar de novo",
    notFound: "Não encontramos essa assinatura.",
  },

  /** Assinatura no Perfil. */
  subscription: {
    renews: (date: string) => `Renova sozinho em ${date}`,
    notRenewing: (date: string) => `Premium até ${date} · não renova`,
    cancel: "Cancelar assinatura",
    cancelTitle: "Cancelar a assinatura?",
    cancelText: (date: string | null) =>
      date
        ? `Não haverá novas cobranças. Seu Premium continua até ${date}.`
        : "Não haverá novas cobranças. Seu Premium continua até o fim do mês já pago.",
    cancelConfirm: "Cancelar assinatura",
    keep: "Manter assinatura",
    cancelled: (date: string | null) =>
      date
        ? `Assinatura cancelada. Seu Premium continua até ${date}.`
        : "Assinatura cancelada.",
    cancelError:
      "Não deu para cancelar agora. Tente de novo em alguns segundos.",
  },

  /** Lembrete diário (notificação local). Uma mensagem por dia da semana, sem cobrança. */
  reminders: {
    channel: "Lembrete diário",
    title: APP_NAME,
    messages: [
      "Que tal 5 minutinhos de treino hoje? Cada resposta deixa a próxima mais fácil.",
      "Sua próxima entrevista agradece. Bora treinar uma pergunta?",
      "Um passo pequeno hoje já conta. Tem uma dica rápida te esperando.",
      "Escrever suas respostas com calma ajuda a organizar as ideias. Vamos treinar?",
      "Você está construindo confiança aos pouquinhos. Que tal continuar hoje?",
      "Sem pressão: se der, faça um treino rápido. Se não der, tudo bem também.",
      "Lembrete amigo: seu perfil e suas respostas ficam melhores a cada treino.",
    ],
  },

  /** Aviso global de conexão. */
  network: {
    offline: "Você está sem conexão. Dá para ler o que já carregou.",
  },

  /** E07 Conquistas. */
  achievement: {
    firstTitle: "Primeira simulação feita",
    firstText: "O mais difícil é começar, e você já começou.",
    streak3Title: "3 dias seguidos",
    streak3Text: "Constância vale mais que perfeição. Continue no seu ritmo.",
    streak7Title: "Uma semana inteira",
    streak7Text:
      "7 dias treinando. Sua próxima entrevista vai sentir a diferença.",
    continue: "Continuar",
  },

  disclaimer: `O ${APP_NAME} é uma ferramenta de treino e orientação. Ele não garante contratação e não substitui apoio profissional.`,

  /** Linha de apoio emocional gratuita do país do idioma (CVV no Brasil, 3114 na França...). */
  crisis: { url: "https://cvv.org.br" },

  legal: {
    draftBanner: "TEXTO PROVISÓRIO: revisar com advogado antes do lançamento.",
    termsTitle: "Termos de Uso",
    privacyTitle: "Política de Privacidade",
  },

  // Telas provisórias da Fase 1 (serão substituídas nas próximas fases).
  placeholder: {
    title: "Em construção",
    text: "Esta parte do app chega nas próximas fases.",
    showcase: "Ver componentes",
  },

  /** Tela Idioma (Configurações). */
  language: {
    title: "Idioma",
    device: "Idioma do celular",
    deviceText: (name: string) => `Agora: ${name}`,
    changed: (name: string) => `Idioma alterado para ${name}.`,
    note: "As dicas, as perguntas e o feedback da IA mudam junto. Cada idioma tem dicas do mercado de trabalho do seu país.",
  },

  /** Datas e números no idioma da pessoa (sempre no fuso de São Paulo). */
  dates: {
    locale: "pt-BR",
    months: [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ],
    short: (day: number, month: string) => `${day} ${month}`,
    full: (dd: string, mm: string, yyyy: number) => `${dd}/${mm}/${yyyy}`,
  },

  appearance: {
    title: "Aparência",
    light: "Claro",
    dark: "Escuro",
    auto: "Automático",
  },

  scoreRing: {
    high: "Mandou bem",
    mid: "Bom começo",
    low: "Em construção",
    outOf: "de 100",
    a11y: (score: number, label: string) => `Nota ${score} de 100. ${label}`,
  },

  input: {
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    counter: (len: number, max: number) => `${len}/${max}`,
  },

  sheet: {
    handle: "Arraste para fechar",
  },

  // Tela de teste dos componentes (só para desenvolvimento).
  showcase: {
    title: "Componentes",
    buttons: "Botões",
    fields: "Campos",
    chips: "Chips e selo",
    cards: "Cards e progresso",
    score: "Anel de nota",
    feedback: "Toast, bottom sheet e vazio",
    skeleton: "Skeleton",
    primary: "Começar simulação",
    secondary: "Ver dica",
    skip: "Pular",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@email.com",
    emailError: "Esse e-mail não parece certo",
    passwordLabel: "Senha",
    answerLabel: "Sua resposta",
    answerPlaceholder:
      "Escreva sua resposta com calma. Não precisa ser perfeita.",
    cardTitle: "Como responder “fale sobre você”",
    cardMeta: "Entrevista · 2 min",
    highlightEyebrow: "TREINO DE HOJE",
    highlightTitle: "Atendimento · 5 perguntas",
    goal: "1 de 3 simulações",
    goalDone: "Meta completa",
    toastSuccess: "Sugestão copiada",
    toastError: "Não deu para salvar. Tente de novo.",
    showToastSuccess: "Toast de sucesso",
    showToastError: "Toast de erro",
    openSheet: "Abrir bottom sheet",
    sheetTitle: "Sair da simulação?",
    sheetText: "Se sair agora, suas respostas não serão salvas.",
    sheetLeave: "Sair sem salvar",
    emptyTitle: "Nenhuma dica salva ainda",
    emptyAction: "Ver dicas",
    chipsArea: ["Atendimento", "Vendas", "Tecnologia"],
  },
} as const;
