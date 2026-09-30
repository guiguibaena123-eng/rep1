-- Contato de ajuda por E-MAIL no lugar do WhatsApp (decisão do dono do app, 28/09/2026).
-- Novo evento de clique: support_opened (o app abriu o e-mail de ajuda). Os antigos continuam válidos
-- para não quebrar o histórico.

alter table public.events drop constraint events_name_check;
alter table public.events add constraint events_name_check check (name in (
  'signup_completed', 'onboarding_completed',
  'interview_started', 'interview_completed', 'interview_abandoned',
  'linkedin_analyzed', 'tip_read',
  'paywall_viewed', 'premium_cta_clicked', 'pix_copied', 'whatsapp_opened', 'reminder_enabled',
  'checkout_started', 'payment_approved',
  'subscription_started', 'subscription_authorized', 'subscription_cancelled',
  'support_opened'
));

drop policy "events: inserir os próprios cliques" on public.events;
create policy "events: inserir os próprios cliques"
  on public.events for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and name in ('paywall_viewed', 'premium_cta_clicked', 'reminder_enabled', 'support_opened')
  );
