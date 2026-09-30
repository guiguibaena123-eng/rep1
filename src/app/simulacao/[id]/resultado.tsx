import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, Copy, Target, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, LoadingScreen, Screen, ScreenHeader, ScoreRing, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCompletedSessions, useInterviewResult, type InterviewResult } from '@/features/interview/api';
import { usePreferences } from '@/features/preferences/store';
import { AchievementModal } from '@/features/progress/Achievement';
import { t } from '@/i18n';
import { crisisUrl } from '@/lib/env';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size, space } from '@/theme/tokens';

const r = t.result;

/** T9 Resultado da simulação. */
export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const result = useInterviewResult(id);

  if (result.isPending) return <LoadingScreen />;
  if (result.isError) {
    return (
      <ErrorScreen
        onRetry={() => result.refetch()}
        retrying={result.isFetching}
        secondaryLabel={r.home}
        onSecondary={() => router.dismissTo('/')}
      />
    );
  }
  return <Result data={result.data} />;
}

function Result({ data }: { data: InterviewResult }) {
  const { colors } = useTheme();
  const toast = useToast();
  const { report, session, answers } = data;
  const userId = useAuth().session?.user.id;
  const completed = useCompletedSessions().data;
  const celebrated = usePreferences((s) => (userId ? s.celebratedFirst.includes(userId) : true));
  const markCelebrated = usePreferences((s) => s.markCelebratedFirst);

  const [openImprove, setOpenImprove] = useState(0);
  const [openAnswer, setOpenAnswer] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  // "+N desde a última": compara com a simulação concluída logo antes desta.
  const position = completed?.findIndex((s) => s.id === session.id) ?? -1;
  const previous = position >= 0 ? completed?.[position + 1] : undefined;
  const delta = previous?.overall_score != null ? report.overall_score - previous.overall_score : null;

  // Conquista: esta é a única simulação concluída e ainda não comemoramos.
  const isFirst = !!completed && completed.length === 1 && completed[0].id === session.id;
  const showAchievement = isFirst && !celebrated;

  const copy = async (questionId: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(questionId);
    toast.show(t.common.copied);
  };

  return (
    <>
      <ScreenHeader leading="close" title={r.title} onLeadingPress={() => router.dismissTo('/')} />
      <Screen
        withHeader
        gap={space[6]}
        footer={
          <>
            <Button label={r.again} onPress={() => router.dismissTo('/treinar')} />
            <Button label={r.home} variant="text" onPress={() => router.dismissTo('/')} />
          </>
        }
      >
        <View style={styles.top}>
          <ScoreRing score={report.overall_score} size="lg" showLabel={false} />
          <Text variant="screenTitle" align="center" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 28 }}>
            {report.encouragement}
          </Text>
          {/* Só mostramos quando a nota subiu: comparação negativa desanima (tom do app). */}
          {delta !== null && delta > 0 && (
            <View style={[styles.delta, { backgroundColor: colors.successSoft }]}>
              <TrendingUp size={16} color={colors.successInk} strokeWidth={2} />
              <Text variant="bodySmall" weight="semibold" style={{ color: colors.successInk }}>
                {r.delta(delta)}
              </Text>
            </View>
          )}
          <Text color="textSecondary" align="center">
            {report.summary}
          </Text>
        </View>

        <View style={[styles.box, { backgroundColor: colors.successSoft }]}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.good}
          </Text>
          {report.strengths.map((item, i) => (
            <View key={i} style={styles.bullet}>
              <Check size={22} color={colors.successInk} strokeWidth={2} style={{ marginTop: 1 }} />
              <Text style={styles.flex}>{item}</Text>
            </View>
          ))}
        </View>

        {report.improvements.length > 0 && (
          <View style={[styles.box, { backgroundColor: colors.primarySoft, gap: space[1] }]}>
            <Text variant="sectionTitle" accessibilityRole="header" style={{ marginBottom: space[2] }}>
              {r.improve}
            </Text>
            {report.improvements.map((item, i) => {
              const open = openImprove === i;
              return (
                <View key={i} style={i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Pressable
                    onPress={() => setOpenImprove(open ? -1 : i)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={styles.accordion}
                  >
                    <Text weight="semibold" style={styles.flex}>
                      {item.point}
                    </Text>
                    <Chevron open={open} color={colors.text} />
                  </Pressable>
                  {open && (
                    <View style={styles.accordionBody}>
                      <Text variant="bodySmall">
                        <Text variant="bodySmall" weight="semibold" color="primaryInk">
                          {r.why}
                        </Text>
                        <Text variant="bodySmall" color="textSecondary">
                          {item.why}
                        </Text>
                      </Text>
                      <Text variant="bodySmall">
                        <Text variant="bodySmall" weight="semibold" color="primaryInk">
                          {r.how}
                        </Text>
                        <Text variant="bodySmall" color="textSecondary">
                          {item.how}
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
            {report.filler_words_detected.length > 0 && (
              <Text variant="bodySmall" color="textSecondary" style={{ marginTop: space[2] }}>
                {`${r.fillers}: ${report.filler_words_detected.join(', ')}`}
              </Text>
            )}
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.perAnswer}
          </Text>
          {report.questions.map((q, i) => {
            const review = report.answer_reviews.find((a) => a.question_id === q.id);
            if (!review) return null;
            const open = openAnswer === i;
            return (
              <View key={q.id} style={[styles.answerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  onPress={() => setOpenAnswer(open ? -1 : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={`${r.answerA11y(i + 1, review.score)}. ${q.text}`}
                  style={styles.answerHead}
                >
                  <View style={[styles.num, { backgroundColor: colors.background }]}>
                    <Text variant="caption" weight="semibold" color="textSecondary">
                      {i + 1}
                    </Text>
                  </View>
                  <Text weight="semibold" style={[styles.flex, { fontSize: 15, lineHeight: 21 }]}>
                    {q.text}
                  </Text>
                  <Text style={styles.answerScore}>
                    {review.score}
                    <Text variant="caption" color="textSecondary">
                      /10
                    </Text>
                  </Text>
                  <Chevron open={open} color={colors.text} small />
                </Pressable>
                {open && (
                  <View style={styles.answerBody}>
                    <View style={{ gap: space[1] }}>
                      <Text variant="caption" weight="semibold" color="textSecondary">
                        {r.yourAnswer}
                      </Text>
                      <Text variant="bodySmall" color="textSecondary">
                        {answers[q.id] ?? ''}
                      </Text>
                    </View>
                    <Text variant="bodySmall">{review.comment}</Text>
                    <View style={[styles.suggested, { backgroundColor: colors.primarySoft }]}>
                      <Text variant="caption" weight="semibold" color="primaryInk">
                        {r.suggested}
                      </Text>
                      <Text variant="bodySmall" style={{ lineHeight: 21 }}>
                        {review.suggested_answer}
                      </Text>
                      <Pressable
                        onPress={() => copy(q.id, review.suggested_answer)}
                        accessibilityRole="button"
                        accessibilityLabel={t.common.copy}
                        style={({ pressed }) => [styles.copy, { backgroundColor: colors.surface }, pressed && { opacity: 0.7 }]}
                      >
                        <Copy size={16} color={colors.primaryInk} strokeWidth={iconStroke} />
                        <Text variant="bodySmall" weight="semibold" color="primaryInk">
                          {copied === q.id ? t.common.copied : t.common.copy}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.next, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.nextIcon, { backgroundColor: colors.primarySoft }]}>
            <Target size={20} color={colors.primaryInk} strokeWidth={iconStroke} />
          </View>
          <View style={[styles.flex, { gap: space[1] }]}>
            <Text variant="sectionTitle" accessibilityRole="header">
              {r.nextStep}
            </Text>
            <Text color="textSecondary">{report.next_step}</Text>
          </View>
        </View>

        <View style={{ gap: space[1] }}>
          <Text variant="caption" color="textSecondary" align="center" style={{ lineHeight: 18 }}>
            {t.disclaimer}
          </Text>
          <Pressable onPress={() => Linking.openURL(crisisUrl())} accessibilityRole="link" style={styles.cvv}>
            <Text variant="caption" color="textSecondary" align="center" style={{ textDecorationLine: 'underline' }}>
              {r.cvv}
            </Text>
          </Pressable>
        </View>
      </Screen>

      <AchievementModal kind={showAchievement ? 'first' : null} onClose={() => userId && markCelebrated(userId)} />
    </>
  );
}

function Chevron({ open, color, small }: { open: boolean; color: string; small?: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
      <ChevronDown size={small ? 18 : 20} color={color} strokeWidth={iconStroke} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { alignItems: 'center', gap: 14, paddingTop: space[2] },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: space[3], borderRadius: radius.chip },
  box: { padding: space[5], borderRadius: radius.card, gap: space[3] },
  bullet: { flexDirection: 'row', gap: 10 },
  accordion: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingVertical: space[3] },
  accordionBody: { gap: 10, paddingBottom: 14 },
  answerCard: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  answerHead: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 64, paddingVertical: 14, paddingHorizontal: space[4] },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  answerScore: { fontFamily: fonts.heading700, fontSize: 15, lineHeight: 21 },
  answerBody: { gap: space[3], paddingHorizontal: space[4], paddingBottom: space[4] },
  suggested: { gap: space[2], padding: 14, borderRadius: radius.button },
  copy: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    minWidth: size.minTouch,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  next: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: space[5], borderRadius: radius.card, borderWidth: 1 },
  nextIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cvv: { minHeight: size.minTouch, alignItems: 'center', justifyContent: 'center' },
});
