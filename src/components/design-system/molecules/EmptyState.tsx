import React from 'react';
import { Wine, Plus, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import './EmptyState.css';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nessuna bottiglia trovata',
  description = 'La tua collezione enologica è pronta per accogliere nuovi cru d’eccellenza e gemme da custodire nel tempo.',
  actionLabel = 'Aggiungi una Bottiglia',
  onAction,
  icon,
}) => {
  return (
    <div className="cellar-empty-state">
      <div className="cellar-empty-state__motif">
        {icon || (
          <div className="cellar-empty-state__icon-box">
            <Wine size={36} strokeWidth={1.25} />
            <div className="cellar-empty-state__seal">
              <Sparkles size={14} />
            </div>
          </div>
        )}
      </div>

      <h3 className="cellar-empty-state__title">{title}</h3>
      <p className="cellar-empty-state__desc">{description}</p>

      {onAction && actionLabel && (
        <div className="cellar-empty-state__action">
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
