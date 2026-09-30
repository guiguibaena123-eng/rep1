import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, size, space } from '@/theme/tokens';

import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 'radio' para escolha única (padrão), 'checkbox' para múltipla. */
  role?: 'radio' | 'checkbox';
  /** Altura visual: 40 (padrão), 44 (T4/T6) ou 56 (lista de objetivo da T4). */
  height?: 40 | 44 | 48 | 56;
  /** Mostra o ícone de check quando selecionado (Chip/Selected da biblioteca). */
  showCheck?: boolean;
  /** Ocupa a largura toda e alinha o texto à esquerda (lista de objetivos da T4). */
  block?: boolean;
  /** Estilo extra do chip (ex.: flex: 1 para dividir a largura em colunas iguais). */
  style?: StyleProp<ViewStyle>;
  /** Ícone antes do texto (ex.: ✨ no "Para você" da T13). */
  icon?: ReactNode;
};

/**
 * Chip/Selected e Chip/Default.
 * Altura visual 40, mas área de toque de 48 (hitSlop invisível).
 */
export function Chip({ label, selected, onPress, role = 'radio', height = 40, showCheck, block, style, icon }: ChipProps) {
  const { colors } = useTheme();
  const slop = Math.max(0, (size.minTouch - height) / 2);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop }}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        block && styles.block,
        {
          minHeight: height,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          paddingHorizontal: block ? space[5] : space[4],
        },
        style,
      ]}
    >
      {showCheck && selected && <Check size={16} color={colors.onPrimary} strokeWidth={2} />}
      {icon}
      <Text
        variant={height >= 48 ? 'body' : 'bodySmall'}
        weight={selected || height >= 48 ? 'semibold' : 'medium'}
        style={{ color: selected ? colors.onPrimary : colors.text, fontSize: height === 44 ? 15 : undefined }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  block: { justifyContent: 'flex-start', alignSelf: 'stretch' },
});
