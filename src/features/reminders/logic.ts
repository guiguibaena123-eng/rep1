/** Regras do lembrete diário, sem dependência do celular (fácil de testar). */

export type ReminderTime = { hour: number; minute: number };

export const DEFAULT_REMINDER: ReminderTime = { hour: 19, minute: 0 };
/** O seletor de minutos anda de 15 em 15. */
export const MINUTE_STEP = 15;

/** "19:30:00" ou "19:30" (coluna time do banco) → { hour: 19, minute: 30 }. Inválido → padrão. */
export function parseTime(value: string | null | undefined): ReminderTime {
  const m = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
  if (!m) return DEFAULT_REMINDER;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return DEFAULT_REMINDER;
  return { hour, minute };
}

/** { hour: 7, minute: 5 } → "07:05" (vale para a tela e para gravar no banco). */
export function formatTime({ hour, minute }: ReminderTime) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Soma horas/minutos dando a volta (23 + 1 = 0; 0 - 15 min = 45). */
export function stepTime(time: ReminderTime, part: 'hour' | 'minute', direction: 1 | -1): ReminderTime {
  if (part === 'hour') return { ...time, hour: (time.hour + direction + 24) % 24 };
  const snapped = Math.round(time.minute / MINUTE_STEP) * MINUTE_STEP;
  return { ...time, minute: (snapped + direction * MINUTE_STEP + 60) % 60 };
}

/**
 * Um lembrete por dia da semana (1 = domingo … 7 = sábado, como no expo-notifications),
 * cada dia com uma mensagem diferente, para não ficar repetitivo.
 */
export function weeklyPlan(time: ReminderTime, messages: readonly string[]) {
  return Array.from({ length: 7 }, (_, i) => ({
    weekday: i + 1,
    hour: time.hour,
    minute: time.minute,
    body: messages[i % messages.length],
  }));
}
