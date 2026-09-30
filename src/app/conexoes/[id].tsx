import { useNetInfo } from '@react-native-community/netinfo';
import { router, useLocalSearchParams } from 'expo-router';
import { UserCheck, UserX, Users, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, ScreenHeader, SkeletonCard, Text } from '@/components';
import { SegmentTabs } from '@/components/SegmentTabs';
import {
  errorCode,
  useFollowCounts,
  useFollowList,
  useFollowRequestCount,
  useFollowRequests,
} from '@/features/explore/api';
import { PersonRow, RequestRow } from '@/features/explore/components';
import { FOLLOW_KINDS, type ConnectionsTab, type ExplorePerson, type FollowKind } from '@/features/explore/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { screenPadding, space } from '@/theme/tokens';

const f = t.follows;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/perfil');
}

/**
 * Seguidores e Seguindo de um perfil (o próprio ou de outra pessoa visível).
 * No próprio perfil há também a aba Solicitações (quem pediu para seguir o perfil privado).
 * Parâmetros: id do perfil, tab ("followers" | "following" | "requests") e title (nome ou @ para o topo).
 * Bloqueados e cadastros não concluídos ficam de fora da lista.
 */
export default function ConnectionsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    tab?: string;
    title?: string;
  }>();
  const id = params.id;
  const isMe = useAuth().session?.user.id === id;
  const tabs: ConnectionsTab[] = isMe ? [...FOLLOW_KINDS, 'requests'] : [...FOLLOW_KINDS];
  const [tab, setTab] = useState<ConnectionsTab>(
    tabs.includes(params.tab as ConnectionsTab) ? (params.tab as ConnectionsTab) : 'followers',
  );
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const net = useNetInfo();
  const offline = net.isConnected === false || net.isInternetReachable === false;

  const counts = useFollowCounts(id).data;
  const requestCount = useFollowRequestCount().data;
  const isRequests = tab === 'requests';
  const follows = useFollowList(id, isRequests ? 'followers' : tab, !isRequests);
  const requests = useFollowRequests(isMe && isRequests);
  const list = isRequests ? requests : follows;
  const people = list.data?.pages.flat() ?? [];

  const label = (kind: ConnectionsTab) => {
    const n = kind === 'requests' ? requestCount : counts?.[kind];
    const name = kind === 'followers' ? f.followers : kind === 'following' ? f.following : f.requests;
    return n == null ? name : `${n} ${name}`;
  };

  let empty;
  if (list.isPending) {
    empty = (
      <View style={{ gap: 10 }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </View>
    );
  } else if (list.isError) {
    if (errorCode(list.error) === 'P0002') {
      empty = <EmptyState icon={UserX} title={t.explore.unavailableTitle} text={t.explore.unavailableText} />;
    } else if (offline) {
      empty = (
        <EmptyState
          icon={WifiOff}
          title={t.explore.offlineTitle}
          text={t.explore.offlineText}
          actionLabel={t.common.tryAgain}
          actionVariant="secondary"
          onAction={() => list.refetch()}
        />
      );
    } else {
      empty = (
        <Card style={{ gap: space[3] }}>
          <Text color="textSecondary">{f.loadError}</Text>
          <Button
            label={t.common.tryAgain}
            variant="secondary"
            compact
            onPress={() => list.refetch()}
            loading={list.isFetching}
          />
        </Card>
      );
    }
  } else if (isRequests) {
    empty = <EmptyState icon={UserCheck} title={f.emptyRequestsTitle} text={f.emptyRequests} />;
  } else {
    const text =
      tab === 'followers'
        ? isMe
          ? f.emptyMyFollowers
          : f.emptyFollowers
        : isMe
          ? f.emptyMyFollowing
          : f.emptyFollowing;
    empty = (
      <EmptyState
        icon={Users}
        title={tab === 'followers' ? f.emptyFollowersTitle : f.emptyFollowingTitle}
        text={text}
        actionLabel={isMe && tab === 'following' ? f.findPeople : undefined}
        actionVariant="secondary"
        onAction={isMe && tab === 'following' ? () => router.navigate('/explorar') : undefined}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={params.title || f.title} onLeadingPress={goBack} />
      <FlatList<ExplorePerson>
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, space[5]) + space[6] }]}
        data={list.isError ? [] : people}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (isRequests ? <RequestRow person={item} /> : <PersonRow person={item} />)}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={{ gap: space[3], marginBottom: space[4] }}>
            <SegmentTabs options={tabs.map((k) => ({ value: k, label: label(k) }))} value={tab} onChange={setTab} />
            {/* O número conta todo mundo; a lista deixa de fora bloqueados. */}
            {!isRequests &&
              !!counts &&
              counts[tab as FollowKind] > people.length &&
              !list.hasNextPage &&
              !list.isPending && (
                <Text variant="caption" color="textSecondary">
                  {f.hiddenNote}
                </Text>
              )}
          </View>
        }
        ListEmptyComponent={empty}
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: space[4] }}
              accessibilityLabel={t.common.loading}
            />
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

function Separator() {
  return <View style={{ height: 10 }} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: space[2],
    flexGrow: 1,
  },
});
