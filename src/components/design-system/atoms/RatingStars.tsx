import React from 'react';
import { Star } from 'lucide-react';
import './RatingStars.css';

export interface RatingStarsProps {
  value: number; // 1 to 5
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  score100?: number; // punteggio 100 punti (es. 95/100)
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  showScore = false,
  score100,
}) => {
  return (
    <div className={`cellar-rating cellar-rating--${size}`}>
      <div className="cellar-rating__stars">
        {Array.from({ length: max }, (_, i) => {
          const starVal = i + 1;
          const isFilled = starVal <= value;
          return (
            <button
              type="button"
              key={i}
              className={`cellar-rating__star ${isFilled ? 'cellar-rating__star--filled' : ''} ${interactive ? 'cellar-rating__star--interactive' : ''}`}
              onClick={() => interactive && onChange && onChange(starVal)}
              disabled={!interactive}
              aria-label={`${starVal} di ${max} stelle`}
            >
              <Star
                className="cellar-rating__icon"
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="cellar-rating__text">
          {value.toFixed(1)} / {max}
        </span>
      )}

      {score100 !== undefined && (
        <span className="cellar-rating__score100">
          <span className="cellar-rating__score-num">{score100}</span>
          <span className="cellar-rating__score-label">PTS</span>
        </span>
      )}
    </div>
  );
};
