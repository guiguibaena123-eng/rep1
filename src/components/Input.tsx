import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, iconStroke, radius, size, space } from '@/theme/tokens';

import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Esconde o rótulo visualmente (continua acessível ao leitor de tela). */
  hideLabel?: boolean;
  error?: string | null;
  /** Campo de senha com botão mostrar/ocultar. */
  password?: boolean;
  /** Campo de resposta longo (Input/LongAnswer): multilinha com contador no canto. */
  long?: boolean;
  /** Contador só aparece a partir deste número de caracteres (padrão: sempre). */
  counterFrom?: number;
};

/** Input/Text (Default, Focus, Error) e Input/LongAnswer do design. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hideLabel, error, password, long, counterFrom = 0, maxLength, value, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const hasError = !!error;
  const borderColor = hasError ? colors.error : focused ? colors.primary : colors.border;
  const borderWidth = hasError || focused ? 2 : 1;
  // Compensa a borda mais grossa para o texto não "pular" ao focar.
  const pad = space[4] - (borderWidth - 1);

  const len = value?.length ?? 0;
  const showCounter = long && maxLength !== undefined && len >= counterFrom;

  return (
    <View style={styles.wrapper}>
      <Text
        variant="bodySmall"
        weight="semibold"
        style={hideLabel ? styles.srOnly : undefined}
        nativeID={rest.nativeID ? `${rest.nativeID}-label` : undefined}
      >
        {label}
      </Text>
      <View>
        <TextInput
          ref={ref}
          value={value}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : undefined}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={password && !visible}
          multiline={long}
          textAlignVertical={long ? 'top' : 'center'}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            long ? styles.long : styles.single,
            {
              borderColor,
              borderWidth,
              backgroundColor: colors.surface,
              color: colors.text,
              // No iOS as bolinhas da senha somem com fonte personalizada: usa a fonte do sistema.
              fontFamily: password && !visible ? undefined : fonts.body400,
              paddingLeft: pad,
              paddingRight: password ? 56 : pad,
            },
            long && { paddingTop: pad, paddingBottom: 36 },
          ]}
          {...rest}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? t.input.hidePassword : t.input.showPassword}
            style={styles.eye}
            hitSlop={4}
          >
            {visible ? (
              <EyeOff size={22} color={colors.textSecondary} strokeWidth={iconStroke} />
            ) : (
              <Eye size={22} color={colors.textSecondary} strokeWidth={iconStroke} />
            )}
          </Pressable>
        )}
        {showCounter && (
          <Text variant="caption" color="textSecondary" style={styles.counter} accessibilityLiveRegion="polite">
            {t.input.counter(len, maxLength)}
          </Text>
        )}
      </View>
      {hasError && (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <CircleAlert size={16} color={colors.errorInk} strokeWidth={iconStroke} />
          <Text variant="bodySmall" style={{ color: colors.errorInk, flex: 1 }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  input: { borderRadius: radius.input, fontFamily: fonts.body400, fontSize: 16 },
  single: { minHeight: size.inputHeight },
  long: { minHeight: 6 * 24 + 52, lineHeight: 24 },
  eye: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: size.minTouch,
    height: size.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { position: 'absolute', right: 14, bottom: 12 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
});
