import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { shadowElevated } from '@/theme/tokens';

import { Text } from './Text';

export type SegmentTabsProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Seletor em pílula (T3 "Criar conta | Entrar", T11 "Enviar PDF | Colar textos"): a aba ativa fica branca e elevada. */
export function SegmentTabs<T extends string>({ options, value, onChange }: SegmentTabsProps<T>) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="tablist" style={[styles.tabs, { backgroundColor: colors.segmentTrack }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && [{ backgroundColor: colors.surface }, shadowElevated]]}
          >
            <Text weight="semibold" style={{ fontSize: 15, color: selected ? colors.text : colors.textSecondary }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16 },
  tab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
