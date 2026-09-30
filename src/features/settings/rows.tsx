import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { iconStroke, radius, space } from '@/theme/tokens';

/** Lista agrupada (Perfil e Configurações): cartão branco com borda fina e linhas separadas por divisória. */
export function Group({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

/** Título de seção acima de um grupo (padrão de lista de ajustes do iOS/Android). */
export function GroupTitle({ children }: { children: string }) {
  return (
    <Text variant="bodySmall" weight="semibold" color="textSecondary" accessibilityRole="header" style={styles.groupTitle}>
      {children}
    </Text>
  );
}

/** Linha com ícone, título, subtítulo opcional e seta. */
export function Row({
  icon: Icon,
  title,
  subtitle,
  onPress,
  divider,
  busy,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  divider?: boolean;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || busy}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ busy: !!busy, disabled: !!busy }}
      style={({ pressed }) => [styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }, pressed && { opacity: 0.7 }]}
    >
      <Icon size={22} color={colors.text} strokeWidth={iconStroke} />
      <View style={{ flex: 1 }}>
        <Text weight="semibold">{title}</Text>
        {!!subtitle && (
          <Text variant="bodySmall" color="textSecondary">
            {subtitle}
          </Text>
        )}
      </View>
      {onPress && <ChevronRight size={20} color={colors.textSecondary} strokeWidth={iconStroke} />}
    </Pressable>
  );
}

/** Linha de ação perigosa (apagar conta): texto coral, sem seta. */
export function DangerRow({ icon: Icon, title, onPress, divider }: { icon: LucideIcon; title: string; onPress: () => void; divider?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, divider && { borderTopWidth: 1, borderTopColor: colors.border }, pressed && { opacity: 0.7 }]}
    >
      <Icon size={22} color={colors.errorInk} strokeWidth={iconStroke} />
      <Text weight="semibold" style={{ flex: 1, color: colors.errorInk }}>
        {title}
      </Text>
    </Pressable>
  );
}

/** Linha com chave liga/desliga. A linha inteira é o controle para o leitor de tela. */
export function SwitchRow({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  disabled,
  divider,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
  divider?: boolean;
  /** Conteúdo extra abaixo da linha (ex.: horário do lembrete). */
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.switchWrap, divider && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={styles.switchRow}>
        <Icon size={22} color={colors.text} strokeWidth={iconStroke} />
        <View style={{ flex: 1 }}>
          <Text weight="semibold">{title}</Text>
          {!!subtitle && (
            <Text variant="bodySmall" color="textSecondary">
              {subtitle}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          disabled={disabled}
          onValueChange={onChange}
          trackColor={{ false: colors.dotInactive, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.dotInactive}
          accessibilityLabel={title}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  groupTitle: { paddingHorizontal: space[1], marginBottom: -space[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: space[4], minHeight: 56 },
  switchWrap: { paddingVertical: 14, paddingHorizontal: space[4], gap: space[3] },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
