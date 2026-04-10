import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Text as SvgText, Line } from 'react-native-svg';
import { colors, spacing } from '../../core/theme';

const { width: screenWidth } = Dimensions.get('window');

interface DataPoint {
  label: string;
  value: number;
}

interface CustomBarChartProps {
  data: DataPoint[];
  activeIndex?: number;
  height?: number;
  onBarPress?: (index: number) => void;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  activeIndex = 0,
  height = 160,
  onBarPress,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const paddingBottom = 36; // labels
  const paddingTop = 28; // tooltip space
  const chartHeight = height - paddingBottom - paddingTop;
  const barCount = data.length;
  const totalWidth = screenWidth - spacing.xl * 2 - spacing.md * 2; // account for card padding
  const barWidth = Math.floor((totalWidth / barCount) * 0.55);
  const barGap = Math.floor((totalWidth - barWidth * barCount) / (barCount - 1));

  return (
    <View style={styles.container}>
      <Svg height={height + paddingTop} width="100%">
        <Defs>
          <LinearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0.3" />
          </LinearGradient>
          <LinearGradient id="inactiveGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.textMuted} stopOpacity="0.4" />
            <Stop offset="1" stopColor={colors.textMuted} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        <G y={paddingTop}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 4;
            const x = index * (barWidth + barGap);
            const isActive = index === activeIndex;
            const y = chartHeight - barHeight;

            return (
              <G key={index}>
                {/* Tooltip above active bar */}
                {isActive && item.value > 0 && (
                  <>
                    <Rect
                      x={x - 4}
                      y={y - 28}
                      width={barWidth + 8}
                      height={22}
                      rx={3}
                      fill={colors.primary}
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 12}
                      fill={colors.white}
                      fontSize={10}
                      fontWeight="600"
                      textAnchor="middle">
                      ${item.value.toFixed(0)}
                    </SvgText>
                  </>
                )}

                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx={2}
                  fill={isActive ? 'url(#activeGrad)' : 'url(#inactiveGrad)'}
                  onPress={() => onBarPress?.(index)}
                />

                {/* Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fill={isActive ? colors.text : colors.textMuted}
                  fontSize={11}
                  fontWeight={isActive ? '600' : '400'}
                  textAnchor="middle">
                  {item.label}
                </SvgText>
              </G>
            );
          })}

          {/* Baseline */}
          <Line
            x1={0}
            y1={chartHeight}
            x2={totalWidth}
            y2={chartHeight}
            stroke={colors.border}
            strokeWidth={1}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
  },
});
