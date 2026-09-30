import { router } from 'expo-router';
import { Settings, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Card, ScoreRing, Screen, SkeletonCard, Text, useToast } from '@/components';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDateBR } from '@/features/plan/logic';
import { openPremium } from '@/features/plan/navigation';
import { useCancelSubscription, useMySubscription } from '@/features/plan/subscription';
import { useProfile } from '@/features/profile/api';
import { Avatar } from '@/features/profile/Avatar';
import { completeness, detailsFromProfile } from '@/features/profile/details';
import { isPremium } from '@/features/profile/types';
import { verifiedKind } from '@/features/profile/verified';
import { VerifiedBadge } from '@/features/profile/VerifiedBadge';
import { useActivityDates, useUserStats } from '@/features/progress/api';
import { computeStreak } from '@/features/progress/logic';
import { Group, Row } from '@/features/settings/rows';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size, space } from '@/theme/tokens';

const p = t.profile;

const openSettings = () => router.push('/configuracoes');

/**
 * T15 Perfil: quem é a pessoa, plano, progresso e Meu perfil.
 * Aparência, lembrete, privacidade, ajuda e sair ficam em Configurações (engrenagem no topo).
 */
export default function ProfileTab() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const profile = useProfile().data;

  const premium = isPremium(profile);
  const verified = profile ? verifiedKind(session?.user.id, premium) : null;
  const pct = profile ? completeness(detailsFromProfile(profile)).pct : null;

  return (
    <Screen brand>
      <View style={styles.identity}>
        <Avatar name={profile?.name} photoPath={profile?.photo_path} size={64} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, styles.shrink]} accessibilityRole="header" numberOfLines={1}>
              {profile?.name}
            </Text>
            {verified && <VerifiedBadge kind={verified} />}
          </View>
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {session?.user.email}
          </Text>
        </View>
        <View style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text variant="caption" weight="semibold" color="textSecondary">
            {premium ? p.planPremium : p.planFree}
          </Text>
        </View>
        <Pressable
          onPress={openSettings}
          accessibilityRole="button"
          accessibilityLabel={t.settings.title}
          hitSlop={4}
          style={({ pressed }) => [styles.gear, pressed && { opacity: 0.7 }]}
        >
          <Settings size={24} color={colors.text} strokeWidth={iconStroke} />
        </Pressable>
      </View>

      <PlanCard premium={premium} premiumUntil={profile?.premium_until ?? null} />

      <ProgressCard />

      <Group>
        <Row
          icon={User}
          title={p.myProfile}
          subtitle={pct === null ? undefined : p.myProfileText(pct)}
          onPress={() => router.push('/meu-perfil')}
        />      </Group>
    </Screen>
  );
}

/**
 * Seu plano. Com assinatura ativa: "Renova sozinho em DD/MM" + "Cancelar assinatura".
 * REGRA: cancelar não tira o Premium; ele continua até o fim do mês já pago.
 */
