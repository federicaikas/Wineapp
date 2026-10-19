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

const TAG_MAP: Record<string, React.ElementType> = {
  'display-lg': 'h1',
  'display-md': 'h2',
  'headline': 'h2',
  'title-serif': 'h3',
  'title-sans': 'h4',
  'eyebrow': 'span',
  'caption': 'span',
  'stamp-mono': 'span',
  'vintage-lot': 'span',
  'body': 'p',
  'body-sm': 'p',
  'serif-italic': 'p',
};

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
  const Component = as || TAG_MAP[normalizedVariant] || 'p';

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

