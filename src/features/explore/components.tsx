import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, useToast } from '@/components';
import { Avatar } from '@/features/profile/Avatar';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, size, space } from '@/theme/tokens';

import { errorCode, useFollow } from './api';
import { placeLine, shortLine, topSkills } from './logic';
import type { ExplorePerson } from './types';

const x = t.explore;

export const openPerson = (id: string) => router.push(`/pessoa/${id}`);

/**
 * Seguir / Seguindo. Muda na hora (otimista) e volta atrás com aviso se der erro.
 * small = lista (36 de altura, toque de 48); card = carrossel (largura toda); large = perfil (48).
 */
export function FollowButton({
  id,
  name,
  following,
  variant = 'small',
}: {
  id: string;
  name: string | null;
  following: boolean;
  variant?: 'small' | 'card' | 'large';
}) {
  const { colors } = useTheme();
  const toast = useToast();
  const follow = useFollow();
  const height = variant === 'large' ? size.minTouch : variant === 'card' ? 40 : 36;
  const slop = Math.max(0, (size.minTouch - height) / 2);
  const label = following ? x.following : x.follow;

  const press = () =>
    follow.mutate(
      { id, on: !following },
      {
        onError: (err) =>
          toast.show(errorCode(err) === 'P0002' ? x.unavailableToast : following ? x.unfollowError : x.followError, 'error'),
      },
    );

  return (
    <Pressable
      onPress={press}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole="button"
      accessibilityLabel={x.followA11y(label, name?.trim() || '')}
      accessibilityState={{ selected: following }}
      style={({ pressed }) => [
        styles.follow,
        variant !== 'small' && styles.followWide,
        {
          height,
          borderRadius: variant === 'large' ? radius.button : 12,
          backgroundColor: following ? colors.surface : colors.primary,
          borderColor: following ? colors.border : colors.primary,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {following && variant === 'large' && <Check size={18} color={colors.text} strokeWidth={2} />}
      <Text
        weight="semibold"
        numberOfLines={1}
        style={{ color: following ? colors.text : colors.onPrimary, fontSize: variant === 'small' ? 13 : variant === 'card' ? 14 : 16 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Linha da lista "Pessoas para conhecer": foto, nome, título, cidade · área, até 2 competências e Seguir. */
export function PersonRow({ person }: { person: ExplorePerson }) {
  const { colors } = useTheme();
  const place = placeLine(person);
  const skills = topSkills(person);
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={() => openPerson(person.id)}
        accessibilityRole="button"
        accessibilityLabel={x.personA11y(person.name ?? '', [person.headline, place].filter(Boolean).join('. '))}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={person.name} photoPath={person.photo_path} size={48} />
        <View style={styles.rowText}>
          <Text weight="semibold">{person.name}</Text>
          {!!person.headline && <Text variant="bodySmall">{person.headline}</Text>}
          {!!place && (
            <Text variant="caption" color="textSecondary" style={{ fontFamily: fonts.body400 }}>
              {place}
            </Text>
          )}
          {skills.length > 0 && (
            <View style={styles.skills}>
              {skills.map((s) => (
                <View key={s} style={[styles.skill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text variant="caption" numberOfLines={1}>
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
      <FollowButton id={person.id} name={person.name} following={person.is_following} />
    </View>
  );
}

/** Card do carrossel "Com objetivos parecidos". */
export function PersonCard({ person }: { person: ExplorePerson }) {
  const { colors } = useTheme();
  const line = shortLine(person);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        onPress={() => openPerson(person.id)}
        accessibilityRole="button"
        accessibilityLabel={x.personA11y(person.name ?? '', line)}
        style={({ pressed }) => [styles.cardMain, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={person.name} photoPath={person.photo_path} size={64} />
        <Text weight="semibold" align="center" numberOfLines={2} style={{ fontSize: 15, lineHeight: 20 }}>
          {person.name}
        </Text>
        <Text variant="caption" color="textSecondary" align="center" numberOfLines={2} style={styles.cardLine}>
          {line}
        </Text>
      </Pressable>
      <FollowButton id={person.id} name={person.name} following={person.is_following} variant="card" />
    </View>
  );
}

const styles = StyleSheet.create({
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: space[3],
    borderWidth: 1,
    flexShrink: 0,
  },
  followWide: { alignSelf: 'stretch' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
    paddingVertical: 14,
    paddingLeft: space[4],
    paddingRight: 14,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  rowMain: { flex: 1, minWidth: 0, flexDirection: 'row', gap: space[3] },
  rowText: { flex: 1, minWidth: 0, gap: 3 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: space[1] },
  skill: { minHeight: 26, paddingHorizontal: 10, borderRadius: radius.chip, borderWidth: 1, justifyContent: 'center', maxWidth: '100%' },
  card: {
    width: 168,
    padding: space[4],
    borderRadius: radius.card,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  cardMain: { alignItems: 'center', gap: space[2], alignSelf: 'stretch', flexGrow: 1 },
  cardLine: { fontFamily: fonts.body400, minHeight: 32 },
});
