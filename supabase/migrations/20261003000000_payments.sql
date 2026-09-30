-- Pagamento do Premium pelo Mercado Pago (Checkout Pro): 1 mês por vez, sem assinatura.
-- Fluxo: create-checkout cria a linha "pending" e o link de pagamento →
-- a pessoa paga no Mercado Pago → mercadopago-webhook consulta o pagamento NA API do
-- Mercado Pago e chama grant_premium_for_payment, que libera os dias de Premium uma única vez.
-- RLS: cada pessoa só LÊ os próprios pagamentos (para a tela acompanhar). Quem grava é o servidor.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'mercadopago',
  status text not null default 'pending'
    check (status in ('pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back')),
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'BRL',
  premium_days int not null check (premium_days between 1 and 366),
  preference_id text,
  provider_payment_id text unique,
  payment_type text,
  approved_at timestamptz,
  -- true depois que os dias de Premium foram somados (garante que nunca soma duas vezes).
  premium_granted boolean not null default false
);

create index payments_user_created on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

create policy "payments: ler os próprios"
  on public.payments for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.payments from anon;
revoke insert, update, delete on public.payments from authenticated;
grant select on public.payments to authenticated;

-- Atualiza o pagamento com o que o Mercado Pago informou e, se aprovado,
-- soma os dias de Premium (a partir de hoje, ou do fim do Premium atual se ainda estiver valendo).
-- Idempotente: o Mercado Pago pode mandar o mesmo aviso várias vezes.
-- Devolve true só na vez em que o Premium foi liberado.
create function public.grant_premium_for_payment(
  p_payment uuid,
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
  v_pay public.payments%rowtype;
begin
  -- "for update": se dois avisos chegarem juntos, o segundo espera o primeiro terminar.
  select * into v_pay from public.payments where id = p_payment for update;
  if not found then
    return false;
  end if;

  -- Já liberado: uma tentativa recusada que chegue atrasada não muda nada.
  -- REGRA DO NEGÓCIO: se a pessoa desistir depois de pagar (cancelamento, estorno ou contestação),
  -- o Premium continua até o fim dos dias pagos. Só registramos o status; premium_until não muda.
  if v_pay.premium_granted and p_status not in ('refunded', 'charged_back') then
    return false;
  end if;

  update public.payments
  set status = p_status,
      provider_payment_id = coalesce(provider_payment_id, p_provider_payment_id),
      payment_type = coalesce(p_payment_type, payment_type),
      updated_at = now()
  where id = p_payment;

  if p_status <> 'approved' or v_pay.premium_granted then
    return false;
  end if;

  -- Só libera se o valor pago for o valor combinado (evita pagar menos alterando o link).
  if p_amount is null or p_amount < v_pay.amount or coalesce(p_currency, '') <> v_pay.currency then
    return false;
  end if;

  update public.profiles
  set plan = 'premium',
      premium_until = greatest(coalesce(premium_until, now()), now()) + make_interval(days => v_pay.premium_days)
  where id = v_pay.user_id;

  update public.payments
  set premium_granted = true, approved_at = now()
  where id = p_payment;

  return true;
end;
$$;

revoke all on function public.grant_premium_for_payment(uuid, text, text, numeric, text, text) from public, anon, authenticated;
grant execute on function public.grant_premium_for_payment(uuid, text, text, numeric, text, text) to service_role;

-- ---------- Métricas: início do pagamento e pagamento aprovado ----------
alter table public.events drop constraint events_name_check;
alter table public.events add constraint events_name_check check (name in (
  'signup_completed', 'onboarding_completed',
  'interview_started', 'interview_completed', 'interview_abandoned',
  'linkedin_analyzed', 'tip_read',
  'paywall_viewed', 'premium_cta_clicked', 'pix_copied', 'whatsapp_opened', 'reminder_enabled',
  'checkout_started', 'payment_approved'
));

create function public.events_from_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_event(new.user_id, 'checkout_started', jsonb_build_object('amount', new.amount));
  elsif new.premium_granted and not old.premium_granted then
    perform public.log_event(new.user_id, 'payment_approved',
      jsonb_build_object('amount', new.amount, 'payment_type', new.payment_type));
  end if;
  return new;
end;
$$;

revoke all on function public.events_from_payments() from public, anon, authenticated;

create trigger events_payments
  after insert or update of premium_granted on public.payments
  for each row execute function public.events_from_payments();
