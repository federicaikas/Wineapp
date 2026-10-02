import React from 'react';
import { Button } from '../design-system';
import type { CellarStats } from '../../types/wine';
import { Plus, Wine, RotateCcw, Heart } from 'lucide-react';
import './CellarHeader.css';

export interface CellarHeaderProps {
  stats: CellarStats;
  onOpenAdd: () => void;
  onResetSeed: () => void;
  filterFavoritesOnly: boolean;
  onToggleFilterFavorites: () => void;
}

export const CellarHeader: React.FC<CellarHeaderProps> = ({
  stats,
  onOpenAdd,
  onResetSeed,
  filterFavoritesOnly,
  onToggleFilterFavorites,
}) => {
  const formattedCellarValue = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(stats.totalEstimatedValue);

  return (
    <header className="cellar-masthead">
      <div className="cellar-masthead__container">
        {/* Brand & Monogramma */}
        <div className="cellar-masthead__brand">
          <div className="cellar-masthead__seal">
            <Wine size={20} className="cellar-masthead__seal-icon" />
          </div>

          <div className="cellar-masthead__brand-text">
            <div className="cellar-masthead__meta">
              <span className="cellar-masthead__stamp">ARCHIVIO PRIVATO N° 0482</span>
              <span className="cellar-masthead__sep">•</span>
              <span className="cellar-masthead__date">COLLEZIONE ENOLOGICA</span>
            </div>
            <h1 className="cellar-masthead__title">CELLAR</h1>
          </div>
        </div>

        {/* Metriche Rapide & Azioni Header */}
        <div className="cellar-masthead__actions">
          {/* Badge Valore Cantina */}
          <div className="cellar-masthead__value-pill">
            <span className="cellar-masthead__value-label">Valore Stimato</span>
            <span className="cellar-masthead__value-amount">{formattedCellarValue}</span>
          </div>

          {/* Filtro Preferiti */}
          <button
            type="button"
            className={`cellar-masthead__fav-toggle ${filterFavoritesOnly ? 'cellar-masthead__fav-toggle--active' : ''}`}
            onClick={onToggleFilterFavorites}
            title="Mostra solo bottiglie preferite"
          >
            <Heart size={16} fill={filterFavoritesOnly ? 'currentColor' : 'none'} />
            <span className="cellar-masthead__fav-label">Preferiti ({stats.favoritesCount})</span>
          </button>

          {/* Reset Seed Database */}
          <button
            type="button"
            className="cellar-masthead__seed-btn"
            onClick={() => {
              if (window.confirm('Vuoi ripristinare il catalogo d’esempio con i grandi vini iconici?')) {
                onResetSeed();
              }
            }}
            title="Ripristina collezione seed di prova"
          >
            <RotateCcw size={15} />
            <span className="cellar-masthead__seed-label">Reset Seed</span>
          </button>

          {/* CTA Aggiungi Bottiglia */}
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onOpenAdd}
          >
            Nuova Bottiglia
          </Button>
        </div>
      </div>
    </header>
  );
};
