import { router } from 'expo-router';
import { Check, Smartphone } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, Text, useToast } from '@/components';
import { effectiveLanguage, usePreferences, type LanguageChoice } from '@/features/preferences/store';
import { Group } from '@/features/settings/rows';
import { LANGUAGES, deviceLanguage, languageName, t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, space } from '@/theme/tokens';

/**
 * Idioma (Configurações): o do celular ou um dos 5 idiomas, cada um com a bandeira do país.
 * Trocar aplica na hora: as telas remontam com os textos novos.
 */
export default function LanguageScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const choice = usePreferences((s) => s.language);
  const setLanguage = usePreferences((s) => s.setLanguage);

  const pick = (next: LanguageChoice) => {
    if (next === choice) return;
    setLanguage(next);
    toast.show(t.language.changed(languageName(effectiveLanguage(next))));
  };

  const device = deviceLanguage();
  const deviceFlag = LANGUAGES.find((l) => l.code === device)!.flag;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t.language.title} onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/configuracoes'))} />
      <Screen withHeader>
        <Group>
          <View accessibilityRole="radiogroup" accessibilityLabel={t.language.title}>
            <Option
              selected={choice === null}
              onPress={() => pick(null)}
              leading={<Smartphone size={24} color={colors.text} strokeWidth={iconStroke} />}
              title={t.language.device}
              subtitle={t.language.deviceText(`${deviceFlag} ${languageName(device)}`)}
            />
            {LANGUAGES.map((lang) => (
              <Option
                key={lang.code}
                divider
                selected={choice === lang.code}
                onPress={() => pick(lang.code)}
                leading={
                  <Text style={styles.flag} accessible={false} importantForAccessibility="no">
                    {lang.flag}
                  </Text>
                }
                title={lang.name}
              />
            ))}
          </View>
        </Group>

        <Text variant="bodySmall" color="textSecondary" style={styles.note}>
          {t.language.note}
        </Text>
      </Screen>
    </View>
  );
}

function Option({
  selected,
  onPress,
  leading,
  title,
  subtitle,
  divider,
}: {
  selected: boolean;
  onPress: () => void;
  leading: React.ReactNode;
  title: string;
  subtitle?: string;
  divider?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        selected && { backgroundColor: colors.primarySoft },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.leading}>{leading}</View>
      <View style={{ flex: 1 }}>
        <Text weight="semibold" style={selected ? { color: colors.primaryInk } : undefined}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="bodySmall" color={selected ? 'textOnSoft' : 'textSecondary'}>
            {subtitle}
          </Text>
        )}
      </View>
      {selected && <Check size={22} color={colors.primaryInk} strokeWidth={2} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: space[3], paddingHorizontal: space[4] },
  leading: { width: 32, alignItems: 'center' },
  flag: { fontSize: 26, lineHeight: 32 },
  note: { paddingHorizontal: space[1] },
});
