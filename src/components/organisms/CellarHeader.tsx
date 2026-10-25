import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../design-system';
import type { CellarStats } from '../../types/wine';
import { Plus, Heart, History, Shuffle, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import affinappLogo from '../../assets/affinapp-logo.svg';
import './CellarHeader.css';

export interface CellarHeaderProps {
  stats: CellarStats;
  uncorkedCount?: number;
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
  currentView = 'cellar',
  onOpenAdd,
  filterFavoritesOnly,
  onToggleFilterFavorites,
  onOpenUncorked,
  onOpenRandomWine,
  onGoHome,
}) => {
  const { user, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiude il menu utente quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Utente';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="cellar-masthead">
      <div className="cellar-masthead__container">
        {/* Brand AFFINAPP - al centro su mobile */}
        <div
          className="cellar-masthead__brand"
          onClick={onGoHome}
          style={{ cursor: 'pointer' }}
          title="Torna alla Cantina (Home)"
        >
          <h1 className="cellar-masthead__title">
            <img src={affinappLogo} alt="AFFINAPP" className="cellar-masthead__logo" />
          </h1>
        </div>

        {/* Bottoni di azione - mostrati solo se l'utente è autenticato */}
        {user && (
          <div className="cellar-masthead__actions">
            {/* Subito sotto: i due bottoni cosa beviamo e nuova bottiglia */}
            <div className="cellar-masthead__primary-actions">
              {onOpenRandomWine && (
                <Button
                  variant="outline"
                  size="md"
                  icon={<Shuffle size={16} />}
                  onClick={onOpenRandomWine}
                  className="cellar-header-btn-random"
                >
                  COSA BEVIAMO
                </Button>
              )}

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

            {/* Sotto: le icone di preferiti, stappate e accesso utente */}
            <div className="cellar-masthead__secondary-actions">
              <button
                type="button"
                onClick={onToggleFilterFavorites}
                className={`cellar-header-btn-fav ${filterFavoritesOnly ? 'cellar-header-btn-fav--active' : ''}`}
                title={`Preferiti (${stats.favoritesCount})`}
                aria-label={`Filtra preferiti (${stats.favoritesCount})`}
              >
                <Heart size={16} fill={filterFavoritesOnly ? 'currentColor' : 'none'} />
                <span className="cellar-header-btn-fav__label">Preferiti</span>
                {stats.favoritesCount > 0 && (
                  <span className="cellar-header-btn-fav__count" aria-hidden="true">
                    {stats.favoritesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenUncorked}
                className={`cellar-header-btn-uncorked ${currentView === 'uncorked' ? 'cellar-header-btn-uncorked--active' : ''}`}
                title="Cronologia bottiglie stappate"
                aria-label="Cronologia bottiglie stappate"
              >
                <History size={16} />
                <span className="cellar-header-btn-uncorked__label">Stappate</span>
              </button>

              {/* Sezione Autenticazione: Profilo Utente */}
              <div className="cellar-header-user-wrapper" ref={menuRef}>
                <button
                  type="button"
                  className="cellar-header-user-badge"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  title={`Cantina di ${displayName}`}
                >
                  <span className="cellar-header-user-avatar">{initialLetter}</span>
                  <span className="cellar-header-user-name">{displayName}</span>
                </button>

                {isMenuOpen && (
                  <div className="cellar-header-user-dropdown" role="menu">
                    <div className="cellar-header-user-dropdown__info">
                      <p className="cellar-header-user-dropdown__name">{profile?.full_name || displayName}</p>
                      <p className="cellar-header-user-dropdown__email">{user.email}</p>
                      {profile?.cellar_name && (
                        <p className="cellar-header-user-dropdown__cellar">{profile.cellar_name}</p>
                      )}
                    </div>
                    <div className="cellar-header-user-dropdown__divider" />
                    <button
                      type="button"
                      className="cellar-header-user-dropdown__logout"
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      role="menuitem"
                    >
                      <LogOut size={14} />
                      <span>Disconnetti</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
