-- Premium com RENOVAÇÃO AUTOMÁTICA (decisão do dono do app, 28/09/2026):
-- Assinaturas do Mercado Pago (/preapproval), cobrança mensal no cartão.
-- Fluxo: create-subscription cria a linha "pending" + o link do Mercado Pago → a pessoa autoriza →
-- o Mercado Pago cobra todo mês → mercadopago-webhook consulta a cobrança NA API e chama
-- apply_subscription_charge, que renova o Premium uma única vez por cobrança aprovada.
-- REGRA: cancelou (ou estornou) → não há novas cobranças, mas o Premium continua até o fim do período pago.
-- RLS: cada pessoa só LÊ as próprias assinaturas. Quem grava é o servidor.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_subscription_id text unique,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'paused', 'cancelled')),
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'BRL',
  next_payment_date timestamptz,
  cancelled_at timestamptz
);

create index subscriptions_user_created on public.subscriptions (user_id, created_at desc);
-- No máximo 1 assinatura valendo (ativa ou pausada) por pessoa.
create unique index subscriptions_one_active on public.subscriptions (user_id) where status in ('authorized', 'paused');

alter table public.subscriptions enable row level security;

create policy "subscriptions: ler as próprias"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.subscriptions from anon;
revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;

-- Cada cobrança mensal vira uma linha em payments, ligada à assinatura.
alter table public.payments add column subscription_id uuid references public.subscriptions (id) on delete cascade;
create index payments_subscription on public.payments (subscription_id);

-- Aplica uma cobrança da assinatura (idempotente: o Mercado Pago pode avisar várias vezes).
-- Aprovada → Premium vale até 1 mês + 3 dias de folga a partir de agora (a folga cobre as novas
-- tentativas de cobrança do Mercado Pago). Nunca encurta um Premium que já vai mais longe.
-- Devolve true só na vez em que renovou.
create function public.apply_subscription_charge(
  p_subscription uuid,
  p_provider_payment_id text,
  p_status text,
  p_amount numeric,
  p_currency text,
  p_payment_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_pay public.payments%rowtype;
begin
  select * into v_sub from public.subscriptions where id = p_subscription for update;
  if not found or p_provider_payment_id is null then
    return false;
  end if;

  insert into public.payments (user_id, subscription_id, amount, currency, premium_days, provider_payment_id, status)
  values (v_sub.user_id, v_sub.id, v_sub.amount, v_sub.currency, 30, p_provider_payment_id, 'pending')
  on conflict (provider_payment_id) do nothing;

  select * into v_pay from public.payments where provider_payment_id = p_provider_payment_id for update;
  if v_pay.subscription_id is distinct from v_sub.id then
    return false;
  end if;

  -- Já renovado: tentativa recusada atrasada não muda nada. Estorno/contestação só ficam registrados
  -- (REGRA: o Premium continua até o fim do período pago).
  if v_pay.premium_granted and p_status not in ('refunded', 'charged_back') then
    return false;
  end if;

  update public.payments
  set status = p_status, payment_type = coalesce(p_payment_type, payment_type), updated_at = now()
  where id = v_pay.id;

  if p_status <> 'approved' or v_pay.premium_granted then
    return false;
  end if;

  if p_amount is null or p_amount < v_sub.amount or coalesce(p_currency, '') <> v_sub.currency then
    return false;
  end if;

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now() + interval '1 month 3 days')
  where id = v_sub.user_id;

  update public.payments set premium_granted = true, approved_at = now() where id = v_pay.id;
  return true;
end;
$$;

revoke all on function public.apply_subscription_charge(uuid, text, text, numeric, text, text) from public, anon, authenticated;
grant execute on function public.apply_subscription_charge(uuid, text, text, numeric, text, text) to service_role;

-- ---------- Métricas ----------
alter table public.events drop constraint events_name_check;
alter table public.events add constraint events_name_check check (name in (
  'signup_completed', 'onboarding_completed',
  'interview_started', 'interview_completed', 'interview_abandoned',
  'linkedin_analyzed', 'tip_read',
  'paywall_viewed', 'premium_cta_clicked', 'pix_copied', 'whatsapp_opened', 'reminder_enabled',
  'checkout_started', 'payment_approved',
  'subscription_started', 'subscription_authorized', 'subscription_cancelled'
));

-- Cobranças de assinatura não são "início de pagamento": só conta o pagamento aprovado.
create or replace function public.events_from_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.subscription_id is null then
      perform public.log_event(new.user_id, 'checkout_started', jsonb_build_object('amount', new.amount));
    end if;
  elsif new.premium_granted and not old.premium_granted then
    perform public.log_event(new.user_id, 'payment_approved',
      jsonb_build_object('amount', new.amount, 'payment_type', new.payment_type, 'recurring', new.subscription_id is not null));
  end if;
  return new;
end;
$$;

create function public.events_from_subscriptions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_event(new.user_id, 'subscription_started', jsonb_build_object('amount', new.amount));
  elsif new.status is distinct from old.status then
    if new.status = 'authorized' then
      perform public.log_event(new.user_id, 'subscription_authorized');
    elsif new.status = 'cancelled' then
      perform public.log_event(new.user_id, 'subscription_cancelled');
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.events_from_subscriptions() from public, anon, authenticated;

create trigger events_subscriptions
  after insert or update of status on public.subscriptions
  for each row execute function public.events_from_subscriptions();
