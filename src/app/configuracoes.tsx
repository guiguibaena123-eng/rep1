import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import {
  Bell,
  ChartNoAxesColumn,
  CircleHelp,
  Download,
  FileText,
  Languages,
  LogOut,
  Minus,
  Plus,
  Shield,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Input, Screen, ScreenHeader, Text, useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { deleteAccount, signOut } from '@/features/auth/api';
import { useContactSupport } from '@/features/plan/contact';
import { effectiveLanguage, usePreferences, type ThemeMode } from '@/features/preferences/store';
import { useProfile, useUpdateProfile } from '@/features/profile/api';
import { exportMyData } from '@/features/profile/export';
import { formatTime, parseTime, stepTime, type ReminderTime } from '@/features/reminders/logic';
import { cancelReminders, requestPermission, scheduleReminders } from '@/features/reminders/notifications';
import { DangerRow, Group, GroupTitle, Row, SwitchRow } from '@/features/settings/rows';
import { LANGUAGES, languageName, t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { track } from '@/lib/events';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, shadowElevated, size, space } from '@/theme/tokens';

const p = t.profile;
const s = t.settings;
// Chave do texto, lido na hora (troca junto com o idioma).
const THEMES: { mode: ThemeMode; label: 'light' | 'dark' | 'auto' }[] = [
  { mode: 'light', label: 'light' },
  { mode: 'dark', label: 'dark' },
  { mode: 'auto', label: 'auto' },
];

/** Configurações (aberta pelo Perfil): aparência, notificações, privacidade, ajuda e sair. */
export default function SettingsScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { session } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const contactSupport = useContactSupport();

  const doSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast.show(p.signOutError, 'error');
    }
  };

  const doExport = async () => {
    if (!session) return;
    setExporting(true);
    try {
      await exportMyData(session.user.id, session.user.email);
    } catch {
      toast.show(p.exportError, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={s.title} onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))} />
      <Screen withHeader>
        <GroupTitle>{t.settings.language}</GroupTitle>
        <LanguageRow />

        <GroupTitle>{t.appearance.title}</GroupTitle>
        <AppearanceGroup />

        <GroupTitle>{s.notifications}</GroupTitle>
        <ReminderGroup />

        <GroupTitle>{p.privacy}</GroupTitle>
        <Group>
          <ShowAverageRow />
          <Row icon={Shield} title={p.privacyPolicy} onPress={() => router.push('/legal/privacidade')} divider />
          <Row icon={FileText} title={p.terms} onPress={() => router.push('/legal/termos')} divider />
          <Row icon={Download} title={exporting ? p.exporting : p.exportData} onPress={doExport} busy={exporting} divider />
          <DangerRow icon={Trash2} title={p.deleteAccount} onPress={() => setDeleteOpen(true)} divider />
        </Group>

        <GroupTitle>{s.account}</GroupTitle>
        <Group>
          <Row icon={CircleHelp} title={p.help} onPress={() => contactSupport('ajuda')} />
          <Row icon={LogOut} title={p.signOut} subtitle={session?.user.email} onPress={doSignOut} divider />
        </Group>

        <View style={styles.footer}>
          <Text variant="caption" color="textSecondary" align="center" style={{ lineHeight: 18 }}>
            {t.disclaimer}
          </Text>
          <Text variant="caption" color="textSecondary" align="center">
            {p.version(Constants.expoConfig?.version ?? '1.0.0')}
          </Text>
        </View>
      </Screen>

      <DeleteAccountSheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </View>
  );
}

/** Idioma atual (bandeira + nome) e acesso à tela Idioma. */
function LanguageRow() {
  const choice = usePreferences((st) => st.language);
  const lang = effectiveLanguage(choice);
  const flag = LANGUAGES.find((l) => l.code === lang)!.flag;
  const subtitle = `${flag} ${languageName(lang)}${choice === null ? ` · ${t.language.device}` : ''}`;
  return (
    <Group>
      <Row icon={Languages} title={t.language.title} subtitle={subtitle} onPress={() => router.push('/idioma')} />
    </Group>
  );
}

/** Tema claro, escuro ou automático: aplica na hora e guarda na conta. */
function AppearanceGroup() {
  const { colors } = useTheme();
  const update = useUpdateProfile();
  const themeMode = usePreferences((st) => st.themeMode);
  const setThemeMode = usePreferences((st) => st.setThemeMode);

  const pickTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    update.mutate({ theme: mode });
  };

  return (
    <Group>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t.appearance.title}
        style={[styles.segment, { backgroundColor: colors.segmentTrack }]}
      >
        {THEMES.map(({ mode, label }) => {
          const on = themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => pickTheme(mode)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.segmentItem, on && [{ backgroundColor: colors.surface }, shadowElevated]]}
            >
              <Text variant="bodySmall" weight="semibold" style={{ color: on ? colors.text : colors.textSecondary }}>
                {t.appearance[label]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Group>
  );
}

/** Mostrar a nota média no Meu perfil (mesma escolha do botão "Ocultar" de lá). */
function ShowAverageRow() {
  const toast = useToast();
  const profile = useProfile().data;
  const update = useUpdateProfile();
  const on = profile?.show_average !== false;

  return (
    <SwitchRow
      icon={ChartNoAxesColumn}
      title={s.showAverage}
      subtitle={s.showAverageText}
      value={on}
      disabled={!profile || update.isPending}
      onChange={(next) => update.mutate({ show_average: next }, { onError: () => toast.show(t.myProfile.averageSaveError, 'error') })}
    />
  );
}

/**
 * Lembrete diário: ao ligar, pede a permissão de notificação. Negada → explica como ativar
 * nas configurações e continua desligado. Liberada → agenda no aparelho e salva na conta.
 */
