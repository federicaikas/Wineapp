import React from 'react';
import './WineStatPill.css';

export interface WineStatPillProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'gold' | 'wine' | 'mono';
  className?: string;
}

export const WineStatPill: React.FC<WineStatPillProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}) => {
  return (
    <div className={`cellar-stat-pill cellar-stat-pill--${variant} ${className}`}>
      {icon && <span className="cellar-stat-pill__icon">{icon}</span>}
      <div className="cellar-stat-pill__content">
        <span className="cellar-stat-pill__label">{label}</span>
        <span className="cellar-stat-pill__value">{value}</span>
      </div>
    </div>
  );
};
