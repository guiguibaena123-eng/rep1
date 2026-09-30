import { router, useLocalSearchParams } from 'expo-router';
import { Crown, FileUser, Lightbulb, MessageCircle, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, EmptyState, Screen, ScreenHeader, Text } from '@/components';
import { formatDateBR, premiumPriceParts } from '@/features/plan/logic';
import { useMySubscription } from '@/features/plan/subscription';
import { useProfile } from '@/features/profile/api';
import { isPremium } from '@/features/profile/types';
import { t } from '@/i18n';
import { env } from '@/lib/env';
import { track } from '@/lib/events';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, space } from '@/theme/tokens';

const pr = t.premium;
const ICONS: LucideIcon[] = [MessageCircle, FileUser, Lightbulb, TrendingUp, Sparkles];

/** T16 Premium: benefícios, preço (EXPO_PUBLIC_PREMIUM_PRICE, no formato do idioma) e "Quero o Premium" → T17. */
export default function PremiumScreen() {
  const { colors } = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const profile = useProfile().data;
  const premium = isPremium(profile);
  // undefined = carregando; null = sem assinatura ativa (ex.: cancelou ou Premium de cortesia).
  const subscription = useMySubscription().data;
  const { price, period } = premiumPriceParts(env.premiumPrice);

  // Métrica: conta 1 vez por abertura, só para quem ainda não é Premium.
  const logged = useRef(false);
  useEffect(() => {
    if (logged.current || !profile || premium) return;
    logged.current = true;
    track('paywall_viewed', { from: from ?? 'outro' });
  }, [profile, premium, from]);

  const close = () => router.back();

  if (premium) {
    const renew = subscription?.next_payment_date
      ? pr.alreadyRenews(formatDateBR(subscription.next_payment_date))
      : subscription === null
        ? pr.alreadyNoRenew
        : '';
    const until = profile?.premium_until ? pr.alreadyUntil(formatDateBR(profile.premium_until)) : pr.alreadyNoDate;
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader leading="close" onLeadingPress={close} />
        <Screen withHeader>
          <View style={{ gap: space[3] }}>
            <EmptyState
              icon={Crown}
              title={pr.alreadyTitle}
              text={[subscription ? '' : until, renew, pr.alreadyText].filter(Boolean).join(' ')}
              actionLabel={pr.alreadyBack}
              onAction={close}
            />
            {/* Cancelou (ou tem Premium de cortesia): pode voltar a renovar; só paga quando o Premium atual acabar. */}
            {subscription === null && (
              <Button label={pr.reactivate} variant="secondary" onPress={() => router.push('/premium/pagamento')} />
            )}
          </View>
        </Screen>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader leading="close" onLeadingPress={close} />
      <Screen
        withHeader
        gap={space[6]}
        contentStyle={{ paddingTop: space[2] }}
        footer={
          <>
            <Button
              label={pr.cta}
              onPress={() => {
                track('premium_cta_clicked', { from: from ?? 'outro' });
                router.push('/premium/pagamento');
              }}
            />
            <Text variant="bodySmall" color="textSecondary" align="center">
              {pr.noLockIn}
            </Text>
            <Button label={pr.notNow} variant="text" onPress={close} />
          </>
        }
      >
        <View style={{ gap: space[2] }}>
          <Text variant="display" accessibilityRole="header">
            {pr.title}
          </Text>
          <Text color="textSecondary">{pr.subtitle}</Text>
        </View>

        <View style={{ gap: 14 }} accessibilityRole="list">
          {pr.benefits.map((label, i) => {
            const Icon = ICONS[i];
            return (
              <View key={label} style={styles.benefit} accessible accessibilityLabel={label}>
                <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon size={20} color={colors.primary} strokeWidth={iconStroke} />
                </View>
                <Text style={{ flex: 1 }}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View
          style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          accessible
          accessibilityLabel={pr.priceA11y(price, period)}
        >
          <Text variant="caption" weight="semibold" color="primaryInk">
            {pr.planEyebrow}
          </Text>
          <Text style={styles.price}>
            {price}
            {!!period && (
              <Text color="textSecondary" style={styles.period}>
                {` ${period}`}
              </Text>
            )}
          </Text>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  priceCard: { padding: space[5], borderRadius: radius.card, borderWidth: 2, gap: space[1] },
  price: { fontFamily: fonts.heading800, fontSize: 28, lineHeight: 34 },
  period: { fontFamily: fonts.body400, fontSize: 16, lineHeight: 24 },
});
