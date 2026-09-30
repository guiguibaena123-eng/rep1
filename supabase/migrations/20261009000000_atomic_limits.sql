-- Limites à prova de pedidos simultâneos (auditoria de 29/09/2026).
-- Antes: a Edge Function conferia o limite, esperava a IA e só DEPOIS somava o uso.
-- Vários pedidos ao mesmo tempo passavam todos na conferência (ex.: 20 simulações grátis de uma vez).
-- Agora: a vaga é RESERVADA numa única operação do banco ANTES da IA, e devolvida se algo falhar.

-- ---------- 1. Contador diário do Premium ----------
-- O limite técnico de 30 simulações por dia passa a usar o mesmo contador (antes contava as sessões criadas).
alter table public.usage_counters drop constraint usage_counters_kind_check;
alter table public.usage_counters add constraint usage_counters_kind_check
  check (kind in ('interview', 'interview_day', 'linkedin_full', 'linkedin_summary'));

-- ---------- 2. Reservar / devolver uma vaga ----------
-- Soma 1 SÓ SE ainda couber no limite. A linha fica travada durante a soma, então dois pedidos
-- ao mesmo tempo nunca pegam a mesma vaga. Devolve true se reservou.
create function public.reserve_usage(p_user uuid, p_kind text, p_period date, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  if p_limit < 1 then
    return false;
  end if;
  insert into public.usage_counters (user_id, kind, period_start, count)
  values (p_user, p_kind, p_period, 1)
  on conflict (user_id, kind, period_start)
  do update set count = public.usage_counters.count + 1
  where public.usage_counters.count < p_limit
  returning count into v_count;
  return v_count is not null;
end;
$$;

revoke all on function public.reserve_usage(uuid, text, date, int) from public, anon, authenticated;
grant execute on function public.reserve_usage(uuid, text, date, int) to service_role;

-- Devolve a vaga quando a simulação/análise não chegou a ser entregue (ex.: a IA falhou).
create function public.release_usage(p_user uuid, p_kind text, p_period date)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.usage_counters
  set count = greatest(count - 1, 0)
  where user_id = p_user and kind = p_kind and period_start = p_period;
$$;

revoke all on function public.release_usage(uuid, text, date) from public, anon, authenticated;
grant execute on function public.release_usage(uuid, text, date) to service_role;

-- ---------- 3. Limite de chamadas por hora (20 por função) ----------
-- Conta e registra numa só operação, com uma trava por pessoa+função.
create function public.take_rate_slot(p_user uuid, p_fn text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_fn, 0));
  if (
    select count(*) from public.api_calls
    where user_id = p_user and fn = p_fn and created_at > now() - interval '1 hour'
  ) >= p_limit then
    return false;
  end if;
  insert into public.api_calls (user_id, fn) values (p_user, p_fn);
  return true;
end;
$$;

revoke all on function public.take_rate_slot(uuid, text, int) from public, anon, authenticated;
grant execute on function public.take_rate_slot(uuid, text, int) to service_role;

-- ---------- 4. Assinatura: no máximo 1 página de pagamento aberta por pessoa ----------
-- Evita duas páginas de pagamento (e cobrança dobrada) com dois toques rápidos em "Assinar".
-- Segurança para dados antigos: se houver mais de uma pendente, só a mais nova continua.
update public.subscriptions s
set status = 'cancelled', cancelled_at = now(), updated_at = now()
where s.status = 'pending'
  and exists (
    select 1 from public.subscriptions n
    where n.user_id = s.user_id and n.status = 'pending' and n.created_at > s.created_at
  );

create unique index subscriptions_one_pending on public.subscriptions (user_id) where status = 'pending';
