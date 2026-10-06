import React from 'react';
import './Tag.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'eyebrow' | 'pill' | 'badge';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  variant = 'eyebrow',
  children,
  icon,
  className = '',
  ...props
}) => {
  const classes = [
    'ag-tag',
    `ag-tag--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="ag-tag__icon">{icon}</span>}
      <span className="ag-tag__content">{children}</span>
    </span>
  );
};
