import React, { useState } from 'react';
import type { WineBottle, CellarStats } from '../../types/wine';
import { WineCard } from './WineCard';
import { SearchFilterBar, type SortOption } from '../design-system/molecules/SearchFilterBar';
import { EmptyState, Badge } from '../design-system';
import type { WineCategory } from '../design-system/atoms/Badge';
import { LayoutGrid, List, Sparkles, Clock, CheckCircle2, Wine } from 'lucide-react';
import './CellarGrid.css';

export interface CellarGridProps {
  wines: WineBottle[];
  stats: CellarStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: WineCategory | 'all';
  onCategoryChange: (cat: WineCategory | 'all') => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectWine: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAdd: () => void;
}

export const CellarGrid: React.FC<CellarGridProps> = ({
  wines,
  stats,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  onSelectWine,
  onStockChange,
  onToggleFavorite,
  onOpenAdd,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="cellar-grid-wrapper">
      {/* Dashboard Statistiche Cantina */}
      <section className="cellar-dashboard-stats" aria-label="Statistiche della Cantina">
        <div className="cellar-dashboard-stat">
          <span className="cellar-dashboard-stat__icon cellar-dashboard-stat__icon--wine">
            <Wine size={18} />
          </span>
          <div className="cellar-dashboard-stat__info">
            <span className="cellar-dashboard-stat__label">Bottiglie in Custodia</span>
            <span className="cellar-dashboard-stat__value">{stats.totalBottles}</span>
            <span className="cellar-dashboard-stat__sub">{stats.uniqueLabels} etichette uniche</span>
          </div>
        </div>

        <div className="cellar-dashboard-stat">
          <span className="cellar-dashboard-stat__icon cellar-dashboard-stat__icon--ready">
            <CheckCircle2 size={18} />
          </span>
          <div className="cellar-dashboard-stat__info">
            <span className="cellar-dashboard-stat__label">Pronte al Calice</span>
            <span className="cellar-dashboard-stat__value">{stats.readyToDrinkCount}</span>
            <span className="cellar-dashboard-stat__sub">beva immediata</span>
          </div>
        </div>

        <div className="cellar-dashboard-stat">
          <span className="cellar-dashboard-stat__icon cellar-dashboard-stat__icon--peak">
            <Sparkles size={18} />
          </span>
          <div className="cellar-dashboard-stat__info">
            <span className="cellar-dashboard-stat__label">All’Apice della Maturità</span>
            <span className="cellar-dashboard-stat__value">{stats.peakCount}</span>
            <span className="cellar-dashboard-stat__sub">massima espressione</span>
          </div>
        </div>

        <div className="cellar-dashboard-stat">
          <span className="cellar-dashboard-stat__icon cellar-dashboard-stat__icon--aging">
            <Clock size={18} />
          </span>
          <div className="cellar-dashboard-stat__info">
            <span className="cellar-dashboard-stat__label">In Affinamento</span>
            <span className="cellar-dashboard-stat__value">{stats.agingCount}</span>
            <span className="cellar-dashboard-stat__sub">da custodire</span>
          </div>
        </div>
      </section>

      {/* Barra Filtri & Ricerca */}
      <div className="cellar-grid-toolbar">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedSort={selectedSort}
          onSortChange={onSortChange}
          counts={stats.categoryBreakdown}
          totalCount={stats.totalBottles}
        />

        <div className="cellar-view-toggle">
          <button
            type="button"
            className={`cellar-view-toggle__btn ${viewMode === 'grid' ? 'cellar-view-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Vista etichette a griglia"
          >
            <LayoutGrid size={16} />
            <span className="cellar-view-toggle__label">Griglia</span>
          </button>
          <button
            type="button"
            className={`cellar-view-toggle__btn ${viewMode === 'list' ? 'cellar-view-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="Vista registro a catalogo"
          >
            <List size={16} />
            <span className="cellar-view-toggle__label">Registro</span>
          </button>
        </div>
      </div>

      {/* Risultati o Stato Vuoto */}
      {wines.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'Nessun vino corrisponde alla ricerca' : 'La cantina è attualmente vuota'}
          description={
            searchQuery
              ? `Nessuna bottiglia risponde a "${searchQuery}". Prova a modificare i termini di ricerca o azzerare i filtri.`
              : 'Inizia registrando la tua prima bottiglia di pregio, cru o grande millesimo per valorizzare la tua collezione enologica.'
          }
          actionLabel={searchQuery ? 'Azzera Ricerca' : 'Aggiungi la Prima Bottiglia'}
          onAction={searchQuery ? () => onSearchChange('') : onOpenAdd}
        />
      ) : viewMode === 'grid' ? (
        /* Vista a Griglia Etichette */
        <div className="cellar-cards-grid">
          {wines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={wine}
              onSelect={onSelectWine}
              onStockChange={onStockChange}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Vista a Registro Sartoriale (Elenco Dettagliato) */
        <div className="cellar-list-ledger">
          <div className="cellar-list-ledger__header">
            <span className="cellar-list-ledger__col-wine">Vino &amp; Produttore</span>
            <span className="cellar-list-ledger__col-vintage">Millesimo</span>
            <span className="cellar-list-ledger__col-category">Tipologia</span>
            <span className="cellar-list-ledger__col-status">Stato Beva</span>
            <span className="cellar-list-ledger__col-rating">Critica</span>
            <span className="cellar-list-ledger__col-stock">Scorte</span>
            <span className="cellar-list-ledger__col-price">Valore</span>
          </div>

          <div className="cellar-list-ledger__body">
            {wines.map((wine) => (
              <div
                key={wine.id}
                className="cellar-list-row"
                onClick={() => onSelectWine(wine)}
              >
                <div className="cellar-list-ledger__col-wine">
                  <span className="cellar-list-row__producer">{wine.producer}</span>
                  <span className="cellar-list-row__name">{wine.name}</span>
                  <span className="cellar-list-row__appellation">{wine.appellation}</span>
                </div>

                <div className="cellar-list-ledger__col-vintage">
                  <span className="cellar-list-row__vintage">{wine.vintage}</span>
                </div>

                <div className="cellar-list-ledger__col-category">
                  <Badge variant="wine-type" category={wine.category} size="sm">
                    {wine.category}
                  </Badge>
                </div>

                <div className="cellar-list-ledger__col-status">
                  <Badge variant="drinking-status" status={wine.drinkingStatus} size="sm">
                    {wine.drinkingStatus}
                  </Badge>
                </div>

                <div className="cellar-list-ledger__col-rating">
                  {wine.criticScore ? (
                    <span className="cellar-list-row__score">{wine.criticScore} PTS</span>
                  ) : (
                    <span>{wine.rating} ★</span>
                  )}
                </div>

                <div
                  className="cellar-list-ledger__col-stock"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="cellar-list-row__stock-num">
                    {wine.stock} btg.
                  </span>
                </div>

                <div className="cellar-list-ledger__col-price">
                  <span className="cellar-list-row__price">
                    € {wine.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
