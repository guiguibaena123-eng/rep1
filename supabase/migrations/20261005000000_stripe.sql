-- Troca do Mercado Pago pela Stripe (decisão do dono do app, 28/09/2026).
-- Motivo: a assinatura do Mercado Pago só aceita pagar logado no Mercado Pago com o MESMO e-mail da conta,
-- o que barrava quem usa e-mails diferentes. Na Stripe, a pessoa paga com qualquer cartão.
-- As tabelas e as regras continuam as mesmas (subscriptions + payments + apply_subscription_charge):
--  - subscriptions.provider_subscription_id guarda o id da página de pagamento (cs_...) e, depois de paga,
--    o id da assinatura na Stripe (sub_...).
--  - payments.provider_payment_id guarda o id da fatura paga (in_...).

alter table public.subscriptions alter column provider set default 'stripe';
alter table public.payments alter column provider set default 'stripe';

-- Tentativas de teste do Mercado Pago que nunca foram pagas: encerra (nenhuma chegou a cobrar).
update public.subscriptions
set status = 'cancelled', cancelled_at = now(), updated_at = now()
where provider = 'mercadopago' and status = 'pending';

-- Mesma regra de antes; a única mudança é gravar o provedor da assinatura na cobrança.
create or replace function public.apply_subscription_charge(
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

  insert into public.payments (user_id, subscription_id, provider, amount, currency, premium_days, provider_payment_id, status)
  values (v_sub.user_id, v_sub.id, v_sub.provider, v_sub.amount, v_sub.currency, 30, p_provider_payment_id, 'pending')
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
