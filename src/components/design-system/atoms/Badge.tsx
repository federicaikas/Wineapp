import React from 'react';
import './Badge.css';

export type WineCategory = 'red' | 'white' | 'sparkling' | 'rose' | 'orange' | 'dessert';
export type DrinkingStatus = 'ready' | 'aging' | 'peak' | 'past';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'wine-type'
    | 'drinking-status'
    | 'vintage'
    | 'lot'
    | 'neutral'
    | 'gold-seal'
    | 'wax-seal';
  category?: WineCategory;
  status?: DrinkingStatus;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  category,
  status,
  children,
  icon,
  size = 'md',
  className = '',
  ...props
}) => {
  const classes = [
    'cellar-badge',
    `cellar-badge--${variant}`,
    category ? `cellar-badge--type-${category}` : '',
    status ? `cellar-badge--status-${status}` : '',
    `cellar-badge--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="cellar-badge__icon">{icon}</span>}
      <span className="cellar-badge__text">{children}</span>
    </span>
  );
};
