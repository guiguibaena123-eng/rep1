import { router } from 'expo-router';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Screen, ScreenHeader, SkeletonCard, Text } from '@/components';
import { useCompletedSessions, useInterviewUsage } from '@/features/interview/api';
import { useActivityDates, useSimulationTimes } from '@/features/progress/api';
import {
  dayStatus,
  formatMinutes,
  monthGrid,
  monthOf,
  monthSummary,
  shiftMonth,
  startDayOf,
  timeByDay,
  type DayStatus,
} from '@/features/progress/calendar';
import { computeStreak, countThisWeek, weeklyGoal } from '@/features/progress/logic';
import { WeeklyGoalCard } from '@/features/progress/WeeklyGoalCard';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { useTipProgress } from '@/features/tips/api';
import { t } from '@/i18n';
import { dateSP } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, size, space } from '@/theme/tokens';

const c = t.calendar;
const CELL = 40;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * Meu treino (aberta pela Início): calendário do mês com os dias treinados (✓ âmbar, igual à semana da Início);
 * dias sem treino ficam neutros, sem destaque (calma, sem culpa). Tempo de simulação do mês e sequência. Tocar num dia mostra o detalhe.
 * "Treinou" segue a mesma regra da sequência: simulação, dica lida ou análise do LinkedIn.
 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const profile = useProfile().data;
  const activity = useActivityDates();
  const sims = useSimulationTimes();
  const usage = useInterviewUsage();
  const completed = useCompletedSessions();
  const tipProgress = useTipProgress();

  const now = new Date();
  const today = dateSP(now);
  const [month, setMonth] = useState(() => monthOf(today));
  const [selected, setSelected] = useState<string | null>(null);

  const days = activity.data;
  const active = useMemo(() => new Set(days ?? []), [days]);
  const times = useMemo(() => timeByDay(sims.data ?? []), [sims.data]);
  const startDay = startDayOf(profile?.created_at, days ?? []);
  const streak = days ? computeStreak(days, now) : null;
  const summary = monthSummary(month, today, startDay, active, times);
  // Meta por plano: o grátis conta também as dicas lidas na semana.
  const premium = usage.data?.premium ?? isPremium(profile);
  const goal =
    completed.data && (premium || tipProgress.data)
      ? weeklyGoal(
          premium,
          countThisWeek(completed.data.map((s) => s.completed_at), now),
          countThisWeek((tipProgress.data ?? []).map((r) => r.read_at), now),
        )
      : null;

  const ready = !!days && !!sims.data;
  const thisMonth = monthOf(today);
  const firstMonth = startDay ? monthOf(startDay) : thisMonth;
  const canPrev = month.year * 12 + month.month > firstMonth.year * 12 + firstMonth.month;
  const canNext = month.year * 12 + month.month < thisMonth.year * 12 + thisMonth.month;
  const go = (delta: number) => {
    setMonth((m) => shiftMonth(m, delta));
    setSelected(null);
  };

  const statusText: Record<DayStatus, string> = {
    done: c.stateDone,
    ice: c.stateIce,
    today: c.stateToday,
    future: c.stateNone,
    before: c.stateNone,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={c.title} onLeadingPress={goBack} />
      <Screen withHeader gap={space[4]}>
        {!ready ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={6} />
          </>
        ) : (
          <>
            <View style={styles.summary}>
              <Text variant="cardTitle" accessibilityRole="header">
                {c.summary(summary.done, c.months[month.month])}
              </Text>
              <Text color="textSecondary">
                {[
                  summary.minutes > 0 ? c.summaryTime(formatMinutes(summary.minutes)) : null,
                  streak && streak.longest > 0 ? c.summaryStreak(c.days(streak.current), c.days(streak.longest)) : null,
                ]
                  .filter(Boolean)
                  .join('\n')}
              </Text>
            </View>

            {goal && <WeeklyGoalCard goal={goal} />}

            <Card style={{ gap: space[3] }}>
              <View style={styles.monthHead}>
                <Pressable
                  onPress={() => go(-1)}
                  disabled={!canPrev}
                  accessibilityRole="button"
                  accessibilityLabel={c.prev}
                  accessibilityState={{ disabled: !canPrev }}
                  style={styles.nav}
                >
                  <ChevronLeft size={22} color={canPrev ? colors.text : colors.border} strokeWidth={iconStroke} />
                </Pressable>
                <Text variant="sectionTitle" accessibilityLiveRegion="polite">
                  {`${c.months[month.month]} ${month.year}`}
                </Text>
                <Pressable
                  onPress={() => go(1)}
                  disabled={!canNext}
                  accessibilityRole="button"
                  accessibilityLabel={c.next}
                  accessibilityState={{ disabled: !canNext }}
                  style={styles.nav}
                >
                  <ChevronRight size={22} color={canNext ? colors.text : colors.border} strokeWidth={iconStroke} />
                </Pressable>
              </View>

              <View style={styles.weekRow} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                {t.home.weekLetters.map((letter, i) => (
                  <Text key={i} variant="caption" color="textSecondary" style={styles.weekLetter}>
                    {letter}
                  </Text>
                ))}
              </View>

              {monthGrid(month).map((week, w) => (
                <View key={w} style={styles.weekRow}>
                  {week.map((day, i) => {
                    if (!day) return <View key={i} style={styles.cell} />;
                    const status = dayStatus(day, today, startDay, active);
                    const number = Number(day.slice(8));
                    const on = selected === day;
                    return (
                      <Pressable
                        key={day}
                        onPress={() => setSelected(on ? null : day)}
                        accessibilityRole="button"
                        accessibilityLabel={c.cellA11y(number, statusText[status])}
                        accessibilityState={{ selected: on }}
                        style={styles.cell}
                      >
                        <View
                          style={[
                            styles.day,
                            status === 'done' && { backgroundColor: colors.warning },
                            status === 'today' && { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary },
                            on && { borderWidth: 2, borderStyle: 'solid', borderColor: colors.text },
                          ]}
                        >
                          {status === 'done' ? (
                            <Check size={18} color={colors.onWarning} strokeWidth={2.5} />
                          ) : (
                            <Text
                              variant="bodySmall"
                              weight={status === 'today' ? 'semibold' : undefined}
                              style={{ color: status === 'today' || status === 'ice' ? colors.textSecondary : colors.textDisabled }}
                            >
                              {number}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]}>
                    <Check size={10} color={colors.onWarning} strokeWidth={3} />
                  </View>
                  <Text variant="caption" color="textSecondary">
                    {c.legendDone}
                  </Text>
                </View>
              </View>
            </Card>

            {selected && (
              <DayDetail
                day={selected}
                status={dayStatus(selected, today, startDay, active)}
                time={times[selected]}
              />
            )}

            {!startDay || (days?.length ?? 0) === 0 ? (
              <Text variant="bodySmall" color="textSecondary">
                {c.empty}
              </Text>
            ) : null}
          </>
        )}
      </Screen>
    </View>
  );
}

function DayDetail({ day, status, time }: { day: string; status: DayStatus; time?: { minutes: number; count: number } }) {
  const date = `${Number(day.slice(8))} ${c.months[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  let text: string;
  if (status === 'done') text = time ? `${c.dayDone} ${c.daySims(time.count, formatMinutes(time.minutes))}` : `${c.dayDone} ${c.dayOther}`;
  else if (status === 'ice') text = c.dayIce;
  else if (status === 'today') text = c.dayToday;
  else text = c.dayBefore;

  return (
    <Card style={{ gap: space[1] }}>
      <Text weight="semibold" accessibilityRole="header">
        {date}
      </Text>
      <Text variant="bodySmall" color="textSecondary" accessibilityLiveRegion="polite">
        {text}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { gap: space[1] },
  monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekLetter: { flex: 1, textAlign: 'center' },
  cell: { flex: 1, minHeight: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  day: { width: CELL, height: CELL, borderRadius: CELL / 2, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: space[5], paddingTop: space[2], flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
