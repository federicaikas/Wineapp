import React from 'react';
import type { WineBottle } from '../../types/wine';
import { WineCard } from '../organisms/WineCard';
import { Button, Typography, EmptyState } from '../design-system';
import { ArrowLeft, Wine, Sparkles } from 'lucide-react';
import './UncorkedWinesPage.css';

export interface UncorkedWinesPageProps {
  wines: WineBottle[];
  onBack: () => void;
  onSelectWine: (wine: WineBottle) => void;
  onEditWine: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
}

export const UncorkedWinesPage: React.FC<UncorkedWinesPageProps> = ({
  wines,
  onBack,
  onSelectWine,
  onEditWine,
  onStockChange,
  onToggleFavorite,
}) => {
  // Filtra solo le bottiglie che sono state stappate almeno una volta (uncorkedCount > 0 oppure stock === 0)
  const uncorkedWines = wines.filter(
    (w) => (w.uncorkedCount && w.uncorkedCount > 0) || w.stock === 0
  );

  const totalUncorkedBottles = wines.reduce((sum, w) => sum + (w.uncorkedCount || (w.stock === 0 ? 1 : 0)), 0);

  return (
    <div className="cellar-uncorked-page">
      <div className="cellar-uncorked-page__container">
        {/* Intestazione Editoriale Pagina */}
        <div className="cellar-uncorked-page__header">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            className="cellar-uncorked-page__back-btn"
          >
            Torna alla Cantina
          </Button>

          <div className="cellar-uncorked-page__title-lockup">
            <div className="cellar-uncorked-page__icon-badge">
              <Wine size={26} />
            </div>
            <div>
              <Typography variant="serif-title" size="lg" className="cellar-uncorked-page__title">
                Bottiglie Stappate
              </Typography>
              <Typography variant="body-sm" color="muted">
                Registro storico delle degustazioni e bottiglie stappate in cantina ({totalUncorkedBottles} stappate in totale)
              </Typography>
            </div>
          </div>
        </div>

        {/* Griglia Bottiglie Stappate */}
        {uncorkedWines.length === 0 ? (
          <EmptyState
            title="Nessuna bottiglia stappata finora"
            description="Quando stapperai una bottiglia col pulsante 'Bottiglia Stappata', verrà inserita automaticamente in questa sezione."
            actionLabel="Torna alla Cantina"
            onAction={onBack}
          />
        ) : (
          <div className="cellar-uncorked-page__grid">
            {uncorkedWines.map((wine) => (
              <div key={wine.id} className="cellar-uncorked-card-wrapper">
                <div className="cellar-uncorked-badge-tag">
                  <Sparkles size={13} />
                  <span>Stappata {wine.uncorkedCount || 1} {wine.uncorkedCount === 1 ? 'volta' : 'volte'}</span>
                </div>
                <WineCard
                  wine={wine}
                  onSelect={onSelectWine}
                  onEdit={onEditWine}
                  onStockChange={onStockChange}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
