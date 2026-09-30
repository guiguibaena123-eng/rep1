import { useEffect } from 'react';

import { usePreferences } from '@/features/preferences/store';
import type { Profile } from '@/features/profile/types';

import { parseTime } from './logic';
import { cancelReminders, hasPermission, scheduleReminders } from './notifications';

/**
 * Deixa os lembretes do aparelho iguais ao que está salvo na conta (profiles.reminder_*).
 * Ex.: entrou num celular novo com o lembrete ligado → agenda de novo (se já houver permissão).
 * Sem permissão, não pergunta nada aqui: só a tela Perfil pede, quando a pessoa liga.
 */
export function useReminderSync(profile: Pick<Profile, 'reminder_enabled' | 'reminder_time'> | undefined) {
  const enabled = profile?.reminder_enabled;
  const time = profile?.reminder_time;
  // Os textos ficam gravados no agendamento: trocou o idioma, agenda de novo com as frases novas.
  const language = usePreferences((s) => s.language);

  useEffect(() => {
    if (enabled === undefined) return;
    const sync = async () => {
      if (!enabled) return cancelReminders();
      if (await hasPermission()) return scheduleReminders(parseTime(time));
    };
    sync().catch(() => {});
  }, [enabled, time, language]);
}
