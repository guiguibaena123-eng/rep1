import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, Text } from '@/components';
import { t } from '@/i18n';
import { legalSections } from '@/i18n/legal';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

/** Termos de Uso e Política de Privacidade no idioma do app (texto provisório, marcado na tela). */
export default function LegalScreen() {
  const { colors } = useTheme();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const isTerms = doc === 'termos';
  const sections = legalSections(isTerms ? 'terms' : 'privacy');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        leading="close"
        title={isTerms ? t.legal.termsTitle : t.legal.privacyTitle}
        onLeadingPress={() => router.back()}
      />
      <Screen withHeader gap={20}>
        <View style={[styles.banner, { backgroundColor: colors.warningSoft }]}>
          <Text variant="caption" weight="semibold" style={{ color: colors.warningInk }}>
            {t.legal.draftBanner}
          </Text>
        </View>
        {sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text variant="sectionTitle" accessibilityRole="header">
              {s.title}
            </Text>
            <Text color="textSecondary">{s.body}</Text>
          </View>
        ))}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 12, borderRadius: radius.button },
  section: { gap: 6 },
});
