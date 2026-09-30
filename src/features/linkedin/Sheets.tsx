import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { CalendarDays, Copy, Download, ExternalLink, FolderOpen, Globe, Monitor, Upload, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/components';
import { t } from '@/i18n';
import { shortDate } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

/** Abre o perfil de quem está logado no LinkedIn (o próprio site redireciona /in/me/). */
export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/me/';

const h = t.linkedin.helpSteps;
const ios = Platform.OS === 'ios';

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Globe, title: h.open.title, text: h.open.text },
  { icon: Monitor, title: h.desktop.title, text: ios ? h.desktop.ios : h.desktop.android },
  { icon: Download, title: h.save.title, text: h.save.text },
  { icon: FolderOpen, title: h.find.title, text: ios ? h.find.ios : h.find.android },
  { icon: Upload, title: h.send.title, text: h.send.text },
];

/**
 * "Como baixar meu perfil em PDF?": passo a passo + botão que abre o LinkedIn no navegador.
 * O "Salvar como PDF" só existe no site (versão para computador), não no app do LinkedIn.
 */
export function PdfHelpSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const [openError, setOpenError] = useState(false);

  const open = async () => {
    setOpenError(false);
    try {
      await Linking.openURL(LINKEDIN_PROFILE_URL);
    } catch {
      setOpenError(true);
    }
  };

  // Sem toast aqui: no iOS o toast fica atrás do Modal. O próprio botão mostra "Link copiado".
  const copy = async () => {
    await Clipboard.setStringAsync(LINKEDIN_PROFILE_URL);
    setCopied(true);
  };

  const close = () => {
    setCopied(false);
    setOpenError(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={close} title={t.linkedin.helpTitle} description={t.linkedin.helpIntro}>
      <View style={styles.steps}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <View key={i} style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon size={22} color={colors.primary} strokeWidth={iconStroke} />
              </View>
              <View style={[styles.flex, { gap: 2 }]}>
                <Text weight="semibold">{`${i + 1}. ${step.title}`}</Text>
                <Text variant="bodySmall" color="textSecondary">
                  {step.text}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        label={t.linkedin.helpOpen}
        onPress={open}
        icon={<ExternalLink size={18} color={colors.onPrimary} strokeWidth={2} />}
        accessibilityHint={LINKEDIN_PROFILE_URL}
        style={{ marginTop: space[2] }}
      />
      <Button
        label={copied ? t.linkedin.helpCopied : t.linkedin.helpCopy}
        variant="secondary"
        onPress={copy}
        icon={<Copy size={18} color={colors.primaryInk} strokeWidth={iconStroke} />}
      />
      {openError && (
        <Text variant="bodySmall" style={{ color: colors.errorInk }} accessibilityLiveRegion="polite">
          {t.linkedin.helpOpenError}
        </Text>
      )}

      <Text variant="bodySmall" color="textSecondary" style={{ marginTop: space[2] }}>
        {t.linkedin.helpComputer}
      </Text>
      <Button label={t.linkedin.helpOk} variant="text" onPress={close} />
    </BottomSheet>
  );
}

/** Limite do mês atingido (grátis: 1 resumo; Premium: 10 completos). */
export function LinkedInLimitSheet({
  visible,
  onClose,
  premium,
  resetsAt,
  onPremium,
}: {
  visible: boolean;
  onClose: () => void;
  premium: boolean;
  resetsAt: string | null;
  onPremium: () => void;
}) {
  const { colors } = useTheme();
  const date = resetsAt ? shortDate(resetsAt) : '1º';
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      icon={
        <View style={[styles.limitIcon, { backgroundColor: colors.warningSoft }]}>
          <CalendarDays size={26} color={colors.streakIcon} strokeWidth={iconStroke} />
        </View>
      }
      title={premium ? t.linkedin.limitTitlePremium : t.linkedin.limitTitle}
      description={premium ? t.linkedin.limitTextPremium(date) : t.linkedin.limitText(date)}
    >
      {!premium && <Button label={t.linkedin.limitPremium} onPress={onPremium} />}
      <Button label={t.linkedin.limitBack} variant={premium ? 'primary' : 'text'} onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  steps: { gap: space[4] },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  limitIcon: { width: 56, height: 56, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
});
