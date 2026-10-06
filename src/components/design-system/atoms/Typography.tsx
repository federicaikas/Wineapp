import React from 'react';
import './Typography.css';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 
    | 'display-lg' 
    | 'display-md' 
    | 'headline' 
    | 'title-serif' 
    | 'serif-title'
    | 'title-sans' 
    | 'body' 
    | 'body-sm' 
    | 'caption' 
    | 'eyebrow'
    | 'serif-italic' 
    | 'stamp-mono' 
    | 'vintage-lot';
  as?: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'muted' | 'wine' | 'gold' | 'olive';
  className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  size,
  children,
  color = 'primary',
  className = '',
  ...props
}) => {
  const normalizedVariant = variant === 'serif-title' ? 'title-serif' : variant;

  const Component = as || (() => {
    switch (normalizedVariant) {
      case 'display-lg': return 'h1';
      case 'display-md': return 'h2';
      case 'headline': return 'h2';
      case 'title-serif': return 'h3';
      case 'title-sans': return 'h4';
      case 'eyebrow': return 'span';
      case 'caption': return 'span';
      case 'stamp-mono':
      case 'vintage-lot': return 'span';
      default: return 'p';
    }
  })();

  const classes = [
    'cellar-type',
    `cellar-type--${normalizedVariant}`,
    size ? `cellar-type--size-${size}` : '',
    `cellar-type--color-${color}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

