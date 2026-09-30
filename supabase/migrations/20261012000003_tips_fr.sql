-- Dicas em francês (fr). Mesmos slugs das dicas gerais em português, com fontes da França.
-- Dicas só do Brasil NÃO entram aqui. No lugar delas: alternance-apprentissage e stage-gratification.
-- Plano grátis: 7 de 21 (33%). Fontes conferidas em 30/09/2026.

insert into public.tracks (language, slug, title, description, sort_order) values
  ('fr', 'entrevista-sem-medo', 'L''entretien sans stress', 'Du trac à la dernière question, étape par étape.', 1),
  ('fr', 'curriculo-do-zero', 'Un CV à partir de zéro', 'Préparez votre CV et votre LinkedIn, même sans expérience.', 2),
  ('fr', 'primeiro-emprego', 'Premier emploi', 'Ce qu''il faut savoir avant de commencer à travailler.', 3);

insert into public.tips (language, slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, for_nervous, body) values

-- ===== Trilha: L'entretien sans stress =====
(
  'fr', 'nervosismo-antes-da-entrevista',
  'Stressé(e) ? Comment se préparer le jour J',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'fr' and slug = 'entrevista-sem-medo'), 1,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"Être stressé(e) avant un entretien, c'est normal. Le but n'est pas de faire disparaître le stress, mais d'arriver préparé(e) : plus l'entretien est préparé, plus on est à l'aise."},
    {"type":"h","text":"La veille"},
    {"type":"list","items":["Relisez l'offre en détail et renseignez-vous sur l'entreprise.","Faites un entretien d'entraînement avec un ami ou un proche (ou ici, dans l'appli).","Préparez votre tenue, vérifiez l'adresse ou le lien et dormez bien."]},
    {"type":"h","text":"Le jour J"},
    {"type":"list","items":["Arrivez un peu en avance. En visio, testez la caméra et le son avant.","Respirez lentement et parlez sans vous presser, avec de petites pauses.","Si vous avez un trou, dites « Laissez-moi réfléchir un instant ». Demander un peu de temps, c'est permis."]},
    {"type":"example","title":"Exemple","text":"« Excusez-moi, je suis un peu stressé(e). Je peux reprendre ma réponse ? » Le recruteur comprend. La sincérité inspire confiance."},
    {"type":"p","text":"Si l'anxiété vous gêne beaucoup au quotidien, parlez-en à un professionnel de santé."},
    {"type":"sources","items":[
      {"title":"France Travail : Des entretiens d'embauche 100 % réussis","url":"https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/entretien/des-entretiens-dembauche-100---r.html"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'como-responder-fale-sobre-voce',
  'Comment répondre à « Parlez-moi de vous »',
  'entrevista', 2, false,
  (select id from public.tracks where language = 'fr' and slug = 'entrevista-sem-medo'), 2,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"C'est presque toujours la première question. Le recruteur veut savoir qui vous êtes et pourquoi vous correspondez au poste."},
    {"type":"p","text":"Ce n'est pas le moment de raconter toute votre vie. Une minute suffit."},
    {"type":"h","text":"Suivez cet ordre"},
    {"type":"list","ordered":true,"items":["**Qui vous êtes :** votre prénom et ce que vous étudiez ou faites.","**Un exemple :** quelque chose que vous avez fait et qui a un lien avec le poste.","**Ce que vous cherchez :** pourquoi vous voulez cette opportunité."]},
    {"type":"example","title":"Exemple","text":"« Je m'appelle Léa, j'ai 19 ans et je prépare un bac pro Métiers de l'accueil. Au forum du lycée, je me suis occupée de l'accueil des visiteurs et j'ai adoré. C'est pour ça que je veux commencer dans la relation client. »"},
    {"type":"warning","text":"Ne récitez pas votre CV ligne par ligne : il a déjà été lu. Illustrez plutôt chaque point par un exemple précis."},
    {"type":"p","text":"Entraînez-vous à voix haute deux ou trois fois. Le jour J, ce sera plus naturel."},
    {"type":"sources","items":[
      {"title":"France Travail : Des entretiens d'embauche 100 % réussis","url":"https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/entretien/des-entretiens-dembauche-100---r.html"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'conte-uma-historia',
  'Racontez une histoire : la méthode STAR',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'fr' and slug = 'entrevista-sem-medo'), 3,
  '{primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Les questions comme « Racontez-moi une fois où vous avez résolu un problème » demandent une histoire vraie. Une façon simple d'organiser la réponse est la méthode STAR, utilisée par les services carrière des universités."},
    {"type":"list","ordered":true,"items":["**Situation :** où vous étiez et ce qui se passait. Sans trop de détails.","**Tâche :** quel était votre rôle ou votre objectif.","**Action :** ce que VOUS avez fait. C'est la plus grande partie de la réponse : dites « je », pas « on ».","**Résultat :** ce qui a changé et ce que vous avez appris. Donnez un chiffre si possible."]},
    {"type":"example","title":"Exemple","text":"« Pour un exposé de groupe, deux camarades ne répondaient plus (situation) et j'étais responsable du rendu (tâche). J'ai redistribué le travail et créé un groupe avec des échéances (action). On a rendu à temps et on a eu 16/20 (résultat). »"},
    {"type":"p","text":"Pas d'expérience professionnelle ? Les exemples tirés des cours, des projets, du sport ou du bénévolat comptent tout autant."},
    {"type":"warning","text":"N'inventez pas d'histoires. Le recruteur pose souvent des questions sur les détails, et la réponse risque de ne pas correspondre à votre CV."},
    {"type":"sources","items":[
      {"title":"MIT Career Advising : Using the STAR method (en anglais)","url":"https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'pontos-fortes-e-fracos',
  'Qualités et défauts sans clichés',
  'entrevista', 3, true,
  (select id from public.tracks where language = 'fr' and slug = 'entrevista-sem-medo'), 4,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"« Quel est votre principal défaut ? » fait peur, mais c'est l'occasion de montrer que vous vous connaissez et que vous progressez."},
    {"type":"h","text":"Une qualité"},
    {"type":"p","text":"Choisissez-en une utile pour le poste et prouvez-la par un court exemple. « Je suis organisé(e) » pèse plus avec « je faisais le planning de ménage de ma classe »."},
    {"type":"h","text":"Un défaut"},
    {"type":"list","ordered":true,"items":["Citez un vrai défaut, qui n'est pas essentiel pour le poste.","Expliquez ce que vous faites déjà pour vous améliorer.","Terminez en montrant vos progrès."]},
    {"type":"example","title":"Exemple","text":"« J'avais du mal à parler en public. J'ai commencé à me porter volontaire pour présenter les exposés, et aujourd'hui je suis bien plus à l'aise. »"},
    {"type":"warning","text":"Évitez « je suis perfectionniste » ou « je travaille trop ». Le recruteur l'a entendu mille fois et peut penser que vous esquivez la question."},
    {"type":"sources","items":[
      {"title":"France Travail : répondre à 3 questions délicates en entretien","url":"https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/entretien/page-3.html"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'perguntas-para-fazer-no-fim',
  'Les questions à poser à la fin de l''entretien',
  'entrevista', 2, true,
  (select id from public.tracks where language = 'fr' and slug = 'entrevista-sem-medo'), 5,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"À la fin, on vous demande presque toujours : « Avez-vous des questions ? ». Répondre « non », c'est rater une belle occasion de montrer votre motivation."},
    {"type":"h","text":"De bonnes questions"},
    {"type":"list","items":["À quoi ressemble une journée type à ce poste ?","Qu'est-ce que la personne recrutée doit apprendre en premier ?","Comment accompagnez-vous les débutants ?","Quelles sont les prochaines étapes du recrutement ?"]},
    {"type":"example","title":"Astuce","text":"Notez vos questions sur une feuille avant l'entretien. Si l'une a déjà trouvé sa réponse pendant l'échange, passez à la suivante."},
    {"type":"warning","text":"Gardez les questions sur le salaire et les avantages pour le moment où l'entreprise aborde le sujet, ou pour la dernière étape si personne n'en a parlé."},
    {"type":"sources","items":[
      {"title":"France Travail : Entretien d'embauche, apprenez à poser les (bonnes) questions","url":"https://www.francetravail.fr/candidat/vos-recherches/preparer-votre-candidature/entretien/entretien-embauche-pose-question.html"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Un CV à partir de zéro =====
(
  'fr', 'curriculo-sem-experiencia',
  'CV sans expérience : que mettre ?',
  'curriculo', 3, false,
  (select id from public.tracks where language = 'fr' and slug = 'curriculo-do-zero'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Tout le monde commence sans expérience. Le CV du premier emploi montre ce que vous savez déjà faire et votre envie d'apprendre."},
    {"type":"h","text":"Ce qu'on y met"},
    {"type":"list","items":["**Un titre et un court résumé** de 2 ou 3 lignes en haut, adaptés au poste visé.","**Formation :** diplômes, classe ou année d'obtention, formations professionnelles.","**Autres formations :** les cours en ligne gratuits comptent aussi.","**Activités :** stages, projets scolaires, bénévolat, sport, jobs d'été.","**Compétences :** informatique, langues (à votre vrai niveau), accueil, organisation."]},
    {"type":"example","title":"Exemple","text":"« Bénévole à la collecte alimentaire du lycée (2025) : organisation des dons et accueil des familles. »"},
    {"type":"warning","text":"N'exagérez pas votre niveau d'anglais ou d'informatique. Certaines entreprises le testent sur place."},
    {"type":"sources","items":[
      {"title":"Onisep : Les 10 questions à se poser avant de rédiger son CV","url":"https://www.onisep.fr/vers-l-emploi/recherche-d-emploi/les-10-questions-a-se-poser-avant-de-rediger-son-cv"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'curriculo-de-uma-pagina',
  'Un CV d''une page : que mettre ?',
  'curriculo', 3, true,
  (select id from public.tracks where language = 'fr' and slug = 'curriculo-do-zero'), 2,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Un recruteur regarde souvent un CV quelques secondes. Une page claire et bien structurée l'aide à trouver l'essentiel, et elle passe mieux dans les logiciels de présélection."},
    {"type":"h","text":"Dans cet ordre"},
    {"type":"list","ordered":true,"items":["**Nom et coordonnées :** téléphone, e-mail et ville.","**Titre du CV :** le poste visé, adapté à chaque offre.","**Formation.**","**Expériences et activités :** de la plus récente à la plus ancienne.","**Compétences et langues.**"]},
    {"type":"warning","text":"Utilisez une adresse e-mail sobre, avec votre nom. Les pseudos et blagues donnent une mauvaise image."},
    {"type":"p","text":"La photo est facultative. Choisissez une police simple (Arial, Calibri, taille 10 à 12) et envoyez le CV en PDF."},
    {"type":"sources","items":[
      {"title":"Onisep : Les 10 questions à se poser avant de rédiger son CV","url":"https://www.onisep.fr/vers-l-emploi/recherche-d-emploi/les-10-questions-a-se-poser-avant-de-rediger-son-cv"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'titulo-do-linkedin',
  'Un titre LinkedIn qui vous rend visible',
  'linkedin', 2, false,
  (select id from public.tracks where language = 'fr' and slug = 'curriculo-do-zero'), 3,
  '{estagio,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Le titre est la phrase sous votre nom, visible aussi dans les résultats de recherche. Les recruteurs cherchent par mots-clés, et le titre est l'un des endroits où ils comptent le plus."},
    {"type":"h","text":"Une formule simple"},
    {"type":"p","text":"**Ce que vous cherchez + ce que vous étudiez ou savez faire.**"},
    {"type":"example","title":"Exemples","text":"« À la recherche d'un premier emploi en relation client | Bac pro Métiers de l'accueil »\n« Étudiant en logistique | Excel et gestion des stocks »"},
    {"type":"warning","text":"Évitez juste « Étudiant(e) » ou « En recherche d'emploi ». Dites ce que vous voulez faire."},
    {"type":"sources","items":[
      {"title":"Aide LinkedIn : modifier le titre de votre profil","url":"https://www.linkedin.com/help/linkedin/answer/a542926?lang=fr"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'foto-de-perfil-no-linkedin',
  'Photo de profil LinkedIn : l''essentiel',
  'linkedin', 2, true,
  (select id from public.tracks where language = 'fr' and slug = 'curriculo-do-zero'), 4,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Les profils avec photo reçoivent en général plus de visites. Pas besoin de photographe : un smartphone suffit."},
    {"type":"list","items":["Le visage bien visible, regard vers l'objectif.","La lumière en face de vous (près d'une fenêtre, ça marche).","Un fond simple et rangé.","Une tenue proche de celle que vous porteriez au travail."]},
    {"type":"warning","text":"Évitez les photos de soirée, avec d'autres personnes coupées, avec des lunettes de soleil ou des filtres."},
    {"type":"sources","items":[
      {"title":"LinkedIn Talent Blog : 10 tips for a professional profile photo (en anglais)","url":"https://www.linkedin.com/business/talent/blog/product-tips/tips-for-taking-professional-linkedin-profile-pictures"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Premier emploi =====
(
  'fr', 'sem-experiencia-comece-por-aqui',
  'Pas d''expérience ? Commencez ici',
  'primeiro_emprego', 4, false,
  (select id from public.tracks where language = 'fr' and slug = 'primeiro-emprego'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Chercher un premier emploi peut sembler difficile, mais on peut organiser la recherche en petites étapes."},
    {"type":"list","ordered":true,"items":["**Choisissez 1 ou 2 domaines** (par exemple l'accueil et la vente).","**Rédigez votre CV** et créez votre profil LinkedIn.","**Cherchez des offres** sur France Travail, sur LinkedIn, dans les offres d'alternance et de stage, et auprès des commerces et entreprises de votre quartier.","**Entraînez-vous à l'entretien** avant d'être appelé(e).","**Notez** où vous avez postulé, pour relancer."]},
    {"type":"example","title":"Astuce","text":"Postuler avec soin à quelques offres marche souvent mieux qu'envoyer le même CV à des centaines."},
    {"type":"warning","text":"On ne doit jamais vous faire payer pour un emploi : ni formation, ni matériel, ni frais de dossier. Méfiez-vous aussi des offres très bien payées sans compétences, des adresses e-mail qui ne correspondent pas à l'entreprise et des recrutements sans entretien (alerte France Travail)."},
    {"type":"sources","items":[
      {"title":"France Travail : Fausses offres d'emploi, comment les reconnaître","url":"https://www.francetravail.fr/candidat/soyez-vigilants/fausses-offres-d-emploi.html"},
      {"title":"France Travail : 6 conseils pour trouver votre premier emploi","url":"https://www.francetravail.fr/candidat/vos-recherches/bien-vous-organiser/6-conseils-pour-trouver-votre-pr.html"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'alternance-apprentissage',
  'L''apprentissage : se former en étant payé(e)',
  'direitos', 3, true,
  (select id from public.tracks where language = 'fr' and slug = 'primeiro-emprego'), 2,
  '{jovem_aprendiz}', '{}', false,
  $j$[
    {"type":"p","text":"Le contrat d'apprentissage est un vrai contrat de travail : vous alternez entre l'entreprise et un centre de formation (CFA), et vous préparez un diplôme ou un titre professionnel."},
    {"type":"h","text":"L'essentiel, selon Service-Public.fr"},
    {"type":"list","items":["**Âge :** de 16 à 29 ans (15 ans possible si la classe de 3e est terminée). Il existe des exceptions, par exemple pour les personnes handicapées.","**Salaire :** un pourcentage du Smic, qui dépend de votre âge et de votre année de formation. À 26 ans et plus, c'est au moins le Smic.","**Formation :** le temps passé au CFA fait partie du temps de travail.","**Maître d'apprentissage :** une personne de l'entreprise vous accompagne."]},
    {"type":"h","text":"Où chercher"},
    {"type":"p","text":"Les CFA, les missions locales et France Travail aident à trouver une entreprise. Beaucoup d'offres d'alternance sont publiées au printemps pour la rentrée."},
    {"type":"warning","text":"Les règles et les montants changent. Vérifiez les informations à jour sur Service-Public.fr ou auprès de l'entreprise avant de signer."},
    {"type":"sources","items":[
      {"title":"Service-Public.fr : Contrat d'apprentissage","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F2918"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'falar-de-salario',
  'Parler salaire sans stress',
  'salario', 3, true,
  (select id from public.tracks where language = 'fr' and slug = 'primeiro-emprego'), 3,
  '{primeiro_emprego,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Parler d'argent gêne beaucoup de monde, mais c'est une étape normale du recrutement. En se préparant, c'est plus facile."},
    {"type":"h","text":"Avant l'entretien"},
    {"type":"list","items":["Regardez si l'offre indique déjà le salaire.","Renseignez-vous sur le salaire habituel pour ce métier dans votre région. L'outil **« Explorer le marché du travail »** de France Travail donne le niveau de salaire par métier et par territoire.","Additionnez les frais liés au travail, comme le transport et les repas."]},
    {"type":"h","text":"Si on vous demande vos prétentions salariales"},
    {"type":"p","text":"Donnez une fourchette basée sur vos recherches, plutôt qu'un chiffre unique. Si c'est tôt dans le processus, vous pouvez dire que vous voulez d'abord mieux comprendre le poste."},
    {"type":"example","title":"Exemple","text":"« D'après mes recherches, ce poste est souvent payé entre [montant] et [montant] brut par mois. Je suis ouvert(e) à la discussion, surtout pour un premier emploi. »"},
    {"type":"p","text":"Demandez aussi quels sont les avantages, comme les titres-restaurant ou la prise en charge du transport. Ils comptent à la fin du mois."},
    {"type":"warning","text":"Les salaires varient selon la région, l'entreprise et la période. Utilisez vos recherches comme repère, pas comme règle."},
    {"type":"sources","items":[
      {"title":"France Travail : Explorer le marché du travail","url":"https://www.francetravail.fr/candidat/votre-projet-professionnel/definir-votre-projet-professionn/explorer-le-marche-du-travail.html"},
      {"title":"George Mason University Career Services : Salary Negotiation (en anglais)","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'stage-gratification',
  'Stage : quand est-il payé ?',
  'direitos', 3, true,
  (select id from public.tracks where language = 'fr' and slug = 'primeiro-emprego'), 4,
  '{estagio}', '{}', false,
  $j$[
    {"type":"p","text":"En France, un stage n'est pas un contrat de travail : il se fait avec une convention signée par vous, votre établissement et l'organisme d'accueil. Mais il peut donner droit à une gratification."},
    {"type":"h","text":"La règle, selon Service-Public.fr"},
    {"type":"list","items":["**Gratification obligatoire** si le stage dure plus de 2 mois dans le même organisme pendant la même année scolaire ou universitaire, consécutifs ou non (à partir de la 309e heure).","**Montant minimum :** un montant par heure de présence, fixé par la loi et revu chaque année.","**Versement :** chaque mois. Ce n'est pas un salaire, et le régime est différent.","**Stage court (2 mois ou moins) :** la gratification n'est pas obligatoire, mais l'organisme peut en verser une."]},
    {"type":"example","title":"Avant de signer la convention","text":"« Le stage est-il gratifié ? Quelles seront mes missions, et qui sera mon tuteur ? »"},
    {"type":"warning","text":"Il existe des règles particulières (par exemple dans l'enseignement agricole). Utilisez le simulateur de Service-Public.fr pour connaître le montant exact."},
    {"type":"sources","items":[
      {"title":"Service-Public.fr : Gratification minimale d'un stagiaire","url":"https://www.service-public.gouv.fr/particuliers/vosdroits/F32131"},
      {"title":"Service-Public.fr : Simulateur de la gratification minimale","url":"https://entreprendre.service-public.gouv.fr/simulateur/calcul/gratification-stagiaire"}
    ]}
  ]$j$::jsonb
),

-- ===== Sem trilha =====
(
  'fr', 'por-que-quer-mudar-de-emprego',
  'Expliquer pourquoi vous voulez changer d''emploi',
  'entrevista', 2, false, null, null,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Si vous travaillez déjà, on vous demandera presque toujours : « Pourquoi voulez-vous quitter votre poste actuel ? ». Le recruteur veut savoir si vous allez vers quelque chose ou si vous fuyez quelque chose."},
    {"type":"list","ordered":true,"items":["**Parlez d'avenir :** ce que vous voulez apprendre ou faire davantage.","**Faites le lien avec le poste :** montrez ce que cette opportunité apporte.","**Soyez honnête**, sans entrer dans les détails personnels."]},
    {"type":"example","title":"Exemple","text":"« J'ai beaucoup appris en boutique, mais je veux évoluer vers l'administratif. Ce poste réunit les deux. »"},
    {"type":"warning","text":"Ne critiquez pas votre chef ou votre entreprise actuelle, même si vous avez des raisons. Cela joue souvent contre vous."},
    {"type":"sources","items":[
      {"title":"Robert Half : how to answer “what are your reasons for leaving a job?” (en anglais)","url":"https://www.roberthalf.com/us/en/insights/landing-job/how-to-answer-what-is-your-reason-for-leaving-a-job"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-atendimento',
  'Relation client : montrez que vous savez écouter',
  'entrevista', 2, true, null, null,
  '{}', '{atendimento}', false,
  $j$[
    {"type":"p","text":"En relation client, l'entreprise cherche quelqu'un qui traite bien les gens, même dans les moments difficiles. En entretien, votre façon d'échanger est déjà un test."},
    {"type":"h","text":"Ce qui compte souvent"},
    {"type":"list","items":["**Écouter avant de répondre :** laisser la personne tout expliquer sans l'interrompre.","**Courtoisie :** saluer, appeler la personne par son nom, dire « s'il vous plaît ».","**Honnêteté :** si vous ne savez pas, dites que vous allez vérifier au lieu d'inventer.","**Garder son calme** face à un client mécontent."]},
    {"type":"example","title":"Question fréquente","text":"« Comment réagiriez-vous face à un client en colère ? » Répondez étape par étape : écouter, s'excuser pour la gêne, comprendre le problème et dire ce que vous allez faire."},
    {"type":"sources","items":[
      {"title":"Onisep : Conseiller / Conseillère relation client à distance","url":"https://www.onisep.fr/ressources/univers-metier/metiers/conseiller-conseillere-relation-client-a-distance"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-vendas',
  'Vente : écouter fait plus vendre que parler',
  'entrevista', 2, true, null, null,
  '{}', '{vendas}', false,
  $j$[
    {"type":"p","text":"Beaucoup pensent qu'un bon vendeur est quelqu'un qui parle beaucoup. En réalité, ce qui aide le plus, c'est de comprendre le besoin du client."},
    {"type":"h","text":"Montrez-le en entretien"},
    {"type":"list","items":["**Écoute :** posez des questions avant de proposer quelque chose.","**Amabilité et patience,** même quand il y a du monde.","**Connaître les produits :** renseignez-vous sur ce que vend le magasin avant l'entretien.","**Un exemple concret :** une tombola au lycée, un vide-grenier, un coup de main dans le commerce familial."]},
    {"type":"example","title":"Question fréquente","text":"« Vendez-moi ce stylo. » Au lieu d'énumérer ses qualités, demandez d'abord : « À quoi vous sert un stylo au quotidien ? ». Proposez-le ensuite comme la solution."},
    {"type":"sources","items":[
      {"title":"Onisep : Vendeur / Vendeuse en magasin","url":"https://www.onisep.fr/ressources/univers-metier/metiers/vendeur-vendeuse-en-magasin"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-administrativo',
  'Poste administratif : l''organisation, votre carte de visite',
  'entrevista', 2, true, null, null,
  '{}', '{administrativo}', false,
  $j$[
    {"type":"p","text":"Au secrétariat ou à l'administratif, tout passe par vous : accueil, téléphone, rendez-vous, courriers. L'organisation, la rigueur et la discrétion comptent beaucoup."},
    {"type":"h","text":"Ce que vous pouvez montrer"},
    {"type":"list","items":["**Organisation :** comment vous suivez les délais, les tâches ou les documents (agenda, liste, tableur).","**Outils :** dites ce que vous maîtrisez vraiment sur Excel, Word et la messagerie.","**Rigueur :** un exemple où vous avez vérifié quelque chose et évité une erreur.","**Qualité d'écrit :** une bonne orthographe est très appréciée."]},
    {"type":"example","title":"Exemple","text":"« Au foyer du lycée, je suivais dans un tableur l'argent de la fête de fin d'année et j'ai fait le bilan à la fin. »"},
    {"type":"warning","text":"Si on vous fait passer un test Excel, vous pouvez dire ce que vous ne savez pas encore. Inventer se voit tout de suite."},
    {"type":"sources","items":[
      {"title":"Onisep : Secrétaire (office manager)","url":"https://www.onisep.fr/ressources/univers-metier/metiers/secretaire-office-manager"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-tecnologia',
  'Premier poste dans la tech : montrez vos projets',
  'entrevista', 3, true, null, null,
  '{}', '{tecnologia}', false,
  $j$[
    {"type":"p","text":"Dans la tech, les projets parlent plus fort que les diplômes. Même de petits projets, de cours ou personnels, montrent ce que vous savez faire."},
    {"type":"h","text":"Votre vitrine sur GitHub"},
    {"type":"list","ordered":true,"items":["**Rédigez un README de profil :** qui vous êtes, ce que vous étudiez et les technologies que vous connaissez.","**Épinglez 3 à 5 projets,** ceux qui correspondent le mieux au poste.","**Expliquez chaque projet :** ce qu'il fait, comment le lancer et, si possible, un lien pour le tester."]},
    {"type":"example","title":"En entretien","text":"Choisissez un projet et entraînez-vous à le raconter : le problème, ce que vous avez construit, une difficulté et comment vous l'avez résolue."},
    {"type":"warning","text":"Si une partie vient d'un tutoriel, dites-le. On vous demandera comment le code fonctionne."},
    {"type":"sources","items":[
      {"title":"GitHub Docs : utiliser votre profil GitHub pour améliorer votre CV","url":"https://docs.github.com/fr/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-marketing',
  'Marketing : un portfolio même sans expérience',
  'entrevista', 3, true, null, null,
  '{}', '{marketing}', false,
  $j$[
    {"type":"p","text":"En marketing et en communication, le recruteur veut voir ce que vous avez déjà créé. Vous pouvez monter un portfolio avant votre premier emploi."},
    {"type":"h","text":"Que mettre ?"},
    {"type":"list","items":["Des travaux de cours ou de formation.","Des réseaux sociaux que vous avez animés (pour un projet, une association, le commerce d'un proche).","Du bénévolat.","**Des résultats chiffrés** si vous en avez : abonnés, mentions « j'aime », ventes."]},
    {"type":"h","text":"Comment l'organiser"},
    {"type":"list","items":["Commencez par vos 2 meilleurs travaux.","Ajoutez une courte partie « À propos ».","Rendez vos coordonnées faciles à trouver."]},
    {"type":"warning","text":"N'utilisez que des chiffres que vous pouvez prouver. Sinon, racontez ce que vous avez fait et appris."},
    {"type":"sources","items":[
      {"title":"Onisep : Community manager (animateur / animatrice de communauté en ligne)","url":"https://www.onisep.fr/ressources/univers-metier/metiers/community-manager-animateur-animatrice-de-communaute-en-ligne"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-logistica',
  'Logistique : rigueur, rythme et sécurité',
  'entrevista', 2, true, null, null,
  '{}', '{logistica}', false,
  $j$[
    {"type":"p","text":"En début de carrière en logistique, on reçoit, range, prépare et expédie des marchandises. C'est un travail de routine où une petite erreur peut devenir un gros problème."},
    {"type":"h","text":"Ce qu'il faut montrer"},
    {"type":"list","items":["**Rigueur :** vérifier les quantités, les références et les adresses.","**Organisation et rapidité :** savoir où se trouve chaque chose.","**Sécurité :** respecter les consignes et porter les équipements de protection. Pour conduire un chariot, il faut le CACES.","**Envie d'apprendre** les logiciels et scanners de gestion des stocks."]},
    {"type":"example","title":"Exemple","text":"« J'ai aidé à la collecte alimentaire du lycée : j'ai trié les produits, noté les quantités et préparé les colis. »"},
    {"type":"sources","items":[
      {"title":"Onisep : Préparateur / Préparatrice de commandes","url":"https://www.onisep.fr/ressources/univers-metier/metiers/preparateur-preparatrice-de-commandes"}
    ]}
  ]$j$::jsonb
),
(
  'fr', 'entrevista-para-saude',
  'Santé : soin, éthique et secret professionnel',
  'entrevista', 3, true, null, null,
  '{}', '{saude}', false,
  $j$[
    {"type":"p","text":"Dans la santé, en plus des connaissances techniques, votre façon de traiter les patients et leurs informations compte beaucoup."},
    {"type":"h","text":"Ce qui compte souvent"},
    {"type":"list","items":["**Respect et dignité :** traiter chaque patient avec soin, sans jugement.","**Secret professionnel :** ce que vous voyez, entendez ou comprenez au travail reste au travail.","**Honnêteté :** dire clairement ce que vous savez déjà faire et ce que vous apprenez encore.","**Connaître l'établissement :** renseignez-vous sur les valeurs de l'hôpital ou de la clinique."]},
    {"type":"example","title":"Astuce","text":"Si le poste est infirmier, relisez le code de déontologie des infirmiers. Il peut servir pour les questions sur des situations délicates."},
    {"type":"sources","items":[
      {"title":"Ordre national des infirmiers : Code de déontologie des infirmiers","url":"https://www.ordre-infirmiers.fr/le-code-de-deontologie-des-infirmiers-publie-le-27-novembre-2016"}
    ]}
  ]$j$::jsonb
);
