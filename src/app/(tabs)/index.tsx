import { router, useIsFocused } from 'expo-router';
import { BookOpen, Check, ChevronRight, FileUser, Flame, MessageCircle, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { BottomSheet, Button, Card, Screen, Skeleton, SkeletonCard, Text, useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { pickGreeting } from '@/features/home/greeting';
import {
  useAbandonSession,
  useCompletedSessions,
  useInterviewUsage,
  useLastNextStep,
  usePendingSession,
  type PendingSession,
} from '@/features/interview/api';
import { useDrafts } from '@/features/interview/draft';
import { DEFAULT_QUESTION_COUNT, MINUTES_PER_QUESTION, levelFromGoal } from '@/features/interview/types';
import { useLinkedInReports } from '@/features/linkedin/api';
import { NotificationBell } from '@/features/notifications/components';
import { useReminderBadge, useTodayReminders } from '@/features/notifications/reminders';
import { openPremium } from '@/features/plan/navigation';
import { usePreferences } from '@/features/preferences/store';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { AchievementModal } from '@/features/progress/Achievement';
import { useActivityDates } from '@/features/progress/api';
import {
  STREAK_MILESTONES,
  computeStreak,
  reachedMilestone,
  resetsTomorrow,
  scoreTrend,
  type Streak,
  type StreakMilestone,
  type Trend,
} from '@/features/progress/logic';
import { ScoreChart } from '@/features/progress/ScoreChart';
import { useTipsCatalog } from '@/features/tips/api';
import { HomeTipsSection } from '@/features/tips/HomeTipsSection';
import { tipOfTheDay } from '@/features/tips/logic';
import type { Tip } from '@/features/tips/types';
import { t } from '@/i18n';
import { dateSP, weekDatesSP } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { brandSurface, iconStroke, motion, radius, space } from '@/theme/tokens';

const h = t.home;
const TODAY_MINUTES = DEFAULT_QUESTION_COUNT * MINUTES_PER_QUESTION;

/**
 * T5 Início: saudação, UMA ação principal (simulação pela metade, treino de hoje ou, no grátis sem
 * simulação na semana, a dica do dia), Dicas para você (trilha + carrossel), Sua semana (sequência +
 * meta) e evolução das notas.
 */
export default function HomeTab() {
  const { colors } = useTheme();
  const focused = useIsFocused();
  const userId = useAuth().session?.user.id;
  const profile = useProfile();
  const pending = usePendingSession();
  const activity = useActivityDates();
  const completed = useCompletedSessions();
  const tips = useTipsCatalog();
  const usage = useInterviewUsage();
  const lastStep = useLastNextStep();
  const linkedin = useLinkedInReports();
  const nextStep = lastStep.data ?? null;
  // Sorteada uma vez por abertura da tela: o texto não troca sozinho a cada atualização.
  const [greetingKey] = useState(() => pickGreeting(new Date().getHours(), Math.random()));
  const reminders = useTodayReminders();
  const { unseen: unseenReminders } = useReminderBadge(reminders);

  const p = profile.data;
  const linkedinNew = linkedin.data?.length === 0;
  const area = p?.area ?? 'atendimento';
  const level = levelFromGoal(p?.goal);
  const open = pending.data;
  const premium = usage.data?.premium ?? isPremium(p);
  // Grátis que já usou a simulação da semana: a Início oferece a dica em vez de "Começar simulação".
  const freeUsed = !premium && !!usage.data && usage.data.used >= usage.data.limit;

  // "Agora" = hora da última leitura dos dias ativos (atualiza ao puxar ou ao voltar para o app).
  // null até a primeira resposta: antes disso dataUpdatedAt é 0 (1970) e a dica do dia trocaria na tela.
  const updatedAt = activity.dataUpdatedAt || activity.errorUpdatedAt;
  const now = updatedAt ? new Date(updatedAt) : null;
  const streak = activity.data && now ? computeStreak(activity.data, now) : null;
  const sessions = completed.data;
  const trend = sessions ? scoreTrend(sessions.flatMap((s) => (s.overall_score == null ? [] : [s.overall_score]))) : null;
  const isNew = sessions?.length === 0;
  const tip = tips.data && now ? tipOfTheDay(tips.data.tips, premium, now) : null;

  // Conquista de sequência (3 ou 7 dias): uma vez por sequência, só com a Início na tela.
  const celebrated = usePreferences((s) => s.celebratedStreaks);
  const markCelebrated = usePreferences((s) => s.markCelebratedStreaks);
  const milestone = streak ? reachedMilestone(streak.current) : null;
  const keyOf = (m: StreakMilestone) => `${userId}:${m}:${streak?.start}`;
  const toCelebrate = focused && userId && milestone && !celebrated.includes(keyOf(milestone)) ? milestone : null;
  const closeAchievement = () => {
    if (milestone) markCelebrated(STREAK_MILESTONES.filter((m) => m <= milestone).map(keyOf));
  };

  // Cartão principal: espera perfil, pendente, uso e histórico para não mostrar a área padrão
  // ou o texto errado e trocar na frente da pessoa (a CTA pulava de lugar).
  const actionLoading = profile.isPending || pending.isPending || usage.isPending || completed.isPending;
  const actionFailed = (profile.isError && !p) || pending.isError || usage.isError;
  const loading = activity.isPending || completed.isPending;
  const failed = activity.isError || completed.isError;
  const refreshing =
    profile.isRefetching ||
    pending.isRefetching ||
    activity.isRefetching ||
    completed.isRefetching ||
    usage.isRefetching;
  const refresh = () => {
    profile.refetch();
    pending.refetch();
    activity.refetch();
    completed.refetch();
    tips.refetch();
    usage.refetch();
    lastStep.refetch();
    linkedin.refetch();
  };

  return (
    <Screen brand brandRight={<NotificationBell extra={unseenReminders} />} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <View style={styles.hello}>
        {/* Sem o perfil ainda: bloco pulsando em vez de "Oi! 👋" sem nome que depois troca. */}
        {profile.isPending ? (
          <Skeleton width="62%" height={38} radius={radius.button} />
        ) : (
          <Text variant="brandDisplay" accessibilityRole="header">
            {h.greetings[greetingKey](p?.name)}
          </Text>
        )}
        <Text color="textSecondary">{h.subtitle}</Text>
      </View>

      {/*
        Simulação pela metade = a ação principal da tela (cartão em destaque, botão primário).
        O "Treino de hoje" sai da frente: começar outra gastaria a simulação grátis da semana.
      */}
      {actionLoading ? (
        <SkeletonCard lines={3} />
      ) : actionFailed ? (
        <Card style={styles.gap12}>
          <Text color="textSecondary">{h.actionError}</Text>
          <Button label={t.common.tryAgain} variant="secondary" compact onPress={refresh} loading={refreshing} />
        </Card>
      ) : open ? (
        <PendingCard pending={open} premium={premium} />
      ) : freeUsed && usage.data ? (
        <FreeUsedCard tomorrow={now ? resetsTomorrow(usage.data.resets_at, now) : false} tip={tip} />
      ) : (
        <Card variant="brand" style={styles.action}>
          <BrandHead icon={MessageCircle} label={h.todayEyebrow} />
          <View style={styles.actionText}>
            <Text variant="display" accessibilityRole="header" style={styles.onBrand}>
              {`${t.options.area[area]} · ${t.levels[level]}`}
            </Text>
            {/* O "próximo passo" do último feedback deixa o treino de hoje com a cara da pessoa (T5). */}
            {!isNew && !!nextStep && (
              <Text variant="bodySmall" weight="medium" style={styles.onBrand}>
                {h.todayNext(nextStep)}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.onBrandSoft}>
              {isNew ? h.todayFirst(DEFAULT_QUESTION_COUNT, TODAY_MINUTES) : h.todayHint(DEFAULT_QUESTION_COUNT, TODAY_MINUTES)}
            </Text>
          </View>
          <Button label={h.start} variant="onBrand" onPress={() => router.navigate('/treinar')} />
        </Card>
      )}

      <HomeTipsSection premium={premium} profile={p} />

      {failed ? (
        <Card style={styles.gap12}>
          <Text color="textSecondary">{h.progressError}</Text>
          <Button label={t.common.tryAgain} variant="secondary" compact onPress={refresh} loading={refreshing} />
        </Card>
      ) : loading || !streak || !now ? (
        <SkeletonCard lines={4} />
      ) : (
        <WeekCard streak={streak} activeDays={activity.data ?? []} now={now} tipOnly={freeUsed} />
      )}

      {/* O gráfico só aparece quando já dá para comparar (2 notas ou mais). */}
      {!failed && trend && trend.points.length >= 2 && <EvolutionCard trend={trend} />}

      {linkedinNew && (
      <Pressable
        onPress={() => router.navigate('/linkedin')}
        accessibilityRole="button"
        accessibilityLabel={`${h.linkedin}, ${h.newBadge}`}
        style={({ pressed }) => [
          styles.link,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        <FileUser size={22} color={colors.text} strokeWidth={iconStroke} />
        <Text weight="semibold" style={{ flex: 1 }}>
          {h.linkedin}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
          <Text variant="caption" weight="semibold" color="primaryInk">
            {h.newBadge}
          </Text>
        </View>
      </Pressable>
      )}

      <AchievementModal kind={toCelebrate} onClose={closeAchievement} />
    </Screen>
  );
}

/** Topo do cartão de ação: ícone do pilar num círculo claro + de que se trata (Treino de hoje, Continue…). */
function BrandHead({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <View style={styles.brandHead}>
      <View style={styles.brandIcon}>
        <Icon size={20} color={brandSurface.ink} strokeWidth={iconStroke} />
      </View>
      <Text variant="bodySmall" weight="semibold" style={styles.onBrandSoft}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Grátis que já usou a simulação da semana: no lugar de "Começar simulação" (que só levaria ao aviso
 * de limite), diz quando ela volta e oferece a dica do dia, que também conta para a sequência e a meta.
 */
function FreeUsedCard({ tomorrow, tip }: { tomorrow: boolean; tip: Tip | null }) {
  return (
    <Card variant="brand" style={styles.action}>
      <BrandHead icon={BookOpen} label={h.todayEyebrow} />
      <View style={styles.actionText}>
        <Text variant="display" accessibilityRole="header" style={styles.onBrand}>
          {h.usedTitle(tomorrow)}
        </Text>
        <Text variant="bodySmall" style={styles.onBrandSoft}>
          {tip ? h.usedTextTip(tip.title, tip.read_minutes) : h.usedText}
        </Text>
      </View>
      <View style={{ gap: space[1] }}>
        <Button
          label={tip ? h.readTip : h.seeTips}
          variant="onBrand"
          onPress={() => (tip ? router.push(`/dica/${tip.id}`) : router.navigate('/dicas'))}
        />
        <Button label={h.usedPremium} variant="onBrandText" onPress={() => openPremium('inicio')} />
      </View>
    </Card>
  );
}

/**
 * Simulação pela metade: continuar (ação principal) ou descartar, com confirmação.
 * Descartar marca a sessão como abandonada (mesma regra do "Sair sem salvar": o uso da semana não volta).
 */
function PendingCard({ pending, premium }: { pending: PendingSession; premium: boolean }) {
  const toast = useToast();
  const abandon = useAbandonSession();
  const clearDraft = useDrafts((st) => st.clear);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { session, answersSaved } = pending;
  const resume = () => router.push(answersSaved ? `/simulacao/${session.id}/gerando` : `/simulacao/${session.id}`);

  const discard = () =>
    abandon.mutate(session.id, {
      // Fecha o sheet antes do aviso: no iOS o toast fica atrás do Modal.
      onSuccess: () => {
        clearDraft(session.id);
        setConfirmOpen(false);
        toast.show(h.discarded);
      },
      onError: () => {
        setConfirmOpen(false);
        toast.show(h.discardError, 'error');
      },
    });

  return (
    <Card variant="brand" style={styles.action}>
      <BrandHead icon={MessageCircle} label={h.pendingEyebrow} />
      <View style={styles.actionText}>
        <Text variant="display" accessibilityRole="header" style={styles.onBrand}>
          {`${t.options.area[session.area]} · ${t.levels[session.level]}`}
        </Text>
        <Text variant="bodySmall" style={styles.onBrandSoft}>
          {answersSaved ? h.pendingAnswers : h.pendingDraft}
        </Text>
      </View>
      <View style={{ gap: space[1] }}>
        <Button label={answersSaved ? h.finishFeedback : h.continueSim} variant="onBrand" onPress={resume} />
        <Button label={h.discard} variant="onBrandText" onPress={() => setConfirmOpen(true)} />
      </View>

      <BottomSheet
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={h.discardTitle}
        description={premium ? h.discardText : h.discardTextFree}
      >
        <Button label={h.discardKeep} onPress={() => setConfirmOpen(false)} />
        <Button label={h.discardConfirm} variant="text" onPress={discard} loading={abandon.isPending} />
      </BottomSheet>
    </Card>
  );
}

/**
 * Sua semana: sequência de dias e bolinhas de segunda a domingo (as com atividade ficam âmbar com ✓).
 * O cartão inteiro abre o Meu treino (calendário e meta da semana).
 */
function WeekCard({
  streak,
  activeDays,
  now,
  tipOnly,
}: {
  streak: Streak;
  activeDays: string[];
  now: Date;
  /** Simulação grátis da semana já usada: só sugere a dica. */
  tipOnly: boolean;
}) {
  const { colors } = useTheme();
  const today = dateSP(now);
  const active = new Set(activeDays);

  const title = streak.current === 0 ? h.streakNewTitle : h.streakTitle(streak.current);
  const subtitle = streak.activeToday
    ? h.streakDoneToday
    : streak.current === 0
      ? tipOnly
        ? h.streakNewTextTip
        : h.streakNewText
      : tipOnly
        ? h.streakKeepTip(streak.current + 1)
        : h.streakKeep(streak.current + 1);

  const days = weekDatesSP(now);
  // Leitor de tela: a semana inteira numa frase só, em vez de 7 paradas.
  const weekA11y = `${h.weekA11y}: ${days.map((day, i) => h.dayA11y(h.weekNames[i], active.has(day), day === today)).join('; ')}`;

  return (
    <Card
      style={styles.gap16}
      onPress={() => router.push('/calendario')}
      accessibilityLabel={`${h.streakA11y}. ${title}. ${subtitle}. ${weekA11y}. ${t.calendar.link}`}
    >
      <View style={styles.streakHead}>
        <View style={[styles.streakIcon, { backgroundColor: colors.warningSoft }]}>
          <Flame size={22} color={colors.streakIcon} strokeWidth={iconStroke} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="sectionTitle">{title}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
      </View>
      <View style={styles.week}>
        {days.map((day, i) => {
          const done = active.has(day);
          const isToday = day === today;
          return (
            <View key={day} style={styles.day}>
              <Animated.View
                entering={ZoomIn.delay(i * motion.stagger).duration(motion.slow).reduceMotion(ReduceMotion.System)}
                style={[
                  styles.dot,
                  done
                    ? { backgroundColor: colors.warning }
                    : {
                        borderWidth: 2,
                        borderColor: isToday ? colors.primary : colors.border,
                        borderStyle: isToday ? 'dashed' : 'solid',
                      },
                ]}
              >
                {done && <Check size={14} color={colors.onWarning} strokeWidth={2.5} />}
              </Animated.View>
              <Text variant="caption" style={{ color: isToday ? colors.text : colors.textSecondary }}>
                {h.weekLetters[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

/** Gráfico das últimas notas (só com 2 ou mais). Tocar leva ao Perfil (Meu progresso). */
function EvolutionCard({ trend }: { trend: Trend }) {
  const { colors } = useTheme();
  const { points, sinceFirst } = trend;
  const openProgress = () => router.navigate('/perfil');

  const spoken = `${points.slice(0, -1).join(', ')} ${h.and} ${points[points.length - 1]}`;
  return (
    <Card style={styles.gap12} onPress={openProgress} accessibilityLabel={h.evolutionA11y(spoken)}>
      <View style={styles.goalHead}>
        <Text variant="sectionTitle">{h.evolutionTitle}</Text>
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
      </View>
      <ScoreChart points={points} />
      {/* Só mostramos quando a nota subiu: comparação negativa desanima (tom do app). */}
      {sinceFirst !== null && sinceFirst > 0 && (
        <View style={styles.trendRow}>
          <TrendingUp size={18} color={colors.successInk} strokeWidth={2} />
          <Text variant="bodySmall" weight="semibold" style={{ color: colors.successInk }}>
            {h.sinceFirst(sinceFirst)}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  hello: { gap: 6, paddingBottom: space[2] },
  gap12: { gap: space[3] },
  gap16: { gap: space[4] },
  action: { gap: space[5], padding: space[5] },
  actionText: { gap: space[2] },
  brandHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.chip,
    backgroundColor: brandSurface.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onBrand: { color: brandSurface.ink },
  onBrandSoft: { color: brandSurface.inkSoft },
  streakHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  streakIcon: { width: 40, height: 40, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', gap: space[1] },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  dot: { width: 28, height: 28, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[2] },
  shrink: { flexShrink: 1 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.chip },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: space[5],
    borderRadius: radius.card,
    borderWidth: 1,
  },
});
