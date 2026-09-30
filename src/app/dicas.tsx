import { router } from 'expo-router';
import { Bookmark, Search, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, EmptyState, PremiumBadge, ProgressBar, Screen, ScreenHeader, SkeletonCard, Text } from '@/components';
import { useProfile } from '@/features/profile/api';
import { useIsPremium, useTipProgress, useTipsCatalog } from '@/features/tips/api';
import { SaveButton, TipPremiumSheet } from '@/features/tips/components';
import { filterTips, forYouTips, progressSets, trackProgress, type TipFilter } from '@/features/tips/logic';
import { TIP_CATEGORIES, type Tip, type Track } from '@/features/tips/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const d = t.tips;
const SEARCH_DEBOUNCE_MS = 300;
// "Para você" é o filtro principal: vem primeiro e é o padrão ao abrir a aba.
const FILTERS: { key: TipFilter; label: string }[] = [
  { key: 'forYou', label: d.forYou },
  { key: 'all', label: d.all },
  { key: 'saved', label: d.saved },
  ...TIP_CATEGORIES.map((c) => ({ key: c, label: d.category[c] })),
];

function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/');
}

/**
 * T13 Dicas: "Para você" em destaque (padrão), busca por título (local, 300ms), chips de
 * categoria, trilhas com progresso e lista. Dica Premium para quem é grátis abre o aviso do Premium.
 * Não é mais aba: abre pela Início ("Ver todas") e tem voltar no topo.
 */
