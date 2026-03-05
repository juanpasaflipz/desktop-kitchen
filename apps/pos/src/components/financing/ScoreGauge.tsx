import React from 'react';
import { useTranslation } from 'react-i18next';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
}

function getColor(score: number): string {
  if (score >= 65) return '#22c55e'; // green-500
  if (score >= 45) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

function getLabel(score: number, t: (key: string) => string): string {
  if (score >= 80) return t('profile.score.excellent');
  if (score >= 65) return t('profile.score.good');
  if (score >= 45) return t('profile.score.building');
  return t('profile.score.needsImprovement');
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 180 }) => {
  const { t } = useTranslation('financing');
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getColor(clampedScore);
  const label = getLabel(clampedScore, t);

  // SVG semi-circle gauge
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size / 2 - 16;
  const strokeWidth = 12;

  // Arc from 180° to 0° (left to right, semi-circle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalArc = Math.PI; // 180 degrees
  const fillArc = totalArc * (clampedScore / 100);

  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy + radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy + radius * Math.sin(endAngle);

  const fillAngle = startAngle - fillArc;
  const fillX = cx + radius * Math.cos(fillAngle);
  const fillY = cy + radius * Math.sin(fillAngle);
  const largeArc = fillArc > Math.PI ? 1 : 0;

  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`;
  const fillPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${largeArc} 1 ${fillX} ${fillY}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {clampedScore > 0 && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="-mt-12 text-center">
        <p className="text-lg font-bold" style={{ color }}>{label}</p>
      </div>
    </div>
  );
};

export default ScoreGauge;
