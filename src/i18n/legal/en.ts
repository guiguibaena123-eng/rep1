import { APP_NAME } from '../app';

import type { LegalDocs } from './types';

export const en: LegalDocs = {
  privacy: [
    {
      title: 'What data we collect',
      body: `Email and password (for your account), name or nickname, age, goal, area of interest and how you feel about interviews. If you choose to fill in My profile, we also keep what you add there: photo and cover, headline, city, bio, skills, experience, education, courses, languages, availability and links (LinkedIn, portfolio, Instagram). We also keep your practice answers, the LinkedIn text or PDF you send, the reports we generate, the tips you read or saved, the days you practiced and the language you chose. If you use Explore, we keep who you follow, who you blocked and the reports you make. We don't ask for ID numbers, phone number or address.`,
    },
    {
      title: 'What we use it for',
      body: `Only to make ${APP_NAME} work: create questions, give feedback, generate reports, show your progress and pick tips for you. Your profile is visible only to you, unless you turn on "Show me in Explore" (see below). We don't sell your data and we don't show ads.`,
    },
    {
      title: 'Usage metrics',
      body: `To improve the app, we record simple actions, like "finished a practice interview" or "opened the Premium screen", with date and time. These metrics never include what you wrote. We don't use analytics or advertising tools from other companies.`,
    },
    {
      title: 'Use of artificial intelligence',
      body: `To create questions, feedback, reports and bio suggestions, the text needed for each request is sent to a third-party artificial intelligence service. We never send your email or password. Your name is only sent when you ask for a bio suggestion (or if it is in a text or PDF you send yourself).`,
    },
    {
      title: 'Reminders',
      body: `If you turn on the daily reminder, it is scheduled on your own phone. You can turn it off at any time in Settings or in your phone's settings.`,
    },
    {
      title: 'Explore: what other people see',
      body: `The "Show me in Explore" option (My profile › Edit › Privacy) is off by default. If you turn it on, people with a ${APP_NAME} account can find your profile and see: photo and cover, name, headline, city, bio, skills, goal, field, availability, work format, experience, education and courses, how many followers you have, how many people you follow and your achievements (first practice interview, day streak, LinkedIn reviewed). We never show your email, age, plan, practice scores or answers, languages or links. When you turn it off, your profile leaves Explore right away. If you block someone, you both stop seeing each other's profile, and they are not told. Reports are anonymous to the person reported: we keep who reported, the reason, the text and a copy of the reported profile, only for moderation.`,
    },
    {
      title: 'Premium payment',
      body: `You subscribe on the payment page of Stripe (a payments company), which charges your card every month. For this, Stripe receives your email and card details, and may process them outside Brazil. Card details stay with Stripe only: ${APP_NAME} never sees or stores card or bank details. We only keep the amount, date, method (e.g. "credit card") and status of each charge and of the subscription, to unlock and prove your Premium.`,
    },
    {
      title: 'How long we keep it',
      body: `Your data is kept while your account exists. The LinkedIn PDF is deleted right after the report is generated. When you delete your account, everything is deleted, including photos and usage metrics.`,
    },
    {
      title: 'Your rights',
      body: `You can see and correct your data, download a copy (Settings › Export my data) and delete your account (Settings › Delete my account) at any time, as guaranteed by Brazil's General Data Protection Law (LGPD), where ${APP_NAME} is run, and by any data protection law that applies where you live (such as the GDPR in the European Union). If you need help, contact us below.`,
    },
    {
      title: 'Contact',
      body: `Use "Help and contact" in Settings.`,
    },
  ],
  terms: [
    {
      title: 'What the app is',
      body: `${APP_NAME} is a practice and guidance tool for job interviews and professional profiles. It doesn't guarantee a job and doesn't replace professional support.`,
    },
    {
      title: 'Who can use it',
      body: `People aged 16 or older.`,
    },
    {
      title: 'Your account',
      body: `You are responsible for keeping your password secret. Use true information about yourself when practicing.`,
    },
    {
      title: 'AI-generated content',
      body: `Feedback and suggestions are generated automatically and may contain mistakes. Use your own judgment before following any suggestion.`,
    },
    {
      title: 'Plans',
      body: `The free plan has usage limits. Premium is a monthly subscription through Stripe that renews automatically: the amount is charged to your card every month until you cancel. The price is set in Brazilian reais (R$). The Stripe payment page may show it in your own currency: Stripe converts it with a conversion fee of about 2–4% already included, and the amount in your currency may change a little each month with the exchange rate. You can also choose to pay in reais; then your bank converts the amount and may charge fees. Premium is unlocked as soon as the charge is approved. You can cancel at any time on the Profile screen ("Cancel subscription"): there will be no new charges, and Premium stays active until the end of the month already paid.`,
    },
    {
      title: 'Withdrawal and refund',
      body: `Under Brazil's Consumer Protection Code, you can withdraw from the Premium subscription within 7 days of the first charge and get your money back. If the law where you live gives you a longer period, the longer period applies. To do this, cancel the subscription on the Profile screen and contact us through "Help and contact". The refund is made by Stripe, to the same card. Even if you withdraw, cancel or ask for a refund, your Premium stays active until the end of the month of that charge.`,
    },
    {
      title: 'Fair use',
      body: `To keep the app working for everyone, there are technical usage limits, even on Premium. You may not try to get around these limits or use the app to send offensive or illegal content. In Explore, respect other people: fake profiles, harassment, insults, scams and fake jobs are not allowed. Reported profiles are reviewed and may be removed.`,
    },
    {
      title: 'Changes',
      body: `These terms may change. When that happens, we'll let you know in the app.`,
    },
  ],
};
