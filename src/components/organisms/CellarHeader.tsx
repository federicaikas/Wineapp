import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../design-system';
import type { CellarStats } from '../../types/wine';
import { Plus, Shuffle, LogOut } from 'lucide-react';
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
  onOpenStats?: () => void;
  onGoHome?: () => void;
}

export const CellarHeader: React.FC<CellarHeaderProps> = ({
  stats,
  uncorkedCount = 0,
  currentView = 'cellar',
  onOpenAdd,
  filterFavoritesOnly,
  onToggleFilterFavorites,
  onOpenUncorked,
  onOpenRandomWine,
  onOpenStats,
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
                    <div className="cellar-header-user-dropdown__row" role="presentation">
                      <span>Bottiglie <small>({stats.uniqueLabels} etichette)</small></span>
                      <strong>{stats.totalBottles}</strong>
                    </div>
                    <div className="cellar-header-user-dropdown__row" role="presentation">
                      <span>Valore stimato</span>
                      <strong>€ {stats.totalEstimatedValue ? stats.totalEstimatedValue.toLocaleString('it-IT') : '0'}</strong>
                    </div>
                    <div className="cellar-header-user-dropdown__row" role="presentation">
                      <span>Pronte da stappare</span>
                      <strong>{stats.readyToDrinkCount + stats.peakCount}</strong>
                    </div>
                    <div className="cellar-header-user-dropdown__divider" />
                    <button
                      type="button"
                      className={`cellar-header-user-dropdown__item ${filterFavoritesOnly ? 'cellar-header-user-dropdown__item--active' : ''}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onToggleFilterFavorites();
                      }}
                      role="menuitem"
                    >
                      <span>Preferiti</span>
                      {stats.favoritesCount > 0 && (
                        <span className="cellar-header-user-dropdown__count">{stats.favoritesCount}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`cellar-header-user-dropdown__item ${currentView === 'uncorked' ? 'cellar-header-user-dropdown__item--active' : ''}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenUncorked();
                      }}
                      role="menuitem"
                    >
                      <span>Stappate</span>
                      {uncorkedCount > 0 && (
                        <span className="cellar-header-user-dropdown__count">{uncorkedCount}</span>
                      )}
                    </button>
                    {onOpenStats && (
                      <button
                        type="button"
                        className={`cellar-header-user-dropdown__item ${currentView === 'stats' ? 'cellar-header-user-dropdown__item--active' : ''}`}
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenStats();
                        }}
                        role="menuitem"
                      >
                        <span>Report &amp; Mappa</span>
                      </button>
                    )}
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
