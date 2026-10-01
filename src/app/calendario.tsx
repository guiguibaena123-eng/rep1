import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Screen, ScreenHeader, SkeletonCard, Text } from '@/components';
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
import { computeStreak } from '@/features/progress/logic';
import { useProfile } from '@/features/profile/api';
import { t } from '@/i18n';
import { dateSP } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, size, space } from '@/theme/tokens';

const c = t.calendar;
const CELL = 40;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * Meu treino (aberta pela Início): calendário do mês com os dias treinados (marcados) e os dias
 * sem treino (cubo de gelo), tempo de simulação do mês e sequência. Tocar num dia mostra o detalhe.
 * "Treinou" segue a mesma regra da sequência: simulação, dica lida ou análise do LinkedIn.
 */
export default function CalendarScreen() {
  const { colors } = useTheme();
  const profile = useProfile().data;
  const activity = useActivityDates();
  const sims = useSimulationTimes();

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
            <View style={styles.stats}>
              <Stat label={c.trained} value={c.days(summary.done)} />
              <Stat label={c.time} value={formatMinutes(summary.minutes)} />
              <Stat label={c.streak} value={c.days(streak?.current ?? 0)} />
              <Stat label={c.longest} value={c.days(streak?.longest ?? 0)} />
            </View>

            <Card style={{ gap: space[3] }}>
              <View style={styles.monthHead}>
                <Pressable
                  onPress={() => go(-1)}
                  disabled={!canPrev}
                  accessibilityRole="button"
                  accessibilityLabel={c.prev}
                  accessibilityState={{ disabled: !canPrev }}
                  style={[styles.nav, !canPrev && { opacity: 0.3 }]}
                >
                  <ChevronLeft size={22} color={colors.text} strokeWidth={iconStroke} />
                </Pressable>
                <Text variant="sectionTitle" accessibilityRole="header" accessibilityLiveRegion="polite">
                  {`${c.months[month.month]} ${month.year}`}
                </Text>
                <Pressable
                  onPress={() => go(1)}
                  disabled={!canNext}
                  accessibilityRole="button"
                  accessibilityLabel={c.next}
                  accessibilityState={{ disabled: !canNext }}
                  style={[styles.nav, !canNext && { opacity: 0.3 }]}
                >
                  <ChevronRight size={22} color={colors.text} strokeWidth={iconStroke} />
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
                      <View key={day} style={styles.cell}>
                        <Pressable
                          onPress={() => setSelected(on ? null : day)}
                          accessibilityRole="button"
                          accessibilityLabel={c.cellA11y(number, statusText[status])}
                          accessibilityState={{ selected: on }}
                          style={[
                            styles.day,
                            status === 'done' && { backgroundColor: colors.warningSoft },
                            status === 'ice' && { backgroundColor: colors.primarySoft },
                            status === 'today' && { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary },
                            on && { borderWidth: 2, borderStyle: 'solid', borderColor: colors.text },
                          ]}
                        >
                          {status === 'done' ? (
                            <Text style={styles.ice}>🔥</Text>
                          ) : status === 'ice' ? (
                            <Text style={styles.ice}>🧊</Text>
                          ) : (
                            <Text
                              variant="bodySmall"
                              weight={status === 'today' ? 'semibold' : undefined}
                              style={{ color: status === 'today' ? colors.text : colors.textDisabled }}
                            >
                              {number}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ))}

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <Text style={styles.legendIce}>🔥</Text>
                  <Text variant="caption" color="textSecondary">
                    {c.legendDone}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <Text style={styles.legendIce}>🧊</Text>
                  <Text variant="caption" color="textSecondary">
                    {c.legendIce}
                    {summary.ice > 0 ? ` · ${summary.ice}` : ''}
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
            <Text variant="caption" color="textSecondary">
              {c.note}
            </Text>
          </>
        )}
      </Screen>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text variant="sectionTitle">{value}</Text>
    </View>
  );
}

function DayDetail({ day, status, time }: { day: string; status: DayStatus; time?: { minutes: number; count: number } }) {
  const { colors } = useTheme();
  const date = `${Number(day.slice(8))} ${c.months[Number(day.slice(5, 7)) - 1]} ${day.slice(0, 4)}`;
  let text: string;
  if (status === 'done') text = time ? `${c.dayDone} ${c.daySims(time.count, formatMinutes(time.minutes))}` : `${c.dayDone} ${c.dayOther}`;
  else if (status === 'ice') text = c.dayIce;
  else if (status === 'today') text = c.dayToday;
  else text = c.dayBefore;

  return (
    <Card style={{ gap: space[1], backgroundColor: status === 'ice' ? colors.primarySoft : colors.surface }}>
      <Text weight="semibold" accessibilityRole="header">
        {status === 'ice' ? `🧊 ${date}` : date}
      </Text>
      <Text variant="bodySmall" color="textSecondary" accessibilityLiveRegion="polite">
        {text}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  stat: { flexBasis: '47%', flexGrow: 1, gap: 2, padding: space[3], borderWidth: 1, borderRadius: radius.card },
  monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekLetter: { flex: 1, textAlign: 'center' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  day: { width: CELL, height: CELL, borderRadius: CELL / 2, alignItems: 'center', justifyContent: 'center' },
  ice: { fontSize: 20, lineHeight: 26 },
  legend: { flexDirection: 'row', gap: space[5], paddingTop: space[2], flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIce: { fontSize: 14, lineHeight: 18 },
});
