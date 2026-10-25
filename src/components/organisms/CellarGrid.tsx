import React, { useState } from 'react';
import type { WineBottle, CellarStats } from '../../types/wine';
import { WineCard } from './WineCard';
import { SearchFilterBar, type SortOption } from '../design-system/molecules/SearchFilterBar';
import { EmptyState, Badge, Typography, StockCounter, Tag } from '../design-system';
import type { WineCategory } from '../design-system/atoms/Badge';
import { LayoutGrid, List } from 'lucide-react';
import './CellarGrid.css';

const INITIAL_BATCH_SIZE = 10;
const BATCH_INCREMENT = 10;

export interface CellarGridProps {
  wines: WineBottle[];
  stats: CellarStats;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: WineCategory | 'all';
  onCategoryChange: (cat: WineCategory | 'all') => void;
  selectedCountryFilter?: 'all' | 'IT' | 'FR' | 'ES' | 'EE';
  onCountryFilterChange?: (country: 'all' | 'IT' | 'FR' | 'ES' | 'EE') => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  maxPrice?: number;
  onMaxPriceChange?: (price: number) => void;
  minStock?: number;
  onMinStockChange?: (n: number) => void;
  onSelectWine: (wine: WineBottle) => void;
  onEditWine: (wine: WineBottle) => void;
  onStockChange: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAdd: () => void;
  onOpenStats?: () => void;
}

