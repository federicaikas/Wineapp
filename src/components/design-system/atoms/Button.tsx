import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'cellar-btn',
    `cellar-btn--${variant}`,
    `cellar-btn--${size}`,
    fullWidth ? 'cellar-btn--full' : '',
    loading ? 'cellar-btn--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="cellar-btn__spinner" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="cellar-btn__icon cellar-btn__icon--left">{icon}</span>}
          {children && <span className="cellar-btn__label">{children}</span>}
          {icon && iconPosition === 'right' && <span className="cellar-btn__icon cellar-btn__icon--right">{icon}</span>}
        </>
      )}
    </button>
  );
};
