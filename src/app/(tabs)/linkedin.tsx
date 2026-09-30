import { router } from 'expo-router';
import { ChevronRight, CircleQuestionMark, FileText, Shield, TextAlignStart, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Screen, SkeletonCard, Text } from '@/components';
import { useLinkedInReports, useLinkedInUsage } from '@/features/linkedin/api';
import { PdfHelpSheet } from '@/features/linkedin/Sheets';
import { t } from '@/i18n';
import { shortDate } from '@/lib/dates';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, space } from '@/theme/tokens';

const l = t.linkedin;

/** T10 LinkedIn início: escolher PDF ou colar textos, ajuda do PDF e relatórios anteriores. */
export default function LinkedInTab() {
  const { colors } = useTheme();
  const usage = useLinkedInUsage();
  const reports = useLinkedInReports();
  const [helpOpen, setHelpOpen] = useState(false);

  const refreshing = usage.isRefetching || reports.isRefetching;
  const refresh = () => {
    usage.refetch();
    reports.refetch();
  };

  return (
    <Screen brand gap={20} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
      <Text variant="brandTitle" accessibilityRole="header">
        {l.title}
      </Text>
      <Text color="textSecondary">{l.subtitle}</Text>

      <View style={styles.options}>
        <Option
          icon={FileText}
          title={l.pdfTitle}
          text={l.pdfText}
          highlight
          onPress={() => router.push('/analise/enviar?modo=pdf')}
        />
        <Option
          icon={TextAlignStart}
          title={l.pasteTitle}
          text={l.pasteText}
          onPress={() => router.push('/analise/enviar?modo=texto')}
        />
      </View>

      <UsageLine />

      <Pressable onPress={() => setHelpOpen(true)} accessibilityRole="button" style={styles.help}>
        <CircleQuestionMark size={20} color={colors.primary} strokeWidth={iconStroke} />
        <Text weight="semibold" color="primary">
          {l.howTo}
        </Text>
      </Pressable>

      <View style={styles.privacy}>
        <Shield size={16} color={colors.textSecondary} strokeWidth={iconStroke} />
        <Text variant="caption" color="textSecondary" style={styles.flex}>
          {l.privacy}
        </Text>
      </View>

      <View style={styles.history}>
        <Text variant="sectionTitle" accessibilityRole="header">
          {l.history}
        </Text>
        {reports.isPending ? (
          <SkeletonCard lines={2} />
        ) : reports.isError ? (
          <Text variant="bodySmall" color="textSecondary">
            {l.loadError}
          </Text>
        ) : reports.data.length === 0 ? (
          <Text variant="bodySmall" color="textSecondary">
            {l.historyEmpty}
          </Text>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {reports.data.map((r, i) => {
              const kind = r.is_full ? l.historyFull : l.historySummary;
              const date = shortDate(r.created_at);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => router.push(`/analise/${r.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={l.historyA11y(kind, date, r.overall_score)}
                  style={({ pressed }) => [
                    styles.item,
                    i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.flex}>
                    <Text weight="semibold">{kind}</Text>
                    <Text variant="bodySmall" color="textSecondary">
                      {date}
                    </Text>
                  </View>
                  <Text style={styles.score}>{r.overall_score}</Text>
                  <ChevronRight size={18} color={colors.textSecondary} strokeWidth={iconStroke} />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <PdfHelpSheet visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </Screen>
  );
}

/** Quantas análises restam no mês (vem do servidor). */
function UsageLine() {
  const usage = useLinkedInUsage().data;
  if (!usage) return null;
  const left = Math.max(0, usage.limit - usage.used);
  const text = usage.premium
    ? l.premiumLeft(left)
    : left > 0
      ? l.freeLeft
      : l.freeUsed(shortDate(usage.resets_at));
  return (
    <Text variant="bodySmall" color="textSecondary">
      {text}
    </Text>
  );
}

function Option({
  icon: Icon,
  title,
  text,
  highlight,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  highlight?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${text}`}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: highlight ? colors.primarySoft : colors.background }]}>
        <Icon size={26} color={highlight ? colors.primary : colors.text} strokeWidth={iconStroke} />
      </View>
      <View style={[styles.flex, { gap: 2 }]}>
        <Text variant="sectionTitle">{title}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {text}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  options: { gap: space[3] },
  option: { flexDirection: 'row', alignItems: 'center', gap: space[4], padding: space[5], borderRadius: radius.card, borderWidth: 1 },
  optionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  help: { flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'flex-start', minHeight: 48 },
  privacy: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  history: { gap: space[3], paddingTop: space[2] },
  list: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: 14, paddingHorizontal: space[4], minHeight: 48 },
  score: { fontFamily: fonts.heading700, fontSize: 18, lineHeight: 24 },
});
