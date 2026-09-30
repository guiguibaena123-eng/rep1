import { router, useIsFocused } from 'expo-router';
import { Check, ChevronRight, FileUser, Flame, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Card, ProgressBar, Screen, Skeleton, SkeletonCard, Text, useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
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
import { openPremium } from '@/features/plan/navigation';
import { usePreferences } from '@/features/preferences/store';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { AchievementModal } from '@/features/progress/Achievement';
import { useActivityDates } from '@/features/progress/api';
import {
  STREAK_MILESTONES,
  computeStreak,
  countThisWeek,
  reachedMilestone,
  resetsTomorrow,
  scoreTrend,
  weeklyGoal,
  type Streak,
  type StreakMilestone,
  type Trend,
  type WeeklyGoal,
} from '@/features/progress/logic';
import { ScoreChart } from '@/features/progress/ScoreChart';
import { useTipProgress, useTipsCatalog } from '@/features/tips/api';
import { HomeTipsSection } from '@/features/tips/HomeTipsSection';
import { tipOfTheDay } from '@/features/tips/logic';
import type { Tip } from '@/features/tips/types';
import { t } from '@/i18n';
import { dateSP, weekDatesSP } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

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
  const tipProgress = useTipProgress();
  const lastStep = useLastNextStep();
  const linkedin = useLinkedInReports();
  const nextStep = lastStep.data ?? null;

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
  // Meta por plano: o grátis conta também as dicas lidas na semana.
  const goal =
    now && sessions && (premium || tipProgress.data)
      ? weeklyGoal(
          premium,
          countThisWeek(sessions.map((s) => s.completed_at), now),
          countThisWeek((tipProgress.data ?? []).map((r) => r.read_at), now),
        )
      : null;
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
  const failed = activity.isError || completed.isError || (!premium && tipProgress.isError);
  const refreshing =
    profile.isRefetching ||
    pending.isRefetching ||
    activity.isRefetching ||
    completed.isRefetching ||
    usage.isRefetching ||
    tipProgress.isRefetching;
  const refresh = () => {
    profile.refetch();
    pending.refetch();
    activity.refetch();
    completed.refetch();
    tips.refetch();
    usage.refetch();
    tipProgress.refetch();
    lastStep.refetch();
    linkedin.refetch();
  };

  return (
    <Screen brand refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <View style={styles.hello}>
        {/* Sem o perfil ainda: bloco pulsando em vez de "Oi! 👋" sem nome que depois troca. */}
        {profile.isPending ? (
          <Skeleton width="62%" height={38} radius={radius.button} />
        ) : (
          <Text variant="brandDisplay" accessibilityRole="header">
            {h.greeting(p?.name)}
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
        <Card variant="highlight" style={styles.gap16}>
          <View style={{ gap: space[1] }}>
            <Text variant="caption" weight="semibold" color="primaryInk" style={styles.eyebrow}>
              {h.todayEyebrow}
            </Text>
            <Text variant="cardTitle" accessibilityRole="header">{`${t.options.area[area]} · ${t.levels[level]}`}</Text>
            {/* O "próximo passo" do último feedback deixa o treino de hoje com a cara da pessoa (T5). */}
            {!isNew && nextStep && <Text variant="bodySmall">{h.todayNext(nextStep)}</Text>}
            <Text variant="bodySmall" color="textOnSoft">
              {isNew ? h.todayFirst(DEFAULT_QUESTION_COUNT, TODAY_MINUTES) : h.todayHint(DEFAULT_QUESTION_COUNT, TODAY_MINUTES)}
            </Text>
          </View>
          <Button label={h.start} onPress={() => router.navigate('/treinar')} />
        </Card>
      )}

      <HomeTipsSection premium={premium} profile={p} />

      {failed ? (
        <Card style={styles.gap12}>
          <Text color="textSecondary">{h.progressError}</Text>
          <Button label={t.common.tryAgain} variant="secondary" compact onPress={refresh} loading={refreshing} />
        </Card>
      ) : loading || !streak || !now || !goal ? (
        <SkeletonCard lines={4} />
      ) : (
        <WeekCard streak={streak} activeDays={activity.data ?? []} now={now} tipOnly={freeUsed} goal={goal} />
      )}

      {/* O gráfico só aparece quando já dá para comparar (2 notas ou mais). */}
      {!failed && trend && trend.points.length >= 2 && <EvolutionCard trend={trend} />}

      <Pressable
        onPress={() => router.navigate('/linkedin')}
        accessibilityRole="button"
        accessibilityLabel={linkedinNew ? `${h.linkedin}, ${h.newBadge}` : h.linkedin}
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
        {/* "Novo" só até a primeira análise do LinkedIn. */}
        {linkedinNew ? (
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <Text variant="caption" weight="semibold" color="primaryInk">
              {h.newBadge}
            </Text>
          </View>
        ) : (
          <ChevronRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
        )}
      </Pressable>

      <AchievementModal kind={toCelebrate} onClose={closeAchievement} />
    </Screen>
  );
}

