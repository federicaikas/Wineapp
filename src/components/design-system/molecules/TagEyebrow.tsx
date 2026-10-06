import React from 'react';
import './TagEyebrow.css';

export interface TagEyebrowProps {
  text: string;
  overlap?: boolean;
  className?: string;
}

export const TagEyebrow: React.FC<TagEyebrowProps> = ({
  text,
  overlap = true,
  className = '',
}) => {
  return (
    <div className={`ag-tag-eyebrow-container ${overlap ? 'ag-tag-eyebrow-container--overlap' : ''} ${className}`}>
      <span className="ag-tag-eyebrow-text">
        {text}
      </span>
    </div>
  );
};
