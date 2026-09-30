import { APP_NAME } from '../app';

import type { LegalDocs } from './types';

export const fr: LegalDocs = {
  privacy: [
    {
      title: 'Les données que nous collectons',
      body: `E-mail et mot de passe (pour ton compte), nom ou pseudo, âge, objectif, domaine d’intérêt et ton ressenti face aux entretiens. Si tu choisis de compléter Mon profil, nous gardons aussi ce que tu y ajoutes : photo et couverture, titre, ville, bio, compétences, expériences, formation, cours, langues, disponibilités et liens (LinkedIn, portfolio, Instagram). Nous gardons aussi tes réponses aux entraînements, le texte ou le PDF LinkedIn que tu envoies, les rapports générés, les conseils que tu as lus ou enregistrés, les jours où tu t’es entraîné(e) et la langue choisie. Si tu utilises Explorer, nous gardons les personnes que tu suis, celles que tu as bloquées et les signalements que tu fais. Nous ne demandons ni numéro d’identité, ni téléphone, ni adresse.`,
    },
    {
      title: 'À quoi elles servent',
      body: `Uniquement à faire fonctionner ${APP_NAME} : créer des questions, donner un retour, générer des rapports, montrer ta progression et choisir des conseils pour toi. Ton profil n’est visible que par toi, sauf si tu actives « Apparaître dans Explorer » (voir plus bas). Nous ne vendons pas tes données et il n’y a pas de publicité.`,
    },
    {
      title: 'Statistiques d’utilisation',
      body: `Pour améliorer l’app, nous enregistrons des actions simples, comme « a terminé un entraînement » ou « a ouvert l’écran Premium », avec la date et l’heure. Ces statistiques n’incluent jamais ce que tu as écrit. Nous n’utilisons aucun outil d’analyse ou de publicité d’autres entreprises.`,
    },
    {
      title: 'Utilisation de l’intelligence artificielle',
      body: `Pour créer les questions, les retours, les rapports et les suggestions de bio, le texte nécessaire à chaque demande est envoyé à un service d’intelligence artificielle tiers. Nous n’envoyons jamais ton e-mail ni ton mot de passe. Ton nom n’est envoyé que lorsque tu demandes une suggestion de bio (ou s’il figure dans un texte ou un PDF que tu envoies toi-même).`,
    },
    {
      title: 'Rappels',
      body: `Si tu actives le rappel quotidien, il est programmé sur ton propre téléphone. Tu peux le désactiver quand tu veux dans Réglages ou dans les réglages du téléphone.`,
    },
    {
      title: 'Explorer : ce que voient les autres',
      body: `L’option « Apparaître dans Explorer » (Mon profil › Modifier › Confidentialité) est désactivée par défaut. Si tu l’actives, les personnes qui ont un compte ${APP_NAME} peuvent trouver ton profil et voir : photo et couverture, nom, titre, ville, bio, compétences, objectif, domaine, disponibilité, mode de travail, expériences, formation et cours, ton nombre d’abonné(e)s et d’abonnements, et tes réussites (premier entraînement, série de jours, LinkedIn analysé). Nous ne montrons jamais ton e-mail, ton âge, ton offre, les notes ou réponses de tes entraînements, tes langues ni tes liens. Quand tu la désactives, ton profil quitte Explorer tout de suite. Si tu bloques quelqu’un, vous ne voyez plus le profil l’un de l’autre, et la personne n’est pas prévenue. Les signalements sont anonymes pour la personne signalée : nous gardons qui a signalé, le motif, le texte et une copie du profil signalé, uniquement pour la modération.`,
    },
    {
      title: 'Paiement du Premium',
      body: `L’abonnement se fait sur la page de paiement de Stripe (société de paiement), qui débite ta carte chaque mois. Pour cela, Stripe reçoit ton e-mail et les données de ta carte, et peut les traiter hors du Brésil. Les données de carte restent uniquement chez Stripe : ${APP_NAME} ne voit ni ne conserve aucune donnée de carte ou bancaire. Nous gardons seulement le montant, la date, le moyen (ex. : « carte de crédit ») et l’état de chaque paiement et de l’abonnement, pour activer et prouver ton Premium.`,
    },
    {
      title: 'Durée de conservation',
      body: `Tes données sont conservées tant que ton compte existe. Le PDF LinkedIn est supprimé juste après la création du rapport. Quand tu supprimes ton compte, tout est supprimé, y compris les photos et les statistiques d’utilisation.`,
    },
    {
      title: 'Tes droits',
      body: `Tu peux consulter et corriger tes données, en télécharger une copie (Réglages › Exporter mes données) et supprimer ton compte (Réglages › Supprimer mon compte) à tout moment, comme le garantissent la loi brésilienne sur la protection des données (LGPD), puisque ${APP_NAME} est géré depuis le Brésil, et la loi de protection des données de là où tu vis (comme le RGPD dans l’Union européenne). Si tu as besoin d’aide, contacte-nous ci-dessous.`,
    },
    {
      title: 'Contact',
      body: `Utilise « Aide et contact » dans Réglages.`,
    },
  ],
  terms: [
    {
      title: 'Ce qu’est l’app',
      body: `${APP_NAME} est un outil d’entraînement et d’orientation pour les entretiens d’embauche et le profil professionnel. Il ne garantit pas une embauche et ne remplace pas un accompagnement professionnel.`,
    },
    {
      title: 'Qui peut l’utiliser',
      body: `Les personnes de 16 ans ou plus.`,
    },
    {
      title: 'Ton compte',
      body: `Tu es responsable de garder ton mot de passe secret. Utilise des informations vraies sur toi pendant les entraînements.`,
    },
    {
      title: 'Contenu généré par l’IA',
      body: `Les retours et suggestions sont générés automatiquement et peuvent contenir des erreurs. Fie-toi à ton propre jugement avant d’appliquer une suggestion.`,
    },
    {
      title: 'Offres',
      body: `L’offre gratuite a des limites d’utilisation. Le Premium est un abonnement mensuel via Stripe, renouvelé automatiquement : le montant est débité de ta carte chaque mois, jusqu’à ce que tu annules. Le prix est fixé en réaux brésiliens (R$). La page de paiement de Stripe peut l’afficher dans ta monnaie : Stripe fait la conversion avec des frais de change d’environ 2 à 4 % déjà inclus, et le montant dans ta monnaie peut varier un peu chaque mois selon le taux de change. Tu peux aussi choisir de payer en réaux ; dans ce cas, ta banque convertit le montant et peut facturer des frais. Le Premium est activé dès que le paiement est accepté. Tu peux annuler quand tu veux sur l’écran Profil (« Annuler l’abonnement ») : il n’y aura plus de prélèvement, et le Premium reste actif jusqu’à la fin du mois déjà payé.`,
    },
    {
      title: 'Rétractation et remboursement',
      body: `Selon le Code de défense du consommateur brésilien, tu peux te rétracter de l’abonnement Premium dans les 7 jours suivant le premier paiement et être remboursé(e). Si la loi de là où tu vis te donne un délai plus long, c’est le délai le plus long qui s’applique. Pour cela, annule l’abonnement dans Profil et écris-nous via « Aide et contact ». Le remboursement est fait par Stripe, sur la même carte. Même si tu te rétractes, annules ou demandes le remboursement, ton Premium reste actif jusqu’à la fin du mois de ce paiement.`,
    },
    {
      title: 'Utilisation raisonnable',
      body: `Pour que l’app fonctionne pour tout le monde, il existe des limites techniques d’utilisation, même en Premium. Il est interdit d’essayer de contourner ces limites ou d’utiliser l’app pour envoyer des contenus offensants ou illégaux. Dans Explorer, respecte les autres : faux profils, harcèlement, insultes, arnaques et fausses offres sont interdits. Les profils signalés sont examinés et peuvent être supprimés.`,
    },
    {
      title: 'Modifications',
      body: `Ces conditions peuvent changer. Si c’est le cas, nous te préviendrons dans l’app.`,
    },
  ],
};
