import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import {
  Award,
  Briefcase,
  Check,
  ChevronLeft,
  Clock,
  FileUser,
  Flame,
  GraduationCap,
  Link2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, LoadingScreen, ProgressBar, ScoreRing, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAuth } from '@/features/auth/AuthProvider';
import { useFollowCounts, useFollowRequestCount } from '@/features/explore/api';
import { FollowStats } from '@/features/explore/components';
import { useLinkedInReports } from '@/features/linkedin/api';
import { useProfile, useStrengths, useUpdateProfile } from '@/features/profile/api';
import { Avatar } from '@/features/profile/Avatar';
import { CoverImage } from '@/features/profile/CoverImage';
import {
  availabilityLabel,
  completeness,
  detailsFromProfile,
  highlightSkills,
  instagramHandle,
  instagramHref,
  isValidLink,
  linkHref,
  linkLabel,
} from '@/features/profile/details';
import { InstagramLogo, LinkedInLogo } from '@/features/profile/SocialLogos';
import { isPremium, type ProfileDetails } from '@/features/profile/types';
import { verifiedKind } from '@/features/profile/verified';
import { VerifiedBadge } from '@/features/profile/VerifiedBadge';
import { useUserStats } from '@/features/progress/api';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const m = t.myProfile;
const COVER_HEIGHT = 176;
const PHOTO = 104;

const edit = () => router.push('/meu-perfil/editar');

/** T18 Meu perfil: tudo o que a pessoa contou sobre si, com o "% completo" e as conquistas. */
export default function MyProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const userId = useAuth().session?.user.id;
  const counts = useFollowCounts(userId).data;
  const requests = useFollowRequestCount().data ?? 0;

  if (profile.isPending) return <LoadingScreen />;
  if (!profile.data) {
    return <ErrorScreen text={m.loadError} onRetry={() => profile.refetch()} retrying={profile.isFetching} />;
  }

  const d = detailsFromProfile(profile.data);
  const verified = verifiedKind(userId, isPremium(profile.data));
  const { pct, missing } = completeness(d);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, space[5]) + space[8] }}>
      <Cover path={d.cover_path} x={d.cover_x} y={d.cover_y} />

      <View style={[styles.body, { marginTop: -(PHOTO / 2) }]}>
        <View style={{ gap: 10 }}>
          <Avatar name={d.name} photoPath={d.photo_path} size={PHOTO} ring />
          <View style={{ gap: space[1] }}>
            <View style={styles.nameRow}>
              <Text accessibilityRole="header" style={styles.name}>
                {d.name}
              </Text>
              {verified && <VerifiedBadge kind={verified} size={24} />}
            </View>
            {!!d.username && (
              <Text variant="bodySmall" color="textSecondary">
                {`@${d.username}`}
              </Text>
            )}
            {!!d.headline && <Text>{d.headline}</Text>}
            <View style={styles.meta}>
              {!!d.city && <Meta icon={MapPin} label={d.city} />}
              {d.availability.length > 0 && <Meta icon={Clock} label={availabilityLabel(d.availability)} />}
            </View>
            {!!userId && !!counts && (
              <FollowStats
                id={userId}
                followers={counts.followers}
                following={counts.following}
                title={d.username ? `@${d.username}` : (d.name ?? '')}
                requests={requests}
              />
            )}
          </View>
          <SocialTabs linkedin={d.linkedin_url} instagram={profile.data.instagram} />
        </View>

        <Card style={{ gap: 10 }}>
          <View style={styles.completeHead}>
            <Text weight="semibold" style={{ flexShrink: 1 }}>
              {m.complete(pct)}
            </Text>
            {missing && <Button label={m.completeCta} variant="text" onPress={edit} style={styles.inlineAction} />}
          </View>
          <ProgressBar value={pct / 100} accessibilityLabel={m.complete(pct)} />
          <Text variant="bodySmall" color="textSecondary">
            {missing ? m.missing[missing] : m.completeDone}
          </Text>
        </Card>

        <Section title={m.about} empty={!d.bio} emptyText={m.aboutEmpty} addLabel={m.aboutAdd}>
          <Text>{d.bio}</Text>
        </Section>

        <SkillsSection details={d} />

        <Section title={m.seeking}>
          <View style={styles.grid}>
            <Fact label={m.seekingGoal} value={d.goal ? t.options.goal[d.goal] : null} />
            <Fact label={m.seekingArea} value={d.area ? t.options.area[d.area] : null} />
            <Fact label={m.seekingAvailability} value={availabilityLabel(d.availability) || null} />
            <Fact label={m.seekingFormat} value={d.work_format ? t.options.workFormat[d.work_format] : null} />
          </View>
        </Section>

        <Section title={m.experiences} empty={d.experiences.length === 0} emptyText={m.experiencesEmpty} addLabel={m.experiencesAdd}>
          {d.experiences.map((x, i) => (
            <Item
              key={`${x.title}-${i}`}
              icon={Briefcase}
              tone="primary"
              divider={i > 0}
              title={[x.title, x.place].filter(Boolean).join(' · ')}
              subtitle={m.period(x.start, x.end)}
              text={x.description}
            />
          ))}
        </Section>

        <Section
          title={m.education}
          empty={d.education.length === 0 && d.courses.length === 0}
          emptyText={m.educationEmpty}
          addLabel={m.educationAdd}
        >
          {d.education.map((x, i) => (
            <Item
              key={`e-${x.course}-${i}`}
              icon={GraduationCap}
              divider={i > 0}
              title={x.course}
              subtitle={m.educationLine(x.institution, x.status, x.year)}
            />
          ))}
          {d.courses.map((x, i) => (
            <Item
              key={`c-${x.name}-${i}`}
              icon={Award}
              divider={d.education.length > 0 || i > 0}
              title={x.name}
              subtitle={[x.institution, x.year].filter(Boolean).join(' · ') || m.courses}
            />
          ))}
        </Section>

        <Section title={m.languages} empty={d.languages.length === 0} emptyText={m.languagesEmpty} addLabel={m.languagesAdd}>
          {d.languages.map((x, i) => (
            <View key={`${x.language}-${i}`} style={styles.langRow}>
              <Text style={{ flexShrink: 1 }}>{x.language}</Text>
              <Text color="textSecondary">{t.options.languageLevel[x.level]}</Text>
            </View>
          ))}
        </Section>

        <LinksSection details={d} />

        <AverageSection visible={profile.data.show_average !== false} />

        <Achievements />
      </View>
    </ScrollView>
  );
}

