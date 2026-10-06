import React from 'react';
import './MainTitleLockup.css';

export interface MainTitleLockupProps {
  primaryLine: string;
  accentFocusLine: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const MainTitleLockup: React.FC<MainTitleLockupProps> = ({
  primaryLine,
  accentFocusLine,
  subtitle,
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`ag-title-lockup ag-title-lockup--${size} ${className}`}>
      <h1 className="ag-title-lockup__heading">
        <span className="ag-title-lockup__primary">{primaryLine}</span>
        <span className="ag-title-lockup__accent">{accentFocusLine}</span>
      </h1>
      {subtitle && <p className="ag-title-lockup__subtitle">{subtitle}</p>}
    </div>
  );
};
