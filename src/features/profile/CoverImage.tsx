import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Skeleton } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';

import { usePhotoUrl } from './photo';

export type CoverImageProps = {
  /** Caminho no bucket; null = capa padrão com formas suaves. */
  path: string | null | undefined;
  /** Capa recém-escolhida, ainda no celular: aparece na hora. */
  localUri?: string | null;
  /** Mostra o skeleton (capa sendo enviada). */
  loading?: boolean;
  /** Parte da imagem que aparece, em % (50 = centro). */
  x?: number;
  y?: number;
  style?: StyleProp<ViewStyle>;
  /** Botões por cima da capa (voltar, editar, trocar). */
  children?: ReactNode;
};

/**
 * Capa do "Meu perfil": a foto escolhida pela pessoa ou, sem foto, as formas do design.
 * É decorativa: o leitor de tela ignora a imagem e lê só os botões por cima.
 */
export function CoverImage({ path, localUri, loading, x = 50, y = 50, style, children }: CoverImageProps) {
  const { colors } = useTheme();
  const url = usePhotoUrl(localUri ? null : path);
  const uri = localUri ?? url.data ?? null;
  const waiting = loading || (!!path && !uri && url.isPending);

  return (
    <View style={[styles.cover, { backgroundColor: colors.primarySoft }, style]}>
      {waiting ? (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width="100%" height="100%" radius={0} />
        </View>
      ) : uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ left: `${x}%`, top: `${y}%` }}
          transition={150}
          cachePolicy="memory-disk"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : (
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 176"
          preserveAspectRatio="xMidYMid slice"
          style={StyleSheet.absoluteFill}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Circle cx={340} cy={40} r={70} fill={colors.primary} opacity={0.12} />
          <Circle cx={40} cy={170} r={46} fill={colors.successSoft} />
          <Circle cx={290} cy={150} r={14} fill={colors.warningSoft} />
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden' },
});
