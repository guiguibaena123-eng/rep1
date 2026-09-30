import { router } from 'expo-router';
import { CalendarDays, ChevronRight, Clock, Lock, MessageCircle } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Chip, EmptyState, Screen, SkeletonCard, Text, useToast } from '@/components';
import { useCompletedSessions, useInterviewUsage, useStartInterview } from '@/features/interview/api';
import {
  DEFAULT_QUESTION_COUNT,
  LEVELS,
  MINUTES_PER_QUESTION,
  QUESTION_COUNTS,
  levelFromGoal,
  type Level,
  type QuestionCount,
} from '@/features/interview/types';
import { openPremium } from '@/features/plan/navigation';
import { useProfile } from '@/features/profile/api';
import { AREAS, isPremium, type Area } from '@/features/profile/types';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { shortDate } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, space } from '@/theme/tokens';

const tr = t.train;

/** Grátis vê as 3 últimas no histórico; Premium vê mais. */
const RECENT_FREE = 3;
const RECENT_PREMIUM = 10;

/**
 * T6 Nova simulação: área (vem do perfil), nível (sugerido pelo objetivo) e nº de perguntas.
 * O contador do plano grátis vem do servidor; o limite também é conferido lá ao começar.
 */
export default function TrainTab() {
  const { colors } = useTheme();
  const toast = useToast();
  const profile = useProfile().data;
  const usage = useInterviewUsage();
  const completed = useCompletedSessions();
  const start = useStartInterview();

  // null = ainda não mexeu: usa o que vem do perfil.
  const [pickedArea, setArea] = useState<Area | null>(null);
  const [pickedLevel, setLevel] = useState<Level | null>(null);
  const [count, setCount] = useState<QuestionCount>(DEFAULT_QUESTION_COUNT);
  const [limitOpen, setLimitOpen] = useState(false);

  const area = pickedArea ?? profile?.area ?? 'atendimento';
  const level = pickedLevel ?? levelFromGoal(profile?.goal);
  const premium = usage.data?.premium ?? isPremium(profile);
  const freeUsed = !premium && !!usage.data && usage.data.used >= usage.data.limit;
  const recent = (completed.data ?? []).slice(0, premium ? RECENT_PREMIUM : RECENT_FREE);

  const onStart = () => {
    if (freeUsed) {
      setLimitOpen(true);
      return;
    }
    start.mutate(
      { area, level, num_questions: count },
      {
        onSuccess: ({ session_id }) => router.push(`/simulacao/${session_id}`),
        onError: (err) => {
          if (err instanceof ApiError && err.code === 'LIMIT_REACHED' && err.extra.reason === 'weekly') {
            setLimitOpen(true);
          } else if (err instanceof ApiError && err.code === 'LLM_FAILED') {
            toast.show(tr.startError, 'error');
          } else {
            toast.show(err instanceof ApiError ? err.message : t.errors.INTERNAL, 'error');
          }
        },
      },
    );
  };

  const refreshing = (usage.isRefetching || completed.isRefetching) && !start.isPending;
  const refresh = () => {
    usage.refetch();
    completed.refetch();
  };

  return (
    <Screen brand gap={28} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <Text variant="brandTitle" accessibilityRole="header">
        {tr.title}
      </Text>

      <Section title={tr.areaTitle} id="t6-area">
        <View accessibilityRole="radiogroup" accessibilityLabelledBy="t6-area" style={styles.wrap}>
          {AREAS.map((a) => (
            <Chip key={a} label={t.options.area[a]} selected={a === area} onPress={() => setArea(a)} height={44} />
          ))}
        </View>
      </Section>

      <Section title={tr.levelTitle} id="t6-level">
        <View accessibilityRole="radiogroup" accessibilityLabelledBy="t6-level" style={styles.wrap}>
          {LEVELS.map((l) => (
            <Chip key={l} label={t.levels[l]} selected={l === level} onPress={() => setLevel(l)} height={44} />
          ))}
        </View>
      </Section>

      <Section title={tr.countTitle} id="t6-count">
        <View accessibilityRole="radiogroup" accessibilityLabelledBy="t6-count" style={styles.row}>
          {QUESTION_COUNTS.map((n) => (
            <Chip key={n} label={String(n)} selected={n === count} onPress={() => setCount(n)} height={48} style={styles.flex} />
          ))}
        </View>
      </Section>

      <View style={styles.gap12}>
        <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Clock size={20} color={colors.primary} strokeWidth={iconStroke} style={{ marginTop: 1 }} />
          <Text variant="bodySmall" color="textSecondary" style={styles.flex}>
            {tr.duration(count * MINUTES_PER_QUESTION)}
          </Text>
        </View>

        {!premium && usage.data && !freeUsed && (
          <Text variant="bodySmall" color="textSecondary" align="center">
            {tr.freeLeftPrefix}
            <Text variant="bodySmall" weight="semibold">
              {tr.freeLeftBold}
            </Text>
            {tr.freeLeftSuffix}
          </Text>
        )}
        {freeUsed && (
          <View style={styles.usedRow}>
            <Text variant="bodySmall" color="textSecondary">
              {tr.freeUsed}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Lock size={12} color={colors.onWarning} strokeWidth={2.25} />
              <Text variant="caption" weight="semibold" style={{ color: colors.onWarning }}>
                {t.common.premium}
              </Text>
            </View>
          </View>
        )}

        <Button label={tr.start} onPress={onStart} loading={start.isPending} />
      </View>

      <Section title={tr.recent}>
        {completed.isPending ? (
          <SkeletonCard lines={2} />
        ) : completed.isError ? (
          <Text variant="bodySmall" color="textSecondary">
            {tr.loadError}
          </Text>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={tr.recentEmptyTitle}
            text={tr.recentEmptyText(DEFAULT_QUESTION_COUNT * MINUTES_PER_QUESTION)}
            actionLabel={tr.recentEmptyAction}
            onAction={onStart}
          />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {recent.map((s, i) => {
              const date = shortDate(s.completed_at ?? s.created_at);
              const score = s.overall_score ?? 0;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/simulacao/${s.id}/resultado`)}
                  accessibilityRole="button"
                  accessibilityLabel={tr.recentA11y(t.options.area[s.area], date, score)}
                  style={({ pressed }) => [
                    styles.item,
                    i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.flex}>
                    <Text weight="semibold">{t.options.area[s.area]}</Text>
                    <Text variant="bodySmall" color="textSecondary">
                      {`${date} · ${t.levels[s.level]}`}
                    </Text>
                  </View>
                  <Text style={styles.score}>{score}</Text>
                  <ChevronRight size={18} color={colors.textSecondary} strokeWidth={iconStroke} />
                </Pressable>
              );
            })}
          </View>
        )}
      </Section>

      <BottomSheet
        visible={limitOpen}
        onClose={() => setLimitOpen(false)}
        icon={
          <View style={[styles.limitIcon, { backgroundColor: colors.warningSoft }]}>
            <CalendarDays size={26} color={colors.streakIcon} strokeWidth={iconStroke} />
          </View>
        }
        title={tr.limitTitle}
        description={tr.limitText}
      >
        <Button
          label={tr.limitPremium}
          onPress={() => {
            setLimitOpen(false);
            openPremium('treinar');
          }}
        />
        <Button label={tr.limitBack} variant="text" onPress={() => setLimitOpen(false)} />
      </BottomSheet>
    </Screen>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <View style={styles.gap12}>
      <Text variant="sectionTitle" nativeID={id} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  row: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
  gap12: { gap: space[3] },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  usedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, paddingHorizontal: 10, borderRadius: radius.chip },
  list: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: 14, paddingHorizontal: space[4], minHeight: 48 },
  score: { fontFamily: fonts.heading700, fontSize: 18, lineHeight: 24 },
  limitIcon: { width: 56, height: 56, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
});
