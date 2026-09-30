import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { size } from '@/theme/tokens';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto (pode conter links) ao lado da caixa. */
  children: ReactNode;
  accessibilityLabel: string;
};

/** Caixa de 22px com o texto ao lado; a linha toda é tocável (mínimo 48px). */
export function Checkbox({ checked, onChange, children, accessibilityLabel }: CheckboxProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          checked
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: colors.surface, borderColor: colors.textDisabled },
        ]}
      >
        {checked && <Check size={16} color={colors.onPrimary} strokeWidth={3} />}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: size.minTouch },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
});
