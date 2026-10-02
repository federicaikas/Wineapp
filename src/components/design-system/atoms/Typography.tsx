import React from 'react';
import './Typography.css';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 
    | 'display-lg' 
    | 'display-md' 
    | 'headline' 
    | 'title-serif' 
    | 'title-sans' 
    | 'body' 
    | 'body-sm' 
    | 'caption' 
    | 'serif-italic' 
    | 'stamp-mono' 
    | 'vintage-lot';
  as?: React.ElementType;
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'muted' | 'wine' | 'gold' | 'olive';
  className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  children,
  color = 'primary',
  className = '',
  ...props
}) => {
  // Mapping semantico di default se non specificato 'as'
  const Component = as || (() => {
    switch (variant) {
      case 'display-lg': return 'h1';
      case 'display-md': return 'h2';
      case 'headline': return 'h2';
      case 'title-serif': return 'h3';
      case 'title-sans': return 'h4';
      case 'caption': return 'span';
      case 'stamp-mono':
      case 'vintage-lot': return 'span';
      default: return 'p';
    }
  })();

  const classes = [
    'cellar-type',
    `cellar-type--${variant}`,
    `cellar-type--color-${color}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
