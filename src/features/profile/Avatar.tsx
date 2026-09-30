import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Skeleton, Text } from '@/components';
import { t } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { usePhotoUrl } from './photo';
import { initials } from './types';

export type AvatarProps = {
  name: string | null | undefined;
  photoPath: string | null | undefined;
  /** 64 (T15), 88 (T19) ou 104 (T18). */
  size: number;
  /** Foto recém-escolhida, ainda no celular: aparece na hora, antes do link do servidor. */
  localUri?: string | null;
  /** Mostra o skeleton (foto sendo enviada). */
  loading?: boolean;
  /** Borda da cor do fundo (a T18 põe a foto por cima da capa). */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Foto de perfil redonda; sem foto, as iniciais em índigo suave (mesma regra na T15, T18 e T19). */
export function Avatar({ name, photoPath, size, localUri, loading, ring, style }: AvatarProps) {
  const { colors } = useTheme();
  const url = usePhotoUrl(localUri ? null : photoPath);
  const uri = localUri ?? url.data ?? null;
  const border = ring ? 4 : 0;
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const who = name?.trim() || '';

  if (loading || (photoPath && !uri && url.isPending)) {
    return (
      <View style={[shape, styles.clip, style]}>
        <Skeleton width={size} height={size} />
      </View>
    );
  }

  if (uri) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t.myProfile.photoA11y(who)}
        style={[shape, styles.clip, { borderWidth: border, borderColor: colors.background, backgroundColor: colors.primarySoft }, style]}
      >
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} cachePolicy="memory-disk" />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t.myProfile.noPhotoA11y(who)}
      style={[
        shape,
        styles.center,
        { backgroundColor: colors.primarySoft, borderWidth: border, borderColor: colors.background },
        style,
      ]}
    >
      <Text style={{ fontFamily: fonts.heading800, fontSize: Math.round(size * 0.32), lineHeight: Math.round(size * 0.42), color: colors.primaryInk }}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
