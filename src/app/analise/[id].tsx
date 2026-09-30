import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, Copy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Checkbox, LoadingScreen, PremiumBadge, Screen, ScreenHeader, ScoreRing, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useLinkedInReport, useSaveChecklist } from '@/features/linkedin/api';
import { isFullReport, type FullReport, type LinkedInReportRow, type Priority } from '@/features/linkedin/types';
import { openPremium } from '@/features/plan/navigation';
import { t } from '@/i18n';
import { scoreBand } from '@/lib/score';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, shadowElevated, size, space } from '@/theme/tokens';

const r = t.linkedinReport;
const CHECKLIST_DEBOUNCE_MS = 800;

/** Volta para a T10 (a T11 foi substituída por esta tela). */
function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/linkedin');
}

/** T12 Relatório do LinkedIn. Grátis vê só o resumo (o servidor nem manda o resto). */
export default function LinkedInReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useLinkedInReport(id);

  if (report.isPending) return <LoadingScreen />;
  if (report.isError) {
    return (
      <ErrorScreen
        onRetry={() => report.refetch()}
        retrying={report.isFetching}
        secondaryLabel={t.common.back}
        onSecondary={goBack}
      />
    );
  }
  return <Report row={report.data} />;
}

function Report({ row }: { row: LinkedInReportRow }) {
  const { colors } = useTheme();
  const { report } = row;

  return (
    <>
      <ScreenHeader title={r.title} onLeadingPress={goBack} />
      <Screen withHeader gap={space[6]}>
        <View style={styles.top}>
          <ScoreRing score={report.overall_score} size="lg" showLabel={false} />
          <Text variant="screenTitle" align="center" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 28 }}>
            {r.headline[scoreBand(report.overall_score)]}
          </Text>
          <Text color="textSecondary" align="center">
            {report.summary}
          </Text>
          {row.target_role && (
            <Text variant="caption" color="textSecondary" align="center">
              {r.role(row.target_role)}
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 14 }]}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.priorities}
          </Text>
          {report.priorities.map((p, i) => (
            <View key={i} style={styles.priority}>
              <View style={[styles.num, { backgroundColor: colors.background }]}>
                <Text variant="caption" weight="semibold" color="textSecondary">
                  {i + 1}
                </Text>
              </View>
              <View style={[styles.flex, { gap: 6 }]}>
                <Text weight="semibold">{p.task}</Text>
                <PriorityPill level={p.priority} />
              </View>
            </View>
          ))}
        </View>

        {isFullReport(row) ? <FullDetails row={row} report={row.report} /> : <Locked />}

        <Text variant="caption" color="textSecondary" align="center" style={{ lineHeight: 18 }}>
          {t.disclaimer}
        </Text>
      </Screen>
    </>
  );
}

function PriorityPill({ level }: { level: Priority }) {
  const { colors } = useTheme();
  const palette = {
    alta: { bg: colors.warningSoft, fg: colors.warningInk },
    media: { bg: colors.primarySoft, fg: colors.primaryInk },
    baixa: { bg: colors.background, fg: colors.textSecondary },
  }[level];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text variant="caption" weight="semibold" style={{ color: palette.fg, lineHeight: 18 }}>
        {r.priority[level]}
      </Text>
    </View>
  );
}

