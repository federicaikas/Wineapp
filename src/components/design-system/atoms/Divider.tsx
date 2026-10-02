import React from 'react';
import './Divider.css';

export interface DividerProps {
  variant?: 'hairline' | 'dashed' | 'ornament' | 'gold';
  symbol?: string;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'hairline',
  symbol = '◆',
  spacing = 'md',
  className = '',
}) => {
  if (variant === 'ornament') {
    return (
      <div className={`cellar-divider-ornament cellar-divider--space-${spacing} ${className}`}>
        <span className="cellar-divider-ornament__line" />
        <span className="cellar-divider-ornament__symbol">{symbol}</span>
        <span className="cellar-divider-ornament__line" />
      </div>
    );
  }

  return (
    <hr
      className={`cellar-divider cellar-divider--${variant} cellar-divider--space-${spacing} ${className}`}
    />
  );
};
