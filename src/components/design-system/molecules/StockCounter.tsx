import { Minus, Plus } from 'lucide-react';
import './StockCounter.css';

export interface StockCounterProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const StockCounter: React.FC<StockCounterProps> = ({
  count,
  onIncrement,
  onDecrement,
  label = 'btg.',
  size = 'md',
  disabled = false,
}) => {
  const isOutOfStock = count <= 0;

  return (
    <div className={`cellar-stock-counter cellar-stock-counter--${size} ${isOutOfStock ? 'cellar-stock-counter--depleted' : ''}`}>
      <button
        type="button"
        className="cellar-stock-counter__btn"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        disabled={disabled || count <= 0}
        aria-label="Riduci bottiglie"
      >
        <Minus size={size === 'sm' ? 12 : 14} />
      </button>

      <span className="cellar-stock-counter__text">
        {count} <span className="cellar-stock-counter__unit">{isOutOfStock ? 'esaurito' : label}</span>
      </span>

      <button
        type="button"
        className="cellar-stock-counter__btn"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        disabled={disabled}
        aria-label="Aggiungi bottiglia"
      >
        <Plus size={size === 'sm' ? 12 : 14} />
      </button>
    </div>
  );
};