function ReminderGroup() {
  const { colors } = useTheme();
  const toast = useToast();
  const profile = useProfile().data;
  const update = useUpdateProfile();
  const [busy, setBusy] = useState(false);
  const [deniedOpen, setDeniedOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const enabled = !!profile?.reminder_enabled;
  const time = parseTime(profile?.reminder_time);

  const turnOn = async (when: ReminderTime) => {
    if (!(await requestPermission())) {
      setDeniedOpen(true);
      return;
    }
    await scheduleReminders(when);
    await update.mutateAsync({ reminder_enabled: true, reminder_time: formatTime(when) });
    track('reminder_enabled', { hour: when.hour });
    toast.show(p.reminderOn(formatTime(when)));
  };

  const turnOff = async () => {
    await cancelReminders();
    await update.mutateAsync({ reminder_enabled: false });
    toast.show(p.reminderOff);
  };

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch {
      toast.show(p.reminderError, 'error');
    } finally {
      setBusy(false);
    }
  };

  const saveTime = (when: ReminderTime) => {
    setTimeOpen(false); // fecha antes: no iOS o toast fica atrás do Modal
    run(async () => {
      if (enabled) return turnOn(when);
      await update.mutateAsync({ reminder_time: formatTime(when) });
    });
  };

  return (
    <Group>
      <SwitchRow
        icon={Bell}
        title={p.reminders}
        subtitle={p.remindersText}
        value={enabled}
        disabled={busy || !profile}
        onChange={(on) => run(() => (on ? turnOn(time) : turnOff()))}
      >
        {enabled && (
          <View style={styles.timeRow}>
            <Text variant="bodySmall" color="textSecondary">
              {p.reminderTime}
            </Text>
            <Pressable
              onPress={() => setTimeOpen(true)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={p.reminderTimeA11y(formatTime(time))}
              style={({ pressed }) => [
                styles.timeButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text weight="medium">{formatTime(time)}</Text>
            </Pressable>
          </View>
        )}
      </SwitchRow>

      <BottomSheet visible={deniedOpen} onClose={() => setDeniedOpen(false)} title={p.reminderDeniedTitle} description={p.reminderDeniedText}>
        <Button
          label={p.reminderOpenSettings}
          onPress={() => {
            setDeniedOpen(false);
            Linking.openSettings();
          }}
        />
        <Button label={t.common.notNow} variant="text" onPress={() => setDeniedOpen(false)} />
      </BottomSheet>

      {timeOpen && <TimeSheet initial={time} onSave={saveTime} onClose={() => setTimeOpen(false)} />}
    </Group>
  );
}

/** Seletor simples de horário: hora e minuto (de 15 em 15) com botões − e +. */
function TimeSheet({ initial, onSave, onClose }: { initial: ReminderTime; onSave: (time: ReminderTime) => void; onClose: () => void }) {
  const [time, setTime] = useState(initial);
  const parts = [
    { key: 'hour' as const, label: p.timeHour, value: String(time.hour).padStart(2, '0') },
    { key: 'minute' as const, label: p.timeMinute, value: String(time.minute).padStart(2, '0') },
  ];

  return (
    <BottomSheet visible onClose={onClose} title={p.timeTitle}>
      <View style={styles.timePicker}>
        {parts.map(({ key, label, value }) => (
          <View key={key} style={styles.timePart}>
            <Text variant="caption" color="textSecondary">
              {label}
            </Text>
            <StepButton icon={Plus} label={p.timeMore(label.toLowerCase())} onPress={() => setTime((v) => stepTime(v, key, 1))} />
            <Text style={styles.timeValue} accessibilityLabel={`${label}: ${value}`} accessibilityLiveRegion="polite">
              {value}
            </Text>
            <StepButton icon={Minus} label={p.timeLess(label.toLowerCase())} onPress={() => setTime((v) => stepTime(v, key, -1))} />
          </View>
        ))}
      </View>
      <Button label={p.timeSave} onPress={() => onSave(time)} />
      <Button label={t.common.notNow} variant="text" onPress={onClose} />
    </BottomSheet>
  );
}

function StepButton({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.stepButton, { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.7 }]}
    >
      <Icon size={22} color={colors.primaryInk} strokeWidth={iconStroke} />
    </Pressable>
  );
}

/** Confirmação de exclusão: só libera o botão depois de digitar APAGAR. */
function DeleteAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useToast();
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const confirmed = word.trim().toUpperCase() === p.deleteWord;

  const close = () => {
    setWord('');
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      toast.show(p.deleteDone);
      close();
    } catch (err) {
      // Fecha o sheet antes: no iOS o toast fica atrás do Modal.
      close();
      toast.show(err instanceof ApiError ? err.message : t.errors.INTERNAL, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet placement="center" visible={visible} onClose={close} title={p.deleteTitle} description={p.deleteText}>
      <Input label={p.deleteLabel} hideLabel placeholder={p.deleteWord} value={word} onChangeText={setWord} autoCapitalize="characters" />
      <Button label={p.deleteConfirm} onPress={confirm} disabled={!confirmed} loading={busy} style={{ marginTop: space[2] }} />
      <Button label={t.common.notNow} variant="text" onPress={close} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: space[1], padding: space[1], margin: space[3], borderRadius: radius.button },
  segmentItem: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 36 },
  timeButton: { minHeight: size.minTouch - 4, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
  timePicker: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: space[2] },
  timePart: { alignItems: 'center', gap: space[2] },
  timeValue: { fontFamily: fonts.heading800, fontSize: 36, lineHeight: 44 },
  stepButton: { width: size.minTouch, height: size.minTouch, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  footer: { gap: 6, paddingTop: space[2] },
});
