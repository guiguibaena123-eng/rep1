import { Check, CircleAlert } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, screenPadding, shadowElevated, space } from '@/theme/tokens';

import { Text } from './Text';

type ToastKind = 'success' | 'error';
type ToastData = { id: number; kind: ToastKind; message: string };

type ToastApi = { show: (message: string, kind?: ToastKind) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

const DURATION_MS = 3000;

/** Toast/Success e Toast/Error: aparece no topo por 3s. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, kind: ToastKind = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), kind, message });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && <ToastView key={toast.id} toast={toast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastView({ toast }: { toast: ToastData }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const success = toast.kind === 'success';

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + space[2] }]}>
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(150)}
        accessibilityRole={success ? 'text' : 'alert'}
        accessibilityLiveRegion={success ? 'polite' : 'assertive'}
        style={[
          styles.toast,
          shadowElevated,
          { backgroundColor: success ? colors.successSoft : colors.errorSoft },
        ]}
      >
        {success ? (
          <Check size={20} color={colors.successInk} strokeWidth={2} />
        ) : (
          <CircleAlert size={20} color={colors.errorInk} strokeWidth={2} />
        )}
        <Text
          variant="bodySmall"
          weight="medium"
          style={{ flex: 1, color: success ? colors.toastSuccessText : colors.toastErrorText }}
        >
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: screenPadding, right: screenPadding, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: space[4],
    borderRadius: radius.button,
  },
});
