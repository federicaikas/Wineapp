import React from 'react';
import { Button } from '../design-system';
import type { CellarStats } from '../../types/wine';
import { Plus, Heart, Wine, Sparkles } from 'lucide-react';
import './CellarHeader.css';

export interface CellarHeaderProps {
  stats: CellarStats;
  uncorkedCount: number;
  currentView?: 'cellar' | 'stats' | 'uncorked' | 'showcase' | 'manage';
  onOpenAdd: () => void;
  onResetSeed?: () => void;
  filterFavoritesOnly: boolean;
  onToggleFilterFavorites: () => void;
  onOpenUncorked: () => void;
  onOpenRandomWine?: () => void;
  onOpenManage?: () => void;
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
  onOpenManage,
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

          <button
            type="button"
            onClick={onToggleFilterFavorites}
            className={`cellar-header-btn-fav ${filterFavoritesOnly ? 'cellar-header-btn-fav--active' : ''}`}
            title={`Preferiti (${stats.favoritesCount})`}
            aria-label={`Filtra preferiti (${stats.favoritesCount})`}
          >
            <Heart size={18} fill={filterFavoritesOnly ? 'currentColor' : 'none'} />
            {stats.favoritesCount > 0 && (
              <span className="cellar-header-btn-fav__count" aria-hidden="true">
                {stats.favoritesCount}
              </span>
            )}
          </button>

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

          {onOpenManage && (
            <Button
              variant="outline"
              size="md"
              onClick={onOpenManage}
            >
              Gestisci cantina
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

