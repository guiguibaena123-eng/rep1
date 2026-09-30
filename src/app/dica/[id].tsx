import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, BookOpen, Check, Lock, ThumbsDown, ThumbsUp, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, EmptyState, LoadingScreen, Screen, ScreenHeader, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { openPremium } from '@/features/plan/navigation';
import { useIsPremium, useMarkTipRead, useSetHelpful, useTipBody, useTipProgress, useTipsCatalog } from '@/features/tips/api';
import { SaveButton, TipBlocks, TipPremiumSheet } from '@/features/tips/components';
import { nextTip } from '@/features/tips/logic';
import type { Tip } from '@/features/tips/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, size, space } from '@/theme/tokens';

const r = t.tipRead;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/dicas');
}

/** T14 Leitura de dica. O texto vem do banco só se a pessoa puder ler (Premium conferido lá). */
export default function TipScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const catalog = useTipsCatalog();
  const tip = catalog.data?.tips.find((x) => x.id === id);

  if (catalog.isPending) return <LoadingScreen />;
  if (catalog.isError) {
    return (
      <ErrorScreen
        onRetry={() => catalog.refetch()}
        retrying={catalog.isFetching}
        secondaryLabel={t.common.back}
        onSecondary={goBack}
      />
    );
  }
  if (!tip) {
    return (
      <>
        <ScreenHeader onLeadingPress={goBack} />
        <Screen withHeader>
          <EmptyState icon={BookOpen} title={r.notFound} actionLabel={t.common.back} onAction={goBack} />
        </Screen>
      </>
    );
  }
  return <TipReader tip={tip} all={catalog.data.tips} />;
}

function TipReader({ tip, all }: { tip: Tip; all: Tip[] }) {
  const { colors } = useTheme();
  const toast = useToast();
  const premium = useIsPremium();
  const body = useTipBody(tip.id);
  const progress = useTipProgress().data?.find((row) => row.tip_id === tip.id);
  const markRead = useMarkTipRead();
  const setHelpful = useSetHelpful();
  const [premiumOpen, setPremiumOpen] = useState(false);

  const next = nextTip(tip, all);
  const isRead = !!progress?.read_at;
  const helpful = progress?.helpful ?? null;

  const vote = (value: boolean) => {
    // Tocar de novo no mesmo voto tira o voto.
    const nextValue = helpful === value ? null : value;
    setHelpful.mutate({ tipId: tip.id, helpful: nextValue }, { onError: () => toast.show(r.voteError, 'error') });
  };

  const openNext = () => {
    if (!next) return;
    if (next.is_premium && !premium) setPremiumOpen(true);
    // replace: o "voltar" continua levando para a lista, sem empilhar dicas.
    else router.replace(`/dica/${next.id}`);
  };

  return (
    <>
      <ScreenHeader onLeadingPress={goBack} trailing={<SaveButton tipId={tip.id} saved={!!progress?.favorited} color={colors.text} />} />
      <Screen withHeader gap={18} contentStyle={{ paddingTop: space[3] }}>
        <View style={{ gap: space[2] }}>
          <Text variant="display" accessibilityRole="header">
            {tip.title}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {r.meta(t.tips.category[tip.category], tip.read_minutes)}
          </Text>
        </View>

        {body.isPending ? (
          <LoadingBody />
        ) : body.isError ? (
          <View style={{ gap: space[3] }}>
            <Text color="textSecondary">{t.tips.loadError}</Text>
            <Button label={t.common.tryAgain} variant="secondary" compact onPress={() => body.refetch()} loading={body.isFetching} />
          </View>
        ) : body.data === null ? (
          <EmptyState
            icon={Lock}
            title={r.lockedTitle}
            text={r.lockedText}
            actionLabel={t.tips.premiumCta}
            onAction={() => openPremium('dica')}
          />
        ) : (
          <>
            <TipBlocks blocks={body.data} />

            <View style={[styles.helpful, { borderTopColor: colors.border }]}>
              <Text weight="semibold">{r.helpful}</Text>
              <View style={styles.votes}>
                <VoteButton icon={ThumbsUp} label={r.helpfulYes} on={helpful === true} onPress={() => vote(true)} />
                <VoteButton icon={ThumbsDown} label={r.helpfulNo} on={helpful === false} onPress={() => vote(false)} />
              </View>
            </View>

            {isRead ? (
              <View
                style={[styles.readDone, { backgroundColor: colors.successSoft }]}
                accessible
                accessibilityLabel={r.done}
              >
                <Check size={20} color={colors.successInk} strokeWidth={2} />
                <Text weight="semibold" style={{ color: colors.successInk }}>
                  {r.done}
                </Text>
              </View>
            ) : (
              <Button
                label={r.markRead}
                loading={markRead.isPending}
                onPress={() => markRead.mutate(tip.id, { onError: () => toast.show(r.readError, 'error') })}
              />
            )}
          </>
        )}

        {next && (
          <Pressable
            onPress={openNext}
            accessibilityRole="button"
            accessibilityLabel={r.nextA11y(next.title)}
            style={({ pressed }) => [
              styles.next,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" color="textSecondary">
                {r.next(next.read_minutes)}
              </Text>
              <Text weight="semibold">{next.title}</Text>
            </View>
            {next.is_premium && !premium ? (
              <Lock size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
            ) : (
              <ArrowRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
            )}
          </Pressable>
        )}
      </Screen>

      <TipPremiumSheet visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}

function VoteButton({ icon: Icon, label, on, onPress }: { icon: LucideIcon; label: string; on: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      style={[
        styles.vote,
        { backgroundColor: on ? colors.primarySoft : colors.surface, borderColor: on ? colors.primary : colors.border },
      ]}
    >
      <Icon size={20} color={on ? colors.primaryInk : colors.textSecondary} strokeWidth={iconStroke} />
    </Pressable>
  );
}

/** Linhas cinza enquanto o texto carrega (E01b). */
function LoadingBody() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[3] }} accessibilityLabel={t.common.loading} accessibilityRole="progressbar">
      {['100%', '92%', '96%', '60%', '100%', '85%'].map((w, i) => (
        <View key={i} style={{ width: w as `${number}%`, height: 14, borderRadius: 7, backgroundColor: colors.skeletonSoft }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  helpful: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: space[1],
    borderTopWidth: 1,
  },
  votes: { flexDirection: 'row', gap: space[2] },
  vote: { width: size.minTouch, height: size.minTouch, borderRadius: radius.button, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  readDone: {
    height: size.buttonHeight,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: 18,
    paddingHorizontal: space[5],
    borderRadius: radius.card,
    borderWidth: 1,
    marginTop: space[2],
  },
});
