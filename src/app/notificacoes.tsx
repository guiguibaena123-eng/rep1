import { useNetInfo } from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { Bell, Dumbbell, Flame, PlayCircle, UserCheck, UserPlus, WifiOff, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, ScreenHeader, SkeletonCard, Text } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { usePendingSession } from '@/features/interview/api';
import { useMarkAllRead, useNotifications, useSettleListOnLeave } from '@/features/notifications/api';
import { timeAgo } from '@/features/notifications/logic';
import { useReminderBadge, useTodayReminders } from '@/features/notifications/reminders';
import type { AppNotification, LocalReminder } from '@/features/notifications/types';
import { Avatar } from '@/features/profile/Avatar';
import { VerifiedBadge } from '@/features/profile/VerifiedBadge';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const n = t.notifications;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/');
}

/**
 * Notificações: "Para hoje" (simulação em andamento, sequência, treino) e "Recentes" (pedidos para seguir,
 * pedidos aceitos e novos seguidores, criados pelo banco). Ao abrir, tudo é marcado como lido;
 * o destaque das novas fica na tela até sair.
 */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const net = useNetInfo();
  const offline = net.isConnected === false || net.isInternetReachable === false;
  const userId = useAuth().session?.user.id;
  const list = useNotifications();
  const { mutate: markRead } = useMarkAllRead();
  const pending = usePendingSession();
  const reminders = useTodayReminders();
  const items = list.data?.pages.flat() ?? [];
  const now = new Date();

  // Marca como lido quando a lista chega (só se houver algo não lido).
  const hasUnread = items.some((i) => !i.is_read);
  useEffect(() => {
    if (hasUnread) markRead();
  }, [hasUnread, markRead]);

  // Os lembretes de hoje também contam como vistos ao abrir (some do número do sino).
  const remindersKey = reminders.map((r) => r.kind).join();
  const { markSeen } = useReminderBadge(reminders);
  useEffect(() => {
    if (remindersKey) markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remindersKey]);

  // Ao sair, o cache vira "lido": reabrir logo depois não mostra o destaque de novo.
  const settleOnLeave = useSettleListOnLeave();
  useEffect(() => settleOnLeave, [settleOnLeave]);

  const openReminder = (r: LocalReminder) => {
    if (r.kind === 'pending' && pending.data) {
      const { session, answersSaved } = pending.data;
      router.push(answersSaved ? `/simulacao/${session.id}/gerando` : `/simulacao/${session.id}`);
    } else router.navigate('/treinar');
  };

  const open = (item: AppNotification) => {
    if (item.type === 'follow_request' && userId) {
      router.push({
        pathname: '/conexoes/[id]',
        params: { id: userId, tab: 'requests' },
      });
    } else {
      router.push(`/pessoa/${item.actor_id}`);
    }
  };

  let empty = null;
  if (list.isPending) {
    empty = (
      <View style={{ gap: 10 }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
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
        <Text color="textSecondary">{n.loadError}</Text>
        <Button
          label={t.common.tryAgain}
          variant="secondary"
          compact
          onPress={() => list.refetch()}
          loading={list.isFetching}
        />
      </Card>
    );
  } else if (reminders.length === 0) {
    empty = <EmptyState icon={Bell} title={n.emptyTitle} text={n.emptyText} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={n.title} onLeadingPress={goBack} />
      <FlatList<AppNotification>
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, space[5]) + space[6] }]}
        data={list.isError ? [] : items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <NotificationRow item={item} ago={timeAgo(item.created_at, now)} onPress={() => open(item)} />
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View
            style={{
              gap: space[3],
              marginBottom: items.length > 0 || reminders.length > 0 ? space[4] : 0,
            }}
          >
            {reminders.length > 0 && (
              <>
                <Text variant="sectionTitle" accessibilityRole="header">
                  {n.today}
                </Text>
                {reminders.map((r) => (
                  <ReminderCard key={r.kind} reminder={r} onPress={() => openReminder(r)} />
                ))}
              </>
            )}
            {items.length > 0 && (
              <Text
                variant="sectionTitle"
                accessibilityRole="header"
                style={{ marginTop: reminders.length > 0 ? space[2] : 0 }}
              >
                {n.recent}
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

function ReminderCard({ reminder, onPress }: { reminder: LocalReminder; onPress: () => void }) {
  const { colors } = useTheme();
  const meta: {
    icon: LucideIcon;
    title: string;
    text: string;
    action: string;
    bg: string;
    fg: string;
  } =
    reminder.kind === 'pending'
      ? {
          icon: PlayCircle,
          title: n.pendingTitle,
          text: n.pendingText,
          action: n.pendingAction,
          bg: colors.primarySoft,
          fg: colors.primary,
        }
      : reminder.kind === 'streak'
        ? {
            icon: Flame,
            title: n.streakTitle(reminder.days),
            text: n.streakText,
            action: n.trainAction,
            bg: colors.warningSoft,
            fg: colors.streakIcon,
          }
        : {
            icon: Dumbbell,
            title: n.trainTitle,
            text: n.trainText,
            action: n.trainAction,
            bg: colors.primarySoft,
            fg: colors.primary,
          };
  return (
    <Card style={{ gap: space[3] }}>
      <View style={styles.rowTop}>
        <View style={[styles.icon, { backgroundColor: meta.bg }]}>
          <meta.icon size={22} color={meta.fg} strokeWidth={iconStroke} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text weight="semibold">{meta.title}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {meta.text}
          </Text>
        </View>
      </View>
      <Button label={meta.action} variant="secondary" compact onPress={onPress} />
    </Card>
  );
}

function NotificationRow({ item, ago, onPress }: { item: AppNotification; ago: string; onPress: () => void }) {
  const { colors } = useTheme();
  const name = item.actor_name?.trim() || n.someone;
  const text =
    item.type === 'follow_request'
      ? n.followRequest(name)
      : item.type === 'follow_accepted'
        ? n.followAccepted(name)
        : n.newFollower(name);
  const Icon = item.type === 'follow_request' ? UserPlus : UserCheck;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${text}. ${ago}`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: item.is_read ? colors.surface : colors.primarySoft,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View>
        <Avatar name={item.actor_name} photoPath={item.actor_photo_path} size={48} />
        <View style={[styles.typeDot, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
          <Icon size={12} color={colors.onPrimary} strokeWidth={2.5} />
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={styles.nameLine}>
          <Text style={{ flexShrink: 1 }}>{text}</Text>
          {item.actor_verified && <VerifiedBadge kind={item.actor_verified} size={16} />}
        </View>
        <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.body400 }}>
          {ago}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: screenPadding,
    paddingTop: space[2],
    flexGrow: 1,
  },
  rowTop: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    minHeight: size.minTouch,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeDot: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
