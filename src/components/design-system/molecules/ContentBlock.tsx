import React from 'react';
import './ContentBlock.css';

export interface HighlightTextPart {
  text: string;
  isKeyPhrase?: boolean;
}

export interface ContentBlockProps {
  parts?: HighlightTextPart[];
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
  parts,
  children,
  size = 'md',
  className = '',
}) => {
  return (
    <p className={`ag-content-block ag-content-block--${size} ${className}`}>
      {parts ? (
        parts.map((part, idx) =>
          part.isKeyPhrase ? (
            <strong key={idx} className="ag-content-block__highlight">
              {part.text}
            </strong>
          ) : (
            <span key={idx} className="ag-content-block__support">
              {part.text}
            </span>
          )
        )
      ) : (
        children
      )}
    </p>
  );
};
