import { supabase } from './supabase';

/**
 * Eventos que o próprio app registra (tabela events). Os outros (cadastro, simulações,
 * LinkedIn, dicas lidas, início e aprovação do pagamento) são gravados pelo banco, por gatilhos.
 * Nunca mande texto do usuário em props: só valores simples (ex.: de qual tela veio).
 */
export type ClientEvent = 'paywall_viewed' | 'premium_cta_clicked' | 'support_opened' | 'reminder_enabled';

/** Registra sem esperar e sem mostrar erro: métrica nunca atrapalha o uso do app. */
export function track(name: ClientEvent, props: Record<string, string | number | boolean> = {}) {
  supabase
    .from('events')
    .insert({ name, props })
    .then(
      () => {},
      () => {},
    );
}
