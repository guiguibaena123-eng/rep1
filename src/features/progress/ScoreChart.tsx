import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

const HEIGHT = 96;
const BASELINE = 86;
/** Faixa vertical das bolinhas: a nota mais alta fica em TOP, a mais baixa em BOTTOM. */
const TOP = 30;
const BOTTOM = 70;
/** Margem lateral para as bolinhas não serem cortadas. */
const SIDE = 10;

/**
 * Linha com as últimas notas (T5 "Sua evolução"). A escala se ajusta às notas,
 * para pequenas melhoras aparecerem. A última nota fica destacada e com o número.
 * O leitor de tela usa o accessibilityLabel do card (as notas por extenso).
 */
export function ScoreChart({ points }: { points: number[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const step = points.length > 1 ? (width - SIDE * 2) / (points.length - 1) : 0;
  const coords = points.map((score, i) => ({
    x: points.length > 1 ? SIDE + i * step : width / 2,
    y: max === min ? (TOP + BOTTOM) / 2 : BOTTOM - ((score - min) / (max - min)) * (BOTTOM - TOP),
  }));
  const last = coords[coords.length - 1];

  return (
    <View
      style={{ height: HEIGHT }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {width > 0 && last && (
        <Svg width={width} height={HEIGHT}>
          <Line x1={0} y1={BASELINE} x2={width} y2={BASELINE} stroke={colors.border} strokeWidth={1} />
          {coords.length > 1 && (
            <Polyline
              points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {coords.slice(0, -1).map((c, i) => (
            <Circle key={i} cx={c.x} cy={c.y} r={4} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />
          ))}
          <Circle cx={last.x} cy={last.y} r={5} fill={colors.primary} />
          <SvgText
            x={last.x}
            y={last.y - 12}
            textAnchor={coords.length > 1 ? 'end' : 'middle'}
            fontFamily={fonts.body600}
            fontSize={12}
            fill={colors.text}
          >
            {String(points[points.length - 1])}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
