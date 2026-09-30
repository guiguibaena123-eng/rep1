import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { BottomSheet, Button, Text } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, space } from '@/theme/tokens';

import type { StreakMilestone } from './logic';

export type AchievementKind = 'first' | StreakMilestone;

const a = t.achievement;

/** E07 Conquista: caixa no meio da tela com ilustração, título e "Continuar". */
export function AchievementModal({ kind, onClose }: { kind: AchievementKind | null; onClose: () => void }) {
  // Guarda a última conquista para o texto não trocar durante o fade de saída.
  const [last, setLast] = useState<AchievementKind>(kind ?? 'first');
  if (kind !== null && kind !== last) setLast(kind);
  const shown = kind ?? last;

  const copy =
    shown === 'first'
      ? { title: a.firstTitle, text: a.firstText }
      : shown === 7
        ? { title: a.streak7Title, text: a.streak7Text }
        : { title: a.streak3Title, text: a.streak3Text };

  return (
    <BottomSheet
      placement="center"
      centerText
      visible={kind !== null}
      onClose={onClose}
      icon={<Illustration kind={shown} />}
      title={copy.title}
      description={copy.text}
    >
      <Button label={a.continue} onPress={onClose} />
    </BottomSheet>
  );
}

/** Círculos com 🎉 (primeira simulação) ou o número de dias em âmbar (sequência). */
function Illustration({ kind }: { kind: AchievementKind }) {
  const { colors } = useTheme();
  const first = kind === 'first';
  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={150} height={130} viewBox="0 0 150 130">
        <Circle cx={75} cy={68} r={56} fill={first ? colors.primarySoft : colors.warningSoft} />
        <Circle cx={128} cy={22} r={8} fill={colors.primarySoft} />
        <Circle cx={20} cy={30} r={6} fill={colors.successSoft} />
        <Circle cx={130} cy={108} r={5} fill={colors.warningSoft} />
        <Circle cx={75} cy={68} r={34} fill={first ? colors.primary : colors.warning} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {first ? (
          <Text style={styles.emoji}>🎉</Text>
        ) : (
          <Text style={[styles.days, { color: colors.onWarning }]}>{kind}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignSelf: 'center', width: 150, height: 130, marginTop: space[2] },
  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  emoji: { fontSize: 34, lineHeight: 42 },
  days: { fontFamily: fonts.heading800, fontSize: 28, lineHeight: 34 },
});
