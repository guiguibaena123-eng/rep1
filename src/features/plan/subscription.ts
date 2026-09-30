import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '@/features/auth/AuthProvider';
import { profileKey } from '@/features/profile/api';
import { callFunction } from '@/lib/api';
import { supabase } from '@/lib/supabase';

import { isStripeCheckoutUrl, type SubscriptionStatus } from './logic';

/** Cria a assinatura no servidor e devolve o link da página de pagamento da Stripe (o preço é decidido no servidor). */
export function createSubscription() {
  return callFunction<{ subscription_id: string; checkout_url: string }>('create-subscription');
}

/** Abre a página de pagamento da Stripe dentro do app. A tela seguinte acompanha a aprovação sozinha. */
export async function openCheckout(url: string) {
  // Segurança: nunca abre para pagar um endereço que não seja da Stripe.
  if (!isStripeCheckoutUrl(url)) throw new Error('UNTRUSTED_CHECKOUT_URL');
  await WebBrowser.openBrowserAsync(url);
}

/** Plano B: pede ao servidor para consultar a assinatura na Stripe e renovar o Premium. */
export function checkSubscription(subscriptionId: string) {
  return callFunction<{ status: SubscriptionStatus; premium: boolean }>('check-subscription', {
    subscription_id: subscriptionId,
  });
}

export type SubscriptionRow = {
  id: string;
  status: SubscriptionStatus;
  amount: number;
  next_payment_date: string | null;
  created_at: string;
};

const COLUMNS = 'id, status, amount, next_payment_date, created_at';

/**
 * Uma assinatura (RLS: só a dona lê). Enquanto estiver "pending", consulta de novo a cada 4 segundos.
 * `stop` = true para de consultar mesmo sem mudar de status (ex.: Premium já liberado).
 */
export function useSubscription(id: string | undefined, stop = false) {
  return useQuery({
    queryKey: ['subscription', id ?? ''],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select(COLUMNS).eq('id', id!).maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
    refetchInterval: (query) => (stop || (query.state.data && query.state.data.status !== 'pending') ? false : 4000),
  });
}

export const mySubscriptionKey = (userId: string | undefined) => ['my-subscription', userId] as const;

/** Assinatura atual da pessoa (ativa ou pausada), para o Perfil e a T16. null = não tem. */
export function useMySubscription() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: mySubscriptionKey(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(COLUMNS)
        .in('status', ['authorized', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
  });
}

/** Cancela a renovação. O Premium continua até o fim do período pago. */
export function useCancelSubscription() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  return async () => {
    const result = await callFunction<{ premium_until: string | null }>('cancel-subscription');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: mySubscriptionKey(userId) }),
      queryClient.invalidateQueries({ queryKey: profileKey(userId) }),
    ]);
    return result;
  };
}
