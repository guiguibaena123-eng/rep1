import { useNetInfo } from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { Eye, Search, Users, WifiOff, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, EmptyState, SkeletonCard, Text, useToast } from '@/components';
import { BrandLogo, brandLogoTop } from '@/components/Screen';
import { useExplorePeople, useSimilarPeople } from '@/features/explore/api';
import { PersonCard, PersonRow } from '@/features/explore/components';
import { canFilterNear, exploreParams, filterChips, toggleFilter } from '@/features/explore/logic';
import type { ExploreFilter, ExplorePerson } from '@/features/explore/types';
import { useProfile } from '@/features/profile/api';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const x = t.explore;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * T20 Explorar: busca (nome, título, área e competências; 300 ms), filtros em chips (múltipla escolha),
 * "Com objetivos parecidos" (carrossel) e "Pessoas para conhecer" (20 por página, carrega ao rolar).
 * Só aparecem perfis públicos, nunca o próprio. Sem chat nesta versão.
 */
export default function ExploreTab() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const net = useNetInfo();
  const offline = net.isConnected === false || net.isInternetReachable === false;
  const profile = useProfile().data;

  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExploreFilter[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  const params = exploreParams(query, selected, profile);
  const people = useExplorePeople(params);
  const similar = useSimilarPeople();
  const chips = filterChips(profile);
  const narrowing = !!params.p_query || selected.length > 0;
  const list = people.data?.pages.flat() ?? [];

  const pick = (key: ExploreFilter) => {
    if (key === 'near' && !selected.includes('near') && !canFilterNear(profile)) {
      toast.show(x.nearNeedsCity, 'error');
      return;
    }
    setSelected((s) => toggleFilter(s, key));
  };

  const clearSearch = () => {
    setTyped('');
    setQuery('');
  };

  const refreshing = (people.isRefetching && !people.isFetchingNextPage) || similar.isRefetching;
  const refresh = () => {
    people.refetch();
    similar.refetch();
  };

  const similarList = similar.data ?? [];
  const showSimilar = !narrowing && similarList.length > 0;
  const similarText =
    profile?.goal && profile.area && profile.area !== 'outra'
      ? x.similarText(t.options.goal[profile.goal], t.options.area[profile.area])
      : null;

  const header = (
    <View style={{ gap: 20 }}>
      <View style={[styles.padded, { gap: space[4] }]}>
        <BrandLogo />
        <Text variant="brandTitle" accessibilityRole="header">
          {x.title}
        </Text>
        <View>
          <Search size={20} color={colors.textSecondary} strokeWidth={iconStroke} style={styles.searchIcon} />
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={x.search}
            accessibilityLabel={x.searchA11y}
            placeholderTextColor={colors.textDisabled}
            selectionColor={colors.primary}
            returnKeyType="search"
            autoCorrect={false}
            maxLength={60}
            style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
          {typed.length > 0 && (
            <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel={x.clearSearch} style={styles.clear}>
              <X size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={x.filtersA11y}
        style={styles.fixedRow}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {chips.map((c) => (
          <Chip key={c.key} role="checkbox" label={c.label} selected={selected.includes(c.key)} onPress={() => pick(c.key)} />
        ))}
      </ScrollView>

      {profile && !profile.is_public && (
        <View style={styles.padded}>
          <View style={[styles.notice, { backgroundColor: colors.primarySoft }]}>
            <Eye size={22} color={colors.primaryInk} strokeWidth={iconStroke} style={{ marginTop: 1 }} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text weight="semibold" style={{ fontSize: 15, lineHeight: 21 }}>
                {x.privateTitle}
              </Text>
              <Text variant="bodySmall" color="textOnSoft">
                {x.privateText}
              </Text>
              <Pressable
                onPress={() => router.push('/meu-perfil/editar')}
                accessibilityRole="link"
                hitSlop={6}
                style={({ pressed }) => [styles.noticeLink, pressed && { opacity: 0.7 }]}
              >
                <Text variant="bodySmall" weight="semibold" style={{ color: colors.primaryInk }}>
                  {x.privateLink}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showSimilar && (
        <View style={{ gap: space[3] }}>
          <View style={styles.padded}>
            <Text variant="sectionTitle" accessibilityRole="header">
              {x.similarTitle}
            </Text>
            {similarText && (
              <Text variant="bodySmall" color="textSecondary">
                {similarText}
              </Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fixedRow} contentContainerStyle={styles.carousel}>
            {similarList.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </ScrollView>
        </View>
      )}

      <Text variant="sectionTitle" accessibilityRole="header" style={styles.padded}>
        {params.p_query ? x.results : x.peopleTitle}
      </Text>
    </View>
  );

  let empty;
  if (people.isPending) {
    empty = (
      <View style={styles.listGap}>
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </View>
    );
  } else if (people.isError) {
    empty = offline ? (
      <EmptyState
        icon={WifiOff}
        title={x.offlineTitle}
        text={x.offlineText}
        actionLabel={t.common.tryAgain}
        actionVariant="secondary"
        onAction={refresh}
      />
    ) : (
      <Card style={{ gap: space[3] }}>
        <Text color="textSecondary">{x.loadError}</Text>
        <Button label={t.common.tryAgain} variant="secondary" compact onPress={refresh} loading={people.isFetching} />
      </Card>
    );
  } else {
    empty = narrowing ? (
      <EmptyState
        icon={Search}
        title={x.emptyTitle}
        text={x.emptyText}
        actionLabel={x.clearAll}
        actionVariant="secondary"
        onAction={() => {
          clearSearch();
          setSelected([]);
        }}
      />
    ) : (
      <EmptyState icon={Users} title={x.emptyTitle} text={x.emptyNobody} />
    );
  }

  return (
    <FlatList<ExplorePerson>
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: brandLogoTop(insets.top) }]}
      data={people.isError ? [] : list}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <View style={styles.padded}>
          <PersonRow person={item} />
        </View>
      )}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: space[3] }}
      ListEmptyComponent={<View style={styles.padded}>{empty}</View>}
      ListFooterComponent={
        people.isFetchingNextPage ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space[4] }} accessibilityLabel={t.common.loading} />
        ) : null
      }
      onEndReached={() => {
        if (people.hasNextPage && !people.isFetchingNextPage) people.fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    />
  );
}

function Separator() {
  return <View style={{ height: 10 }} />;
}

const styles = StyleSheet.create({
  content: { paddingBottom: space[8], flexGrow: 1 },
  padded: { paddingHorizontal: screenPadding },
  searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  search: {
    height: size.inputHeight,
    borderWidth: 1,
    borderRadius: radius.input,
    paddingLeft: 46,
    paddingRight: size.minTouch,
    fontFamily: fonts.body400,
    fontSize: 16,
  },
  clear: { position: 'absolute', right: 2, top: 2, width: size.minTouch, height: size.minTouch, alignItems: 'center', justifyContent: 'center' },
  // Altura só do conteúdo (o ScrollView estica por padrão).
  fixedRow: { flexGrow: 0, flexShrink: 0 },
  chips: { gap: space[2], paddingHorizontal: screenPadding, paddingVertical: space[1], alignItems: 'center' },
  notice: { flexDirection: 'row', gap: space[3], padding: space[4], borderRadius: radius.card },
  noticeLink: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  carousel: { gap: space[3], paddingHorizontal: screenPadding, alignItems: 'stretch' },
  listGap: { gap: 10 },
});