export default function TipsScreen() {
  const { colors } = useTheme();
  const catalog = useTipsCatalog();
  const progress = useTipProgress();
  const premium = useIsPremium();
  const profile = useProfile().data;

  const [typed, setTyped] = useState('');
  const [query, setQuery] = useState('');
  // null = a pessoa ainda não escolheu um filtro: abre no "Para você".
  const [picked, setFilter] = useState<TipFilter | null>(null);
  const [premiumOpen, setPremiumOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  const { read, saved } = progressSets(progress.data ?? []);
  const tips = catalog.data?.tips ?? [];
  const tracks = catalog.data?.tracks ?? [];
  const forYouCount = forYouTips(tips, profile).length;
  // Sem dicas para o perfil (ex.: área "Outra" e nenhum objetivo marcado), abre em "Todas".
  const filter: TipFilter = picked ?? (forYouCount > 0 ? 'forYou' : 'all');
  const visible = filterTips(tips, filter, query, saved, profile);
  const searching = !!query.trim();
  const forYou = filter === 'forYou';
  const showTracks = (filter === 'all' || forYou) && !searching && tracks.length > 0;

  // "Com base no seu cadastro: Vendas · Primeiro emprego"
  const profileBits: string[] = [];
  if (profile?.area && profile.area !== 'outra') profileBits.push(t.options.area[profile.area]);
  if (profile?.goal) profileBits.push(t.options.goal[profile.goal]);

  const openTip = (tip: Tip) => {
    if (tip.is_premium && !premium) setPremiumOpen(true);
    else router.push(`/dica/${tip.id}`);
  };

  const clearSearch = () => {
    setTyped('');
    setQuery('');
  };

  const refreshing = catalog.isRefetching || progress.isRefetching;
  const refresh = () => {
    catalog.refetch();
    progress.refetch();
  };

  const tracksRow = showTracks ? <TracksRow tracks={tracks} tips={tips} read={read} onOpen={openTip} /> : null;

  return (
    <>
    <ScreenHeader onLeadingPress={goBack} />
    <Screen
      withHeader
      gap={20}
      contentStyle={[styles.noSidePadding, { paddingTop: space[1] }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      {/* Sem margem lateral na moldura (carrosséis até a borda): cada bloco põe a sua. */}
      <View style={[styles.padded, { gap: space[4] }]}>
        <Text variant="brandTitle" accessibilityRole="header">
          {d.title}
        </Text>
        <View>
          <Search size={20} color={colors.textSecondary} strokeWidth={iconStroke} style={styles.searchIcon} />
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={d.search}
            accessibilityLabel={d.search}
            placeholderTextColor={colors.textDisabled}
            selectionColor={colors.primary}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
          {typed.length > 0 && (
            <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel={d.clearSearch} style={styles.clear}>
              <X size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={d.filtersA11y}
        style={styles.fixedRow}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => {
          const selected = filter === f.key;
          if (f.key !== 'forYou') {
            return <Chip key={f.key} label={f.label} selected={selected} onPress={() => setFilter(f.key)} />;
          }
          // Destaque: ícone ✨ e fundo índigo claro mesmo quando não está selecionado.
          return (
            <Chip
              key={f.key}
              label={f.label}
              selected={selected}
              onPress={() => setFilter(f.key)}
              icon={<Sparkles size={16} color={selected ? colors.onPrimary : colors.primary} strokeWidth={2} />}
              style={!selected && { backgroundColor: colors.primarySoft, borderColor: colors.primary }}
            />
          );
        })}
      </ScrollView>

      {catalog.isPending ? (
        <View style={[styles.padded, styles.list]}>
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      ) : catalog.isError ? (
        <View style={styles.padded}>
          <Card style={{ gap: space[3] }}>
            <Text color="textSecondary">{d.loadError}</Text>
            <Button label={t.common.tryAgain} variant="secondary" compact onPress={refresh} loading={refreshing} />
          </Card>
        </View>
      ) : (
        <>
          {forYou && !searching && visible.length > 0 && (
            <View style={styles.padded}>
              <View style={[styles.hero, { backgroundColor: colors.primarySoft }]}>
                <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
                  <Sparkles size={22} color={colors.primary} strokeWidth={iconStroke} />
                </View>
                <View style={styles.heroText}>
                  <Text variant="sectionTitle" accessibilityRole="header">
                    {d.forYouTitle}
                  </Text>
                  <Text variant="bodySmall" color="textSecondary">
                    {profileBits.length > 0 ? d.forYouBasis(profileBits.join(' · ')) : d.forYouBasisGeneric}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Em "Todas" as trilhas vêm antes da lista; no "Para você" as dicas escolhidas vêm primeiro. */}
          {!forYou && tracksRow}

          <View style={[styles.padded, styles.list]}>
            {visible.length === 0 ? (
              forYou && !searching ? (
                <EmptyState
                  icon={Sparkles}
                  title={d.forYouEmptyTitle}
                  text={d.forYouEmptyText}
                  actionLabel={d.savedEmptyAction}
                  actionVariant="secondary"
                  onAction={() => setFilter('all')}
                />
              ) : filter === 'saved' && !searching ? (
                <EmptyState
                  icon={Bookmark}
                  title={d.savedEmptyTitle}
                  text={d.savedEmptyText}
                  actionLabel={d.savedEmptyAction}
                  actionVariant="secondary"
                  onAction={() => setFilter('all')}
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title={d.noResultsTitle}
                  text={d.noResultsText}
                  actionLabel={searching ? d.clearSearch : undefined}
                  actionVariant="secondary"
                  onAction={clearSearch}
                />
              )
            ) : (
              visible.map((tip) => (
                <TipRow
                  key={tip.id}
                  tip={tip}
                  locked={tip.is_premium && !premium}
                  read={read.has(tip.id)}
                  saved={saved.has(tip.id)}
                  onPress={() => openTip(tip)}
                />
              ))
            )}
          </View>

          {forYou && tracksRow}
        </>
      )}

      <TipPremiumSheet visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </Screen>
    </>
  );
}

/** Trilhas: cards na horizontal com descrição e progresso. Tocar abre a próxima dica não lida. */
function TracksRow({
  tracks,
  tips,
  read,
  onOpen,
}: {
  tracks: Track[];
  tips: Tip[];
  read: Set<string>;
  onOpen: (tip: Tip) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space[3] }}>
      <Text variant="sectionTitle" accessibilityRole="header" style={styles.padded}>
        {d.tracks}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fixedRow} contentContainerStyle={styles.tracks}>
        {tracks.map((track) => {
          const p = trackProgress(tips, track.id, read);
          const started = p.read > 0 && p.read < p.total;
          return (
            <Pressable
              key={track.id}
              onPress={() => p.next && onOpen(p.next)}
              accessibilityRole="button"
              accessibilityLabel={d.trackA11y(track.title, p.read, p.total)}
              style={({ pressed }) => [
                styles.track,
                started
                  ? { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.trackText}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text variant="bodySmall" color="textSecondary" numberOfLines={2}>
                  {track.description}
                </Text>
                <Text variant="caption" color="textSecondary" style={{ marginTop: space[1] }}>
                  {d.trackMeta(p.read, p.total)}
                </Text>
              </View>
              <ProgressBar value={p.total ? p.read / p.total : 0} accessibilityLabel={d.trackMeta(p.read, p.total)} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TipRow({
  tip,
  locked,
  read,
  saved,
  onPress,
}: {
  tip: Tip;
  locked: boolean;
  read: boolean;
  saved: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const meta = d.meta(d.category[tip.category], tip.read_minutes);
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={d.tipA11y(tip.title, meta, locked, read)}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}
      >
        <Text weight="semibold">{tip.title}</Text>
        <View style={styles.meta}>
          <Text variant="caption" color="textSecondary">
            {meta}
          </Text>
          {read && (
            <Text variant="caption" color="successInk">
              {`· ${d.read}`}
            </Text>
          )}
          {locked && <PremiumBadge />}
        </View>
      </Pressable>
      <SaveButton tipId={tip.id} saved={saved} />
    </View>
  );
}

const styles = StyleSheet.create({
  noSidePadding: { paddingHorizontal: 0 },
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
  // O ScrollView do React Native estica e encolhe por padrão (flexGrow/flexShrink 1). Aqui a
  // altura tem que ser só a do conteúdo: senão os chips esticam quando a lista fica curta e
  // os cards das trilhas são cortados quando a lista é longa.
  fixedRow: { flexGrow: 0, flexShrink: 0 },
  chips: { gap: space[2], paddingHorizontal: screenPadding, paddingVertical: space[1], alignItems: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: space[5] - 2, borderRadius: radius.card },
  heroIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, gap: 2 },
  tracks: { gap: space[3], paddingHorizontal: screenPadding, alignItems: 'stretch' },
  track: { width: 240, padding: 18, borderRadius: radius.card, borderWidth: 1, gap: space[3], justifyContent: 'space-between' },
  trackText: { gap: space[1] },
  trackTitle: { fontFamily: fonts.heading700, fontSize: 16, lineHeight: 22 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[4],
    paddingLeft: space[4],
    paddingRight: space[2],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  rowMain: { flex: 1, gap: 6, minHeight: 48, justifyContent: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' },
});
