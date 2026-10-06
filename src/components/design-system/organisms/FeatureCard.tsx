import React from 'react';
import { Tag } from '../atoms/Tag';
import { Button } from '../atoms/Button';
import './FeatureCard.css';

export interface FeatureCardCategoryCount {
  category: 'red' | 'white' | 'sparkling' | 'rose' | 'orange' | 'dessert' | string;
  label: string;
  count: number;
}

export interface FeatureCardProps {
  badgeText?: string;
  categoryCounts?: FeatureCardCategoryCount[];
  totalBadge?: string | number;
  title: string;
  description?: string;
  highlightText?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
  accentBorder?: boolean;
  variant?: 'default' | 'purple' | 'green';
  className?: string;
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  badgeText,
  categoryCounts,
  totalBadge,
  title,
  description,
  highlightText,
  icon,
  actionText,
  onAction,
  onClick,
  style,
  accentBorder = true,
  variant = 'default',
  className = '',
  children,
}) => {
  return (
    <div
      className={`ag-feature-card ${accentBorder ? 'ag-feature-card--accent-border' : ''} ag-feature-card--${variant} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {/* Header Top con Badge, Ripartizione Categorie e Box Totale sulla Destra */}
      <div className="ag-feature-card__top-bar">
        {badgeText && (
          <div className="ag-feature-card__badge-wrapper">
            <Tag variant="badge">{badgeText}</Tag>
          </div>
        )}

        {categoryCounts && categoryCounts.length > 0 && (
          <div className="ag-feature-card__categories">
            {categoryCounts.map((item) =>
              item.count > 0 ? (
                <span
                  key={item.category}
                  className={`ag-feature-card__cat-pill ag-feature-card__cat-pill--${item.category}`}
                  title={`${item.count} ${item.label}`}
                >
                  <strong>{item.count}</strong>
                </span>
              ) : null
            )}
          </div>
        )}

        {totalBadge !== undefined && (
          <div className="ag-feature-card__total-box">
            Totale: {totalBadge}
          </div>
        )}
      </div>

      {icon && <div className="ag-feature-card__icon">{icon}</div>}

      <h3 className="ag-feature-card__title">{title}</h3>

      {(highlightText || description) && (
        <p className="ag-feature-card__description">
          {highlightText && (
            <strong className="ag-feature-card__highlight">{highlightText} </strong>
          )}
          {description && <span className="ag-feature-card__text">{description}</span>}
        </p>
      )}

      {children}

      {actionText && (
        <div className="ag-feature-card__action">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
