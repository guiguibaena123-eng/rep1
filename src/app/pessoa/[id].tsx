import { useNetInfo } from '@react-native-community/netinfo';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Award,
  Ban,
  Briefcase,
  ChevronLeft,
  FileUser,
  Flag,
  Flame,
  GraduationCap,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  UserX,
  WifiOff,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, Card, EmptyState, Input, LoadingScreen, Screen, ScreenHeader, Text, useToast } from '@/components';
import { ErrorScreen } from '@/components/ErrorScreen';
import { errorCode, useBlock, usePublicProfile, useReport } from '@/features/explore/api';
import { FollowButton, FollowStats } from '@/features/explore/components';
import { DETAIL_MAX, REPORT_REASONS, type PublicProfile, type ReportReason } from '@/features/explore/types';
import { Avatar } from '@/features/profile/Avatar';
import { CoverImage } from '@/features/profile/CoverImage';
import { availabilityLabel } from '@/features/profile/details';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, screenPadding, size, space } from '@/theme/tokens';

const x = t.explore;
const m = t.myProfile;
const COVER_HEIGHT = 160;
const PHOTO = 96;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.navigate('/explorar');
}

/**
 * T21 Perfil de outra pessoa: só o que é público (nunca e-mail, idade, notas ou respostas).
 * Seguir é a ação principal; o menu ⋯ tem Denunciar e Bloquear. Sem mensagens nesta versão.
 */
export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = usePublicProfile(id);
  const net = useNetInfo();
  const offline = net.isConnected === false || net.isInternetReachable === false;

  if (person.isPending) return <LoadingScreen />;
  if (person.isError) {
    if (offline) {
      return (
        <Unavailable
          icon={WifiOff}
          title={x.offlineTitle}
          text={x.offlineText}
          actionLabel={t.common.tryAgain}
          onAction={() => person.refetch()}
        />
      );
    }
    return (
      <ErrorScreen onRetry={() => person.refetch()} retrying={person.isFetching} secondaryLabel={t.common.back} onSecondary={goBack} />
    );
  }
  // Privado, bloqueado (em qualquer sentido) ou conta apagada: o banco não manda nada.
  if (!person.data) {
    return <Unavailable icon={UserX} title={x.unavailableTitle} text={x.unavailableText} actionLabel={t.common.back} onAction={goBack} />;
  }
  return <PersonView person={person.data} />;
}

function Unavailable(props: { icon: LucideIcon; title: string; text: string; actionLabel: string; onAction: () => void }) {
  return (
    <>
      <ScreenHeader onLeadingPress={goBack} />
      <Screen withHeader>
        <EmptyState {...props} actionVariant="secondary" />
      </Screen>
    </>
  );
}