export const CellarGrid: React.FC<CellarGridProps> = ({
  wines,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCountryFilter,
  onCountryFilterChange,
  selectedSort,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  minStock,
  onMinStockChange,
  onSelectWine,
  onEditWine,
  onStockChange,
  onToggleFavorite,
  onOpenAdd,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);

  // Resetta il conteggio visualizzato al mutare dei filtri o della ricerca senza cascading effect
  const filterKey = `${searchQuery}_${selectedCategory}_${selectedCountryFilter}_${selectedSort}_${maxPrice}_${minStock}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_BATCH_SIZE);
  }

  const totalWinesCount = wines.length;
  const displayedWines = wines.slice(0, visibleCount);
  const hasMore = visibleCount < totalWinesCount;
  const remainingCount = totalWinesCount - visibleCount;
  const nextBatchSize = Math.min(BATCH_INCREMENT, remainingCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, totalWinesCount));
  };

  const viewToggleElement = (
    <div className="cellar-view-toggle" role="group" aria-label="Modalità visualizzazione">
      <button
        type="button"
        className={`cellar-view-toggle__item ${viewMode === 'grid' ? 'cellar-view-toggle__item--active' : ''}`}
        onClick={() => setViewMode('grid')}
        aria-label="Vista etichette a griglia"
      >
        <LayoutGrid size={15} />
        <span>Griglia</span>
      </button>
      <button
        type="button"
        className={`cellar-view-toggle__item ${viewMode === 'list' ? 'cellar-view-toggle__item--active' : ''}`}
        onClick={() => setViewMode('list')}
        aria-label="Vista registro a catalogo"
      >
        <List size={15} />
        <span>Registro</span>
      </button>
    </div>
  );

  // Intestazione cliccabile: primo clic ordine crescente, secondo decrescente
  const sortHeader = (label: string, colClass: string, asc: SortOption, desc: SortOption) => {
    const isAsc = selectedSort === asc;
    const isDesc = selectedSort === desc;
    return (
      <div className={colClass}>
        <button
          type="button"
          className={`cellar-list-ledger__sort-btn ${isAsc || isDesc ? 'cellar-list-ledger__sort-btn--active' : ''}`}
          onClick={() => onSortChange(isAsc ? desc : asc)}
          aria-label={`Ordina per ${label}`}
        >
          {label}
          <span className="cellar-list-ledger__sort-arrow" aria-hidden="true">{isAsc ? '▲' : isDesc ? '▼' : '↕'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="cellar-grid-wrapper">
      {/* Barra Filtri, Ricerca e Toggle Viste */}
      <div className="cellar-grid-toolbar">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          selectedCountryFilter={selectedCountryFilter}
          onCountryFilterChange={onCountryFilterChange}
          selectedSort={selectedSort}
          onSortChange={onSortChange}
          maxPrice={maxPrice}
          onMaxPriceChange={onMaxPriceChange}
          minStock={minStock}
          onMinStockChange={onMinStockChange}
          viewToggle={viewToggleElement}
        />
      </div>

      {/* Risultati o Stato Vuoto */}
      {wines.length === 0 ? (() => {
        const isFiltered =
          searchQuery.trim().length > 0 ||
          selectedCategory !== 'all' ||
          (selectedCountryFilter && selectedCountryFilter !== 'all') ||
          (maxPrice !== undefined && maxPrice < 500) ||
          (minStock !== undefined && minStock > 1);

        const handleResetAllFilters = () => {
          onSearchChange('');
          onCategoryChange('all');
          onCountryFilterChange?.('all');
          onMaxPriceChange?.(500);
          onMinStockChange?.(1);
        };

        return (
          <EmptyState
            title={isFiltered ? 'Nessun vino corrisponde ai filtri selezionati' : 'La cantina è attualmente vuota'}
            description={
              isFiltered
                ? 'Nessuna bottiglia risponde alla combinazione di filtri impostati. Prova a modificare i parametri o azzera tutti i filtri.'
                : 'Inizia registrando la tua prima bottiglia di pregio, cru o grande millesimo per valorizzare la tua collezione enologica.'
            }
            actionLabel={isFiltered ? 'Azzera Tutti i Filtri' : 'Aggiungi la Prima Bottiglia'}
            onAction={isFiltered ? handleResetAllFilters : onOpenAdd}
          />
        );
      })() : (
        <>
          {viewMode === 'grid' ? (
            /* Vista a Griglia Etichette */
            <div className="cellar-cards-grid">
              {displayedWines.map((wine) => (
                <WineCard
                  key={wine.id}
                  wine={wine}
                  onSelect={onSelectWine}
                  onEdit={onEditWine}
                  onStockChange={onStockChange}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            /* Vista a Registro Sartoriale (Elenco Dettagliato) */
            <div className="cellar-list-ledger">
              <div className="cellar-list-ledger__header">
                {sortHeader('Vino & Produttore', 'cellar-list-ledger__col-wine', 'name-asc', 'name-desc')}
                {sortHeader('Millesimo', 'cellar-list-ledger__col-vintage', 'vintage-desc', 'vintage-asc')}
                {sortHeader('Tipologia', 'cellar-list-ledger__col-category', 'category-asc', 'category-desc')}
                {sortHeader('Stato Beva', 'cellar-list-ledger__col-status', 'status-asc', 'status-desc')}
                {sortHeader('Scorte', 'cellar-list-ledger__col-stock', 'stock-asc', 'stock-desc')}
                {sortHeader('Valore', 'cellar-list-ledger__col-price', 'price-asc', 'price-desc')}
              </div>

              <div className="cellar-list-ledger__body">
                {displayedWines.map((wine) => (
                  <div
                    key={wine.id}
                    className="cellar-list-row"
                    onClick={() => onSelectWine(wine)}
                  >
                    <div className="cellar-list-ledger__col-wine">
                      <Typography variant="serif-italic" color="secondary" className="cellar-list-row__producer">
                        {wine.producer}
                      </Typography>
                      <Typography variant="serif-title" size="sm" className="cellar-list-row__name">
                        {wine.name}
                      </Typography>
                      <Typography variant="body-sm" color="muted" className="cellar-list-row__appellation">
                        {wine.appellation} • {wine.region}
                      </Typography>
                    </div>

                    <div className="cellar-list-ledger__col-vintage">
                      <Tag variant="pill">{wine.vintage}</Tag>
                    </div>

                    <div className="cellar-list-ledger__col-category">
                      <Badge variant="wine-type" category={wine.category} size="sm">
                        {wine.category === 'red' && 'Rosso'}
                        {wine.category === 'white' && 'Bianco'}
                        {wine.category === 'sparkling' && 'Bollicine'}
                        {wine.category === 'rose' && 'Rosato'}
                        {wine.category === 'orange' && 'Orange'}
                        {wine.category === 'dessert' && 'Passito'}
                      </Badge>
                    </div>

                    <div className="cellar-list-ledger__col-status">
                      <Badge variant="drinking-status" status={wine.drinkingStatus} size="sm">
                        {wine.drinkingStatus === 'ready' && 'Pronto'}
                        {wine.drinkingStatus === 'aging' && 'Affinamento'}
                        {wine.drinkingStatus === 'peak' && 'All’apice'}
                        {wine.drinkingStatus === 'past' && 'Oltre picco'}
                      </Badge>
                    </div>

                    <div
                      className="cellar-list-ledger__col-stock"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StockCounter
                        count={wine.stock}
                        size="sm"
                        onIncrement={() => onStockChange(wine.id, 1)}
                        onDecrement={() => onStockChange(wine.id, -1)}
                      />
                    </div>

                    <div className="cellar-list-ledger__col-price">
                      <Typography variant="serif-title" size="sm" color="primary">
                        € {wine.price}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sezione Carica Altri / Paginazione Sartoriale */}
          {hasMore && (
            <div className="cellar-load-more-section">
              <button type="button" className="cellar-load-more__btn" onClick={handleLoadMore}>
                Mostra altri {nextBatchSize}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

