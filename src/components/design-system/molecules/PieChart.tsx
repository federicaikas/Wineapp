import React, { useState } from 'react';
import './PieChart.css';

export interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  title: string;
  subtitle?: string;
  emptyText?: string;
  size?: number;
  donutRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  emptyText = 'Nessuna bottiglia registrata',
  size = 240,
  donutRadius = 68,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="cellar-pie-card">
        <h3 className="cellar-pie-card__title">{title}</h3>
        {subtitle && <p className="cellar-pie-card__subtitle">{subtitle}</p>}
        <div className="cellar-pie-card__empty">{emptyText}</div>
      </div>
    );
  }

  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = donutRadius;

  interface SliceItem extends PieChartDataItem {
    percentage: number;
    pathData: string;
    idx: number;
  }

  const { slices } = data.reduce<{ currentAngle: number; slices: SliceItem[] }>(
    (acc, item, idx) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;

      const startAngle = acc.currentAngle;
      const endAngle = acc.currentAngle + angle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1_out = center + outerRadius * Math.cos(startRad);
      const y1_out = center + outerRadius * Math.sin(startRad);
      const x2_out = center + outerRadius * Math.cos(endRad);
      const y2_out = center + outerRadius * Math.sin(endRad);

      const x1_in = center + innerRadius * Math.cos(startRad);
      const y1_in = center + innerRadius * Math.sin(startRad);
      const x2_in = center + innerRadius * Math.cos(endRad);
      const y2_in = center + innerRadius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      let pathData = '';
      if (angle >= 359.99) {
        pathData = `
          M ${center} ${center - outerRadius}
          A ${outerRadius} ${outerRadius} 0 1 1 ${center - 0.01} ${center - outerRadius}
          L ${center - 0.01} ${center - innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
          Z
        `;
      } else {
        pathData = `
          M ${x1_out} ${y1_out}
          A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2_out} ${y2_out}
          L ${x2_in} ${y2_in}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1_in} ${y1_in}
          Z
        `;
      }

      return {
        currentAngle: endAngle,
        slices: [
          ...acc.slices,
          {
            ...item,
            percentage,
            pathData,
            idx,
          },
        ],
      };
    },
    { currentAngle: -90, slices: [] }
  );

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="cellar-pie-card">
      <h3 className="cellar-pie-card__title">{title}</h3>
      {subtitle && <p className="cellar-pie-card__subtitle">{subtitle}</p>}

      <div className="cellar-pie-card__body">
        {/* Grafico SVG Donut */}
        <div className="cellar-pie-card__svg-wrap">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;
              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className={`cellar-pie-slice ${isHovered ? 'cellar-pie-slice--hovered' : ''}`}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Testo centrale Donut */}
          <div className="cellar-pie-card__center-text">
            {activeItem ? (
              <>
                <span className="cellar-pie-center__value">{activeItem.value}</span>
                <span className="cellar-pie-center__label">{activeItem.label}</span>
                <span className="cellar-pie-center__pct">{activeItem.percentage.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <span className="cellar-pie-center__value">{total}</span>
                <span className="cellar-pie-center__label">Bottiglie</span>
              </>
            )}
          </div>
        </div>

        {/* Legenda Sartoriale */}
        <div className="cellar-pie-card__legend">
          {slices.map((slice) => (
            <div
              key={slice.idx}
              className={`cellar-pie-legend-item ${hoveredIdx === slice.idx ? 'cellar-pie-legend-item--active' : ''}`}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="cellar-pie-legend-item__color" style={{ backgroundColor: slice.color }}>
                {slice.icon && <span className="cellar-pie-legend-item__icon">{slice.icon}</span>}
              </div>
              <span className="cellar-pie-legend-item__name">{slice.label}</span>
              <span className="cellar-pie-legend-item__count">{slice.value} btg</span>
              <span className="cellar-pie-legend-item__pct">{slice.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
