import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { t } from '@/i18n';

import { weeklyPlan, type ReminderTime } from './logic';

/**
 * Notificações LOCAIS: agendadas no próprio celular, sem servidor.
 * Funcionam com o app fechado e no Expo Go (iPhone e Android).
 */
const CHANNEL_ID = 'lembrete-diario';

// Com o app aberto, o lembrete também aparece como banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** No Android 13+ o canal precisa existir ANTES de pedir a permissão. */
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: t.reminders.channel,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** true se o app já pode mostrar notificações (não pergunta nada). */
export async function hasPermission() {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** Pede a permissão (o sistema só pergunta uma vez; depois, só nas configurações). */
export async function requestPermission() {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const { granted } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return granted;
}

/**
 * Fila: agendar e cancelar rodam um de cada vez. Sem isso, duas chamadas quase juntas
 * (tela Perfil + sincronização ao abrir o app) poderiam deixar lembretes duplicados.
 */
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

/** Troca os lembretes agendados pelos novos (7, um por dia da semana). */
export function scheduleReminders(time: ReminderTime) {
  return serial(async () => {
    await ensureChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const item of weeklyPlan(time, t.reminders.messages)) {
      await Notifications.scheduleNotificationAsync({
        content: { title: t.reminders.title, body: item.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: item.weekday,
          hour: item.hour,
          minute: item.minute,
          channelId: CHANNEL_ID,
        },
      });
    }
  });
}

/** Apaga todos os lembretes deste aparelho (desligar, sair da conta). */
export function cancelReminders() {
  return serial(() => Notifications.cancelAllScheduledNotificationsAsync());
}
