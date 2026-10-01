import { Redirect, router } from 'expo-router';
import { Bookmark, Lightbulb } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  PremiumBadge,
  ProgressBar,
  Screen,
  ScreenHeader,
  ScoreRing,
  SkeletonCard,
  Text,
  useToast,
} from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke } from '@/theme/tokens';

const s = t.showcase;

/**
 * Vitrine de todos os componentes e estados (design/telas/Componentes.dc.html).
 * Só para desenvolvimento: sai do app antes do lançamento.
 */
export default function DevShowcaseGate() {
  if (!__DEV__) return <Redirect href="/" />;
  return <ComponentsShowcase />;
}

function ComponentsShowcase() {
  const { colors } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('ana.souza@gmail');
  const [password, setPassword] = useState('treino2026');
  const [answer, setAnswer] = useState('Sou a Ana, tenho 19 anos e estou terminando o ensino médio técnico em administração.');
  const [chip, setChip] = useState<string>(s.chipsArea[0]);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(false);

  const fakeLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={s.title} onLeadingPress={() => router.back()} />
      <Screen withHeader gap={24}>
        <Section title={s.buttons}>
          <Button label={s.primary} onPress={fakeLoad} loading={loading} />
          <Button label={s.primary} disabled />
          <Button
            label={s.secondary}
            variant="secondary"
            icon={<Lightbulb size={18} color={colors.primaryInk} strokeWidth={iconStroke} />}
          />
          <View style={styles.row}>
            <Button label={s.skip} variant="text" />
            <Button label={t.common.notNow} variant="text" />
          </View>
        </Section>

        <Section title={s.fields}>
          <Input
            label={s.emailLabel}
            placeholder={s.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : s.emailError}
          />
          <Input label={s.passwordLabel} value={password} onChangeText={setPassword} password />
          <Input
            label={s.answerLabel}
            hideLabel
            long
            maxLength={2000}
            counterFrom={0}
            placeholder={s.answerPlaceholder}
            value={answer}
            onChangeText={setAnswer}
          />
        </Section>

        <Section title={s.chips}>
          <View style={styles.wrap}>
            {s.chipsArea.map((label) => (
              <Chip key={label} label={label} selected={chip === label} onPress={() => setChip(label)} showCheck />
            ))}
          </View>
          <PremiumBadge />
        </Section>

        <Section title={s.cards}>
          <Card onPress={() => {}} accessibilityLabel={s.cardTitle}>
            <Text weight="semibold">{s.cardTitle}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {s.cardMeta}
            </Text>
          </Card>
          <Card variant="highlight">
            <Text variant="caption" weight="semibold" color="primaryInk">
              {s.highlightEyebrow}
            </Text>
            <Text variant="sectionTitle">{s.highlightTitle}</Text>
          </Card>
          <ProgressBar value={1 / 3} accessibilityLabel={s.goal} />
          <ProgressBar value={1} accessibilityLabel={s.goalDone} />
        </Section>

        <Section title={s.score}>
          <View style={styles.rings}>
            <ScoreRing score={84} />
            <ScoreRing score={62} />
            <ScoreRing score={38} />
          </View>
          <ScoreRing score={72} size="lg" />
        </Section>

        <Section title={s.feedback}>
          <Button label={s.showToastSuccess} variant="secondary" onPress={() => toast.show(s.toastSuccess)} />
          <Button label={s.showToastError} variant="secondary" onPress={() => toast.show(s.toastError, 'error')} />
          <Button label={s.openSheet} variant="secondary" onPress={() => setSheet(true)} />
          <EmptyState icon={Bookmark} title={s.emptyTitle} actionLabel={s.emptyAction} onAction={() => {}} actionVariant="secondary" />
        </Section>

        <Section title={s.skeleton}>
          <SkeletonCard />
        </Section>
      </Screen>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title={s.sheetTitle} description={s.sheetText}>
        <Button label={t.common.continue} onPress={() => setSheet(false)} />
        <Button label={s.sheetLeave} variant="text" onPress={() => setSheet(false)} />
      </BottomSheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <View style={styles.section}>
        <Text variant="sectionTitle" accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  row: { flexDirection: 'row', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rings: { flexDirection: 'row', justifyContent: 'space-around' },
});
