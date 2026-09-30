import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

import { Button, type ButtonVariant } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** primary quando o botão é o próximo passo natural (ex.: "Fazer a primeira"); secondary para atalhos. */
  actionVariant?: Exclude<ButtonVariant, 'text'>;
};

/** E06 Estados vazios: card com ícone num círculo, título, frase curta e um botão. */
export function EmptyState({ icon: Icon, title, text, actionLabel, onAction, actionVariant = 'primary' }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.circle, { backgroundColor: colors.primarySoft }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon size={28} color={colors.primary} strokeWidth={iconStroke} />
      </View>
      <Text variant="sectionTitle" align="center" accessibilityRole="header">
        {title}
      </Text>
      {text && (
        <Text variant="bodySmall" color="textSecondary" align="center">
          {text}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={actionVariant}
          compact
          fullWidth={false}
          style={{ marginTop: space[1] }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: 28,
    paddingHorizontal: space[6],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  circle: { width: 64, height: 64, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },
});