/** Plano grátis: prévia apagada das seções + cartão do Premium por cima. */
function Locked() {
  const { colors } = useTheme();
  const names = Object.values(r.sectionName);
  return (
    <View>
      <View style={styles.ghost} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text variant="sectionTitle">{r.sections}</Text>
        {names.map((name) => (
          <View key={name} style={[styles.sectionCard, styles.ghostRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text weight="semibold" style={styles.flex}>
              {name}
            </Text>
            <View style={[styles.ghostBar, { backgroundColor: colors.skeletonSoft }]} />
          </View>
        ))}
      </View>
      <View style={styles.lockedOverlay}>
        <View style={[styles.lockedCard, shadowElevated, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ alignSelf: 'center' }}>
            <PremiumBadge />
          </View>
          <Text variant="sectionTitle" align="center" accessibilityRole="header">
            {r.lockedTitle}
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            {r.lockedText}
          </Text>
          <Button label={r.lockedCta} onPress={() => openPremium('relatorio')} style={{ marginTop: space[1] }} />
        </View>
      </View>
    </View>
  );
}

function FullDetails({ row, report }: { row: LinkedInReportRow; report: FullReport }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [open, setOpen] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(key);
    toast.show(t.common.copied);
  };

  return (
    <>
      <View style={{ gap: 10 }}>
        <Text variant="sectionTitle" accessibilityRole="header" style={{ marginBottom: 2 }}>
          {r.sections}
        </Text>
        {report.sections.map((s, i) => {
          const isOpen = open === i;
          const name = r.sectionName[s.key];
          const copyText = s.after ?? s.suggestions[0] ?? null;
          return (
            <View key={s.key} style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                onPress={() => setOpen(isOpen ? -1 : i)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={r.sectionA11y(name, s.score)}
                style={styles.sectionHead}
              >
                <Text weight="semibold" style={styles.flex}>
                  {name}
                </Text>
                {s.score !== null && (
                  <Text style={styles.sectionScore}>
                    {s.score}
                    <Text variant="caption" color="textSecondary">
                      /10
                    </Text>
                  </Text>
                )}
                <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={18} color={colors.text} strokeWidth={iconStroke} />
                </View>
              </Pressable>
              {isOpen && (
                <View style={styles.sectionBody}>
                  <Text variant="bodySmall">
                    <Text variant="bodySmall" weight="semibold">
                      {r.diagnosis}
                    </Text>
                    <Text variant="bodySmall" color="textSecondary">
                      {s.diagnosis}
                    </Text>
                  </Text>
                  {s.suggestions.map((sug, k) => (
                    <Text key={k} variant="bodySmall">
                      <Text variant="bodySmall" weight="semibold">
                        {r.suggestion}
                      </Text>
                      <Text variant="bodySmall" color="textSecondary">
                        {sug}
                      </Text>
                    </Text>
                  ))}
                  {(s.before || s.after) && (
                    <View style={{ gap: space[2] }}>
                      <Text variant="caption" weight="semibold" color="textSecondary">
                        {r.beforeAfter}
                      </Text>
                      {s.before && (
                        <View style={[styles.quote, { backgroundColor: colors.background }]}>
                          <Text variant="bodySmall" color="textSecondary">
                            <Text variant="bodySmall" weight="semibold">
                              {r.before}
                            </Text>
                            {s.before}
                          </Text>
                        </View>
                      )}
                      {s.after && (
                        <View style={[styles.quote, { backgroundColor: colors.primarySoft }]}>
                          <Text variant="bodySmall">
                            <Text variant="bodySmall" weight="semibold" color="primaryInk">
                              {r.after}
                            </Text>
                            {s.after}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {copyText && (
                    <CopyButton
                      label={copied === `s${i}` ? t.common.copied : r.copySuggestion}
                      onPress={() => copy(`s${i}`, copyText)}
                    />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {report.headline_options.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: space[3] }]}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.titles}
          </Text>
          {report.headline_options.map((title, k) => {
            const done = copied === `t${k}`;
            return (
              <View key={k} style={[styles.titleRow, { backgroundColor: colors.background }]}>
                <Text variant="bodySmall" style={styles.flex}>
                  {title}
                </Text>
                <Pressable
                  onPress={() => copy(`t${k}`, title)}
                  accessibilityRole="button"
                  accessibilityLabel={done ? t.common.copied : r.copyTitle}
                  style={styles.iconButton}
                >
                  {done ? (
                    <Check size={20} color={colors.primaryInk} strokeWidth={2} />
                  ) : (
                    <Copy size={20} color={colors.primaryInk} strokeWidth={iconStroke} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {report.about_suggestion && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: space[3] }]}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.about}
          </Text>
          <View style={[styles.quote, { backgroundColor: colors.primarySoft }]}>
            <Text variant="bodySmall" style={{ lineHeight: 21 }}>
              {report.about_suggestion}
            </Text>
          </View>
          <CopyButton
            label={copied === 'about' ? t.common.copied : r.copySuggestion}
            onPress={() => copy('about', report.about_suggestion ?? '')}
          />
        </View>
      )}

      {report.keywords.length > 0 && (
        <View style={{ gap: space[3] }}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {r.keywords}
          </Text>
          <View style={styles.keywords}>
            {report.keywords.map((k) => (
              <View key={k} style={[styles.keyword, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="bodySmall" weight="medium">
                  {k}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {report.checklist.length > 0 && <Checklist row={row} items={report.checklist} />}
    </>
  );
}

function CopyButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.copy, { backgroundColor: colors.primarySoft }, pressed && { opacity: 0.7 }]}
    >
      <Copy size={16} color={colors.primaryInk} strokeWidth={iconStroke} />
      <Text variant="bodySmall" weight="semibold" color="primaryInk">
        {label}
      </Text>
    </Pressable>
  );
}

/** Checklist final: cada toque atualiza na hora e grava no banco 800ms depois do último toque. */
function Checklist({ row, items }: { row: LinkedInReportRow; items: FullReport['checklist'] }) {
  const { colors } = useTheme();
  const toast = useToast();
  const save = useSaveChecklist(row.id);
  const [state, setState] = useState<Record<string, boolean>>(row.checklist_state ?? {});
  const pending = useRef<Record<string, boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // save.mutate é estável (TanStack Query): dá para chamar mesmo depois de sair da tela.
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = pending.current;
    pending.current = null;
    if (next) save.mutate(next, { onError: () => toast.show(r.checklistError, 'error') });
  };

  // Saiu da tela antes dos 800ms: grava na hora para não perder o último toque.
  useEffect(
    () => () => flush(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toggle = (id: string, checked: boolean) => {
    const next = { ...state, [id]: checked };
    setState(next);
    pending.current = next;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, CHECKLIST_DEBOUNCE_MS);
  };

  const done = items.filter((c) => state[c.id]).length;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: space[1] }]}>
      <View style={styles.checkHead}>
        <Text variant="sectionTitle" accessibilityRole="header">
          {r.checklist}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {r.checklistCount(done, items.length)}
        </Text>
      </View>
      {items.map((c) => {
        const checked = !!state[c.id];
        return (
          <Checkbox key={c.id} checked={checked} onChange={(v) => toggle(c.id, v)} accessibilityLabel={c.task}>
            <Text color={checked ? 'textSecondary' : 'text'} style={checked && { textDecorationLine: 'line-through' }}>
              {c.task}
            </Text>
          </Checkbox>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { alignItems: 'center', gap: space[3], paddingTop: space[2] },
  card: { padding: space[5], borderRadius: radius.card, borderWidth: 1 },
  priority: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pill: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 10, borderRadius: radius.chip },
  sectionCard: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 60, paddingHorizontal: space[4] },
  sectionScore: { fontFamily: fonts.heading700, fontSize: 16, lineHeight: 22 },
  sectionBody: { gap: space[3], paddingHorizontal: space[4], paddingBottom: space[4] },
  quote: { paddingVertical: space[3], paddingHorizontal: 14, borderRadius: radius.button },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: space[1], paddingLeft: 14, paddingRight: space[1], borderRadius: radius.button },
  iconButton: { width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  keywords: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  keyword: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.chip, borderWidth: 1, justifyContent: 'center' },
  checkHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space[2] },
  ghost: { gap: 10, opacity: 0.35 },
  ghostRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 60, paddingHorizontal: space[4] },
  ghostBar: { width: 40, height: 14, borderRadius: 7 },
  lockedOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', paddingTop: 80 },
  lockedCard: { width: '90%', maxWidth: 320, padding: space[6], borderRadius: radius.card, borderWidth: 1, gap: space[3] },
});
