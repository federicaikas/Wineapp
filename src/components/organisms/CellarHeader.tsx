import React from 'react';
import { Button } from '../design-system';
import type { CellarStats } from '../../types/wine';
import { Plus, Heart, Wine, Sparkles } from 'lucide-react';
import './CellarHeader.css';

export interface CellarHeaderProps {
  stats: CellarStats;
  uncorkedCount: number;
  currentView?: 'cellar' | 'stats' | 'uncorked' | 'showcase';
  onOpenAdd: () => void;
  onResetSeed?: () => void;
  filterFavoritesOnly: boolean;
  onToggleFilterFavorites: () => void;
  onOpenUncorked: () => void;
  onOpenRandomWine?: () => void;
  onGoHome?: () => void;
}

export const CellarHeader: React.FC<CellarHeaderProps> = ({
  stats,
  uncorkedCount,
  currentView = 'cellar',
  onOpenAdd,
  filterFavoritesOnly,
  onToggleFilterFavorites,
  onOpenUncorked,
  onOpenRandomWine,
  onGoHome,
}) => {
  return (
    <header className="cellar-masthead">
      <div className="cellar-masthead__container">
        {/* Brand WINAPP */}
        <div
          className="cellar-masthead__brand"
          onClick={onGoHome}
          style={{ cursor: 'pointer' }}
          title="Torna alla Cantina (Home)"
        >
          <h1 className="cellar-masthead__title">WINAPP - La cantina di Federica</h1>
        </div>

        {/* Bottoni di azione */}
        <div className="cellar-masthead__actions">
          {onOpenRandomWine && (
            <Button
              variant="outline"
              size="md"
              icon={<Sparkles size={16} />}
              onClick={onOpenRandomWine}
              className="cellar-header-btn-random"
            >
              Cosa beviamo? 🍷
            </Button>
          )}

          <Button
            variant={filterFavoritesOnly ? 'primary' : 'outline'}
            size="md"
            icon={<Heart size={16} fill={filterFavoritesOnly ? 'currentColor' : 'none'} />}
            onClick={onToggleFilterFavorites}
            className="cellar-header-btn-fav"
          >
            Preferiti ({stats.favoritesCount})
          </Button>

          <Button
            variant={currentView === 'uncorked' ? 'primary' : 'outline'}
            size="md"
            icon={<Wine size={16} />}
            onClick={onOpenUncorked}
            className={`cellar-header-btn-uncorked ${currentView === 'uncorked' ? 'cellar-header-btn-uncorked--active' : ''}`}
          >
            Bottiglie stappate ({uncorkedCount})
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={onOpenAdd}
            className="cellar-header-btn-add"
          >
            Nuova Bottiglia
          </Button>
        </div>
      </div>
    </header>
  );
};

