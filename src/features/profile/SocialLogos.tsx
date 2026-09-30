import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/*
 * Logos das redes no topo do Meu perfil. A Lucide não tem marcas, então são SVGs próprios,
 * nas cores oficiais de cada app (identidade da marca, como o selo de verificado: fora da regra do acento único).
 */

const LINKEDIN_BLUE = '#0A66C2';

/** Quadrado azul com "in" vazado (logo oficial simplificado). */
export function LinkedInLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Rect width={24} height={24} rx={4} fill={LINKEDIN_BLUE} />
      <Path
        fill="#FFFFFF"
        d="M7.1 9.3h-3v10h3v-10Zm-1.5-4.8a1.74 1.74 0 1 0 0 3.48 1.74 1.74 0 0 0 0-3.48ZM19.9 13.7c0-2.7-.6-4.7-3.7-4.7-1.5 0-2.5.8-2.9 1.6h-.1V9.3H10.3v10h3v-5c0-1.3.3-2.6 1.9-2.6s1.6 1.5 1.6 2.7v4.9h3.1v-5.6Z"
      />
    </Svg>
  );
}

/** Quadrado com o degradê do Instagram e a câmera em traço branco. */
export function InstagramLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Defs>
        <LinearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#FEDA75" />
          <Stop offset="0.3" stopColor="#FA7E1E" />
          <Stop offset="0.55" stopColor="#D62976" />
          <Stop offset="0.8" stopColor="#962FBF" />
          <Stop offset="1" stopColor="#4F5BD5" />
        </LinearGradient>
      </Defs>
      <Rect width={24} height={24} rx={6} fill="url(#ig)" />
      <Rect x={5.5} y={5.5} width={13} height={13} rx={4} fill="none" stroke="#FFFFFF" strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={3.1} fill="none" stroke="#FFFFFF" strokeWidth={1.8} />
      <Circle cx={16} cy={8} r={1} fill="#FFFFFF" />
    </Svg>
  );
}
