import { router } from 'expo-router';
import { CalendarSync, CreditCard, ShieldCheck, XCircle, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, useToast } from '@/components';
import { useContactSupport } from '@/features/plan/contact';
import { deferredFirstCharge, formatDateBR, premiumPriceParts } from '@/features/plan/logic';
import { createSubscription, openCheckout } from '@/features/plan/subscription';
import { useProfile } from '@/features/profile/api';
import { t } from '@/i18n';
import { ApiError } from '@/lib/api';
import { env } from '@/lib/env';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

const pay = t.payment;
const HOW_ICONS: LucideIcon[] = [CreditCard, CalendarSync, XCircle];

/**
 * T17 Assinatura: resumo + "Assinar com cartão" (assinatura da Stripe, renovação mensal).
 * Depois, /premium/retorno acompanha a aprovação. O Premium é liberado pelo SERVIDOR quando
 * a Stripe confirma a cobrança (nunca pelo app).
 */
export default function SubscribeScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { price } = premiumPriceParts(env.premiumPrice);
  const deferred = deferredFirstCharge(useProfile().data?.premium_until);
  const [busy, setBusy] = useState(false);

  const subscribe = async () => {
    setBusy(true);
    try {
      const { subscription_id, checkout_url } = await createSubscription();
      try {
        await openCheckout(checkout_url);
      } catch {
        toast.show(pay.browserError, 'error');
      }
      // A tela seguinte acompanha a assinatura (e deixa voltar ao pagamento, se a pessoa fechou antes).
      router.replace({ pathname: '/premium/retorno', params: { subscription_id, url: checkout_url } });
    } catch (err) {
      toast.show(err instanceof ApiError && err.code !== 'INTERNAL' ? err.message : pay.startError, 'error');
    } finally {
      setBusy(false);
    }
  };

  const contactSupport = useContactSupport();
  const help = () => contactSupport('assinatura');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader leading="back" onLeadingPress={() => router.back()} />
      <Screen
        withHeader
        gap={space[6]}
        contentStyle={{ paddingTop: space[2] }}
        footer={
          <>
            <Button label={pay.pay} onPress={subscribe} loading={busy} />
            <Button label={pay.help} variant="text" onPress={help} />
          </>
        }
      >
        <View style={{ gap: space[2] }}>
          <Text variant="screenTitle" accessibilityRole="header">
            {pay.title}
          </Text>
          <Text color="textSecondary">{pay.subtitle}</Text>
        </View>

        <View style={[styles.amount, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text variant="caption" weight="semibold" color="primaryInk">
            {t.premium.planEyebrow}
          </Text>
          <Text variant="sectionTitle">{pay.amount(price)}</Text>
          {!!deferred && (
            <Text variant="bodySmall" color="textSecondary">
              {pay.deferred(formatDateBR(deferred))}
            </Text>
          )}
          <Text variant="bodySmall" color="textSecondary">
            {pay.otherCurrency}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text weight="semibold" accessibilityRole="header">
            {pay.howTitle}
          </Text>
          {pay.how.map((label, i) => {
            const Icon = HOW_ICONS[i];
            return (
              <View key={label} style={styles.item}>
                <View style={[styles.itemIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon size={18} color={colors.primary} strokeWidth={iconStroke} />
                </View>
                <Text style={{ flex: 1 }}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={20} color={colors.textSecondary} strokeWidth={iconStroke} />
          <Text variant="bodySmall" color="textSecondary" style={{ flex: 1 }}>
            {pay.noRenewal}
          </Text>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { padding: space[5], borderRadius: radius.card, borderWidth: 2, gap: space[1] },
  card: { padding: space[4], borderRadius: radius.card, borderWidth: 1, gap: space[3] },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  itemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  note: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
});