function PlanCard({ premium, premiumUntil }: { premium: boolean; premiumUntil: string | null }) {
  const toast = useToast();
  const subscription = useMySubscription().data;
  const cancelSubscription = useCancelSubscription();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const until = premiumUntil ? formatDateBR(premiumUntil) : null;
  const s = t.subscription;

  let subtitle: string | null = null;
  if (premium && subscription?.next_payment_date) subtitle = s.renews(formatDateBR(subscription.next_payment_date));
  else if (premium && subscription === null && until) subtitle = s.notRenewing(until);

  const cancel = async () => {
    setBusy(true);
    try {
      const { premium_until } = await cancelSubscription();
      setConfirmOpen(false); // fecha antes: no iOS o toast fica atrás do Modal
      toast.show(s.cancelled(premium_until ? formatDateBR(premium_until) : until));
    } catch (err) {
      setConfirmOpen(false);
      toast.show(err instanceof ApiError && err.code !== 'INTERNAL' ? err.message : s.cancelError, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="highlight" style={styles.gap12}>
      <View style={{ gap: 2 }}>
        <Text variant="caption" weight="semibold" color="primaryInk">
          {p.planEyebrow}
        </Text>
        <Text variant="sectionTitle">{premium ? p.planPremiumTitle(subscription ? null : until) : p.planFreeTitle}</Text>
        {!!subtitle && (
          <Text variant="bodySmall" color="textOnSoft">
            {subtitle}
          </Text>
        )}
      </View>
      {!premium && <Button label={p.knowPremium} compact onPress={() => openPremium('perfil')} />}
      {premium && subscription && (
        <Button label={s.cancel} variant="text" onPress={() => setConfirmOpen(true)} style={{ alignSelf: 'flex-start', marginLeft: -16 }} />
      )}
      {/* Cancelou: pode voltar a renovar (só paga quando o Premium atual acabar). */}
      {premium && subscription === null && (
        <Button label={t.premium.reactivate} compact variant="secondary" onPress={() => router.push('/premium/pagamento')} />
      )}

      <BottomSheet visible={confirmOpen} onClose={() => setConfirmOpen(false)} title={s.cancelTitle} description={s.cancelText(until)}>
        <Button label={s.keep} onPress={() => setConfirmOpen(false)} />
        <Button label={s.cancelConfirm} variant="text" onPress={cancel} loading={busy} />
      </BottomSheet>
    </Card>
  );
}

/**
 * Meu progresso: a nota média (view user_stats) é o destaque, no anel de nota com a frase gentil da faixa;
 * simulações e dias seguidos (mesma conta da Início) ficam menores ao lado.
 */
function ProgressCard() {
  const { colors } = useTheme();
  const stats = useUserStats();
  const activity = useActivityDates();

  if (stats.isPending || activity.isPending) return <SkeletonCard lines={3} />;

  const streak = activity.data ? computeStreak(activity.data, new Date(activity.dataUpdatedAt)).current : null;
  const average = stats.data?.average_score ?? null;
  const items = [
    { value: stats.data?.total_completed, label: p.statSimulations },
    { value: streak, label: p.statStreak },
  ];

  return (
    <Card style={styles.progress}>
      <Text variant="sectionTitle" accessibilityRole="header">
        {p.progressTitle}
      </Text>
      <View style={styles.progressBody}>
        {average == null ? (
          // Sem nota (ainda sem simulação ou erro): anel vazio com "–", nunca um zero enganoso.
          <View style={styles.ringEmptyWrap} accessible accessibilityLabel={`${p.averageTitle}: ${p.averageEmpty}`}>
            <View style={[styles.ringEmpty, { borderColor: colors.border }]}>
              <Text style={styles.ringEmptyValue} color="textSecondary">
                –
              </Text>
            </View>
            <Text variant="caption" color="textSecondary">
              {p.averageEmpty}
            </Text>
          </View>
        ) : (
          <ScoreRing score={average} />
        )}
        <View style={styles.progressSide}>
          <View style={{ gap: 2 }}>
            <Text weight="semibold">{p.averageTitle}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {average == null ? p.averageEmptyHint : p.averageHint}
            </Text>
          </View>
          {items.map(({ value, label }) => (
            <View
              key={label}
              style={[styles.stat, { backgroundColor: colors.background }]}
              accessible
              accessibilityLabel={value == null ? label : `${value} ${label}`}
            >
              <Text style={styles.statValue}>{value == null ? '–' : String(value)}</Text>
              <Text variant="caption" color="textSecondary" style={styles.shrink}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 8 },
  // O nome é o título desta aba: mesma fonte da marca dos títulos das outras abas.
  name: { fontFamily: fonts.title700, fontSize: 24, lineHeight: 30 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.chip, borderWidth: 1 },
  gap12: { gap: 12 },
  gear: { width: size.minTouch, height: size.minTouch, marginRight: -space[3], alignItems: 'center', justifyContent: 'center' },
  progress: { gap: 14 },
  progressBody: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  progressSide: { flex: 1, gap: space[2] },
  ringEmptyWrap: { alignItems: 'center', gap: 6 },
  ringEmpty: { width: 96, height: 96, borderRadius: radius.chip, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  ringEmptyValue: { fontFamily: fonts.heading800, fontSize: 26, lineHeight: 32 },
  stat: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], paddingVertical: space[2], paddingHorizontal: space[3], borderRadius: radius.button },
  statValue: { fontFamily: fonts.heading800, fontSize: 18, lineHeight: 24 },
});
