import { router } from 'expo-router';
import { ChevronRight, Lightbulb } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, PremiumBadge, ProgressBar, SkeletonCard, Text } from '@/components';
import { openPremium } from '@/features/plan/navigation';
import type { Profile } from '@/features/profile/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

import { useTipProgress, useTipsCatalog } from './api';
import { homeTips, homeTrack, type HomeTrackCard } from './logic';
import type { Tip } from './types';

const h = t.home;

/**
 * "Dicas para você" na Início (T5), logo abaixo do Treino de hoje:
 * título + "Ver todas", card da trilha (em andamento ou sugerida) e carrossel com 3 dicas.
 * Dica Premium para quem é grátis abre o Premium direto.
 */
export function HomeTipsSection({ premium, profile }: { premium: boolean; profile: Profile | null | undefined }) {
  const catalog = useTipsCatalog();
  const progress = useTipProgress();

  const open = (tip: Tip) => {
    if (tip.is_premium && !premium) openPremium('inicio');
    else router.push(`/dica/${tip.id}`);
  };

  let body;
  if (catalog.isPending || progress.isPending) {
    body = <SkeletonCard lines={3} />;
  } else if (catalog.isError || progress.isError) {
    const retry = () => {
      catalog.refetch();
      progress.refetch();
    };
    body = (
      <Card style={{ gap: space[3] }}>
        <Text color="textSecondary">{t.tips.loadError}</Text>
        <Button
          label={t.common.tryAgain}
          variant="secondary"
          compact
          onPress={retry}
          loading={catalog.isFetching || progress.isFetching}
        />
      </Card>
    );
  } else {
    const rows = progress.data;
    const track = homeTrack(catalog.data.tips, catalog.data.tracks, rows);
    const tips = homeTips(catalog.data.tips, rows, profile, track?.next.id);
    body = (
      <>
        {track && <TrackCard card={track} onPress={() => open(track.next)} />}
        {tips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
          >
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} locked={tip.is_premium && !premium} onPress={() => open(tip)} />
            ))}
          </ScrollView>
        )}
      </>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text variant="cardTitle" accessibilityRole="header" style={styles.shrink}>
          {h.tipsTitle}
        </Text>
        <SeeAll />
      </View>
      {body}
    </View>
  );
}

function SeeAll() {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/dicas')}
      accessibilityRole="link"
      accessibilityLabel={h.tipsSeeAllA11y}
      hitSlop={4}
      style={({ pressed }) => [styles.seeAll, pressed && { opacity: 0.7 }]}
    >
      <Text weight="semibold" style={{ color: colors.primaryInk }}>
        {h.tipsSeeAll}
      </Text>
      <ChevronRight size={16} color={colors.primaryInk} strokeWidth={iconStroke} />
    </Pressable>
  );
}

/** Trilha em andamento (Dia X de Y + barra) ou sugerida ("Entrevista sem medo"). Toque abre a leitura do dia. */
function TrackCard({ card, onPress }: { card: HomeTrackCard; onPress: () => void }) {
  const { colors } = useTheme();
  const { track, next, started } = card;
  const eyebrow = started ? h.trackEyebrow(card.day, card.total) : h.trackStartEyebrow(card.total);
  const reading = started ? h.trackToday(next.title, next.read_minutes) : h.trackFirst(next.title, next.read_minutes);
  const a11y = started ? h.trackA11y(track.title, card.day, card.total, next.title) : h.trackStartA11y(track.title, next.title);

  return (
    <Card onPress={onPress} accessibilityLabel={a11y} style={{ gap: space[3] }}>
      <View style={styles.trackHead}>
        <View style={[styles.trackIcon, { backgroundColor: colors.warningSoft }]}>
          <Lightbulb size={24} color={colors.streakIcon} strokeWidth={iconStroke} />
        </View>
        <View style={styles.trackTitle}>
          <Text variant="caption" weight="semibold" color="textSecondary" style={styles.eyebrow}>
            {eyebrow}
          </Text>
          <Text variant="sectionTitle">{track.title}</Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <ProgressBar value={card.total ? card.read / card.total : 0} accessibilityLabel={eyebrow} />
        <Text variant="bodySmall" color="textSecondary">
          {reading}
        </Text>
      </View>
    </Card>
  );
}

function TipCard({ tip, locked, onPress }: { tip: Tip; locked: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const category = t.tips.category[tip.category];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={h.tipCardA11y(tip.title, category, tip.read_minutes, locked)}
      style={({ pressed }) => [
        styles.tip,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.tipTags}>
        <View style={[styles.category, { backgroundColor: colors.background }]}>
          <Text variant="caption" weight="semibold" color="textSecondary" numberOfLines={1}>
            {category}
          </Text>
        </View>
        {locked && <PremiumBadge />}
      </View>
      <Text weight="semibold" style={styles.tipTitle}>
        {tip.title}
      </Text>
      <Text variant="caption" color="textSecondary">
        {h.tipMinutes(tip.read_minutes)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[3], paddingTop: space[2] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  shrink: { flexShrink: 1 },
  seeAll: { minHeight: size.minTouch, flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: space[2] },
  trackHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trackIcon: { width: 48, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  trackTitle: { flex: 1, gap: 2 },
  eyebrow: { letterSpacing: 0.4 },
  // O carrossel vai até a borda da tela (a Início tem margem lateral de 20).
  carousel: { flexGrow: 0, flexShrink: 0, marginHorizontal: -screenPadding },
  carouselContent: { gap: 10, paddingHorizontal: screenPadding, paddingBottom: 2, alignItems: 'stretch' },
  tip: { width: 200, padding: space[4], borderRadius: radius.card, borderWidth: 1, gap: 10 },
  tipTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  category: { minHeight: 24, paddingHorizontal: 10, borderRadius: radius.chip, justifyContent: 'center', maxWidth: '100%' },
  tipTitle: { flexGrow: 1, minHeight: 66 },
});