/** Capa (foto da pessoa ou formas suaves), voltar e "Editar". */
function Cover({ path, x, y }: { path: string | null; x: number; y: number }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // Sobre uma foto qualquer, os botões ganham fundo para continuar legíveis (contraste AA).
  const onPhoto = path ? { backgroundColor: colors.surface } : null;
  return (
    <CoverImage path={path} x={x} y={y} style={{ height: COVER_HEIGHT + Math.max(insets.top - 44, 0) }}>
      <View style={[styles.coverBar, { paddingTop: Math.max(insets.top, 24) + space[1] }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
          style={[styles.iconButton, onPhoto]}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={iconStroke} />
        </Pressable>
        <Pressable
          onPress={edit}
          accessibilityRole="button"
          accessibilityLabel={m.editProfile}
          style={({ pressed }) => [styles.editButton, onPhoto, pressed && { opacity: 0.7 }]}
        >
          <Pencil size={18} color={colors.primaryInk} strokeWidth={iconStroke} />
          <Text weight="semibold" style={{ color: colors.primaryInk }}>
            {m.edit}
          </Text>
        </Pressable>
      </View>
    </CoverImage>
  );
}

/**
 * Redes no topo do perfil: "abas" pequenas com o logo de cada app (LinkedIn e Instagram).
 * Sem nenhuma: um convite discreto para adicionar, que abre a edição.
 */
function SocialTabs({ linkedin, instagram }: { linkedin: string | null; instagram: string | null }) {
  const { colors } = useTheme();
  const toast = useToast();
  const hasLinkedIn = !!linkedin && isValidLink(linkedin, 'linkedin');
  const handle = instagram ? instagramHandle(instagram) : null;

  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      toast.show(m.openLinkError, 'error');
    }
  };

  if (!hasLinkedIn && !handle) {
    return (
      <Pressable
        onPress={edit}
        accessibilityRole="button"
        hitSlop={4}
        style={({ pressed }) => [styles.socialTab, styles.socialAdd, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
      >
        <Plus size={16} color={colors.primaryInk} strokeWidth={iconStroke} />
        <Text variant="bodySmall" weight="semibold" color="primaryInk">
          {m.socialAdd}
        </Text>
      </Pressable>
    );
  }

  const tab = { backgroundColor: colors.surface, borderColor: colors.border };
  return (
    <View style={styles.socialRow}>
      {hasLinkedIn && (
        <Pressable
          onPress={() => open(linkHref(linkedin))}
          accessibilityRole="link"
          accessibilityLabel={m.socialLinkedInA11y}
          hitSlop={4}
          style={({ pressed }) => [styles.socialTab, tab, pressed && { opacity: 0.7 }]}
        >
          <LinkedInLogo size={20} />
          <Text variant="bodySmall" weight="semibold">
            {m.socialLinkedIn}
          </Text>
        </Pressable>
      )}
      {!!handle && (
        <Pressable
          onPress={() => open(instagramHref(handle))}
          accessibilityRole="link"
          accessibilityLabel={m.socialInstagramA11y(handle)}
          hitSlop={4}
          style={({ pressed }) => [styles.socialTab, tab, pressed && { opacity: 0.7 }]}
        >
          <InstagramLogo size={20} />
          <Text variant="bodySmall" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {`@${handle}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function Meta({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaItem}>
      <Icon size={16} color={colors.textSecondary} strokeWidth={iconStroke} />
      <Text variant="bodySmall" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

/** Card com título. Vazio: frase curta e botão de texto para adicionar (a seção nunca some). */
function Section({
  title,
  children,
  empty,
  emptyText,
  addLabel,
  flush,
}: {
  title: string;
  children?: ReactNode;
  empty?: boolean;
  emptyText?: string;
  addLabel?: string;
  flush?: boolean;
}) {
  return (
    <Card style={[flush ? styles.flush : styles.section]}>
      <Text variant="sectionTitle" accessibilityRole="header" style={flush && styles.flushTitle}>
        {title}
      </Text>
      {empty ? (
        <View style={[{ gap: space[1] }, flush && styles.flushPad]}>
          <Text variant="bodySmall" color="textSecondary">
            {emptyText}
          </Text>
          {!!addLabel && <Button label={addLabel} variant="text" onPress={edit} style={styles.inlineAction} />}
        </View>
      ) : (
        children
      )}
    </Card>
  );
}

function SkillsSection({ details }: { details: ProfileDetails }) {
  const { colors } = useTheme();
  const strengths = useStrengths().data ?? [];
  const skills = highlightSkills(details.skills, strengths);
  const groups = [
    { label: m.skillsBehavioral, items: skills.filter((s) => s.type === 'comportamental') },
    { label: m.skillsTechnical, items: skills.filter((s) => s.type === 'tecnica') },
  ].filter((g) => g.items.length > 0);
  const anyHighlight = skills.some((s) => s.highlighted);

  return (
    <Section title={m.skills} empty={skills.length === 0} emptyText={m.skillsEmpty} addLabel={m.skillsAdd}>
      {groups.map((g) => (
        <View key={g.label} style={{ gap: space[2] }}>
          <Text variant="caption" weight="semibold" color="textSecondary">
            {g.label}
          </Text>
          <View style={styles.wrap}>
            {g.items.map((s) =>
              s.highlighted ? (
                <View
                  key={s.name}
                  accessible
                  accessibilityLabel={m.skillHighlightedA11y(s.name)}
                  style={[styles.skill, { backgroundColor: colors.successSoft, borderColor: colors.successSoft }]}
                >
                  <Check size={14} color={colors.toastSuccessText} strokeWidth={2.25} />
                  <Text variant="bodySmall" weight="semibold" style={{ color: colors.toastSuccessText }}>
                    {s.name}
                  </Text>
                </View>
              ) : (
                <View key={s.name} style={[styles.skill, { borderColor: colors.border }]}>
                  <Text variant="bodySmall" weight="medium">
                    {s.name}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      ))}
      {anyHighlight && (
        <View style={styles.legend}>
          <Check size={14} color={colors.successInk} strokeWidth={2.25} />
          <Text variant="caption" style={{ color: colors.successInk, flexShrink: 1 }}>
            {m.skillsHighlight}
          </Text>
        </View>
      )}
    </Section>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fact, { backgroundColor: colors.background }]}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text weight="semibold" style={{ fontSize: 15, lineHeight: 21 }} color={value ? 'text' : 'textSecondary'}>
        {value ?? m.notInformed}
      </Text>
    </View>
  );
}

function Item({
  icon: Icon,
  tone,
  title,
  subtitle,
  text,
  divider,
}: {
  icon: LucideIcon;
  tone?: 'primary';
  title: string;
  subtitle?: string;
  text?: string;
  divider?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.item, divider && { paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={[styles.itemIcon, { backgroundColor: tone === 'primary' ? colors.primarySoft : colors.background }]}>
        <Icon size={20} color={tone === 'primary' ? colors.primary : colors.text} strokeWidth={iconStroke} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text weight="semibold">{title}</Text>
        {!!subtitle && (
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        )}
        {!!text && <Text variant="bodySmall">{text}</Text>}
      </View>
    </View>
  );
}

function LinksSection({ details }: { details: ProfileDetails }) {
  const { colors } = useTheme();
  const toast = useToast();
  // O LinkedIn fica nas redes do topo; aqui só o portfólio e o atalho de análise.
  const links = [details.portfolio_url].filter((l): l is string => !!l && l.trim().length > 0);

  const open = async (url: string) => {
    try {
      await Linking.openURL(linkHref(url));
    } catch {
      toast.show(m.openLinkError, 'error');
    }
  };

  return (
    <Card style={styles.flush}>
      <Text variant="sectionTitle" accessibilityRole="header" style={styles.flushTitle}>
        {m.links}
      </Text>
      {links.length === 0 && (
        <View style={[styles.flushPad, { gap: space[1] }]}>
          <Text variant="bodySmall" color="textSecondary">
            {m.linksEmpty}
          </Text>
          <Button label={m.linksAdd} variant="text" onPress={edit} style={styles.inlineAction} />
        </View>
      )}
      {links.map((url) => (
        <Pressable
          key={url}
          onPress={() => open(url)}
          accessibilityRole="link"
          accessibilityLabel={m.openLinkA11y(linkLabel(url))}
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        >
          <Link2 size={20} color={colors.text} strokeWidth={iconStroke} />
          <Text style={{ flex: 1, fontSize: 15 }} numberOfLines={1}>
            {linkLabel(url)}
          </Text>
        </Pressable>
      ))}
      <Pressable
        onPress={() => router.push('/linkedin')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.linkRow, { borderTopWidth: 1, borderTopColor: colors.border }, pressed && { opacity: 0.7 }]}
      >
        <Sparkles size={20} color={colors.primaryInk} strokeWidth={iconStroke} />
        <Text weight="semibold" style={{ color: colors.primaryInk, fontSize: 15 }}>
          {m.analyzeLinkedIn}
        </Text>
      </Pressable>
    </Card>
  );
}

/**
 * Nota média (view user_stats) no anel de nota, com a frase gentil da faixa.
 * Aparece por padrão; "Ocultar"/"Mostrar" grava profiles.show_average (vale em qualquer celular).
 */
function AverageSection({ visible }: { visible: boolean }) {
  const toast = useToast();
  const stats = useUserStats().data;
  const update = useUpdateProfile();
  const average = stats?.average_score ?? null;
  const total = stats?.total_completed ?? 0;

  const toggle = () =>
    update.mutate({ show_average: !visible }, { onError: () => toast.show(m.averageSaveError, 'error') });

  return (
    <Card style={styles.section}>
      <View style={styles.completeHead}>
        <Text variant="sectionTitle" accessibilityRole="header" style={{ flexShrink: 1 }}>
          {m.average}
        </Text>
        {/* Sem nota não há o que ocultar. */}
        {(average != null || !visible) && (
          <Button
            label={visible ? m.averageHide : m.averageShow}
            variant="text"
            loading={update.isPending}
            onPress={toggle}
            accessibilityLabel={visible ? m.averageHideA11y : m.averageShowA11y}
            style={styles.headAction}
          />
        )}
      </View>
      {!visible ? (
        <Text variant="bodySmall" color="textSecondary">
          {m.averageHidden}
        </Text>
      ) : average == null ? (
        <Text variant="bodySmall" color="textSecondary">
          {m.averageEmpty}
        </Text>
      ) : (
        <View style={styles.averageRow}>
          <ScoreRing score={average} />
          <Text variant="bodySmall" color="textSecondary" style={{ flex: 1 }}>
            {m.averageHint(total)}
          </Text>
        </View>
      )}
    </Card>
  );
}

/** Conquistas reais: primeira simulação, maior sequência (3 ou 7 dias) e LinkedIn analisado. */
function Achievements() {
  const { colors } = useTheme();
  const stats = useUserStats().data;
  const reports = useLinkedInReports().data;

  const longest = stats?.longest_streak ?? 0;
  const items: { key: string; icon: LucideIcon; bg: string; fg: string; label: string }[] = [];
  if ((stats?.total_completed ?? 0) >= 1) {
    items.push({ key: 'first', icon: MessageCircle, bg: colors.primarySoft, fg: colors.primary, label: m.achievementFirst });
  }
  if (longest >= 3) {
    items.push({ key: 'streak', icon: Flame, bg: colors.warningSoft, fg: colors.streakIcon, label: m.achievementStreak(longest >= 7 ? 7 : 3) });
  }
  if ((reports?.length ?? 0) > 0) {
    items.push({ key: 'linkedin', icon: FileUser, bg: colors.successSoft, fg: colors.successInk, label: m.achievementLinkedIn });
  }

  return (
    <Card style={styles.section}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {m.achievements}
      </Text>
      {items.length === 0 ? (
        <Text variant="bodySmall" color="textSecondary">
          {m.achievementsEmpty}
        </Text>
      ) : (
        <View style={styles.badges}>
          {items.map(({ key, icon: Icon, bg, fg, label }) => (
            <View key={key} accessible accessibilityLabel={label} style={[styles.badge, { backgroundColor: colors.background }]}>
              <View style={[styles.badgeIcon, { backgroundColor: bg }]}>
                <Icon size={20} color={fg} strokeWidth={iconStroke} />
              </View>
              <Text variant="caption" align="center" style={{ fontFamily: fonts.body400 }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  coverBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[2] },
  iconButton: { width: size.minTouch, height: size.minTouch, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  editButton: { minHeight: size.minTouch, paddingHorizontal: 14, borderRadius: radius.chip, flexDirection: 'row', alignItems: 'center', gap: 6 },
  body: { paddingHorizontal: screenPadding, gap: space[4] },
  name: { fontFamily: fonts.heading800, fontSize: 26, lineHeight: 32, flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: space[2], paddingTop: space[1] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  socialTab: {
    minHeight: 40,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
  },
  socialAdd: { alignSelf: 'flex-start', borderStyle: 'dashed', gap: 6 },
  completeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  inlineAction: { alignSelf: 'flex-start', marginHorizontal: -space[4] },
  headAction: { marginVertical: -space[3], marginRight: -space[4] },
  averageRow: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  section: { gap: 14 },
  flush: { padding: 0, overflow: 'hidden' },
  flushTitle: { paddingTop: 18, paddingHorizontal: space[5], paddingBottom: 6 },
  flushPad: { paddingHorizontal: space[5], paddingBottom: space[3] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  skill: {
    minHeight: 36,
    paddingHorizontal: space[3],
    paddingVertical: 6,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  fact: { flexGrow: 1, flexBasis: '45%', padding: space[3], borderRadius: 14, gap: 2 },
  item: { flexDirection: 'row', gap: space[3] },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52, paddingHorizontal: space[5] },
  badges: { flexDirection: 'row', gap: space[2] },
  badge: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: space[3], paddingHorizontal: space[1], borderRadius: 14 },
  badgeIcon: { width: 40, height: 40, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
});
