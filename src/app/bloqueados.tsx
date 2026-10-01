import { useNetInfo } from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { Ban, WifiOff } from 'lucide-react-native';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, ScreenHeader, SkeletonCard, Text, useToast } from '@/components';
import { useBlockedList, useUnblock } from '@/features/explore/api';
import type { BlockedPerson } from '@/features/explore/types';
import { Avatar } from '@/features/profile/Avatar';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, screenPadding, space } from '@/theme/tokens';

const b = t.blocked;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/configuracoes');
}

/** Contas bloqueadas (aberta pelas Configurações): quem a pessoa bloqueou, com o botão Desbloquear. */
export default function BlockedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const net = useNetInfo();
  const offline = net.isConnected === false || net.isInternetReachable === false;
  const list = useBlockedList();
  const people = list.data?.pages.flat() ?? [];

  let empty;
  if (list.isPending) {
    empty = (
      <View style={{ gap: 10 }}>
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
      </View>
    );
  } else if (list.isError) {
    empty = offline ? (
      <EmptyState
        icon={WifiOff}
        title={t.explore.offlineTitle}
        text={t.explore.offlineText}
        actionLabel={t.common.tryAgain}
        actionVariant="secondary"
        onAction={() => list.refetch()}
      />
    ) : (
      <Card style={{ gap: space[3] }}>
        <Text color="textSecondary">{b.loadError}</Text>
        <Button label={t.common.tryAgain} variant="secondary" compact onPress={() => list.refetch()} loading={list.isFetching} />
      </Card>
    );
  } else {
    empty = <EmptyState icon={Ban} title={b.emptyTitle} text={b.emptyText} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={b.title} onLeadingPress={goBack} />
      <FlatList<BlockedPerson>
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, space[5]) + space[6] }]}
        data={list.isError ? [] : people}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <BlockedRow person={item} />}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          people.length > 0 ? (
            <Text variant="bodySmall" color="textSecondary" style={{ marginBottom: space[4] }}>
              {b.intro}
            </Text>
          ) : null
        }
        ListEmptyComponent={empty}
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: space[4] }} accessibilityLabel={t.common.loading} />
          ) : null
        }
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) list.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching && !list.isFetchingNextPage}
            onRefresh={() => list.refetch()}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

function BlockedRow({ person }: { person: BlockedPerson }) {
  const { colors } = useTheme();
  const toast = useToast();
  const unblock = useUnblock();
  const name = person.name || (person.username ? `@${person.username}` : '');

  const doUnblock = () =>
    unblock.mutate(person.id, {
      onSuccess: () => toast.show(b.unblocked, 'success'),
      onError: () => toast.show(b.unblockError, 'error'),
    });

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Avatar name={person.name} photoPath={person.photo_path} size={48} />
      <View style={styles.rowText}>
        <Text weight="semibold" numberOfLines={1}>
          {person.name}
        </Text>
        {!!person.username && (
          <Text variant="caption" color="textSecondary" numberOfLines={1} style={{ fontFamily: fonts.body400 }}>
            {`@${person.username}`}
          </Text>
        )}
      </View>
      <Button
        label={b.unblock}
        variant="secondary"
        compact
        fullWidth={false}
        accessibilityLabel={b.unblockA11y(name)}
        onPress={doUnblock}
        loading={unblock.isPending}
      />
    </View>
  );
}

function Separator() {
  return <View style={{ height: 10 }} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: screenPadding, paddingTop: space[4], flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3], borderWidth: 1, borderRadius: radius.card },
  rowText: { flex: 1, gap: 2 },
});
