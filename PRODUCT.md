# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One shared Siwki design language on iPhone and Android (confirmed by the owner). It is not a per-OS restyle; each OS's conventions still apply where users expect them (back gesture/button, keyboard, safe areas, system share and pickers).

## Users

Brazilian young people aged 16 to 28 looking for an internship (estágio), an apprentice contract (jovem aprendiz), a first job, or a new job. Many feel anxious and insecure about interviews. They live on their phones, have little patience for crowded screens, drop confusing apps quickly, and often use low-end phones on unstable connections.

## Product Purpose

Siwki helps young people get their first (or next) job with less anxiety. It has four pillars:

1. **Interview simulator with AI:** pick an area and level, answer written interview questions, get kind, practical, structured feedback.
2. **LinkedIn profile analysis:** upload the profile PDF (or paste the texts) and get a report with a score, what to improve, and ready-to-use text suggestions.
3. **Job-market tips:** a library of short, practical tips (résumé, interview, first job, rights, salary), grouped in tracks.
4. **Progress:** day streak, score evolution, weekly goal.

Success: the user practices, gets calmer, and arrives better prepared at real interviews.

## Positioning

What a generic chatbot or a neighboring app cannot truthfully claim together (confirmed by the owner):

- **Everything in one place:** interview practice, LinkedIn review, tips and progress in one simple app.
- **Takes the anxiety out:** gentle, pressure-free practice with encouraging feedback.
- **Tips with sources:** every tip cites reliable sources.

## Operating Context

- Mobile-only, in Brazilian Portuguese, dates in the America/Sao_Paulo time zone.
- Typical use: short sessions on the phone, often right before a real interview or while job hunting.
- The LinkedIn PDF can only be downloaded from LinkedIn on the web, so the app explains how to get it (desktop-mode steps).
- Daily reminder is a local notification scheduled on the device.
- Help and contact are by e-mail only (support address from `EXPO_PUBLIC_SUPPORT_EMAIL`); there is no WhatsApp in the app, by the owner's decision.

## Capabilities and Constraints

- **Plans:** Free has 1 interview simulation per week, the LinkedIn summary, and part of the tips (about 35%). Premium (monthly, card via Stripe) has practically unlimited simulations (30 per day), the full LinkedIn report, and all tips and tracks. The price comes from `EXPO_PUBLIC_PREMIUM_PRICE` (a number in BRL, formatted per app language) and must never be hard-coded.
- **Accounts:** e-mail and password (letters and digits, minimum 8), plus "Continuar com Google". Sign in with Apple is deferred until the Apple Developer Program is paid.
- **Profile:** name, age (16 or older), goal, area, nervousness level 1–5, photo and cover photo, theme (light, dark, auto), reminder settings. Users can export their data and delete their account.
- **Stack (existing):** Expo (SDK 57) + Expo Router + TypeScript, Supabase (Auth, Postgres with RLS, Storage, Edge Functions), AI only on the server. Fonts Plus Jakarta Sans (headings) and Inter (body); icons lucide-react-native. Budget is zero: free tiers only, no paid dependency without asking.
- **Terminology:** "simulação" / "Treinar" for interview practice; tabs Início, Treinar, LinkedIn, Dicas, Perfil. All user-facing text lives in `src/i18n/pt-BR.ts`.
- **Internal identifiers stay "pronto"** (package `com.guibaena.pronto`, slug, scheme `pronto://`, storage keys) even though the product name is Siwki.
- **Undecided / pending:** legal review of Termos and Privacidade; HR review of the tips; store publishing.

## Brand Commitments

- Name: **Siwki** (renamed from "Pronto" on 2026-09-30).
- Voice: close and light, kind and encouraging, never judgmental or pushy; no forced slang; young without being childish.
- Low scores are communicated gently. Error styling is only for real errors, never for a "bad" score.
- No stock photos and no mascot. Emoji at most once per screen, only in moments of achievement.
- `design/` (the Claude Design exports) is the visual source of truth; conflicts between design and the functional spec are logged in the README table.

## Evidence on Hand

- Specs: `prompt-1-design.md` (design brief), `prompt-2-claude-code.md` (functional spec), `prompt-3-perfil-usuario.md` (profile screens).
- Screen designs: `design/` (T1–T19).
- Tip content with sources, seeded in `supabase/seed.sql`.
- No testimonials, user counts, press, ratings or outcome statistics exist yet. Do not fabricate any.

## Product Principles

1. **Calm over pressure.** Every surface should lower anxiety: no aggressive counters, no guilt, no nagging language.
2. **One main action per screen.** The user always knows what to do next, within reach of the thumb.
3. **Honest and sourced.** Advice cites sources; the app never promises jobs or invents results.
4. **Light for real phones.** Works on low-end devices and unstable internet; never a blank screen while loading.
5. **Free is genuinely useful.** Premium unlocks depth, but the free plan must still help.

## Accessibility & Inclusion

- WCAG AA contrast in light and dark modes; minimum text 12px, body 16px; touch targets at least 48×48.
- Respect the system "reduce motion" setting.
- Emotional safety: the app links to CVV (`EXPO_PUBLIC_CVV_URL`, Brazil's emotional-support service) for users who are struggling.
