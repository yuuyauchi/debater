import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { DebateScore } from '../utils/scoringLogic';

interface RadarChartProps {
  scores: DebateScore;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const AXIS_LABELS: Record<keyof DebateScore, string> = {
  logic: '論理構造',
  evidence: '証拠力',
  tone: '話し方',
  refutation: '反論力',
  clarity: '構造化',
};

const AXIS_ORDER: (keyof DebateScore)[] = ['logic', 'evidence', 'tone', 'refutation', 'clarity'];

export const RadarChart: React.FC<RadarChartProps> = ({
  scores,
  size = 280,
  color = '#4A90D9',
  backgroundColor = '#E8F4FF',
}) => {
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5; // 同心円の数

  // 角度計算（5軸なので72度ずつ、上から開始）
  const getAngle = (index: number): number => {
    return ((index * 360) / 5 - 90) * (Math.PI / 180);
  };

  // 座標計算
  const getPoint = (index: number, value: number): { x: number; y: number } => {
    const angle = getAngle(index);
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // 背景グリッドのポイント
  const getGridPoints = (level: number): string => {
    const radius = (level / levels) * maxRadius;
    return AXIS_ORDER.map((_, index) => {
      const angle = getAngle(index);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // データポイント
  const dataPoints = AXIS_ORDER.map((axis, index) => getPoint(index, scores[axis]));
  const dataPointsString = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // ラベル位置
  const getLabelPosition = (index: number): { x: number; y: number } => {
    const angle = getAngle(index);
    const radius = maxRadius + 25;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* 背景グリッド（同心五角形） */}
        {[1, 2, 3, 4, 5].map((level) => (
          <Polygon
            key={`grid-${level}`}
            points={getGridPoints(level)}
            fill="none"
            stroke="#D0D0D0"
            strokeWidth={level === 5 ? 1.5 : 0.5}
          />
        ))}

        {/* 軸線 */}
        {AXIS_ORDER.map((_, index) => {
          const endPoint = getPoint(index, 100);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#D0D0D0"
              strokeWidth={0.5}
            />
          );
        })}

        {/* データ多角形 */}
        <Polygon
          points={dataPointsString}
          fill={backgroundColor}
          fillOpacity={0.6}
          stroke={color}
          strokeWidth={2}
        />

        {/* データポイントの円 */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={color}
          />
        ))}

        {/* 軸ラベル */}
        {AXIS_ORDER.map((axis, index) => {
          const labelPos = getLabelPosition(index);
          return (
            <G key={`label-${index}`}>
              <SvgText
                x={labelPos.x}
                y={labelPos.y}
                fontSize={11}
                fontWeight="500"
                fill="#333"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {AXIS_LABELS[axis]}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* スコア表示 */}
      <View style={styles.scoresContainer}>
        {AXIS_ORDER.map((axis) => (
          <View key={axis} style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>{AXIS_LABELS[axis]}</Text>
            <Text style={[styles.scoreValue, getScoreStyle(scores[axis])]}>{scores[axis]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const getScoreStyle = (score: number) => {
  if (score >= 80) return styles.scoreHigh;
  if (score >= 60) return styles.scoreMedium;
  return styles.scoreLow;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreHigh: {
    color: '#4CAF50',
  },
  scoreMedium: {
    color: '#FF9800',
  },
  scoreLow: {
    color: '#F44336',
  },
});

export default RadarChart;