/**
 * Grátis que já usou a simulação da semana: no lugar de "Começar simulação" (que só levaria ao aviso
 * de limite), diz quando ela volta e oferece a dica do dia, que também conta para a sequência e a meta.
 */
function FreeUsedCard({ tomorrow, tip }: { tomorrow: boolean; tip: Tip | null }) {
  return (
    <Card variant="highlight" style={styles.gap16}>
      <View style={{ gap: space[1] }}>
        <Text variant="caption" weight="semibold" color="primaryInk" style={styles.eyebrow}>
          {h.todayEyebrow}
        </Text>
        <Text variant="cardTitle" accessibilityRole="header">
          {h.usedTitle(tomorrow)}
        </Text>
        <Text variant="bodySmall" color="textOnSoft">
          {tip ? h.usedTextTip(tip.title, tip.read_minutes) : h.usedText}
        </Text>
      </View>
      <View style={{ gap: space[1] }}>
        <Button
          label={tip ? h.readTip : h.seeTips}
          onPress={() => (tip ? router.push(`/dica/${tip.id}`) : router.navigate('/dicas'))}
        />
        <Button label={h.usedPremium} variant="text" onPress={() => openPremium('inicio')} />
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
    <Card variant="highlight" style={styles.gap16}>
      <View style={{ gap: space[1] }}>
        <Text variant="caption" weight="semibold" color="primaryInk" style={styles.eyebrow}>
          {h.pendingEyebrow}
        </Text>
        <Text variant="cardTitle" accessibilityRole="header">{`${t.options.area[session.area]} · ${t.levels[session.level]}`}</Text>
        <Text variant="bodySmall" color="textOnSoft">
          {answersSaved ? h.pendingAnswers : h.pendingDraft}
        </Text>
      </View>
      <View style={{ gap: space[1] }}>
        <Button label={answersSaved ? h.finishFeedback : h.continueSim} onPress={resume} />
        <Button label={h.discard} variant="text" onPress={() => setConfirmOpen(true)} />
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
 * Sua semana: sequência de dias, bolinhas de segunda a domingo (as com atividade ficam âmbar com ✓)
 * e a meta da semana conforme o plano (Premium: 3 simulações; grátis: 1 simulação + 2 dicas lidas).
 * Um cartão só, em vez de dois medidores separados.
 */
function WeekCard({
  streak,
  activeDays,
  now,
  tipOnly,
  goal,
}: {
  streak: Streak;
  activeDays: string[];
  now: Date;
  /** Simulação grátis da semana já usada: só sugere a dica. */
  tipOnly: boolean;
  goal: WeeklyGoal;
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

  const complete = goal.done >= goal.total;
  const count = goal.tips ? h.goalCount(goal.done, goal.total) : h.goalText(goal.done, goal.total);
  const goalA11y = goal.tips ? h.goalFreeA11y(goal.sims.done, goal.tips.done) : `${h.goalTitle}: ${count}`;

  return (
    <Card style={styles.gap16}>
      <View style={styles.streakHead} accessible accessibilityRole="header" accessibilityLabel={`${h.streakA11y}. ${title}. ${subtitle}`}>
        <View style={[styles.streakIcon, { backgroundColor: colors.warningSoft }]}>
          <Flame size={22} color={colors.streakIcon} strokeWidth={iconStroke} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="sectionTitle">{title}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.week} accessible accessibilityLabel={weekA11y}>
        {days.map((day, i) => {
          const done = active.has(day);
          const isToday = day === today;
          return (
            <View key={day} style={styles.day}>
              <View
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
              </View>
              <Text variant="caption" style={{ color: isToday ? colors.text : colors.textSecondary }}>
                {h.weekLetters[i]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Meta da semana: a barra fica menta quando completa. */}
      <View style={[styles.goal, { borderTopColor: colors.border }]}>
        <View style={styles.goalHead}>
          <Text weight="semibold" accessibilityRole="header" style={styles.shrink}>
            {h.goalTitle}
          </Text>
          <Text variant="bodySmall" color={complete ? 'successInk' : 'textSecondary'} style={styles.shrink}>
            {count}
          </Text>
        </View>
        <ProgressBar value={goal.done / goal.total} accessibilityLabel={complete ? h.goalDone : goalA11y} />
        {goal.tips && (
          <Text variant="bodySmall" color="textSecondary" importantForAccessibility="no" accessibilityElementsHidden>
            {h.goalFreeDetail(goal.sims.done, goal.tips.done)}
          </Text>
        )}
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
  eyebrow: { letterSpacing: 0.4 },
  streakHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  streakIcon: { width: 40, height: 40, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', gap: space[1] },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  dot: { width: 28, height: 28, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  goalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[2] },
  shrink: { flexShrink: 1 },
  goal: { gap: space[2], paddingTop: space[4], borderTopWidth: 1 },
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
