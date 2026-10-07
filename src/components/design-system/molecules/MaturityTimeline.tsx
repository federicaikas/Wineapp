import React from 'react';
import type { DrinkingStatus, WineCategory } from '../../../types/wine';
import './MaturityTimeline.css';

export interface MaturityTimelineProps {
  status: DrinkingStatus;
  category?: WineCategory;
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

const STAGES: Array<{ key: DrinkingStatus; label: string }> = [
  { key: 'aging', label: 'Giovane' },
  { key: 'ready', label: 'Pronto' },
  { key: 'peak', label: 'Apice' },
  { key: 'past', label: 'Vecchio' },
];

const CATEGORY_COLORS: Record<string, string> = {
  red: '#9F0000',
  white: '#FFCC79',      // Giallo schiarito
  sparkling: '#A0A738',  // Verde
  rose: '#E74D6F',       // Rosa elegante
  orange: '#F2542D',     // Arancione schiarito
  dessert: '#B85F00',
};

export const MaturityTimeline: React.FC<MaturityTimelineProps> = ({
  status,
  category = 'red',
  size = 'sm',
  showLabels = true,
  className = '',
}) => {
  const activeIndex = STAGES.findIndex((s) => s.key === status);
  const safeIndex = activeIndex >= 0 ? activeIndex : 1;

  const percentage = (safeIndex / (STAGES.length - 1)) * 100;
  const themeColor = CATEGORY_COLORS[category] || '#6C1A24';

  return (
    <div className={`cellar-maturity-timeline cellar-maturity-timeline--${size} ${className}`}>
      <div className="cellar-maturity-timeline__track-container">
        {/* Traccia di Sfondo */}
        <div className="cellar-maturity-timeline__track" />

        {/* Barra Sfumata: dal Bianco al Colore Pieno della Tipologia di Vino */}
        <div
          className="cellar-maturity-timeline__progress"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #FFFFFF 0%, ${themeColor} 100%)`,
          }}
        />

        {/* Nodi (Puntini) Centrati */}
        <div className="cellar-maturity-timeline__nodes">
          {STAGES.map((stage, idx) => {
            const isActive = idx === safeIndex;
            const isPassed = idx <= safeIndex;
            const nodeLeft = (idx / (STAGES.length - 1)) * 100;
            return (
              <span
                key={stage.key}
                className={`cellar-maturity-timeline__node ${
                  isActive ? 'cellar-maturity-timeline__node--active' : ''
                } ${isPassed ? 'cellar-maturity-timeline__node--passed' : ''}`}
                style={{
                  left: `${nodeLeft}%`,
                  backgroundColor: isPassed ? themeColor : '#E8E5DF',
                  borderColor: isPassed ? themeColor : 'rgba(45, 35, 74, 0.15)',
                }}
                title={stage.label}
              />
            );
          })}
        </div>

        {/* Pallino / Puntatore Attivo Centrato */}
        <div
          className="cellar-maturity-timeline__pointer"
          style={{ left: `${percentage}%` }}
        >
          <div
            className="cellar-maturity-timeline__pin"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 0 0 1.5px ${themeColor}, 0 2px 6px rgba(0, 0, 0, 0.15)`,
            }}
          />
        </div>
      </div>

      {/* Etichette Centrate sulle Parole (Giovane, Pronto, Apice, Vecchio) */}
      {showLabels && (
        <div className="cellar-maturity-timeline__labels-wrap">
          {STAGES.map((stage, idx) => {
            const isActive = idx === safeIndex;
            const labelLeft = (idx / (STAGES.length - 1)) * 100;

            return (
              <span
                key={stage.key}
                className={`cellar-maturity-timeline__label ${
                  isActive ? 'cellar-maturity-timeline__label--active' : ''
                }`}
                style={{
                  left: `${labelLeft}%`,
                  transform: 'translateX(-50%)',
                  color: isActive ? themeColor : undefined,
                }}
              >
                {stage.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
