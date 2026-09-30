import { RefreshCw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

import { Button } from './Button';
import { Screen } from './Screen';
import { Text } from './Text';

export type ErrorScreenProps = {
  title?: string;
  text?: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** Ação secundária opcional (ex.: "Voltar ao início", "Sair"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/** E03 Erro geral: ilustração simples, "Algo deu errado do nosso lado" e "Tentar de novo". */
export function ErrorScreen({
  title = t.states.errorTitle,
  text = t.states.errorText,
  onRetry,
  retrying,
  secondaryLabel,
  onSecondary,
}: ErrorScreenProps) {
  const { colors } = useTheme();
  return (
    <Screen
      scroll={false}
      footer={
        <>
          {onRetry && (
            <Button
              label={t.common.tryAgain}
              onPress={onRetry}
              loading={retrying}
              icon={<RefreshCw size={18} color={colors.onPrimary} strokeWidth={2} />}
            />
          )}
          {!!secondaryLabel && onSecondary && <Button label={secondaryLabel} variant="text" onPress={onSecondary} />}
        </>
      }
    >
      <View style={styles.center}>
        <Svg width={140} height={120} viewBox="0 0 140 120" accessibilityElementsHidden importantForAccessibility="no">
          <Circle cx={70} cy={60} r={52} fill={colors.primarySoft} />
          <Circle cx={112} cy={24} r={10} fill={colors.warningSoft} />
          <Path d="M50 70c6-8 34-8 40 0" stroke={colors.primary} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Circle cx={56} cy={50} r={5} fill={colors.primary} />
          <Circle cx={84} cy={50} r={5} fill={colors.primary} />
        </Svg>
        <Text variant="screenTitle" align="center" accessibilityRole="header">
          {title}
        </Text>
        <Text color="textSecondary" align="center">
          {text}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 16 },
});