function PersonView({ person }: { person: PublicProfile }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const block = useBlock();
  const [sheet, setSheet] = useState<'menu' | 'report' | null>(null);

  const firstName = person.name?.trim().split(/\s+/)[0] ?? '';
  const hasPhotoCover = !!person.cover_path;
  const onPhoto = hasPhotoCover ? { backgroundColor: colors.surface } : null;
  const education = [
    ...person.experiences.map((e) => ({ icon: Briefcase, primary: true, title: [e.title, e.place].filter(Boolean).join(' · '), subtitle: m.period(e.start, e.end) })),
    ...person.education.map((e) => ({ icon: GraduationCap, primary: false, title: e.course, subtitle: m.educationLine(e.institution, e.status, e.year) })),
    ...person.courses.map((c) => ({ icon: Award, primary: false, title: c.name, subtitle: [c.institution, c.year].filter(Boolean).join(' · ') || m.courses })),
  ];

  const doBlock = () =>
    block.mutate(person.id, {
      onSuccess: () => {
        setSheet(null);
        toast.show(x.blocked, 'success');
        goBack();
      },
      onError: () => {
        setSheet(null);
        toast.show(x.blockError, 'error');
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, space[5]) + space[8] }}>
        <CoverImage
          path={person.cover_path}
          x={person.cover_x}
          y={person.cover_y}
          style={{ height: COVER_HEIGHT + Math.max(insets.top - 44, 0) }}
        >
          <View style={[styles.coverBar, { paddingTop: Math.max(insets.top, 24) + space[1] }]}>
            <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={t.common.back} style={[styles.iconButton, onPhoto]}>
              <ChevronLeft size={24} color={colors.text} strokeWidth={iconStroke} />
            </Pressable>
            <Pressable
              onPress={() => setSheet('menu')}
              accessibilityRole="button"
              accessibilityLabel={x.moreA11y}
              style={[styles.iconButton, onPhoto]}
            >
              <MoreHorizontal size={24} color={colors.text} strokeWidth={iconStroke} />
            </Pressable>
          </View>
        </CoverImage>

        <View style={[styles.body, { marginTop: -(PHOTO / 2) }]}>
          <View style={{ gap: 10 }}>
            <Avatar name={person.name} photoPath={person.photo_path} size={PHOTO} ring />
            <View style={{ gap: space[1] }}>
              <Text accessibilityRole="header" style={styles.name}>
                {person.name}
              </Text>
              {!!person.username && (
                <Text variant="bodySmall" color="textSecondary">
                  {`@${person.username}`}
                </Text>
              )}
              {!!person.headline && <Text>{person.headline}</Text>}
              <View style={styles.meta}>
                {!!person.city && (
                  <View style={styles.metaItem}>
                    <MapPin size={16} color={colors.textSecondary} strokeWidth={iconStroke} />
                    <Text variant="bodySmall" color="textSecondary">
                      {person.city}
                    </Text>
                  </View>
                )}
              </View>
              <FollowStats
                id={person.id}
                followers={person.followers}
                following={person.following}
                title={person.username ? `@${person.username}` : (person.name ?? '')}
              />
            </View>
          </View>

          <FollowButton id={person.id} name={person.name} following={person.is_following} variant="large" />

          {!!person.bio && (
            <Section title={m.about}>
              <Text>{person.bio}</Text>
            </Section>
          )}

          {person.skills.length > 0 && (
            <Section title={m.skills}>
              <View style={styles.wrap}>
                {person.skills.map((s) => (
                  <View key={s.name} style={[styles.skill, { borderColor: colors.border }]}>
                    <Text variant="bodySmall" weight="medium">
                      {s.name}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <Section title={m.seeking}>
            <View style={styles.grid}>
              <Fact label={m.seekingGoal} value={person.goal ? t.options.goal[person.goal] : null} />
              <Fact label={m.seekingArea} value={person.area ? t.options.area[person.area] : null} />
              {person.availability.length > 0 && <Fact label={m.seekingAvailability} value={availabilityLabel(person.availability)} />}
              {!!person.work_format && <Fact label={m.seekingFormat} value={t.options.workFormat[person.work_format]} />}
            </View>
          </Section>

          {education.length > 0 && (
            <Section title={x.experienceTitle}>
              {education.map((item, i) => (
                <View
                  key={`${item.title}-${i}`}
                  style={[styles.item, i > 0 && { paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: item.primary ? colors.primarySoft : colors.background }]}>
                    <item.icon size={20} color={item.primary ? colors.primary : colors.text} strokeWidth={iconStroke} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text weight="semibold">{item.title}</Text>
                    {!!item.subtitle && (
                      <Text variant="bodySmall" color="textSecondary">
                        {item.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Section>
          )}

          <Achievements person={person} />
        </View>
      </ScrollView>

      {/* Menu ⋯: Denunciar e Bloquear (silencioso) */}
      <BottomSheet visible={sheet === 'menu'} onClose={() => setSheet(null)}>
        <MenuRow icon={Flag} label={x.report} onPress={() => setSheet('report')} />
        <MenuRow icon={Ban} label={x.block(firstName)} danger divider busy={block.isPending} onPress={doBlock} />
        <Text variant="caption" color="textSecondary" style={styles.menuNote}>
          {x.blockNote}
        </Text>
        <Button label={x.cancel} variant="text" onPress={() => setSheet(null)} />
      </BottomSheet>

      <ReportSheet
        visible={sheet === 'report'}
        personId={person.id}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card style={{ gap: 12 }}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Card>
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

/** Conquistas públicas (as mesmas do Meu perfil). Notas das simulações nunca aparecem. */
function Achievements({ person }: { person: PublicProfile }) {
  const { colors } = useTheme();
  const items: { key: string; icon: LucideIcon; bg: string; fg: string; label: string }[] = [];
  if (person.first_simulation) {
    items.push({ key: 'first', icon: MessageCircle, bg: colors.primarySoft, fg: colors.primary, label: m.achievementFirst });
  }
  if (person.streak_badge >= 3) {
    items.push({ key: 'streak', icon: Flame, bg: colors.warningSoft, fg: colors.streakIcon, label: m.achievementStreak(person.streak_badge >= 7 ? 7 : 3) });
  }
  if (person.linkedin_done) {
    items.push({ key: 'linkedin', icon: FileUser, bg: colors.successSoft, fg: colors.successInk, label: m.achievementLinkedIn });
  }
  return (
    <Section title={m.achievements}>
      {items.length === 0 ? (
        <Text variant="bodySmall" color="textSecondary">
          {x.achievementsEmpty}
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
      <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.body400 }}>
        {x.scoresHidden}
      </Text>
    </Section>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  danger,
  divider,
  busy,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
  divider?: boolean;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  const color = danger ? colors.errorInk : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityState={{ busy: !!busy }}
      style={({ pressed }) => [
        styles.menuRow,
        divider && { borderTopWidth: 1, borderTopColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon size={22} color={color} strokeWidth={iconStroke} />
      <Text weight="semibold" style={{ color, flex: 1 }}>
        {busy ? t.common.loading : label}
      </Text>
    </Pressable>
  );
}

/** Denúncia: motivo (obrigatório) + texto opcional. Anônima para a pessoa denunciada. */
function ReportSheet({ visible, personId, onClose }: { visible: boolean; personId: string; onClose: () => void }) {
  const { colors } = useTheme();
  const toast = useToast();
  const report = useReport();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');

  const close = () => {
    setReason(null);
    setDetail('');
    onClose();
  };

  const send = () => {
    if (!reason) return;
    report.mutate(
      { id: personId, reason, detail },
      {
        onSuccess: () => {
          close();
          toast.show(x.reportSent, 'success');
        },
        onError: (err) => toast.show(errorCode(err) === '54000' ? x.reportLimit : x.reportError, 'error'),
      },
    );
  };

  return (
    <BottomSheet visible={visible} onClose={close} placement="center" title={x.reportTitle} description={x.reportText}>
      <View accessibilityRole="radiogroup" accessibilityLabel={x.reportReasonA11y}>
        {REPORT_REASONS.map((r) => {
          const on = reason === r;
          return (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={styles.reason}
            >
              <View style={[styles.radio, { borderColor: on ? colors.primary : colors.textDisabled }]}>
                {on && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={{ flex: 1 }}>{x.reasons[r]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Input label={x.reportDetail} value={detail} onChangeText={setDetail} maxLength={DETAIL_MAX} long />
      <Button label={x.reportSend} onPress={send} disabled={!reason} loading={report.isPending} />
      <Button label={x.cancel} variant="text" onPress={close} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  coverBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[2] },
  iconButton: { width: size.minTouch, height: size.minTouch, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: screenPadding, gap: space[4] },
  name: { fontFamily: fonts.heading800, fontSize: 26, lineHeight: 32 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: space[1], paddingTop: space[1], alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  skill: { minHeight: 36, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.chip, borderWidth: 1, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  fact: { flexGrow: 1, flexBasis: '45%', padding: space[3], borderRadius: 14, gap: 2 },
  item: { flexDirection: 'row', gap: space[3] },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', gap: space[2] },
  badge: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: space[3], paddingHorizontal: space[1], borderRadius: 14 },
  badgeIcon: { width: 40, height: 40, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56 },
  menuNote: { fontFamily: fonts.body400, lineHeight: 18, paddingLeft: 36, marginTop: -space[2], paddingBottom: space[2] },
  reason: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.minTouch },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
